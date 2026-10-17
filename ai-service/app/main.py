from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import health_router, resume_router, job_router, matching_router

app = FastAPI(
    title="AI Resume Screening Service",
    version="1.0.0",
    description="FastAPI service for resume parsing, job description analysis, and AI candidate-job matching."
)

# Configure CORS middleware for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(health_router)
app.include_router(resume_router)
app.include_router(job_router)
app.include_router(matching_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
