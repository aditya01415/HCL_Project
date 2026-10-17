import re
import pandas as pd

def clean_text(text: str) -> str:
    """
    Clean and normalize resume text for AI processing.
    
    Operations:
    - Safe handling of null / NaN / non-string values
    - Lowercase conversion
    - URL removal
    - Email address removal
    - Unnecessary symbol removal while preserving technical skill symbols (+ # . -)
    - Whitespace normalization
    """
    if text is None or pd.isna(text) or not isinstance(text, str):
        return ""
    
    # 1. Convert to lowercase
    cleaned = text.lower()
    
    # 2. Remove HTML tags if present
    cleaned = re.sub(r'<[^>]+>', ' ', cleaned)
    
    # 3. Remove URLs
    cleaned = re.sub(r'https?://\S+|www\.\S+', ' ', cleaned)
    
    # 4. Remove Email Addresses
    cleaned = re.sub(r'\S+@\S+', ' ', cleaned)
    
    # 5. Remove unnecessary symbols while preserving + # . - and alphanumeric/whitespace
    cleaned = re.sub(r'[^a-z0-9\s+#.-]', ' ', cleaned)
    
    # 6. Normalize whitespace (tabs, newlines, multiple spaces -> single space)
    cleaned = re.sub(r'\s+', ' ', cleaned).strip()
    
    return cleaned
