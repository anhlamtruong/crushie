import { createTRPCRouter } from "@/server/init";
import { getStats } from "./get-stats";
import { submitPractice } from "./submit-practice";

export const academyRouter = createTRPCRouter({
  getStats,
  submitPractice,
});
