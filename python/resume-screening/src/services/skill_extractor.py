from openai import OpenAI
import re

client = OpenAI()


PRIMARY_TECH_SKILLS = {
    "genai", "java", ".net", "dotnet", "python", "sql", "azure", "aws",
    "gcp", "cloud", "microservices", "spring", "springboot", "react",
    "angular", "node", "kubernetes", "docker", "ml", "machine learning",
    "nlp", "data engineering", "big data", "statistical methods",
    "database management", "oracle"
}

def extract_skills_from_text(text):
    """
    Calls the LLM to extract skills from JD or Resume text.
    Returns a comma-separated string of skills.
    """
    prompt = f"""
    Extract only the skills from the text below.
    Return them as a comma-separated list, nothing else.

    TEXT:
    {text}
    """
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=200
    )

    content = response.choices[0].message.content

    return content.strip()

def normalize_skill(s):
    s = s.lower().strip()
    s = re.sub(r'[^a-z0-9\s]+', '', s)   # remove punctuation but keep spaces
    s = re.sub(r'\s+', ' ', s)           # collapse multiple spaces
    return s


def split_skills(skills):
    if isinstance(skills, list):
        raw = skills
    else:
        raw = skills.split(",")  # handles comma-separated resume fields
    
    cleaned = [normalize_skill(s) for s in raw]
    return [s for s in cleaned if s]  # remove empty items


def get_primary_skill(jd_skills, resume_skills):
    
    jd_list = split_skills(jd_skills)
    resume_list = split_skills(resume_skills)

    jd_norm = set(jd_list)
    resume_norm = set(resume_list)

    overlap = jd_norm.intersection(resume_norm)
    # print("Overlap skills:", overlap)

    # filter only primary tech skills
    primary = [s for s in overlap if s in PRIMARY_TECH_SKILLS]

    if not primary:
        return "None"

    return primary[0].title()  # take top


def calculate_skill_overlap(jd_skills, resume_skills):
    
    jd_list = split_skills(jd_skills)
    resume_list = split_skills(resume_skills)

    jd_norm = set(jd_list)
    resume_norm = set(resume_list)

    overlap = jd_norm.intersection(resume_norm)

    if len(jd_norm) == 0:
        return 0
    
    return (len(overlap) / len(jd_norm)) * 100, list(overlap)


def compute_final_score(semantic_similarity, overlap_score, alpha=0.7):
    """
    Combines semantic similarity and skill overlap into a final score.
    alpha: weight for semantic similarity (0 to 1)
    """
    final_score = (alpha * semantic_similarity) + ((1 - alpha) * overlap_score)

    return round(final_score, 2)


def format_results_for_ui(results_all, top_n=5):
    """
    Accepts results_all (a list of dicts), e.g.:

    [
        {
            "br_id": "38358BR",
            "job_description": "...",
            "jd_skills": "...",
            "matches": [...]
        },
        ...
    ]

    Returns a list of:
    {
        "br_id": "...",
        "matches": "12345 (90.2%), 67890 (88.1%), ..."
    }
    """

    ui_rows = []

    for item in results_all:
        br_id = item.get("br_id")
        matches = item.get("matches", [])

        # Sort by final_score DESC
        sorted_matches = sorted(
            matches, key=lambda x: x.get("final_score", 0), reverse=True
        )

        # Take top N
        top_matches = sorted_matches[:top_n]

        # Format “resume_id (score%)”
        formatted = [
            f"{m['resume_id']} ({m['final_score']:.2f}%)"
            for m in top_matches
        ]

        ui_rows.append({
            "br_id": br_id,
            "matches": ", ".join(formatted)
        })

    return ui_rows
