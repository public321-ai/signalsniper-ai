import { NextResponse } from "next/server";

export interface MarketContextInput {
  symbol: string;
  market?: string;
  signal: string;
  confidence: number;
  indicators: Record<string, string | number>;
  validation_result?: { decision: string };
  risk_analysis?: { risk_level: string; warnings: string[] };
  contrarian_analysis?: { contrarian_result: { signal_strength: string } };
  timestamp?: string;
}

export interface MarketContextResponse {
  symbol: string;
  market_context: {
    market_regime: string;
    trend_direction: string;
    volatility: { level: string; score: number };
    session: { name: string; liquidity: string };
    economic_risk: { level: string; warnings: string[] };
    currency_strength: { alignment: string };
  };
  market_context_score: number;
  confidence_adjustment: {
    original: number;
    adjusted: number;
    reason: string;
  };
  summary: string;
}

function detectRegime(
  indicators: Record<string, string | number>,
  signal: string
): { regime: string; trend: string; score: number } {
  let score = 50;

  const adx = Number(indicators.ADX || 0);
  if (adx > 25) score += 20;
  else score -= 15;

  const rsi = Number(indicators.RSI || 50);
  if (rsi > 40 && rsi < 60) score += 10;
  else if (rsi > 70 || rsi < 30) score -= 10;

  let regime = "UNCERTAIN", trend = "NEUTRAL";
  if (score >= 70) {
    regime = "TRENDING";
    trend = signal.toUpperCase() === "BUY" ? "BULLISH" : "BEARISH";
  } else if (score >= 50) {
    regime = "RANGING";
  }

  return { regime, trend, score };
}

function analyzeVolatility(atr: number): { level: string; score: number; impact: string } {
  if (atr > 0.015) return { level: "HIGH", score: 85, impact: "Elevated risk" };
  if (atr > 0.008) return { level: "MEDIUM", score: 70, impact: "Moderate risk" };
  return { level: "LOW", score: 40, impact: "Standard risk" };
}

function getSession(): { name: string; liquidity: string; quality: string } {
  const hour = new Date().getUTCHours();

  if (hour >= 16 && hour < 20) {
    return { name: "London-New York Overlap", liquidity: "VERY_HIGH", quality: "OPTIMAL" };
  }
  if (hour >= 8 && hour < 12) {
    return { name: "London Session", liquidity: "HIGH", quality: "FAVORABLE" };
  }
  if (hour >= 12 && hour < 16) {
    return { name: "New York Session", liquidity: "HIGH", quality: "FAVORABLE" };
  }
  if (hour >= 0 && hour < 8) {
    return { name: "Asian Session", liquidity: "MEDIUM", quality: "FAVORABLE" };
  }
  return { name: "Off Hours", liquidity: "LOW", quality: "CAUTION" };
}

function calculateScore(
  regimeScore: number,
  vol: { level: string; score: number },
  sessionQuality: string,
  econRisk: string,
  currencyAlign: string
): number {
  const sessionScore = { OPTIMAL: 100, FAVORABLE: 80, CAUTION: 60 }.get(sessionQuality, 50);
  const econScore = { LOW: 100, MEDIUM: 70, HIGH: 40 }.get(econRisk, 80);
  const currencyScore = { POSITIVE: 100, NEUTRAL: 70, MIXED: 50 }.get(currencyAlign, 70);

  return Math.round(
    regimeScore * 0.3 + vol.score * 0.25 + sessionScore * 0.2 + econScore * 0.15 + currencyScore * 0.1
  );
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as MarketContextInput;

  const { regime, trend, score: regimeScore } = detectRegime(
    body.indicators,
    body.signal
  );

  const atr = Number(body.indicators.ATR || 0.005);
  const vol = analyzeVolatility(atr);

  const { name: session, liquidity, quality } = getSession();

  const ctxScore = calculateScore(
    regimeScore,
    vol,
    quality,
    "LOW", // Placeholder - integrate real economic calendar
    "POSITIVE" // Placeholder
  );

  // Adjust confidence
  let adjusted = body.confidence;
  const reasons: string[] = [];
  if (ctxScore < 60) {
    adjusted -= 15;
    reasons.push("weak context");
  } else if (ctxScore < 75) {
    adjusted -= 8;
    reasons.push("moderate conditions");
  }
  if (vol.level === "HIGH") {
    adjusted -= 10;
    reasons.push("high volatility");
  }
  adjusted = Math.max(10, Math.min(95, adjusted));

  const result: MarketContextResponse = {
    symbol: body.symbol,
    market_context: {
      market_regime: regime,
      trend_direction: trend,
      volatility: { level: vol.level, score: vol.score },
      session: { name: session, liquidity },
      economic_risk: { level: "LOW", warnings: [] },
      currency_strength: { alignment: "POSITIVE" }
    },
    market_context_score: ctxScore,
    confidence_adjustment: {
      original: body.confidence,
      adjusted,
      reason: reasons.length ? reasons.join(", ") : "Stable context"
    },
    summary: `Market ${ctxScore >= 70 ? "supports" : "warrants caution"} the signal.`
  };

  return NextResponse.json(result);
}