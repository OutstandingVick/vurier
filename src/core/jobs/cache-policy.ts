export const UPWORK_CACHE_HOURS = 24;

export function upworkCacheCutoff(now = Date.now()) {
  return new Date(now - UPWORK_CACHE_HOURS * 3_600_000).toISOString();
}
