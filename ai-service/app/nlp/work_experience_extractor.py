import re

EXP_HEADINGS = [
    "WORK EXPERIENCE", "PROFESSIONAL EXPERIENCE", "EXPERIENCE", "EMPLOYMENT HISTORY", "CAREER HISTORY"
]

NEXT_HEADINGS = [
    "EDUCATION", "SKILLS", "TECHNICAL SKILLS", "PROJECTS", "CERTIFICATIONS", "ACHIEVEMENTS", "DECLARATION", "HOBBIES"
]

DATE_PATTERN = r'\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4}|\b\d{1,2}/\d{4}|\b\d{4}\b'
RANGE_PATTERN = re.compile(r'(' + DATE_PATTERN + r')\s*(?:-|–|—|to)\s*(' + DATE_PATTERN + r'|Present|Current|Now)', re.IGNORECASE)

KNOWN_TITLES = [
    "Software Engineer", "Full Stack Developer", "Frontend Developer", "Backend Developer",
    "MERN Stack Developer", "Python Developer", "Java Developer", "Machine Learning Engineer",
    "Data Analyst", "DevOps Engineer", "Cloud Engineer", "Software Developer", "System Engineer",
    "Tech Lead", "Senior Developer", "Junior Developer", "Intern", "Research Assistant",
    "Associate Engineer", "Consultant", "Architect", "Product Manager", "Project Manager"
]

def extract_structured_experience(text: str) -> list[dict]:
    """
    Extract structured work experience entries from resume text.
    """
    if not text or not isinstance(text, str):
        return []

    lines = [line.strip() for line in text.splitlines()]

    exp_start_idx = -1
    for idx, line in enumerate(lines):
        upper = line.upper().rstrip(':').strip()
        if upper in EXP_HEADINGS:
            exp_start_idx = idx
            break

    if exp_start_idx == -1:
        return []

    exp_lines = []
    for line in lines[exp_start_idx + 1:]:
        upper = line.upper().rstrip(':').strip()
        if upper in NEXT_HEADINGS:
            break
        exp_lines.append(line)

    if not exp_lines:
        return []

    entries = []
    current_entry = None

    for line in exp_lines:
        if not line:
            continue

        range_match = RANGE_PATTERN.search(line)
        if range_match:
            start_date = range_match.group(1).strip()
            end_date = range_match.group(2).strip()

            if current_entry:
                entries.append(current_entry)

            # Check if job title or company is on the same line
            title_candidate = None
            company_candidate = None
            location_candidate = None

            line_no_date = RANGE_PATTERN.sub('', line).strip(' |-•,')
            parts = [p.strip() for p in re.split(r'[|•,]', line_no_date) if p.strip()]

            if parts:
                title_candidate = parts[0]
                if len(parts) > 1:
                    company_candidate = parts[1]
                if len(parts) > 2:
                    location_candidate = parts[2]

            current_entry = {
                "job_title": title_candidate,
                "company": company_candidate,
                "location": location_candidate,
                "start_date": start_date,
                "end_date": end_date,
                "duration": _calculate_duration_str(start_date, end_date),
                "responsibilities": []
            }
        else:
            if current_entry is None:
                # First line without explicit date range might be job title/company header
                for title in KNOWN_TITLES:
                    if title.lower() in line.lower():
                        current_entry = {
                            "job_title": line,
                            "company": None,
                            "location": None,
                            "start_date": None,
                            "end_date": None,
                            "duration": None,
                            "responsibilities": []
                        }
                        break
            else:
                # Add responsibility bullet point
                resp = re.sub(r'^[•\-\*\d+\.]\s*', '', line).strip()
                if resp and len(resp) > 5:
                    current_entry["responsibilities"].append(resp)

    if current_entry:
        entries.append(current_entry)

    return entries

def _calculate_duration_str(start_str: str, end_str: str) -> str | None:
    try:
        start_year_m = re.search(r'\b(19\d\d|20\d\d)\b', start_str)
        if not start_year_m:
            return None
        start_year = int(start_year_m.group(1))

        if re.search(r'present|current|now', end_str, re.IGNORECASE):
            end_year = 2026 # Current year context
        else:
            end_year_m = re.search(r'\b(19\d\d|20\d\d)\b', end_str)
            if not end_year_m:
                return None
            end_year = int(end_year_m.group(1))

        diff = max(1, end_year - start_year)
        if diff == 1:
            return "1 year"
        return f"{diff} years"
    except Exception:
        return None
