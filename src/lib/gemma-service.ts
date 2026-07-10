import { readFileSync } from "fs";
import { join } from "path";

export interface GemmaAnalysisRequest {
  symbol: string;
  market?: string;
  signal: string;
  entry: string;
  stop_loss: string;
  take_profit: string;
  risk: string;
  confidence: number;
}

export interface GemmaAnalysisResponse {
  symbol: string;
  analysis: string;
  model: string;
}

const LOCAL_API_URL = process.env.GEMMA_LOCAL_URL ?? "http://localhost:8000";
const FIREWORKS_API_KEY = process.env.FIREWORKS_API_KEY;
const FIREWORKS_FALLBACK = process.env.FIREWORKS_FALLBACK === "enabled";

function loadPromptTemplate(): string {
  const filePath = join(process.cwd(), "src/prompts/forex_analysis_prompt.txt");
  return readFileSync(filePath, "utf-8");
}

function fillTemplate(template: string, params: GemmaAnalysisRequest): string {
  return template
    .replace("{symbol}", params.symbol)
    .replace("{signal}", params.signal)
    .replace("{entry}", params.entry)
    .replace("{stop_loss}", params.stop_loss)
    .replace("{take_profit}", params.take_profit)
    .replace("{risk}", params.risk)
    .replace("{confidence}", String(params.confidence));
}

const MOCK_ANALYSES: Record<string, string> = {
  EURUSD:
    "EUR/USD bullish momentum is supported by a confluence of factors: the pair's sustained move above the 1.1035 entry level aligns with a rising 20-day EMA and positive MACD crossover, suggesting near-term demand dominance. The 78% confidence reading reflects alignment across RSI (recovery from oversold territory), stochastic reversal, and a favorable risk-reward setup targeting 1.1100 against a stop at 1.0950—yielding an approximate 1:1.6 R:R ratio. Key risk factors include the upcoming ECB rate decision, which could invalidate the bullish thesis if a more hawkish stance drives euro strength beyond projected resistance at 1.1100, and deteriorating US labor data that may weaken dollar support. Invalidation would likely occur if price breaks below the 1.0950 support zone, indicating a shift in sentiment and trend structure. This signal should be viewed as a directional bias rather than a trade recommendation—position sizing and personal risk tolerance must guide execution.",

  GBPUSD:
    "GBP/USD's bullish setup at 1.2750 entry rests on improved UK economic sentiment and a weakening dollar index, with the pair holding above its 50-day SMA and showing positive RSI momentum. The 72% confidence reflects moderate consensus among oscillators and trend indicators, though the broader risk environment remains elevated given ongoing Brexit-related trade uncertainty and BOE policy divergence from the Fed. The 1.2800 take profit target sits near documented resistance, while the 1.2650 stop loss protects against a rejection at support. The MEDIUM risk rating is appropriate—geopolitical headlines can trigger rapid sentiment shifts that invalidate the technical picture. A break below 1.2650 or a surprise hawkish Fed shift would undermine this thesis. Traders should monitor UK CPI releases and US retail sales data as potential catalysts for invalidation.",

  USDJPY:
    "USD/JPY's bearish signal at 155.50 entry reflects overbought conditions detected across RSI, stochastic, and Bollinger Band metrics, with the yen showing signs of recovery as BoJ policy normalization expectations grow. The 65% confidence score acknowledges the pair's historically strong uptrend and the risk that intervention threats or sustained carry-trade demand could delay the anticipated reversal. The 154.00 take profit aligns with near-term support, while the 157.00 stop loss sits just above recent resistance. HIGH risk designation is warranted given the pair's sensitivity to sudden BoJ policy shifts and potential government intervention—these represent the primary invalidation risks. A decisive break above 157.00 or an unexpectedly dovish BoJ statement would overturn the bearish thesis. Position sizing should account for the elevated volatility inherent in this politically sensitive cross.",
};

// Routing priority:
// 1. Local AMD GPU Gemma (Primary)
// 2. Fireworks AI (Optional, must be explicitly enabled)
// 3. Mock Gemma (Development only)

async function callLocalGemma(apiUrl: string, prompt: string): Promise<string> {
  const response = await fetch(`${apiUrl}/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, max_tokens: 512, temperature: 0.7 }),
  });

  if (!response.ok) {
    throw new Error(`Local Gemma error: ${response.status}`);
  }

  const data = await response.json();
  const text = data.text || data.response;

  if (!text) {
    throw new Error("No response from local Gemma");
  }

  return text;
}

async function callFireworks(apiKey: string, prompt: string): Promise<string> {
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
        max_tokens: 512,
        temperature: 0.7,
      }),
    }
  );

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Fireworks API error: ${response.status} — ${errText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}

async function callMockGemma(params: GemmaAnalysisRequest): Promise<string> {
  await new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 400));
  const key = params.symbol.replace("/", "").toUpperCase();
  return MOCK_ANALYSES[key] ?? MOCK_ANALYSES["EURUSD"];
}

export async function analyzeWithGemma(
  params: GemmaAnalysisRequest
): Promise<GemmaAnalysisResponse> {
  const template = loadPromptTemplate();
  const prompt = fillTemplate(template, params);

  // 1. Try Local AMD GPU Gemma (Primary)
  const localUrl = process.env.GEMMA_LOCAL_URL;
  if (localUrl) {
    try {
      const analysis = await callLocalGemma(localUrl, prompt);
      return { symbol: params.symbol, analysis, model: "gemma-local" };
    } catch (err) {
      console.warn("Local Gemma unavailable:", err);
    }
  }

  // 2. Try Fireworks AI (Optional fallback - must be explicitly enabled)
  if (FIREWORKS_FALLBACK && FIREWORKS_API_KEY) {
    try {
      const analysis = await callFireworks(FIREWORKS_API_KEY, prompt);
      if (analysis) {
        return { symbol: params.symbol, analysis, model: "fireworks-gpt-oss" };
      }
    } catch (err) {
      console.warn("Fireworks fallback failed:", err);
    }
  }

  // 3. Check if fallback is disabled and no local model
  if (!FIREWORKS_FALLBACK) {
    return {
      symbol: params.symbol,
      analysis: "Service unavailable: Local Gemma not configured. Set GEMMA_LOCAL_URL or enable FIREWORKS_FALLBACK=enabled.",
      model: "service-unavailable"
    };
  }

  // 4. Mock Gemma (Development/demonstration)
  const analysis = await callMockGemma(params);
  return { symbol: params.symbol, analysis, model: "gemma-mock" };
}