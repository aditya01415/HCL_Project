import re

# Tuple of (Regex Pattern, Canonical Degree Label)
DEGREE_PATTERNS = [
    (r'\b(?:b\.tech|btech|bachelor of technology)\b', 'B.Tech'),
    (r'\b(?:b\.e\.|b\.e|bachelor of engineering)\b', 'B.E.'),
    (r'\b(?:bca|bachelor of computer applications)\b', 'BCA'),
    (r'\b(?:mca|master of computer applications)\b', 'MCA'),
    (r'\b(?:m\.tech|mtech|master of technology)\b', 'M.Tech'),
    (r'\b(?:mba|master of business administration)\b', 'MBA'),
    (r'\b(?:b\.sc|bsc|bachelor of science)\b', 'B.Sc'),
    (r'\b(?:m\.sc|msc|master of science)\b', 'M.Sc'),
    (r'\b(?:ph\.d|phd|doctor of philosophy)\b', 'Ph.D'),
    (r'\b(?:b\.a\.|bachelor of arts)\b', 'B.A.'),
    (r'\b(?:m\.a\.|master of arts)\b', 'M.A.'),
]

SPECIALIZATIONS = [
    "Computer Science", "Information Technology", "Software Engineering",
    "Data Science", "Artificial Intelligence", "Electronics", "Electrical",
    "Mechanical", "Civil", "Mathematics", "Physics", "Chemistry"
]

INSTITUTION_KEYWORDS = [
    "University", "Institute", "College", "School", "Academy", "IIT", "NIT", "BITS", "VTU", "AKTU"
]

def extract_education(text: str) -> list[str]:
    """
    Detect and extract common academic degrees from text.
    Returns a sorted list of unique canonical degree names detected.
    """
    if not text or not isinstance(text, str):
        return []

    detected = set()
    for pattern, canonical in DEGREE_PATTERNS:
        if re.search(pattern, text, flags=re.IGNORECASE):
            detected.add(canonical)

    return sorted(list(detected))

def extract_structured_education(text: str) -> list[dict]:
    """
    Extract structured education objects: degree, specialization, institution, graduation_year, grade.
    """
    if not text or not isinstance(text, str):
        return []

    lines = [line.strip() for line in text.splitlines() if line.strip()]

    # Find Education section lines
    edu_lines = []
    in_edu = False

    for line in lines:
        upper = line.upper().rstrip(':').strip()
        if upper in ["EDUCATION", "ACADEMIC BACKGROUND", "QUALIFICATIONS", "ACADEMIC QUALIFICATIONS"]:
            in_edu = True
            continue
        if in_edu:
            if upper in ["WORK EXPERIENCE", "EXPERIENCE", "SKILLS", "PROJECTS", "CERTIFICATIONS", "ACHIEVEMENTS"]:
                break
            edu_lines.append(line)

    if not edu_lines:
        edu_lines = lines # Fallback search entire text

    structured_entries = []

    for line in edu_lines:
        detected_degree = None
        for pattern, canonical in DEGREE_PATTERNS:
            if re.search(pattern, line, flags=re.IGNORECASE):
                detected_degree = canonical
                break

        if detected_degree:
            # Specialization
            specialization = None
            for spec in SPECIALIZATIONS:
                if re.search(r'\b' + re.escape(spec) + r'\b', line, flags=re.IGNORECASE):
                    specialization = spec
                    break

            # Graduation Year
            year_match = re.search(r'\b(19\d\d|20\d\d)\b', line)
            grad_year = int(year_match.group(1)) if year_match else None

            # Grade / CGPA / Percentage
            grade_match = re.search(r'\b(?:\d\.\d{1,2}\s*/\s*10|\d\.\d{1,2}\s*CGPA|\d{2,3}%\s*|\d\.\d{1,2}\s*GPA)\b', line, re.IGNORECASE)
            grade = grade_match.group(0).strip() if grade_match else None

            # Institution
            institution = None
            for kw in INSTITUTION_KEYWORDS:
                if kw in line:
                    parts = line.split(',')
                    for p in parts:
                        if kw in p:
                            institution = p.strip()
                            break
                    if not institution:
                        institution = line

            structured_entries.append({
                "degree": detected_degree,
                "specialization": specialization,
                "institution": institution,
                "graduation_year": grad_year,
                "grade": grade
            })

    # If structured education list is empty but extract_education found degrees, create fallback items
    if not structured_entries:
        degrees = extract_education(text)
        for deg in degrees:
            structured_entries.append({
                "degree": deg,
                "specialization": None,
                "institution": None,
                "graduation_year": None,
                "grade": None
            })

    return structured_entries
