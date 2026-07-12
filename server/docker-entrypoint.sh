#!/bin/bash
set -e

# Start all Python agents
uvicorn gemma_server:app --host 0.0.0.0 --port 8000 &
uvicorn validation_agent:app --host 0.0.0.0 --port 8001 &
uvicorn risk_agent:app --host 0.0.0.0 --port 8002 &
uvicorn contrarian_agent:app --host 0.0.0.0 --port 8003 &
uvicorn market_context_agent:app --host 0.0.0.0 --port 8004 &
uvicorn historical_pattern_agent:app --host 0.0.0.0 --port 8005 &
uvicorn orchestrator_agent:app --host 0.0.0.0 --port 8006 &
uvicorn score_engine:app --host 0.0.0.0 --port 8007 &
uvicorn report_generator:app --host 0.0.0.0 --port 8008 &

wait -n