"""
Fraud Detection Service — Heuristic analysis of suspicious messages and URLs.

IMPORTANT: Results are risk INDICATORS, not definitive proof of fraud.
The system never automatically visits suspicious URLs.
"""
import re
from dataclasses import dataclass, field
from urllib.parse import urlparse


# ─── Suspicious pattern library ────────────────────────────────────────────

URGENCY_PATTERNS = [
    r"\bact now\b", r"\blimited time\b", r"\bexpires? (today|tonight|in \d+ hours?)\b",
    r"\burgen[ct]\b", r"\bimmediately\b", r"\bdo not delay\b", r"\blast chance\b",
    r"\bonly \d+ (spots?|seats?|units?) left\b",
]

GUARANTEED_RETURN_PATTERNS = [
    r"\bguaranteed (profit|return|income)\b",
    r"\b(100|1000)%\s*(safe|secure|profit|return)\b",
    r"\bdouble your (money|investment) in\b",
    r"\brisk[\-\s]?free investment\b",
    r"\bno risk\b",
    r"\bfixed (return|profit) of \d+%\b",
    r"\b\d{2,3}%\s*(annual|monthly|daily|weekly) (return|profit|interest)\b",
]

SENSITIVE_INFO_PATTERNS = [
    r"\b(otp|one[\-\s]?time password)\b",
    r"\bshare your (pin|password|cvv|account (number|details))\b",
    r"\b(bank account|demat account) (number|details|credentials)\b",
    r"\bclick (?:here )?to (?:verify|confirm|update) your (?:account|kyc|pan|aadhaar)\b",
    r"\bsend (\d+|\$|₹|rs\.?) to (receive|get|unlock)\b",
]

IMPERSONATION_PATTERNS = [
    r"\b(sebi|rbi|amfi|income tax|government of india)\s*(approved|authorised|registered|certified|official)\b",
    r"\bofficial (sebi|rbi|amfi|irdai) (scheme|investment|plan)\b",
    r"\bpm (kisan|modi|cares) (fund|scheme|investment)\b",
    r"\bcelebrity (endorsed|recommended|investment)\b",
]

SUSPICIOUS_PAYMENT_PATTERNS = [
    r"\bpay (?:via|through|using) (upi|paytm|phonepe|gpay|bhim|google pay)\b.{0,50}(receive|get|earn|profit)",
    r"\bsend (\d+|rs\.?|₹|\$)\s*\d*\s*to\b",
    r"\bpay (registration|processing|membership) fee\b",
    r"\bwallet (transfer|payment|top[\-\s]?up)\b.{0,30}(profit|return|earn)",
]

SUSPICIOUS_DOMAINS = [
    r"bit\.ly", r"tinyurl\.com", r"t\.co", r"goo\.gl",
    r"\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}",  # Raw IP address
]


@dataclass
class FraudIndicator:
    category: str
    description: str
    matched_text: str


@dataclass
class FraudCheckResult:
    input_text: str
    risk_level: str  # "low" | "medium" | "high"
    risk_score: int  # 0–100
    indicators: list[FraudIndicator] = field(default_factory=list)
    url_flags: list[str] = field(default_factory=list)
    summary: str = ""
    disclaimer: str = (
        "This is a heuristic analysis and may produce false positives or miss novel scams. "
        "When in doubt, verify directly with your bank or SEBI at https://scores.sebi.gov.in"
    )


def _find_matches(text: str, patterns: list[str], category: str, description_template: str) -> list[FraudIndicator]:
    indicators = []
    lower = text.lower()
    for pattern in patterns:
        m = re.search(pattern, lower)
        if m:
            indicators.append(FraudIndicator(
                category=category,
                description=description_template,
                matched_text=m.group(0),
            ))
    return indicators


def _check_url(url: str) -> list[str]:
    flags = []
    try:
        parsed = urlparse(url if url.startswith("http") else "https://" + url)
        hostname = parsed.netloc.lower()

        for pattern in SUSPICIOUS_DOMAINS:
            if re.search(pattern, hostname):
                flags.append(f"Suspicious/shortened domain: {hostname}")
                break

        if not parsed.scheme in ("http", "https"):
            flags.append(f"Non-HTTP scheme: {parsed.scheme}")

        if hostname.count(".") > 4:
            flags.append(f"Unusual number of subdomains in: {hostname}")

        # Typosquatting checks for common financial brands
        legit_brands = ["sebi", "rbi", "amfi", "zerodha", "groww", "sbi", "hdfc", "icici", "axis"]
        for brand in legit_brands:
            if brand in hostname and not hostname.endswith(f".{brand}.gov.in") and not hostname == f"{brand}.gov.in":
                # crude check — may flag legitimate subdomains
                suspicious_patterns = [f"{brand}-", f"-{brand}", f"{brand}0", f"{brand}1"]
                if any(p in hostname for p in suspicious_patterns):
                    flags.append(f"Possible impersonation of '{brand}' in: {hostname}")

    except Exception:
        flags.append("Could not parse URL")
    return flags


def analyze_message(text: str) -> FraudCheckResult:
    """Run heuristic fraud analysis on text (message or URL)."""
    if not text or not text.strip():
        raise ValueError("Input text cannot be empty.")

    indicators: list[FraudIndicator] = []
    url_flags: list[str] = []

    # Extract and check URLs from text
    urls = re.findall(r"https?://\S+|www\.\S+", text, re.IGNORECASE)
    for url in urls:
        url_flags.extend(_check_url(url))

    # If input looks like a standalone URL
    if re.match(r"^(https?://|www\.)\S+$", text.strip(), re.IGNORECASE):
        url_flags.extend(_check_url(text.strip()))

    # Run pattern checks
    indicators += _find_matches(text, URGENCY_PATTERNS, "Urgency", "Creates artificial urgency to pressure you into acting without thinking.")
    indicators += _find_matches(text, GUARANTEED_RETURN_PATTERNS, "Guaranteed Returns", "Promises of guaranteed or unusually high returns are a classic fraud indicator. No legitimate investment guarantees returns.")
    indicators += _find_matches(text, SENSITIVE_INFO_PATTERNS, "Sensitive Info Request", "Requests for OTPs, passwords, PINs, or account details. Legitimate institutions never ask for these via messages.")
    indicators += _find_matches(text, IMPERSONATION_PATTERNS, "Impersonation", "Claims government/SEBI/RBI approval or celebrity endorsement — common in investment scams.")
    indicators += _find_matches(text, SUSPICIOUS_PAYMENT_PATTERNS, "Suspicious Payment", "Asks you to pay money to receive money — a hallmark of advance-fee fraud.")

    # Score
    score = min(
        len(indicators) * 20 + len(url_flags) * 15,
        100,
    )

    if score == 0:
        risk_level = "low"
        summary = "No obvious fraud indicators detected. Always stay cautious with unsolicited financial messages."
    elif score < 40:
        risk_level = "medium"
        summary = "Some suspicious patterns detected. Verify this independently before taking any action."
    else:
        risk_level = "high"
        summary = "Multiple high-risk fraud indicators detected. Do NOT share personal or financial details. Report to cybercrime.gov.in."

    return FraudCheckResult(
        input_text=text[:500],  # truncate for storage
        risk_level=risk_level,
        risk_score=score,
        indicators=indicators,
        url_flags=url_flags,
        summary=summary,
    )
