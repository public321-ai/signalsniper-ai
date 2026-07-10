import { readFileSync } from "fs";
import { join } from "path";

export interface LocalGemmaRequest {
  prompt: string;
  max_tokens?: number;
  temperature?: number;
}

export interface LocalGemmaResponse {
  text: string;
  model: string;
}

export interface ChatGemmaRequest {
  messages: Array<{ role: string; content: string }>;
  max_tokens?: number;
  temperature?: number;
}

const LOCAL_API_URL = process.env.GEMMA_LOCAL_URL ?? "http://localhost:8000";

function loadPromptTemplate(): string {
  const filePath = join(process.cwd(), "src/prompts/forex_analysis_prompt.txt");
  return readFileSync(filePath, "utf-8");
}

function fillTemplate(template: string, params: Record<string, string | number>): string {
  let result = template;
  for (const [key, value] of Object.entries(params)) {
    result = result.replace(`{${key}}`, String(value));
  }
  return result;
}

export async function callLocalGemmaGenerate(
  params: Record<string, string | number>
): Promise<LocalGemmaResponse> {
  const template = loadPromptTemplate();
  const prompt = fillTemplate(template, params);

  const response = await fetch(`${LOCAL_API_URL}/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt,
      max_tokens: 512,
      temperature: 0.7,
    } as LocalGemmaRequest),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Local Gemma API error: ${response.status} — ${errText}`);
  }

  const data = await response.json();
  const text = data.text || data.response || data.generated_text;

  if (!text) {
    throw new Error("No response content from local Gemma model");
  }

  return { text, model: "gemma-3n-local" };
}

export async function callLocalGemmaChat(
  messages: Array<{ role: string; content: string }>
): Promise<LocalGemmaResponse> {
  const response = await fetch(`${LOCAL_API_URL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages,
      max_tokens: 512,
      temperature: 0.7,
    } as ChatGemmaRequest),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Local Gemma Chat API error: ${response.status} — ${errText}`);
  }

  const data = await response.json();
  const text = data.text || data.response || data.content || data.choices?.[0]?.message?.content;

  if (!text) {
    throw new Error("No response content from local Gemma chat endpoint");
  }

  return { text, model: "gemma-3n-local" };
}