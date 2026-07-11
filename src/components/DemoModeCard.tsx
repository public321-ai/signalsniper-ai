"use client";

import { useState, useEffect } from "react";

export default function DemoModeCard() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("demo-mode-dismissed");
    if (!stored) {
      setDismissed(false);
      setVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    setVisible(false);
    localStorage.setItem("demo-mode-dismissed", "true");
    setDismissed(true);
  };

  if (dismissed || !visible) return null;

  return (
    <div className="fixed top-20 right-4 sm:right-6 z-30 w-72 sm:w-80 animate-fade-in">
      <div className="bg-white rounded-xl shadow-lg ring-1 ring-slate-200/80 p-4 relative">
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 p-1 rounded-lg hover:bg-slate-100 transition-colors"
          aria-label="Dismiss"
        >
          <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5">
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.674M12 3v1m0 16v1m-7-7h2m10 0h2M5.5 5.5l.707.707M18.5 18.5l.707.707M5.5 18.5l.707-.707M18.5 5.5l.707.707M16 12a4 4 0 11-8 0 4 4 0 118 0z" />
            </svg>
          </div>

          <div className="flex-1 min-w-0 pr-8">
            <h3 className="text-sm font-semibold text-slate-900 mb-2">Demo Mode</h3>
            <p className="text-[11px] text-slate-600 leading-relaxed mb-2">
              Currently showing 3 sample signals.
            </p>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              SignalSniper AI scales across Forex, ETFs, indices, crypto, commodities, and more. Expanded coverage requires additional data pipelines and AI compute.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}