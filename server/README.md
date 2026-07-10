# Gemma Local Server (AMD GPU)

FastAPI server running Gemma 3n model on AMD GPU with ROCm.

## Setup

```bash
# Install Python deps
pip install fastapi uvicorn torch transformers accelerate

# Set model (optional, defaults to gemma-3n-e2b-it)
export GEMMA_MODEL=google/gemma-3n-e2b-it

# Start server
uvicorn gemma_server:app --host 0.0.0.0 --port 8000
```

## Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/generate` | Text generation from prompt |
| `POST` | `/chat` | Chat completions with messages |
| `GET` | `/health` | Health check |

## Testing

```bash
# Generate
curl -X POST http://localhost:8000/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt": "EUR/USD analysis:", "max_tokens": 200}'

# Chat
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"messages": [{"role": "user", "content": "Analyze EUR/USD bullish setup"}]}'

# Health
curl http://localhost:8000/health
```

## Usage from Next.js

```env
# .env.local
GEMMA_LOCAL_URL=http://localhost:8000
```

```bash
# Generate via API route
curl -X POST http://localhost:3000/api/gemma-local \
  -H "Content-Type: application/json" \
  -d '{"symbol": "EURUSD", "signal": "BUY", "entry": "1.1035", "stop_loss": "1.0950", "take_profit": "1.1100", "risk": "MEDIUM", "confidence": 78}'
```