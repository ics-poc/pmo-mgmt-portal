from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.requests import Request
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from reportlab.platypus import SimpleDocTemplate, Paragraph
from reportlab.lib.styles import getSampleStyleSheet
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle

import pandas as pd
import numpy as np
from openai import OpenAI
import os
import io
import shutil
import traceback
# your skill extraction function

from dotenv import load_dotenv
load_dotenv()  # take environment variables from .env file

print('Working Directory:', os.getcwd())

from src.services.skill_extractor import (
    extract_skills_from_text, 
    calculate_skill_overlap,  
    compute_final_score,
    format_results_for_ui,
    get_primary_skill
)   
from src.services.faiss_search import search_resumes_faiss
from src.services.embedding_utils import get_embedding
from src.services.utils import results_to_html_table, results_to_html_table_v2
from src.services.resume_parser import unzip_resumes, load_resumes_from_folder
from src.services.faiss_builder import build_faiss_index

app = FastAPI()
app.mount("/static", StaticFiles(directory="./src/static"), name="static")
templates = Jinja2Templates(directory="./src/templates")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React app
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = OpenAI()   # ensure OPENAI_API_KEY in env

# -------------------------
# File paths (use your existing filenames)
# -------------------------
INDEX_PATH = "./src/faiss_index/faiss_resume.index"
META_PATH  = "./src/faiss_index/resume_metadata.pkl"

# -------------------------
# Load index + metadata at startup
# -------------------------

EMBED_MODEL = "text-embedding-3-large"  # or your chosen model

# @app.get("/")
# def home(request: Request):
#     return templates.TemplateResponse("index.html", {"request": request})

@app.get("/", response_class=HTMLResponse)
async def load_v2():
    return templates.TemplateResponse("index_v2.html", {"request": {}})

@app.get("/v1", response_class=HTMLResponse)
async def load_v1():
    return templates.TemplateResponse("index.html", {"request": {}})

# -----------------------------------------------------------
# FastAPI endpoint: upload Excel with job_description column
# -----------------------------------------------------------
@app.post("/search_resumes")
async def search_resumes(file: UploadFile = File(...), top_k: int = 5):
    # Validate Excel file
    if not file.filename.lower().endswith((".xlsx", ".xls")):
        raise HTTPException(status_code=400, detail="Upload an Excel file (.xlsx or .xls)")

    # Read Excel into DataFrame
    try:
        # df = pd.read_excel(file.file, sheet_name='BR _Raw Data', nrows=5)
        df = pd.read_excel(file.file, sheet_name=3)
        df = df.sample(15)  # for testing, process only 4 rows
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not read Excel file: {e}")
    
    # print(f'Excel columns: {df.columns.tolist()}')

    # Ensure column exists (adjust name if yours differs)
    if "Job description" not in df.columns:
        raise HTTPException(status_code=400, detail="Excel must contain a 'Job description' column")

    print(f'Processing {len(df)} job descriptions from uploaded file.')
    results_all = []
    for _, row in df.iterrows():
        jd_text = str(row["Job description"])
        br_id = str(row["Auto req ID"])
        # 1) Extract skills from JD via your LLM extractor (replace with your function)
        jd_skills_str = extract_skills_from_text(jd_text)   # returns comma-separated string or list
        # if extract_skills_from_text returns list, join:
        if isinstance(jd_skills_str, list):
            jd_skills_str = ", ".join(jd_skills_str)

        # 2) Get embedding for the extracted skill string
        jd_emb = get_embedding(jd_skills_str)
        jd_skill_list = [s.strip().lower() for s in jd_skills_str.split(",") if s.strip()]

        # 3) Query FAISS
        matches = search_resumes_faiss(jd_emb, top_k=top_k)

        # compute skill overlap, final score, etc. here and attach to matches
        # Example pseudocode:
        for m in matches:
            overlap_score, common_skills = calculate_skill_overlap(jd_skill_list, m['resume_skills'])
            m['skill_overlap_score'] = round(overlap_score, 2)
            m['common_skills'] = common_skills
            m['final_score'] = compute_final_score(m['similarity'], overlap_score)

        results_all.append({
            "br_id": br_id,
            "job_description": jd_text,
            "jd_skills": jd_skills_str,
            "matches": matches
        })


    ui_ready = format_results_for_ui(results_all)
    html_output = results_to_html_table(ui_ready)

    return HTMLResponse(content=html_output)


# ------------------------------------------------------------------
# FastAPI endpoint: Advanced version to upload resume ZIP + JD file
# ------------------------------------------------------------------

@app.post("/search_resumes_v2")
async def search_resumes_v2(
    jd_file: UploadFile = File(...),
    resume_zip: UploadFile = File(...)
):
    # make temp directory
    os.makedirs("./tmp", exist_ok=True)
    print('111111111111111111111111111')
    resume_text_map = {}

    # STEP 1 — Read JD Excel
    try:
        jd_map = {}
        df = pd.read_excel(jd_file.file, sheet_name='BR _Raw Data')
        df = df.sample(5)  # for testing, process only 10 rows
    except Exception as e:
        traceback.print_exc()  # 👈 prints full stack trace in console
        raise HTTPException(status_code=400, detail=str(e))

    print('222222222222222222222222222')
    if "Job description" not in df.columns or "Auto req ID" not in df.columns:
        raise HTTPException(400, "Excel must contain 'Auto req ID' and 'Job description' columns.")

    # STEP 2 — Save zip temporarily
    zip_path = "./tmp/uploaded_resumes.zip"
    with open(zip_path, "wb") as f:
        f.write(await resume_zip.read())

    # STEP 3 — Unzip files
    extract_dir = "./tmp/resumes"
    unzip_resumes(zip_path, extract_dir)

    # STEP 4 — Convert resumes to text
    resume_texts = load_resumes_from_folder(extract_dir)

    # STEP 5 — Extract skills via LLM + create embeddings
    resume_embeddings = {}
    resume_skill_map = {}

    for resume_id, text in resume_texts.items():
        resume_text_map[resume_id] = text
        skills = extract_skills_from_text(text)
        resume_skill_map[resume_id] = skills
        emb = get_embedding(", ".join(skills))
        resume_embeddings[resume_id] = emb

    # STEP 6 — Build FAISS dynamically
    index, id_order = build_faiss_index(resume_embeddings)
    results_all = []

    # STEP 7 — For each JD
    for _, row in df.iterrows():
        br_id = str(row["Auto req ID"])
        jd_text = str(row["Job description"])
        jd_map[br_id] = jd_text

        jd_skills = extract_skills_from_text(jd_text)
        jd_emb = get_embedding(", ".join(jd_skills))

        q = np.array(jd_emb).astype("float32").reshape(1, -1)
        distances, idxs = index.search(q, 5)

        matches = []
        for pos, idx in enumerate(idxs[0]):
            rid = str(id_order[idx])
            dist = float(distances[0][pos])
            score = 1 / (1 + dist)

            # get the primary skill overlap
            resume_skills = resume_skill_map[rid]
            primary_skill = get_primary_skill(jd_skills, resume_skills)

            matches.append({
                "resume_id": rid,
                "final_score": float(round(score * 100, 2)),
                "primary_skill": primary_skill
            })

        results_all.append({
            "br_id": br_id,
            "matches": matches
        })

    # STEP 8 — Clean temp folder
    shutil.rmtree("./tmp", ignore_errors=True)

    # STEP 9 — Generate HTML table
    # html = results_to_html_table_v2(results_all)
    # html = results_to_html_table_v2(results_all, jd_map, resume_skill_map, resume_text_map)

    # return HTMLResponse(content=html)
    return {
        "results": results_all,
        "jd_map": jd_map,
        "resume_text_map": resume_text_map
    }

@app.post("/download_excel_v2")
async def download_excel_v2(payload: dict):

    results = payload.get("results", [])
    rows = []

    for item in results:
        br_id = item["br_id"]
        match_list = ", ".join([f"{m['resume_id']} ({m['final_score']}%)" for m in item["matches"]])
        rows.append({"BR ID": br_id, "Selections (EmpID - %match)": match_list})

    df = pd.DataFrame(rows)

    output = io.BytesIO()
    df.to_excel(output, index=False)
    output.seek(0)

    return StreamingResponse(
        output,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=resume_matches_v2.xlsx"}
    )


@app.post("/download_pdf_v2")
async def download_pdf_v2(payload: dict):
    results = payload.get("results", [])

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter)

    elements = []

    # NEW HEADER including Employee Name
    data = [["BR ID", "Employee Name", "Resume ID", "Match %", "Primary Skill"]]

    # Hardcode name for now (later can map resume_id → real name)
    hardcoded_name = "Some Name"

    # Populate rows
    for item in results:
        br_id = item["br_id"]

        for m in item["matches"]:
            data.append([
                str(br_id),
                hardcoded_name,            # NEW COLUMN
                str(m["resume_id"]),
                f"{m['final_score']}%",
                str(m["primary_skill"])
            ])

    # Create table
    table = Table(data, colWidths=[80, 110, 110, 60, 110])

    # Style settings
    style = TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#003366')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),

        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 12),

        ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
        ('TOPPADDING', (0, 0), (-1, 0), 8),

        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),

        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 1), (-1, -1), 10),
    ])

    table.setStyle(style)
    elements.append(table)

    doc.build(elements)
    buffer.seek(0)

    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=resume_matches_v2.pdf"}
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("src.main:app", host="0.0.0.0", port=8001, reload=False)
