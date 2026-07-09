"use client";

import { useState, useEffect } from "react";
import type { SignalAnalysis } from "@/types/signal";
import GemmaAnalysisButton from "@/components/GemmaAnalysisButton";

const PAIRS = ["EUR/USD", "GBP/USD", "USD/JPY"];

const REC_CONFIG: Record<string, { bg: string; text: string; ring: string; dot: string; label: string }> = {
  BUY:  { bg: "bg-emerald-50",  text: "text-emerald-700", ring: "ring-emerald-200", dot: "bg-emerald-500", label: "Buy" },
  SELL: { bg: "bg-rose-50",     text: "text-rose-700",    ring: "ring-rose-200",    dot: "bg-rose-500",    label: "Sell" },
  HOLD: { bg: "bg-amber-50",    text: "text-amber-700",   ring: "ring-amber-200",   dot: "bg-amber-500",   label: "Hold" },
};

const PAIR_LABELS: Record<string, { symbol: string; name: string }> = {
  "EUR/USD": { symbol: "€/$", name: "Euro / US Dollar" },
  "GBP/USD": { symbol: "£/$", name: "Pound / US Dollar" },
  "USD/JPY": { symbol: "$/¥", name: "US Dollar / Yen" },
};

const priceDecimals = (pair: string) => (pair === "USD/JPY" ? 3 : 5);

function Spinner({ className = "" }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

function SignalCard({ pair, analysis, loading, error, liveRate, onAnalyze }: {
  pair: string;
  analysis: SignalAnalysis | null;
  loading: boolean;
  error: string | null;
  liveRate: number | null;
  onAnalyze: () => void;
}) {
  const rec = analysis ? REC_CONFIG[analysis.recommendation] : null;
  const label = PAIR_LABELS[pair];
  const dec = priceDecimals(pair);

  const isBuy = analysis?.recommendation === "BUY";
  const isSell = analysis?.recommendation === "SELL";
  const trendColor = isBuy ? "text-emerald-700" : isSell ? "text-rose-700" : "text-amber-700";
  const trendBg = isBuy ? "bg-emerald-50" : isSell ? "bg-rose-50" : "bg-amber-50";

  return (
    <div className="flex flex-col bg-white rounded-2xl shadow-sm ring-1 ring-slate-200/80 overflow-hidden hover:shadow-lg transition-shadow duration-200">
      {/* Header */}
      <div className="px-5 pt-4 pb-3 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
              {label.symbol}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[15px] font-semibold text-slate-900 tracking-tight">{pair}</span>
                {analysis && rec && (
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ring-1 ${rec.bg} ${rec.text} ${rec.ring}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${rec.dot}`}></span>
                    {rec.label}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">{label.name}</p>
            </div>
          </div>
          <div className="text-right shrink-0">
            {liveRate !== null ? (
              <>
                <div className="text-sm font-semibold text-slate-900 tabular-nums">{liveRate.toFixed(dec)}</div>
                <div className="text-[10px] text-slate-400">Live</div>
              </>
            ) : (
              <div className="text-xs text-slate-400">—</div>
            )}
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mx-5 mt-3 rounded-lg bg-rose-50 ring-1 ring-rose-200 px-4 py-3 text-sm text-rose-700">
          <span className="font-medium">Couldn&apos;t analyze.</span> {error}
        </div>
      )}

      {/* Analysis */}
      {analysis && (
        <div className="px-5 py-4 space-y-4 flex-1">
          {/* Confidence */}
          <div>
            <div className="flex items-baseline justify-between mb-1.5">
              <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Confidence</span>
              <span className="text-xl font-semibold text-slate-900 tabular-nums">{analysis.confidence}<span className="text-xs text-slate-400">%</span></span>
            </div>
            <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${isBuy ? "bg-emerald-500" : isSell ? "bg-rose-500" : "bg-amber-500"}`}
                style={{ width: `${analysis.confidence}%` }}
              />
            </div>
          </div>

          {/* Trend / Risk / R:R */}
          <div className="grid grid-cols-3 gap-1.5">
            <div className={`rounded-lg ${trendBg} px-2.5 py-2.5`}>
              <div className="text-[9px] font-medium text-slate-500 uppercase tracking-wider">Trend</div>
              <div className={`mt-1 text-xs font-semibold ${trendColor}`}>
                {analysis.trend === "BULLISH" ? "↗ " : analysis.trend === "BEARISH" ? "↘ " : "→ "}
                {analysis.trend}
              </div>
            </div>
            <div className={`rounded-lg px-2.5 py-2.5 ${analysis.risk === "LOW" ? "bg-emerald-50" : analysis.risk === "HIGH" ? "bg-rose-50" : "bg-amber-50"}`}>
              <div className="text-[9px] font-medium text-slate-500 uppercase tracking-wider">Risk</div>
              <div className={`mt-1 text-xs font-semibold ${analysis.risk === "LOW" ? "text-emerald-700" : analysis.risk === "HIGH" ? "text-rose-700" : "text-amber-700"}`}>
                {analysis.risk}
              </div>
            </div>
            <div className="rounded-lg bg-slate-50 px-2.5 py-2.5">
              <div className="text-[9px] font-medium text-slate-500 uppercase tracking-wider">R:R</div>
              <div className="mt-1 text-xs font-semibold text-slate-900 tabular-nums">{analysis.riskRewardRatio || "—"}</div>
            </div>
          </div>

          {/* Trade Levels */}
          <div className="rounded-lg bg-slate-50 px-3 py-3">
            <div className="text-[9px] font-medium text-slate-500 uppercase tracking-wider mb-2">Trade Levels</div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <div className="text-[10px] text-slate-400">Entry</div>
                <div className="text-xs font-semibold text-slate-900 tabular-nums">{analysis.entryPrice.toFixed(dec)}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400">Stop Loss</div>
                <div className="text-xs font-semibold text-rose-600 tabular-nums">{analysis.stopLoss.toFixed(dec)}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400">Take Profit</div>
                <div className="text-xs font-semibold text-emerald-600 tabular-nums">{analysis.takeProfit.toFixed(dec)}</div>
              </div>
            </div>
          </div>

          {/* Support / Resistance */}
          <div className="grid grid-cols-2 gap-1.5">
            <div className="rounded-lg bg-emerald-50/50 px-3 py-2">
              <div className="text-[9px] font-medium text-emerald-700/60 uppercase tracking-wider">Support</div>
              <div className="text-xs font-semibold text-emerald-700 tabular-nums">{analysis.supportLevel.toFixed(dec)}</div>
            </div>
            <div className="rounded-lg bg-rose-50/50 px-3 py-2">
              <div className="text-[9px] font-medium text-rose-700/60 uppercase tracking-wider">Resistance</div>
              <div className="text-xs font-semibold text-rose-700 tabular-nums">{analysis.resistanceLevel.toFixed(dec)}</div>
            </div>
          </div>

          {/* Key Levels */}
          {analysis.keyLevels && analysis.keyLevels.length > 0 && (
            <div>
              <div className="text-[9px] font-medium text-slate-500 uppercase tracking-wider mb-1.5">Key Levels</div>
              <div className="divide-y divide-slate-100">
                {analysis.keyLevels.map((lvl, i) => (
                  <div key={i} className="flex items-center justify-between py-1.5 text-xs">
                    <span className="text-slate-500">{lvl.label}</span>
                    <span className={`font-semibold tabular-nums ${
                      lvl.type === "support" ? "text-emerald-700" :
                      lvl.type === "resistance" ? "text-rose-700" : "text-slate-900"
                    }`}>
                      {lvl.price.toFixed(dec)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sentiment */}
          {analysis.marketSentiment && (
            <div className="rounded-lg bg-blue-50/50 px-3 py-2.5">
              <div className="text-[9px] font-medium text-blue-700/60 uppercase tracking-wider mb-1">Sentiment</div>
              <p className="text-xs text-slate-600 leading-relaxed">{analysis.marketSentiment}</p>
            </div>
          )}

          {/* Reasons */}
          <div>
            <div className="text-[9px] font-medium text-slate-500 uppercase tracking-wider mb-1.5">Why this signal</div>
            <ul className="space-y-1.5">
              {analysis.reasons.slice(0, 3).map((reason, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                  <span className="w-4 h-4 rounded bg-slate-900 text-white flex items-center justify-center text-[9px] font-semibold shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span className="leading-relaxed">{reason}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Warnings */}
          {analysis.warnings.length > 0 && (
            <div className="rounded-lg bg-amber-50/50 px-3 py-2.5">
              <div className="text-[9px] font-medium text-amber-700/60 uppercase tracking-wider mb-1">Warnings</div>
              <ul className="space-y-1">
                {analysis.warnings.map((warning, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-xs text-amber-800">
                    <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5">
                      <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 6a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 6zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"/>
                    </svg>
                    <span className="leading-relaxed">{warning}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="text-[10px] text-slate-400">
            Analyzed {new Date(analysis.timestamp).toLocaleTimeString()}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!analysis && !loading && !error && (
        <div className="flex-1 flex items-center justify-center px-5 py-8">
          <div className="text-center">
            <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center mx-auto mb-2">
              <svg className="w-4.5 h-4.5 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
              </svg>
            </div>
            <p className="text-xs text-slate-500">Click below to analyze {pair}.</p>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && !analysis && (
        <div className="flex-1 flex items-center justify-center px-5 py-8">
          <div className="text-center">
            <Spinner className="w-5 h-5 text-blue-600 mx-auto mb-2" />
            <p className="text-xs text-slate-500">Analyzing {pair}…</p>
          </div>
        </div>
      )}

      {/* Action */}
      <div className="px-5 pb-4 mt-auto">
        {!analysis && !loading && !error && (
          <button
            onClick={onAnalyze}
            className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 active:scale-[0.98] transition-all"
          >
            Analyze {pair}
          </button>
        )}
        {loading && !analysis && (
          <button
            disabled
            className="w-full py-2.5 rounded-xl bg-slate-100 text-slate-400 text-sm font-semibold flex items-center justify-center gap-2"
          >
            <Spinner className="w-4 h-4" />
            Analyzing…
          </button>
        )}
        {analysis && (
          <button
            onClick={onAnalyze}
            disabled={loading}
            className="w-full py-2 rounded-xl bg-white text-slate-500 text-xs font-medium ring-1 ring-slate-200 hover:bg-slate-50 hover:text-slate-700 disabled:opacity-40 transition-all"
          >
            {loading ? "Re-analyzing…" : "Re-analyze"}
          </button>
        )}
        {analysis && <GemmaAnalysisButton analysis={analysis} />}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [signals, setSignals] = useState<Record<string, SignalAnalysis | null>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [liveRates, setLiveRates] = useState<Record<string, number | null>>(
    Object.fromEntries(PAIRS.map((p) => [p, null]))
  );

  // Auto-load cached signals on mount
  useEffect(() => {
    async function loadSignals() {
      setLoading(PAIRS.reduce((acc, p) => ({ ...acc, [p]: true }), {}));
      try {
        const res = await fetch("/api/signals");
        if (!res.ok) return;
        const data = await res.json();
        for (const pair of PAIRS) {
          if (data[pair] && !data[pair].error) {
            setSignals((prev) => ({ ...prev, [pair]: data[pair] }));
          }
        }
      } catch { /* silently fail */ }
      setLoading(PAIRS.reduce((acc, p) => ({ ...acc, [p]: false }), {}));
    }
    loadSignals();
  }, []);

  useEffect(() => {
    async function fetchRates() {
      try {
        const res = await fetch("/api/rates");
        if (!res.ok) return;
        const data = await res.json();
        if (data.rates) setLiveRates(data.rates);
      } catch { /* silently fail */ }
    }
    fetchRates();
    const interval = setInterval(fetchRates, 60000);
    return () => clearInterval(interval);
  }, []);

  async function analyzePair(pair: string) {
    setLoading((prev) => ({ ...prev, [pair]: true }));
    setErrors((prev) => ({ ...prev, [pair]: null }));
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pair, currentPrice: liveRates[pair] }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Analysis failed");
      }
      const data: SignalAnalysis = await res.json();
      setSignals((prev) => ({ ...prev, [pair]: data }));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setErrors((prev) => ({ ...prev, [pair]: message }));
      setSignals((prev) => ({ ...prev, [pair]: null }));
    } finally {
      setLoading((prev) => ({ ...prev, [pair]: false }));
    }
  }

  const analyzedCount = Object.values(signals).filter(Boolean).length;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <header className="sticky top-0 z-20 bg-white/70 backdrop-blur-lg border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-slate-900 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="white" strokeWidth="2.5">
                <path d="M3 3l7 7M14 10l7-7M3 21l7-7M14 14l7 7" strokeLinecap="round"/>
                <circle cx="12" cy="12" r="2.5" fill="white" stroke="none"/>
              </svg>
            </div>
            <span className="text-lg font-bold text-slate-900 tracking-tight">SignalSniper</span>
            <span className="px-2 py-0.5 text-[10px] font-semibold bg-blue-50 text-blue-700 rounded-md">AI</span>
          </div>
          <div className="flex items-center gap-2.5 text-[11px] text-slate-500">
            <span className="flex items-center gap-1">
              <span className="relative flex w-1.5 h-1.5">
                <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75"></span>
                <span className="relative rounded-full w-1.5 h-1.5 bg-emerald-500"></span>
              </span>
              Live
            </span>
            <span className="text-slate-300">·</span>
            <span className="tabular-nums">{analyzedCount}/3</span>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero — headline + descriptive subtitle */}
        <section className="max-w-7xl mx-auto px-5 sm:px-8 pt-8 pb-4">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 text-center">
            Forex Signals. <span className="text-blue-600">Analyzed</span>. Explained. <span className="text-blue-600">Optimized</span>.
          </h1>
          <p className="mt-1.5 text-sm font-medium text-slate-600">
            High-Performance Forex Intelligence with Fireworks AI, AMD GPUs, and Explainable AI
          </p>
          <p className="mt-2 text-sm text-slate-500 leading-relaxed max-w-3xl">
            Select a currency pair → SignalSniper AI performs multi-factor market analysis using 15+ technical indicators and intelligent AI reasoning → Receive transparent trading insights, confidence scores, entry/exit levels, and proactive risk warnings.
          </p>
        </section>

        {/* Live Signals — main focus, immediately visible */}
        <section className="max-w-7xl mx-auto px-5 sm:px-8 pb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-500">Live Signals</h2>
            <div className="flex items-center gap-2 text-[11px] text-slate-500">
              {liveRates["EUR/USD"] !== null && (
                <span className="tabular-nums">
                  €/$ {liveRates["EUR/USD"]!.toFixed(5)}
                </span>
              )}
              {liveRates["GBP/USD"] !== null && (
                <span className="tabular-nums">
                  £/$ {liveRates["GBP/USD"]!.toFixed(5)}
                </span>
              )}
              {liveRates["USD/JPY"] !== null && (
                <span className="tabular-nums">
                  $/¥ {liveRates["USD/JPY"]!.toFixed(3)}
                </span>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
            {PAIRS.map((pair) => (
              <SignalCard
                key={pair}
                pair={pair}
                analysis={signals[pair]}
                loading={loading[pair] || false}
                error={errors[pair]}
                liveRate={liveRates[pair]}
                onAnalyze={() => analyzePair(pair)}
              />
            ))}
          </div>
        </section>

        {/* How it works — thin horizontal strip */}
        <section className="max-w-7xl mx-auto px-5 sm:px-8 pb-8">
          <div className="rounded-xl bg-white/60 ring-1 ring-slate-200/60 px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-8">
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">How it works</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 text-sm text-slate-600">
              <span className="flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-md bg-blue-50 text-blue-700 flex items-center justify-center text-[10px] font-bold">1</span>
                Select pair
              </span>
              <span className="text-slate-300">→</span>
              <span className="flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-md bg-emerald-50 text-emerald-700 flex items-center justify-center text-[10px] font-bold">2</span>
                AI evaluates indicators
              </span>
              <span className="text-slate-300">→</span>
              <span className="flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-md bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold">3</span>
                Get full breakdown
              </span>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-7xl mx-auto px-5 sm:px-8 pb-10">
          <div className="rounded-xl bg-slate-900 text-white px-6 py-5 sm:py-6">
            <h2 className="text-lg sm:text-xl font-semibold tracking-tight">Trade smarter through understanding.</h2>
            <p className="mt-1.5 text-sm text-slate-300 leading-relaxed max-w-xl">
              SignalSniper AI doesn&apos;t replace traders — it helps them understand the reasoning behind market signals.
            </p>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200/60 bg-white/40">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-4 flex items-center justify-between text-[11px] text-slate-400">
          <p>© {new Date().getFullYear()} SignalSniper AI</p>
          <p>AI-generated — educational only. Not financial advice.</p>
        </div>
      </footer>
    </div>
  );
}
