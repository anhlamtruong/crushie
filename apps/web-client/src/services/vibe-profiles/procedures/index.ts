import { createTRPCRouter } from "@/server/init";
import { getMe } from "./get-me";
import { create } from "./create";
import { update } from "./update";
import { findSimilar } from "./find-similar";
import { getByUserId } from "./get-by-user-id";

export const vibeProfilesRouter = createTRPCRouter({
  getMe,
  create,
  update,
  findSimilar,
  getByUserId,
});
