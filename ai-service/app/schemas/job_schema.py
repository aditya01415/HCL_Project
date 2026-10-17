from pydantic import BaseModel, Field

class JobDescriptionRequest(BaseModel):
    job_description: str = Field(..., description="Raw job description text", min_length=1)

class JobDescriptionResponse(BaseModel):
    clean_text: str
    required_skills: list[str]
    preferred_skills: list[str]
    minimum_experience: int | float | None = None
    education: list[str]
