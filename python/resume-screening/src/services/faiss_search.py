import numpy as np
from src.services.faiss_loader import load_faiss_components


def search_resumes_faiss(jd_embedding, top_k=5):
    """
    Perform a FAISS KNN search and return structured dicts.
    Returns: List[Dict] safe for JSON serialization.
    """
    index, metadata = load_faiss_components()

    q = np.array(jd_embedding).astype("float32").reshape(1, -1)

    distances, ids = index.search(q, top_k)

    results = []
    for resume_id, distance in zip(ids[0], distances[0]):

        meta = metadata[int(resume_id)]

        semantic_score = float(distance) * 100
        
        resume_data = {
            "resume_id": int(resume_id),
            "similarity": round(semantic_score, 2),
            "resume_skills": meta['skills'],
        }

        # print(f'Found resume: {resume_data}')
        results.append(resume_data)

    return results
