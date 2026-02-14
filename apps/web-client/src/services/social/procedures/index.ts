import { createTRPCRouter } from "@/server/init";
import {
  listConnections,
  sendRequest,
  updateConnection,
  removeConnection,
} from "./connections";
import { listMatches, checkMutuals } from "./matches";
import { getMyVouches, giveVouch, removeVouch, getVouchSummary } from "./vouches";
import { getMyCrushList, addCrush, removeCrush } from "./crush-list";
import { getMyPoints, getPointsHistory } from "./points";

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
});
