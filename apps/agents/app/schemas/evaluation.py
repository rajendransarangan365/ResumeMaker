"""
Evaluation and Quality Assurance Schemas
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class QAFinding(BaseModel):
    category: str = Field(..., description="factual_integrity | grammar | formatting | dates | text_overflow")
    severity: str = Field(..., description="critical | warning | suggestion")
    issueDescription: str
    evidenceSnippet: Optional[str] = None
    suggestedCorrection: str

class QAReport(BaseModel):
    passed: bool
    totalFindings: int
    criticalCount: int
    warningCount: int
    findings: List[QAFinding] = Field(default_factory=list)
    readingOrderValid: bool = True
    pageFitEstimated: str = Field(default="Balanced (1-2 pages)")

class EvaluationScorecard(BaseModel):
    overallGrade: str = Field(..., description="A+ | A | B | C | Needs Revision")
    overallScore: float = Field(..., ge=0.0, le=100.0)
    relevanceScore: float = Field(..., ge=0.0, le=100.0)
    evidenceCoverageScore: float = Field(..., ge=0.0, le=100.0)
    keywordDensityScore: float = Field(..., ge=0.0, le=100.0)
    readabilityGradeLevel: float = Field(default=9.0)
    actionVerbStrengthRatio: float = Field(default=0.85)
    metricQuantificationRatio: float = Field(default=0.60)
    unsupportedClaimsDetected: int = 0
    rubricBreakdown: Dict[str, Any] = Field(default_factory=dict)
