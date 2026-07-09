import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    name: "SignalSniper-AI",
    version: "1.0",
    category: "Forex Intelligence Agent",
    provider: "Fireworks AI",
    model: "Gemma",
    optimization: "Hybrid Token Efficient Routing",
    platform: "AMD AI Hackathon",
  });
}
