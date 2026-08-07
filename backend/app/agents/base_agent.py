from abc import ABC, abstractmethod
import time
from typing import Any, Dict
from app.core.logger import logger


class BaseAgent(ABC):
    def __init__(self, agent_name: str):
        self.agent_name = agent_name

    async def execute(self, session_id: str, context: Dict[str, Any]) -> Dict[str, Any]:
        start_time = time.perf_counter()
        logger.info(f"Agent [{self.agent_name}] execution started", session_id=session_id)
        try:
            result = await self.process(session_id, context)
            duration = (time.perf_counter() - start_time) * 1000.0
            logger.info(f"Agent [{self.agent_name}] completed", session_id=session_id, duration_ms=duration)
            result["_agent_metadata"] = {
                "agent_name": self.agent_name,
                "execution_time_ms": round(duration, 2)
            }
            return result
        except Exception as e:
            logger.error(f"Agent [{self.agent_name}] failed", session_id=session_id, error=str(e))
            raise

    @abstractmethod
    async def process(self, session_id: str, context: Dict[str, Any]) -> Dict[str, Any]:
        pass
