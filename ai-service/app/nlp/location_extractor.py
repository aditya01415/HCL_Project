import re

KNOWN_CITIES = [
    "Noida", "Gurugram", "Gurgaon", "Bengaluru", "Bangalore", "Hyderabad", "Pune",
    "Mumbai", "Delhi", "New Delhi", "Chennai", "Kolkata", "Ahmedabad", "Jaipur",
    "Chandigarh", "Indore", "Kochi", "Coimbatore", "Thiruvananthapuram", "Bhopal",
    "San Francisco", "New York", "London", "Austin", "Seattle", "Toronto", "Remote"
]

KNOWN_STATES_COUNTRIES = [
    "India", "USA", "UK", "Canada", "Germany", "Singapore", "Australia",
    "UP", "Haryana", "Karnataka", "Telangana", "Maharashtra", "Tamil Nadu",
    "West Bengal", "Gujarat", "Rajasthan", "Punjab", "MP", "Kerala", "CA", "NY", "TX", "WA"
]

def extract_header_location(text: str) -> str | None:
    """
    Extract location string ONLY from the resume header/contact section (first 12 lines).
    Do not infer location from job history.
    """
    if not text or not isinstance(text, str):
        return None

    lines = [line.strip() for line in text.splitlines() if line.strip()][:12]

    # Pattern 1: City, State/Country e.g. "Noida, India", "Gurugram, HR", "Bengaluru, Karnataka"
    city_state_pattern = r'\b(' + '|'.join(re.escape(c) for c in KNOWN_CITIES) + r')\s*,\s*(' + '|'.join(re.escape(s) for s in KNOWN_STATES_COUNTRIES) + r')\b'

    for line in lines:
        match = re.search(city_state_pattern, line, re.IGNORECASE)
        if match:
            city = match.group(1).title()
            state_country = match.group(2)
            if state_country.isupper() and len(state_country) <= 3:
                return f"{city}, {state_country}"
            return f"{city}, {state_country.title()}"

    # Pattern 2: Standalone City in header line e.g. "Location: Noida" or "Noida | India"
    for line in lines:
        if "location" in line.lower() or "address" in line.lower() or "|" in line or "•" in line:
            for city in KNOWN_CITIES:
                if re.search(r'\b' + re.escape(city) + r'\b', line, re.IGNORECASE):
                    return city.title()

    return None
