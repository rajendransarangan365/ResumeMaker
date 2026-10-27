"""
Local Ollama Model Provider
Connects to locally running Ollama instance (default: http://localhost:11434).
100% Free, Private, Local Inference.
"""

import json
import logging
from typing import Dict, Any, List, Optional
import httpx
from .base import ModelProvider, ModelInfo, HardwareEstimate

logger = logging.getLogger("OllamaProvider")

class OllamaProvider(ModelProvider):
    def __init__(self, host: str = "http://localhost:11434", model_name: str = "llama3.2"):
        self.host = host.rstrip("/")
        self.model_name = model_name
        self._is_healthy = False

    async def generate(self, prompt: str, system_instruction: Optional[str] = None) -> str:
        url = f"{self.host}/api/generate"
        payload = {
            "model": self.model_name,
            "prompt": prompt,
            "system": system_instruction or "",
            "stream": False
        }
        async with httpx.AsyncClient(timeout=60.0) as client:
            resp = await client.post(url, json=payload)
            resp.raise_for_status()
            data = resp.json()
            return data.get("response", "")

    async def generateStructured(
        self, prompt: str, schema: Dict[str, Any], system_instruction: Optional[str] = None
    ) -> Dict[str, Any]:
        url = f"{self.host}/api/generate"
        schema_json = json.dumps(schema)
        augmented_prompt = f"{prompt}\n\nYou MUST respond with valid JSON adhering strictly to this JSON schema:\n{schema_json}"
        payload = {
            "model": self.model_name,
            "prompt": augmented_prompt,
            "system": (system_instruction or "") + "\nStrictly output valid JSON only. Do not add markdown backticks.",
            "format": "json",
            "stream": False
        }
        async with httpx.AsyncClient(timeout=90.0) as client:
            resp = await client.post(url, json=payload)
            resp.raise_for_status()
            data = resp.json()
            raw_text = data.get("response", "{}")
            return json.loads(raw_text)

    async def embed(self, texts: List[str]) -> List[List[float]]:
        url = f"{self.host}/api/embeddings"
        embeddings = []
        async with httpx.AsyncClient(timeout=30.0) as client:
            for text in texts:
                resp = await client.post(url, json={"model": self.model_name, "prompt": text})
                if resp.status_code == 200:
                    embeddings.append(resp.json().get("embedding", []))
                else:
                    embeddings.append([])
        return embeddings

    async def healthCheck(self) -> bool:
        try:
            async with httpx.AsyncClient(timeout=3.0) as client:
                resp = await client.get(f"{self.host}/api/tags")
                self._is_healthy = resp.status_code == 200
                return self._is_healthy
        except Exception:
            self._is_healthy = False
            return False

    def getModelInfo(self) -> ModelInfo:
        return ModelInfo(
            providerName="Ollama Local",
            modelName=self.model_name,
            isLocal=True,
            isFree=True,
            contextWindow=8192,
            quantization="Q4_K_M (Default)",
            status="healthy" if self._is_healthy else "offline"
        )

    def estimateResourceRequirements(self) -> HardwareEstimate:
        # Standard estimates based on model size
        if "3b" in self.model_name.lower():
            return HardwareEstimate(
                recommendedRamGb=8.0,
                recommendedVramGb=4.0,
                cpuCores=4,
                supportsCpuInference=True,
                statusNotice="Lightweight 3B model: runs smoothly on modern laptops with or without dedicated GPU."
            )
        elif "7b" in self.model_name.lower() or "8b" in self.model_name.lower():
            return HardwareEstimate(
                recommendedRamGb=16.0,
                recommendedVramGb=6.0,
                cpuCores=6,
                supportsCpuInference=True,
                statusNotice="7B/8B model: requires 16GB RAM for CPU inference or 6GB VRAM for GPU acceleration."
            )
        else:
            return HardwareEstimate(
                recommendedRamGb=16.0,
                recommendedVramGb=8.0,
                cpuCores=8,
                supportsCpuInference=True,
                statusNotice="Standard local instruct model."
            )
