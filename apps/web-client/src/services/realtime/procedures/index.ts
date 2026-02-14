import { createTRPCRouter } from "@/server/init";
import { getLiveSuggestion } from "./get-live-suggestion";

export const realtimeRouter = createTRPCRouter({
  getLiveSuggestion,
});
