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
| Historical Agent | 8005 | `/analyze_historical_pattern` | Historical patterns |
| Orchestrator | 8006 | `/orchestrate` | Multi-agent coordination |

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

# Terminal 5: Context
uvicorn market_context_agent:app --host 0.0.0.0 --port 8004

# Terminal 6: Historical
uvicorn historical_pattern_agent:app --host 0.0.0.0 --port 8005

# Terminal 7: Orchestrator
uvicorn orchestrator_agent:app --host 0.0.0.0 --port 8006
```

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│           Multi-Agent Decision Pipeline (7 Agents)          │
├─────────────────────────────────────────────────────────────┤
│ Signal → Gemma → Validation → Risk → Contrarian → Context → Hist │
│  (Fast)  (Detail)  (Logic)  (Safety)  (Skeptic)   (Env)    (Hist) │
│                                                                ↓ │
│                                                      Orchestrator │
│                                                                ↓ │
│                                                      Final Signal │
└─────────────────────────────────────────────────────────────┘
```