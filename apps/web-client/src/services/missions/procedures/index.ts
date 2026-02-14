import { createTRPCRouter } from "@/server/init";
import { listTemplates, getTemplate } from "./templates";
import { propose, listMyMissions, accept, start, decline } from "./instances";
import { completeObjective, checkin, getMyProgress } from "./progress";

export const missionsRouter = createTRPCRouter({
  // Templates
  listTemplates,
  getTemplate,
  // Instances
  propose,
  listMyMissions,
  accept,
  start,
  decline,
  // Progress
  completeObjective,
  checkin,
  getMyProgress,
});
