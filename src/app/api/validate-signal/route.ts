import { NextResponse } from "next/server";

export interface ValidationInput {
  symbol: string;
  market?: string;
  signal: "BUY" | "SELL" | "HOLD";
  confidence: number;
  indicators: Record<string, string | number>;
  analysis: string;
}

export interface ValidationDetails {
  technical_check: { status: string; score: number };
  risk_check: { level: string; warnings: string[] };
  signal_challenge: {
    supporting_factors: string[];
    contradicting_factors: string[];
  };
}

export interface ValidationResponse {
  symbol: string;
  original_signal: string;
  validated_signal: string;
  decision: "APPROVED" | "CAUTION" | "REJECTED";
  original_confidence: number;
  adjusted_confidence: number;
  validation_score: number;
  validation_details: ValidationDetails;
  final_explanation: string;
}

// Local validation logic (mirrors Python agent)
function checkIndicators(indicators: Record<string, string | number>, signal: string) {
  const comments: string[] = [];
  let valid = true;
  const scoreComponents: number[] = [];

  if (indicators.RSI !== undefined) {
    const rsi = Number(indicators.RSI);
    if (rsi < 30) {
      comments.push("RSI indicates oversold conditions");
    } else if (rsi > 70) {
      comments.push("RSI indicates overbought conditions");
    }
    scoreComponents.push(rsi >= 30 && rsi <= 70 ? 85 : 70);
  }

  if (indicators.MACD !== undefined) {
    const macd = String(indicators.MACD).toLowerCase();
    if (signal === "BUY" && macd.includes("bearish")) valid = false;
    if (signal === "SELL" && macd.includes("bullish")) valid = false;
    scoreComponents.push(85);
  }

  const avgScore = scoreComponents.length ? Math.round(scoreComponents.reduce((a, b) => a + b) / scoreComponents.length) : 70;
  return {
    status: avgScore >= 80 ? "PASS" : avgScore >= 60 ? "WARNING" : "FAIL",
    score: avgScore,
    comments,
  };
}

function evaluateConfidence(confidence: number, technicalScore: number) {
  let adjusted = confidence;
  let reason = "Confidence maintained";

  if (technicalScore < 70) {
    adjusted -= 15;
    reason = "Confidence reduced due to weak indicator alignment";
  }
  adjusted = Math.max(10, Math.min(95, adjusted));

  return { adjusted, reason };
}

function identifyRisks(indicators: Record<string, string | number>, technicalScore: number) {
  const warnings: string[] = [];

  if (indicators.ATR !== undefined && Number(indicators.ATR) > 0.01) {
    warnings.push("High volatility may cause stop-loss hunting");
  }

  if (technicalScore < 70) {
    warnings.push("Weak indicator confirmation");
  }

  if (indicators.RSI !== undefined) {
    const rsi = Number(indicators.RSI);
    if (rsi > 65) warnings.push("RSI approaching overbought");
    else if (rsi < 35) warnings.push("RSI approaching oversold");
  }

  const level = warnings.length >= 2 || technicalScore < 60 ? "HIGH" : warnings.length === 1 || technicalScore < 80 ? "MEDIUM" : "LOW";

  return { level, warnings };
}

function challengeSignal(indicators: Record<string, string | number>, signal: string) {
  const supporting: string[] = [];
  const contradicting: string[] = [];

  for (const [key, value] of Object.entries(indicators)) {
    const val = String(value).toLowerCase();
    if (signal === "BUY" && (val.includes("above") || val.includes("bullish"))) {
      supporting.push(`${key} supports bullish`);
    } else if (signal === "BUY" && (val.includes("below") || val.includes("bearish"))) {
      contradicting.push(`${key} contradicts bullish`);
    }
  }

  return { supporting_factors: supporting.slice(0, 3), contradicting_factors: contradicting.slice(0, 3) };
}

function calculateScore(tech: { score: number }, risk: { level: string }) {
  const riskMult = { LOW: 1.0, MEDIUM: 0.7, HIGH: 0.4 } as Record<string, number>;
  return Math.round(tech.score * 0.4 + tech.score * (riskMult[risk.level] ?? 0.5) * 0.3 + tech.score * 0.2 + 7);
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as ValidationInput;

  const required = ["symbol", "signal", "confidence", "indicators", "analysis"];
  for (const field of required) {
    if (!body[field as keyof ValidationInput]) {
      return NextResponse.json({ error: `Missing: ${field}` }, { status: 400 });
    }
  }

  // Run validation
  const technical = checkIndicators(body.indicators, body.signal);
  const confidence = evaluateConfidence(body.confidence, technical.score);
  const risk = identifyRisks(body.indicators, technical.score);
  const challenge = challengeSignal(body.indicators, body.signal);
  const score = calculateScore(technical, risk);

  // Decision logic
  let decision: "APPROVED" | "CAUTION" | "REJECTED" = "APPROVED";
  if (technical.status === "FAIL" || challenge.contradicting_factors.length >= 2) {
    decision = "REJECTED";
  } else if (risk.level === "HIGH" || technical.status === "WARNING") {
    decision = "CAUTION";
  }

  const result: ValidationResponse = {
    symbol: body.symbol,
    original_signal: body.signal,
    validated_signal: body.signal,
    decision,
    original_confidence: body.confidence,
    adjusted_confidence: confidence.adjusted,
    validation_score: score,
    validation_details: { technical_check: technical, risk_check: risk, signal_challenge: challenge },
    final_explanation: `${decision === "APPROVED" ? "Signal validated" : decision === "CAUTION" ? "Signal approved with caution" : "Signal rejected"} - ${challenge.contradicting_factors[0] ?? "Technicals aligned"}.`,
  };

  return NextResponse.json(result);
}