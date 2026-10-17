import glob
import sys
from pathlib import Path
# pyrefly: ignore [missing-import]
from fastapi.testclient import TestClient

# Add ai-service directory to sys.path
script_dir = Path(__file__).resolve().parent
ai_service_dir = script_dir.parent
project_root = ai_service_dir.parent

sys.path.append(str(ai_service_dir))

from app.main import app

client = TestClient(app)

def test_api_endpoints():
    print("=" * 60)
    print("AI RESUME SCREENING - FASTAPI ENDPOINTS VERIFICATION")
    print("=" * 60)
    
    # 1. Test GET /health
    print("\n[1] Testing GET /health")
    res1 = client.get("/health")
    print(f"Status Code: {res1.status_code}")
    print(f"Response   : {res1.json()}")
    assert res1.status_code == 200, "Health check failed"
    
    # 2. Test POST /parse-job
    print("\n[2] Testing POST /parse-job")
    job_payload = {
        "job_description": "Software Developer\nRequired Skills: Python, React, Node.js, Git\nMinimum Experience: 2 years\nEducation: B.Tech"
    }
    res2 = client.post("/parse-job", json=job_payload)
    print(f"Status Code: {res2.status_code}")
    print(f"Response   : {res2.json()}")
    assert res2.status_code == 200, "Parse job failed"
    
    # 3. Test POST /match-text
    print("\n[3] Testing POST /match-text")
    match_payload = {
        "resume_text": "Senior Python Developer with 5 years of experience in React and Node.js. B.Tech in CS.",
        "job_description": "Software Developer\nRequired Skills: Python, React, Node.js\nMinimum Experience: 3 years\nEducation: B.Tech"
    }
    res3 = client.post("/match-text", json=match_payload)
    print(f"Status Code: {res3.status_code}")
    print(f"Response   : {res3.json()}")
    assert res3.status_code == 200, "Match text failed"
    
    # Locate a sample PDF file for file upload tests
    it_pdf_dir = project_root / "data" / "raw" / "resumes" / "INFORMATION-TECHNOLOGY"
    pdf_files = list(it_pdf_dir.glob("*.pdf")) + list(it_pdf_dir.glob("*.PDF"))
    
    if not pdf_files:
        print("[Warning] No IT PDF resume files found to test file upload endpoints.")
        return
        
    sample_pdf = pdf_files[0]
    print(f"\nUsing Sample PDF: {sample_pdf}")
    
    # 4. Test POST /parse-resume
    print("\n[4] Testing POST /parse-resume")
    with open(sample_pdf, "rb") as f:
        res4 = client.post(
            "/parse-resume",
            files={"file": (sample_pdf.name, f, "application/pdf")}
        )
    print(f"Status Code: {res4.status_code}")
    print(f"Response   : {res4.json()}")
    assert res4.status_code == 200, "Parse resume upload failed"
    
    # 5. Test POST /match-resume
    print("\n[5] Testing POST /match-resume")
    with open(sample_pdf, "rb") as f:
        res5 = client.post(
            "/match-resume",
            data={"job_description": "Software Developer\nRequired Skills: Python, React, SQL\nMinimum Experience: 2 years"},
            files={"file": (sample_pdf.name, f, "application/pdf")}
        )
    print(f"Status Code: {res5.status_code}")
    print(f"Response   : {res5.json()}")
    assert res5.status_code == 200, "Match resume upload failed"
    
    print("\n" + "=" * 60)
    print("ALL API ENDPOINT TESTS PASSED SUCCESSFULLY (5/5)")
    print("=" * 60)

if __name__ == "__main__":
    test_api_endpoints()
