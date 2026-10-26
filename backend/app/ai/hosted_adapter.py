"""
Hosted AI Adapter — Wraps OpenAI-compatible APIs.

Works with:
  - OpenAI (default, AI_PROVIDER=openai)
  - Ollama local server (AI_PROVIDER=ollama, set LLM_BASE_URL=http://localhost:11434/v1)
  - Azure OpenAI (set LLM_BASE_URL to your Azure endpoint)
  - Any OpenAI-compatible server

This adapter is clearly labelled so the frontend can show which provider is responding.
"""
import re
import logging

import httpx
from openai import AsyncOpenAI, APIConnectionError, AuthenticationError

from app.ai.base import AIResponse, BaseAIAdapter, ChatMessage
from app.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

FINANCE_SYSTEM = (
    "You are Finclusion AI, an educational financial literacy assistant for Indian users. "
    "You help beginners understand saving, budgeting, SIP, mutual funds, PPF, NPS, SWP, "
    "emergency funds, risk tolerance, and fraud detection. "
    "CRITICAL FORMATTING INSTRUCTION: Write in natural, clean, normal plain paragraphs and simple numbered sentences. "
    "DO NOT use markdown symbols such as asterisks (** or *), hashtags (### or ##), pipes (|), tables, dashes, or bullet symbols. "
    "Keep all explanations in clean, smooth plain text without any formatting characters or symbols. "
    "Always clarify that your answers are educational information, not regulated investment advice. "
    "Be concise, friendly, and use simple language. "
    "When relevant, mention SEBI, RBI, or AMFI as official sources."
)


def strip_markdown_symbols(text: str) -> str:
    """Strips markdown asterisks, hashes, pipes, and raw symbols for clean plain text output."""
    if not text:
        return ""
    # Remove bold/italic asterisks and underscores
    t = re.sub(r'[*_~`#]', '', text)
    # Remove markdown table pipe borders
    t = re.sub(r'\|+', ' ', t)
    # Remove markdown link formatting [text](url) -> text
    t = re.sub(r'\[(.*?)\]\(.*?\)', r'\1', t)
    # Clean up repeated dashes or equals used as headers
    t = re.sub(r'^[=\-]{2,}\s*$', '', t, flags=re.MULTILINE)
    # Clean up double bullet dashes at start of lines into clean text
    t = re.sub(r'^\s*[-+*]\s+', '• ', t, flags=re.MULTILINE)
    # Clean up multi-spaces and excessive blank lines
    t = re.sub(r'\n{3,}', '\n\n', t)
    return t.strip()


class HostedAIAdapter(BaseAIAdapter):
    """Wraps the OpenAI Python SDK for any OpenAI-compatible inference API."""

    def __init__(self) -> None:
        self._api_key = settings.llm_api_key
        self._model = settings.model_id
        self._base_url = settings.llm_base_url or None
        self._provider = settings.ai_provider

    @property
    def provider_name(self) -> str:
        if self._provider == "ollama":
            return f"Ollama (local, {self._base_url})"
        if self._base_url and "groq.com" in self._base_url:
            return f"Groq ({self._model})"
        return f"OpenAI ({self._model})"

    @property
    def model_name(self) -> str:
        return self._model

    def _client(self) -> AsyncOpenAI:
        kwargs: dict = {"api_key": self._api_key or "sk-placeholder"}
        if self._base_url:
            kwargs["base_url"] = self._base_url
        return AsyncOpenAI(**kwargs)

    async def chat(
        self,
        messages: list[ChatMessage],
        system_prompt: str | None = None,
    ) -> AIResponse:
        if not self._api_key and self._provider != "ollama":
            raise RuntimeError(
                "LLM_API_KEY is not set. "
                "Get an OpenAI API key at https://platform.openai.com/api-keys and set it in backend/.env"
            )

        api_messages = [{"role": "system", "content": system_prompt or FINANCE_SYSTEM}]
        for m in messages:
            api_messages.append({"role": m.role, "content": m.content})

        client = self._client()
        try:
            response = await client.chat.completions.create(
                model=self._model,
                messages=api_messages,
                temperature=0.7,
                max_tokens=850,
            )
        except AuthenticationError:
            raise RuntimeError(
                "OpenAI API key is invalid. Check LLM_API_KEY in backend/.env"
            )
        except APIConnectionError as e:
            raise RuntimeError(f"Cannot reach the AI provider: {e}")

        raw_text = response.choices[0].message.content or ""
        clean_text = strip_markdown_symbols(raw_text)
        return AIResponse(text=clean_text, provider=self.provider_name, model=self._model)

    async def is_ready(self) -> bool:
        if not self._api_key and self._provider != "ollama":
            return False
        try:
            client = self._client()
            await client.models.list()
            return True
        except Exception:
            return False
