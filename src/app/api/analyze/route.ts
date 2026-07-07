import { NextResponse } from "next/server";
import { fetchAnalysis } from "@/lib/analyze";
import { getCached, setCached } from "@/lib/cache";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const pair = body.pair || "EUR/USD";
  const currentPrice = body.currentPrice;
  const indicators = body.indicators;

  const apiKey = process.env.FIREWORKS_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "FIREWORKS_API_KEY not configured" }, { status: 500 });
  }

  // Return cached result if fresh
  const cached = getCached(pair);
  if (cached) {
    return NextResponse.json(cached);
  }

  try {
    const analysis = await fetchAnalysis(pair, apiKey, currentPrice, indicators);
    setCached(pair, analysis);
    return NextResponse.json(analysis);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: "Analysis failed", details: message }, { status: 500 });
  }
}