from openai import OpenAI
import numpy as np
import faiss

client = OpenAI()

EMBED_MODEL = "text-embedding-3-large"

# -------------------------
# Helper: get embedding (wraps your embedding call)
# -------------------------
def get_embedding(text: str):
    resp = client.embeddings.create(model=EMBED_MODEL, input=text)
    emb = np.array(resp.data[0].embedding, dtype="float32")
    # Normalize for cosine-like search if your index uses normalized vectors
    faiss.normalize_L2(emb.reshape(1, -1))
    return emb