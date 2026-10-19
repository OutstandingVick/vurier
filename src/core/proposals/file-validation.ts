const ALLOWED = new Set([
  "application/pdf",
  "text/plain",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);
export function validateEvidenceFile(file: { size: number; type: string }) {
  if (file.size > 10 * 1024 * 1024) return "Choose a file smaller than 10 MB.";
  if (!ALLOWED.has(file.type)) return "Choose a PDF, DOCX, or plain-text file.";
  return null;
}
