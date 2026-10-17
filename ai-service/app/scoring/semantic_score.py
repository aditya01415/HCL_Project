import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from app.nlp.preprocessing import clean_text
from app.models.embedding_model import get_embedding

def calculate_semantic_similarity(resume_text: str, job_description: str) -> dict:
    """
    Calculate semantic similarity between resume text and job description using sentence embeddings.
    Returns raw cosine similarity float and a clamped 0-100 semantic score.
    """
    cleaned_resume = clean_text(resume_text)
    cleaned_jd = clean_text(job_description)
    
    if not cleaned_resume or not cleaned_jd:
        return {
            "raw_similarity": 0.0,
            "semantic_score": 0.0
        }
        
    emb_resume = get_embedding(cleaned_resume).reshape(1, -1)
    emb_jd = get_embedding(cleaned_jd).reshape(1, -1)
    
    sim_matrix = cosine_similarity(emb_resume, emb_jd)
    raw_sim = float(sim_matrix[0][0])
    
    # Scale cosine similarity ([-1, 1] range) to [0, 100] percentage score
    # Cosine similarity for text embeddings is usually >= 0
    score = float(np.clip(raw_sim * 100.0, 0.0, 100.0))
    
    return {
        "raw_similarity": round(raw_sim, 4),
        "semantic_score": round(score, 2)
    }
