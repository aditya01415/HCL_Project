import glob
import sys
from pathlib import Path

# Add ai-service directory to sys.path
script_dir = Path(__file__).resolve().parent
ai_service_dir = script_dir.parent
project_root = ai_service_dir.parent

sys.path.append(str(ai_service_dir))

from app.parser.pdf_parser import extract_text_from_pdf
from app.parser.resume_parser import parse_resume_text
from app.nlp.job_description_parser import parse_job_description
from app.nlp.skill_extractor import extract_skills
from app.scoring.match_score import calculate_match_score

SAMPLE_JOB_DESCRIPTION = """Software Developer

Required Skills:
Python, JavaScript, React, Node.js, MongoDB, REST API, Git

Minimum Experience:
2 years

Education:
B.Tech or B.E.

Preferred Skills:
AWS, Docker

We are looking for a software developer who can build scalable web applications and REST APIs."""

TARGET_SKILLS = {"python", "javascript", "react", "node.js", "mongodb", "rest api", "git"}

def find_best_it_resume() -> tuple[Path | None, int, int]:
    it_dir = project_root / "data" / "raw" / "resumes" / "INFORMATION-TECHNOLOGY"
    pdf_files = list(it_dir.glob("*.pdf")) + list(it_dir.glob("*.PDF"))
    
    if not pdf_files:
        return None, 0, 0
        
    best_pdf = None
    max_matched_count = -1
    total_checked = len(pdf_files)
    
    for pdf in pdf_files:
        try:
            text = extract_text_from_pdf(pdf)
            cand_skills = set(extract_skills(text))
            matched_count = len(cand_skills.intersection(TARGET_SKILLS))
            if matched_count > max_matched_count:
                max_matched_count = matched_count
                best_pdf = pdf
        except Exception:
            pass
            
    return best_pdf, total_checked, max_matched_count

def get_unrelated_resume() -> Path | None:
    unrel_dir = project_root / "data" / "raw" / "resumes" / "AGRICULTURE"
    pdf_files = list(unrel_dir.glob("*.pdf")) + list(unrel_dir.glob("*.PDF"))
    if pdf_files:
        return pdf_files[0]
    return None

def run_test(test_label: str, pdf_path: Path, extra_info: str | None = None):
    print("=" * 60)
    print(f" {test_label}")
    print("=" * 60)
    
    if extra_info:
        print(extra_info)
        print("-" * 60)
        
    category = pdf_path.parent.name
    resume_text = extract_text_from_pdf(pdf_path)
    
    candidate_parsed = parse_resume_text(resume_text)
    jd_parsed = parse_job_description(SAMPLE_JOB_DESCRIPTION)
    
    match_res = calculate_match_score(resume_text, SAMPLE_JOB_DESCRIPTION)
    
    cand_exp = f"{candidate_parsed['years_experience']} years" if candidate_parsed['years_experience'] is not None else "None"
    req_exp = f"{jd_parsed['minimum_experience']} years" if jd_parsed['minimum_experience'] is not None else "None"
    
    print(f"Resume file used    : {pdf_path}")
    print(f"Resume category    : {category}")
    print("-" * 60)
    print(f"Candidate Skills   : {match_res['candidate_skills']}")
    print(f"Required Skills    : {match_res['required_skills']}")
    print(f"Matched Skills     : {match_res['matched_skills']}")
    print(f"Missing Skills     : {match_res['missing_skills']}")
    print("-" * 60)
    print(f"Candidate Experience: {cand_exp}")
    print(f"Required Experience : {req_exp}")
    print("-" * 60)
    print(f"Candidate Education : {candidate_parsed['education']}")
    print(f"Required Education  : {jd_parsed['education']}")
    print("-" * 60)
    print(f"Semantic Score     : {match_res['semantic_score']} / 100")
    print(f"Skill Score        : {match_res['skill_score']} / 100")
    print(f"Experience Score   : {match_res['experience_score']} / 100")
    print(f"Education Score    : {match_res['education_score']} / 100")
    print("=" * 60)
    print(f"FINAL MATCH SCORE  : {match_res['final_score']} / 100")
    print("=" * 60 + "\n")

def main():
    print("=" * 60)
    print("AI RESUME SCREENING - MATCHING VALIDATION")
    print("=" * 60 + "\n")
    
    # TEST 1: Find best IT candidate
    best_it_pdf, total_checked, max_matches = find_best_it_resume()
    if not best_it_pdf:
        print("[Error] No IT resumes found.")
        return
        
    it_info = f"Number of IT resumes checked       : {total_checked}\nBest candidate matched skill count: {max_matches}"
    run_test("TEST 1 — Relevant Candidate", best_it_pdf, extra_info=it_info)
    
    # TEST 2: Find Agriculture candidate
    unrel_pdf = get_unrelated_resume()
    if not unrel_pdf:
        print("[Error] No Agriculture resume found.")
        return
        
    run_test("TEST 2 — Unrelated Candidate", unrel_pdf)

if __name__ == "__main__":
    main()
