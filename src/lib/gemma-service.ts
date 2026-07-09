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

const NVIDIA_MODEL = "google/gemma-2-2b-it";
const NVIDIA_BASE_URL = "https://integrate.api.nvidia.com/v1";

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

async function callNvidia(apiKey: string, prompt: string): Promise<string> {
  const response = await fetch(
    `${NVIDIA_BASE_URL}/chat/completions`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: NVIDIA_MODEL,
        messages: [{ role: "user", content: prompt }],
        max_tokens: 512,
        temperature: 0.7,
      }),
    }
  );

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`NVIDIA API error (${NVIDIA_MODEL}): ${response.status} — ${errText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error(`No response content from NVIDIA model ${NVIDIA_MODEL}`);
  }

  return content;
}

async function callMockGemma(params: GemmaAnalysisRequest): Promise<string> {
  // Simulate network latency
  await new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 400));

  const key = params.symbol.replace("/", "").toUpperCase();
  const mock = MOCK_ANALYSES[key] ?? MOCK_ANALYSES["EURUSD"];
  return mock;
}

export async function analyzeWithGemma(
  params: GemmaAnalysisRequest
): Promise<GemmaAnalysisResponse> {
  const apiKey = process.env.NVIDIA_API_KEY;

  if (apiKey) {
    // NVIDIA API with Gemma model
    const template = loadPromptTemplate();
    const prompt = fillTemplate(template, params);
    try {
      const analysis = await callNvidia(apiKey, prompt);
      return { symbol: params.symbol, analysis, model: NVIDIA_MODEL };
    } catch (err) {
      console.warn("NVIDIA call failed, falling back to mock…", err);
    }
  }

  // Mock mode — no NVIDIA_API_KEY or NVIDIA call failed
  const analysis = await callMockGemma(params);
  return { symbol: params.symbol, analysis, model: "gemma-mock" };
}
