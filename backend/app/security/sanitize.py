"""Input sanitisation helpers."""
import html
import re


def sanitize_input(text: str, max_length: int = 4000) -> str:
    """
    Basic sanitisation to protect against prompt injection.
    - Strip HTML tags
    - Truncate to max_length
    - Remove null bytes
    """
    text = text[:max_length]
    text = text.replace("\x00", "")
    # Strip HTML
    text = re.sub(r"<[^>]+>", "", text)
    text = html.unescape(text)
    # Collapse excessive whitespace
    text = re.sub(r"\s{3,}", "\n\n", text)
    return text.strip()
