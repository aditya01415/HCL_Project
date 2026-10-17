import pymupdf
from pathlib import Path

def extract_text_from_pdf(file_path: str | Path) -> str:
    """
    Extract text content from a PDF document using PyMuPDF.
    """
    file_path = str(file_path)
    text = ""
    try:
        doc = pymupdf.open(file_path)
        for page in doc:
            page_text = page.get_text()
            if page_text:
                text += page_text + "\n"
        doc.close()
    except Exception as e:
        print(f"[Error] Failed to extract text from PDF '{file_path}': {e}")
    return text.strip()
