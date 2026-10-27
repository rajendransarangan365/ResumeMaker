"""
Agent 6: Template Selection Agent
Selects the optimal ATS template from the 30 registered templates in the studio.
Considers job family, seniority, content density, and user preferences.
NEVER invents unregistered template identifiers.
"""

import time
from typing import Dict, Any, List, Tuple
from .base_agent import BaseAgent
from ..schemas.candidate import CandidateProfile
from ..schemas.job_description import JobDescriptionProfile
from ..schemas.orchestration import AgentStepLog

# Complete list of 30 registered ATS templates
REGISTERED_TEMPLATES = [
    "classic-professional", "modern-minimal", "corporate-standard",
    "technical-engineer", "software-developer", "fresher-graduate",
    "experienced-professional", "career-change", "administrative-support",
    "sales-customer-service", "electrical-instrumentation", "project-focused",
    "skills-focused", "academic-professional", "general-purpose",
    "modern-single-column", "minimal-professional", "corporate-professional",
    "graduate-entry", "technical-specialist", "senior-engineer",
    "executive-leadership", "marketing-professional", "customer-support",
    "finance-accounting", "healthcare-medical", "researcher-cv",
    "employment-gap-friendly", "international-professional", "ats-focused-hybrid"
]

class TemplateSelectionAgent(BaseAgent):
    def __init__(self, provider):
        super().__init__("TemplateSelectionAgent", provider)

    async def execute(
        self,
        candidate: CandidateProfile,
        jd: JobDescriptionProfile,
        preferred_template_id: str = None
    ) -> Tuple[str, str, AgentStepLog]:
        start_time = time.time()
        self.logger.info("Selecting optimal ATS resume template")

        # 1. Honor valid user preference
        if preferred_template_id and preferred_template_id in REGISTERED_TEMPLATES:
            duration = int((time.time() - start_time) * 1000)
            log = self.log_step("SelectTemplate", "completed", duration, f"Selected user-preferred template: '{preferred_template_id}'")
            return preferred_template_id, "Selected per candidate preference.", log

        # 2. Heuristic selection based on job family and seniority
        family_id = (jd.jobFamily or "").lower()
        seniority = (jd.seniorityLevel or "").lower()
        years_exp = len(candidate.workExperience)

        selected_id = "classic-professional"
        rationale = "Traditional single-column layout with high ATS compatibility."

        if "software" in family_id or "tech" in family_id or "developer" in jd.jobTitle.lower():
            if "senior" in seniority or years_exp >= 5:
                selected_id = "senior-engineer"
                rationale = "Engineered for technical leaders with architecture and systems scaling focus."
            else:
                selected_id = "software-developer"
                rationale = "Tailored for software engineering with tech stack and GitHub repository prominence."

        elif "ai-data" in family_id or "data" in jd.jobTitle.lower():
            selected_id = "technical-specialist"
            rationale = "Structured to emphasize analytical tools, data pipelines, and quantitative methodologies."

        elif "academic" in family_id or "education" in family_id or "research" in jd.jobTitle.lower():
            selected_id = "academic-professional"
            rationale = "Prioritizes academic credentials, research publications, and instructional curriculum."

        elif "finance" in family_id or "banking" in family_id or "account" in jd.jobTitle.lower():
            selected_id = "finance-accounting"
            rationale = "Tabular precision formatting ideal for GAAP audits, budgeting, and financial controls."

        elif "healthcare" in family_id or "nurse" in jd.jobTitle.lower() or "medical" in jd.jobTitle.lower():
            selected_id = "healthcare-medical"
            rationale = "Prominent clinical licensure, BLS/ACLS credentials, and EHR system mastery."

        elif "sales" in family_id or "marketing" in family_id:
            if "marketing" in family_id:
                selected_id = "marketing-professional"
                rationale = "Highlights campaign ROI, user acquisition, and multi-channel marketing outcomes."
            else:
                selected_id = "sales-customer-service"
                rationale = "Spotlights revenue generation, quota attainment percentages, and key client deals."

        elif "project-management" in family_id or "executive" in seniority or "director" in jd.jobTitle.lower():
            selected_id = "executive-leadership"
            rationale = "Executive presentation emphasizing P&L management, board governance, and global strategy."

        elif years_exp == 0 or "entry" in seniority or "fresher" in seniority:
            selected_id = "fresher-graduate"
            rationale = "Elevates academic projects, coursework, and foundational competencies for early career."

        else:
            selected_id = "ats-focused-hybrid"
            rationale = "Standardized hybrid layout offering maximum cross-system ATS parsing fidelity."

        # Safety validation
        if selected_id not in REGISTERED_TEMPLATES:
            selected_id = "classic-professional"

        duration = int((time.time() - start_time) * 1000)
        log = self.log_step("SelectTemplate", "completed", duration, f"Selected template '{selected_id}': {rationale}")
        return selected_id, rationale, log
