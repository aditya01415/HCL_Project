import os
import glob
from pathlib import Path
import pandas as pd

def inspect_dataset():
    # Resolve paths relative to project root
    script_dir = Path(__file__).resolve().parent
    project_root = script_dir.parent.parent
    
    csv_path = project_root / "data" / "raw" / "csv" / "Resume.csv"
    resumes_dir = project_root / "data" / "raw" / "resumes"
    
    print("=" * 60)
    print("AI RESUME SCREENING - DATASET INSPECTION REPORT")
    print("=" * 60)
    
    # 1. Inspect CSV Dataset
    print("\n[1] INSPECTING CSV DATASET...")
    if not csv_path.exists():
        print(f"  [ERROR] CSV file not found at: {csv_path}")
    else:
        try:
            df = pd.read_csv(csv_path)
            print(f"  File: {csv_path.name}")
            print(f"  Dataset Shape: {df.shape[0]} rows, {df.shape[1]} columns")
            print(f"  Exact Column Names: {list(df.columns)}")
            print("\n  Data Types:")
            for col, dtype in df.dtypes.items():
                print(f"    - {col}: {dtype}")
            
            print("\n  Missing Values per Column:")
            for col, null_cnt in df.isnull().sum().items():
                print(f"    - {col}: {null_cnt}")
            
            duplicate_count = df.duplicated().sum()
            print(f"\n  Duplicate Rows Count: {duplicate_count}")
            
            print("\n  First 3 Rows Sample:")
            print(df.head(3))
            
            if 'Category' in df.columns:
                print(f"\n  Total Unique Categories: {df['Category'].nunique()}")
                print("\n  Category Distribution (CSV):")
                cat_counts = df['Category'].value_counts()
                for cat, count in cat_counts.items():
                    print(f"    - {cat}: {count}")
        except Exception as e:
            print(f"  [ERROR] Failed to read CSV: {e}")
            
    # 2. Inspect PDF Resumes Directory
    print("\n[2] INSPECTING PDF RESUMES DIRECTORY...")
    if not resumes_dir.exists():
        print(f"  [ERROR] Resumes directory not found at: {resumes_dir}")
    else:
        categories = [d for d in os.listdir(resumes_dir) if (resumes_dir / d).is_dir()]
        categories.sort()
        print(f"  Total Category Folders: {len(categories)}")
        print("\n  PDF Count per Category:")
        total_pdfs = 0
        for cat in categories:
            cat_path = resumes_dir / cat
            pdfs = list(cat_path.glob("*.pdf")) + list(cat_path.glob("*.PDF"))
            count = len(pdfs)
            total_pdfs += count
            print(f"    - {cat}: {count} PDFs")
        print(f"\n  Total PDF Resumes Count: {total_pdfs}")
        
    print("\n" + "=" * 60)
    print("INSPECTION COMPLETE")
    print("=" * 60)

if __name__ == "__main__":
    inspect_dataset()
