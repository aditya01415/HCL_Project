import re

# Strict patterns for explicit experience phrases
EXPERIENCE_PATTERNS = [
    # Pattern 1: Total experience: 7 years, Professional experience: 8 years
    r'\b(?:total|overall|professional|work)?\s*experience\s*:\s*(\d+(?:\.\d+)?)\s*\+?\s*(?:years|year|yrs|yr)\b',
    # Pattern 2: 5 yrs of professional experience, over 4 years of experience, more than 6 years experience
    r'\b(?:over|more than|around|about|at least|nearly)?\s*(\d+(?:\.\d+)?)\s*\+?\s*(?:years|year|yrs|yr)\s*(?:of\s*)?(?:total|overall|professional|work|hands-on|industry)?\s*experience\b',
    # Pattern 3: 2 years experience, 5+ years experience
    r'\b(\d+(?:\.\d+)?)\s*\+?\s*(?:years|year|yrs|yr)\s+experience\b',
    # Pattern 4: experience of 5 years
    r'\bexperience\s*(?:of|:)?\s*(\d+(?:\.\d+)?)\s*\+?\s*(?:years|year|yrs|yr)\b'
]

def extract_experience_details(text: str) -> tuple[int | float | None, str | None]:
    """
    Extract total years of experience along with the matched explicit phrase.
    Returns (experience_value, matched_phrase). Returns (None, None) if not found.
    """
    if not text or not isinstance(text, str):
        return None, None
        
    candidates = []
    for pattern in EXPERIENCE_PATTERNS:
        for match in re.finditer(pattern, text, re.IGNORECASE):
            full_phrase = match.group(0).strip()
            num_str = match.group(1)
            try:
                val = float(num_str)
                # Filter strictly between 0 and 40 years of experience
                if 0 <= val <= 40:
                    candidates.append((val, full_phrase))
            except ValueError:
                pass
                
    if not candidates:
        return None, None
        
    # Return candidate with maximum valid years of experience
    max_candidate = max(candidates, key=lambda x: x[0])
    val = max_candidate[0]
    num_val = int(val) if val.is_integer() else val
    return num_val, max_candidate[1]

def extract_years_experience(text: str) -> int | float | None:
    """
    Extract total years of experience from resume text.
    Returns numeric value (0-40) if reliable experience phrase found, else None.
    """
    num_val, _ = extract_experience_details(text)
    return num_val
