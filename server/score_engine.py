#!/usr/bin/env python3
"""
SignalSniper Score™ Engine
Calculates proprietary intelligence score from multi-agent analysis.
"""

import os
from typing import Dict, List, Optional
from enum import Enum

class ScoreRating(str, Enum):
    EXCEPTIONAL = "EXCEPTIONAL SETUP"
    STRONG = "STRONG SETUP"
    MODERATE = "MODERATE SETUP"
    WEAK = "WEAK SETUP"
    AVOID = "HIGH RISK / AVOID"

class ScoreGrade(str, Enum):
    A_PLUS = "A+"
    A = "A"
    B = "B"
    C = "C"
    D = "D"
    F = "F"

# Default weights (configurable)
DEFAULT_WEIGHTS = {
    "technical_validation": 0.30,
    "risk_quality": 0.25,
    "market_context": 0.20,
    "historical_pattern": 0.15,
    "contrarian_analysis": 0.10
}

def calculate_sniper_score(
    validation_score: int,
    risk_score: int,
    contrarian_score: int,
    market_context_score: int,
    historical_score: int,
    weights: Optional[Dict[str, float]] = None
) -> int:
    """Calculate SignalSniper Score™ (0-100)."""
    w = weights or DEFAULT_WEIGHTS

    score = (
        validation_score * w["technical_validation"] +
        risk_score * w["risk_quality"] +
        market_context_score * w["market_context"] +
        historical_score * w["historical_pattern"] +
        contrarian_score * w["contrarian_analysis"]
    )

    return int(round(score))

def classify_score(score: int) -> ScoreRating:
    """Classify score into rating category."""
    if score >= 90:
        return ScoreRating.EXCEPTIONAL
    elif score >= 75:
        return ScoreRating.STRONG
    elif score >= 60:
        return ScoreRating.MODERATE
    elif score >= 40:
        return ScoreRating.WEAK
    return ScoreRating.AVOID

def score_to_grade(score: int) -> ScoreGrade:
    """Convert score to letter grade."""
    if score >= 97:
        return ScoreGrade.A_PLUS
    elif score >= 93:
        return ScoreGrade.A
    elif score >= 87:
        return ScoreGrade.B
    elif score >= 75:
        return ScoreGrade.C
    elif score >= 60:
        return ScoreGrade.D
    return ScoreGrade.F

def identify_strengths(
    validation_score: int,
    risk_score: int,
    contrarian_score: int,
    market_context_score: int,
    historical_score: int
) -> List[str]:
    """Identify signal strengths based on scores."""
    strengths = []

    if validation_score >= 80:
        strengths.append("Strong technical confirmation")
    if risk_score >= 80:
        strengths.append("Favorable risk profile")
    if contrarian_score >= 75:
        strengths.append("Low contradiction risk")
    if market_context_score >= 80:
        strengths.append("Supportive market environment")
    if historical_score >= 75:
        strengths.append("Positive historical pattern")

    return strengths or ["Basic signal structure"]

def identify_weaknesses(
    validation_score: int,
    risk_score: int,
    contrarian_score: int,
    market_context_score: int,
    historical_score: int
) -> List[str]:
    """Identify signal weaknesses based on scores."""
    weaknesses = []

    if validation_score < 60:
        weaknesses.append("Weak technical confirmation")
    if risk_score < 50:
        weaknesses.append("High risk exposure")
    if contrarian_score < 50:
        weaknesses.append("Contrarian concerns identified")
    if market_context_score < 60:
        weaknesses.append("Unfavorable market conditions")
    if historical_score < 50:
        weaknesses.append("No historical precedent")

    return weaknesses

def calibrate_confidence(original_confidence: int, sniper_score: int) -> tuple[int, str]:
    """Calibrate confidence against SignalSniper Score™."""
    adjustment = 0
    reasons = []

    if original_confidence > sniper_score + 10:
        adjustment = -8
        reasons.append("AI confidence exceeds supporting evidence")
    elif original_confidence < sniper_score - 10:
        adjustment = +5
        reasons.append("Multiple validation layers support setup")

    adjusted = max(10, min(95, original_confidence + adjustment))
    reason = "; ".join(reasons) if reasons else "Confidence aligned with score"

    return adjusted, reason

def generate_score_report(data: Dict) -> Dict:
    """Generate complete SignalSniper Score™ report."""
    try:
        # Extract scores
        v = int(data.get("validation_score", 50))
        r = int(data.get("risk_score", 50))
        c = int(data.get("contrarian_score", 50))
        m = int(data.get("market_context_score", 50))
        h = int(data.get("historical_score", 50))
        confidence = int(data.get("confidence", 50))

        # Calculate score
        sniper_score = calculate_sniper_score(v, r, c, m, h)
        rating = classify_score(sniper_score)
        grade = score_to_grade(sniper_score)

        # Calibrate confidence
        adjusted_conf, reason = calibrate_confidence(confidence, sniper_score)

        # Identify strengths/weaknesses
        strengths = identify_strengths(v, r, c, m, h)
        weaknesses = identify_weaknesses(v, r, c, m, h)

        return {
            "symbol": data.get("symbol", "UNKNOWN"),
            "signal": data.get("final_signal", data.get("signal", "HOLD")),
            "sniper_score": sniper_score,
            "rating": rating.value,
            "grade": grade.value,
            "confidence": adjusted_conf,
            "score_breakdown": {
                "technical_validation": {"score": v, "weight": "30%"},
                "risk_quality": {"score": r, "weight": "25%"},
                "market_context": {"score": m, "weight": "20%"},
                "historical_pattern": {"score": h, "weight": "15%"},
                "contrarian_analysis": {"score": c, "weight": "10%"}
            },
            "strengths": strengths,
            "weaknesses": weaknesses,
            "summary": f"The setup has {rating.value.lower()} with multiple agents supporting the analysis."
        }

    except Exception as e:
        return {
            "symbol": data.get("symbol", "UNKNOWN"),
            "sniper_score": 0,
            "rating": ScoreRating.AVOID.value,
            "grade": "D",
            "confidence": 30,
            "error": str(e),
            "summary": "Unable to calculate SignalSniper Score™."
        }

# FastAPI Integration
if os.getenv("FASTAPI_ENABLED", "true").lower() == "true":
    from fastapi import FastAPI
    from pydantic import BaseModel

    app = FastAPI(title="SignalSniper Score™ Engine", version="1.0")

    class ScoreRequest(BaseModel):
        symbol: str
        validation_score: int = 50
        risk_score: int = 50
        contrarian_score: int = 50
        market_context_score: int = 50
        historical_score: int = 50
        confidence: int = 50
        signal: str = "HOLD"
        final_signal: str = "HOLD"

    @app.post("/calculate_sniper_score")
    async def calculate_score_endpoint(request: ScoreRequest):
        result = generate_score_report(request.model_dump())
        return result

    @app.get("/health")
    async def health():
        return {"status": "ok", "engine": "scoresniper"}

    if __name__ == "__main__":
        import uvicorn
        uvicorn.run(app, host="0.0.0.0", port=8007)