import numpy as np
from sentence_transformers import SentenceTransformer

_MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"
_MODEL = None

def _get_model() -> SentenceTransformer:
    global _MODEL
    if _MODEL is None:
        _MODEL = SentenceTransformer(_MODEL_NAME)
    return _MODEL

def get_embedding(text: str) -> np.ndarray:
    """
    Generate a 1D vector embedding for the input text using SentenceTransformer.
    """
    if not text or not isinstance(text, str):
        text = ""
    model = _get_model()
    return model.encode(text, convert_to_numpy=True)

def get_embeddings(texts: list[str]) -> np.ndarray:
    """
    Generate a 2D array of embeddings for a list of input texts.
    """
    if not texts:
        return np.empty((0, 384))
    processed = [t if (t and isinstance(t, str)) else "" for t in texts]
    model = _get_model()
    return model.encode(processed, convert_to_numpy=True)
