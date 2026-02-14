import { NextResponse } from "next/server";

const LLM_BASE_URL = process.env.LLM_URL || "http://localhost:3001";
const LLM_SERVICE_TOKEN = process.env.LLM_SERVICE_TOKEN || "";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { text?: string };
    const text = body.text?.trim();

    if (!text) {
      return NextResponse.json({ error: "text is required" }, { status: 400 });
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (LLM_SERVICE_TOKEN) {
      headers["X-Service-Token"] = LLM_SERVICE_TOKEN;
    }

    const llmRes = await fetch(`${LLM_BASE_URL}/api/realtime-coach/tts`, {
      method: "POST",
      headers,
      body: JSON.stringify({ text }),
    });

    if (llmRes.status === 204) {
      return new Response(null, { status: 204 });
    }

    if (!llmRes.ok || !llmRes.body) {
      const errorBody = await llmRes.json().catch(() => ({}));
      return NextResponse.json(
        {
          error:
            (errorBody as { error?: string }).error ||
            "Failed to synthesize speech",
        },
        { status: llmRes.status || 502 },
      );
    }

    return new Response(llmRes.body, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Unexpected error while generating speech" },
      { status: 500 },
    );
  }
}
