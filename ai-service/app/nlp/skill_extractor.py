import json
import re
from pathlib import Path

def _get_dictionaries_dir() -> Path:
    current_file = Path(__file__).resolve()
    # Path: ai-service/app/nlp/skill_extractor.py -> root: project root
    project_root = current_file.parent.parent.parent.parent
    return project_root / "data" / "dictionaries"

def load_skills_dictionary():
    dict_dir = _get_dictionaries_dir()
    skills_file = dict_dir / "skills.json"
    aliases_file = dict_dir / "skill_aliases.json"
    
    skills_data = {}
    aliases_data = {}
    
    if skills_file.exists():
        with open(skills_file, 'r', encoding='utf-8') as f:
            skills_data = json.load(f)
            
    if aliases_file.exists():
        with open(aliases_file, 'r', encoding='utf-8') as f:
            aliases_data = json.load(f)
            
    return skills_data, aliases_data

_SKILLS_DATA, _ALIASES_DATA = load_skills_dictionary()

# Build mapping of unambiguous terms to canonical skill names
_UNAMBIGUOUS_MAP = {}
for category, skills in _SKILLS_DATA.items():
    for skill in skills:
        skill_lower = skill.lower()
        if skill_lower in ["go", "swift", "r", "c", "express"]:
            continue  # Handled by strict contextual rules
        canonical = _ALIASES_DATA.get(skill_lower, skill_lower)
        _UNAMBIGUOUS_MAP[skill_lower] = canonical

for alias, target in _ALIASES_DATA.items():
    alias_lower = alias.lower()
    if alias_lower in ["go", "swift", "r", "c", "express"]:
        continue
    _UNAMBIGUOUS_MAP[alias_lower] = target.lower()

# Contextual pattern rules for ambiguous skills that are also common English words
AMBIGUOUS_SKILLS_PATTERNS = {
    'go': [
        r'(?<![a-zA-Z0-9+#.-])golang(?![a-zA-Z0-9+#.-])',
        r'(?<![a-zA-Z0-9+#.-])go\s+(?:programming|language|developer|dev|backend|microservices|code|api|sdk|framework)(?![a-zA-Z0-9+#.-])',
        r'(?<![a-zA-Z0-9+#.-])(?:golang|go)\s+programming(?![a-zA-Z0-9+#.-])',
        r'(?<![a-zA-Z0-9+#.-])(?:services|apps?|microservices|backend)\s+(?:in|using|with)\s+go(?![a-zA-Z0-9+#.-])',
        r'(?<![a-zA-Z0-9+#.-])(?:developed|built|written)\s+(?:in|using|with)\s+go(?![a-zA-Z0-9+#.-])',
        r'(?<![a-zA-Z0-9+#.-])go\s*(?:/|\s+and\s+)(?:python|java|c\+\+|rust|docker|kubernetes|postgres)(?![a-zA-Z0-9+#.-])'
    ],
    'swift': [
        r'(?<![a-zA-Z0-9+#.-])swift\s+(?:ios|programming|language|developer|dev|ui|code|app|apps|framework|sdk)(?![a-zA-Z0-9+#.-])',
        r'(?<![a-zA-Z0-9+#.-])swiftui(?![a-zA-Z0-9+#.-])',
        r'(?<![a-zA-Z0-9+#.-])(?:ios|apple)\s+(?:app|apps|development|dev)?\s*(?:using|with|in)?\s*swift(?![a-zA-Z0-9+#.-])',
        r'(?<![a-zA-Z0-9+#.-])(?:built|developed|written|applications?)\s+(?:using|in|with)\s+swift(?![a-zA-Z0-9+#.-])',
        r'(?<![a-zA-Z0-9+#.-])swift\s*(?:/|\s+and\s+)(?:objective-c|kotlin|java|xcode)(?![a-zA-Z0-9+#.-])'
    ],
    'r': [
        r'(?<![a-zA-Z0-9+#.-])r\s+(?:programming|language|studio|rstudio|stats|statistics|script|scripts|package|packages|code)(?![a-zA-Z0-9+#.-])',
        r'(?<![a-zA-Z0-9+#.-])rstudio(?![a-zA-Z0-9+#.-])',
        r'(?<![a-zA-Z0-9+#.-])(?:data analysis|data science|statistics|analytics)\s+(?:using|in|with)\s+r(?![a-zA-Z0-9+#.-])',
        r'(?<![a-zA-Z0-9+#.-])r\s*(?:,|\s+and\s+)(?:python|sas|spss|sql|matlab)(?![a-zA-Z0-9+#.-])',
        r'(?<![a-zA-Z0-9+#.-])(?:python|sas|spss|sql|matlab)\s*(?:,|\s+and\s+)\s*r(?![a-zA-Z0-9+#.-])'
    ],
    'c': [
        r'(?<![a-zA-Z0-9+#.-])c\s+(?:programming|language|developer|dev|compiler|code|library|embedded)(?![a-zA-Z0-9+#.-])',
        r'(?<![a-zA-Z0-9+#.-])(?:programming|coded|developed)\s+(?:in|using|with)\s+c(?![a-zA-Z0-9+#.-])',
        r'(?<![a-zA-Z0-9+#.-])ansi\s+c(?![a-zA-Z0-9+#.-])',
        r'(?<![a-zA-Z0-9+#.-])c\s*(?:,|\s*/\s*)\s*c\+\+(?![a-zA-Z0-9+#.-])',
        r'(?<![a-zA-Z0-9+#.-])c\s*,\s*c\+\+\s*,\s*c#(?![a-zA-Z0-9+#.-])',
        r'(?<![a-zA-Z0-9+#.-])(?:experience|proficient|knowledge)\s+in\s+c(?![a-zA-Z0-9+#.-])'
    ],
    'express.js': [
        r'(?<![a-zA-Z0-9+#.-])express\.?js(?![a-zA-Z0-9+#.-])',
        r'(?<![a-zA-Z0-9+#.-])expressjs(?![a-zA-Z0-9+#.-])',
        r'(?<![a-zA-Z0-9+#.-])express\s+js(?![a-zA-Z0-9+#.-])',
        r'(?<![a-zA-Z0-9+#.-])express\s+(?:framework|server|backend|router|api|middleware)(?![a-zA-Z0-9+#.-])',
        r'(?<![a-zA-Z0-9+#.-])node(?:\.js)?\s*(?:and|/|\+|\s+with\s+)\s*express(?![a-zA-Z0-9+#.-])',
        r'(?<![a-zA-Z0-9+#.-])express\s*(?:and|/|\+|\s+with\s+)\s*node(?:\.js)?(?![a-zA-Z0-9+#.-])',
        r'(?<![a-zA-Z0-9+#.-])mern\s+(?:stack)?(?![a-zA-Z0-9+#.-])',
        r'(?<![a-zA-Z0-9+#.-])mean\s+(?:stack)?(?![a-zA-Z0-9+#.-])'
    ]
}

def extract_skills_detailed(text: str) -> tuple[list[str], dict[str, str]]:
    """
    Extract technical skills and return both canonical skills list and matched raw phrases.
    """
    if not text or not isinstance(text, str):
        return [], {}
        
    # Remove sentence-ending dots (e.g. 'Java.' -> 'Java ')
    text_clean = re.sub(r'\.(?=\s|$)', ' ', text)
    found_matches = {}
    
    # 1. Check ambiguous skills with strict technical context requirements
    for canonical, patterns in AMBIGUOUS_SKILLS_PATTERNS.items():
        for pat in patterns:
            match = re.search(pat, text_clean, re.IGNORECASE)
            if match:
                found_matches[canonical] = match.group(0).strip()
                break
                
    # 2. Check unambiguous skills using strict boundary matching
    sorted_terms = sorted(_UNAMBIGUOUS_MAP.keys(), key=len, reverse=True)
    for term in sorted_terms:
        canonical = _UNAMBIGUOUS_MAP[term]
        if canonical in found_matches:
            continue
            
        # Prevent 'js' from matching inside 'Express JS', 'Node JS', etc.
        if term == "js":
            pattern = r'(?<![a-zA-Z0-9+#.-])(?<!express\s)(?<!react\s)(?<!node\s)(?<!vue\s)(?<!next\s)js(?![a-zA-Z0-9+#.-])'
        else:
            pattern = r'(?<![a-zA-Z0-9+#.-])' + re.escape(term) + r'(?![a-zA-Z0-9+#.-])'
            
        match = re.search(pattern, text_clean, re.IGNORECASE)
        if match:
            found_matches[canonical] = match.group(0).strip()
            
    skills_list = sorted(list(found_matches.keys()))
    return skills_list, found_matches

def extract_skills(text: str) -> list[str]:
    """
    Extract technical skills from text with false-positive suppression.
    Returns a sorted list of unique, canonical skill strings.
    """
    skills_list, _ = extract_skills_detailed(text)
    return skills_list

CATEGORY_MAP = {
    "programming_languages": {
        "python", "java", "javascript", "typescript", "c", "c++", "c#", "go", "golang",
        "rust", "ruby", "php", "swift", "kotlin", "r", "scala", "perl", "bash", "shell"
    },
    "frontend": {
        "react", "react.js", "angular", "vue", "vue.js", "next.js", "nuxt.js", "svelte",
        "html", "html5", "css", "css3", "tailwind css", "tailwind", "bootstrap", "redux",
        "webpack", "vite", "jquery", "sass", "scss", "typescript", "javascript"
    },
    "backend": {
        "node.js", "express.js", "django", "flask", "fastapi", "spring boot", "spring",
        "asp.net", "laravel", "rails", "nestjs", "graphql", "rest api", "restful api", "microservices"
    },
    "databases": {
        "mongodb", "mysql", "postgresql", "sqlite", "redis", "oracle", "sql server",
        "cassandra", "dynamodb", "elasticsearch", "firebase", "mariadb", "neo4j", "sql"
    },
    "cloud": {
        "aws", "azure", "gcp", "google cloud", "heroku", "digitalocean", "cloudflare", "serverless", "lambda"
    },
    "devops": {
        "docker", "kubernetes", "jenkins", "terraform", "ansible", "github actions", "ci/cd",
        "linux", "nginx", "apache", "helm"
    },
    "tools": {
        "git", "github", "gitlab", "bitbucket", "jira", "postman", "vs code", "figma", "npm", "yarn"
    },
    "machine_learning": {
        "machine learning", "deep learning", "scikit-learn", "tensorflow", "pytorch", "pandas",
        "numpy", "keras", "nlp", "opencv", "computer vision", "huggingface", "llm", "bert", "spacy", "nltk"
    }
}

def categorize_skills(skills_list: list[str]) -> dict[str, list[str]]:
    """
    Group canonical skills into standardized technical skill categories.
    """
    result = {
        "programming_languages": [],
        "frontend": [],
        "backend": [],
        "databases": [],
        "cloud": [],
        "devops": [],
        "tools": [],
        "machine_learning": []
    }

    if not skills_list:
        return result

    for skill in skills_list:
        s_lower = skill.lower().strip()
        placed = False
        for cat, skill_set in CATEGORY_MAP.items():
            if s_lower in skill_set:
                result[cat].append(skill)
                placed = True

        if not placed:
            # Fallback for unmapped skills into tools
            result["tools"].append(skill)

    # Sort each list
    for k in result:
        result[k] = sorted(list(set(result[k])))

    return result

