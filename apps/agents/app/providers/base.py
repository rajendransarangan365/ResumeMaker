"""
ModelProvider Base Abstraction
Allows interchangeable switching between Local Ollama, Gemini API, and Deterministic Fallback.
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
from pydantic import BaseModel

class ModelInfo(BaseModel):
    providerName: str
    modelName: str
    isLocal: bool
    isFree: bool
    contextWindow: int
    quantization: Optional[str] = None
    status: str  # 'healthy' | 'unhealthy' | 'offline'

class HardwareEstimate(BaseModel):
    recommendedRamGb: float
    recommendedVramGb: float
    cpuCores: int
    supportsCpuInference: bool
    statusNotice: str

class ModelProvider(ABC):
    """
    Abstract Model Provider Interface
    Required methods:
    - generate()
    - generateStructured()
    - embed()
    - healthCheck()
    - getModelInfo()
    - estimateResourceRequirements()
    """

    @abstractmethod
    async def generate(self, prompt: str, system_instruction: Optional[str] = None) -> str:
        """Generate freeform text completion"""
        pass

    @abstractmethod
    async def generateStructured(
        self, prompt: str, schema: Dict[str, Any], system_instruction: Optional[str] = None
    ) -> Dict[str, Any]:
        """Generate strictly structured JSON adhering to the provided schema"""
        pass

    @abstractmethod
    async def embed(self, texts: List[str]) -> List[List[float]]:
        """Generate semantic vector embeddings for a list of texts"""
        pass

    @abstractmethod
    async def healthCheck(self) -> bool:
        """Verify provider availability and runtime connectivity"""
        pass

    @abstractmethod
    def getModelInfo(self) -> ModelInfo:
        """Return provider and model metadata"""
        pass

    @abstractmethod
    def estimateResourceRequirements(self) -> HardwareEstimate:
        """Estimate RAM/VRAM requirements for running this model"""
        pass
