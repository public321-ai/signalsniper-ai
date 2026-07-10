import { NextResponse } from "next/server";
import { callLocalGemmaGenerate, callLocalGemmaChat, type LocalGemmaRequest } from "@/lib/gemma-local";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));

  // Route: POST /api/gemma-local/generate — prompt-based generation
  // Route: POST /api/gemma-local/chat     — chat completions

  if (body.prompt !== undefined) {
    // Generate endpoint
    if (!body.prompt) {
      return NextResponse.json(
        { error: "Missing required field: prompt" },
        { status: 400 }
      );
    }

    try {
      const params: Record<string, string | number> = {};
      if (body.symbol) params.symbol = body.symbol;
      if (body.signal) params.signal = body.signal;
      if (body.entry) params.entry = body.entry;
      if (body.stop_loss) params.stop_loss = body.stop_loss;
      if (body.take_profit) params.take_profit = body.take_profit;
      if (body.risk) params.risk = body.risk;
      if (body.confidence) params.confidence = body.confidence;

      const result = await callLocalGemmaGenerate(params);
      return NextResponse.json(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      return NextResponse.json(
        { error: "Local Gemma generation failed", details: message },
        { status: 500 }
      );
    }
  }

  if (body.messages !== undefined) {
    // Chat endpoint
    if (!Array.isArray(body.messages)) {
      return NextResponse.json(
        { error: "Missing required field: messages" },
        { status: 400 }
      );
    }

    try {
      const result = await callLocalGemmaChat(body.messages);
      return NextResponse.json(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      return NextResponse.json(
        { error: "Local Gemma chat failed", details: message },
        { status: 500 }
      );
    }
  }

  return NextResponse.json(
    { error: "Provide either 'prompt' or 'messages' field" },
    { status: 400 }
  );
}