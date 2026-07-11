import { NextResponse } from "next/server";

export async function GET() {
  const fireworksKey = !!process.env.FIREWORKS_API_KEY;
  const localGemma = !!process.env.GEMMA_LOCAL_URL;

  const status = {
    fireworks: {
      available: fireworksKey,
      model: "gpt-oss-120b",
    },
    local: {
      available: localGemma,
      url: process.env.GEMMA_LOCAL_URL ?? "http://localhost:8000",
    },
  };

  return NextResponse.json({
    status: "ok",
    models: status,
    active: {
      signal: fireworksKey ? "fireworks" : "mock",
      gemma: localGemma ? "local" : "mock",
    },
  });
}