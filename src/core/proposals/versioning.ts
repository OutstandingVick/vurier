export function nextVersionNumber(versions: Array<{ version_number: number }>) {
  return Math.max(0, ...versions.map((item) => item.version_number)) + 1;
}
