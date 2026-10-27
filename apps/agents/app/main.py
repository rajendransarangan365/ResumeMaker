"""
ATS Resume Intelligence Studio - Python Agent Microservice
Powered by Google Agent Development Kit (ADK) architecture & Local Model Providers.
"""

import os
import sys
from typing import Dict, Any, List, Optional
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Load environment
load_dotenv()

from .providers.factory import ProviderFactory
from .retrieval.knowledge_retriever import KnowledgeRetriever
from .workflows.orchestrator import ResumeOrchestrator
from .schemas.candidate import CandidateProfile
from .schemas.job_description import JobDescriptionInput, JobDescriptionProfile
from .schemas.matching import CandidateJobMatchReport
from .schemas.orchestration import OrchestrationRequest, OrchestrationResult

app = FastAPI(
    title="ATS Multi-Agent Intelligence Service",
    description="Production-grade Multi-Agent Resume Optimization & Evaluation Engine",
    version="1.0.0"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global services initialization
retriever = KnowledgeRetriever()
active_provider = ProviderFactory.get_provider()
orchestrator = ResumeOrchestrator(active_provider, retriever)

@app.get("/health")
async def health_check():
    provider_healthy = await active_provider.healthCheck()
    model_info = active_provider.getModelInfo()
    return {
        "status": "healthy",
        "service": "ATS Multi-Agent Intelligence Engine",
        "provider": model_info.providerName,
        "model": model_info.modelName,
        "isLocal": model_info.isLocal,
        "providerHealthy": provider_healthy,
        "totalJobFamiliesLoaded": len(retriever.job_families)
    }

@app.get("/api/v1/models")
async def get_models():
    providers = [
        ProviderFactory.get_provider("ollama"),
        ProviderFactory.get_provider("gemini"),
        ProviderFactory.get_provider("fallback")
    ]
    result = []
    for p in providers:
        info = p.getModelInfo()
        hardware = p.estimateResourceRequirements()
        result.append({
            "provider": info.providerName,
            "modelName": info.modelName,
            "isLocal": info.isLocal,
            "isFree": info.isFree,
            "contextWindow": info.contextWindow,
            "status": info.status,
            "hardware": hardware.model_dump()
        })
    return {"models": result}

@app.post("/api/v1/agents/orchestrate", response_model=OrchestrationResult)
async def orchestrate_resume(request: OrchestrationRequest):
    """Executes the complete 8-agent workflow with bounded retries"""
    result = await orchestrator.execute(request)
    if not result.success:
        raise HTTPException(status_code=500, detail=result.errorMessage or "Orchestration failed")
    return result

@app.post("/api/v1/agents/match", response_model=CandidateJobMatchReport)
async def match_candidate_job(candidate: CandidateProfile, jd: JobDescriptionInput):
    """Generates direct tri-state candidate-to-job requirement matrix"""
    job_profile, _ = await orchestrator.jd_intelligence_agent.execute(jd)
    report, _ = await orchestrator.candidate_matcher_agent.execute(candidate, job_profile)
    return report

@app.post("/api/v1/agents/parse-resume", response_model=CandidateProfile)
async def parse_resume(payload: Dict[str, str]):
    raw_text = payload.get("rawText", "")
    if not raw_text:
        raise HTTPException(status_code=400, detail="rawText is required")
    profile, _ = await orchestrator.resume_intelligence_agent.execute(raw_text)
    return profile

@app.post("/api/v1/agents/analyze-jd", response_model=JobDescriptionProfile)
async def analyze_jd(jd: JobDescriptionInput):
    profile, _ = await orchestrator.jd_intelligence_agent.execute(jd)
    return profile

@app.get("/api/v1/knowledge/job-families")
async def list_job_families():
    return {
        "total": len(retriever.job_families),
        "jobFamilies": retriever.get_all_job_families()
    }

@app.get("/api/v1/knowledge/job-families/{family_id}")
async def get_job_family(family_id: str):
    family = retriever.get_job_family_by_id(family_id)
    if not family:
        raise HTTPException(status_code=404, detail="Job family not found")
    return family

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("apps.agents.app.main:app", host="0.0.0.0", port=8000, reload=True)
