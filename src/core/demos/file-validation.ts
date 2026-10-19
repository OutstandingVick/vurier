const allowed = new Set([
  "application/pdf",
  "text/plain",
  "application/zip",
  "image/png",
  "image/jpeg",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);
export function validateDemoFile(file: Pick<File, "size" | "type">) {
  if (file.size > 15 * 1024 * 1024) return "Keep demo files under 15 MB.";
  if (!allowed.has(file.type))
    return "Upload a PDF, DOCX, text, ZIP, PNG, or JPEG file.";
  return null;
}
