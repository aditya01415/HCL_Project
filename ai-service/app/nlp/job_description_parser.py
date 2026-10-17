import re
from app.nlp.preprocessing import clean_text
from app.nlp.skill_extractor import extract_skills
from app.nlp.education_extractor import extract_education
from app.nlp.experience_extractor import extract_years_experience

REQ_HEADER_PATTERN = r'^\s*(?:required\s+skills|requirements|must\s+have|mandatory\s+skills)\b[:\s]*'
PREF_HEADER_PATTERN = r'^\s*(?:preferred\s+skills|good\s+to\s+have|nice\s+to\s+have|preferred\s+qualifications)\b[:\s]*'
OTHER_HEADER_PATTERN = r'^\s*(?:minimum\s+experience|experience|education|responsibilities|about\s+the\s+role)\b[:\s]*'

def parse_job_description(text: str) -> dict:
    """
    Parse a Job Description string to extract clean text, required skills,
    preferred skills, minimum experience required, and required education.
    Handles headings with inline content (e.g. 'Required Skills: Python, React').
    """
    if not text or not isinstance(text, str):
        return {
            "clean_text": "",
            "required_skills": [],
            "preferred_skills": [],
            "minimum_experience": None,
            "education": []
        }
        
    cleaned = clean_text(text)
    min_exp = extract_years_experience(text) or extract_years_experience(cleaned)
    edu = extract_education(text) or extract_education(cleaned)
    
    lines = text.split('\n')
    current_section = None
    
    req_text_lines = []
    pref_text_lines = []
    
    for line in lines:
        req_match = re.search(REQ_HEADER_PATTERN, line, re.IGNORECASE)
        pref_match = re.search(PREF_HEADER_PATTERN, line, re.IGNORECASE)
        other_match = re.search(OTHER_HEADER_PATTERN, line, re.IGNORECASE)
        
        if req_match:
            current_section = 'req'
            inline_content = line[req_match.end():].strip()
            if inline_content:
                req_text_lines.append(inline_content)
            continue
        elif pref_match:
            current_section = 'pref'
            inline_content = line[pref_match.end():].strip()
            if inline_content:
                pref_text_lines.append(inline_content)
            continue
        elif other_match:
            current_section = 'other'
            continue
            
        if current_section == 'req':
            req_text_lines.append(line)
        elif current_section == 'pref':
            pref_text_lines.append(line)
            
    if req_text_lines or pref_text_lines:
        req_skills_set = set(extract_skills("\n".join(req_text_lines))) if req_text_lines else set()
        pref_skills_set = set(extract_skills("\n".join(pref_text_lines))) if pref_text_lines else set()
        pref_skills_set = pref_skills_set - req_skills_set
    else:
        req_skills_set = set(extract_skills(text))
        pref_skills_set = set()
        
    return {
        "clean_text": cleaned,
        "required_skills": sorted(list(req_skills_set)),
        "preferred_skills": sorted(list(pref_skills_set)),
        "minimum_experience": min_exp,
        "education": edu
    }
