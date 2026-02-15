export async function callAzureOpenAI(prompt: string): Promise<string> {
  const response = await fetch(
    `${process.env.AZURE_OPENAI_ENDPOINT}/openai/deployments/${process.env.AZURE_OPENAI_DEPLOYMENT}/chat/completions?api-version=${process.env.AZURE_OPENAI_API_VERSION}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": process.env.AZURE_OPENAI_KEY!,
      },
      body: JSON.stringify({
        messages: [{ role: "user", content: prompt }],
        max_tokens: 2000,
        temperature: 0.7,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Azure OpenAI error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}