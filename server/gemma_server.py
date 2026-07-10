#!/usr/bin/env python3
"""
Local Gemma 3n server for AMD GPU inference.
Loads model once into VRAM and serves via FastAPI.
Endpoints:
  - POST /generate  — Text generation with prompt
  - POST /chat      — Chat completions with messages
"""

import os
import torch
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import uvicorn

# Initialize FastAPI
app = FastAPI(title="Gemma Local API", version="1.0")

# Model loading (lazy, on first request)
_model = None
_tokenizer = None

class GenerateRequest(BaseModel):
    prompt: str
    max_tokens: int = 512
    temperature: float = 0.7

class ChatRequest(BaseModel):
    messages: List[dict]
    max_tokens: int = 512
    temperature: float = 0.7

def load_model():
    global _model, _tokenizer
    if _model is None:
        try:
            from transformers import AutoModelForCausalLM, AutoTokenizer

            model_name = os.getenv("GEMMA_MODEL", "google/gemma-3n-e2b-it")
            device = "cuda" if torch.cuda.is_available() else "cpu"

            print(f"Loading {model_name} on {device}...")

            _tokenizer = AutoTokenizer.from_pretrained(model_name)
            _model = AutoModelForCausalLM.from_pretrained(
                model_name,
                torch_dtype=torch.float16 if device == "cuda" else torch.float32,
                device_map="auto" if device == "cuda" else None,
            )

            if device == "cuda":
                _model = _model.to("cuda")
        except Exception as e:
            print(f"Error loading model: {e}")
            raise
    return _model, _tokenizer

@app.on_event("startup")
async def startup_event():
    """Load model on startup."""
    try:
        load_model()
        print("Model loaded successfully")
    except Exception as e:
        print(f"Failed to load model on startup: {e}")

@app.post("/generate")
async def generate(request: GenerateRequest):
    """Generate text from prompt."""
    try:
        model, tokenizer = load_model()

        inputs = tokenizer(
            request.prompt,
            return_tensors="pt",
            truncation=True,
            max_length=2048,
        )

        if torch.cuda.is_available():
            inputs = {k: v.to("cuda") for k, v in inputs.items()}

        with torch.no_grad():
            outputs = model.generate(
                **inputs,
                max_new_tokens=request.max_tokens,
                temperature=request.temperature,
                do_sample=True,
                pad_token_id=tokenizer.eos_token_id,
            )

        text = tokenizer.decode(outputs[0], skip_special_tokens=True)
        # Remove the original prompt from output
        text = text[len(request.prompt):].strip()

        return {"text": text, "model": "gemma-3n-local"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/chat")
async def chat(request: ChatRequest):
    """Chat completion with message history."""
    try:
        model, tokenizer = load_model()

        # Format messages into prompt
        prompt = ""
        for msg in request.messages:
            role = msg.get("role", "user")
            content = msg.get("content", "")
            prompt += f"{role}: {content}\n"
        prompt += "assistant: "

        inputs = tokenizer(
            prompt,
            return_tensors="pt",
            truncation=True,
            max_length=2048,
        )

        if torch.cuda.is_available():
            inputs = {k: v.to("cuda") for k, v in inputs.items()}

        with torch.no_grad():
            outputs = model.generate(
                **inputs,
                max_new_tokens=request.max_tokens,
                temperature=request.temperature,
                do_sample=True,
                pad_token_id=tokenizer.eos_token_id,
            )

        text = tokenizer.decode(outputs[0], skip_special_tokens=True)

        return {"text": text, "model": "gemma-3n-local"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health():
    """Health check endpoint."""
    model, _ = load_model() if _model is None else (_model, _tokenizer)
    return {"status": "ok", "model_loaded": model is not None}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)