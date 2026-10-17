from app.parser.resume_parser import parse_resume_text
from app.nlp.job_description_parser import parse_job_description
from app.scoring.semantic_score import calculate_semantic_similarity
from app.scoring.skill_score import calculate_skill_score
from app.scoring.experience_score import calculate_experience_score
from app.scoring.education_score import calculate_education_score

def calculate_match_score(resume_text: str, job_description_text: str) -> dict:
    """
    Calculate comprehensive candidate-job match score using weighted multi-component scoring.
    Weights: Semantic Similarity (40%), Skill Match (35%), Experience (15%), Education (10%).
    """
    # 1. Parse Candidate Resume & Job Description
    resume_data = parse_resume_text(resume_text)
    jd_data = parse_job_description(job_description_text)
    
    candidate_skills = resume_data.get("skills", [])
    required_skills = jd_data.get("required_skills", [])
    candidate_years = resume_data.get("years_experience")
    required_years = jd_data.get("minimum_experience")
    candidate_edu = resume_data.get("canonical_education") or resume_data.get("education", [])
    required_edu = jd_data.get("education", [])
    
    # 2. Calculate Component Scores
    sem_res = calculate_semantic_similarity(resume_text, job_description_text)
    semantic_score = sem_res.get("semantic_score", 0.0)
    
    skill_res = calculate_skill_score(candidate_skills, required_skills)
    skill_score = skill_res.get("skill_score", 0.0)
    matched_skills = skill_res.get("matched_skills", [])
    missing_skills = skill_res.get("missing_skills", [])
    
    experience_score = calculate_experience_score(candidate_years, required_years)
    education_score = calculate_education_score(candidate_edu, required_edu)
    
    # 3. Calculate Weighted Final Score
    final_score = (
        semantic_score * 0.40 +
        skill_score * 0.35 +
        experience_score * 0.15 +
        education_score * 0.10
    )
    final_score_clamped = round(min(100.0, max(0.0, final_score)), 2)
    
    return {
        "final_score": final_score_clamped,
        "semantic_score": round(semantic_score, 2),
        "skill_score": round(skill_score, 2),
        "experience_score": round(experience_score, 2),
        "education_score": round(education_score, 2),
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "candidate_skills": candidate_skills,
        "required_skills": required_skills
    }
