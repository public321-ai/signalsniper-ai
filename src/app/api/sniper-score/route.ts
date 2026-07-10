import { NextResponse } from "next/server";

export interface SniperScoreInput {
  symbol: string;
  validation_score?: number;
  risk_score?: number;
  contrarian_score?: number;
  market_context_score?: number;
  historical_score?: number;
  confidence?: number;
  signal?: string;
  final_signal?: string;
}

export interface SniperScoreResponse {
  symbol: string;
  signal: string;
  sniper_score: number;
  rating: string;
  grade: string;
  confidence: number;
  score_breakdown: {
    [key: string]: { score: number; weight: string };
  };
  strengths: string[];
  weaknesses: string[];
  summary: string;
}

function calculateSniperScore(scores: number[], weights: number[]): number {
  const total = scores.reduce((sum, s, i) => sum + s * weights[i], 0);
  return Math.round(total);
}

function classifyScore(score: number): string {
  if (score >= 90) return "EXCEPTIONAL SETUP";
  if (score >= 75) return "STRONG SETUP";
  if (score >= 60) return "MODERATE SETUP";
  if (score >= 40) return "WEAK SETUP";
  return "HIGH RISK / AVOID";
}

function scoreToGrade(score: number): string {
  if (score >= 97) return "A+";
  if (score >= 93) return "A";
  if (score >= 87) return "B";
  if (score >= 75) return "C";
  if (score >= 60) return "D";
  return "D";
}

function identifyStrengths(scores: { v: number; r: number; c: number; m: number; h: number }): string[] {
  const s: string[] = [];
  if (scores.v >= 80) s.push("Strong technical confirmation");
  if (scores.r >= 80) s.push("Favorable risk profile");
  if (scores.c >= 75) s.push("Low contradiction risk");
  if (scores.m >= 80) s.push("Supportive market environment");
  if (scores.h >= 75) s.push("Positive historical pattern");
  return s.length ? s : ["Basic signal structure"];
}

function identifyWeaknesses(scores: { v: number; r: number; c: number; m: number; h: number }): string[] {
  const w: string[] = [];
  if (scores.v < 60) w.push("Weak technical confirmation");
  if (scores.r < 50) w.push("High risk exposure");
  if (scores.c < 50) w.push("Contrarian concerns identified");
  if (scores.m < 60) w.push("Unfavorable market conditions");
  if (scores.h < 50) w.push("No historical precedent");
  return w;
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as SniperScoreInput;

  // Extract scores with defaults
  const v = body.validation_score ?? 50;
  const r = body.risk_score ?? 50;
  const c = body.contrarian_score ?? 50;
  const m = body.market_context_score ?? 50;
  const h = body.historical_score ?? 50;
  const confidence = body.confidence ?? 50;
  const signal = body.final_signal ?? body.signal ?? "HOLD";

  // Calculate score
  const scores = [v, r, m, h, c];
  const weights = [0.30, 0.25, 0.20, 0.15, 0.10];
  const sniperScore = calculateSniperScore(scores, weights);

  // Classify
  const rating = classifyScore(sniperScore);
  const grade = scoreToGrade(sniperScore);

  // Calibrate confidence
  let adjusted = confidence;
  if (confidence > sniperScore + 10) adjusted -= 8;
  else if (confidence < sniperScore - 10) adjusted += 5;
  adjusted = Math.max(10, Math.min(95, adjusted));

  // Strengths/weaknesses
  const scoresObj = { v, r, c, m, h };
  const strengths = identifyStrengths(scoresObj);
  const weaknesses = identifyWeaknesses(scoresObj);

  const result: SniperScoreResponse = {
    symbol: body.symbol,
    signal,
    sniper_score: sniperScore,
    rating,
    grade,
    confidence: adjusted,
    score_breakdown: {
      technical_validation: { score: v, weight: "30%" },
      risk_quality: { score: r, weight: "25%" },
      market_context: { score: m, weight: "20%" },
      historical_pattern: { score: h, weight: "15%" },
      contrarian_analysis: { score: c, weight: "10%" }
    },
    strengths,
    weaknesses,
    summary: `The setup has ${rating.toLowerCase()} with multiple agents supporting the analysis.`
  };

  return NextResponse.json(result);
}