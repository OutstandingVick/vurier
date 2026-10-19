export const ANALYSIS_CACHE_HOURS = 24;
export function isAnalysisFresh(
  createdAt: string,
  now = Date.now(),
  hours = ANALYSIS_CACHE_HOURS,
) {
  return now - new Date(createdAt).getTime() < hours * 60 * 60 * 1000;
}
