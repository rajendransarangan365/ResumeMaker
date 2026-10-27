"""
Base Agent Abstract Class
"""

import time
import logging
from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
from ..providers.base import ModelProvider
from ..schemas.orchestration import AgentStepLog

logger = logging.getLogger("BaseAgent")

class BaseAgent(ABC):
    def __init__(self, name: str, provider: ModelProvider):
        self.name = name
        self.provider = provider
        self.logger = logging.getLogger(f"Agent.{name}")

    def log_step(self, step_name: str, status: str, duration_ms: int, message: str = "") -> AgentStepLog:
        return AgentStepLog(
            agentName=self.name,
            stepName=step_name,
            status=status,
            durationMs=duration_ms,
            message=message,
            timestamp=time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        )
