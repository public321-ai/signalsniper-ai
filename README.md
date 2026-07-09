# SignalSniper AI

Forex signal analysis dashboard powered by Fireworks AI + NVIDIA (Gemma 2).

## Setup

```bash
npm install
```

Create `.env.local`:

```
FIREWORKS_API_KEY=your_key_here
NVIDIA_API_KEY=your_nvidia_key  # Leave empty for mock Gemma mode
```

When `NVIDIA_API_KEY` is empty, the Gemma analysis endpoint returns realistic mock responses.
To use the real Gemma model via NVIDIA API, set your API key:

```
NVIDIA_API_KEY=nvapi-...
```

The model used is `google/gemma-2-2b-it` via NVIDIA's integrate API. If NVIDIA fails, the service automatically falls back to mock responses.

## Run

```bash
npm run dev
```

Open http://localhost:3000

## API Endpoints

### POST /api/analyze

Generate a Fireworks AI signal analysis for a forex pair.

**Request:**

```json
{ "pair": "EUR/USD", "currentPrice": 1.1035 }
```

**Response:** Full `SignalAnalysis` object with recommendation, confidence, entry/SL/TP, key levels, etc.

### POST /api/gemma-analysis

Generate a detailed Gemma AI explanation for an existing signal.

**Request:**

```json
{
  "symbol": "EURUSD",
  "market": "Forex",
  "signal": "BUY",
  "entry": "1.1035",
  "stop_loss": "1.0950",
  "take_profit": "1.1100",
  "risk": "MEDIUM",
  "confidence": 78
}
```

**Response:**

```json
{
  "symbol": "EURUSD",
  "analysis": "EUR/USD is showing bullish momentum...",
  "model": "google/gemma-2-2b-it"  // or "gemma-mock" when NVIDIA_API_KEY is unset
}
```

### GET /api/signals

Fetch cached analyses for all 3 pairs (EUR/USD, GBP/USD, USD/JPY).

### GET /api/rates

Fetch live exchange rates.

## Testing with curl

**Fireworks analysis:**

```bash
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"pair":"EUR/USD"}'
```

**Gemma AI analysis (mock mode):**

```bash
curl -X POST http://localhost:3000/api/gemma-analysis \
  -H "Content-Type: application/json" \
  -d '{"symbol":"EURUSD","signal":"BUY","entry":"1.1035","stop_loss":"1.0950","take_profit":"1.1100","risk":"MEDIUM","confidence":78}'
```

**Gemma AI analysis (GBP/USD):**

```bash
curl -X POST http://localhost:3000/api/gemma-analysis \
  -H "Content-Type: application/json" \
  -d '{"symbol":"GBPUSD","signal":"SELL","entry":"1.2750","stop_loss":"1.2800","take_profit":"1.2650","risk":"MEDIUM","confidence":72}'
```

**Gemma AI analysis (USD/JPY):**

```bash
curl -X POST http://localhost:3000/api/gemma-analysis \
  -H "Content-Type: application/json" \
  -d '{"symbol":"USDJPY","signal":"SELL","entry":"155.50","stop_loss":"157.00","take_profit":"154.00","risk":"HIGH","confidence":65}'
```

## Architecture

```
src/
  app/
    api/
      analyze/route.ts          — Fireworks AI signal analysis
      gemma-analysis/route.ts   — Gemma AI detailed explanation
      rates/route.ts            — Live forex rates
      signals/route.ts          — Cached signals for all pairs
  components/
    Dashboard.tsx               — Main dashboard with signal cards
    GemmaAnalysisButton.tsx     — Button + expandable analysis section
  lib/
    analyze.ts                  — Fireworks AI integration (model fallback)
    cache.ts                    — In-memory TTL cache
    gemma-service.ts            — NVIDIA Gemma service (mock fallback)
  prompts/
    forex_analysis_prompt.txt   — Gemma prompt template
  types/
    signal.ts                   — TypeScript interfaces
```

## Switching from Mock to Real Gemma

1. Set `NVIDIA_API_KEY` in `.env.local` to your NVIDIA API key
2. The `callNvidia` function in `src/lib/gemma-service.ts` uses `google/gemma-2-2b-it` via NVIDIA's integrate API
3. If NVIDIA fails (no key, rate limit, model error), the service automatically falls back to mock responses
4. No other files need changes — the API route and frontend are agnostic
