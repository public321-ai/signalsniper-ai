#!/usr/bin/env python3
"""
Contrarian Analysis Agent
Skeptical AI analyst that challenges trading signals.
"""

import os
from typing import Dict, List, Optional
from enum import Enum
from dataclasses import dataclass

class SignalStrength(str, Enum):
    STRONG_BUY = "STRONG BUY"
    MODERATE_BUY = "MODERATE BUY"
    WEAK_BUY = "WEAK BUY"
    NEUTRAL = "NEUTRAL"
    WEAK_SELL = "WEAK SELL"
    MODERATE_SELL = "MODERATE SELL"
    STRONG_SELL = "STRONG SELL"

@dataclass
class ContrarianInput:
    symbol: str
    signal: str
    confidence: int
    indicators: Dict[str, str | int | float]
    technical_analysis: str
    validation_result: Optional[Dict] = None
    risk_analysis: Optional[Dict] = None

def detect_conflicting_indicators(
    indicators: Dict[str, str | int | float],
    signal: str
) -> List[str]:
    """Find evidence against the signal."""
    conflicts = []
    signal_upper = signal.upper()

    # RSI extremities
    if "RSI" in indicators:
        rsi = float(indicators["RSI"])
        if signal_upper == "BUY" and rsi > 65:
            conflicts.append("RSI approaching overbought territory")
        elif signal_upper == "SELL" and rsi < 35:
            conflicts.append("RSI approaching oversold territory")

    # MACD contradictions
    if "MACD" in indicators:
        macd = str(indicators["MACD"]).lower()
        if signal_upper == "BUY" and "bearish" in macd:
            conflicts.append("MACD shows bearish divergence")
        elif signal_upper == "SELL" and "bullish" in macd:
            conflicts.append("MACD shows bullish divergence")

    # Moving average contradictions
    for ma in ["EMA50", "SMA20", "EMA26"]:
        if ma in indicators:
            rel = str(indicators[ma]).lower()
            if signal_upper == "BUY" and "below" in rel:
                conflicts.append(f"Price below {ma}")
            elif signal_upper == "SELL" and "above" in rel:
                conflicts.append(f"Price above {ma}")

    return conflicts

def detect_support_risks(
    signal: str,
    key_levels: List[Dict]
) -> List[str]:
    """Check support/resistance conflicts."""
    risks = []
    signal_upper = signal.upper()

    for level in key_levels:
        label = str(level.get("label", "")).lower()
        price = float(level.get("price", 0))
        level_type = level.get("type", "")

        if signal_upper == "BUY" and "resistance" in label and "near" in label:
            risks.append("Resistance zone nearby")
        elif signal_upper == "SELL" and "support" in label and "near" in label:
            risks.append("Support zone nearby")

    return risks

def evaluate_signal_strength(
    indicators: Dict[str, str | int | float],
    signal: str,
    validation: Optional[Dict],
    risk: Optional[Dict]
) -> tuple[SignalStrength, int]:
    """Classify signal strength."""
    supporting = 0
    contradicting = 0

    # Count supporting factors
    for key, val in indicators.items():
        val_str = str(val).lower()
        if signal.upper() == "BUY":
            if "above" in val_str or "bullish" in val_str or "positive" in val_str:
                supporting += 1
            elif "below" in val_str or "bearish" in val_str:
                contradicting += 1
        elif signal.upper() == "SELL":
            if "below" in val_str or "bearish" in val_str or "negative" in val_str:
                supporting += 1
            elif "above" in val_str or "bullish" in val_str:
                contradicting += 1

    net_score = supporting - contradicting

    if validation and validation.get("decision") == "REJECTED":
        return SignalStrength.NEUTRAL, 20

    if risk and risk.get("risk_level") == "HIGH":
        net_score -= 2

    if net_score >= 3:
        return SignalStrength.STRONG_BUY if signal.upper() == "BUY" else SignalStrength.STRONG_SELL, 85
    elif net_score >= 1:
        return SignalStrength.MODERATE_BUY if signal.upper() == "BUY" else SignalStrength.MODERATE_SELL, 65
    elif net_score <= -3:
        return SignalStrength.STRONG_SELL if signal.upper() == "BUY" else SignalStrength.STRONG_BUY, 85
    elif net_score <= -1:
        return SignalStrength.WEAK_BUY if signal.upper() == "BUY" else SignalStrength.WEAK_SELL, 45
    else:
        return SignalStrength.NEUTRAL, 50

def adjust_confidence(
    original: int,
    challenge_score: int,
    contradictions: List[str]
) -> tuple[int, str]:
    """Review and adjust confidence."""
    adjustment = 0
    reasons = []

    if challenge_score < 50:
        adjustment -= 15
        reasons.append("weak signal consensus")
    elif challenge_score < 70:
        adjustment -= 8
        reasons.append("mixed technical signals")

    if len(contradictions) >= 2:
        adjustment -= 10
        reasons.append("multiple contradictions detected")

    adjusted = max(10, min(95, original + adjustment))
    reason = f"Confidence adjusted due to {', '.join(reasons)}" if reasons else "Confidence maintained"
    return adjusted, reason

def generate_failure_scenarios(
    signal: str,
    contradictions: List[str],
    risk_warnings: List[str]
) -> List[str]:
    """Generate trade failure conditions."""
    scenarios = []

    signal_upper = signal.upper()

    # Technical failures
    scenarios.append(f"Price breaks {'below' if signal_upper == 'BUY' else 'above'} key moving average")

    # Indicator failures
    if contradictions:
        scenarios.append(f"{contradictions[0]} invalidates thesis")

    # Generic scenarios
    scenarios.extend([
        "Unexpected news event shifts sentiment",
        "Liquidity sweep triggers stop loss",
        "Momentum divergence continues"
    ])

    return scenarios[:5]

def analyze_counter_argument(data: Dict) -> Dict:
    """Main entry point - contrarian analysis."""
    try:
        input_data = ContrarianInput(
            symbol=data.get("symbol", ""),
            signal=data.get("signal", ""),
            confidence=data.get("confidence", 50),
            indicators=data.get("indicators", {}),
            technical_analysis=data.get("technical_analysis", ""),
            validation_result=data.get("validation_result"),
            risk_analysis=data.get("risk_analysis", {})
        )

        # Find contradictions
        contradictions = detect_conflicting_indicators(
            input_data.indicators,
            input_data.signal
        )

        # Support/resistance risks
        key_levels = data.get("keyLevels", [])
        sr_risks = detect_support_risks(input_data.signal, key_levels)

        all_risks = contradictions + sr_risks

        # Evaluate strength
        strength, challenge_score = evaluate_signal_strength(
            input_data.indicators,
            input_data.signal,
            input_data.validation_result,
            input_data.risk_analysis
        )

        # Adjust confidence
        adjusted, reason = adjust_confidence(
            input_data.confidence,
            challenge_score,
            all_risks
        )

        # Failure scenarios
        risk_warnings = input_data.risk_analysis.get("warnings", []) if input_data.risk_analysis else []
        failures = generate_failure_scenarios(
            input_data.signal,
            contradictions,
            risk_warnings
        )

        # Determine failure probability
        if challenge_score >= 70 and len(all_risks) <= 1:
            failure_prob = "LOW"
        elif challenge_score >= 50:
            failure_prob = "LOW-MEDIUM"
        elif challenge_score >= 30:
            failure_prob = "MEDIUM"
        else:
            failure_prob = "HIGH"

        return {
            "signal": input_data.signal,
            "contrarian_result": {
                "signal_strength": strength.value,
                "challenge_score": challenge_score,
                "supporting_factors": [],
                "risk_factors": all_risks,
                "failure_probability": failure_prob
            },
            "original_confidence": input_data.confidence,
            "adjusted_confidence": adjusted,
            "final_comment": f"The {input_data.signal} signal {'requires careful monitoring' if challenge_score >= 50 and (not input_data.validation_result or input_data.validation_result.get('decision') != 'REJECTED') else 'was rejected by validation'} - challenge score: {challenge_score}."
        }

    except Exception as e:
        return {
            "signal": data.get("signal", "UNKNOWN"),
            "contrarian_result": {
                "signal_strength": SignalStrength.NEUTRAL.value,
                "challenge_score": 0,
                "risk_factors": [f"Analysis error: {str(e)}"]
            },
            "original_confidence": data.get("confidence", 50),
            "adjusted_confidence": 30,
            "final_comment": "Unable to perform contrarian analysis."
        }

# FastAPI Integration
if os.getenv("FASTAPI_ENABLED", "true").lower() == "true":
    from fastapi import FastAPI
    from pydantic import BaseModel

    app = FastAPI(title="Contrarian Analysis Agent", version="1.0")

    class ContrarianRequest(BaseModel):
        symbol: str
        signal: str
        confidence: int
        indicators: Dict
        technical_analysis: str
        keyLevels: Optional[List[Dict]] = None
        validation_result: Optional[Dict] = None
        risk_analysis: Optional[Dict] = None

    @app.post("/analyze_counter_argument")
    async def analyze_contrarian(request: ContrarianRequest):
        result = analyze_counter_argument(request.model_dump())
        return result

    @app.get("/health")
    async def health():
        return {"status": "ok", "agent": "contrarian"}

    if __name__ == "__main__":
        import uvicorn
        uvicorn.run(app, host="0.0.0.0", port=8003)