import { NextResponse } from "next/server";
import { analyzeWithGemma, type GemmaAnalysisRequest } from "@/lib/gemma-service";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));

  const requiredFields = ["symbol", "signal", "entry", "stop_loss", "take_profit", "risk", "confidence"];
  for (const field of requiredFields) {
    if (!body[field]) {
      return NextResponse.json(
        { error: `Missing required field: ${field}` },
        { status: 400 }
      );
    }
  }

  const params: GemmaAnalysisRequest = {
    symbol: body.symbol,
    market: body.market ?? "Forex",
    signal: body.signal,
    entry: body.entry,
    stop_loss: body.stop_loss,
    take_profit: body.take_profit,
    risk: body.risk,
    confidence: Number(body.confidence),
  };

  try {
    const result = await analyzeWithGemma(params);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: "Gemma analysis failed", details: message },
      { status: 500 }
    );
  }
}
