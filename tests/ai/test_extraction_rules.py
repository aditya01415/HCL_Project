import sys
import unittest
from pathlib import Path

# Add ai-service to sys.path
test_dir = Path(__file__).resolve().parent
project_root = test_dir.parent.parent
ai_service_dir = project_root / "ai-service"
sys.path.append(str(ai_service_dir))

from app.nlp.skill_extractor import extract_skills
from app.nlp.experience_extractor import extract_years_experience

class TestExtractionRules(unittest.TestCase):

    # --- SKILL EXTRACTION TESTS ---

    def test_express_not_detected_in_hr_context(self):
        text = "I want to express my interest in this HR position"
        skills = extract_skills(text)
        self.assertNotIn("express.js", skills)

    def test_swift_not_detected_in_communication_context(self):
        text = "Excellent swift communication and leadership"
        skills = extract_skills(text)
        self.assertNotIn("swift", skills)

    def test_go_not_detected_in_general_english(self):
        text = "We need to go through employee records"
        skills = extract_skills(text)
        self.assertNotIn("go", skills)

    def test_node_and_express_js(self):
        text = "Built REST APIs using Node.js and Express.js"
        skills = extract_skills(text)
        self.assertIn("node.js", skills)
        self.assertIn("express.js", skills)

    def test_nodejs_and_express_js_aliases(self):
        text = "Backend development using NodeJS and Express JS"
        skills = extract_skills(text)
        self.assertIn("node.js", skills)
        self.assertIn("express.js", skills)

    def test_go_language_context(self):
        text = "Developed microservices using Go programming language"
        skills = extract_skills(text)
        self.assertIn("go", skills)

    def test_swift_ios_context(self):
        text = "Built iOS applications using Swift"
        skills = extract_skills(text)
        self.assertIn("swift", skills)

    def test_java_and_javascript(self):
        text = "Experience with Java and JavaScript"
        skills = extract_skills(text)
        self.assertIn("java", skills)
        self.assertIn("javascript", skills)

    def test_c_cpp_csharp(self):
        text = "Experience in C, C++, C#"
        skills = extract_skills(text)
        self.assertIn("c", skills)
        self.assertIn("c++", skills)
        self.assertIn("c#", skills)

    # --- EXPERIENCE EXTRACTION TESTS ---

    def test_exp_3_years_software_dev(self):
        text = "3 years of experience in software development"
        self.assertEqual(extract_years_experience(text), 3)

    def test_exp_5_plus_years_java(self):
        text = "5+ years experience in Java"
        self.assertEqual(extract_years_experience(text), 5)

    def test_exp_total_7_years(self):
        text = "Total experience: 7 years"
        self.assertEqual(extract_years_experience(text), 7)

    def test_exp_managed_employees_none(self):
        text = "Managed 20 employees"
        self.assertIsNone(extract_years_experience(text))

    def test_exp_graduated_year_none(self):
        text = "Graduated in 2020"
        self.assertIsNone(extract_years_experience(text))

    def test_exp_worked_years_range_none(self):
        text = "Worked from 2018 to 2022"
        self.assertIsNone(extract_years_experience(text))

    def test_exp_projects_completed_none(self):
        text = "15 projects completed"
        self.assertIsNone(extract_years_experience(text))

if __name__ == "__main__":
    unittest.main()
