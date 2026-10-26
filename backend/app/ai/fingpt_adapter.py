"""
FinGPT Adapter — Uses Hugging Face Inference API to run FinGPT models.

Supported models (must be accepted on HuggingFace first):
  - FinGPT/fingpt-forecaster_dow30_llama2-7b_lora  (sentiment/forecasting)
  - FinGPT/fingpt-mt_llama2-7b-lora                (multi-task)

NOTE: HuggingFace Inference API for private/gated models requires:
  1. A HuggingFace account and API token (https://huggingface.co/settings/tokens)
  2. Accepting the model license on the model's HF page
  3. A HuggingFace Pro subscription (for private models) OR waiting for free quota

The adapter sends requests to:
  https://api-inference.huggingface.co/models/<model-id>

FinGPT models are instruction-tuned; prompts are formatted accordingly.
"""
import logging

import httpx

from app.ai.base import AIResponse, BaseAIAdapter, ChatMessage
from app.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

FINGPT_SYSTEM = (
    "You are FinGPT, an AI assistant specialised in financial literacy for Indian markets. "
    "Provide clear, educational explanations about saving, investing, budgeting, mutual funds, "
    "SIP, PPF, NPS, and fraud detection. "
    "Always clarify that your responses are educational and not regulated financial advice."
)


class FinGPTAdapter(BaseAIAdapter):
    """Wraps the Hugging Face Inference API for FinGPT models."""

    def __init__(self) -> None:
        self._token = settings.huggingface_token
        self._model_id = settings.fingpt_model_id
        self._api_url = f"https://api-inference.huggingface.co/models/{self._model_id}"

    @property
    def provider_name(self) -> str:
        return "FinGPT (Hugging Face Inference API)"

    @property
    def model_name(self) -> str:
        return self._model_id

    def _build_prompt(self, messages: list[ChatMessage], system: str) -> str:
        """Format messages as a FinGPT instruction prompt."""
        lines = [f"[INST] <<SYS>>\n{system}\n<</SYS>>\n"]
        for msg in messages:
            if msg.role == "user":
                lines.append(f"\nUser: {msg.content}")
            elif msg.role == "assistant":
                lines.append(f"\nAssistant: {msg.content}")
        lines.append("\nAssistant: [/INST]")
        return "".join(lines)

    async def chat(
        self,
        messages: list[ChatMessage],
        system_prompt: str | None = None,
    ) -> AIResponse:
        if not self._token:
            raise RuntimeError(
                "HUGGINGFACE_TOKEN is not set. "
                "Get a token at https://huggingface.co/settings/tokens and set it in backend/.env"
            )

        prompt = self._build_prompt(messages, system_prompt or FINGPT_SYSTEM)
        payload = {
            "inputs": prompt,
            "parameters": {
                "max_new_tokens": 512,
                "temperature": 0.7,
                "return_full_text": False,
            },
        }
        headers = {"Authorization": f"Bearer {self._token}"}

        async with httpx.AsyncClient(timeout=60) as client:
            resp = await client.post(self._api_url, json=payload, headers=headers)

        if resp.status_code == 401:
            raise RuntimeError("Invalid Hugging Face token. Check HUGGINGFACE_TOKEN in backend/.env")
        if resp.status_code == 403:
            raise RuntimeError(
                f"Access denied to model {self._model_id}. "
                "Visit the model page on HuggingFace and accept the license."
            )
        if resp.status_code == 503:
            raise RuntimeError(
                f"Model {self._model_id} is loading. Try again in 20–60 seconds."
            )

        resp.raise_for_status()
        data = resp.json()

        if isinstance(data, list) and data:
            text = data[0].get("generated_text", "")
        else:
            text = str(data)

        # Strip the echoed prompt if present
        if "[/INST]" in text:
            text = text.split("[/INST]", 1)[-1].strip()

        return AIResponse(text=text, provider=self.provider_name, model=self._model_id)

    async def is_ready(self) -> bool:
        if not self._token:
            return False
        try:
            async with httpx.AsyncClient(timeout=10) as client:
                resp = await client.get(
                    f"https://api-inference.huggingface.co/models/{self._model_id}",
                    headers={"Authorization": f"Bearer {self._token}"},
                )
            return resp.status_code in (200, 503)  # 503 = loading but exists
        except Exception:
            return False
