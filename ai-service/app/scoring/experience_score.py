def calculate_experience_score(
    candidate_years: int | float | None,
    required_years: int | float | None
) -> float:
    """
    Calculate experience match score.
    Returns 100 if no requirement or if candidate meets/exceeds requirement.
    Returns proportional percentage (0-100) if candidate has partial experience.
    Returns 0 if candidate experience is missing when required.
    """
    if required_years is None or required_years <= 0:
        return 100.0
        
    if candidate_years is None or candidate_years < 0:
        return 0.0
        
    if candidate_years >= required_years:
        return 100.0
        
    score = (candidate_years / required_years) * 100.0
    return round(min(100.0, max(0.0, score)), 2)
