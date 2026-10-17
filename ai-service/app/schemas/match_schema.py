from pydantic import BaseModel, Field

class MatchTextRequest(BaseModel):
    resume_text: str = Field(..., description="Raw or cleaned candidate resume text", min_length=1)
    job_description: str = Field(..., description="Raw job description text", min_length=1)

class MatchResponse(BaseModel):
    final_score: float
    semantic_score: float
    skill_score: float
    experience_score: float
    education_score: float
    matched_skills: list[str]
    missing_skills: list[str]
    candidate_skills: list[str]
    required_skills: list[str]

class CandidateInfo(BaseModel):
    email: str | None = None
    phone: str | None = None
    github: str | None = None
    linkedin: str | None = None
    skills: list[str]
    education: list[str]
    years_experience: int | float | None = None

class MatchResumeResponse(BaseModel):
    candidate: CandidateInfo
    matching: dict
