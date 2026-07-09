import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "healthy",
    application: "SignalSniper-AI",
    deployment: "docker",
    timestamp: new Date().toISOString(),
  });
}
