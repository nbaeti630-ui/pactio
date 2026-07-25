import { NextResponse } from "next/server";
import mammoth from "mammoth";
import pdf from "pdf-parse";
import { openai, AI_MODEL } from "@/lib/utils/openAIClient";
import { handleOpenAIError } from "@/lib/utils/openai-error-handler";

const FILE_PROCESSORS = {
  "application/pdf": async (buffer: Buffer) => {
    const data = await pdf(buffer);
    return data.text;
  },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    async (buffer: Buffer) => {
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    },
  "text/plain": async (buffer: Buffer) => buffer.toString("utf-8"),
  "text/markdown": async (buffer: Buffer) => buffer.toString("utf-8"),
} as const;

type FileType = keyof typeof FILE_PROCESSORS;

function resolveFileType(file: File): FileType | null {
  if (file.type in FILE_PROCESSORS) {
    return file.type as FileType;
  }
  const name = (file.name || "").toLowerCase();
  if (name.endsWith(".pdf")) return "application/pdf";
  if (name.endsWith(".docx")) {
    return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  }
  if (name.endsWith(".txt")) return "text/plain";
  if (name.endsWith(".md")) return "text/markdown";
  return null;
}

const ANALYSIS_PROMPT = `
 Analyze the following document and extract:

 - All monetary amounts (including their currency), what they are for, and where they appear
 - All tasks, deliverables, and obligations (including descriptions, due dates, responsible parties, and details)

 Your response should include only a JSON object with two properties, an "amounts" array and a "tasks" array. Each item in the "tasks" array must be an object with a "description" (string) and an optional "due_date" (string or null), nothing else. Example:

 {
 "amounts": [
 { "amount": "$1.500", "currency": "USD", "for": "Full compensation", "location": "Section 2.1" }
 ],
 "tasks": [
 { "description": "Create and deliver one high-quality product image.", "due_date": "2026-02-01" }
 ]
 }

 Strictly follow the structure above, and start all sentences with an uppercase letter.

 Below is the document content to analyze:
`;

export async function POST(req: Request) {
  if (!req.body) {
    return NextResponse.json({ error: "No body provided" }, { status: 400 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const fileType = resolveFileType(file);
    if (!fileType) {
      return NextResponse.json(
        { error: "Unsupported file type. Please upload a PDF, DOCX, or TXT file." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const textContent = await FILE_PROCESSORS[fileType](buffer);

    let completion;
    try {
      completion = await openai.chat.completions.create({
        model: AI_MODEL,
        messages: [
          { role: "user", content: ANALYSIS_PROMPT + "\n" + textContent },
        ],
        temperature: 0,
        response_format: { type: "json_object" },
      });
    } catch (openaiError) {
      const { status, body } = handleOpenAIError(openaiError);
      return NextResponse.json(body, { status });
    }

    const result = JSON.parse(completion.choices[0].message.content || "{}");

    // BUG3 FIX: normalize tasks to objects { description, due_date } so the UI
    // (which renders task.description) always shows content, even when the model
    // returns plain strings.
    if (Array.isArray(result.tasks)) {
      result.tasks = result.tasks
        .map((t: any) =>
          typeof t === "string"
            ? { description: t, due_date: null }
            : { description: t.description || t.task || "", due_date: t.due_date || null }
        )
        .filter((t: any) => t.description);
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error analyzing document:", error);

    const isAuthError = error instanceof Error && (
      error.message.includes("API key") ||
      error.message.includes("invalid_api_key") ||
      error.message.includes("authentication") ||
      error.message.includes("401")
    );

    if (isAuthError) {
      return NextResponse.json(
        { error: "AI service is not properly configured.", code: "auth_error", retryable: false },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to analyze document", retryable: false },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Send a POST request with a PDF, DOCX, or TXT file to analyze",
    supportedTypes: Object.keys(FILE_PROCESSORS),
  });
}
