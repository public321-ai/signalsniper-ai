# SignalSniper AI Servers (AMD GPU)

Python FastAPI servers for local inference.

## Servers

| Agent | Port | Endpoint | Purpose |
|-------|------|----------|---------|
| Gemma Server | 8000 | `/generate`, `/chat` | Local Gemma narrative |
| Validation Agent | 8001 | `/validate` | Signal verification |
| Risk Agent | 8002 | `/analyze_risk` | Risk assessment |
| Contrarian Agent | 8003 | `/analyze_counter_argument` | Skeptical review |
| Context Agent | 8004 | `/analyze_market_context` | Market environment |

## Setup

```bash
pip install fastapi uvicorn torch transformers accelerate
```

## Running All Servers

```bash
# Terminal 1: Gemma
uvicorn gemma_server:app --host 0.0.0.0 --port 8000

# Terminal 2: Validation
uvicorn validation_agent:app --host 0.0.0.0 --port 8001

# Terminal 3: Risk
uvicorn risk_agent:app --host 0.0.0.0 --port 8002

# Terminal 4: Contrarian
uvicorn contrarian_agent:app --host 0.0.0.0 --port 8003
```

## Architecture

```
┌─────────────────────────────────────────────────────┐
│            Six-Agent Intelligence Pipeline           │
├─────────────────────────────────────────────────────┤
│ Signal → Gemma → Validation → Risk → Contrarian → Context │
│  (Fast)  (Detail)  (Logic)  (Safety)  (Skeptic)  (Env) │
└─────────────────────────────────────────────────────┘
```