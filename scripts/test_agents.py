"""
Python Agent Test Runner (Standard Library unittest + asyncio)
"""

import sys
import os
import unittest
import asyncio

# Add project root to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from apps.agents.app.providers.fallback_provider import FallbackProvider
from apps.agents.app.providers.factory import ProviderFactory
from apps.agents.app.retrieval.knowledge_retriever import KnowledgeRetriever
from apps.agents.app.schemas.candidate import CandidateProfile, PersonalDetails, Skills, WorkExperience, Education
from apps.agents.app.schemas.job_description import JobDescriptionInput, JobDescriptionProfile
from apps.agents.app.schemas.orchestration import OrchestrationRequest
from apps.agents.app.agents.candidate_matcher import CandidateJobMatchingAgent
from apps.agents.app.agents.template_selector import TemplateSelectionAgent
from apps.agents.app.workflows.orchestrator import ResumeOrchestrator

class TestPythonAgents(unittest.TestCase):
    def setUp(self):
        self.candidate = CandidateProfile(
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

        self.jd_input = JobDescriptionInput(
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

    def test_01_fallback_provider(self):
        provider = FallbackProvider()
        info = provider.getModelInfo()
        self.assertEqual(info.providerName, "Deterministic Rule-Based Engine")
        self.assertTrue(info.isLocal)
        self.assertTrue(info.isFree)
        hardware = provider.estimateResourceRequirements()
        self.assertTrue(hardware.supportsCpuInference)
        print("[PASS] test_01_fallback_provider passed")

    def test_02_knowledge_retriever(self):
        retriever = KnowledgeRetriever()
        self.assertEqual(len(retriever.job_families), 20)
        family = retriever.find_best_job_family("Senior Full Stack Developer")
        self.assertEqual(family.get("id"), "software-development")

        synonyms = retriever.get_skill_synonyms("JavaScript")
        self.assertTrue(len(synonyms) >= 1)
        print("[PASS] test_02_knowledge_retriever passed (All 20 job families loaded)")

    def test_03_candidate_matcher(self):
        async def run():
            provider = FallbackProvider()
            retriever = KnowledgeRetriever()
            matcher = CandidateJobMatchingAgent(provider, retriever)

            jd_profile = JobDescriptionProfile(
                jobTitle="Full Stack Developer",
                requiredSkills=["TypeScript", "Node.js", "React", "PostgreSQL"],
                preferredSkills=["AWS", "GraphQL"]
            )

            report, log = await matcher.execute(self.candidate, jd_profile)
            self.assertGreaterEqual(report.overallScore, 75.0)
            self.assertGreaterEqual(report.requiredSkillsScore, 80.0)
            self.assertEqual(log.status, "completed")
            print(f"[PASS] test_03_candidate_matcher passed (Score: {report.overallScore}%)")

        asyncio.run(run())

    def test_04_template_selector(self):
        async def run():
            provider = FallbackProvider()
            selector = TemplateSelectionAgent(provider)

            jd_profile = JobDescriptionProfile(
                jobTitle="Senior Software Architect",
                jobFamily="software-development",
                seniorityLevel="Senior"
            )

            template_id, rationale, log = await selector.execute(self.candidate, jd_profile)
            self.assertIn(template_id, [
                "senior-engineer", "software-developer", "technical-specialist", "classic-professional"
            ])
            self.assertEqual(log.status, "completed")
            print(f"[PASS] test_04_template_selector passed (Selected: {template_id})")

        asyncio.run(run())

    def test_05_orchestrator_workflow(self):
        async def run():
            provider = FallbackProvider()
            retriever = KnowledgeRetriever()
            orchestrator = ResumeOrchestrator(provider, retriever)

            request = OrchestrationRequest(
                candidateProfile=self.candidate,
                jobDescription=self.jd_input,
                preferredTemplateId="software-developer"
            )

            result = await orchestrator.execute(request)
            self.assertTrue(result.success)
            self.assertEqual(result.status, "completed")
            self.assertEqual(result.selectedTemplateId, "software-developer")
            self.assertIsNotNone(result.tailoredResume)
            self.assertIsNotNone(result.matchReport)
            self.assertIsNotNone(result.evaluationScorecard)
            self.assertGreater(result.evaluationScorecard.overallScore, 0)
            self.assertGreaterEqual(len(result.executionTrace), 6)
            print(f"[PASS] test_05_orchestrator_workflow passed ({len(result.executionTrace)} agent steps executed in {result.totalDurationMs}ms)")

        asyncio.run(run())

if __name__ == "__main__":
    unittest.main()
