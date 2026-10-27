"""
Job Description Intelligence Schemas
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class JobDescriptionInput(BaseModel):
    jobTitle: str
    companyName: Optional[str] = None
    rawText: str
    targetJobFamilyId: Optional[str] = None
    targetCountry: Optional[str] = "US"

class JobDescriptionProfile(BaseModel):
    jobTitle: str
    alternativeTitles: List[str] = Field(default_factory=list)
    companyName: Optional[str] = None
    industry: Optional[str] = None
    jobFamily: Optional[str] = None
    seniorityLevel: str = Field(default="Mid-Level")
    responsibilities: List[str] = Field(default_factory=list)
    mandatoryQualifications: List[str] = Field(default_factory=list)
    preferredQualifications: List[str] = Field(default_factory=list)
    requiredSkills: List[str] = Field(default_factory=list)
    preferredSkills: List[str] = Field(default_factory=list)
    toolsAndTechnologies: List[str] = Field(default_factory=list)
    requiredExperienceYears: Optional[float] = 0.0
    requiredEducation: Optional[str] = None
    requiredCertifications: List[str] = Field(default_factory=list)
    domainTerminology: List[str] = Field(default_factory=list)
    softSkills: List[str] = Field(default_factory=list)
    locationRequirement: Optional[str] = None
    workArrangement: Optional[str] = None  # Remote / Hybrid / On-site
