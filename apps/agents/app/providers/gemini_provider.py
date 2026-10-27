"""
Google Gemini Model Provider
Official Google Generative AI integration with JSON Structured Outputs.
"""

import os
import json
import logging
from typing import Dict, Any, List, Optional
import httpx
from .base import ModelProvider, ModelInfo, HardwareEstimate

logger = logging.getLogger("GeminiProvider")

class GeminiProvider(ModelProvider):
    def __init__(self, api_key: Optional[str] = None, model_name: str = "gemini-2.5-flash"):
        self.api_key = api_key or os.getenv("GEMINI_API_KEY", "")
        self.model_name = model_name
        self.base_url = "https://generativelanguage.googleapis.com/v1beta"
        self._is_healthy = False

    async def generate(self, prompt: str, system_instruction: Optional[str] = None) -> str:
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY is not configured")
        url = f"{self.base_url}/models/{self.model_name}:generateContent?key={self.api_key}"
        contents = []
        if system_instruction:
            contents.append({"role": "user", "parts": [{"text": f"System Instructions: {system_instruction}"}]})
            contents.append({"role": "model", "parts": [{"text": "Understood. I will strictly follow these instructions."}]})
        contents.append({"role": "user", "parts": [{"text": prompt}]})

        payload = {"contents": contents}
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(url, json=payload)
            resp.raise_for_status()
            data = resp.json()
            return data["candidates"][0]["content"]["parts"][0]["text"]

    async def generateStructured(
        self, prompt: str, schema: Dict[str, Any], system_instruction: Optional[str] = None
    ) -> Dict[str, Any]:
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY is not configured")
        url = f"{self.base_url}/models/{self.model_name}:generateContent?key={self.api_key}"
        contents = []
        if system_instruction:
            contents.append({"role": "user", "parts": [{"text": f"System Instructions: {system_instruction}"}]})
            contents.append({"role": "model", "parts": [{"text": "Understood. I will output strictly valid JSON matching the schema."}]})
        contents.append({"role": "user", "parts": [{"text": prompt}]})

        payload = {
            "contents": contents,
            "generationConfig": {
                "responseMimeType": "application/json"
            }
        }
        async with httpx.AsyncClient(timeout=45.0) as client:
            resp = await client.post(url, json=payload)
            resp.raise_for_status()
            data = resp.json()
            text = data["candidates"][0]["content"]["parts"][0]["text"]
            return json.loads(text)

    async def embed(self, texts: List[str]) -> List[List[float]]:
        # Using text-embedding-004
        if not self.api_key:
            return [[] for _ in texts]
        url = f"{self.base_url}/models/text-embedding-004:batchEmbedContents?key={self.api_key}"
        requests = [{"model": "models/text-embedding-004", "content": {"parts": [{"text": t}]}} for t in texts]
        try:
            async with httpx.AsyncClient(timeout=20.0) as client:
                resp = await client.post(url, json={"requests": requests})
                if resp.status_code == 200:
                    data = resp.json()
                    return [e["values"] for e in data.get("embeddings", [])]
        except Exception as e:
            logger.warning(f"Gemini embedding call failed: {e}")
        return [[] for _ in texts]

    async def healthCheck(self) -> bool:
        if not self.api_key:
            self._is_healthy = False
            return False
        try:
            url = f"{self.base_url}/models?key={self.api_key}"
            async with httpx.AsyncClient(timeout=5.0) as client:
                resp = await client.get(url)
                self._is_healthy = resp.status_code == 200
                return self._is_healthy
        except Exception:
            self._is_healthy = False
            return False

    def getModelInfo(self) -> ModelInfo:
        return ModelInfo(
            providerName="Google Gemini API",
            modelName=self.model_name,
            isLocal=False,
            isFree=False,
            contextWindow=1048576,
            quantization=None,
            status="healthy" if self._is_healthy else ("unhealthy" if self.api_key else "offline")
        )

    def estimateResourceRequirements(self) -> HardwareEstimate:
        return HardwareEstimate(
            recommendedRamGb=2.0,
            recommendedVramGb=0.0,
            cpuCores=1,
            supportsCpuInference=True,
            statusNotice="Cloud hosted: negligible local compute required."
        )
