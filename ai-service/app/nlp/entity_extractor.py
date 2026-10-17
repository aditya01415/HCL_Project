import re

def extract_email(text: str) -> str | None:
    """
    Extract email address from text using regex.
    Returns the lowercased email string, or None if not found.
    """
    if not text or not isinstance(text, str):
        return None
    match = re.search(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b', text)
    return match.group(0).lower() if match else None

def extract_phone(text: str) -> str | None:
    """
    Extract phone number from text using regex.
    Returns the matched phone number string, or None if not found.
    """
    if not text or not isinstance(text, str):
        return None
    # Matches common phone number formats: +1-555-123-4567, (555) 123-4567, 555-123-4567, etc.
    match = re.search(r'(?:\+?\d{1,3}[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}\b', text)
    return match.group(0).strip() if match else None

def extract_github(text: str) -> str | None:
    """
    Extract GitHub profile URL or username link from text using regex.
    Returns the matched GitHub URL or profile reference, or None if not found.
    """
    if not text or not isinstance(text, str):
        return None
    match = re.search(r'(?:https?://)?(?:www\.)?github\.com/[A-Za-z0-9_-]+', text, re.IGNORECASE)
    return match.group(0) if match else None

def extract_linkedin(text: str) -> str | None:
    """
    Extract LinkedIn profile URL from text using regex.
    Returns the matched LinkedIn URL, or None if not found.
    """
    if not text or not isinstance(text, str):
        return None
    match = re.search(r'(?:https?://)?(?:www\.)?linkedin\.com/(?:in|pub|profile)/[A-Za-z0-9_-]+', text, re.IGNORECASE)
    return match.group(0) if match else None
