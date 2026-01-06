import numpy as np
import faiss

def build_faiss_index(resume_embeddings):
    """
    resume_embeddings: dict → { resume_id: embedding_vector }
    """
    if not resume_embeddings:
        raise ValueError("No resume embeddings found")

    ids = list(resume_embeddings.keys())
    vectors = np.array(list(resume_embeddings.values())).astype("float32")

    dim = vectors.shape[1]
    index = faiss.IndexFlatL2(dim)
    index.add(vectors)

    return index, ids
