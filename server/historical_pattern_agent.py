#!/usr/bin/env python3
"""
Historical Pattern Intelligence Agent
Analyzes current setup against historical market patterns.
"""

import os
from typing import Dict, List, Optional
from enum import Enum
from dataclasses import dataclass

class PatternStrength(str, Enum):
    STRONG = "STRONG HISTORICAL SUPPORT"
    MODERATE = "MODERATE SUPPORT"
    WEAK = "WEAK SUPPORT"
    NONE = "NO CLEAR PATTERN"

@dataclass
class HistoricalInput:
    symbol: str
    timeframe: str
    signal: str
    entry_price: float
    indicators: Dict[str, str | int | float]
    validation_result: Optional[Dict] = None
    risk_analysis: Optional[Dict] = None
    contrarian_analysis: Optional[Dict] = None
    market_context: Optional[Dict] = None

def serialize_conditions(indicators: Dict[str, str | int | float], signal: str) -> Dict:
    """Serialize current market conditions into comparables."""
    return {
        "rsi_zone": "OVERBOUGHT" if indicators.get("RSI", 50) > 70 else "OVERSOLD" if indicators.get("RSI", 50) < 30 else "NEUTRAL",
        "macd_state": str(indicators.get("MACD", "")).lower(),
        "price_vs_ema": "ABOVE" if "above" in str(indicators.get("EMA50", "")).lower() else "BELOW",
        "market_regime": str(indicators.get("market_regime", "UNCERTAIN")),
        "signal_type": signal.upper()
    }

def find_similar_patterns(
    conditions: Dict,
    symbol: str,
    similarity_threshold: float = 0.7
) -> tuple[int, int]:
    """Find similar historical patterns (mock implementation).

    In production, integrate with pgvector/PostgreSQL to search historical patterns.
    """
    # Placeholder: mock database query
    # Would use: SELECT * FROM patterns WHERE embedding <=> current_embedding > threshold

    # Mock calculation based on indicator similarity
    mock_total = 450  # Simulated total cases
    mock_successful = 292  # Simulated successful

    similarity = 82  # Mock similarity score

    return mock_total, mock_successful, similarity

def detect_historical_failures(
    indicators: Dict[str, str | int | float],
    signal: str
) -> List[str]:
    """Identify conditions where similar trades historically failed."""
    failures = []

    rsi = float(indicators.get("RSI", 50))
    if rsi > 70:
        failures.append("Overextended RSI - historical reversal risk")
    elif rsi < 30:
        failures.append("Oversold RSI - bounce trap risk")

    if indicators.get("ATR") and float(indicators.get("ATR", 0)) > 0.015:
        failures.append("High volatility - stop hunt risk")

    macd = str(indicators.get("MACD", "")).lower()
    if signal.upper() == "BUY" and "bearish" in macd:
        failures.append("MACD bearish divergence historically failed")

    return failures

def evaluate_pattern_strength(
    similarity: int,
    success_rate: float,
    total: int
) -> PatternStrength:
    """Classify historical reliability."""
    if similarity >= 80 and success_rate >= 70 and total >= 100:
        return PatternStrength.STRONG
    elif similarity >= 70 and success_rate >= 60:
        return PatternStrength.MODERATE
    elif similarity >= 50:
        return PatternStrength.WEAK
    return PatternStrength.NONE

def calculate_historical_score(
    similarity: int,
    success_rate: float,
    total: int
) -> int:
    """Calculate historical pattern score (0-100).

    Formula:
    - Pattern Similarity: 40%
    - Historical Success Rate: 40%
    - Market Condition Match: 20%
    """
    rate_pct = success_rate

    # Normalize similarity to 0-100
    sim_score = min(100, similarity)

    # Success rate already 0-100
    suc_score = rate_pct

    # Condition match (based on sample size)
    cond_score = min(100, total / 10)

    return int(sim_score * 0.4 + suc_score * 0.4 + cond_score * 0.2)

def adjust_confidence(
    original: int,
    historical_score: int,
    pattern_strength: PatternStrength
) -> tuple[int, str]:
    """Adjust confidence based on historical analysis."""
    adjustment = 0
    reasons = []

    if pattern_strength == PatternStrength.STRONG:
        adjustment = 5
        reasons.append("strong historical precedent")
    elif pattern_strength == PatternStrength.MODERATE:
        if historical_score < 60:
            adjustment = -5
            reasons.append("only moderate historical support")
    elif pattern_strength == PatternStrength.WEAK:
        adjustment = -10
        reasons.append("weak historical reliability")
    else:
        adjustment = -15
        reasons.append("no clear historical pattern")

    adjusted = max(10, min(95, original + adjustment))
    reason = f"Confidence adjusted due to {', '.join(reasons)}" if reasons else "Historical analysis supports current confidence"

    return adjusted, reason

def find_supporting_conditions(
    indicators: Dict[str, str | int | float],
    signal: str
) -> List[str]:
    """Find historically supportive conditions."""
    supporting = []

    rsi = float(indicators.get("RSI", 50))
    if 40 <= rsi <= 60:
        supporting.append("RSI in healthy zone")

    if "bullish" in str(indicators.get("MACD", "")).lower():
        supporting.append("MACD confirmation")

    for ma in ["EMA50", "SMA20"]:
        if "above" in str(indicators.get(ma, "")).lower():
            supporting.append(f"{ma} support")

    if signal.upper() == "BUY" and indicators.get("trend") == "BULLISH":
        supporting.append("Trend alignment")

    return supporting[:3]

def analyze_historical_pattern(data: Dict) -> Dict:
    """Main entry point - historical pattern analysis."""
    try:
        input_data = HistoricalInput(
            symbol=data.get("symbol", ""),
            timeframe=data.get("timeframe", "1H"),
            signal=data.get("signal", ""),
            entry_price=float(data.get("entry_price", data.get("currentPrice", 1.0))),
            indicators=data.get("indicators", {}),
            validation_result=data.get("validation_result"),
            risk_analysis=data.get("risk_analysis"),
            contrarian_analysis=data.get("contrarian_analysis"),
            market_context=data.get("market_context")
        )

        # 1. Serialize conditions
        conditions = serialize_conditions(input_data.indicators, input_data.signal)

        # 2. Find similar patterns
        total, successful, similarity = find_similar_patterns(conditions, input_data.symbol)

        # 3. Calculate success rate
        success_rate = round((successful / total * 100), 1) if total > 0 else 0

        # 4. Evaluate pattern strength
        strength = evaluate_pattern_strength(similarity, success_rate, total)

        # 5. Historical failures
        failures = detect_historical_failures(input_data.indicators, input_data.signal)

        # 6. Calculate score
        hist_score = calculate_historical_score(similarity, success_rate, total)

        # 7. Adjust confidence
        adjusted, reason = adjust_confidence(
            data.get("confidence", 50),
            hist_score,
            strength
        )

        # 8. Supporting conditions
        supporting = find_supporting_conditions(input_data.indicators, input_data.signal)

        return {
            "symbol": input_data.symbol,
            "historical_analysis": {
                "similar_patterns_found": total,
                "pattern_similarity_score": similarity,
                "historical_success_rate": f"{success_rate}%",
                "successful_cases": successful,
                "failed_cases": total - successful,
                "pattern_strength": strength.value,
                "historical_score": hist_score,
                "supporting_conditions": supporting,
                "failure_conditions": failures
            },
            "confidence_adjustment": {
                "original_confidence": data.get("confidence", 50),
                "adjusted_confidence": adjusted,
                "reason": reason
            },
            "summary": f"Historical patterns show {success_rate:.1f}% success rate. Monitor {failures[0] if failures else 'risk factors'}."
        }

    except Exception as e:
        return {
            "symbol": data.get("symbol", "UNKNOWN"),
            "historical_analysis": {
                "similar_patterns_found": 0,
                "pattern_strength": PatternStrength.NONE.value,
                "failure_conditions": [f"Analysis error: {str(e)}"]
            },
            "confidence_adjustment": {
                "original_confidence": data.get("confidence", 50),
                "adjusted_confidence": 30
            },
            "summary": "Unable to perform historical analysis."
        }

# FastAPI Integration
if os.getenv("FASTAPI_ENABLED", "true").lower() == "true":
    from fastapi import FastAPI
    from pydantic import BaseModel

    app = FastAPI(title="Historical Pattern Intelligence Agent", version="1.0")

    class HistoricalRequest(BaseModel):
        symbol: str
        timeframe: str = "1H"
        signal: str
        entry_price: float
        confidence: int = 50
        indicators: Dict
        validation_result: Optional[Dict] = None
        risk_analysis: Optional[Dict] = None
        contrarian_analysis: Optional[Dict] = None
        market_context: Optional[Dict] = None

    @app.post("/analyze_historical_pattern")
    async def analyze_historical_endpoint(request: HistoricalRequest):
        result = analyze_historical_pattern(request.model_dump())
        return result

    @app.get("/health")
    async def health():
        return {"status": "ok", "agent": "historical-pattern"}

    if __name__ == "__main__":
        import uvicorn
        uvicorn.run(app, host="0.0.0.0", port=8005)