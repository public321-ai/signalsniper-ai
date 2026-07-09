# SignalSniper AI

Forex signal analysis dashboard powered by Fireworks AI + Gemma AI.

## Setup

```bash
npm install
```

Create `.env.local`:

```
FIREWORKS_API_KEY=your_key_here
GEMMA_API_URL=                          # Leave empty for mock mode
```

When `GEMMA_API_URL` is empty, the Gemma analysis endpoint returns realistic mock responses.
To connect to a real vLLM/Gemma GPU server, set it to:

```
GEMMA_API_URL=http://GPU_SERVER_IP:8000/v1/chat/completions
```

Only `src/lib/gemma-service.ts` needs to change when switching from mock to real — the API route and frontend remain identical.

## Run

```bash
npm run dev
```

Open http://localhost:3000

## GitHub Codespaces

Click to launch a fully configured development environment:

[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/public321-ai/signalsniper-ai?branch=docker-hackathon)

The devcontainer includes:

- **Node.js 20** + TypeScript (matching the production Docker image)
- **Docker-in-Docker** — build and test containers inside the Codespace
- **GitHub CLI** — interact with GHCR, PRs, and releases
- **VS Code extensions** — ESLint, Tailwind, Prettier, Docker
- **Auto-setup** — `npm ci` on create, `npm run dev` on start
- **Port 3000** — auto-forwarded on launch

## Docker Image

Pre-built image available on GitHub Container Registry:

```
ghcr.io/public321-ai/signalsniper-ai:latest
```

### Quick Start with Docker

```bash
# Pull and run
docker run -p 3000:3000 -e FIREWORKS_API_KEY=<YOUR_API_KEY> ghcr.io/public321-ai/signalsniper-ai:latest

# Or with Docker Compose
cp .env.example .env
# Add your FIREWORKS_API_KEY to .env
docker compose up --build -d
```

Open http://localhost:3000

### Health Check

```bash
curl http://localhost:3000/api/health
```

### AMD AI Hackathon

SignalSniper-AI is an autonomous Forex intelligence agent powered by Fireworks AI and Gemma models. It provides explainable trading insights using AI reasoning, token-efficient model routing, and containerized deployment optimized for AMD AI infrastructure.

| Field | Value |
|---|---|
| **Docker Image** | `ghcr.io/public321-ai/signalsniper-ai:latest` |
| **Repository** | https://github.com/public321-ai/signalsniper-ai |
| **Branch** | `docker-hackathon` |
| **AI Provider** | Fireworks AI |
| **Models** | Gemma 3n 27B, GPT-OSS 120B |
| **Optimization** | Hybrid Token Efficient Routing |

See [README-Docker.md](./README-Docker.md) for full Docker documentation.

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
  "model": "gemma-mock"    // or "gemma-real" when GEMMA_API_URL is set
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
    gemma-service.ts            — Gemma AI service (mock or real vLLM)
  prompts/
    forex_analysis_prompt.txt   — Gemma prompt template
  types/
    signal.ts                   — TypeScript interfaces
```

## Switching from Mock to Real Gemma

1. Set `GEMMA_API_URL` in `.env.local` to your vLLM server endpoint
2. Verify `src/lib/gemma-service.ts` — the `callRealGemma` function handles the API call
3. No other files need changes — the API route and frontend are agnostic
