import { google } from "@ai-sdk/google";
import { openai, createOpenAI } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";

const deepseek = createOpenAI({
  name: "deepseek",
  baseURL: "https://api.deepseek.com",
  apiKey: process.env.DEEPSEEK_API_KEY,
});

const providers = {
  gemini: () => google(process.env.GEMINI_MODEL || "gemini-2.0-flash"),
  openai: () => openai(process.env.OPENAI_MODEL || "gpt-4o-mini"),
  anthropic: () =>
    anthropic(process.env.ANTHROPIC_MODEL || "claude-sonnet-4-20250514"),
  deepseek: () => deepseek(process.env.DEEPSEEK_MODEL || "deepseek-v4-flash"),
} as const;

export type AIProvider = keyof typeof providers;

export function getAIModel() {
  const provider = (process.env.AI_PROVIDER || "deepseek") as AIProvider;
  const factory = providers[provider];
  if (!factory) throw new Error(`Unknown AI provider: ${provider}`);
  return factory();
}
