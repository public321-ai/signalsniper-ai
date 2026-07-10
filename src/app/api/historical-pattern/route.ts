import { NextResponse } from "next/server";

export interface HistoricalInput {
  symbol: string;
  timeframe?: string;
  signal: string;
  entry_price: number;
  confidence?: number;
  indicators: Record<string, string | number>;
  validation_result?: { decision: string };
  risk_analysis?: { risk_level: string };
  contrarian_analysis?: { contrarian_result: { signal_strength: string } };
  market_context?: { market_context_score: number };
}

export interface HistoricalResponse {
  symbol: string;
  historical_analysis: {
    similar_patterns_found: number;
    pattern_similarity_score: number;
    historical_success_rate: string;
    successful_cases: number;
    failed_cases: number;
    pattern_strength: string;
    historical_score: number;
    supporting_conditions: string[];
    failure_conditions: string[];
  };
  confidence_adjustment: {
    original_confidence: number;
    adjusted_confidence: number;
    reason: string;
  };
  summary: string;
}

function serializeConditions(
  indicators: Record<string, string | number>,
  signal: string
): Record<string, string> {
  return {
    rsi_zone: Number(indicators.RSI || 50) > 70 ? "OVERBOUGHT" : Number(indicators.RSI || 50) < 30 ? "OVERSOLD" : "NEUTRAL",
    macd_state: String(indicators.MACD || "").toLowerCase(),
    price_vs_ema: String(indicators.EMA50 || "").toLowerCase().includes("above") ? "ABOVE" : "BELOW",
    signal_type: signal.toUpperCase()
  };
}

function findSimilarPatterns(
  _conditions: Record<string, string>,
  similarityThreshold = 0.7
): { total: number; successful: number; similarity: number } {
  // Mock implementation - would integrate with pgvector in production
  const total = 450;
  const successful = 292;
  const similarity = 82;

  return { total, successful, similarity };
}

function detectHistoricalFailures(
  indicators: Record<string, string | number>,
  signal: string
): string[] {
  const failures: string[] = [];

  const rsi = Number(indicators.RSI || 50);
  if (rsi > 70) failures.push("Overextended RSI - reversal risk");
  else if (rsi < 30) failures.push("Oversold RSI - bounce trap risk");

  if (Number(indicators.ATR || 0) > 0.015) failures.push("High volatility - stop hunt risk");

  const macd = String(indicators.MACD || "").toLowerCase();
  if (signal.toUpperCase() === "BUY" && macd.includes("bearish")) {
    failures.push("MACD bearish divergence - historical failure");
  }

  return failures;
}

function evaluatePatternStrength(
  similarity: number,
  successRate: number,
  total: number
): string {
  if (similarity >= 80 && successRate >= 70 && total >= 100) {
    return "STRONG HISTORICAL SUPPORT";
  }
  if (similarity >= 70 && successRate >= 60) {
    return "MODERATE SUPPORT";
  }
  if (similarity >= 50) {
    return "WEAK SUPPORT";
  }
  return "NO CLEAR PATTERN";
}

function calculateHistoricalScore(
  similarity: number,
  successRate: number,
  total: number
): number {
  // Pattern Similarity: 40%
  const simScore = Math.min(100, similarity) * 0.4;
  // Success Rate: 40%
  const sucScore = successRate * 0.4;
  // Condition Match: 20%
  const condScore = Math.min(100, total / 10) * 0.2;

  return Math.round(simScore + sucScore + condScore);
}

function adjustConfidence(
  original: number,
  histScore: number,
  strength: string
): { adjusted: number; reason: string } {
  let adjusted = original;
  const reasons: string[] = [];

  if (strength === "STRONG HISTORICAL SUPPORT") {
    adjusted = Math.min(95, adjusted + 5);
    reasons.push("strong precedent");
  } else if (strength === "MODERATE SUPPORT" && histScore < 60) {
    adjusted -= 5;
    reasons.push("moderate reliability");
  } else if (strength === "WEAK SUPPORT") {
    adjusted -= 10;
    reasons.push("weak history");
  } else if (strength === "NO CLEAR PATTERN") {
    adjusted -= 15;
    reasons.push("no precedent");
  }

  adjusted = Math.max(10, Math.min(95, adjusted));
  return {
    adjusted,
    reason: reasons.length ? `Adjusted due to ${reasons.join(", ")}` : "Historical support confirmed"
  };
}

function findSupportingConditions(
  indicators: Record<string, string | number>,
  signal: string
): string[] {
  const supporting: string[] = [];

  const rsi = Number(indicators.RSI || 50);
  if (rsi >= 40 && rsi <= 60) supporting.push("RSI in healthy zone");

  if (String(indicators.MACD || "").toLowerCase().includes("bullish")) {
    supporting.push("MACD confirmation");
  }

  if (String(indicators.EMA50 || "").toLowerCase().includes("above")) {
    supporting.push("EMA50 support");
  }

  return supporting.slice(0, 3);
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as HistoricalInput;

  const conditions = serializeConditions(body.indicators, body.signal);
  const { total, successful, similarity } = findSimilarPatterns(conditions);

  const successRate = total > 0 ? Math.round((successful / total) * 100) : 0;
  const strength = evaluatePatternStrength(similarity, successRate, total);
  const failures = detectHistoricalFailures(body.indicators, body.signal);
  const histScore = calculateHistoricalScore(similarity, successRate, total);

  const original = body.confidence || 50;
  const { adjusted, reason } = adjustConfidence(original, histScore, strength);
  const supporting = findSupportingConditions(body.indicators, body.signal);

  const result: HistoricalResponse = {
    symbol: body.symbol,
    historical_analysis: {
      similar_patterns_found: total,
      pattern_similarity_score: similarity,
      historical_success_rate: `${successRate}%`,
      successful_cases: successful,
      failed_cases: total - successful,
      pattern_strength: strength,
      historical_score: histScore,
      supporting_conditions: supporting,
      failure_conditions: failures
    },
    confidence_adjustment: {
      original_confidence: original,
      adjusted_confidence: adjusted,
      reason
    },
    summary: `Historical patterns show ${successRate}% success. Monitor ${failures[0] ?? "risk factors"}.`
  };

  return NextResponse.json(result);
}