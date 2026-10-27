"""
Agent 2: Job Description Intelligence Agent
Analyzes Job Descriptions, extracting seniority, mandatory vs preferred skills, and domain taxonomy.
"""

import time
from typing import Dict, Any, Tuple
from .base_agent import BaseAgent
from ..schemas.job_description import JobDescriptionInput, JobDescriptionProfile
from ..schemas.orchestration import AgentStepLog
from ..retrieval.knowledge_retriever import KnowledgeRetriever

class JobDescriptionIntelligenceAgent(BaseAgent):
    def __init__(self, provider, retriever: KnowledgeRetriever):
        super().__init__("JobDescriptionIntelligenceAgent", provider)
        self.retriever = retriever

    async def execute(self, jd_input: JobDescriptionInput) -> Tuple[JobDescriptionProfile, AgentStepLog]:
        start_time = time.time()
        self.logger.info(f"Analyzing Job Description for: {jd_input.jobTitle}")

        # Retrieve relevant taxonomy
        job_family = self.retriever.find_best_job_family(jd_input.jobTitle, jd_input.rawText)
        family_name = job_family.get("displayName", "General Professional")
        family_id = job_family.get("id", "software-development")

        system_prompt = (
            "You are the Job Description Intelligence Agent.\n"
            f"The target job family is: {family_name}.\n"
            "Extract required and preferred qualifications, skills, and seniority from the job description.\n"
            "Distinguish explicitly stated requirements from inferred preferences.\n"
            "Output strictly valid JSON matching the JobDescriptionProfile schema."
        )

        user_prompt = (
            f"Job Title: {jd_input.jobTitle}\n"
            f"Company: {jd_input.companyName or 'Confidential'}\n\n"
            f"Job Description Text:\n{jd_input.rawText[:6000]}"
        )

        schema = {
            "type": "object",
            "properties": {
                "jobTitle": {"type": "string"},
                "seniorityLevel": {"type": "string"},
                "requiredSkills": {"type": "array", "items": {"type": "string"}},
                "preferredSkills": {"type": "array", "items": {"type": "string"}},
                "toolsAndTechnologies": {"type": "array", "items": {"type": "string"}},
                "mandatoryQualifications": {"type": "array", "items": {"type": "string"}},
                "preferredQualifications": {"type": "array", "items": {"type": "string"}},
                "responsibilities": {"type": "array", "items": {"type": "string"}},
                "softSkills": {"type": "array", "items": {"type": "string"}}
            },
            "required": ["jobTitle", "requiredSkills"]
        }

        try:
            data = await self.provider.generateStructured(user_prompt, schema, system_prompt)

            profile = JobDescriptionProfile(
                jobTitle=data.get("jobTitle") or jd_input.jobTitle,
                companyName=jd_input.companyName,
                jobFamily=family_id,
                seniorityLevel=data.get("seniorityLevel", "Mid-Level"),
                responsibilities=data.get("responsibilities", []),
                mandatoryQualifications=data.get("mandatoryQualifications", []),
                preferredQualifications=data.get("preferredQualifications", []),
                requiredSkills=data.get("requiredSkills", []),
                preferredSkills=data.get("preferredSkills", []),
                toolsAndTechnologies=data.get("toolsAndTechnologies", []),
                softSkills=data.get("softSkills", []),
                domainTerminology=job_family.get("skills", {}).get("domainTerminology", [])
            )

            duration = int((time.time() - start_time) * 1000)
            log = self.log_step("AnalyzeJobDescription", "completed", duration, f"Parsed JD for {profile.jobTitle} ({family_name})")
            return profile, log

        except Exception as e:
            self.logger.error(f"Error in JD Intelligence Agent: {e}")
            duration = int((time.time() - start_time) * 1000)
            log = self.log_step("AnalyzeJobDescription", "failed", duration, str(e))
            
            fallback_profile = JobDescriptionProfile(
                jobTitle=jd_input.jobTitle,
                companyName=jd_input.companyName,
                jobFamily=family_id,
                seniorityLevel="Mid-Level",
                requiredSkills=["Problem Solving", "Communication", "Technical Acumen"],
                preferredSkills=["Collaboration", "Continuous Learning"]
            )
            return fallback_profile, log
