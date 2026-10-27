"""
Python Agent Unit Tests
Tests ModelProvider, KnowledgeRetriever, and Specialized Agents
"""

import pytest
import asyncio
from apps.agents.app.providers.fallback_provider import FallbackProvider
from apps.agents.app.providers.factory import ProviderFactory
from apps.agents.app.retrieval.knowledge_retriever import KnowledgeRetriever
from apps.agents.app.schemas.candidate import CandidateProfile, PersonalDetails, Skills, WorkExperience, Education
from apps.agents.app.schemas.job_description import JobDescriptionInput, JobDescriptionProfile
from apps.agents.app.schemas.orchestration import OrchestrationRequest
from apps.agents.app.agents.candidate_matcher import CandidateJobMatchingAgent
from apps.agents.app.agents.template_selector import TemplateSelectionAgent
from apps.agents.app.workflows.orchestrator import ResumeOrchestrator

@pytest.fixture
def sample_candidate():
    return CandidateProfile(
        personalDetails=PersonalDetails(
            fullName="Jane Doe",
            email="jane.doe@example.com",
            phone="+1 (555) 123-4567",
            headline="Full Stack Software Engineer"
        ),
        professionalSummary="Software engineer with 5 years building scalable web services in TypeScript and Node.js.",
        workExperience=[
            WorkExperience(
                jobTitle="Senior Software Engineer",
                employer="TechCorp",
                startDate="2021",
                responsibilities=["Architected RESTful microservices in Node.js", "Mentored 3 junior developers"],
                achievements=["Reduced API latency by 35% through Redis caching"]
            )
        ],
        education=[
            Education(
                degree="Bachelor of Science in Computer Science",
                fieldOfStudy="Computer Science",
                institution="State University",
                graduationDate="2020"
            )
        ],
        skills=Skills(
            technicalSkills=["TypeScript", "JavaScript", "Node.js", "React", "PostgreSQL", "Docker"],
            jobSkills=["Microservices", "RESTful APIs", "System Architecture"],
            computerSkills=["Git", "AWS", "Linux"]
        )
    )

@pytest.fixture
def sample_jd_input():
    return JobDescriptionInput(
        jobTitle="Full Stack Engineer",
        companyName="InnoTech",
        rawText="""
        We are seeking a Full Stack Software Engineer to build scalable microservices.
        Requirements:
        - Proficiency with TypeScript, Node.js, and React
        - Experience with PostgreSQL and Docker
        - Excellent communication and problem-solving skills
        Preferred:
        - Experience with AWS and GraphQL
        """
    )

def test_fallback_provider_interface():
    provider = FallbackProvider()
    info = provider.getModelInfo()
    assert info.providerName == "Deterministic Rule-Based Engine"
    assert info.isLocal is True
    assert info.isFree is True
    hardware = provider.estimateResourceRequirements()
    assert hardware.supportsCpuInference is True

def test_knowledge_retriever():
    retriever = KnowledgeRetriever()
    assert len(retriever.job_families) == 20
    family = retriever.find_best_job_family("Senior Full Stack Developer")
    assert family.get("id") == "software-development"

    synonyms = retriever.get_skill_synonyms("JavaScript")
    assert "JS" in synonyms or len(synonyms) >= 1

@pytest.mark.asyncio
async def test_candidate_matching_agent(sample_candidate, sample_jd_input):
    provider = FallbackProvider()
    retriever = KnowledgeRetriever()
    matcher = CandidateJobMatchingAgent(provider, retriever)

    jd_profile = JobDescriptionProfile(
        jobTitle="Full Stack Developer",
        requiredSkills=["TypeScript", "Node.js", "React", "PostgreSQL"],
        preferredSkills=["AWS", "GraphQL"]
    )

    report, log = await matcher.execute(sample_candidate, jd_profile)
    assert report.overallScore >= 75.0
    assert report.requiredSkillsScore >= 80.0
    assert log.status == "completed"

@pytest.mark.asyncio
async def test_template_selector_agent(sample_candidate):
    provider = FallbackProvider()
    selector = TemplateSelectionAgent(provider)

    jd_profile = JobDescriptionProfile(
        jobTitle="Senior Software Architect",
        jobFamily="software-development",
        seniorityLevel="Senior"
    )

    template_id, rationale, log = await selector.execute(sample_candidate, jd_profile)
    assert template_id in [
        "senior-engineer", "software-developer", "technical-specialist", "classic-professional"
    ]
    assert log.status == "completed"

@pytest.mark.asyncio
async def test_full_orchestrator_workflow(sample_candidate, sample_jd_input):
    provider = FallbackProvider()
    retriever = KnowledgeRetriever()
    orchestrator = ResumeOrchestrator(provider, retriever)

    request = OrchestrationRequest(
        candidateProfile=sample_candidate,
        jobDescription=sample_jd_input,
        preferredTemplateId="software-developer"
    )

    result = await orchestrator.execute(request)
    assert result.success is True
    assert result.status == "completed"
    assert result.selectedTemplateId == "software-developer"
    assert result.tailoredResume is not None
    assert result.matchReport is not None
    assert result.evaluationScorecard is not None
    assert result.evaluationScorecard.overallScore > 0
    assert len(result.executionTrace) >= 6
