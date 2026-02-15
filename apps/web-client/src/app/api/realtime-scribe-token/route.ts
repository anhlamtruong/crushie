import { NextResponse } from "next/server";

const LLM_BASE_URL = process.env.LLM_URL || "http://localhost:3001";
const LLM_SERVICE_TOKEN = process.env.LLM_SERVICE_TOKEN || "";

export async function GET() {
  try {
    const headers: Record<string, string> = {};

    if (LLM_SERVICE_TOKEN) {
      headers["X-Service-Token"] = LLM_SERVICE_TOKEN;
    }

    const llmRes = await fetch(`${LLM_BASE_URL}/api/realtime-coach/stt-token`, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    const payload = (await llmRes.json().catch(() => ({}))) as {
      data?: { token?: string };
      error?: string;
    };

    if (!llmRes.ok || !payload?.data?.token) {
      return NextResponse.json(
        {
          error: payload.error || "Failed to fetch speech token",
        },
        { status: llmRes.status || 502 },
      );
    }

    return NextResponse.json({ token: payload.data.token });
  } catch {
    return NextResponse.json(
      { error: "Unexpected error while creating speech token" },
      { status: 500 },
    );
  }
}
