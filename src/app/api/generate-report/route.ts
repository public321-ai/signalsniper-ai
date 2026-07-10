import { NextResponse } from "next/server";

export interface ReportInput {
  symbol: string;
  signal: string;
  confidence: number;
  sniper_score: number;
  rating: string;
  agent_analysis: {
    validation?: { score: number };
    risk_analysis?: { risk_level: string; risk_reward_ratio: string; warnings: string[] };
    contrarian_analysis?: { contrarian_result: { challenge_score: number; risk_factors: string[] } };
    market_context?: { market_regime: string; trend_direction: string; volatility: { level: string }; market_context_score?: number };
    historical_analysis?: { similar_patterns_found: number; historical_success_rate: string };
  };
  format?: "json" | "markdown";
}

export interface ReportSection {
  symbol?: string;
  direction?: string;
  confidence?: string;
  sniper_score?: string;
  rating?: string;
  supporting_factors?: string[];
  level?: string;
  risk_reward?: string;
  warnings?: string[];
  risk_factors?: string[];
  contrarian_score?: number;
  regime?: string;
  trend?: string;
  volatility?: string;
  similar_patterns?: number;
  success_rate?: string;
  [key: string]: unknown;
}

export interface TradeReport {
  report_type: string;
  symbol: string;
  decision: string;
  sniper_score: number;
  confidence: number;
  sections: {
    trade_overview: ReportSection;
    ai_decision_summary: string;
    technical_intelligence: ReportSection;
    risk_assessment: ReportSection;
    contrarian_review: ReportSection;
    market_context: ReportSection;
    historical_intelligence: ReportSection;
    final_decision: ReportSection;
  };
}

function generateDecisionSummary(data: ReportInput): string {
  const parts: string[] = [];
  const agent = data.agent_analysis;

  if ((agent?.validation?.score ?? 0) >= 80) parts.push("strong technical confirmation");
  if (agent?.risk_analysis?.risk_level === "LOW") parts.push("low risk exposure");
  if (agent?.risk_analysis?.risk_level === "MEDIUM") parts.push("controlled risk");
  if ((agent?.market_context?.market_context_score ?? 0) >= 70) parts.push("favorable market conditions");

  if (parts.length) {
    return `Multiple AI analysts support the ${data.signal.toLowerCase()} setup due to ${parts.join(", ")}.`;
  }
  return "AI analysis complete. Review individual sections for detailed insights.";
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as ReportInput;

  const format = body.format || "json";

  const report: TradeReport = {
    report_type: "trade_analysis",
    symbol: body.symbol,
    decision: body.signal,
    sniper_score: body.sniper_score,
    confidence: body.confidence,
    sections: {
      trade_overview: {
        symbol: body.symbol,
        direction: body.signal,
        confidence: `${body.confidence}%`,
        sniper_score: `${body.sniper_score}/100`,
        rating: body.rating
      },
      ai_decision_summary: generateDecisionSummary(body),
      technical_intelligence: {
        indicators_analyzed: 14,
        validation_score: body.agent_analysis?.validation?.score ?? 50
      },
      risk_assessment: {
        level: body.agent_analysis?.risk_analysis?.risk_level ?? "UNKNOWN",
        risk_reward: body.agent_analysis?.risk_analysis?.risk_reward_ratio ?? "N/A",
        warnings: body.agent_analysis?.risk_analysis?.warnings ?? []
      },
      contrarian_review: {
        contrarian_score: body.agent_analysis?.contrarian_analysis?.contrarian_result?.challenge_score ?? 50,
        risk_factors: body.agent_analysis?.contrarian_analysis?.contrarian_result?.risk_factors ?? []
      },
      market_context: {
        regime: body.agent_analysis?.market_context?.market_regime ?? "UNKNOWN",
        trend: body.agent_analysis?.market_context?.trend_direction ?? "NEUTRAL",
        volatility: body.agent_analysis?.market_context?.volatility?.level ?? "UNKNOWN"
      },
      historical_intelligence: {
        similar_patterns: body.agent_analysis?.historical_analysis?.similar_patterns_found ?? 0,
        success_rate: body.agent_analysis?.historical_analysis?.historical_success_rate ?? "N/A"
      },
      final_decision: {
        decision: body.sniper_score >= 85 ? `${body.signal} - EXCEPTIONAL` :
                  body.sniper_score >= 70 ? `${body.signal} - STRONG` :
                  body.sniper_score >= 50 ? `${body.signal} - CAUTIOUS` :
                  `${body.signal} - WEAK`,
        confidence: `${body.confidence}%`,
        sniper_score: `${body.sniper_score}/100`,
        summary: generateDecisionSummary(body)
      }
    }
  };

  if (format === "markdown") {
    const markdown = `# SignalSniper AI Trade Report\n\n## Trade Overview\n\n**${body.symbol}**\n\n- Signal: ${body.signal}\n- Confidence: ${body.confidence}%\n- Score: ${body.sniper_score}/100\n- Rating: ${body.rating}\n\n## Summary\n\n${report.sections.ai_decision_summary}\n`;
    return new Response(markdown, {
      headers: { "Content-Type": "text/markdown" }
    });
  }

  return NextResponse.json(report);
}