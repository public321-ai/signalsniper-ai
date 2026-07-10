import { NextResponse } from "next/server";

export interface ContrarianInput {
  symbol: string;
  signal: string;
  confidence: number;
  indicators: Record<string, string | number>;
  technical_analysis: string;
  validation_result?: { decision: string; validated_signal: string };
  risk_analysis?: { risk_level: string; warnings: string[] };
  keyLevels?: Array<{ price: number; label: string }>;
}

export interface ContrarianResponse {
  signal: string;
  contrarian_result: {
    signal_strength: string;
    challenge_score: number;
    supporting_factors: string[];
    risk_factors: string[];
    failure_probability: string;
  };
  original_confidence: number;
  adjusted_confidence: number;
  final_comment: string;
}

function detectConflicts(
  indicators: Record<string, string | number>,
  signal: string
): string[] {
  const conflicts: string[] = [];
  const signalUpper = signal.toUpperCase();

  // RSI extremities
  if (indicators.RSI !== undefined) {
    const rsi = Number(indicators.RSI);
    if (signalUpper === "BUY" && rsi > 65) {
      conflicts.push("RSI approaching overbought territory");
    } else if (signalUpper === "SELL" && rsi < 35) {
      conflicts.push("RSI approaching oversold territory");
    }
  }

  // MACD contradictions
  if (indicators.MACD !== undefined) {
    const macd = String(indicators.MACD).toLowerCase();
    if (signalUpper === "BUY" && macd.includes("bearish")) {
      conflicts.push("MACD shows bearish divergence");
    } else if (signalUpper === "SELL" && macd.includes("bullish")) {
      conflicts.push("MACD shows bullish divergence");
    }
  }

  // Moving average contradictions
  for (const ma of ["EMA50", "SMA20", "EMA26"]) {
    if (indicators[ma] !== undefined) {
      const rel = String(indicators[ma]).toLowerCase();
      if (signalUpper === "BUY" && rel.includes("below")) {
        conflicts.push(`Price below ${ma}`);
      } else if (signalUpper === "SELL" && rel.includes("above")) {
        conflicts.push(`Price above ${ma}`);
      }
    }
  }

  return conflicts;
}

function findSupporting(
  indicators: Record<string, string | number>,
  signal: string
): string[] {
  const supporting: string[] = [];
  const signalUpper = signal.toUpperCase();

  for (const [key, value] of Object.entries(indicators)) {
    const val = String(value).toLowerCase();
    if (signalUpper === "BUY" && (val.includes("above") || val.includes("bullish"))) {
      supporting.push(`${key} confirms bullish`);
    } else if (signalUpper === "SELL" && (val.includes("below") || val.includes("bearish"))) {
      supporting.push(`${key} confirms bearish`);
    }
  }

  return supporting.slice(0, 3);
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as ContrarianInput;

  // Detect contradictions
  const riskFactors = detectConflicts(body.indicators, body.signal);

  // Find supporting factors
  const supporting = findSupporting(body.indicators, body.signal);

  // Count net score
  const netScore = supporting.length - riskFactors.length;

  // Signal strength
  let strength: string;
  let challengeScore: number;
  if (netScore >= 3) {
    strength = body.signal.toUpperCase() === "BUY" ? "STRONG BUY" : "STRONG SELL";
    challengeScore = 85;
  } else if (netScore >= 1) {
    strength = body.signal.toUpperCase() === "BUY" ? "MODERATE BUY" : "MODERATE SELL";
    challengeScore = 65;
  } else if (netScore <= -3) {
    strength = body.signal.toUpperCase() === "BUY" ? "STRONG SELL" : "STRONG BUY";
    challengeScore = 20;
  } else if (netScore <= -1) {
    strength = body.signal.toUpperCase() === "BUY" ? "WEAK BUY" : "WEAK SELL";
    challengeScore = 45;
  } else {
    strength = "NEUTRAL";
    challengeScore = 50;
  }

  // Adjust confidence
  let adjusted = body.confidence;
  if (challengeScore < 50) adjusted -= 15;
  else if (challengeScore < 70) adjusted -= 8;
  if (riskFactors.length >= 2) adjusted -= 10;
  adjusted = Math.max(10, Math.min(95, adjusted));

  // Failure probability
  let failureProb = "LOW";
  if (challengeScore < 50 || riskFactors.length >= 2) {
    failureProb = "MEDIUM-HIGH";
  } else if (challengeScore < 70) {
    failureProb = "LOW-MEDIUM";
  }

  const result: ContrarianResponse = {
    signal: body.signal,
    contrarian_result: {
      signal_strength: strength,
      challenge_score: challengeScore,
      supporting_factors: supporting,
      risk_factors: riskFactors,
      failure_probability: failureProb
    },
    original_confidence: body.confidence,
    adjusted_confidence: adjusted,
    final_comment: challengeScore >= 50
      ? `The ${body.signal} signal remains valid but requires monitoring ${riskFactors.slice(0, 1).join(" and ")}.`
      : `The ${body.signal} signal is questionable - consider alternatives.`
  };

  return NextResponse.json(result);
}