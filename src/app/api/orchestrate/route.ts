import { NextResponse } from "next/server";

export interface OrchestratorInput {
  symbol: string;
  signal: string;
  confidence: number;
  technical_analysis?: Record<string, unknown>;
  validation_result?: {
    validation_score: number;
    decision: string;
  };
  risk_analysis?: {
    risk_score: number;
    risk_level: string;
  };
  contrarian_analysis?: {
    contrarian_result: { challenge_score: number; failure_probability: string };
  };
  market_context?: { market_context_score: number };
  historical_analysis?: {
    historical_score: number;
    historical_analysis?: { historical_success_rate: string };
  };
}

export interface AgentSummary {
  validation: { score: number; status: string };
  risk: { score: number; level: string };
  contrarian: { score: number; risk: string };
  market_context: { score: number; condition: string };
  historical: { score: number; success_rate: string };
}

export interface OrchestratorResponse {
  symbol: string;
  final_decision: string;
  original_signal: string;
  sniper_score: number;
  confidence: number;
  agent_summary: AgentSummary;
  decision_reason: string;
  warnings: string[];
}

function aggregateAgentResults(data: OrchestratorInput): AgentSummary {
  return {
    validation: {
      score: data.validation_result?.validation_score ?? 50,
      status: data.validation_result?.decision ?? "UNKNOWN"
    },
    risk: {
      score: 100 - (data.risk_analysis?.risk_score ?? 50),
      level: data.risk_analysis?.risk_level ?? "UNKNOWN"
    },
    contrarian: {
      score: data.contrarian_analysis?.contrarian_result?.challenge_score ?? 50,
      risk: data.contrarian_analysis?.contrarian_result?.challenge_score < 50 ? "HIGH" : "MODERATE"
    },
    market_context: {
      score: data.market_context?.market_context_score ?? 50,
      condition: (data.market_context?.market_context_score ?? 50) > 70 ? "FAVORABLE" : "CAUTION"
    },
    historical: {
      score: data.historical_analysis?.historical_score ?? 50,
      success_rate: data.historical_analysis?.historical_analysis?.historical_success_rate ?? "N/A"
    }
  };
}

function calculateSniperScore(summary: AgentSummary): number {
  return Math.round(
    summary.validation.score * 0.25 +
    summary.risk.score * 0.25 +
    summary.market_context.score * 0.20 +
    summary.historical.score * 0.20 +
    summary.contrarian.score * 0.10
  );
}

function resolveConflicts(
  signal: string,
  summary: AgentSummary,
  riskLevel: string
): { decision: string; warnings: string[] } {
  const warnings: string[] = [];
  const sniperScore = calculateSniperScore(summary);

  if (summary.validation.status === "REJECTED") {
    return { decision: "HOLD", warnings: ["Signal rejected by validation"] };
  }

  if (riskLevel === "HIGH") warnings.push("High risk limits signal strength");
  else if (riskLevel === "MEDIUM") warnings.push("Medium risk requires caution");

  if (summary.contrarian.score < 70) {
    warnings.push("Contrarian agent flags reversal risk");
  }

  if (sniperScore >= 85) {
    return {
      decision: signal.toUpperCase() === "BUY" ? "STRONG BUY" : "STRONG SELL",
      warnings
    };
  }
  if (sniperScore >= 70) {
    return {
      decision: signal.toUpperCase() === "BUY" ? "BUY" : "SELL",
      warnings
    };
  }
  if (sniperScore >= 50) {
    return {
      decision: signal.toUpperCase() === "BUY" ? "CAUTIOUS BUY" : "CAUTIOUS SELL",
      warnings
    };
  }

  return { decision: "HOLD", warnings: ["Low confidence score"] };
}

function calibrateConfidence(
  original: number,
  sniperScore: number,
  riskLevel: string,
  contrarianScore: number
): { adjusted: number; reason: string } {
  let adjusted = original;
  const reasons: string[] = [];

  if (sniperScore < 60) {
    adjusted -= 15;
    reasons.push("low consensus");
  } else if (sniperScore < 75) {
    adjusted -= 8;
    reasons.push("moderate consensus");
  }

  if (riskLevel === "HIGH") {
    adjusted -= 12;
    reasons.push("high risk");
  } else if (riskLevel === "MEDIUM") {
    adjusted -= 5;
    reasons.push("medium risk");
  }

  if (contrarianScore < 50) {
    adjusted -= 10;
    reasons.push("contrarian concerns");
  }

  adjusted = Math.max(10, Math.min(95, adjusted));
  return {
    adjusted,
    reason: reasons.length ? `Adjusted due to ${reasons.join(", ")}` : "Confidence maintained"
  };
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as OrchestratorInput;

  const summary = aggregateAgentResults(body);
  const sniperScore = calculateSniperScore(summary);
  const { decision, warnings } = resolveConflicts(
    body.signal,
    summary,
    body.risk_analysis?.risk_level ?? "MEDIUM"
  );

  const { adjusted, reason } = calibrateConfidence(
    body.confidence ?? 50,
    sniperScore,
    body.risk_analysis?.risk_level ?? "MEDIUM",
    summary.contrarian.score
  );

  const result: OrchestratorResponse = {
    symbol: body.symbol,
    final_decision: decision,
    original_signal: body.signal,
    sniper_score: sniperScore,
    confidence: adjusted,
    agent_summary: summary,
    decision_reason: sniperScore >= 70
      ? "Multi-agent analysis supports the signal."
      : "Multi-agent analysis suggests caution.",
    warnings
  };

  return NextResponse.json(result);
}