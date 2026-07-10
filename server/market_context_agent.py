#!/usr/bin/env python3
"""
Market Context Intelligence Agent
Analyzes broader market environment for signal reliability.
"""

import os
from datetime import datetime
from typing import Dict, List, Optional
from enum import Enum
from dataclasses import dataclass

class MarketRegime(str, Enum):
    TRENDING = "TRENDING"
    RANGING = "RANGING"
    BREAKOUT = "BREAKOUT"
    HIGH_VOLATILITY = "HIGH_VOLATILITY"
    LOW_LIQUIDITY = "LOW_LIQUIDITY"
    UNCERTAIN = "UNCERTAIN"

class TrendDirection(str, Enum):
    BULLISH = "BULLISH"
    BEARISH = "BEARISH"
    NEUTRAL = "NEUTRAL"

@dataclass
class MarketContextInput:
    symbol: str
    market: str
    signal: str
    confidence: int
    indicators: Dict[str, str | int | float]
    validation_result: Optional[Dict] = None
    risk_analysis: Optional[Dict] = None
    contrarian_analysis: Optional[Dict] = None
    timestamp: Optional[str] = None

def detect_market_regime(
    indicators: Dict[str, str | int | float],
    signal: str
) -> tuple[MarketRegime, TrendDirection, int]:
    """Classify market condition based on indicators."""
    score = 50  # Neutral baseline

    adx = indicators.get("ADX")
    if adx is not None:
        adx_val = float(adx)
        if adx_val > 25:
            score += 20
        else:
            score -= 15

    rsi = indicators.get("RSI")
    if rsi is not None:
        rsi_val = float(rsi)
        if 40 <= rsi_val <= 60:
            score += 10  # Ranging
        elif rsi_val > 70 or rsi_val < 30:
            score -= 10  # Extreme

    atr = indicators.get("ATR")
    if atr is not None:
        if float(atr) > 0.01:
            return MarketRegime.HIGH_VOLATILITY, TrendDirection.NEUTRAL, 70
        score += 5

    # Determine regime
    if score >= 70:
        regime = MarketRegime.TRENDING
        direction = TrendDirection.BULLISH if signal.upper() == "BUY" else TrendDirection.BEARISH
    elif score >= 50:
        regime = MarketRegime.RANGING
        direction = TrendDirection.NEUTRAL
    elif score >= 30:
        regime = MarketRegime.UNCERTAIN
        direction = TrendDirection.NEUTRAL
    else:
        regime = MarketRegime.LOW_LIQUIDITY
        direction = TrendDirection.NEUTRAL

    return regime, direction, score

def analyze_volatility(
    atr: float,
    price_movement: Optional[float] = None
) -> tuple[str, int, str]:
    """Evaluate volatility conditions."""
    level = "LOW"
    score = 50
    impact = "Standard risk profile"

    if atr > 0.015:
        level = "HIGH"
        score = 85
        impact = "Elevated risk for entry"
    elif atr > 0.008:
        level = "MEDIUM"
        score = 70
        impact = "Moderate risk for entry"
    elif atr < 0.004:
        level = "LOW"
        score = 40
        impact = "Low volatility - tight stops needed"

    return level, score, impact

def get_trading_session() -> tuple[str, str, str]:
    """Determine current trading session based on UTC time."""
    hour = datetime.utcnow().hour

    if 0 <= hour < 8:
        session = "Asian Session"
        liquidity = "MEDIUM"
        quality = "FAVORABLE"
    elif 8 <= hour < 12:
        session = "London Session"
        liquidity = "HIGH"
        quality = "FAVORABLE"
    elif 12 <= hour < 16:
        session = "New York Session"
        liquidity = "HIGH"
        quality = "FAVORABLE"
    elif 16 <= hour < 20:
        session = "London-New York Overlap"
        liquidity = "VERY_HIGH"
        quality = "OPTIMAL"
    else:
        session = "Off Hours"
        liquidity = "LOW"
        quality = "CAUTION"

    return session, liquidity, quality

def check_economic_risk(symbol: str) -> tuple[str, List[str], str]:
    """Check for market-moving events (placeholder - integrate real calendar)."""
    # In production, integrate with economic calendar API
    # For now, simple flag based on symbol
    events = []
    risk = "LOW"
    rec = "No immediate events"

    # Placeholder - would check actual calendar
    # EUR/USD: ECB events, USD: FED events
    base = symbol[:3] if len(symbol) >= 3 else ""
    quote = symbol[3:] if len(symbol) >= 6 else ""

    warnings = []
    if base in ["EUR"] or quote in ["USD"]:
        # Mock: assume low risk during development
        risk = "LOW"

    return risk, events, rec

def analyze_currency_strength(symbol: str, signal: str) -> tuple[str, str, str]:
    """Analyze currency strength alignment."""
    # Placeholder - would integrate with real strength meter
    base = symbol[:3] if len(symbol) >= 3 else "XXX"
    quote = symbol[3:] if len(symbol) >= 6 else "XXX"

    alignment = "NEUTRAL"
    base_strength = "NEUTRAL"
    quote_strength = "NEUTRAL"

    # Mock logic for demonstration
    if signal.upper() == "BUY":
        alignment = "POSITIVE" if base_strength == "NEUTRAL" else "MIXED"
    else:
        alignment = "POSITIVE" if quote_strength == "NEUTRAL" else "MIXED"

    return base_strength, quote_strength, alignment

def calculate_context_score(
    regime_score: int,
    vol_score: int,
    session_quality: str,
    econ_risk: str,
    currency_alignment: str
) -> int:
    """Calculate market context score (0-100)."""
    # Market regime: 30%
    regime_weight = regime_score * 0.3

    # Volatility: 25%
    vol_weight = vol_score * 0.25

    # Session: 20%
    session_score = {"OPTIMAL": 100, "FAVORABLE": 80, "CAUTION": 60, "UNCERTAIN": 40}.get(session_quality, 50)
    session_weight = session_score * 0.2

    # Economic risk: 15%
    econ_score = {"LOW": 100, "MEDIUM": 70, "HIGH": 40}.get(econ_risk, 80)
    econ_weight = econ_score * 0.15

    # Currency: 10%
    curr_score = {"POSITIVE": 100, "NEUTRAL": 70, "MIXED": 50}.get(currency_alignment, 70)
    curr_weight = curr_score * 0.1

    return int(regime_weight + vol_weight + session_weight + econ_weight + curr_weight)

def adjust_confidence(
    original: int,
    context_score: int,
    vol_level: str,
    econ_risk: str
) -> tuple[int, str]:
    """Adjust confidence based on market context."""
    adjusted = original
    reasons = []

    if context_score < 60:
        adjusted -= 15
        reasons.append("weak market context")
    elif context_score < 75:
        adjusted -= 8
        reasons.append("moderate market conditions")

    if vol_level == "HIGH":
        adjusted -= 10
        reasons.append("high volatility")

    if econ_risk == "HIGH":
        adjusted -= 12
        reasons.append("upcoming economic events")

    adjusted = max(10, min(95, adjusted))
    reason = f"Adjusted due to {', '.join(reasons)}" if reasons else "No adjustment needed"

    return adjusted, reason

def analyze_market_context(data: Dict) -> Dict:
    """Main entry point - analyze market context."""
    try:
        input_data = MarketContextInput(
            symbol=data.get("symbol", ""),
            market=data.get("market", "Forex"),
            signal=data.get("signal", ""),
            confidence=data.get("confidence", 50),
            indicators=data.get("indicators", {}),
            validation_result=data.get("validation_result"),
            risk_analysis=data.get("risk_analysis"),
            contrarian_analysis=data.get("contrarian_analysis"),
            timestamp=data.get("timestamp"),
        )

        # 1. Market regime
        regime, trend, regime_score = detect_market_regime(
            input_data.indicators, input_data.signal
        )

        # 2. Volatility
        atr = float(input_data.indicators.get("ATR", 0.005))
        vol_level, vol_score, vol_impact = analyze_volatility(atr)

        # 3. Session
        session, liquidity, quality = get_trading_session()

        # 4. Economic risk
        econ_risk, events, econ_rec = check_economic_risk(input_data.symbol)

        # 5. Currency strength
        base_str, quote_str, align = analyze_currency_strength(
            input_data.symbol, input_data.signal
        )

        # 6. Context score
        context_score = calculate_context_score(
            regime_score, vol_score, quality, econ_risk, align
        )

        # 7. Confidence adjustment
        adjusted, reason = adjust_confidence(
            input_data.confidence, context_score, vol_level, econ_risk
        )

        return {
            "symbol": input_data.symbol,
            "market_context": {
                "market_regime": regime.value,
                "trend_direction": trend.value,
                "volatility": {"level": vol_level, "score": vol_score},
                "session": {"name": session, "liquidity": liquidity},
                "economic_risk": {"level": econ_risk, "warnings": events},
                "currency_strength": {"alignment": align}
            },
            "market_context_score": context_score,
            "confidence_adjustment": {
                "original": input_data.confidence,
                "adjusted": adjusted,
                "reason": reason
            },
            "summary": f"Market context {'supports' if context_score >= 70 else 'warrants caution for'} the signal."
        }

    except Exception as e:
        return {
            "symbol": data.get("symbol", "UNKNOWN"),
            "market_context": {
                "market_regime": MarketRegime.UNCERTAIN.value,
                "trend_direction": TrendDirection.NEUTRAL.value
            },
            "market_context_score": 50,
            "confidence_adjustment": {
                "original": data.get("confidence", 50),
                "adjusted": 30
            },
            "summary": f"Unable to assess market context: {str(e)}"
        }

# FastAPI Integration
if os.getenv("FASTAPI_ENABLED", "true").lower() == "true":
    from fastapi import FastAPI
    from pydantic import BaseModel

    app = FastAPI(title="Market Context Intelligence Agent", version="1.0")

    class ContextRequest(BaseModel):
        symbol: str
        market: str = "Forex"
        signal: str
        confidence: int
        indicators: Dict
        validation_result: Optional[Dict] = None
        risk_analysis: Optional[Dict] = None
        contrarian_analysis: Optional[Dict] = None
        timestamp: Optional[str] = None

    @app.post("/analyze_market_context")
    async def analyze_context_endpoint(request: ContextRequest):
        result = analyze_market_context(request.model_dump())
        return result

    @app.get("/health")
    async def health():
        return {"status": "ok", "agent": "market-context"}

    if __name__ == "__main__":
        import uvicorn
        uvicorn.run(app, host="0.0.0.0", port=8004)