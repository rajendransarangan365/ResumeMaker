"""
Candidate-Job Matching Schemas
Strict Tri-State Evidence Matching:
- Supported (Direct corroborating evidence)
- Partially Supported (Transferable / related skill)
- Missing (Genuine eligibility gap)
"""

from typing import List, Optional
from pydantic import BaseModel, Field

class MatchEvidence(BaseModel):
    requirement: str
    category: str = Field(..., description="required_skill | preferred_skill | qualification | certification")
    status: str = Field(..., description="'Supported' | 'Partially Supported' | 'Missing'")
    matchType: str = Field(default="Exact", description="'Exact' | 'Synonym' | 'Transferable' | 'None'")
    candidateEvidence: Optional[str] = Field(None, description="Exact verbatim excerpt from candidate profile")
    confidenceScore: float = Field(default=1.0, ge=0.0, le=1.0)
    remediationAdvice: Optional[str] = None

class CandidateJobMatchReport(BaseModel):
    jobTitle: str
    companyName: Optional[str] = None
    overallScore: float = Field(..., ge=0.0, le=100.0, description="ATS match percentage")
    requiredSkillsScore: float = Field(..., ge=0.0, le=100.0)
    preferredSkillsScore: float = Field(..., ge=0.0, le=100.0)
    experienceYearsMatch: bool = True
    educationMatch: bool = True
    matches: List[MatchEvidence] = Field(default_factory=list)
    missingMandatoryRequirements: List[str] = Field(default_factory=list)
    transferableStrengths: List[str] = Field(default_factory=list)
    actionableRecommendations: List[str] = Field(default_factory=list)
