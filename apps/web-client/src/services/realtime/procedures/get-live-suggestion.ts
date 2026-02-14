import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { authedProcedure } from "@/server/init";
import { getLiveSuggestion as callGetLiveSuggestion } from "@/services/llm/client";

const inputSchema = z.object({
  frame: z.string().min(1, "frame is required"),
  targetVibe: z.string().min(1, "targetVibe is required"),
  currentTopic: z.string().default(""),
  language: z.string().default("Respond in English."),
});

export const getLiveSuggestion = authedProcedure
  .input(inputSchema)
  .mutation(async ({ input }) => {
    try {
      const { data } = await callGetLiveSuggestion({
        frame: input.frame,
        targetVibe: input.targetVibe,
        currentTopic: input.currentTopic,
        language: input.language,
      });

      return data;
    } catch (error) {
      console.error("❌ getLiveSuggestion failed:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message:
          error instanceof Error
            ? error.message
            : "Failed to get live suggestion",
      });
    }
  });
