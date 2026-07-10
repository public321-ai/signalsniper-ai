"use client";

import { useState } from "react";
import type { SignalAnalysis } from "@/types/signal";

interface GemmaAnalysisButtonProps {
  analysis: SignalAnalysis;
}

interface ReportData {
  symbol: string;
  signal: string;
  confidence: number;
  sniper_score: number;
  rating: string;
  agent_analysis: Record<string, unknown>;
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
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);

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

  async function generateReport() {
    setReportLoading(true);
    setReportError(null);

    const reportData: ReportData = {
      symbol: analysis.pair.replace("/", ""),
      signal: analysis.recommendation,
      confidence: analysis.confidence,
      sniper_score: 75,
      rating: "STRONG SETUP",
      agent_analysis: {
        validation: { score: 85 },
        risk_analysis: { risk_level: analysis.risk, risk_reward_ratio: analysis.riskRewardRatio || "1:1", warnings: analysis.warnings },
      },
    };

    try {
      const res = await fetch("/api/generate-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reportData),
      });

      if (!res.ok) throw new Error("Report generation failed");

      const report = await res.json();
      const html = `<!DOCTYPE html>
<html>
<head>
  <title>SignalSniper AI - Trade Report: ${report.symbol}</title>
  <style>
    body { font-family: system-ui, sans-serif; padding: 40px; background: #f8fafc; }
    .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    h1 { color: #1e293b; margin-bottom: 20px; }
    .score { font-size: 48px; font-weight: bold; color: #16a34a; }
    .rating { background: #f1f5f9; padding: 8px 12px; border-radius: 6px; font-size: 14px; }
    .section { margin: 20px 0; padding-top: 15px; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="container">
    <h1>SignalSniper AI Trade Report</h1>
    <div class="rating">SignalSniper Score™: <span class="score">${report.sniper_score}/100</span></div>
    <div class="section"><strong>${report.symbol}</strong> - ${report.decision}</div>
    <div class="section">${report.sections.ai_decision_summary}</div>
  </div>
</body>
</html>`;

      const blob = new Blob([html], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `signalsniper-${report.symbol.toLowerCase()}-report.html`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setReportError(message);
    } finally {
      setReportLoading(false);
    }
  }

  return (
    <div className="mt-3 space-y-2">
      <div className="flex gap-2">
        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="flex-1 py-2 rounded-xl bg-purple-600 text-white text-xs font-semibold hover:bg-purple-700 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 transition-all flex items-center justify-center gap-2"
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

        <button
          onClick={generateReport}
          disabled={reportLoading}
          className="flex-1 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 active:scale-[0.98] disabled:opacity-50 transition-all flex items-center justify-center gap-2"
        >
          {reportLoading ? (
            <>
              <Spinner className="w-3.5 h-3.5" />
              Generating…
            </>
          ) : (
            <>📄 Generate AI Trade Brief</>
          )}
        </button>
      </div>

      {error && (
        <div className="mt-2 rounded-lg bg-rose-50 ring-1 ring-rose-200 px-3 py-2 text-xs text-rose-700">
          {error}
        </div>
      )}

      {reportError && (
        <div className="mt-2 rounded-lg bg-rose-50 ring-1 ring-rose-200 px-3 py-2 text-xs text-rose-700">
          {reportError}
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