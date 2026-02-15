import { callAzureOpenAI } from "./azure-client.js";

export async function callLLM(prompt: string): Promise<{
  response: string;
  provider: string;
}> {
  // Try Gemini first
  try {
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    if (geminiResponse.ok) {
      const geminiData = await geminiResponse.json();
      console.log("✅ Using Gemini (primary)");
      return {
        response: geminiData.candidates[0].content.parts[0].text,
        provider: "gemini",
      };
    }
  } catch (error) {
    console.warn("⚠️ Gemini failed, using Azure OpenAI fallback:", error);
  }

  // Fallback to Azure OpenAI (Microsoft Phi-4)
  const response = await callAzureOpenAI(prompt);
  console.log("✅ Using Azure OpenAI - Microsoft Phi-4-mini-instruct (fallback)");
  return { response, provider: "azure-phi4" };
}