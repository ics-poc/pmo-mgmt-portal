from fastapi import FastAPI, Form, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from sentence_transformers import SentenceTransformer
import psycopg2
import io
import traceback
from sklearn.metrics.pairwise import cosine_similarity
import re

from sqlalchemy import select
from database import SessionLocal
#import models

app = FastAPI()

# ✅ Create tables in the DB
#Base.metadata.create_all(bind=engine)

# Enable CORS for your React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or ["http://localhost:3000"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load local embedding model
model = SentenceTransformer("all-MiniLM-L6-v2")


# --------------------------------------
# Helpers
# --------------------------------------
def extract_text_from_resume(file: UploadFile):
    """Extract text from PDF, DOCX, or TXT"""
    name = file.filename.lower()
    content = file.file.read()

    try:
        if name.endswith(".pdf"):
            pdf = PdfReader(io.BytesIO(content))
            return "\n".join([page.extract_text() or "" for page in pdf.pages])
        elif name.endswith(".docx"):
            doc = Document(io.BytesIO(content))
            return "\n".join([p.text for p in doc.paragraphs])
        elif name.endswith(".txt"):
            return content.decode("utf-8", errors="ignore")
        else:
            return ""
    except Exception as e:
        print(f"❌ Error reading {name}: {e}")
        return ""

def embed_texts(texts):
    """Return consistent 2D numpy embeddings for any input list."""
    if isinstance(texts, str):
        texts = [texts]
    embs = model.encode(texts, convert_to_numpy=True, normalize_embeddings=True)
    if isinstance(embs, np.ndarray) and embs.ndim == 1:
        embs = np.expand_dims(embs, axis=0)
    return embs


@app.post("/match-skills/")
async def match_skills(autoReqId: str = Form(...)):
    """
    Matches entered skills vs stored employee profiles in Postgres,
    including grade weighting + detailed skill depth analysis.
    """
    try:
        import re
        result = None

        dba: Session = SessionLocal()

        br_query = """
            select auto_req_id, client_name, grade, mandatory_skills from pmo.br_data 
            where auto_req_id = %s;
        """
        print('***************************')
        print('autoReqId :: ' , autoReqId)
        print('***************************')
        df_br = pd.read_sql(br_query, dba.connection(), params=(autoReqId,))

        if not df_br.empty:
            auto_req_id = df_br.loc[0, "auto_req_id"]
            client_name = df_br.loc[0, "client_name"]
            grade = df_br.loc[0, "grade"]
            skills = df_br.loc[0, "mandatory_skills"]

            print(auto_req_id, client_name, grade, skills)
            result = await match_skills(auto_req_id, client_name, grade, skills)
            return result
        else:
             raise ValueError("No BR Data is provided.")

    except Exception as e:
        print("❌ SERVER ERROR MAIN:", e)
        traceback.print_exc()
        return {"error": str(e), "trace": traceback.format_exc()}

@app.post("/match-skills/edit")
async def match_skills(
        auto_req_id: str = Form(...),
        client_name: str = Form(...), 
        grade: str = Form(...),
        skills: str = Form(...)
    ):

    try:
        import re
        db: Session = SessionLocal()
        print(auto_req_id, client_name, grade, skills)

        # Pull employee skill data from database
        emp_query = """
            SELECT emp_no, emp_name, grade, top_3_skills, skills_bucket, detailed_skills
            FROM pmo.employees
        """
        df = pd.read_sql(emp_query, db.connection())
        df.columns = [c.strip().lower() for c in df.columns]

        # Combine relevant text fields
        text_fields = ["emp_no", "emp_name", "grade", "top_3_skills", "skills_bucket", "detailed_skills"]
        profile_texts = df[text_fields].astype(str).agg(" ".join, axis=1).tolist()

        # Generate embeddings for profiles
        profile_embs = np.array(embed_texts(profile_texts))
        # Parse user-entered skills
        skill_list = [s.strip() for s in re.split(r"[,+]", skills) if s.strip()]
        if not skill_list:
            raise ValueError("No skills provided.")

        # Embeddings for each entered skill
        skill_embs = np.array(embed_texts(skill_list))
        # Compute per-skill similarity
        per_skill_scores = []
        for skill_emb in skill_embs:
            sims = cosine_similarity(skill_emb.reshape(1, -1), profile_embs)[0]
            sims = np.clip(sims, 0, 1) * 100
            per_skill_scores.append(sims)

        per_skill_scores = np.array(per_skill_scores)
        base_avg_sims = np.mean(per_skill_scores, axis=0)
        # ------------------------------------------------------
        # Grade Weighting + Skill Depth Analysis
        # ------------------------------------------------------
        def compute_grade_weight(grade_value):
            """
            Grade stored as: E1, E2, E3, E4...
            Lower grade → easier to match
            Higher grade → requires deeper skill match
            """
            try:
                num = int(re.findall(r"\d+", str(grade_value))[0])
            except:
                num = 3  # default middle

            if num == 1:
                return 1.20   # junior → gets boost if top3 match
            elif num == 2:
                return 1.10
            elif num == 3:
                return 1.00
            elif num == 4:
                return 0.90   # senior → needs more skill depth
            else:  # E5+
                return 0.80

        weighted_scores = []
        for idx, row in df.iterrows():
            grade_wt = compute_grade_weight(row["grade"])

            t3 = str(row["top_3_skills"]).lower()
            sb = str(row["skills_bucket"]).lower()
            ds = str(row["detailed_skills"]).lower()

            depth_boost = 1.0

            # Boost based on presence across fields
            for sk in skill_list:
                s = sk.lower()

                if s in t3:
                    depth_boost += 0.20
                if s in sb:
                    depth_boost += 0.10
                if s in ds:
                    depth_boost += 0.30

            # Combine embedding similarity × grade effect × depth effect
            final_score = base_avg_sims[idx] * grade_wt * depth_boost

            # Cap at 100%
            final_score = min(final_score, 100)

            weighted_scores.append(final_score)

        weighted_scores = np.array(weighted_scores)
        # Pick top 4 profiles
        top_idx = weighted_scores.argsort()[::-1][:15]
        top_profiles = df.iloc[top_idx].reset_index(drop=True)
        top_scores = weighted_scores[top_idx]
        per_skill_top = per_skill_scores[:, top_idx]

        # Build final results
        results = []
        for j in range(len(top_profiles)):
            skill_breakdown = {
                skill_list[k]: round(float(per_skill_top[k, j]), 2)
                for k in range(len(skill_list))
            }

            # if(round(float(top_scores[j]), 2) > 50):
            results.append({
                "empNo": str(top_profiles.iloc[j].get("emp_no", "")),
                "employeeName": str(top_profiles.iloc[j].get("emp_name", "")),
                "grade": str(top_profiles.iloc[j].get("grade", "")),
                "top3Skills": str(top_profiles.iloc[j].get("top_3_skills", "")),
                "skillBucket": str(top_profiles.iloc[j].get("skills_bucket", "")),
                "detailedSkills": str(top_profiles.iloc[j].get("detailed_skills", "")),
                "match%": round(float(top_scores[j]), 2),
                "skillMatch%": skill_breakdown
            })
        return {"autoReqid": auto_req_id, "clientName": client_name, 
                "grade":grade,  "skills": skills, "results": results}

    except Exception as e:
        print("❌ SERVER ERROR:", e)
        traceback.print_exc()
        return {"error": str(e), "trace": traceback.format_exc()}


        # --------------------------------------
# API Endpoint: Analyze uploaded resumes
# --------------------------------------
@app.post("/analyze-resumes/")
async def analyze_resumes(
    skills: str = Form(...),
    resumes: list[UploadFile] = None,
):
    try:
        if not resumes:
            return {"error": "No resumes uploaded."}
        if not skills.strip():
            return {"error": "Skills input is empty."}

        # Parse skill list
        skill_list = [s.strip() for s in re.split(r"[,+]", skills) if s.strip()]
        if not skill_list:
            return {"error": "No valid skills provided."}

        # Read and embed resumes
        resume_texts = []
        resume_names = []
        for f in resumes:
            text = extract_text_from_resume(f)
            if len(text.strip()) < 30:
                print(f"⚠️ Skipping {f.filename} (too short or unreadable)")
                continue
            resume_texts.append(text)
            resume_names.append(f.filename)

        if not resume_texts:
            return {"error": "No readable resumes found."}

        resume_embs = embed_texts(resume_texts)

        # Embed each skill separately
        skill_embs = embed_texts(skill_list)

        # --------------------------
        # Compute per-skill matches
        # --------------------------
        all_results = []
        for i, resume_name in enumerate(resume_names):
            skill_scores = []
            for j, skill in enumerate(skill_list):
                score = cosine_similarity(
                    skill_embs[j].reshape(1, -1),
                    resume_embs[i].reshape(1, -1)
                )[0][0]
                skill_scores.append(score)

            skill_scores = np.clip(skill_scores, 0, 1)
            overall = np.mean(skill_scores) * 100

            result = {
                "Resume": resume_name,
                "Overall Match %": round(overall, 2)
            }

            for j, skill in enumerate(skill_list):
                result[f"{skill} %"] = round(skill_scores[j] * 100, 2)

            all_results.append(result)

        # Sort by overall match
        all_results.sort(key=lambda x: x["Overall Match %"], reverse=True)
        top_results = all_results[:15]

        return {
            "skills_entered": skill_list,
            "results": top_results
        }

    except Exception as e:
        print("❌ Internal Error:", e)
        traceback.print_exc()
        return {
            "error": str(e),
            "trace": traceback.format_exc()
        }
