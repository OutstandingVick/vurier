export function batchProgress(
  total: number,
  completed: number,
  failed: number,
) {
  if (total <= 0) return 0;
  return Math.min(100, Math.round(((completed + failed) / total) * 100));
}
