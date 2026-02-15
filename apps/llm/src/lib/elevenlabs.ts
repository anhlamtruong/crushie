import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

const DEFAULT_VOICE_ID =
  process.env.ELEVENLABS_VOICE_ID || "21m00Tcm4TlvDq8ikWAM";
const DEFAULT_MODEL_ID = process.env.ELEVENLABS_MODEL_ID || "eleven_flash_v2_5";
const SUPPORTED_OUTPUT_FORMATS = [
  "mp3_22050_32",
  "mp3_44100_64",
  "mp3_44100_128",
] as const;

type ElevenOutputFormat = (typeof SUPPORTED_OUTPUT_FORMATS)[number];

function getOutputFormat(): ElevenOutputFormat {
  const value = process.env.ELEVENLABS_OUTPUT_FORMAT;
  if (value && SUPPORTED_OUTPUT_FORMATS.includes(value as ElevenOutputFormat)) {
    return value as ElevenOutputFormat;
  }

  return "mp3_22050_32";
}

function getStreamingLatency(): number {
  const raw = Number(process.env.ELEVENLABS_OPTIMIZE_STREAMING_LATENCY ?? "4");
  if (!Number.isFinite(raw)) return 4;
  return Math.max(0, Math.min(4, Math.trunc(raw)));
}

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
    outputFormat: getOutputFormat(),
    optimizeStreamingLatency: getStreamingLatency(),
  });
}
