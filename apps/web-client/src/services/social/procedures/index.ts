import { createTRPCRouter } from "@/server/init";
import {
  listConnections,
  sendRequest,
  updateConnection,
  removeConnection,
} from "./connections";
import { listMatches, checkMutuals } from "./matches";
import {
  getMyVouches,
  giveVouch,
  removeVouch,
  getVouchSummary,
} from "./vouches";
import { getMyCrushList, addCrush, removeCrush } from "./crush-list";
import { getMyPoints, getPointsHistory } from "./points";
import { generateMatchPlan, getMatchPlan } from "./generate-match-plan";

export const socialRouter = createTRPCRouter({
  // Connections
  listConnections,
  sendRequest,
  updateConnection,
  removeConnection,
  // Matches
  listMatches,
  checkMutuals,
  // Vouches
  getMyVouches,
  giveVouch,
  removeVouch,
  getVouchSummary,
  // Crush List
  getMyCrushList,
  addCrush,
  removeCrush,
  // Points
  getMyPoints,
  getPointsHistory,
  // Match Plan
  generateMatchPlan,
  getMatchPlan,
});
