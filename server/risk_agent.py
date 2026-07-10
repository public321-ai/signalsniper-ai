#!/usr/bin/env python3
"""
Risk Management Agent
Analyzes validated trading signals and provides risk intelligence.
"""

import os
from typing import Dict, List, Optional
from enum import Enum
from dataclasses import dataclass

class RiskLevel(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"

@dataclass
class RiskInput:
    symbol: str
    signal: str
    entry_price: float
    confidence: int
    indicators: Dict[str, str | int | float]
    market_condition: str
    validation_result: Optional[Dict] = None

def calculate_stop_loss(
    entry: float,
    signal: str,
    atr: float,
    support_resistance: Dict[str, float]
) -> float:
    """Calculate logical stop-loss based on volatility and S/R."""
    buffer = atr * 1.5 if atr else 0.005

    if signal.upper() == "BUY":
        # Stop below support zone or entry - buffer
        support = support_resistance.get("support", entry - 0.01)
        return round(min(support, entry - buffer), 4)
    else:
        # Stop above resistance zone or entry + buffer
        resistance = support_resistance.get("resistance", entry + 0.01)
        return round(max(resistance, entry + buffer), 4)

def calculate_take_profit(
    entry: float,
    signal: str,
    stop_loss: float,
    target_risk_reward: float = 2.0
) -> float:
    """Calculate take-profit with target risk-reward ratio."""
    risk = abs(entry - stop_loss)
    reward = risk * target_risk_reward

    if signal.upper() == "BUY":
        return round(entry + reward, 4)
    else:
        return round(entry - reward, 4)

def calculate_risk_reward(entry: float, stop_loss: float, take_profit: float) -> str:
    """Calculate risk-reward ratio string."""
    risk = abs(entry - stop_loss)
    reward = abs(take_profit - entry)
    if risk == 0:
        return "1:1"
    ratio = round(reward / risk, 1)
    return f"1:{ratio}"

def assess_risk(
    indicators: Dict[str, str | int | float],
    signal: str,
    confidence: int
) -> tuple[RiskLevel, int, List[str]]:
    """Evaluate risk based on indicators and market conditions."""
    warnings = []
    score = 100

    # ATR volatility check
    atr = indicators.get("ATR")
    if atr is not None:
        atr_val = float(atr) if isinstance(atr, (int, float)) else 0
        if atr_val > 0.01:
            warnings.append("High volatility detected")
            score -= 15
        elif atr_val < 0.003:
            warnings.append("Low volatility - tighter stops recommended")
            score -= 5

    # RSI extremities
    rsi = indicators.get("RSI")
    if rsi is not None:
        rsi_val = float(rsi)
        if rsi_val > 70:
            warnings.append("RSI overbought - reversal risk")
            score -= 10
        elif rsi_val < 30:
            warnings.append("RSI oversold - bounce potential")
            score -= 10

    # Trend strength via ADX
    adx = indicators.get("ADX")
    if adx is not None:
        adx_val = float(adx)
        if adx_val < 20:
            warnings.append("Weak trend strength - choppy market")
            score -= 20

    # MACD confirmation
    macd = indicators.get("MACD")
    macd_h = indicators.get("MACD_histogram")
    if macd and macd_h:
        macd_str = str(macd).lower()
        if signal.upper() == "BUY" and "bearish" in macd_str:
            warnings.append("MACD contradicts signal")
            score -= 25
        elif signal.upper() == "SELL" and "bullish" in macd_str:
            warnings.append("MACD contradicts signal")
            score -= 25

    # Confidence weight
    if confidence > 85:
        score += 5
    elif confidence < 50:
        warnings.append("Low confidence signal - size down")
        score -= 15

    # Determine risk level
    if score >= 80:
        level = RiskLevel.LOW
    elif score >= 60:
        level = RiskLevel.MEDIUM
    else:
        level = RiskLevel.HIGH

    return level, max(0, score), warnings

def get_position_guidance(
    risk_level: RiskLevel,
    risk_percent: Optional[float] = None,
    account_size: Optional[float] = None
) -> str:
    """Generate position sizing guidance."""
    guidance = []

    if risk_level == RiskLevel.HIGH:
        guidance.append("Reduce position size")
        guidance.append("Tighten stop loss")
    elif risk_level == RiskLevel.MEDIUM:
        guidance.append("Use standard risk management")

    if account_size and risk_percent:
        risk_amount = account_size * (risk_percent / 100)
        guidance.append(f"Max risk: ${risk_amount:.2f}")

    return " | ".join(guidance) if guidance else "Standard position sizing applies"

def analyze_risk(data: Dict) -> Dict:
    """Main entry point - analyze risk for a trading signal."""
    try:
        entry_price = float(data.get("entry_price", data.get("currentPrice", 1.0)))
        signal = str(data.get("signal", data.get("recommendation", "HOLD")))
        confidence = int(data.get("confidence", 50))
        indicators = data.get("indicators", {})

        # Get support/resistance levels
        key_levels = data.get("keyLevels", [])
        sr_levels: Dict[str, float] = {}
        for level in key_levels:
            label = str(level.get("label", "")).lower()
            price = float(level.get("price", 0))
            if "support" in label and not sr_levels.get("support"):
                sr_levels["support"] = price
            elif "resistance" in label and not sr_levels.get("resistance"):
                sr_levels["resistance"] = price

        # Assess risk
        risk_level, risk_score, warnings = assess_risk(indicators, signal, confidence)

        # Calculate SL/TP if not provided
        stop_loss = float(data.get("stopLoss", data.get("stop_loss", 0)))
        take_profit = float(data.get("takeProfit", data.get("take_profit", 0)))

        if not stop_loss or not take_profit:
            stop_loss = calculate_stop_loss(entry_price, signal, float(indicators.get("ATR", 0.005)), sr_levels)
            take_profit = calculate_take_profit(entry_price, signal, stop_loss)

        rr_ratio = calculate_risk_reward(entry_price, stop_loss, take_profit)

        # Additional warnings
        if data.get("validation_result"):
            val = data.get("validation_result", {})
            val_decision = val.get("decision", "")
            if val_decision == "CAUTION":
                warnings.append("Validation agent flagged caution")
            elif val_decision == "REJECTED":
                warnings.append("Signal was rejected by validation agent")

        # Check risk/reward
        if "1:" in rr_ratio:
            rr_parts = rr_ratio.split(":")
            rr_val = float(rr_parts[1]) if len(rr_parts) > 1 else 1
            if rr_val < 1.5:
                warnings.append("Poor risk/reward ratio - consider wider target")

        risk_summary = f"Risk level {risk_level}. {get_position_guidance(risk_level)}."

        return {
            "risk_level": risk_level.value,
            "risk_score": risk_score,
            "stop_loss": str(stop_loss),
            "take_profit": str(take_profit),
            "risk_reward_ratio": rr_ratio,
            "warnings": warnings,
            "risk_summary": risk_summary
        }

    except Exception as e:
        return {
            "risk_level": RiskLevel.HIGH.value,
            "risk_score": 0,
            "stop_loss": "0",
            "take_profit": "0",
            "risk_reward_ratio": "1:1",
            "warnings": [f"Risk analysis error: {str(e)}"],
            "risk_summary": "Unable to assess risk - manual review required"
        }

# FastAPI Integration
if os.getenv("FASTAPI_ENABLED", "true").lower() == "true":
    from fastapi import FastAPI
    from pydantic import BaseModel

    app = FastAPI(title="Risk Management Agent", version="1.0")

    class RiskRequest(BaseModel):
        symbol: str
        signal: str
        entry_price: float
        confidence: int
        indicators: Dict
        market_condition: str
        stopLoss: Optional[float] = None
        takeProfit: Optional[float] = None
        keyLevels: Optional[List[Dict]] = None
        validation_result: Optional[Dict] = None

    @app.post("/analyze_risk")
    async def analyze_risk_endpoint(request: RiskRequest):
        result = analyze_risk(request.model_dump())
        return result

    @app.get("/health")
    async def health():
        return {"status": "ok", "agent": "risk"}

    if __name__ == "__main__":
        import uvicorn
        port = int(os.getenv("RISK_AGENT_PORT", "8002"))
        uvicorn.run(app, host="0.0.0.0", port=port)