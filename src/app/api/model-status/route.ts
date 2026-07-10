import { NextResponse } from "next/server";

export async function GET() {
  const fireworksKey = !!process.env.FIREWORKS_API_KEY;
  const nvidiaKey = !!process.env.NVIDIA_API_KEY;
  const localGemma = !!process.env.GEMMA_LOCAL_URL;

  const status = {
    fireworks: {
      available: fireworksKey,
      model: "gemma3n-27b",
    },
    nvidia: {
      available: nvidiaKey,
      model: "google/gemma-2-2b-it",
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
      gemma: nvidiaKey ? "nvidia" : localGemma ? "local" : "mock",
    },
  });
}