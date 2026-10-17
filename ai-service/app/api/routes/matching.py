import os
import shutil
import tempfile
from pathlib import Path
from fastapi import APIRouter, File, Form, UploadFile, HTTPException, status
from app.schemas.match_schema import MatchTextRequest, MatchResponse, MatchResumeResponse
from app.parser.pdf_parser import extract_text_from_pdf
from app.parser.docx_parser import extract_text_from_docx
from app.parser.resume_parser import parse_resume_text
from app.scoring.match_score import calculate_match_score

router = APIRouter(tags=["Matching"])

ALLOWED_EXTENSIONS = {".pdf", ".docx", ".doc"}

@router.post("/match-text", response_model=MatchResponse)
def match_text(request: MatchTextRequest):
    """
    Calculate candidate-job match score using raw resume text and job description text.
    """
    if not request.resume_text or not request.resume_text.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Resume text cannot be empty."
        )
    if not request.job_description or not request.job_description.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Job description text cannot be empty."
        )
        
    try:
        result = calculate_match_score(request.resume_text, request.job_description)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error calculating match score: {str(e)}"
        )

@router.post("/match-resume", response_model=MatchResumeResponse)
async def match_resume(
    file: UploadFile = File(...),
    job_description: str = Form(...)
):
    """
    Match an uploaded resume document (PDF or DOCX) against a job description string.
    Extracts candidate metadata and runs full weighted multi-component scoring.
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
        
    if not job_description or not job_description.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Job description text cannot be empty."
        )
        
    temp_dir = tempfile.mkdtemp()
    temp_file_path = Path(temp_dir) / file.filename
    
    try:
        with open(temp_file_path, "wb") as f:
            shutil.copyfileobj(file.file, f)
            
        if ext == ".pdf":
            resume_text = extract_text_from_pdf(temp_file_path)
        elif ext in [".docx", ".doc"]:
            resume_text = extract_text_from_docx(temp_file_path)
        else:
            resume_text = ""
            
        if not resume_text or not resume_text.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Could not extract readable text from the uploaded resume file."
            )
            
        candidate_parsed = parse_resume_text(resume_text, filename=file.filename)
        matching_result = calculate_match_score(resume_text, job_description)

        return {
            "candidate": {
                "name": candidate_parsed.get("name"),
                "email": candidate_parsed.get("email"),
                "phone": candidate_parsed.get("phone"),
                "location": candidate_parsed.get("location"),
                "github": candidate_parsed.get("github"),
                "linkedin": candidate_parsed.get("linkedin"),
                "summary": candidate_parsed.get("summary"),
                "skills": candidate_parsed.get("skills", []),
                "categorized_skills": candidate_parsed.get("categorized_skills", {}),
                "experience": candidate_parsed.get("experience", []),
                "total_experience_years": candidate_parsed.get("total_experience_years"),
                "education": candidate_parsed.get("education", []),
                "projects": candidate_parsed.get("projects", []),
                "certifications": candidate_parsed.get("certifications", []),
                "achievements": candidate_parsed.get("achievements", []),
                "years_experience": candidate_parsed.get("years_experience")
            },
            "matching": {
                "final_score": matching_result["final_score"],
                "semantic_score": matching_result["semantic_score"],
                "skill_score": matching_result["skill_score"],
                "experience_score": matching_result["experience_score"],
                "education_score": matching_result["education_score"],
                "matched_skills": matching_result["matched_skills"],
                "missing_skills": matching_result["missing_skills"]
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error matching uploaded resume: {str(e)}"
        )
    finally:
        if temp_dir and os.path.exists(temp_dir):
            shutil.rmtree(temp_dir, ignore_errors=True)
