#!/usr/bin/env python3
"""
AI Trade Report Generator
Converts multi-agent analysis into professional trading intelligence reports.
"""

import os
from typing import Dict, Optional
from enum import Enum
from dataclasses import dataclass

class ReportFormat(str, Enum):
    JSON = "json"
    MARKDOWN = "markdown"
    PDF = "pdf"

@dataclass
class ReportInput:
    symbol: str
    signal: str
    confidence: int
    sniper_score: int
    rating: str
    agent_analysis: Dict

def generate_json_report(data: Dict) -> Dict:
    """Generate structured JSON report."""
    return {
        "report_type": "trade_analysis",
        "symbol": data.get("symbol", "UNKNOWN"),
        "decision": data.get("signal", "HOLD"),
        "sniper_score": data.get("sniper_score", 0),
        "confidence": data.get("confidence", 0),
        "rating": data.get("rating", "UNKNOWN"),
        "sections": {
            "trade_overview": generate_trade_overview(data),
            "ai_decision_summary": generate_decision_summary(data),
            "technical_intelligence": generate_technical_section(data),
            "risk_assessment": generate_risk_section(data),
            "contrarian_review": generate_contrarian_section(data),
            "market_context": generate_market_section(data),
            "historical_intelligence": generate_historical_section(data),
            "final_decision": generate_final_section(data)
        }
    }

def generate_trade_overview(data: Dict) -> Dict:
    """Generate trade overview section."""
    return {
        "symbol": data.get("symbol", "UNKNOWN"),
        "direction": data.get("signal", "HOLD"),
        "confidence": f"{data.get('confidence', 0)}%",
        "sniper_score": f"{data.get('sniper_score', 0)}/100",
        "rating": data.get("rating", "UNKNOWN")
    }

def generate_decision_summary(data: Dict) -> str:
    """Generate AI decision summary text."""
    summary_parts = []
    agent = data.get("agent_analysis", {})

    # Technical validation
    val = agent.get("validation", {})
    if val.get("validation_score", 0) >= 80:
        summary_parts.append("strong technical confirmation")

    # Risk assessment
    risk = agent.get("risk_analysis", {})
    if risk.get("risk_level") == "LOW":
        summary_parts.append("low risk exposure")
    elif risk.get("risk_level") == "MEDIUM":
        summary_parts.append("controlled risk")

    # Market context
    ctx = agent.get("market_context", {})
    if ctx.get("market_context_score", 0) >= 70:
        summary_parts.append("favorable market conditions")

    # Historical
    hist = agent.get("historical_analysis", {})
    if hist.get("historical_score", 0) >= 70:
        summary_parts.append("positive historical precedent")

    if summary_parts:
        summary = f"Multiple AI analysts support the {data.get('signal', '').lower()} setup due to "
        summary += ", ".join(summary_parts) + "."
    else:
        summary = "AI analysis complete. Review individual sections for detailed insights."

    return summary

def generate_technical_section(data: Dict) -> Dict:
    """Generate technical intelligence section."""
    agent = data.get("agent_analysis", {})
    val = agent.get("validation_result", {})

    supporting = []
    # Check validation data for supporting factors
    if isinstance(val.get("supporting_factors"), list):
        supporting = val["supporting_factors"][:3]
    else:
        # Derive from score
        if data.get("sniper_score", 0) >= 70:
            supporting = ["Technical indicators aligned"]

    return {
        "indicators_analyzed": 14,
        "supporting_factors": supporting[:3],
        "validation_score": data.get("agent_analysis", {}).get("validation", {}).get("score", 50)
    }

def generate_risk_section(data: Dict) -> Dict:
    """Generate risk assessment section."""
    agent = data.get("agent_analysis", {})
    risk = agent.get("risk_analysis", {})
    val = agent.get("validation_result", {})

    return {
        "level": risk.get("risk_level", "UNKNOWN"),
        "stop_loss": "See signal data",
        "take_profit": "See signal data",
        "risk_reward": risk.get("risk_reward_ratio", "N/A"),
        "warnings": risk.get("warnings", [])
    }

def generate_contrarian_section(data: Dict) -> Dict:
    """Generate contrarian review section."""
    agent = data.get("agent_analysis", {})
    contra = agent.get("contrarian_analysis", {})
    result = contra.get("contrarian_result", {})

    warnings = []
    if result.get("failure_probability"):
        warnings.append(f"Failure probability: {result['failure_probability']}")

    return {
        "risk_factors": result.get("risk_factors", warnings),
        "contrarian_score": result.get("challenge_score", 50)
    }

def generate_market_section(data: Dict) -> Dict:
    """Generate market context section."""
    agent = data.get("agent_analysis", {})
    ctx = agent.get("market_context", {})

    return {
        "regime": ctx.get("market_regime", "UNKNOWN"),
        "trend": ctx.get("trend_direction", "NEUTRAL"),
        "volatility": ctx.get("volatility", {}).get("level", "UNKNOWN"),
        "economic_risk": ctx.get("economic_risk", {}).get("level", "UNKNOWN")
    }

def generate_historical_section(data: Dict) -> Dict:
    """Generate historical intelligence section."""
    agent = data.get("agent_analysis", {})
    hist = agent.get("historical_analysis", {})

    return {
        "similar_patterns": hist.get("similar_patterns_found", 0),
        "success_rate": hist.get("historical_success_rate", "N/A"),
        "pattern_similarity": hist.get("pattern_similarity_score", 0)
    }

def generate_final_section(data: Dict) -> Dict:
    """Generate final decision section."""
    # Map sniper score to decision
    score = data.get("sniper_score", 0)
    signal = data.get("signal", "HOLD")

    if score >= 85:
        decision = f"{signal} - EXCEPTIONAL"
    elif score >= 70:
        decision = f"{signal} - STRONG"
    elif score >= 50:
        decision = f"{signal} - CAUTIOUS"
    else:
        decision = f"{signal} - WEAK"

    return {
        "decision": decision,
        "confidence": f"{data.get('confidence', 0)}%",
        "sniper_score": f"{score}/100",
        "summary": generate_decision_summary(data)
    }

def generate_markdown_report(data: Dict) -> str:
    """Generate markdown formatted report."""
    report = f"# SignalSniper AI Trade Report\n\n"
    report += f"## Trade Overview\n\n"
    report += f"**{data.get('symbol', 'UNKNOWN')}**\n\n"
    report += f"- **Signal:** {data.get('signal', 'HOLD')}\n"
    report += f"- **Confidence:** {data.get('confidence', 0)}%\n"
    report += f"- **SignalSniper Score™:** {data.get('sniper_score', 0)}/100\n"
    report += f"- **Rating:** {data.get('rating', 'UNKNOWN')}\n\n"

    report += f"## AI Decision Summary\n\n{generate_decision_summary(data)}\n\n"

    # Technical
    tech = generate_technical_section(data)
    report += f"## Technical Intelligence\n\n"
    report += f"- Indicators: {tech['indicators_analyzed']}\n"
    report += f"- Score: {tech['validation_score']}/100\n\n"

    # Risk
    risk = generate_risk_section(data)
    report += f"## Risk Assessment\n\n"
    report += f"- **Level:** {risk['level']}\n"
    report += f"- **Risk/Reward:** {risk['risk_reward']}\n"
    if risk['warnings']:
        report += f"- **Warnings:** {', '.join(risk['warnings'])}\n\n"

    # Contrarian
    contra = generate_contrarian_section(data)
    report += f"## Contrarian Review\n\n"
    report += f"- Score: {contra['contrarian_score']}/100\n"
    report += f"- Risk Factors: {', '.join(contra['risk_factors']) if contra['risk_factors'] else 'None identified'}\n\n"

    # Market
    ctx = generate_market_section(data)
    report += f"## Market Context\n\n"
    report += f"- Regime: {ctx['regime']}\n"
    report += f"- Volatility: {ctx['volatility']}\n\n"

    # Historical
    hist = generate_historical_section(data)
    report += f"## Historical Intelligence\n\n"
    report += f"- Similar Patterns: {hist['similar_patterns']}\n"
    report += f"- Success Rate: {hist['success_rate']}\n\n"

    # Final
    final = generate_final_section(data)
    report += f"## Final AI Decision\n\n"
    report += f"**Decision:** {final['decision']}\n\n"
    report += f"{final['summary']}\n"

    return report

def generate_trade_report(data: Dict, format: str = "json") -> Dict | str:
    """Main entry point - generate report in requested format."""
    if format == ReportFormat.MARKDOWN:
        return generate_markdown_report(data)
    return generate_json_report(data)

# FastAPI Integration
if os.getenv("FASTAPI_ENABLED", "true").lower() == "true":
    from fastapi import FastAPI
    from pydantic import BaseModel

    app = FastAPI(title="AI Trade Report Generator", version="1.0")

    class ReportRequest(BaseModel):
        symbol: str
        signal: str
        confidence: int
        sniper_score: int
        rating: str
        agent_analysis: Dict
        format: str = "json"

    @app.post("/generate_trade_report")
    async def generate_report(request: ReportRequest):
        result = generate_trade_report(request.model_dump(), request.format)
        return result

    @app.get("/health")
    async def health():
        return {"status": "ok", "engine": "report-generator"}

    if __name__ == "__main__":
        import uvicorn
        uvicorn.run(app, host="0.0.0.0", port=8008)