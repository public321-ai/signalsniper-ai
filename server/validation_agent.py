#!/usr/bin/env python3
"""
Signal Validation Agent
Second-opinion AI layer for SignalSniper Forex signals.
Reviews signals before presenting to users.
"""

import os
import json
from typing import Dict, List, Literal, Optional
from dataclasses import dataclass
from enum import Enum

# Signal Validation Agent


class ValidationDecision(str, Enum):
    APPROVED = "APPROVED"
    CAUTION = "CAUTION"
    REJECTED = "REJECTED"


class Signal(str, Enum):
    BUY = "BUY"
    SELL = "SELL"
    HOLD = "HOLD"


@dataclass
class ValidationInput:
    symbol: str
    market: str
    signal: str
    confidence: int
    indicators: Dict[str, str | int | float]
    analysis: str


@dataclass
class TechnicalCheck:
    status: str  # PASS, FAIL, WARNING
    score: int
    comments: List[str]


@dataclass
class RiskCheck:
    level: str  # LOW, MEDIUM, HIGH
    warnings: List[str]


@dataclass
class SignalChallenge:
    supporting_factors: List[str]
    contradicting_factors: List[str]


# Indicator Validation Functions


def check_rsi(rsi_value: float) -> tuple[bool, List[str]]:
    """Validate RSI interpretation."""
    comments = []
    valid = True

    if rsi_value < 30:
        comments.append("RSI indicates oversold conditions - potential bullish reversal")
    elif rsi_value > 70:
        comments.append("RSI indicates overbought conditions - potential bearish reversal")
    elif 30 <= rsi_value <= 70:
        comments.append("RSI in neutral range - no extreme conditions")

    return valid, comments


def check_macd(macd_signal: str) -> tuple[bool, List[str]]:
    """Validate MACD interpretation."""
    comments = []
    valid = True

    signal_lower = str(macd_signal).lower()
    bullish = "bullish" in signal_lower or ("crossover" in signal_lower and "above" in signal_lower)
    bearish = "bearish" in signal_lower or "crossunder" in signal_lower or "below" in signal_lower

    if bullish:
        comments.append("Bullish MACD crossover confirms upward momentum")
    elif bearish:
        comments.append("Bearish MACD crossunder confirms downward momentum")
    else:
        comments.append("MACD in consolidation - neutral signal")

    return valid, comments


def check_moving_average(price_relation: str, signal: str) -> tuple[bool, List[str]]:
    """Validate moving average relationship."""
    comments = []
    valid = True

    relation = str(price_relation).lower()
    signal_lower = str(signal).upper()

    if signal_lower == "BUY":
        if "above" in relation or "bullish" in relation:
            comments.append("Price above moving average supports bullish signal")
        elif "below" in relation:
            valid = False
            comments.append("CONTRADICTION: Bullish signal but price below moving average")
    elif signal_lower == "SELL":
        if "below" in relation or "bearish" in relation:
            comments.append("Price below moving average supports bearish signal")
        elif "above" in relation:
            valid = False
            comments.append("CONTRADICTION: Bearish signal but price above moving average")

    return valid, comments


def check_atr(atr_value: str | float) -> tuple[bool, List[str]]:
    """Validate ATR/volatility interpretation."""
    comments = []
    valid = True

    if isinstance(atr_value, (int, float)):
        if atr_value > 0.01:
            comments.append("High volatility conditions detected")
        elif atr_value < 0.005:
            comments.append("Low volatility conditions detected")
        else:
            comments.append("Medium volatility conditions")
    else:
        comments.append(f"ATR noted as: {atr_value}")

    return valid, comments


# Main Validation Functions


def check_indicators(input_data: ValidationInput) -> TechnicalCheck:
    """Validate technical reasoning against indicator values."""
    all_comments = []
    score_components = []

    indicators = input_data.indicators

    # RSI Check
    if "RSI" in indicators:
        rsi_valid, rsi_comments = check_rsi(float(indicators["RSI"]))
        all_comments.extend(rsi_comments)
        score_components.append(85 if rsi_valid else 50)

    # MACD Check
    if "MACD" in indicators:
        macd_valid, macd_comments = check_macd(str(indicators["MACD"]))
        all_comments.extend(macd_comments)
        score_components.append(85 if macd_valid else 60)

    # Moving Average Check
    for ma_key in ["EMA50", "SMA20", "EMA26"]:
        if ma_key in indicators:
            ma_valid, ma_comments = check_moving_average(str(indicators[ma_key]), input_data.signal)
            all_comments.extend(ma_comments)
            score_components.append(85 if ma_valid else 50)

    # ATR Check
    if "ATR" in indicators:
        _, atr_comments = check_atr(indicators["ATR"])
        all_comments.extend(atr_comments)
        score_components.append(75)

    avg_score = sum(score_components) / len(score_components) if score_components else 70

    # Determine status
    if avg_score >= 80:
        status = "PASS"
    elif avg_score >= 60:
        status = "WARNING"
    else:
        status = "FAIL"

    return TechnicalCheck(
        status=status,
        score=int(avg_score),
        comments=all_comments
    )


def evaluate_confidence(input_data: ValidationInput, technical_score: int) -> tuple[int, str]:
    """Evaluate and adjust confidence score."""
    original = input_data.confidence
    adjusted = original
    reason = ""

    # Check for contradictions that should reduce confidence
    if technical_score < 70:
        adjusted -= 15
        reason = "Confidence reduced due to indicator contradictions"
    elif technical_score < 80:
        adjusted -= 5
        reason = "Confidence slightly reduced due to weak indicator alignment"
    else:
        reason = "Confidence maintained - strong indicator alignment"

    # Ensure bounds
    adjusted = max(10, min(95, adjusted))

    if adjusted != original:
        return adjusted, reason

    return original, reason


def identify_risks(input_data: ValidationInput, technical_check: TechnicalCheck) -> RiskCheck:
    """Identify potential risks in the signal."""
    warnings = []

    # Check for high volatility
    if "ATR" in input_data.indicators:
        atr = input_data.indicators["ATR"]
        if isinstance(atr, (int, float)) and atr > 0.01:
            warnings.append("High volatility may cause stop-loss hunting")

    # Check for weak confirmation
    if technical_check.score < 70:
        warnings.append("Weak indicator confirmation - signal may be speculative")

    # Check RSI extremes for warnings
    if "RSI" in input_data.indicators:
        rsi = float(input_data.indicators["RSI"])
        if rsi > 65:
            warnings.append("RSI approaching overbought - reversal risk")
        elif rsi < 35:
            warnings.append("RSI approaching oversold - reversal risk")

    # Determine risk level
    if len(warnings) >= 2 or technical_check.status == "FAIL":
        level = "HIGH"
    elif len(warnings) == 1 or technical_check.status == "WARNING":
        level = "MEDIUM"
    else:
        level = "LOW"

    return RiskCheck(level=level, warnings=warnings)


def challenge_signal(input_data: ValidationInput) -> SignalChallenge:
    """Act as skeptical analyst - find supporting/contradicting evidence."""
    supporting = []
    contradicting = []

    # Check each indicator
    for key, value in input_data.indicators.items():
        val_str = str(value).lower()
        signal = input_data.signal.upper()

        if signal == "BUY":
            if "above" in val_str or "bullish" in val_str or "positive" in val_str:
                supporting.append(f"{key} supports bullish thesis")
            elif "below" in val_str or "bearish" in val_str or "negative" in val_str:
                contradicting.append(f"{key} contradicts bullish signal")
        elif signal == "SELL":
            if "below" in val_str or "bearish" in val_str or "negative" in val_str:
                supporting.append(f"{key} supports bearish thesis")
            elif "above" in val_str or "bullish" in val_str or "positive" in val_str:
                contradicting.append(f"{key} contradicts bearish signal")
        else:  # HOLD
            supporting.append("Signal is conservative - avoids directional bias")

    return SignalChallenge(
        supporting_factors=supporting[:3],
        contradicting_factors=contradicting[:3]
    )


def calculate_validation_score(
    technical_check: TechnicalCheck,
    risk_check: RiskCheck,
    confidence_accuracy: int
) -> int:
    """Calculate overall validation score (0-100)."""
    # Technical Alignment: 40%
    tech_score = technical_check.score * 0.4

    # Risk Assessment: 30%
    risk_multiplier = {"LOW": 1.0, "MEDIUM": 0.7, "HIGH": 0.4}.get(risk_check.level, 0.5)
    risk_score = (technical_check.score * risk_multiplier) * 0.3

    # Confidence Accuracy: 20%
    conf_score = min(100, confidence_accuracy) * 0.2

    # Market Condition: 10%
    market_score = 70  # Neutral baseline, can be enhanced

    total = tech_score + risk_score + conf_score + market_score * 0.1
    return int(max(0, min(100, total)))


def generate_validation_report(input_data: ValidationInput) -> Dict:
    """Generate final validation report."""
    # 1. Technical validation
    technical_check = check_indicators(input_data)

    # 2. Confidence evaluation
    adjusted_confidence, conf_reason = evaluate_confidence(
        input_data, technical_check.score
    )

    # 3. Risk identification
    risk_check = identify_risks(input_data, technical_check)

    # 4. Signal challenge
    signal_challenge = challenge_signal(input_data)

    # 5. Validation score
    validation_score = calculate_validation_score(
        technical_check, risk_check, input_data.confidence
    )

    # 6. Final decision
    if technical_check.status == "FAIL" or len(signal_challenge.contradicting_factors) >= 2:
        decision = ValidationDecision.REJECTED
        final_signal = input_data.signal
    elif risk_check.level == "HIGH" or technical_check.status == "WARNING":
        decision = ValidationDecision.CAUTION
        final_signal = input_data.signal
    else:
        decision = ValidationDecision.APPROVED
        final_signal = input_data.signal

    # 7. Final explanation
    explanation_parts = []
    if decision == ValidationDecision.APPROVED:
        explanation_parts.append(
            f"The {final_signal} signal is supported by technical indicators and market conditions."
        )
    elif decision == ValidationDecision.CAUTION:
        explanation_parts.append(
            f"The {final_signal} signal is valid but carries elevated risk."
        )
    else:
        explanation_parts.append(
            "Signal reasoning is not adequately supported by indicators."
        )

    if signal_challenge.contradicting_factors:
        explanation_parts.append(
            f"Contradictions noted: {', '.join(signal_challenge.contradicting_factors[:2])}."
        )

    final_explanation = " ".join(explanation_parts)

    return {
        "symbol": input_data.symbol,
        "original_signal": input_data.signal,
        "validated_signal": final_signal,
        "decision": decision.value,
        "original_confidence": input_data.confidence,
        "adjusted_confidence": adjusted_confidence,
        "validation_score": validation_score,
        "validation_details": {
            "technical_check": {
                "status": technical_check.status,
                "score": technical_check.score
            },
            "risk_check": {
                "level": risk_check.level,
                "warnings": risk_check.warnings
            },
            "signal_challenge": {
                "supporting_factors": signal_challenge.supporting_factors,
                "contradicting_factors": signal_challenge.contradicting_factors
            }
        },
        "final_explanation": final_explanation
    }


def validate_signal(data: Dict) -> Dict:
    """Main entry point - validate a SignalSniper signal."""
    try:
        input_data = ValidationInput(
            symbol=data.get("symbol", ""),
            market=data.get("market", "Forex"),
            signal=data.get("signal", ""),
            confidence=data.get("confidence", 50),
            indicators=data.get("indicators", {}),
            analysis=data.get("analysis", "")
        )

        return generate_validation_report(input_data)
    except Exception as e:
        return {
            "symbol": data.get("symbol", "UNKNOWN"),
            "decision": ValidationDecision.REJECTED.value,
            "error": str(e),
            "final_explanation": "Validation failed due to error in input processing."
        }


# FastAPI Integration
if os.getenv("FASTAPI_ENABLED", "true").lower() == "true":
    from fastapi import FastAPI, HTTPException
    from pydantic import BaseModel

    app = FastAPI(title="Signal Validation Agent", version="1.0")

    class ValidationRequest(BaseModel):
        symbol: str
        market: str = "Forex"
        signal: str
        confidence: int
        indicators: Dict
        analysis: str

    @app.post("/validate")
    async def validate_endpoint(request: ValidationRequest):
        result = validate_signal(request.model_dump())
        return result

    @app.get("/health")
    async def health():
        return {"status": "ok", "agent": "validation"}

    if __name__ == "__main__":
        import uvicorn
        uvicorn.run(app, host="0.0.0.0", port=8001)