<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/public321-ai/signalsniper-ai/main/public/og-dark.png">
  <img alt="SignalSniper AI — Forex Signals, Explained by AI" src="https://raw.githubusercontent.com/public321-ai/signalsniper-ai/main/public/og-dark.png">
</picture>

<br>

<div align="center">

# SignalSniper AI

**Forex Signals. Analyzed. Explained. Optimized.**

[![Next.js](https://img.shields.io/badge/Next.js_16-black?logo=next.js)](#)
[![React 19](https://img.shields.io/badge/React_19-087ea4?logo=react)](#)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178c6?logo=typescript)](#)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_4-06b6d4?logo=tailwindcss)](#)
[![Fireworks AI](https://img.shields.io/badge/Fireworks_AI-3b82f6)](#)
[![AMD GPU](https://img.shields.io/badge/Local_AMD_GPU-ED64A6)](#)

_High-Performance Forex Intelligence with Fireworks AI, Local AMD GPU Gemma, and Explainable AI_

**Built for the AMD Hackathon 2026**

</div>

---

## 🌟 Overview

**SignalSniper AI** transforms raw forex trading signals into structured, trader-grade analysis with **explainable AI**. Instead of a black-box "BUY" or "SELL," traders receive a complete trade thesis — entry/exit levels, risk assessment, market sentiment, and AI-reasoned justification — all powered by a dual AI pipeline.

### The Problem

| Traditional Signal Services | SignalSniper AI |
|---|---|
| Output: "BUY EUR/USD" | 17-field structured trade thesis |
| No reasoning | AI-explained market sentiment + reasons |
| Generic "medium" risk | Dynamic SL/TP, R:R ratio, support/resistance |
| Price-only input | 14 technical indicators + live rates |
| Black box | Transparent, explainable reasoning |

### The Solution

- **3 major forex pairs**: EUR/USD, GBP/USD, USD/JPY
- **14 technical indicators** per pair: RSI, MACD, Bollinger Bands, SMA, EMA, Stochastic, ATR, ADX, volume
- **Dual AI pipeline**: Fireworks cloud for structured signals + Local AMD GPU Gemma for narrative deep-dives
- **Live exchange rates**: Auto-refreshing every 60 seconds
- **Intelligent caching**: 1-hour TTL, zero wasted API calls
- **Automated fallback**: Model failure → seamless failover, no user-facing errors

---

## 🚀 Quick Start

```bash
npm install
```

Create `.env.local`:

```env
# Fireworks AI (Primary for signal generation)
FIREWORKS_API_KEY=fw_your_key_here

# Local AMD GPU Gemma (Optional, for narrative analysis)
# For FastAPI server:
GEMMA_LOCAL_URL=http://localhost:8000
# For vLLM (recommended):
# GEMMA_LOCAL_URL=http://localhost:8000/v1

# Enable Fireworks fallback if local Gemma unavailable
# FIREWORKS_FALLBACK=enabled
```

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🧠 Dual AI Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     SignalSniper AI Pipeline                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌────────────────────────────────────┐  ┌────────────────────┐  │
│  │      Pipeline 1 — Signal Gen       │  │ Pipeline 2 — Deep  │  │
│  │          Fireworks AI               │  │   Explanation      │  │
│  │          Structured JSON            │  │  Local AMD GPU Gemma │  │
│  │                                    │  │  Gemma Narrative    │  │
│  │  Live Rates → 14 Indicators → AI   │  │  Signal → Prompt→  │  │
│  │  → JSON Extract → Cache (1hr)      │  │  → Analysis Text   │  │
│  └────────────────────────────────────┘  └────────────────────┘  │
│                                                                   │
│  Model: gpt-oss-120b                   │ Mock↔Real: 1 env var   │
│  Zero downtime, automatic failover      │ Zero code changes      │
└─────────────────────────────────────────────────────────────────┘
```

### Pipeline 1 — Fireworks AI (Structured Analysis)

The primary analysis pipeline sends a rich prompt containing all 14 technical indicators + live price to Fireworks AI. The response is parsed with a robust JSON extractor that handles markdown fences and malformed output.

**Model:** `gpt-oss-120b` (Fireworks AI)

### Pipeline 2 — Gemma Narrative Engine (Local AMD GPU)

After a signal is generated, users can click "Gemma AI Analysis" to get a deeper narrative explanation. Uses the `GEMMA_LOCAL_URL` endpoint with local AMD GPU inference. Falls back to Fireworks AI only when `FIREWORKS_FALLBACK=enabled`.

### Model Routing Strategy

SignalSniper AI uses configurable provider routing:

1. **Local AMD GPU Gemma** (Primary) — `GEMMA_LOCAL_URL`
2. **Fireworks AI** (Optional fallback) — `FIREWORKS_FALLBACK=enabled`
3. **Mock Gemma** (Development only)

Set `FIREWORKS_FALLBACK=enabled` to allow Fireworks fallback. Otherwise, service returns "unavailable" message if local model is offline.

---

### Pipeline 3 — Signal Validation Agent (Second Opinion)

Every signal passes through an independent AI validation layer that reviews indicator alignment, confidence accuracy, and risk factors. Returns APPROVED/CAUTION/REJECTED with a 0-100 quality score.

```
┌─────────────────────────────────────────────────────────────────┐
│                   Six-Agent Intelligence Pipeline                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Signal → Gemma → Validation → Risk → Contrarian → Context → Historical │
│  (Fast)  (Detail)  (Logic)  (Safety)  (Skeptic)  (Enviro)  (History) │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/analyze` | Fireworks AI signal analysis for a single pair |
| `GET` | `/api/signals` | Cached analyses for all 3 pairs (parallel) |
| `GET` | `/api/rates` | Live exchange rates (60s cache) |
| `POST` | `/api/gemma-analysis` | Gemma AI narrative deep-dive |
| `POST` | `/api/gemma-local` | Local AMD GPU Gemma (port 8000) |
| `POST` | `/api/validate-signal` | Signal Validation Agent (second opinion) |
| `POST` | `/api/risk-analysis` | Risk Management Agent (trade safety) |
| `POST` | `/api/contrarian-analysis` | Contrarian Agent (skeptical review) |
| `POST` | `/api/market-context` | Market Context Intelligence Agent |
| `POST` | `/api/historical-pattern` | Historical Pattern Intelligence Agent |
| `POST` | `/api/orchestrate` | Multi-Agent Decision Orchestrator |
| `POST` | `/api/sniper-score` | SignalSniper Score™ Engine |
| `POST` | `/api/generate-report` | AI Trade Report Generator |
| `GET` | `/api/model-status` | Check available model providers |
| `POST` | `/api/analyze-batch` | Parallel analysis for multiple pairs |

### Python Agent API Routes (Backend)

| Agent | Port | Endpoint | Description |
|-------|------|----------|-------------|
| Gemma Server | 8000 | `POST /generate` | Text generation |
| | | `POST /chat` | Chat completions |
| | | `GET /health` | Health check |
| Validation Agent | 8001 | `POST /analyze_signal` | Signal validation & scoring |
| | | `GET /health` | Health check |
| Risk Agent | 8002 | `POST /analyze_risk` | Risk analysis & SL/TP calculation |
| | | `GET /health` | Health check |
| Contrarian Agent | 8003 | `POST /analyze_counter_argument` | Skeptical signal review |
| | | `GET /health` | Health check |
| Market Context Agent | 8004 | `POST /analyze_market_context` | Market environment analysis |
| | | `GET /health` | Health check |
| Historical Pattern Agent | 8005 | `POST /analyze_historical_pattern` | Historical pattern matching |
| | | `GET /health` | Health check |
| Orchestrator Agent | 8006 | `POST /orchestrate` | Multi-agent pipeline coordination |
| | | `GET /health` | Health check |
| Score Engine | 8007 | `POST /calculate_sniper_score` | SignalSniper Score™ calculation |
| | | `GET /health` | Health check |
| Report Generator | 8008 | `POST /generate_trade_report` | AI trade report generation |
| | | `GET /health` | Health check |

### POST /api/analyze

```json
// Request
{ "pair": "EUR/USD", "currentPrice": 1.1035 }

// Response — 17-field structured analysis
{
  "pair": "EUR/USD",
  "recommendation": "SELL",
  "confidence": 68,
  "trend": "BEARISH",
  "risk": "MEDIUM",
  "currentPrice": 1.1035,
  "entryPrice": 1.1035,
  "stopLoss": 1.1150,
  "takeProfit": 1.0900,
  "riskRewardRatio": "1:2",
  "supportLevel": 1.1000,
  "resistanceLevel": 1.1150,
  "keyLevels": [
    { "price": 1.1035, "label": "Entry", "type": "pivot" },
    { "price": 1.1150, "label": "Resistance", "type": "resistance" },
    { "price": 1.1000, "label": "Psych Support", "type": "support" },
    { "price": 1.0900, "label": "Target TP", "type": "support" }
  ],
  "marketSentiment": "Price is trading well below moving averages...",
  "reasons": ["Price below SMA20/SMA50...", "RSI at 62.5...", "ADX of 25.4..."],
  "warnings": ["A sudden reversal could occur...", "Elevated volatility..."],
  "timestamp": "2026-07-08T18:56:46.583Z",
  "model": "accounts/fireworks/models/gpt-oss-120b"
}
```

### POST /api/gemma-analysis

```json
// Request
{
  "symbol": "EURUSD",
  "market": "Forex",
  "signal": "SELL",
  "entry": "1.1035",
  "stop_loss": "1.1150",
  "take_profit": "1.0900",
  "risk": "MEDIUM",
  "confidence": 68
}

// Response
{
  "symbol": "EURUSD",
  "analysis": "EUR/USD is trending bearish with strong momentum...",
  "model": "google/gemma-2-2b-it"
}
```

### Testing with curl

```bash
# Fireworks analysis
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"pair":"EUR/USD"}'

# Gemma AI deep-dive
curl -X POST http://localhost:3000/api/gemma-analysis \
  -H "Content-Type: application/json" \
  -d '{"symbol":"EURUSD","signal":"BUY","entry":"1.1035","stop_loss":"1.0950","take_profit":"1.1100","risk":"MEDIUM","confidence":78}'
```

---

## ✨ Key Features

### 📊 Technical Analysis
14 indicators per pair — RSI, MACD, Bollinger Bands, SMA-20/50, EMA-12/26, Stochastic K/D, ATR-14, ADX, volume ratio — all embedded in the AI prompt.

### 🎯 Trader-Grade Output
Entry price, stop loss, take profit, risk:reward ratio, support/resistance levels, key pivot points, market sentiment, numbered reasons, and risk warnings.

### 🔄 Smart Caching
1-hour in-memory TTL across all 3 pairs. Dashboard loads in under 200ms on cache hit. No redundant API calls.

### 🛡️ Graceful Degradation
Model fallback chain (primary → secondary → error). If local Gemma is unavailable, Gemma analysis falls back to realistic mock responses. Zero user-facing errors.

### ⚡ Parallel Execution
All 3 forex pairs analyzed simultaneously via `Promise.all`. Combined with caching, the dashboard loads instantly.

### 🎨 Immersive UI
Custom Canvas animation engine with 80-particle network, animated candlestick chart, sine waves, and a responsive glass-morphism design.

---

## 🖥️ Main Code Paths

### Frontend (TypeScript)
```
src/
├── app/api/          — API routes (TypeScript)
├── components/       — React components
├── lib/             — Core libraries (analyze.ts, gemma-service.ts)
├── types/           — TypeScript interfaces
└── prompts/         — AI prompt templates
```

### Python Agent Servers
```
server/
├── gemma_server.py            — Port 8000: Local AMD GPU Gemma inference
├── validation_agent.py          — Port 8001: Signal validation
├── risk_agent.py                — Port 8002: Risk analysis
├── contrarian_agent.py          — Port 8003: Skeptical review
├── market_context_agent.py      — Port 8004: Market context
├── historical_pattern_agent.py  — Port 8005: Historical patterns
├── orchestrator_agent.py        — Port 8006: Multi-agent coordination
├── score_engine.py              — Port 8007: SignalSniper Score™
└── report_generator.py          — Port 8008: Trade report generation
```

---

## 🚀 Complete Setup

### 1. Frontend (Node.js)
```bash
npm install
```

Create `.env.local`:
```env
# Fireworks AI (Primary for signal generation)
FIREWORKS_API_KEY=fw_your_key_here

# Local AMD GPU Gemma via vLLM (running on port 8000)
GEMMA_LOCAL_URL=http://localhost:8000/v1

# Enable Fireworks fallback if local Gemma unavailable
# FIREWORKS_FALLBACK=enabled
```

```bash
npm run dev
# Open http://localhost:3000
```

### 2. Python Agent Servers (AMD GPU)

**For vLLM (running google/gemma-3-12b-it on port 8000):**
- No additional setup needed — the vLLM server is already running
- vLLM provides OpenAI-compatible endpoints at `http://localhost:8000/v1/`

**For other agents (ports 8001-8008):**
```bash
pip install fastapi uvicorn torch transformers accelerate

# Run individual agents
uvicorn validation_agent:app --port 8001
uvicorn risk_agent:app --port 8002
uvicorn contrarian_agent:app --port 8003
uvicorn market_context_agent:app --port 8004
uvicorn historical_pattern_agent:app --port 8005
uvicorn orchestrator_agent:app --port 8006
uvicorn score_engine:app --port 8007
uvicorn report_generator:app --port 8008
```

---

## 🖥️ AMD Resource Usage

### AMD GPU Requirements
- **ROCm-compatible GPU** (Radeon VII, RX 6000/7000 series, or Instinct MI series)
- **VRAM**: 8GB+ minimum for Gemma-3-12B, 4GB+ for Gemma-3n-E2B
- **ROCm drivers** 5.7+ recommended

### Local Inference Options

**Option A: FastAPI server (server/gemma_server.py)**
```bash
uvicorn gemma_server:app --host 0.0.0.0 --port 8000
```
Uses Hugging Face Transformers with PyTorch. Environment variable:
```python
model_name = os.getenv("GEMMA_MODEL", "google/gemma-3n-e2b-it")
```

**Option B: vLLM (recommended for production)**
```bash
vllm serve google/gemma-3-12b-it --host 0.0.0.0 --port 8000 --dtype auto --gpu-memory-utilization 0.90
```

vLLM provides OpenAI-compatible API at:
- `POST http://localhost:8000/v1/chat/completions`
- `GET http://localhost:8000/v1/models`

Set `GEMMA_LOCAL_URL=http://localhost:8000/v1` in `.env.local` for vLLM.

---

## 🔌 External Services

| Service | Purpose | Required |
|---------|---------|----------|
| **Fireworks AI** | Primary signal generation (`gpt-oss-120b`) | Yes (for real signals) |
| **ExchangeRate API** | Live forex rates | No (free tier, no key) |
| **AMD GPU (ROCm)** | Local Gemma inference | No (falls back to mock) |

### Fireworks AI
- Get API key at [fireworks.ai](https://fireworks.ai)
- Model used: `accounts/fireworks/models/gpt-oss-120b`
- Endpoints: `/chat/completions`

### ExchangeRate API
- Free public endpoint: `https://api.exchangerate-api.com/v4/latest/USD`
- No API key required
- Cached for 60 seconds

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | Next.js 16 (App Router), React 19 |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS 4 |
| **Cloud AI** | Fireworks AI (gpt-oss-120b) |
| **GPU AI** | Local AMD GPU (google/gemma-2-2b-it) |
| **Data** | ExchangeRate API (free, no key) |
| **Caching** | In-memory 1-hour TTL |
| **Animations** | Canvas API (particles, candlesticks) |

---

## 🔮 Roadmap

| Phase | Features |
|-------|----------|
| **Phase 1 ✓** | 3 major forex pairs, dual AI pipeline, live rates, structured trade cards, explainable AI |
| **Phase 2 ✓** | Signal Validation Agent, local AMD GPU Gemma, batch analysis endpoint |
| **Phase 3** | 20+ forex pairs, crypto support, multi-timeframe analysis, backtesting engine, user-defined risk profiles |
| **Phase 4** | WebSocket price feeds, push notifications, portfolio tracking, multi-GPU inference cluster |

---

## 📄 License

Educational project. Not financial advice. AI-generated content is for informational purposes only.

---

<div align="center">
  <br>
  <strong>Trade smarter through understanding.</strong>
  <br><br>
  <code>github.com/public321-ai/signalsniper-ai</code>
  <br><br>
  <sub>Built for the AMD Hackathon 2026</sub>
</div>