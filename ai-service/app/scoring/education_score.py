def calculate_education_score(
    candidate_education: list,
    required_education: list[str]
) -> float:
    """
    Calculate simple rule-based education score.
    Returns 100.0 if no requirement or if candidate meets any required degree.
    Returns 0.0 otherwise.
    """
    if not required_education:
        return 100.0
        
    cand_degrees = []
    for item in (candidate_education or []):
        if isinstance(item, str):
            cand_degrees.append(item.lower())
        elif isinstance(item, dict):
            if item.get("degree"):
                cand_degrees.append(str(item["degree"]).lower())
            if item.get("field"):
                cand_degrees.append(str(item["field"]).lower())

    cand_set = set(cand_degrees)
    req_set = set([str(e).lower() for e in (required_education or []) if e])
    
    # Check if any candidate degree matches any required degree
    if cand_set.intersection(req_set):
        return 100.0
        
    return 0.0

