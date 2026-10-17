import re

SUMMARY_HEADINGS = [
    "PROFESSIONAL SUMMARY", "CAREER SUMMARY", "EXECUTIVE SUMMARY",
    "SUMMARY", "PROFILE", "ABOUT ME", "PERSONAL PROFILE", "OVERVIEW"
]

NEXT_SECTION_HEADINGS = [
    "WORK EXPERIENCE", "EXPERIENCE", "EMPLOYMENT HISTORY", "PROFESSIONAL EXPERIENCE",
    "EDUCATION", "ACADEMIC BACKGROUND", "SKILLS", "TECHNICAL SKILLS",
    "PROJECTS", "ACADEMIC PROJECTS", "CERTIFICATIONS", "ACHIEVEMENTS", "DECLARATION"
]

def extract_summary(text: str) -> str | None:
    """
    Extract professional summary text starting at summary heading until the next major section.
    Returns plain text or None.
    """
    if not text or not isinstance(text, str):
        return None

    lines = [line.strip() for line in text.splitlines()]

    summary_start_idx = -1
    for idx, line in enumerate(lines[:25]): # Look within first 25 lines
        upper = line.upper().rstrip(':').strip()
        if upper in SUMMARY_HEADINGS or any(upper.startswith(h) for h in SUMMARY_HEADINGS):
            summary_start_idx = idx
            break

    if summary_start_idx == -1:
        return None

    summary_lines = []
    for line in lines[summary_start_idx + 1:]:
        if not line:
            if summary_lines and len(summary_lines) >= 3:
                break
            continue

        upper = line.upper().rstrip(':').strip()
        if upper in NEXT_SECTION_HEADINGS or any(upper.startswith(h) for h in NEXT_SECTION_HEADINGS):
            break

        summary_lines.append(line)

        if len(summary_lines) >= 6: # Typically 2-5 sentences
            break

    if summary_lines:
        summary_text = " ".join(summary_lines).strip()
        if len(summary_text) >= 15:
            return summary_text

    return None
