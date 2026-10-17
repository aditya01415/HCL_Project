import sys
import unittest
from pathlib import Path

# Add ai-service to sys.path
test_dir = Path(__file__).resolve().parent
project_root = test_dir.parent.parent
ai_service_dir = project_root / "ai-service"
sys.path.append(str(ai_service_dir))

from app.scoring.semantic_score import calculate_semantic_similarity
from app.scoring.skill_score import calculate_skill_score
from app.scoring.experience_score import calculate_experience_score
from app.scoring.education_score import calculate_education_score
from app.scoring.match_score import calculate_match_score

class TestMatchingPipeline(unittest.TestCase):

    # 1. Semantic Similarity Tests
    def test_identical_texts_high_similarity(self):
        text = "Experienced Senior Python Developer with Django and React experience."
        res = calculate_semantic_similarity(text, text)
        self.assertGreaterEqual(res["semantic_score"], 95.0)

    def test_unrelated_texts_lower_similarity(self):
        text1 = "Senior Python Backend Engineer building REST microservices in FastAPI."
        text2 = "Certified Chef specializing in Italian cuisine, pastries, and kitchen management."
        res = calculate_semantic_similarity(text1, text2)
        self.assertLess(res["semantic_score"], 50.0)

    # 2. Skill Match Score Tests
    def test_full_skill_match(self):
        cand_skills = ["python", "react", "node.js"]
        req_skills = ["python", "react", "node.js"]
        res = calculate_skill_score(cand_skills, req_skills)
        self.assertEqual(res["skill_score"], 100.0)
        self.assertEqual(len(res["missing_skills"]), 0)

    def test_partial_skill_match(self):
        cand_skills = ["python", "git"]
        req_skills = ["python", "react", "node.js", "git"]
        res = calculate_skill_score(cand_skills, req_skills)
        self.assertEqual(res["skill_score"], 50.0)
        self.assertEqual(res["matched_skills"], ["git", "python"])
        self.assertEqual(res["missing_skills"], ["node.js", "react"])

    # 3. Experience Match Score Tests
    def test_missing_candidate_experience_returns_zero(self):
        score = calculate_experience_score(candidate_years=None, required_years=3)
        self.assertEqual(score, 0.0)

    def test_candidate_experience_meets_or_exceeds_required(self):
        score1 = calculate_experience_score(candidate_years=5, required_years=3)
        score2 = calculate_experience_score(candidate_years=3, required_years=3)
        self.assertEqual(score1, 100.0)
        self.assertEqual(score2, 100.0)

    def test_proportional_experience_score(self):
        score = calculate_experience_score(candidate_years=2, required_years=4)
        self.assertEqual(score, 50.0)

    # 4. Education Match Score Tests
    def test_no_education_requirement_returns_hundred(self):
        score = calculate_education_score(candidate_education=["B.Tech"], required_education=[])
        self.assertEqual(score, 100.0)

    def test_matching_degree_returns_hundred(self):
        score = calculate_education_score(candidate_education=["B.Tech"], required_education=["B.Tech", "B.E."])
        self.assertEqual(score, 100.0)

    def test_non_matching_degree_returns_zero(self):
        score = calculate_education_score(candidate_education=["B.Sc"], required_education=["MBA"])
        self.assertEqual(score, 0.0)

    # 5. Overall Match Score Test
    def test_overall_match_score_calculation(self):
        resume_text = "Senior Python Developer with 5 years of experience in Django and REST APIs. B.Tech in CS."
        job_desc = "Software Engineer\nRequired Skills: Python, Django, REST API\nMinimum Experience: 3 years\nEducation: B.Tech"
        res = calculate_match_score(resume_text, job_desc)
        self.assertIn("final_score", res)
        self.assertGreater(res["final_score"], 70.0)

if __name__ == "__main__":
    unittest.main()
