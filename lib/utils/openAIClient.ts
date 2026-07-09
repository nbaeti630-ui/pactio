import OpenAI from "openai";

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL || undefined,
  maxRetries: 0,
  timeout: 120_000,
});

export const AI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";
