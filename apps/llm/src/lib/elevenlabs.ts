import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

const DEFAULT_VOICE_ID =
  process.env.ELEVENLABS_VOICE_ID || "21m00Tcm4TlvDq8ikWAM";
const DEFAULT_MODEL_ID = process.env.ELEVENLABS_MODEL_ID || "eleven_turbo_v2_5";

function getElevenLabsClient(): ElevenLabsClient {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    throw new Error("ELEVENLABS_API_KEY environment variable is not set");
  }

  return new ElevenLabsClient({ apiKey });
}

export async function streamWingmanSpeech(
  text: string,
): Promise<ReadableStream<Uint8Array>> {
  const client = getElevenLabsClient();

  return client.textToSpeech.stream(DEFAULT_VOICE_ID, {
    text,
    modelId: DEFAULT_MODEL_ID,
    outputFormat: "mp3_44100_128",
    optimizeStreamingLatency: 3,
  });
}
