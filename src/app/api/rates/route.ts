import { NextResponse } from "next/server";

interface ExchangeRates {
  base: string;
  rates: Record<string, number>;
  timestamp: string;
}

const PAIR_CONFIG: Record<string, { base: string; quote: string; invert: boolean }> = {
  "EUR/USD": { base: "EUR", quote: "USD", invert: false },
  "GBP/USD": { base: "GBP", quote: "USD", invert: false },
  "USD/JPY": { base: "USD", quote: "JPY", invert: false },
};

export async function GET() {
  try {
    const res = await fetch("https://api.exchangerate-api.com/v4/latest/USD");
    if (!res.ok) throw new Error(`Exchange rate API error: ${res.status}`);
    const data: ExchangeRates = await res.json();

    const rates: Record<string, number> = {};
    // EUR/USD = 1 / EUR_rate (since API returns 1 USD = X EUR)
    rates["EUR/USD"] = 1 / data.rates.EUR;
    rates["GBP/USD"] = 1 / data.rates.GBP;
    // USD/JPY = JPY_rate (since API returns 1 USD = X JPY)
    rates["USD/JPY"] = data.rates.JPY;

    return NextResponse.json({
      rates,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: "Failed to fetch rates", details: message }, { status: 500 });
  }
}