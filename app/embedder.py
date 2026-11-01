import numpy as np
from fastembed import TextEmbedding

_model = None

def get_model():
    global _model
    if _model is None:
        _model = TextEmbedding(
            model_name="sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2",
            providers=["CPUExecutionProvider"]
        )
    return _model

def embed_one(text: str) -> np.ndarray:
    model = get_model()
    embeddings = list(model.embed([text]))
    vec = np.array(embeddings[0], dtype=np.float32)
    norm = np.linalg.norm(vec)
    if norm > 0:
        vec = vec / norm
    return vec

def embed(texts: list) -> np.ndarray:
    if not texts:
        return np.zeros((0, 384), dtype=np.float32)
    model = get_model()
    embeddings = list(model.embed(texts, batch_size=64))
    mat = np.array(embeddings, dtype=np.float32)
    norms = np.linalg.norm(mat, axis=1, keepdims=True)
    norms[norms == 0] = 1.0
    return mat / norms
