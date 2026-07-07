import { NextResponse } from "next/server";
import { fetchAnalysis } from "@/lib/analyze";
import { getCached, setCached, isStale } from "@/lib/cache";

const PAIRS = ["EUR/USD", "GBP/USD", "USD/JPY"];

export async function GET() {
  const apiKey = process.env.FIREWORKS_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "FIREWORKS_API_KEY not configured" }, { status: 500 });
  }

  const results: Record<string, unknown> = {};
  const promises = PAIRS.map(async (pair) => {
    const cached = getCached(pair);
    if (cached) {
      results[pair] = cached;
      return;
    }

    try {
      const analysis = await fetchAnalysis(pair, apiKey);
      setCached(pair, analysis);
      results[pair] = analysis;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      results[pair] = { error: message };
    }
  });

  await Promise.all(promises);
  return NextResponse.json(results);
}