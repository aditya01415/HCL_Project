from pathlib import Path

from app.nlp.entity_extractor import extract_email, extract_phone, extract_github, extract_linkedin
from app.nlp.name_extractor import extract_name, clean_filename_candidate_name
from app.nlp.location_extractor import extract_header_location
from app.nlp.summary_extractor import extract_summary
from app.nlp.skill_extractor import extract_skills_detailed, categorize_skills
from app.nlp.education_extractor import extract_education, extract_structured_education
from app.nlp.experience_extractor import extract_experience_details
from app.nlp.work_experience_extractor import extract_structured_experience
from app.nlp.project_extractor import extract_projects
from app.nlp.certification_extractor import extract_certifications
from app.nlp.achievement_extractor import extract_achievements
from app.parser.pdf_parser import extract_text_from_pdf
from app.parser.docx_parser import extract_text_from_docx

def parse_resume_text(text: str, filename: str | None = None) -> dict:
    """
    Parse raw or cleaned resume text and extract all candidate fields into a full structured profile.
    """
    if not text or not isinstance(text, str):
        extracted_name = None
        fallback_name = clean_filename_candidate_name(filename) if filename else "Unknown Candidate"
        final_name = extracted_name or fallback_name
        return {
            "name": final_name,
            "email": None,
            "phone": None,
            "location": None,
            "github": None,
            "linkedin": None,
            "summary": None,
            "skills": [],
            "categorized_skills": {
                "programming_languages": [],
                "frontend": [],
                "backend": [],
                "databases": [],
                "cloud": [],
                "devops": [],
                "tools": [],
                "machine_learning": []
            },
            "experience": [],
            "total_experience_years": None,
            "education": [],
            "projects": [],
            "certifications": [],
            "achievements": [],
            # Backward compatibility fields for scoring
            "years_experience": None,
            "matched_experience_phrase": None,
            "skill_matches": {}
        }

    extracted_name = extract_name(text)
    fallback_name = clean_filename_candidate_name(filename) if filename else "Unknown Candidate"
    final_name = extracted_name or fallback_name

    skills_list, skill_matches = extract_skills_detailed(text)
    categorized = categorize_skills(skills_list)
    years_exp, exp_phrase = extract_experience_details(text)
    structured_exp = extract_structured_experience(text)
    structured_edu = extract_structured_education(text)
    canonical_edu = extract_education(text)

    return {
        "name": final_name,
        "email": extract_email(text),
        "phone": extract_phone(text),
        "location": extract_header_location(text),
        "github": extract_github(text),
        "linkedin": extract_linkedin(text),
        "summary": extract_summary(text),
        "skills": skills_list,
        "categorized_skills": categorized,
        "experience": structured_exp,
        "total_experience_years": years_exp,
        "education": structured_edu,
        "projects": extract_projects(text),
        "certifications": extract_certifications(text),
        "achievements": extract_achievements(text),

        # Backward compatibility fields for scoring
        "years_experience": years_exp,
        "matched_experience_phrase": exp_phrase,
        "skill_matches": skill_matches,
        "canonical_education": canonical_edu
    }

def parse_resume_file(file_path: str | Path) -> dict:
    """
    Parse a resume document (PDF or DOCX), extract text, and return structured profile.
    """
    path = Path(file_path)
    filename = path.name

    if not path.exists():
        print(f"[Error] File not found: {path}")
        return parse_resume_text("", filename=filename)

    ext = path.suffix.lower()
    text = ""

    if ext == ".pdf":
        text = extract_text_from_pdf(path)
    elif ext in [".docx", ".doc"]:
        text = extract_text_from_docx(path)
    else:
        print(f"[Warning] Unsupported file extension '{ext}'. Attempting text fallback.")
        try:
            with open(path, "r", encoding="utf-8", errors="ignore") as f:
                text = f.read()
        except Exception as e:
            print(f"[Error] Could not read file: {e}")

    return parse_resume_text(text, filename=filename)
