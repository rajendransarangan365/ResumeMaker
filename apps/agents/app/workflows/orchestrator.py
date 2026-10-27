"""
Central Resume Orchestrator Workflow
Coordinates all 8 specialized agents with bounded retries, state machine tracking,
and transparent execution tracing.
"""

import time
import uuid
import logging
from typing import Dict, Any, List, Optional
from ..providers.base import ModelProvider
from ..retrieval.knowledge_retriever import KnowledgeRetriever
from ..agents.resume_intelligence import ResumeIntelligenceAgent
from ..agents.jd_intelligence import JobDescriptionIntelligenceAgent
from ..agents.candidate_matcher import CandidateJobMatchingAgent
from ..agents.template_selector import TemplateSelectionAgent
from ..agents.resume_writer import ResumeWritingAgent
from ..agents.ats_optimizer import ATSOptimizationAgent
from ..agents.resume_qa import ResumeQualityAssuranceAgent
from ..agents.evaluator import EvaluationAgent
from ..schemas.orchestration import OrchestrationRequest, OrchestrationResult, AgentStepLog

logger = logging.getLogger("ResumeOrchestrator")

class ResumeOrchestrator:
    def __init__(self, provider: ModelProvider, retriever: KnowledgeRetriever):
        self.provider = provider
        self.retriever = retriever

        # Initialize all 8 specialized agents
        self.resume_intelligence_agent = ResumeIntelligenceAgent(provider)
        self.jd_intelligence_agent = JobDescriptionIntelligenceAgent(provider, retriever)
        self.candidate_matcher_agent = CandidateJobMatchingAgent(provider, retriever)
        self.template_selector_agent = TemplateSelectionAgent(provider)
        self.resume_writer_agent = ResumeWritingAgent(provider)
        self.ats_optimizer_agent = ATSOptimizationAgent(provider)
        self.resume_qa_agent = ResumeQualityAssuranceAgent(provider)
        self.evaluator_agent = EvaluationAgent(provider)

    async def execute(self, request: OrchestrationRequest) -> OrchestrationResult:
        start_time = time.time()
        job_id = request.jobId or f"job-{uuid.uuid4().hex[:8]}"
        execution_trace: List[AgentStepLog] = []

        logger.info(f"Starting Multi-Agent Resume Orchestration (Job: {job_id})")

        try:
            # Step 1: Candidate Profile Ingestion & Validation
            candidate = request.candidateProfile

            # Step 2: Job Description Intelligence Analysis
            job_profile, log_jd = await self.jd_intelligence_agent.execute(request.jobDescription)
            execution_trace.append(log_jd)

            # Step 3: Candidate-Job Matching
            match_report, log_match = await self.candidate_matcher_agent.execute(candidate, job_profile)
            execution_trace.append(log_match)

            # Step 4: Template Selection
            selected_template, rationale, log_tpl = await self.template_selector_agent.execute(
                candidate, job_profile, request.preferredTemplateId
            )
            execution_trace.append(log_tpl)

            # Step 5: Resume Writing (Initial Generation)
            tailored_resume, log_write = await self.resume_writer_agent.execute(
                candidate, job_profile, match_report, selected_template
            )
            execution_trace.append(log_write)

            # Step 6: ATS Optimization & Terminology Check
            optimized_resume, opt_notes, log_opt = await self.ats_optimizer_agent.execute(
                tailored_resume, job_profile, match_report
            )
            execution_trace.append(log_opt)

            # Step 7: QA Inspection & Bounded Correction Loop (Max 2 Retries)
            retry_count = 0
            qa_report, log_qa = await self.resume_qa_agent.execute(candidate, optimized_resume)
            execution_trace.append(log_qa)

            while not qa_report.passed and retry_count < request.maxQARetryAttempts:
                retry_count += 1
                logger.warning(f"QA Failed with {qa_report.criticalCount} critical issues. Retrying generation (Attempt {retry_count}/{request.maxQARetryAttempts})")
                
                # Re-write with QA feedback
                optimized_resume, retry_log = await self.resume_writer_agent.execute(
                    candidate, job_profile, match_report, selected_template
                )
                execution_trace.append(retry_log)

                # Re-inspect
                qa_report, retry_qa_log = await self.resume_qa_agent.execute(candidate, optimized_resume)
                execution_trace.append(retry_qa_log)

            # Step 8: Final Multi-Metric Evaluation
            scorecard, log_eval = await self.evaluator_agent.execute(
                candidate, job_profile, match_report, optimized_resume, qa_report
            )
            execution_trace.append(log_eval)

            total_duration = int((time.time() - start_time) * 1000)

            return OrchestrationResult(
                jobId=job_id,
                success=True,
                status="completed",
                candidateProfile=candidate,
                jobProfile=job_profile,
                matchReport=match_report,
                selectedTemplateId=selected_template,
                tailoredResume=optimized_resume,
                qaReport=qa_report,
                evaluationScorecard=scorecard,
                executionTrace=execution_trace,
                totalDurationMs=total_duration
            )

        except Exception as e:
            logger.error(f"Orchestration failure in job {job_id}: {e}", exc_info=True)
            total_duration = int((time.time() - start_time) * 1000)
            return OrchestrationResult(
                jobId=job_id,
                success=False,
                status="failed",
                candidateProfile=request.candidateProfile,
                jobProfile=JobDescriptionProfile(jobTitle=request.jobDescription.jobTitle),
                matchReport=None,
                selectedTemplateId=request.preferredTemplateId or "classic-professional",
                tailoredResume=None,
                qaReport=None,
                evaluationScorecard=None,
                executionTrace=execution_trace,
                totalDurationMs=total_duration,
                errorMessage=str(e)
            )
