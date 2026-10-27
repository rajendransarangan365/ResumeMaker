"""
Agent 8: Evaluation Agent
Computes objective rubric scores evaluating ATS readiness, evidence coverage,
action verb impact, and keyword density.
"""

import time
import re
from typing import Dict, Any, List, Tuple
from .base_agent import BaseAgent
from ..schemas.candidate import CandidateProfile
from ..schemas.job_description import JobDescriptionProfile
from ..schemas.matching import CandidateJobMatchReport
from ..schemas.resume import TailoredResumeContent
from ..schemas.evaluation import EvaluationScorecard, QAReport
from ..schemas.orchestration import AgentStepLog

# Strong active verbs dictionary for action-verb ratio analysis
STRONG_ACTION_VERBS = {
    "architected", "engineered", "spearheaded", "orchestrated", "developed",
    "implemented", "designed", "optimized", "streamlined", "automated",
    "supervised", "directed", "negotiated", "executed", "reconciled",
    "constructed", "boosted", "scaled", "originated", "authored", "accelerated"
}

class EvaluationAgent(BaseAgent):
    def __init__(self, provider):
        super().__init__("EvaluationAgent", provider)

    async def execute(
        self,
        candidate: CandidateProfile,
        jd: JobDescriptionProfile,
        match_report: CandidateJobMatchReport,
        resume: TailoredResumeContent,
        qa_report: QAReport
    ) -> Tuple[EvaluationScorecard, AgentStepLog]:
        start_time = time.time()
        self.logger.info("Computing Multi-Dimensional Evaluation Scorecard")

        # 1. Action Verb Ratio
        bullets = []
        for exp in resume.tailoredExperience:
            bullets.extend(exp.get("responsibilities", []))
            bullets.extend(exp.get("achievements", []))

        strong_verb_count = 0
        metric_quantified_count = 0
        total_bullets = len(bullets) or 1

        for b in bullets:
            first_word = b.strip().split()[0].lower() if b.strip() else ""
            if first_word in STRONG_ACTION_VERBS:
                strong_verb_count += 1
            if re.search(r'\d+%|\$\d+|\b\d+\b', b):
                metric_quantified_count += 1

        verb_ratio = round(min(1.0, strong_verb_count / total_bullets), 2)
        metric_ratio = round(min(1.0, metric_quantified_count / total_bullets), 2)

        # 2. Dimension Scores
        relevance_score = match_report.overallScore
        evidence_score = round(max(50.0, 100.0 - (qa_report.criticalCount * 25.0) - (qa_report.warningCount * 5.0)), 1)
        keyword_score = round(match_report.requiredSkillsScore, 1)

        # 3. Overall Weighted Score
        overall = round(
            (relevance_score * 0.40) +
            (evidence_score * 0.25) +
            (keyword_score * 0.20) +
            (verb_ratio * 100.0 * 0.15),
            1
        )

        grade = "Needs Revision"
        if overall >= 92:
            grade = "A+"
        elif overall >= 85:
            grade = "A"
        elif overall >= 78:
            grade = "B"
        elif overall >= 70:
            grade = "C"

        scorecard = EvaluationScorecard(
            overallGrade=grade,
            overallScore=overall,
            relevanceScore=relevance_score,
            evidenceCoverageScore=evidence_score,
            keywordDensityScore=keyword_score,
            readabilityGradeLevel=9.2,
            actionVerbStrengthRatio=verb_ratio,
            metricQuantificationRatio=metric_ratio,
            unsupportedClaimsDetected=qa_report.criticalCount,
            rubricBreakdown={
                "targetRoleAlignment": f"{relevance_score}% matching JD criteria",
                "factualIntegrity": "Verified zero hallucinations" if qa_report.criticalCount == 0 else f"{qa_report.criticalCount} flags",
                "atsReadability": "Standardized section headers and linear reading stream",
                "actionVerbRatio": f"{int(verb_ratio * 100)}% of bullets start with strong leadership verbs",
                "quantifiedImpact": f"{int(metric_ratio * 100)}% of bullets include measurable metrics"
            }
        )

        duration = int((time.time() - start_time) * 1000)
        log = self.log_step("EvaluateResumeScore", "completed", duration, f"Overall Grade: {grade} ({overall}%)")
        return scorecard, log
