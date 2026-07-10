import { NextResponse } from "next/server";

export interface RiskInput {
  symbol: string;
  signal: string;
  entry_price: number;
  confidence: number;
  indicators: Record<string, string | number>;
  market_condition?: string;
  stopLoss?: number;
  takeProfit?: number;
  keyLevels?: Array<{ price: number; label: string; type: string }>;
  validation_result?: {
    decision: string;
    validated_signal: string;
    adjusted_confidence: number;
  };
}

export interface RiskResponse {
  risk_level: "LOW" | "MEDIUM" | "HIGH";
  risk_score: number;
  stop_loss: string;
  take_profit: string;
  risk_reward_ratio: string;
  warnings: string[];
  risk_summary: string;
}

function calculateStopLoss(
  entry: number,
  signal: string,
  atr: number,
  levels: Record<string, number>
): number {
  const buffer = atr * 1.5 || 0.005;
  if (signal.toUpperCase() === "BUY") {
    const support = levels.support || entry - 0.01;
    return Math.min(support, Number((entry - buffer).toFixed(4)));
  }
  const resistance = levels.resistance || entry + 0.01;
  return Math.max(resistance, Number((entry + buffer).toFixed(4)));
}

function calculateTakeProfit(
  entry: number,
  signal: string,
  stopLoss: number,
  rr = 2.0
): number {
  const risk = Math.abs(entry - stopLoss);
  const reward = risk * rr;
  if (signal.toUpperCase() === "BUY") {
    return Number((entry + reward).toFixed(4));
  }
  return Number((entry - reward).toFixed(4));
}

function calculateRR(entry: number, sl: number, tp: number): string {
  const risk = Math.abs(entry - sl);
  const reward = Math.abs(tp - entry);
  if (risk === 0) return "1:1";
  return `1:${Math.round(reward / risk * 10) / 10}`;
}

function assessRisk(
  indicators: Record<string, string | number>,
  signal: string,
  confidence: number
): { level: "LOW" | "MEDIUM" | "HIGH"; score: number; warnings: string[] } {
  const warnings: string[] = [];
  let score = 100;

  // Volatility via ATR
  if (indicators.ATR !== undefined) {
    const atr = Number(indicators.ATR);
    if (atr > 0.01) {
      warnings.push("High volatility detected");
      score -= 15;
    } else if (atr < 0.003) {
      warnings.push("Low volatility - use tighter stops");
      score -= 5;
    }
  }

  // RSI extremities
  if (indicators.RSI !== undefined) {
    const rsi = Number(indicators.RSI);
    if (rsi > 70) {
      warnings.push("RSI overbought - reversal risk");
      score -= 10;
    } else if (rsi < 30) {
      warnings.push("RSI oversold - bounce risk");
      score -= 10;
    }
  }

  // Trend strength
  if (indicators.ADX !== undefined) {
    const adx = Number(indicators.ADX);
    if (adx < 20) {
      warnings.push("Weak trend - choppy market");
      score -= 20;
    }
  }

  // Confidence weight
  if (confidence < 50) {
    warnings.push("Low confidence - size down");
    score -= 15;
  } else if (confidence > 85) {
    score += 5;
  }

  const level = score >= 80 ? "LOW" : score >= 60 ? "MEDIUM" : "HIGH";
  return { level, score: Math.max(0, score), warnings };
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as RiskInput;

  // Extract S/R levels
  const srLevels: Record<string, number> = {};
  if (body.keyLevels) {
    for (const lvl of body.keyLevels) {
      const label = lvl.label.toLowerCase();
      if (label.includes("support") && !srLevels.support) {
        srLevels.support = lvl.price;
      } else if (label.includes("resistance") && !srLevels.resistance) {
        srLevels.resistance = lvl.price;
      }
    }
  }

  const entry = body.entry_price || 1;
  const signal = body.signal.toUpperCase();
  const confidence = body.confidence || 50;

  // Assess risk
  const { level, score, warnings } = assessRisk(body.indicators, signal, confidence);

  // Calculate SL/TP
  let stopLoss = body.stopLoss;
  let takeProfit = body.takeProfit;

  if (!stopLoss || !takeProfit) {
    const atr = Number(body.indicators.ATR || 0.005);
    stopLoss = calculateStopLoss(entry, signal, atr, srLevels);
    takeProfit = calculateTakeProfit(entry, signal, stopLoss);
  }

  const rr = calculateRR(entry, stopLoss, takeProfit);

  // Validation warnings
  if (body.validation_result?.decision === "REJECTED") {
    warnings.unshift("Signal rejected by validation agent");
  } else if (body.validation_result?.decision === "CAUTION") {
    warnings.push("Validation agent flagged caution");
  }

  // RR check
  const rrNum = Number(rr.split(":")[1] || "1");
  if (rrNum < 1.5) {
    warnings.push("Poor risk/reward - widen targets");
  }

  const riskSummary = level === "LOW"
    ? `Signal risk ${level.toLowerCase()}. Standard position sizing.`
    : level === "MEDIUM"
    ? `Signal risk ${level.toLowerCase()}. Controlled exposure recommended.`
    : `Signal risk ${level.toLowerCase()}. Reduce size, tighten stops.`;

  const result: RiskResponse = {
    risk_level: level,
    risk_score: score,
    stop_loss: String(stopLoss),
    take_profit: String(takeProfit),
    risk_reward_ratio: rr,
    warnings,
    risk_summary: riskSummary,
  };

  return NextResponse.json(result);
}