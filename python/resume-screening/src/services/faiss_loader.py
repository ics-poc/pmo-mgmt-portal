import os
import json
import faiss
import numpy as np
import pickle

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
INDEX_PATH = os.path.join(BASE_DIR, "faiss_index", "faiss_resume.index")
META_PATH = os.path.join(BASE_DIR, "faiss_index", "resume_metadata.pkl")

print(f"FAISS Loader BASE_DIR = {BASE_DIR}")

# Global holders
faiss_index = None
metadata = None

def load_faiss_components():
    """
    Loads FAISS index and metadata once.
    Can be called from FastAPI startup or lazy-loaded.
    """
    global faiss_index, metadata

    if faiss_index is not None and metadata is not None:
        return faiss_index, metadata

    if not os.path.exists(INDEX_PATH):
        raise FileNotFoundError(f"FAISS index not found at {INDEX_PATH}")

    if not os.path.exists(META_PATH):
        raise FileNotFoundError(f"Metadata JSON not found at {META_PATH}")

    print(f"Loading FAISS index from {INDEX_PATH}")
    faiss_index = faiss.read_index(INDEX_PATH)

    metadata = pickle.load(open(META_PATH, "rb"))

    print(f"Loaded metadata with {len(metadata)} items.")
    return faiss_index, metadata
