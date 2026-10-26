"""
Financial Calculator Service.
All calculations use correct monthly compounding.
Results are educational projections, not guaranteed returns.
"""
import math
from dataclasses import dataclass


# ─────────────────────── SIP ───────────────────────

@dataclass
class SIPResult:
    monthly_investment: float
    annual_return_pct: float
    duration_months: int
    total_invested: float
    estimated_future_value: float
    estimated_gains: float
    disclaimer: str = (
        "This is an educational projection. Actual mutual fund returns vary and "
        "are not guaranteed. Past performance does not indicate future results."
    )


def calculate_sip(
    monthly_investment: float,
    annual_return_pct: float,
    duration_months: int,
) -> SIPResult:
    """
    SIP future value using standard compound-interest formula:
      FV = P × [((1 + r)^n - 1) / r] × (1 + r)
    where r = monthly rate, n = number of months.
    """
    if monthly_investment <= 0:
        raise ValueError("Monthly investment must be positive.")
    if duration_months <= 0:
        raise ValueError("Duration must be at least 1 month.")
    if annual_return_pct < 0:
        raise ValueError("Annual return cannot be negative.")

    total_invested = monthly_investment * duration_months

    if annual_return_pct == 0:
        return SIPResult(
            monthly_investment=monthly_investment,
            annual_return_pct=annual_return_pct,
            duration_months=duration_months,
            total_invested=round(total_invested, 2),
            estimated_future_value=round(total_invested, 2),
            estimated_gains=0.0,
        )

    r = annual_return_pct / 100 / 12  # monthly rate
    n = duration_months
    fv = monthly_investment * (((1 + r) ** n - 1) / r) * (1 + r)

    return SIPResult(
        monthly_investment=monthly_investment,
        annual_return_pct=annual_return_pct,
        duration_months=duration_months,
        total_invested=round(total_invested, 2),
        estimated_future_value=round(fv, 2),
        estimated_gains=round(fv - total_invested, 2),
    )


# ─────────────────────── SWP ───────────────────────

@dataclass
class SWPResult:
    initial_investment: float
    monthly_withdrawal: float
    annual_return_pct: float
    duration_months: int
    estimated_remaining_balance: float
    total_withdrawn: float
    disclaimer: str = (
        "This is an educational projection. Actual fund NAV and returns vary. "
        "SWP does not guarantee a fixed balance."
    )


def calculate_swp(
    initial_investment: float,
    monthly_withdrawal: float,
    annual_return_pct: float,
    duration_months: int,
) -> SWPResult:
    """
    SWP remaining balance simulation using month-by-month compounding.
    Each month: balance grows by monthly rate, then withdrawal is deducted.
    """
    if initial_investment <= 0:
        raise ValueError("Initial investment must be positive.")
    if monthly_withdrawal < 0:
        raise ValueError("Monthly withdrawal cannot be negative.")
    if duration_months <= 0:
        raise ValueError("Duration must be at least 1 month.")
    if annual_return_pct < 0:
        raise ValueError("Annual return cannot be negative.")

    r = annual_return_pct / 100 / 12
    balance = initial_investment
    total_withdrawn = 0.0

    for _ in range(duration_months):
        balance = balance * (1 + r)
        withdrawal = min(monthly_withdrawal, max(balance, 0))
        balance -= withdrawal
        total_withdrawn += withdrawal
        if balance <= 0:
            balance = 0.0
            break

    return SWPResult(
        initial_investment=initial_investment,
        monthly_withdrawal=monthly_withdrawal,
        annual_return_pct=annual_return_pct,
        duration_months=duration_months,
        estimated_remaining_balance=round(balance, 2),
        total_withdrawn=round(total_withdrawn, 2),
    )


# ─────────────────────── PPF ───────────────────────

@dataclass
class PPFResult:
    annual_investment: float
    duration_years: int
    assumed_annual_rate_pct: float
    total_invested: float
    estimated_maturity_value: float
    estimated_interest_earned: float
    notes: str = (
        "PPF interest rate is set quarterly by the Government of India and may change. "
        "As of Oct 2024 the rate is 7.1% p.a. compounded annually. "
        "Maximum annual deposit: ₹1,50,000. Minimum lock-in: 15 years. "
        "This projection uses the user-provided rate and is educational only."
    )
    disclaimer: str = (
        "Verify current PPF rules at https://www.nsiindia.gov.in or your bank."
    )


def calculate_ppf(
    annual_investment: float,
    duration_years: int,
    assumed_annual_rate_pct: float = 7.1,
) -> PPFResult:
    """
    PPF maturity value using annual compounding.
    Contributions made at the start of each year.
    """
    if annual_investment <= 0:
        raise ValueError("Annual investment must be positive.")
    if annual_investment > 150_000:
        raise ValueError("PPF annual deposit cannot exceed ₹1,50,000.")
    if duration_years < 15:
        raise ValueError("PPF minimum lock-in is 15 years.")
    if assumed_annual_rate_pct <= 0:
        raise ValueError("Annual rate must be positive.")

    r = assumed_annual_rate_pct / 100
    # Annuity-due (payment at start of year)
    fv = annual_investment * (((1 + r) ** duration_years - 1) / r) * (1 + r)
    total_invested = annual_investment * duration_years

    return PPFResult(
        annual_investment=annual_investment,
        duration_years=duration_years,
        assumed_annual_rate_pct=assumed_annual_rate_pct,
        total_invested=round(total_invested, 2),
        estimated_maturity_value=round(fv, 2),
        estimated_interest_earned=round(fv - total_invested, 2),
    )


# ─────────────────────── NPS ───────────────────────

@dataclass
class NPSResult:
    monthly_contribution: float
    duration_years: int
    assumed_annual_return_pct: float
    total_contributed: float
    estimated_corpus: float
    estimated_lump_sum_60pct: float
    estimated_annuity_corpus_40pct: float
    notes: str = (
        "NPS returns depend on asset allocation (Equity/Bonds/Govt Securities) and fund manager. "
        "At age 60 you may withdraw up to 60% as lump sum (tax-free) and must invest at least 40% in annuity. "
        "This projection is for educational illustration only."
    )


def calculate_nps(
    monthly_contribution: float,
    duration_years: int,
    assumed_annual_return_pct: float = 10.0,
) -> NPSResult:
    """NPS corpus estimate using SIP-style monthly compounding."""
    if monthly_contribution <= 0:
        raise ValueError("Monthly contribution must be positive.")
    if duration_years <= 0:
        raise ValueError("Duration must be positive.")
    if assumed_annual_return_pct < 0:
        raise ValueError("Annual return cannot be negative.")

    result = calculate_sip(monthly_contribution, assumed_annual_return_pct, duration_years * 12)
    corpus = result.estimated_future_value
    lump_sum = corpus * 0.60
    annuity = corpus * 0.40

    return NPSResult(
        monthly_contribution=monthly_contribution,
        duration_years=duration_years,
        assumed_annual_return_pct=assumed_annual_return_pct,
        total_contributed=result.total_invested,
        estimated_corpus=round(corpus, 2),
        estimated_lump_sum_60pct=round(lump_sum, 2),
        estimated_annuity_corpus_40pct=round(annuity, 2),
    )
