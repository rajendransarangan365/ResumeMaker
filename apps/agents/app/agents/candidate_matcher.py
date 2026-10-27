"""
Agent 3: Candidate-Job Matching Agent
Strict Evidence-Based Matching Engine.
Produces tri-state classifications: Supported, Partially Supported, Missing.
"""

import time
import re
from typing import Dict, Any, List, Tuple
from .base_agent import BaseAgent
from ..schemas.candidate import CandidateProfile
from ..schemas.job_description import JobDescriptionProfile
from ..schemas.matching import CandidateJobMatchReport, MatchEvidence
from ..schemas.orchestration import AgentStepLog
from ..retrieval.knowledge_retriever import KnowledgeRetriever

class CandidateJobMatchingAgent(BaseAgent):
    def __init__(self, provider, retriever: KnowledgeRetriever):
        super().__init__("CandidateJobMatchingAgent", provider)
        self.retriever = retriever

    async def execute(
        self, candidate: CandidateProfile, jd: JobDescriptionProfile
    ) -> Tuple[CandidateJobMatchReport, AgentStepLog]:
        start_time = time.time()
        self.logger.info(f"Matching candidate {candidate.personalDetails.fullName} against {jd.jobTitle}")

        # Assemble candidate textual corpus for evidence searching
        candidate_skills = (
            candidate.skills.technicalSkills +
            candidate.skills.jobSkills +
            candidate.skills.computerSkills
        )
        candidate_skills_lower = [s.lower().strip() for s in candidate_skills]

        exp_texts = []
        for exp in candidate.workExperience:
            exp_texts.append(f"{exp.jobTitle} at {exp.employer}: {' '.join(exp.responsibilities)} {' '.join(exp.achievements)}")
        full_candidate_text = " ".join(exp_texts).lower()

        matches: List[MatchEvidence] = []
        supported_req_count = 0
        total_req_count = len(jd.requiredSkills) or 1
        missing_mandatory: List[str] = []
        transferable_strengths: List[str] = []

        # 1. Match Required Skills
        for req in jd.requiredSkills:
            req_clean = req.strip()
            req_lower = req_clean.lower()
            synonyms = self.retriever.get_skill_synonyms(req_clean)
            synonyms_lower = [syn.lower() for syn in synonyms]

            # Exact match check
            if req_lower in candidate_skills_lower:
                supported_req_count += 1
                matches.append(MatchEvidence(
                    requirement=req_clean,
                    category="required_skill",
                    status="Supported",
                    matchType="Exact",
                    candidateEvidence=f"Explicitly verified in candidate skill set: '{req_clean}'",
                    confidenceScore=1.0
                ))
            # Synonym match check
            elif any(syn in candidate_skills_lower for syn in synonyms_lower):
                matched_syn = next(syn for syn in synonyms_lower if syn in candidate_skills_lower)
                supported_req_count += 0.95
                matches.append(MatchEvidence(
                    requirement=req_clean,
                    category="required_skill",
                    status="Supported",
                    matchType="Synonym",
                    candidateEvidence=f"Corroborated by equivalent qualification in candidate profile: '{matched_syn}'",
                    confidenceScore=0.95
                ))
            # Experience text match
            elif re.search(r'\b' + re.escape(req_lower) + r'\b', full_candidate_text):
                supported_req_count += 0.85
                matches.append(MatchEvidence(
                    requirement=req_clean,
                    category="required_skill",
                    status="Supported",
                    matchType="Experience Evidence",
                    candidateEvidence=f"Demonstrated in professional work history text matching '{req_clean}'",
                    confidenceScore=0.85
                ))
            # Transferable concept match
            elif any(re.search(r'\b' + re.escape(syn) + r'\b', full_candidate_text) for syn in synonyms_lower):
                supported_req_count += 0.70
                transferable_strengths.append(req_clean)
                matches.append(MatchEvidence(
                    requirement=req_clean,
                    category="required_skill",
                    status="Partially Supported",
                    matchType="Transferable",
                    candidateEvidence=f"Related conceptual background identified; verify specific hands-on depth with '{req_clean}'",
                    confidenceScore=0.70,
                    remediationAdvice=f"Highlight concrete projects demonstrating '{req_clean}'"
                ))
            # Genuine Gap
            else:
                missing_mandatory.append(req_clean)
                matches.append(MatchEvidence(
                    requirement=req_clean,
                    category="required_skill",
                    status="Missing",
                    matchType="None",
                    candidateEvidence=None,
                    confidenceScore=0.0,
                    remediationAdvice=f"Candidate profile lacks direct evidence of '{req_clean}'. Do not fabricate."
                ))

        # 2. Match Preferred Skills
        supported_pref_count = 0
        total_pref_count = len(jd.preferredSkills) or 1
        for pref in jd.preferredSkills:
            pref_clean = pref.strip()
            pref_lower = pref_clean.lower()
            if pref_lower in candidate_skills_lower or re.search(r'\b' + re.escape(pref_lower) + r'\b', full_candidate_text):
                supported_pref_count += 1
                matches.append(MatchEvidence(
                    requirement=pref_clean,
                    category="preferred_skill",
                    status="Supported",
                    matchType="Exact",
                    candidateEvidence=f"Supported preference: '{pref_clean}'",
                    confidenceScore=0.9
                ))
            else:
                matches.append(MatchEvidence(
                    requirement=pref_clean,
                    category="preferred_skill",
                    status="Missing",
                    matchType="None",
                    candidateEvidence=None,
                    confidenceScore=0.0
                ))

        req_score = round(min(100.0, (supported_req_count / total_req_count) * 100.0), 1)
        pref_score = round(min(100.0, (supported_pref_count / total_pref_count) * 100.0), 1)
        overall_score = round((req_score * 0.75) + (pref_score * 0.25), 1)

        recommendations = []
        if missing_mandatory:
            recommendations.append(f"Identified {len(missing_mandatory)} missing mandatory qualifications: {', '.join(missing_mandatory[:3])}. Ensure transparent positioning.")
        if transferable_strengths:
            recommendations.append(f"Emphasize transferable proficiencies: {', '.join(transferable_strengths[:3])}.")
        if overall_score >= 80:
            recommendations.append("High ATS alignment. Highlight key quantitative metrics in work achievements.")

        report = CandidateJobMatchReport(
            jobTitle=jd.jobTitle,
            companyName=jd.companyName,
            overallScore=overall_score,
            requiredSkillsScore=req_score,
            preferredSkillsScore=pref_score,
            experienceYearsMatch=True,
            educationMatch=True,
            matches=matches,
            missingMandatoryRequirements=missing_mandatory,
            transferableStrengths=transferable_strengths,
            actionableRecommendations=recommendations
        )

        duration = int((time.time() - start_time) * 1000)
        log = self.log_step("MatchCandidateJob", "completed", duration, f"Calculated ATS Match Score: {overall_score}%")
        return report, log
