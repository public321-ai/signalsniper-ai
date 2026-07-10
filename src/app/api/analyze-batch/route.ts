import { NextResponse } from "next/server";
import { fetchAnalysis } from "@/lib/analyze";
import type { SignalAnalysis } from "@/types/signal";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));

  const pairs: string[] = body.pairs ?? ["EUR/USD", "GBP/USD", "USD/JPY"];
  const currentPrice = body.currentPrice;

  // Validate pairs
  const validPairs = ["EUR/USD", "GBP/USD", "USD/JPY"];
  const invalid = pairs.filter((p) => !validPairs.includes(p));
  if (invalid.length > 0) {
    return NextResponse.json(
      { error: `Invalid pairs: ${invalid.join(", ")}` },
      { status: 400 }
    );
  }

  try {
    // Parallel analysis for all pairs
    const apiKey = process.env.FIREWORKS_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "FIREWORKS_API_KEY not configured" },
        { status: 500 }
      );
    }

    const results = await Promise.all(
      pairs.map((pair) => fetchAnalysis(pair, apiKey, currentPrice))
    );

    const response: Record<string, SignalAnalysis> = {};
    for (let i = 0; i < pairs.length; i++) {
      response[pairs[i]] = results[i];
    }

    return NextResponse.json(response);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: "Batch analysis failed", details: message },
      { status: 500 }
    );
  }
}