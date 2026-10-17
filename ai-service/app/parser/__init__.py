"""
Parser package for PDF, DOCX, and Resume extraction.
"""
from .pdf_parser import extract_text_from_pdf
from .docx_parser import extract_text_from_docx
from .resume_parser import parse_resume_text, parse_resume_file

__all__ = [
    "extract_text_from_pdf",
    "extract_text_from_docx",
    "parse_resume_text",
    "parse_resume_file",
]
