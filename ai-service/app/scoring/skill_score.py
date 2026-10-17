def calculate_skill_score(candidate_skills: list[str], required_skills: list[str]) -> dict:
    """
    Calculate skill match score based on candidate skills vs required job skills.
    Returns skill_score percentage, matched_skills list, and missing_skills list.
    """
    if not required_skills:
        return {
            "skill_score": 0.0,
            "matched_skills": [],
            "missing_skills": []
        }
        
    cand_set = set([s.lower() for s in (candidate_skills or [])])
    req_set = set([s.lower() for s in required_skills])
    
    matched = sorted(list(cand_set.intersection(req_set)))
    missing = sorted(list(req_set - cand_set))
    
    score = (len(matched) / len(req_set)) * 100.0
    score_clamped = min(100.0, max(0.0, score))
    
    return {
        "skill_score": round(score_clamped, 2),
        "matched_skills": matched,
        "missing_skills": missing
    }
