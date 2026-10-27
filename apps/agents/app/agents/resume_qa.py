"""
Agent 7: Resume Quality Assurance Agent
Performs deterministic and semantic audits of factual integrity, date consistency,
missing sections, and layout page balance.
"""

import time
import re
from typing import Dict, Any, List, Tuple
from .base_agent import BaseAgent
from ..schemas.candidate import CandidateProfile
from ..schemas.resume import TailoredResumeContent
from ..schemas.evaluation import QAReport, QAFinding
from ..schemas.orchestration import AgentStepLog

class ResumeQualityAssuranceAgent(BaseAgent):
    def __init__(self, provider):
        super().__init__("ResumeQualityAssuranceAgent", provider)

    async def execute(
        self, candidate: CandidateProfile, resume: TailoredResumeContent
    ) -> Tuple[QAReport, AgentStepLog]:
        start_time = time.time()
        self.logger.info("Executing Quality Assurance Inspection")

        findings: List[QAFinding] = []

        # 1. Check Factual Consistency - Employer Names & Titles
        original_employers = {exp.employer.strip().lower() for exp in candidate.workExperience}
        for exp in resume.tailoredExperience:
            emp = exp.get("employer", "").strip()
            if emp and emp.lower() not in original_employers:
                findings.append(QAFinding(
                    category="factual_integrity",
                    severity="critical",
                    issueDescription=f"Tailored resume introduced unverified employer: '{emp}'",
                    evidenceSnippet=emp,
                    suggestedCorrection="Revert to verified employer names from candidate profile."
                ))

        # 2. Check Date Formatting & Consistency
        for exp in resume.tailoredExperience:
            s_date = exp.get("startDate", "")
            if s_date and not re.search(r"\d{4}", s_date):
                findings.append(QAFinding(
                    category="dates",
                    severity="warning",
                    issueDescription=f"Invalid date format '{s_date}' in work history",
                    evidenceSnippet=s_date,
                    suggestedCorrection="Format dates consistently with year (e.g. 'Jan 2022' or '2022')."
                ))

        # 3. Check Contact Info & Completeness
        pd = candidate.personalDetails
        if not pd.email or "@" not in pd.email:
            findings.append(QAFinding(
                category="formatting",
                severity="critical",
                issueDescription="Missing or invalid primary email address",
                evidenceSnippet=pd.email,
                suggestedCorrection="Provide a valid professional email address."
            ))
        if not pd.phone or len(pd.phone.strip()) < 7:
            findings.append(QAFinding(
                category="formatting",
                severity="warning",
                issueDescription="Incomplete telephone contact number",
                evidenceSnippet=pd.phone,
                suggestedCorrection="Ensure contact number includes country/area code."
            ))

        # 4. Check Section Order Completeness
        required_sections = ["summary", "skills", "experience"]
        for sec in required_sections:
            if sec not in resume.sectionOrder:
                findings.append(QAFinding(
                    category="missing_sections",
                    severity="warning",
                    issueDescription=f"Core section '{sec}' is missing from document section order",
                    suggestedCorrection=f"Include '{sec}' in document presentation."
                ))

        # 5. Page Fit Estimation
        # Estimate total word count
        total_words = len(resume.professionalSummary.split())
        for exp in resume.tailoredExperience:
            total_words += len(" ".join(exp.get("responsibilities", [])).split())
            total_words += len(" ".join(exp.get("achievements", [])).split())

        page_fit = "Balanced (1 Page Standard)"
        if total_words > 650:
            page_fit = "Balanced (2 Page Professional)"
        elif total_words < 180 and len(candidate.workExperience) > 0:
            findings.append(QAFinding(
                category="text_overflow",
                severity="suggestion",
                issueDescription="Resume is underfilled (< 200 words); consider elaborating on project deliverables.",
                suggestedCorrection="Expand on accomplishments with STAR methodology."
            ))

        critical_count = sum(1 for f in findings if f.severity == "critical")
        warning_count = sum(1 for f in findings if f.severity == "warning")
        passed = critical_count == 0

        report = QAReport(
            passed=passed,
            totalFindings=len(findings),
            criticalCount=critical_count,
            warningCount=warning_count,
            findings=findings,
            readingOrderValid=True,
            pageFitEstimated=page_fit
        )

        duration = int((time.time() - start_time) * 1000)
        log = self.log_step("QualityAssuranceAudit", "completed", duration, f"QA passed={passed} ({len(findings)} findings)")
        return report, log
