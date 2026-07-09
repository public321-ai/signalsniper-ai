# SignalSniper-AI — Docker Deployment

> **AMD AI Hackathon Submission** · Forex Intelligence Agent powered by Fireworks AI + Gemma

---

## Project Overview

SignalSniper-AI is a production-ready forex signal analysis platform that combines AI-powered market evaluation with explainable trading intelligence. It analyzes major currency pairs using 15+ technical indicators, Fireworks AI reasoning, and Gemma model explanations to deliver transparent, actionable trading insights.

### Key Features

- **Multi-factor Signal Analysis** — RSI, MACD, EMA, Bollinger Bands, Stochastic, ADX, and more
- **Fireworks AI Inference** — Gemma 3n 27B + GPT-OSS 120B with automatic fallback
- **Gemma AI Explanations** — Detailed natural-language analysis of each signal
- **Token-Efficient Routing** — Hybrid model selection for cost optimization
- **Explainable AI** — Every decision includes reasoning, risk factors, and invalidation points
- **Live Exchange Rates** — Real-time forex data integration
- **AMD GPU Ready** — Designed for Gemma inference on AMD accelerators

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Docker Container                          │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                   Next.js 16 Server                       │   │
│  │                                                           │   │
│  │  ┌─────────────┐    ┌──────────────────────────────┐     │   │
│  │  │   Frontend   │    │         API Routes            │     │   │
│  │  │              │    │                               │     │   │
│  │  │  Dashboard   │    │  POST /api/analyze            │     │   │
│  │  │  SignalCards │    │  POST /api/gemma-analysis     │     │   │
│  │  │  GemmaAI     │    │  GET  /api/signals            │     │   │
│  │  │  Canvas      │    │  GET  /api/rates              │     │   │
│  │  │              │    │  GET  /api/health             │     │   │
│  │  └──────────────┘    │  GET  /api/agent-info         │     │   │
│  │                      └──────────────┬───────────────┘     │   │
│  └─────────────────────────────────────┼─────────────────────┘   │
│                                        │                          │
└────────────────────────────────────────┼──────────────────────────┘
                                         │
                    ┌────────────────────┼────────────────────┐
                    │                    │                     │
              ┌─────▼─────┐    ┌────────▼────────┐   ┌───────▼──────┐
              │ Fireworks  │    │  Gemma / vLLM   │   │ ExchangeRate │
              │ AI API     │    │  GPU Server      │   │ API          │
              │            │    │  (AMD GPU)       │   │              │
              └────────────┘    └──────────────────┘   └──────────────┘
```

### Data Flow

```
User → Dashboard → POST /api/analyze
                       │
                       ├── Build prompt with 15+ indicators
                       ├── Call Fireworks AI (Gemma 3n → GPT-OSS fallback)
                       ├── Parse AI JSON response
                       └── Cache result (1hr TTL)

User → "Gemma AI Analysis" → POST /api/gemma-analysis
                                  │
                                  ├── Load prompt template
                                  ├── Fill with signal parameters
                                  ├── Call Gemma endpoint (real or mock)
                                  └── Return natural-language explanation
```

---

## Quick Start

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) (20.10+)
- [Fireworks AI API Key](https://fireworks.ai) (free tier available)

### 1. Clone the repository

```bash
git clone -b docker-hackathon https://github.com/public321-ai/signalsniper-ai.git
cd signalsniper-ai
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` and add your Fireworks API key:

```env
FIREWORKS_API_KEY=your_fireworks_api_key_here
GEMMA_API_URL=
```

> Leave `GEMMA_API_URL` empty for mock mode — the app returns realistic sample Gemma analyses without requiring a GPU server.

### 3. Build the Docker image

```bash
docker build -t signalsniper-ai .
```

### 4. Run the container

```bash
docker run \
  -p 3000:3000 \
  --env-file .env \
  signalsniper-ai
```

### 5. Open the application

```
http://localhost:3000
```

---

## Docker Compose

For simpler management, use Docker Compose:

```bash
docker compose up --build -d
```

View logs:

```bash
docker compose logs -f signalsniper-ai
```

Stop:

```bash
docker compose down
```

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `FIREWORKS_API_KEY` | Yes | Fireworks AI API key for signal analysis |
| `GEMMA_API_URL` | No | Gemma vLLM endpoint URL. Empty = mock mode |
| `NODE_ENV` | No | Defaults to `production` in Docker |
| `PORT` | No | Defaults to `3000` |

---

## API Endpoints

### Health Check

```bash
curl http://localhost:3000/api/health
```

```json
{
  "status": "healthy",
  "application": "SignalSniper-AI",
  "deployment": "docker",
  "timestamp": "2026-07-09T00:00:00.000Z"
}
```

### Agent Information

```bash
curl http://localhost:3000/api/agent-info
```

```json
{
  "name": "SignalSniper-AI",
  "version": "1.0",
  "category": "Forex Intelligence Agent",
  "provider": "Fireworks AI",
  "model": "Gemma",
  "optimization": "Hybrid Token Efficient Routing",
  "platform": "AMD AI Hackathon"
}
```

### Analyze a Forex Pair

```bash
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"pair": "EUR/USD", "currentPrice": 1.1035}'
```

**Response** (SignalAnalysis):

```json
{
  "pair": "EUR/USD",
  "recommendation": "BUY",
  "confidence": 78,
  "trend": "BULLISH",
  "risk": "MEDIUM",
  "currentPrice": 1.1035,
  "entryPrice": 1.1035,
  "stopLoss": 1.0950,
  "takeProfit": 1.1100,
  "riskRewardRatio": "1:1.6",
  "supportLevel": 1.0980,
  "resistanceLevel": 1.1100,
  "keyLevels": [
    {"price": 1.0950, "label": "Stop Loss", "type": "support"},
    {"price": 1.1035, "label": "Entry", "type": "pivot"},
    {"price": 1.1100, "label": "Take Profit", "type": "resistance"}
  ],
  "marketSentiment": "Bullish momentum supported by positive MACD crossover",
  "reasons": ["Positive MACD crossover", "Price above 20-day EMA", "Favorable R:R ratio"],
  "warnings": ["ECB rate decision risk", "Deteriorating US labor data"],
  "timestamp": "2026-07-09T00:00:00.000Z",
  "model": "accounts/fireworks/models/gemma3n-27b"
}
```

### Gemma AI Explanation

```bash
curl -X POST http://localhost:3000/api/gemma-analysis \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "EURUSD",
    "market": "Forex",
    "signal": "BUY",
    "entry": "1.1035",
    "stop_loss": "1.0950",
    "take_profit": "1.1100",
    "risk": "MEDIUM",
    "confidence": 78
  }'
```

**Response**:

```json
{
  "symbol": "EURUSD",
  "analysis": "EUR/USD bullish momentum is supported by a confluence of factors...",
  "model": "gemma-mock"
}
```

> Set `GEMMA_API_URL` to a real vLLM endpoint to get `model: "gemma-real"` with live GPU inference.

### Fetch All Signals

```bash
curl http://localhost:3000/api/signals
```

### Fetch Live Rates

```bash
curl http://localhost:3000/api/rates
```

---

## AI Model Pipeline

### Primary Analysis (Fireworks AI)

| Priority | Model | Purpose |
|---|---|---|
| 1 | `gemma3n-27b` | Primary signal analysis (token-efficient) |
| 2 | `gpt-oss-120b` | Fallback if primary fails |

### Explanation (Gemma)

| Mode | Endpoint | Description |
|---|---|---|
| Mock | (none) | Realistic pre-written analyses for demo |
| Real | `GEMMA_API_URL` | Live vLLM inference on AMD GPU |

### Token-Efficient Routing

SignalSniper-AI uses a hybrid routing strategy:

1. **Gemma 3n 27B** — smaller, faster model handles structured analysis prompts
2. **GPT-OSS 120B** — larger model serves as fallback for complex scenarios
3. **1-hour cache** — identical pair requests served from cache, reducing API calls
4. **Mock mode** — Gemma explanations can run without GPU, zero token cost

---

## AMD GPU Acceleration

To enable real Gemma inference on AMD GPUs:

### 1. Deploy vLLM with ROCm

```bash
docker run -d \
  --device /dev/kfd \
  --device /dev/dri \
  --security-opt seccomp=unconfined \
  -p 8000:8000 \
  rocm/vllm:latest \
  --model google/gemma-3n-E4B-it \
  --port 8000
```

### 2. Configure SignalSniper-AI

```env
GEMMA_API_URL=http://gpu-server:8000/v1/chat/completions
```

### 3. Verify

```bash
curl -X POST http://localhost:3000/api/gemma-analysis \
  -H "Content-Type: application/json" \
  -d '{"symbol":"EURUSD","signal":"BUY","entry":"1.1035","stop_loss":"1.0950","take_profit":"1.1100","risk":"MEDIUM","confidence":78}'
```

Response should show `"model": "gemma-real"`.

---

## GitHub Container Registry

### Pull pre-built image

```bash
docker pull ghcr.io/public321-ai/signalsniper-ai:latest
```

### Run

```bash
docker run \
  -p 3000:3000 \
  --env-file .env \
  ghcr.io/public321-ai/signalsniper-ai:latest
```

### Publish (maintainers)

```bash
docker build -t ghcr.io/public321-ai/signalsniper-ai:latest .
docker push ghcr.io/public321-ai/signalsniper-ai:latest
```

---

## Docker Production Features

| Feature | Implementation |
|---|---|
| Multi-stage build | deps → builder → runner (minimal final image) |
| Non-root user | `nextjs:nodejs` (uid/gid 1001) |
| Health check | `GET /api/health` every 30s |
| Standalone output | Next.js standalone mode for optimized image |
| Layer caching | Dependencies layer separate from source |
| No dev artifacts | `.dockerignore` excludes node_modules, .next, tests |

---

## Testing

### Health check

```bash
curl http://localhost:3000/api/health
```

### Full analysis pipeline

```bash
# 1. Analyze EUR/USD
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"pair": "EUR/USD"}'

# 2. Get Gemma explanation
curl -X POST http://localhost:3000/api/gemma-analysis \
  -H "Content-Type: application/json" \
  -d '{"symbol":"EURUSD","signal":"BUY","entry":"1.1035","stop_loss":"1.0950","take_profit":"1.1100","risk":"MEDIUM","confidence":78}'

# 3. Agent info
curl http://localhost:3000/api/agent-info

# 4. Live rates
curl http://localhost:3000/api/rates
```

### Docker health status

```bash
docker inspect --format='{{.State.Health.Status}}' signalsniper-ai
```

---

## Hackathon Submission Details

| Field | Value |
|---|---|
| **Project** | SignalSniper-AI |
| **Category** | Forex Intelligence Agent |
| **AI Provider** | Fireworks AI |
| **Models** | Gemma 3n 27B, GPT-OSS 120B |
| **Optimization** | Hybrid Token Efficient Routing |
| **Platform** | AMD AI Hackathon |
| **Repository** | https://github.com/public321-ai/signalsniper-ai |
| **Branch** | docker-hackathon |
| **Container** | ghcr.io/public321-ai/signalsniper-ai:latest |
| **Live Demo** | https://signalsniper-ai.vercel.app |

### Evaluation Quick Start

```bash
# One-command evaluation
git clone -b docker-hackathon https://github.com/public321-ai/signalsniper-ai.git
cd signalsniper-ai
cp .env.example .env
# Add FIREWORKS_API_KEY to .env
docker compose up --build -d
curl http://localhost:3000/api/health
curl http://localhost:3000/api/agent-info
```

---

## Vercel Compatibility

The Docker deployment runs the identical codebase as the Vercel-hosted application:

- `output: "standalone"` in `next.config.ts` is ignored by Vercel's build pipeline
- All API routes, UI, and AI integrations are unchanged
- Environment variables work identically in both environments
- No conditional logic or platform-specific code paths

---

## License

MIT
