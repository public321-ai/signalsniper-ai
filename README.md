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
[![NVIDIA](https://img.shields.io/badge/NVIDIA_AI-76b900)](#)
[![AMD ROCm](https://img.shields.io/badge/AMD_ROCrn-ED64A6)](#)

_High-Performance Forex Intelligence with Fireworks AI, NVIDIA GPUs, and Explainable AI_

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
- **Dual AI pipeline**: Fireworks cloud for structured signals + NVIDIA GPU for narrative deep-dives
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
FIREWORKS_API_KEY=fw_your_key_here
NVIDIA_API_KEY=                          # Leave empty for mock Gemma mode
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
│  │          Structured JSON            │  │  NVIDIA GPU + vLLM │  │
│  │                                    │  │  Gemma Narrative    │  │
│  │  Live Rates → 14 Indicators → AI   │  │  Signal → Prompt→  │  │
│  │  → JSON Extract → Cache (1hr)      │  │  → Analysis Text   │  │
│  └────────────────────────────────────┘  └────────────────────┘  │
│                                                                   │
│  Fallback: gemma3n-27b → gpt-oss-120b  │ Mock↔Real: 1 env var   │
│  Zero downtime, automatic failover      │ Zero code changes      │
└─────────────────────────────────────────────────────────────────┘
```

### Pipeline 1 — Fireworks AI (Structured Analysis)

The primary analysis pipeline sends a rich prompt containing all 14 technical indicators + live price to Fireworks AI. The response is parsed with a robust JSON extractor that handles markdown fences and malformed output.

**Model fallback chain:**
1. `gemma3n-27b` (primary)
2. `gpt-oss-120b` (automatic failover)

### Pipeline 2 — NVIDIA GPU (Narrative Explanation)

After a signal is generated, users can click "Gemma AI Analysis" to get a deeper narrative explanation. This runs the `google/gemma-2-2b-it` model via NVIDIA's cloud API, with automatic mock fallback when no API key is configured.

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
| `GET` | `/api/model-status` | Check available model providers |
| `POST` | `/api/analyze-batch` | Parallel analysis for multiple pairs |

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

## 🏗️ Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── analyze/route.ts                — Fireworks AI signal analysis
│   │   ├── gemma-analysis/route.ts       — Gemma AI narrative explanation
│   │   ├── gemma-local/route.ts          — Local AMD GPU Gemma proxy
│   │   ├── validate-signal/route.ts      — Signal Validation Agent
│   │   ├── risk-analysis/route.ts        — Risk Management Agent
│   │   ├── contrarian-analysis/route.ts  — Contrarian Analysis Agent
│   │   ├── historical-pattern/route.ts   — Historical Pattern Intelligence Agent
│   │   ├── market-context/route.ts       — Market Context Intelligence Agent
│   │   ├── orchestrate/route.ts          — Multi-Agent Orchestrator |
│   │   ├── rates/route.ts                — Live forex rates (60s refresh)
│   │   ├── signals/route.ts              — Parallel cached signals
│   │   └── model-status/route.ts         — Model provider status
│   ├── layout.tsx                        — Root layout + fonts
│   ├── page.tsx                          — Dashboard entry point
│   └── globals.css                       — Tailwind + theme tokens
├── components/
│   ├── Dashboard.tsx                     — Main dashboard (300+ lines)
│   ├── GemmaAnalysisButton.tsx         — AI deep-dive toggle
│   └── CanvasBackground.tsx            — Animated particle system
├── lib/
│   ├── analyze.ts                      — Fireworks AI integration
│   ├── cache.ts                        — In-memory 1hr TTL cache
│   ├── gemma-service.ts               — NVIDIA Gemma (mock/real)
│   └── gemma-local.ts                 — Local AMD GPU Gemma client
├── prompts/
│   └── forex_analysis_prompt.txt       — Gemma prompt template
├── server/
│   ├── gemma_server.py                — Local AMD GPU Gemma (8000)
│   ├── validation_agent.py            — Signal Validation Agent (8001)
│   ├── risk_agent.py                  — Risk Management Agent (8002)
│   ├── contrarian_agent.py            — Contrarian Analysis Agent (8003)
│   ├── market_context_agent.py        — Market Context Agent (8004)
│   ├── historical_pattern_agent.py    — Historical Pattern Agent (8005)
│   └── README.md                      — Server setup docs
└── types/
    └── signal.ts                       — TypeScript interfaces
```

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | Next.js 16 (App Router), React 19 |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS 4 |
| **Cloud AI** | Fireworks AI (gpt-oss-120b, gemma3n-27b) |
| **GPU AI** | NVIDIA AI (google/gemma-2-2b-it) |
| **Data** | ExchangeRate API (free, no key) |
| **Caching** | In-memory 1-hour TTL |
| **Animations** | Canvas API (particles, candlesticks) |

---

## ✨ Key Features

### 📊 Technical Analysis
14 indicators per pair — RSI, MACD, Bollinger Bands, SMA-20/50, EMA-12/26, Stochastic K/D, ATR-14, ADX, volume ratio — all embedded in the AI prompt.

### 🎯 Trader-Grade Output
Entry price, stop loss, take profit, risk:reward ratio, support/resistance levels, key pivot points, market sentiment, numbered reasons, and risk warnings.

### 🔄 Smart Caching
1-hour in-memory TTL across all 3 pairs. Dashboard loads in under 200ms on cache hit. No redundant API calls.

### 🛡️ Graceful Degradation
Model fallback chain (primary → secondary → error). If NVIDIA key is missing, Gemma analysis falls back to realistic mock responses. Zero user-facing errors.

### ⚡ Parallel Execution
All 3 forex pairs analyzed simultaneously via `Promise.all`. Combined with caching, the dashboard loads instantly.

### 🎨 Immersive UI
Custom Canvas animation engine with 80-particle network, animated candlestick chart, sine waves, and a responsive glass-morphism design.

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