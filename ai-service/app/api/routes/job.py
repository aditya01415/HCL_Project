from fastapi import APIRouter, HTTPException, status
from app.schemas.job_schema import JobDescriptionRequest, JobDescriptionResponse
from app.nlp.job_description_parser import parse_job_description

router = APIRouter(tags=["Job Description"])

@router.post("/parse-job", response_model=JobDescriptionResponse)
def parse_job(request: JobDescriptionRequest):
    """
    Parse a Job Description to extract required skills, preferred skills, minimum experience,
    and required education.
    """
    if not request.job_description or not request.job_description.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Job description text cannot be empty."
        )
        
    try:
        parsed_data = parse_job_description(request.job_description)
        return parsed_data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to parse job description: {str(e)}"
        )
