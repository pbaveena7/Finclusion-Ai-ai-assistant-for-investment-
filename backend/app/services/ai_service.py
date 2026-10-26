"""
AI Service — provider dispatcher.
Selects the correct adapter based on AI_PROVIDER env var.
"""
from functools import lru_cache

from app.ai.base import AIResponse, BaseAIAdapter, ChatMessage
from app.config import get_settings

settings = get_settings()


class NoneAdapter(BaseAIAdapter):
    """Placeholder adapter when no AI provider is configured."""

    @property
    def provider_name(self) -> str:
        return "none"

    @property
    def model_name(self) -> str:
        return "none"

    async def chat(self, messages, system_prompt=None) -> AIResponse:
        raise RuntimeError(
            "No AI provider is configured. "
            "Set AI_PROVIDER in backend/.env to 'openai', 'ollama', or 'fingpt' "
            "and supply the required credentials."
        )

    async def is_ready(self) -> bool:
        return False


@lru_cache(maxsize=1)
def get_ai_adapter() -> BaseAIAdapter:
    provider = settings.ai_provider
    if provider == "fingpt":
        from app.ai.fingpt_adapter import FinGPTAdapter
        return FinGPTAdapter()
    if provider in ("openai", "ollama"):
        from app.ai.hosted_adapter import HostedAIAdapter
        return HostedAIAdapter()
    return NoneAdapter()
