#!/usr/bin/env python3
"""
Multi-Agent Decision Orchestrator
Central coordination layer for SignalSniper AI agents.
"""

import os
from typing import Dict, List, Optional
from enum import Enum
from dataclasses import dataclass

class FinalDecision(str, Enum):
    STRONG_BUY = "STRONG BUY"
    BUY = "BUY"
    CAUTIOUS_BUY = "CAUTIOUS BUY"
    HOLD = "HOLD"
    CAUTIOUS_SELL = "CAUTIOUS SELL"
    SELL = "SELL"
    STRONG_SELL = "STRONG SELL"

@dataclass
class OrchestratorInput:
    symbol: str
    signal: str
    confidence: int
    technical_analysis: Optional[Dict] = None
    validation_result: Optional[Dict] = None
    risk_analysis: Optional[Dict] = None
    contrarian_analysis: Optional[Dict] = None
    market_context: Optional[Dict] = None
    historical_analysis: Optional[Dict] = None

def aggregate_agent_results(data: OrchestratorInput) -> Dict:
    """Extract scores from all agent outputs."""
    return {
        "validation": {
            "score": data.validation_result.get("validation_score", 50) if data.validation_result else 50,
            "status": data.validation_result.get("decision", "UNKNOWN") if data.validation_result else "UNKNOWN"
        },
        "risk": {
            "score": 100 - data.risk_analysis.get("risk_score", 50) if data.risk_analysis else 50,
            "level": data.risk_analysis.get("risk_level", "UNKNOWN") if data.risk_analysis else "UNKNOWN"
        },
        "contrarian": {
            "score": data.contrarian_analysis.get("contrarian_result", {}).get("challenge_score", 50) if data.contrarian_analysis else 50,
            "risk": "HIGH" if data.contrarian_analysis.get("contrarian_result", {}).get("failure_probability", "").startswith("HIGH") else "MODERATE"
        },
        "market_context": {
            "score": data.market_context.get("market_context_score", 50) if data.market_context else 50,
            "condition": "FAVORABLE" if data.market_context.get("market_context_score", 50) > 70 else "CAUTION"
        },
        "historical": {
            "score": data.historical_analysis.get("historical_score", 50) if data.historical_analysis else 50,
            "success_rate": data.historical_analysis.get("historical_analysis", {}).get("historical_success_rate", "N/A") if data.historical_analysis else "N/A"
        }
    }

def calculate_sniper_score(agent_summary: Dict) -> int:
    """Calculate SignalSniper Intelligence Score (0-100).

    Weights:
    - Technical Validation: 25%
    - Risk Quality: 25%
    - Market Context: 20%
    - Historical Pattern: 20%
    - Contrarian Review: 10%
    """
    v = agent_summary.get("validation", {}).get("score", 50)
    r = agent_summary.get("risk", {}).get("score", 50)
    c = agent_summary.get("contrarian", {}).get("score", 50)
    m = agent_summary.get("market_context", {}).get("score", 50)
    h = agent_summary.get("historical", {}).get("score", 50)

    return int(v * 0.25 + r * 0.25 + m * 0.20 + h * 0.20 + c * 0.10)

def resolve_conflicts(
    signal: str,
    agent_summary: Dict,
    risk_level: str
) -> tuple[FinalDecision, List[str]]:
    """Resolve conflicting agent opinions."""
    warnings = []

    # Extract key metrics
    val_status = agent_summary.get("validation", {}).get("status", "")
    contrarian_score = agent_summary.get("contrarian", {}).get("score", 50)

    # Risk-based adjustments
    if risk_level == "HIGH":
        warnings.append("High risk limits signal strength")
    elif risk_level == "MEDIUM":
        warnings.append("Medium risk requires caution")

    # Contrarian warnings
    if contrarian_score < 50:
        warnings.append("Contrarian agent flags reversal risk")
    elif contrarian_score < 70:
        warnings.append("Contrarian agent notes moderate concerns")

    # Decision logic
    base = signal.upper()
    sniper_score = calculate_sniper_score(agent_summary)

    if val_status == "REJECTED":
        return FinalDecision.HOLD, ["Signal rejected by validation agent"]

    if sniper_score >= 85:
        return FinalDecision.STRONG_BUY if base == "BUY" else FinalDecision.STRONG_SELL, warnings
    elif sniper_score >= 70:
        return FinalDecision.BUY if base == "BUY" else FinalDecision.SELL, warnings
    elif sniper_score >= 50:
        return FinalDecision.CAUTIOUS_BUY if base == "BUY" else FinalDecision.CAUTIOUS_SELL, warnings
    else:
        return FinalDecision.HOLD, ["Low confidence score"]

def calibrate_confidence(
    original: int,
    sniper_score: int,
    risk_level: str,
    contrarian_score: int
) -> tuple[int, str]:
    """Calibrate confidence based on multi-agent review."""
    adjusted = original
    reasons = []

    if sniper_score < 60:
        adjusted -= 15
        reasons.append("low agent consensus")
    elif sniper_score < 75:
        adjusted -= 8
        reasons.append("moderate consensus")

    if risk_level == "HIGH":
        adjusted -= 12
        reasons.append("high risk environment")
    elif risk_level == "MEDIUM":
        adjusted -= 5
        reasons.append("medium risk")

    if contrarian_score < 50:
        adjusted -= 10
        reasons.append("contrarian concerns")

    adjusted = max(10, min(95, adjusted))
    reason = f"Adjusted due to {', '.join(reasons)}" if reasons else "Confidence maintained after review"

    return adjusted, reason

def generate_final_decision(
    data: OrchestratorInput,
    agent_summary: Dict
) -> Dict:
    """Generate final orchestrated decision."""
    sniper_score = calculate_sniper_score(agent_summary)
    decision, warnings_list = resolve_conflicts(
        data.signal, agent_summary,
        data.risk_analysis.get("risk_level", "MEDIUM") if data.risk_analysis else "MEDIUM"
    )

    adjusted, reason = calibrate_confidence(
        data.confidence,
        sniper_score,
        data.risk_analysis.get("risk_level", "MEDIUM") if data.risk_analysis else "MEDIUM",
        agent_summary.get("contrarian", {}).get("score", 50)
    )

    return {
        "symbol": data.symbol,
        "final_decision": decision.value,
        "original_signal": data.signal,
        "sniper_score": sniper_score,
        "confidence": adjusted,
        "agent_summary": agent_summary,
        "decision_reason": f"Multi-agent analysis {'supports' if sniper_score >= 70 else 'suggests caution'} the signal.",
        "warnings": warnings_list
    }

def run_pipeline(data: Dict) -> Dict:
    """Main entry point - run full agent pipeline."""
    try:
        input_data = OrchestratorInput(
            symbol=data.get("symbol", ""),
            signal=data.get("signal", "HOLD"),
            confidence=data.get("confidence", 50),
            technical_analysis=data.get("technical_analysis"),
            validation_result=data.get("validation_result"),
            risk_analysis=data.get("risk_analysis"),
            contrarian_analysis=data.get("contrarian_analysis"),
            market_context=data.get("market_context"),
            historical_analysis=data.get("historical_analysis")
        )

        agent_summary = aggregate_agent_results(input_data)
        return generate_final_decision(input_data, agent_summary)

    except Exception as e:
        return {
            "symbol": data.get("symbol", "UNKNOWN"),
            "final_decision": FinalDecision.HOLD.value,
            "sniper_score": 0,
            "confidence": 30,
            "warnings": [f"Orchestrator error: {str(e)}"],
            "decision_reason": "Unable to process agent responses."
        }

# FastAPI Integration
if os.getenv("FASTAPI_ENABLED", "true").lower() == "true":
    from fastapi import FastAPI
    from pydantic import BaseModel

    app = FastAPI(title="Multi-Agent Decision Orchestrator", version="1.0")

    class OrchestratorRequest(BaseModel):
        symbol: str
        signal: str
        confidence: int
        technical_analysis: Optional[Dict] = None
        validation_result: Optional[Dict] = None
        risk_analysis: Optional[Dict] = None
        contrarian_analysis: Optional[Dict] = None
        market_context: Optional[Dict] = None
        historical_analysis: Optional[Dict] = None

    @app.post("/orchestrate")
    async def orchestrate_endpoint(request: OrchestratorRequest):
        result = run_pipeline(request.model_dump())
        return result

    @app.get("/health")
    async def health():
        return {"status": "ok", "agent": "orchestrator"}

    if __name__ == "__main__":
        import uvicorn
        uvicorn.run(app, host="0.0.0.0", port=8006)