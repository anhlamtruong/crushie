import { createTRPCRouter } from "@/server/init";
import { getMyStatus } from "./get-my-status";
import { isVerified } from "./is-verified";
import { request } from "./request";
import { getBadges } from "./get-badges";
import { analyze } from "./analyze";
import { listAnalyzerSessions, getAnalyzerSession } from "./analyzer-sessions";

export const verificationRouter = createTRPCRouter({
  getMyStatus,
  isVerified,
  request,
  getBadges,
  analyze,
  listAnalyzerSessions,
  getAnalyzerSession,
});
