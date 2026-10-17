import os
import shutil
import tempfile
from pathlib import Path
from fastapi import APIRouter, File, UploadFile, HTTPException, status
from app.parser.resume_parser import parse_resume_file

router = APIRouter(tags=["Resume"])

ALLOWED_EXTENSIONS = {".pdf", ".docx", ".doc"}

@router.post("/parse-resume")
async def parse_resume(file: UploadFile = File(...)):
    """
    Parse an uploaded resume document (PDF or DOCX) and extract full structured candidate profile.
    Temporary files are automatically cleaned up after processing.
    """
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file must have a valid filename."
        )

    ext = Path(file.filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file type '{ext}'. Allowed extensions are: {sorted(list(ALLOWED_EXTENSIONS))}"
        )

    temp_dir = tempfile.mkdtemp()
    temp_file_path = Path(temp_dir) / file.filename

    try:
        with open(temp_file_path, "wb") as f:
            shutil.copyfileobj(file.file, f)

        parsed_data = parse_resume_file(temp_file_path)

        return {
            "name": parsed_data.get("name"),
            "email": parsed_data.get("email"),
            "phone": parsed_data.get("phone"),
            "location": parsed_data.get("location"),
            "github": parsed_data.get("github"),
            "linkedin": parsed_data.get("linkedin"),
            "summary": parsed_data.get("summary"),
            "skills": parsed_data.get("skills", []),
            "categorized_skills": parsed_data.get("categorized_skills", {}),
            "experience": parsed_data.get("experience", []),
            "total_experience_years": parsed_data.get("total_experience_years"),
            "education": parsed_data.get("education", []),
            "projects": parsed_data.get("projects", []),
            "certifications": parsed_data.get("certifications", []),
            "achievements": parsed_data.get("achievements", []),
            # Backward compatibility fields
            "years_experience": parsed_data.get("years_experience")
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error parsing resume file: {str(e)}"
        )
    finally:
        if temp_dir and os.path.exists(temp_dir):
            shutil.rmtree(temp_dir, ignore_errors=True)
