"""
Candidate Profile Pydantic Schemas
Synchronized with @ats/shared-types and @ats/resume-schema
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class PersonalDetails(BaseModel):
    fullName: str = Field(..., description="Full legal or professional name")
    email: str = Field(..., description="Primary email address")
    phone: str = Field(..., description="Contact telephone number")
    headline: Optional[str] = Field(None, description="Professional headline or title")
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    postalCode: Optional[str] = None
    preferredLocation: Optional[str] = None
    linkedinUrl: Optional[str] = None
    portfolioUrl: Optional[str] = None
    githubUrl: Optional[str] = None

class WorkExperience(BaseModel):
    id: Optional[str] = None
    jobTitle: str
    employer: str
    location: Optional[str] = None
    startDate: str
    endDate: Optional[str] = None
    isCurrent: bool = False
    responsibilities: List[str] = Field(default_factory=list)
    achievements: List[str] = Field(default_factory=list)
    technologiesUsed: List[str] = Field(default_factory=list)

class Education(BaseModel):
    id: Optional[str] = None
    degree: str
    fieldOfStudy: str
    institution: str
    location: Optional[str] = None
    graduationDate: Optional[str] = None
    gpa: Optional[str] = None
    honors: List[str] = Field(default_factory=list)

class Project(BaseModel):
    id: Optional[str] = None
    title: str
    role: Optional[str] = None
    description: str
    technologiesUsed: List[str] = Field(default_factory=list)
    liveUrl: Optional[str] = None
    repositoryUrl: Optional[str] = None

class Skills(BaseModel):
    technicalSkills: List[str] = Field(default_factory=list, description="Primary technical and hard skills")
    jobSkills: List[str] = Field(default_factory=list, description="Role-specific domain competencies")
    computerSkills: List[str] = Field(default_factory=list, description="Software tools, platforms, and suites")
    languages: List[str] = Field(default_factory=list, description="Spoken/written languages with proficiency")
    softSkills: List[str] = Field(default_factory=list, description="Interpersonal and leadership skills")

class Certification(BaseModel):
    id: Optional[str] = None
    name: str
    issuer: str
    issueDate: Optional[str] = None
    expiryDate: Optional[str] = None
    credentialId: Optional[str] = None
    credentialUrl: Optional[str] = None

class CandidateProfile(BaseModel):
    id: Optional[str] = None
    userId: Optional[str] = None
    profileTitle: str = Field(default="Master Profile")
    personalDetails: PersonalDetails
    professionalSummary: Optional[str] = None
    workExperience: List[WorkExperience] = Field(default_factory=list)
    education: List[Education] = Field(default_factory=list)
    projects: List[Project] = Field(default_factory=list)
    skills: Skills = Field(default_factory=Skills)
    certifications: List[Certification] = Field(default_factory=list)
    rawExtractedText: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)
