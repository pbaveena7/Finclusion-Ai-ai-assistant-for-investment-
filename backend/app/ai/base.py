"""
AI Adapter Base — Abstract interface every AI provider must implement.
"""
from abc import ABC, abstractmethod
from dataclasses import dataclass


@dataclass
class ChatMessage:
    role: str  # "user" | "assistant" | "system"
    content: str


@dataclass
class AIResponse:
    text: str
    provider: str
    model: str
    disclaimer: str = (
        "This is educational information only. "
        "It is not regulated financial or investment advice. "
        "Consult a SEBI-registered financial advisor before making investment decisions."
    )


class BaseAIAdapter(ABC):
    """All AI adapters must implement this interface."""

    @abstractmethod
    async def chat(
        self,
        messages: list[ChatMessage],
        system_prompt: str | None = None,
    ) -> AIResponse:
        """Send a conversation and return the assistant's reply."""

    @abstractmethod
    async def is_ready(self) -> bool:
        """Return True if the provider is configured and reachable."""

    @property
    @abstractmethod
    def provider_name(self) -> str:
        """Human-readable provider name."""

    @property
    @abstractmethod
    def model_name(self) -> str:
        """Model identifier being used."""
