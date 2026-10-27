"""
Multi-Agent Orchestration Schemas
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from .candidate import CandidateProfile
from .job_description import JobDescriptionInput, JobDescriptionProfile
from .matching import CandidateJobMatchReport
from .resume import TailoredResumeContent
from .evaluation import QAReport, EvaluationScorecard

class OrchestrationRequest(BaseModel):
    jobId: Optional[str] = None
    candidateProfile: CandidateProfile
    jobDescription: JobDescriptionInput
    preferredTemplateId: Optional[str] = None
    strictAntiHallucination: bool = True
    maxQARetryAttempts: int = 2

class AgentStepLog(BaseModel):
    agentName: str
    stepName: str
    status: str = Field(..., description="started | completed | failed | skipped")
    durationMs: int = 0
    message: str = ""
    timestamp: str

class OrchestrationResult(BaseModel):
    jobId: str
    success: bool
    status: str = Field(..., description="completed | failed | partial")
    candidateProfile: CandidateProfile
    jobProfile: JobDescriptionProfile
    matchReport: CandidateJobMatchReport
    selectedTemplateId: str
    tailoredResume: TailoredResumeContent
    qaReport: QAReport
    evaluationScorecard: EvaluationScorecard
    executionTrace: List[AgentStepLog] = Field(default_factory=list)
    totalDurationMs: int = 0
    errorMessage: Optional[str] = None
