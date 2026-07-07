import type { SignalAnalysis } from "@/types/signal";

const PAIR_INDICATORS: Record<string, Record<string, number>> = {
  "EUR/USD": {
    rsi_14: 62.5, macd_signal: 0.0015, macd_histogram: 0.0008,
    sma_20: 1.1402, sma_50: 1.1385, ema_12: 1.1415, ema_26: 1.1398,
    bollinger_upper: 1.149, bollinger_lower: 1.1354, bollinger_mid: 1.1402,
    stoch_k: 78.3, stoch_d: 72.1, atr_14: 0.0058, adx: 25.4,
    volume_ratio: 1.12,
  },
  "GBP/USD": {
    rsi_14: 58.2, macd_signal: 0.0023, macd_histogram: 0.0011,
    sma_20: 1.334, sma_50: 1.330, ema_12: 1.336, ema_26: 1.332,
    bollinger_upper: 1.342, bollinger_lower: 1.324, bollinger_mid: 1.333,
    stoch_k: 65.4, stoch_d: 60.8, atr_14: 0.0072, adx: 22.1,
    volume_ratio: 0.95,
  },
  "USD/JPY": {
    rsi_14: 44.8, macd_signal: -0.32, macd_histogram: -0.18,
    sma_20: 160.8, sma_50: 159.5, ema_12: 161.2, ema_26: 160.1,
    bollinger_upper: 163.5, bollinger_lower: 158.2, bollinger_mid: 160.8,
    stoch_k: 38.6, stoch_d: 42.3, atr_14: 0.85, adx: 28.7,
    volume_ratio: 1.05,
  },
};

export function buildPrompt(pair: string, currentPrice?: number, indicators?: Record<string, number | string>): string {
  const ind = indicators || PAIR_INDICATORS[pair] || PAIR_INDICATORS["EUR/USD"];
  const priceInfo = currentPrice
    ? `Current live price: ${currentPrice}`
    : `Current price: ${(ind as Record<string, number>).current_price || "N/A"}`;

  return `Analyze ${pair} forex pair and provide a detailed trading signal as JSON.

${priceInfo}
Technical indicators: ${Object.entries(ind).map(([k, v]) => `${k}=${v}`).join(", ")}

Return a JSON object with these EXACT fields:
- recommendation: "BUY" | "SELL" | "HOLD"
- confidence: number 0-100
- trend: "BULLISH" | "BEARISH" | "NEUTRAL"
- risk: "LOW" | "MEDIUM" | "HIGH"
- currentPrice: the live price provided
- entryPrice: optimal entry price based on analysis
- stopLoss: recommended stop loss level
- takeProfit: recommended take profit level
- riskRewardRatio: string like "1:2.5"
- supportLevel: nearest support price
- resistanceLevel: nearest resistance price
- keyLevels: array of {price:number, label:string, type:"support"|"resistance"|"pivot"} (3-5 levels)
- marketSentiment: one-sentence market sentiment summary
- reasons: array of 3 concise trading reasons
- warnings: array of 1-2 risk warnings`;
}

export function extractJson(content: string): string | null {
  let cleaned = content.replace(/^```json?\s*\n?/i, "").replace(/\n?```$/i, "").trim();

  if (cleaned.startsWith("{") && cleaned.endsWith("}")) {
    return cleaned;
  }

  let depth = 0;
  let start = -1;
  for (let i = 0; i < cleaned.length; i++) {
    if (cleaned[i] === "{") {
      if (depth === 0) start = i;
      depth++;
    } else if (cleaned[i] === "}") {
      depth--;
      if (depth === 0 && start !== -1) {
        return cleaned.slice(start, i + 1);
      }
    }
  }
  return null;
}

export async function fetchAnalysis(
  pair: string,
  apiKey: string,
  currentPrice?: number,
  indicators?: Record<string, number | string>
): Promise<SignalAnalysis> {
  const prompt = buildPrompt(pair, currentPrice, indicators);

  const response = await fetch(
    "https://api.fireworks.ai/inference/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "accounts/fireworks/models/gpt-oss-120b",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 16384,
        top_k: 40,
        presence_penalty: 0,
        frequency_penalty: 0,
      }),
    }
  );

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Fireworks API error: ${response.status} — ${errText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("No response content from Fireworks AI");
  }

  const jsonStr = extractJson(content);
  if (!jsonStr) {
    throw new Error("Could not extract JSON from AI response");
  }

  let analysis: Record<string, unknown>;
  try {
    analysis = JSON.parse(jsonStr) as Record<string, unknown>;
  } catch {
    throw new Error("AI returned invalid JSON");
  }

  return {
    pair,
    ...(analysis as Omit<SignalAnalysis, "pair" | "timestamp">),
    timestamp: new Date().toISOString(),
  };
}