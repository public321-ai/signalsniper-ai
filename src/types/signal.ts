export interface KeyLevel {
  price: number;
  label: string;
  type: "support" | "resistance" | "pivot";
}

export interface SignalAnalysis {
  pair: string;
  recommendation: "BUY" | "SELL" | "HOLD";
  confidence: number;
  trend: "BULLISH" | "BEARISH" | "NEUTRAL";
  risk: "LOW" | "MEDIUM" | "HIGH";
  currentPrice: number;
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
  riskRewardRatio: string;
  supportLevel: number;
  resistanceLevel: number;
  keyLevels: KeyLevel[];
  marketSentiment: string;
  reasons: string[];
  warnings: string[];
  timestamp: string;
}