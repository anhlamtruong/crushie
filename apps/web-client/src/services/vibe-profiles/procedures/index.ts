import { createTRPCRouter } from "@/server/init";
import { getMe } from "./get-me";
import { create } from "./create";
import { update } from "./update";
import { updateMyProfile } from "./update-my-profile";
import { findSimilar } from "./find-similar";
import { getByUserId } from "./get-by-user-id";

export const vibeProfilesRouter = createTRPCRouter({
  getMe,
  create,
  update,
  updateMyProfile,
  findSimilar,
  getByUserId,
});
