import re

CERT_HEADINGS = [
    "CERTIFICATIONS", "CERTIFICATES", "LICENSES & CERTIFICATIONS", "LICENSES AND CERTIFICATIONS"
]

NEXT_HEADINGS = [
    "ACHIEVEMENTS", "DECLARATION", "HOBBIES", "INTERESTS", "PROJECTS", "EDUCATION", "SKILLS"
]

def extract_certifications(text: str) -> list[str]:
    """
    Extract certifications list from resume text.
    """
    if not text or not isinstance(text, str):
        return []

    lines = [line.strip() for line in text.splitlines()]

    start_idx = -1
    for idx, line in enumerate(lines):
        upper = line.upper().rstrip(':').strip()
        if upper in CERT_HEADINGS:
            start_idx = idx
            break

    if start_idx == -1:
        # Fallback regex for common certifications
        certs = set()
        patterns = [
            r'\b(?:AWS Certified\s+[A-Za-z\s]+|AWS\s+[A-Za-z\s]+Certification)\b',
            r'\b(?:Google Cloud Certified\s+[A-Za-z\s]+)\b',
            r'\b(?:Microsoft Certified\s+[A-Za-z\s]+|Azure\s+[A-Za-z\s]+Fundamentals)\b',
            r'\b(?:Certified Kubernetes Developer|CKAD|CKA)\b',
            r'\b(?:Oracle Certified Professional|OCP)\b'
        ]
        for pat in patterns:
            match = re.search(pat, text, re.IGNORECASE)
            if match:
                certs.add(match.group(0).strip())
        return sorted(list(certs))

    cert_lines = []
    for line in lines[start_idx + 1:]:
        if not line:
            continue
        upper = line.upper().rstrip(':').strip()
        if upper in NEXT_HEADINGS or upper in ["WORK EXPERIENCE", "EXPERIENCE"]:
            break
        cleaned = re.sub(r'^[•\-\*\d+\.]\s*', '', line).strip()
        if cleaned and len(cleaned) >= 3:
            cert_lines.append(cleaned)

    return cert_lines
