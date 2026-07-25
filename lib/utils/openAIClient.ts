import OpenAI from "openai";

export const openai = new OpenAI({
  defaultHeaders: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36" }, // CF1010 FIX
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL || undefined,
  maxRetries: 0,
  timeout: 120_000,
});

export const AI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";
