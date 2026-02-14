/**
 * Barrel export for all hooks
 */

// Users
export {
  useMe,
  useUpdateProfile,
  useSyncFromClerk,
  userKeys,
} from "./use-users";

// Vibe Profiles
export {
  useMyVibeProfile,
  useVibeProfileByUserId,
  useCreateVibeProfile,
  useUpdateVibeProfile,
  useFindSimilarProfiles,
  vibeProfileKeys,
} from "./use-vibe-profiles";

// Social
export {
  useConnections,
  useSendConnection,
  useUpdateConnection,
  useDeleteConnection,
  useMatches,
  useMutualMatches,
  useVouches,
  useCreateVouch,
  useDeleteVouch,
  useVouchSummary,
  useCrushList,
  useAddCrush,
  useRemoveCrush,
  usePointsTotal,
  usePointsHistory,
  socialKeys,
} from "./use-social";

// Missions
export {
  useMissionTemplates,
  useMissionTemplate,
  useMissionInstances,
  useProposeMission,
  useAcceptMission,
  useStartMission,
  useDeclineMission,
  useMissionProgress,
  useCompleteObjective,
  useMissionCheckin,
  missionKeys,
} from "./use-missions";

// Verification
export {
  useVerificationStatus,
  useIsVerified,
  useVerificationBadges,
  useAnalyzerSessions,
  useAnalyzerSession,
  useRequestVerification,
  useAnalyzeVerification,
  verificationKeys,
} from "./use-verification";

// LLM
export {
  useGenerateVibe,
  useAnalyzeProfile,
  useEvaluateMatch,
  useFindAndEvaluateMatches,
} from "./use-llm";

// Uploads
export {
  useUploadOnboardImage,
  useDeleteOnboardImages,
  useOnboardImages,
  uploadKeys,
} from "./use-uploads";

// Examples
export {
  useExamples,
  usePublicExamples,
  useExample,
  useCreateExample,
  useUpdateExample,
  useDeleteExample,
  exampleKeys,
} from "./use-examples";
