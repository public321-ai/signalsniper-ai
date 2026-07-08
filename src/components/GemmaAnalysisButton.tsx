"use client";

import { useState } from "react";
import type { SignalAnalysis } from "@/types/signal";

interface GemmaAnalysisButtonProps {
  analysis: SignalAnalysis;
}

function Spinner({ className = "" }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

export default function GemmaAnalysisButton({ analysis }: GemmaAnalysisButtonProps) {
  const [gemmaResult, setGemmaResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  async function handleAnalyze() {
    setLoading(true);
    setError(null);

    const symbol = analysis.pair.replace("/", "");
    const dec = analysis.pair === "USD/JPY" ? 3 : 5;

    try {
      const res = await fetch("/api/gemma-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol,
          market: "Forex",
          signal: analysis.recommendation,
          entry: analysis.entryPrice.toFixed(dec),
          stop_loss: analysis.stopLoss.toFixed(dec),
          take_profit: analysis.takeProfit.toFixed(dec),
          risk: analysis.risk,
          confidence: analysis.confidence,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || err.details || "Gemma analysis failed");
      }

      const data = await res.json();
      setGemmaResult(data.analysis);
      setExpanded(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-3">
      <button
        onClick={handleAnalyze}
        disabled={loading}
        className="w-full py-2 rounded-xl bg-purple-600 text-white text-xs font-semibold hover:bg-purple-700 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 transition-all flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Spinner className="w-3.5 h-3.5" />
            Analyzing with Gemma AI…
          </>
        ) : (
          <>🤖 Gemma AI Analysis</>
        )}
      </button>

      {error && (
        <div className="mt-2 rounded-lg bg-rose-50 ring-1 ring-rose-200 px-3 py-2 text-xs text-rose-700">
          {error}
        </div>
      )}

      {gemmaResult && (
        <div className="mt-2">
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-purple-50 ring-1 ring-purple-200 text-xs font-medium text-purple-700 hover:bg-purple-100 transition-colors"
          >
            <span className="flex items-center gap-1.5">
              🤖 Gemma Analysis
              <span className="text-[10px] text-purple-500 font-normal">
                (click to {expanded ? "collapse" : "expand"})
              </span>
            </span>
            <svg
              className={`w-3.5 h-3.5 transition-transform ${expanded ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </button>

          {expanded && (
            <div className="mt-1.5 rounded-lg bg-purple-50/40 ring-1 ring-purple-200/50 px-4 py-3">
              <p className="text-xs text-slate-700 leading-relaxed">{gemmaResult}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
