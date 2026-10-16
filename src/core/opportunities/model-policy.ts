import { DEEP_ANALYSIS_THRESHOLD } from "@/core/opportunities/thresholds";
export function shouldRunDeepAnalysis(
  promising: boolean,
  screeningScore: number,
) {
  return promising && screeningScore >= DEEP_ANALYSIS_THRESHOLD;
}
