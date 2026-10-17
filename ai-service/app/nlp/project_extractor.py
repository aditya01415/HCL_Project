import re
from app.nlp.skill_extractor import extract_skills

PROJECT_HEADINGS = [
    "PROJECTS", "ACADEMIC PROJECTS", "PERSONAL PROJECTS", "KEY PROJECTS", "FEATURED PROJECTS"
]

NEXT_HEADINGS = [
    "CERTIFICATIONS", "ACHIEVEMENTS", "DECLARATION", "HOBBIES", "INTERESTS", "EDUCATION", "SKILLS"
]

def extract_projects(text: str) -> list[dict]:
    """
    Extract projects section with name, description, and technologies.
    """
    if not text or not isinstance(text, str):
        return []

    lines = [line.strip() for line in text.splitlines()]

    proj_start_idx = -1
    for idx, line in enumerate(lines):
        upper = line.upper().rstrip(':').strip()
        if upper in PROJECT_HEADINGS:
            proj_start_idx = idx
            break

    if proj_start_idx == -1:
        return []

    proj_lines = []
    for line in lines[proj_start_idx + 1:]:
        upper = line.upper().rstrip(':').strip()
        if upper in NEXT_HEADINGS or upper in ["WORK EXPERIENCE", "EXPERIENCE"]:
            break
        proj_lines.append(line)

    if not proj_lines:
        return []

    projects = []
    current_proj = None

    for line in proj_lines:
        if not line:
            continue

        # Project header candidate: line without punctuation at end, or containing '|' or '-'
        if not current_proj or (len(line) < 60 and not line.startswith('•') and not line.startswith('-') and not line.endswith('.')):
            parts = [p.strip() for p in re.split(r'[|•]', line) if p.strip()]
            p_name = parts[0]

            if current_proj:
                projects.append(current_proj)

            current_proj = {
                "name": p_name,
                "description": parts[1] if len(parts) > 1 else "",
                "technologies": extract_skills(line)
            }
        else:
            if current_proj:
                if current_proj["description"]:
                    current_proj["description"] += " " + line
                else:
                    current_proj["description"] = line

                line_techs = extract_skills(line)
                for t in line_techs:
                    if t not in current_proj["technologies"]:
                        current_proj["technologies"].append(t)

    if current_proj:
        projects.append(current_proj)

    return projects
