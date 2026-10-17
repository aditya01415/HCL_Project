import re

ACHIEVEMENT_HEADINGS = [
    "ACHIEVEMENTS", "AWARDS", "HONORS", "ACCOMPLISHMENTS", "HONORS & AWARDS"
]

NEXT_HEADINGS = [
    "CERTIFICATIONS", "DECLARATION", "HOBBIES", "INTERESTS", "PROJECTS", "EDUCATION", "SKILLS"
]

def extract_achievements(text: str) -> list[str]:
    """
    Extract achievements / awards list from resume text.
    """
    if not text or not isinstance(text, str):
        return []

    lines = [line.strip() for line in text.splitlines()]

    start_idx = -1
    for idx, line in enumerate(lines):
        upper = line.upper().rstrip(':').strip()
        if upper in ACHIEVEMENT_HEADINGS:
            start_idx = idx
            break

    if start_idx == -1:
        return []

    ach_lines = []
    for line in lines[start_idx + 1:]:
        if not line:
            continue
        upper = line.upper().rstrip(':').strip()
        if upper in NEXT_HEADINGS or upper in ["WORK EXPERIENCE", "EXPERIENCE"]:
            break
        cleaned = re.sub(r'^[•\-\*\d+\.]\s*', '', line).strip()
        if cleaned and len(cleaned) >= 3:
            ach_lines.append(cleaned)

    return ach_lines
