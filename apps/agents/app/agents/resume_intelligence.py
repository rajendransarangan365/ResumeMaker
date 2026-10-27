"""
Agent 1: Resume Intelligence Agent
Extracts structured candidate profiles from raw text while strictly forbidding hallucination.
"""

import time
import re
from typing import Dict, Any, Tuple
from .base_agent import BaseAgent
from ..schemas.candidate import CandidateProfile, PersonalDetails, Skills, WorkExperience, Education
from ..schemas.orchestration import AgentStepLog

class ResumeIntelligenceAgent(BaseAgent):
    def __init__(self, provider):
        super().__init__("ResumeIntelligenceAgent", provider)

    async def execute(self, raw_resume_text: str) -> Tuple[CandidateProfile, AgentStepLog]:
        start_time = time.time()
        self.logger.info("Executing Resume Intelligence Extraction")

        system_prompt = (
            "You are the Resume Intelligence Agent in the ATS Studio.\n"
            "CRITICAL ANTI-HALLUCINATION RULES:\n"
            "1. Extract ONLY facts explicitly attested in the candidate's resume text.\n"
            "2. NEVER invent degrees, certifications, companies, or dates.\n"
            "3. Output strictly valid JSON matching the CandidateProfile schema.\n"
        )

        user_prompt = f"Extract structured candidate profile from this text:\n\n{raw_resume_text[:8000]}"

        schema = {
            "type": "object",
            "properties": {
                "personalDetails": {
                    "type": "object",
                    "properties": {
                        "fullName": {"type": "string"},
                        "email": {"type": "string"},
                        "phone": {"type": "string"},
                        "headline": {"type": "string"}
                    },
                    "required": ["fullName", "email", "phone"]
                },
                "professionalSummary": {"type": "string"},
                "workExperience": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "jobTitle": {"type": "string"},
                            "employer": {"type": "string"},
                            "startDate": {"type": "string"},
                            "endDate": {"type": "string"},
                            "responsibilities": {"type": "array", "items": {"type": "string"}},
                            "achievements": {"type": "array", "items": {"type": "string"}}
                        },
                        "required": ["jobTitle", "employer", "startDate"]
                    }
                },
                "education": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "degree": {"type": "string"},
                            "fieldOfStudy": {"type": "string"},
                            "institution": {"type": "string"},
                            "graduationDate": {"type": "string"}
                        },
                        "required": ["degree", "institution"]
                    }
                },
                "skills": {
                    "type": "object",
                    "properties": {
                        "technicalSkills": {"type": "array", "items": {"type": "string"}},
                        "jobSkills": {"type": "array", "items": {"type": "string"}},
                        "computerSkills": {"type": "array", "items": {"type": "string"}}
                    }
                }
            },
            "required": ["personalDetails"]
        }

        try:
            result_dict = await self.provider.generateStructured(user_prompt, schema, system_prompt)
            # Ensure personalDetails defaults
            pd_data = result_dict.get("personalDetails", {})
            if not pd_data.get("fullName"):
                name_match = re.search(r"([A-Z][a-z]+ [A-Z][a-z]+)", raw_resume_text)
                pd_data["fullName"] = name_match.group(1) if name_match else "Candidate Name"
            if not pd_data.get("email"):
                email_match = re.search(r"[\w\.-]+@[\w\.-]+\.\w+", raw_resume_text)
                pd_data["email"] = email_match.group(0) if email_match else "candidate@example.com"
            if not pd_data.get("phone"):
                phone_match = re.search(r"(\+?\d[\d\s\-\(\)]{8,}\d)", raw_resume_text)
                pd_data["phone"] = phone_match.group(0) if phone_match else "+1 (555) 000-0000"

            personal = PersonalDetails(**pd_data)
            skills = Skills(**result_dict.get("skills", {}))

            work_exp = [WorkExperience(**exp) for exp in result_dict.get("workExperience", [])]
            edu = [Education(**ed) for ed in result_dict.get("education", [])]

            profile = CandidateProfile(
                personalDetails=personal,
                professionalSummary=result_dict.get("professionalSummary"),
                workExperience=work_exp,
                education=edu,
                skills=skills,
                rawExtractedText=raw_resume_text[:2000]
            )

            duration = int((time.time() - start_time) * 1000)
            log = self.log_step("ExtractCandidateProfile", "completed", duration, f"Extracted candidate profile: {personal.fullName}")
            return profile, log

        except Exception as e:
            self.logger.error(f"Error in Resume Intelligence Agent: {e}")
            duration = int((time.time() - start_time) * 1000)
            log = self.log_step("ExtractCandidateProfile", "failed", duration, str(e))
            
            # Fallback profile
            fallback_profile = CandidateProfile(
                personalDetails=PersonalDetails(
                    fullName="Candidate Profile",
                    email="candidate@example.com",
                    phone="+1 (555) 000-0000",
                    headline="Professional"
                ),
                rawExtractedText=raw_resume_text[:2000]
            )
            return fallback_profile, log
