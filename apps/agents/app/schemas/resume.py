"""
Generated Resume Schemas
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class ResumeFormatting(BaseModel):
    pageSize: str = "A4"
    fontFamily: str = "Roboto"
    fontSizePt: float = 10.0
    lineSpacing: float = 1.25
    marginsMm: float = 15.0
    accentColor: str = "#1e293b"

class TailoredResumeContent(BaseModel):
    templateId: str = "classic-professional"
    professionalHeadline: str
    professionalSummary: str
    sectionOrder: List[str] = Field(default_factory=lambda: [
        "summary", "skills", "experience", "projects", "education", "certifications"
    ])
    tailoredSkills: Dict[str, List[str]] = Field(default_factory=dict)
    tailoredExperience: List[Dict[str, Any]] = Field(default_factory=list)
    tailoredProjects: List[Dict[str, Any]] = Field(default_factory=list)
    formatting: ResumeFormatting = Field(default_factory=ResumeFormatting)
    generationNotes: List[str] = Field(default_factory=list)
