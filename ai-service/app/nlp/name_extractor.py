import re
from pathlib import Path

SECTION_HEADINGS = {
    "SUMMARY", "PROFILE", "PROFESSIONAL SUMMARY", "CAREER SUMMARY", "ABOUT ME",
    "EXPERIENCE", "WORK EXPERIENCE", "PROFESSIONAL EXPERIENCE", "EMPLOYMENT HISTORY",
    "EDUCATION", "ACADEMIC BACKGROUND", "QUALIFICATIONS",
    "SKILLS", "TECHNICAL SKILLS", "KEY SKILLS", "COMPETENCIES",
    "PROJECTS", "PERSONAL PROJECTS", "ACADEMIC PROJECTS", "KEY PROJECTS",
    "CERTIFICATIONS", "CERTIFICATES", "LICENSES & CERTIFICATIONS",
    "ACHIEVEMENTS", "AWARDS", "HONORS", "ACCOMPLISHMENTS",
    "DECLARATION", "HOBBIES", "INTERESTS", "LANGUAGES", "CURRICULUM VITAE", "RESUME", "CV",
    "CONTACT", "CONTACT INFO", "PERSONAL DETAILS", "OBJECTIVE", "CAREER OBJECTIVE"
}

JOB_TITLES_BLACKLIST = {
    "SOFTWARE ENGINEER", "FULL STACK DEVELOPER", "BACKEND DEVELOPER", "FRONTEND DEVELOPER",
    "MERN STACK DEVELOPER", "PYTHON DEVELOPER", "JAVA DEVELOPER", "MACHINE LEARNING ENGINEER",
    "DATA ANALYST", "DATA SCIENTIST", "DEVOPS ENGINEER", "CLOUD ENGINEER",
    "HR ADMINISTRATOR", "PROJECT MANAGER", "DEVELOPER", "ENGINEER", "ANALYST",
    "CONSULTANT", "ARCHITECT", "MANAGER", "STUDENT", "FRESHER", "INTERN", "ASSOCIATE",
    "LEAD", "DIRECTOR", "ADMINISTRATOR", "SPECIALIST", "EXECUTIVE"
}

NOISE_WORDS_BLACKLIST = {
    "RESUME", "CV", "CURRICULUM", "VITAE", "UPDATED", "OPTIMIZED", "ATS", "LATEST",
    "FINAL", "COPY", "FORMAT", "DIFFICULTY", "RATING", "DOCUMENT", "PAGE", "PROFILE"
}

def extract_name(text: str) -> str | None:
    """
    Extract candidate full name using conservative resume-header logic.
    Inspects the first 10-20 non-empty lines before email, phone, GitHub, LinkedIn, location.
    Returns Title-Cased string or None if uncertain.
    """
    if not text or not isinstance(text, str):
        return None

    lines = [line.strip() for line in text.splitlines() if line.strip()]
    if not lines:
        return None

    # Inspect first 15 non-empty lines
    header_lines = lines[:15]

    for line in header_lines:
        # Check if line contains contact info (email, phone, linkedin, github, URL)
        if re.search(r'@|http|\.com|\.in|\+?\d{10}', line):
            # Attempt to clean contact info out of line to check for name prefix
            cleaned_line = re.sub(
                r'(\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b|\+?\d{10,12}|https?://\S+)',
                '',
                line
            ).strip()
            if cleaned_line:
                candidate = _validate_name_candidate(cleaned_line)
                if candidate:
                    return candidate
            # Stop searching if line was purely contact info
            continue

        candidate = _validate_name_candidate(line)
        if candidate:
            return candidate

    return None

def _validate_name_candidate(line: str) -> str | None:
    # Remove leading/trailing non-alphabetic noise
    cleaned = re.sub(r'^[^\w\s]+|[^\w\s]+$', '', line).strip()
    if not cleaned:
        return None

    upper_line = cleaned.upper()

    # Reject exact or prefix section headings or job titles
    if upper_line in SECTION_HEADINGS or upper_line in JOB_TITLES_BLACKLIST:
        return None

    for heading in SECTION_HEADINGS:
        if upper_line == heading or upper_line.startswith(heading + " "):
            return None

    for title in JOB_TITLES_BLACKLIST:
        if upper_line == title or upper_line.startswith(title + " ") or upper_line.endswith(" " + title):
            return None

    # Remove any trailing noise words like 'Resume', 'CV', 'ATS', 'Updated', 'Format' from name candidate line
    words = cleaned.split()
    valid_words = [w for w in words if w.upper() not in NOISE_WORDS_BLACKLIST]

    if not valid_words:
        return None

    cleaned_name = " ".join(valid_words)

    # Candidate name regex: 1 to 4 words, letters/periods/hyphens/apostrophes only
    if not re.match(r'^[A-Za-z][A-Za-z.\'-]+(?:\s+[A-Za-z][A-Za-z.\'-]+){0,3}$', cleaned_name):
        return None

    # Length check: name between 2 and 40 characters
    if len(cleaned_name) < 2 or len(cleaned_name) > 40:
        return None

    # Title case format (normalizing ADITYA YADAV -> Aditya Yadav)
    formatted_words = []
    for word in cleaned_name.split():
        # Handle cases like "O'Connor" or "McDonald" or normal words
        formatted_words.append(word.capitalize())

    return " ".join(formatted_words)

def clean_filename_candidate_name(filename: str) -> str:
    """
    Derive a clean candidate name from original resume filename when parsing yields None.
    Removes: resume, cv, updated, optimized, ats, latest, final, copy, format, difficulty, rating, document,
    numbers in brackets e.g. (30), standalone numbers, file extensions, underscores.
    Examples:
    'Aditya_Yadav_Resume_Updated (30).docx' -> 'Aditya Yadav'
    'Rahul_Sharma_Final_Resume.pdf' -> 'Rahul Sharma'
    'Priya_Singh_CV.pdf' -> 'Priya Singh'
    'Aditya Resume.pdf' -> 'Aditya'
    'ABES Resume format (2).pdf' -> 'ABES'
    'Aditya_Resume_ATS_Optimized.pdf' -> 'Aditya'
    """
    if not filename or not isinstance(filename, str):
        return "Unknown Candidate"

    # Remove extension
    stem = Path(filename).stem

    # Remove numbers in brackets or parentheses e.g. (30), [1], (123), (2)
    stem = re.sub(r'[\(\[\{]\s*\d+\s*[\)\]\}]', '', stem)

    # Replace underscores, hyphens, and dots with spaces
    stem = stem.replace('_', ' ').replace('-', ' ').replace('.', ' ')

    # Remove standalone numbers (e.g., 500, 1415, 30)
    stem = re.sub(r'\b\d+\b', '', stem)

    # Expanded noise words blacklist (case-insensitive)
    noise_words = {
        'resume', 'cv', 'updated', 'optimized', 'ats', 'latest', 'final', 'new',
        'copy', 'format', 'difficulty', 'rating', 'document', 'docx', 'pdf', 'doc',
        'job', 'profile', 'applicant', 'candidate', 'draft', 'version', 'v1', 'v2',
        'v3', 'main', 'bio', 'data'
    }

    words = stem.split()
    clean_words = []

    for w in words:
        clean_w = re.sub(r'[^a-zA-Z]', '', w)
        if clean_w and clean_w.lower() not in noise_words:
            clean_words.append(clean_w.capitalize())

    if clean_words:
        name = " ".join(clean_words)
        if len(name) >= 2:
            return name

    return "Unknown Candidate"
