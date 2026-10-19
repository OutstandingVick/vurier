export function firstTwoLines(text: string): [string, string] {
  const lines = text
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
  return [lines[0] ?? "", lines[1] ?? ""];
}
export function endsWithQuestion(text: string) {
  return /\?\s*$/.test(text);
}
