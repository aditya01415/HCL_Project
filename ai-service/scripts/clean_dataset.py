import os
import sys
from pathlib import Path
import pandas as pd

# Add app package to sys.path to import nlp module
script_dir = Path(__file__).resolve().parent
project_root = script_dir.parent.parent
ai_service_dir = script_dir.parent
sys.path.append(str(ai_service_dir))

from app.nlp.preprocessing import clean_text

def clean_dataset():
    raw_csv_path = project_root / "data" / "raw" / "csv" / "Resume.csv"
    output_dir = project_root / "data" / "processed"
    output_csv_path = output_dir / "resumes_clean.csv"
    
    print("=" * 60)
    print("AI RESUME SCREENING - CLEANING DATASET")
    print("=" * 60)
    
    if not raw_csv_path.exists():
        print(f"[ERROR] Raw dataset CSV not found at: {raw_csv_path}")
        return
    
    print(f"Reading raw dataset from: {raw_csv_path}")
    df = pd.read_csv(raw_csv_path)
    print(f"Loaded {len(df)} rows and {len(df.columns)} columns: {list(df.columns)}")
    
    # Automatically detect resume text column
    candidate_cols = ['Resume_str', 'Resume', 'resume_text', 'Resume_html', 'text']
    target_col = None
    for col in candidate_cols:
        if col in df.columns:
            target_col = col
            break
            
    if not target_col:
        print(f"[ERROR] Could not detect resume text column from candidates: {candidate_cols}")
        return
        
    print(f"Detected resume text column: '{target_col}'")
    print("Applying text cleaning transformation...")
    
    # Clean the target text column
    df['clean_resume'] = df[target_col].apply(clean_text)
    
    # Streamline columns to remove raw HTML noise
    keep_cols = [col for col in ['ID', 'Category', 'clean_resume'] if col in df.columns]
    clean_df = df[keep_cols]
    
    # Ensure processed directory exists
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Save processed dataframe (never overwriting raw Resume.csv)
    clean_df.to_csv(output_csv_path, index=False)
    print(f"Cleaned dataset successfully saved to: {output_csv_path}")
    print(f"Processed Dataset Shape: {clean_df.shape[0]} rows, {clean_df.shape[1]} columns")
    print(f"Columns present in output CSV: {list(clean_df.columns)}")
    print("=" * 60)

if __name__ == "__main__":
    clean_dataset()
