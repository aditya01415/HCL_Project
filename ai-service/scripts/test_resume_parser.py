import glob
import json
import re
import sys
from pathlib import Path
import pandas as pd

# Add ai-service to sys.path to allow imports from app
script_dir = Path(__file__).resolve().parent
ai_service_dir = script_dir.parent
project_root = ai_service_dir.parent

sys.path.append(str(ai_service_dir))

from app.parser.pdf_parser import extract_text_from_pdf
from app.parser.resume_parser import parse_resume_file, parse_resume_text

def get_context_snippet(full_text: str, phrase: str, window: int = 100) -> str | None:
    """
    Extract ~window characters before and after the matched phrase from original text for debugging.
    """
    if not full_text or not phrase or not isinstance(full_text, str):
        return None
    match = re.search(re.escape(phrase), full_text, re.IGNORECASE)
    if not match:
        return None
    start = max(0, match.start() - window)
    end = min(len(full_text), match.end() + window)
    snippet = full_text[start:end].replace('\n', ' ')
    prefix = "..." if start > 0 else ""
    suffix = "..." if end < len(full_text) else ""
    return prefix + snippet + suffix

def main():
    print("=" * 60)
    print("AI RESUME SCREENING - TEST RESUME PARSER (WITH CONTEXT SNIPPETS)")
    print("=" * 60)
    
    # Step 1: Find a PDF in data/raw/resumes/
    resumes_dir = project_root / "data" / "raw" / "resumes"
    pdf_pattern = str(resumes_dir / "**" / "*.pdf")
    pdf_files = glob.glob(pdf_pattern, recursive=True)
    
    if not pdf_files:
        print(f"[Error] No PDF files found under: {resumes_dir}")
    else:
        sample_pdf = pdf_files[0]
        print(f"\n1. Parsing PDF File: {sample_pdf}\n")
        pdf_raw_text = extract_text_from_pdf(sample_pdf)
        parsed_pdf = parse_resume_file(sample_pdf)
        
        exp_phrase = parsed_pdf['matched_experience_phrase']
        snippet = get_context_snippet(pdf_raw_text, exp_phrase) if exp_phrase else None
        
        print("Candidate Resume Parsed")
        print("-----------------------")
        print(f"Email: {parsed_pdf['email']}")
        print(f"Phone: {parsed_pdf['phone']}")
        print(f"GitHub: {parsed_pdf['github']}")
        print(f"LinkedIn: {parsed_pdf['linkedin']}")
        print(f"\nSkills: {parsed_pdf['skills']}")
        print(f"Skill Matches:\n{json.dumps(parsed_pdf['skill_matches'], indent=4)}")
        print(f"\nEducation: {parsed_pdf['education']}")
        print(f"Years Experience: {parsed_pdf['years_experience']}")
        print(f"Matched Experience Phrase: \"{exp_phrase}\"")
        if snippet:
            print(f"Context Snippet (~100 chars before/after):\n  \"{snippet}\"")

    # Step 2: Read sample rows from data/processed/resumes_clean.csv
    processed_csv = project_root / "data" / "processed" / "resumes_clean.csv"
    print("\n" + "=" * 60)
    print("2. Testing Skill & Experience Extraction on CSV Samples")
    print("=" * 60)
    
    if not processed_csv.exists():
        print(f"[Error] Processed CSV not found at: {processed_csv}")
    else:
        df = pd.read_csv(processed_csv)
        print(f"Loaded {len(df)} rows. Testing first 3 samples:\n")
        
        for idx in range(min(3, len(df))):
            row = df.iloc[idx]
            cat = row.get("Category", "Unknown")
            clean_text = str(row.get("clean_resume", ""))
            raw_text = str(row.get("Resume_str", ""))
            parsed_full = parse_resume_text(clean_text)
            
            exp_phrase = parsed_full['matched_experience_phrase']
            # Search in raw text first, fallback to clean text if needed
            snippet = get_context_snippet(raw_text, exp_phrase) or get_context_snippet(clean_text, exp_phrase) if exp_phrase else None
            
            print(f"--- Sample {idx + 1} (Category: {cat}) ---")
            print(f"ID: {row.get('ID')}")
            print(f"Extracted Skills: {parsed_full['skills']}")
            print(f"Skill Matches: {json.dumps(parsed_full['skill_matches'])}")
            print(f"Extracted Education: {parsed_full['education']}")
            print(f"Years Experience: {parsed_full['years_experience']}")
            print(f"Matched Experience Phrase: \"{exp_phrase}\"")
            if snippet:
                print(f"Context Snippet (~100 chars before/after):\n  \"{snippet}\"\n")
            else:
                print()

if __name__ == "__main__":
    main()
