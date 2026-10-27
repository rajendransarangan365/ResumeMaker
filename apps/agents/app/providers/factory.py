"""
Provider Factory
Resolves the active ModelProvider with automatic fallback resilience.
"""

import os
import logging
from typing import Optional
from .base import ModelProvider
from .ollama_provider import OllamaProvider
from .gemini_provider import GeminiProvider
from .fallback_provider import FallbackProvider

logger = logging.getLogger("ProviderFactory")

class ProviderFactory:
    _instance: Optional[ModelProvider] = None

    @classmethod
    def get_provider(cls, preferred: Optional[str] = None) -> ModelProvider:
        provider_type = preferred or os.getenv("AI_PROVIDER", "auto").lower()

        # 1. Explicit Ollama
        if provider_type == "ollama" or provider_type == "local":
            host = os.getenv("OLLAMA_HOST", "http://localhost:11434")
            model = os.getenv("OLLAMA_MODEL", "llama3.2")
            return OllamaProvider(host=host, model_name=model)

        # 2. Explicit Gemini
        if provider_type == "gemini":
            api_key = os.getenv("GEMINI_API_KEY", "")
            model = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
            return GeminiProvider(api_key=api_key, model_name=model)

        # 3. Explicit Fallback
        if provider_type == "fallback" or provider_type == "deterministic":
            return FallbackProvider()

        # 4. Auto: Check Gemini Key -> Check Ollama -> Fallback
        gemini_key = os.getenv("GEMINI_API_KEY", "").strip()
        if gemini_key:
            model = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
            return GeminiProvider(api_key=gemini_key, model_name=model)

        # Default to Fallback for 100% offline free safety
        return FallbackProvider()
