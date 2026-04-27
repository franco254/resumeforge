// ============================================================
// ResumeForge — AI Provider Abstraction
// Swap providers via AI_PROVIDER env var: openai | anthropic | groq
// ============================================================

export interface AIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface AIResponse {
  text: string;
  tokensUsed?: number;
}

// ── Main call function ────────────────────────────────────────
export async function callAI(messages: AIMessage[], options?: {
  maxTokens?: number;
  temperature?: number;
  jsonMode?: boolean;
}): Promise<AIResponse> {
  const provider = process.env.AI_PROVIDER || "openai";
  const { maxTokens = 2048, temperature = 0.7 } = options || {};

  switch (provider) {
    case "anthropic":
      return callAnthropic(messages, maxTokens, temperature);
    case "groq":
      return callGroq(messages, maxTokens, temperature);
    default:
      return callOpenAI(messages, maxTokens, temperature);
  }
}

// ── OpenAI ───────────────────────────────────────────────────
async function callOpenAI(messages: AIMessage[], maxTokens: number, temperature: number): Promise<AIResponse> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not set");

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini", // cost-effective; swap to gpt-4o for best results
      messages,
      max_tokens: maxTokens,
      temperature,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`OpenAI error: ${err.error?.message || res.statusText}`);
  }

  const data = await res.json();
  return {
    text: data.choices[0]?.message?.content || "",
    tokensUsed: data.usage?.total_tokens,
  };
}

// ── Anthropic / Claude ────────────────────────────────────────
async function callAnthropic(messages: AIMessage[], maxTokens: number, temperature: number): Promise<AIResponse> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not set");

  // Split system message from conversation
  const systemMsg = messages.find((m) => m.role === "system");
  const convoMessages = messages.filter((m) => m.role !== "system");

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: maxTokens,
      temperature,
      system: systemMsg?.content,
      messages: convoMessages.map((m) => ({ role: m.role, content: m.content })),
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Anthropic error: ${err.error?.message || res.statusText}`);
  }

  const data = await res.json();
  return {
    text: data.content[0]?.text || "",
    tokensUsed: data.usage?.input_tokens + data.usage?.output_tokens,
  };
}

// ── Groq ─────────────────────────────────────────────────────
async function callGroq(messages: AIMessage[], maxTokens: number, temperature: number): Promise<AIResponse> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY is not set");

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "llama-3.1-70b-versatile", // Fast and capable
      messages,
      max_tokens: maxTokens,
      temperature,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Groq error: ${err.error?.message || res.statusText}`);
  }

  const data = await res.json();
  return {
    text: data.choices[0]?.message?.content || "",
    tokensUsed: data.usage?.total_tokens,
  };
}

// ── Safe JSON parse from AI response ─────────────────────────
export function parseAIJson<T>(text: string): T {
  // Strip markdown code fences if present
  const cleaned = text
    .replace(/```json\n?/gi, "")
    .replace(/```\n?/gi, "")
    .trim();
  return JSON.parse(cleaned) as T;
}
