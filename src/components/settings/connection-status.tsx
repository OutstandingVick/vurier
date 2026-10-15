import { CheckCircle2, CircleOff } from "lucide-react";

export function ConnectionStatus({ label, configured, description }: { label: string; configured: boolean; description: string }) {
  return <div className="flex items-start gap-3 rounded-xl border p-4"><span className={`mt-0.5 ${configured ? "text-accent-strong" : "text-muted"}`}>{configured ? <CheckCircle2 className="size-5" aria-hidden="true" /> : <CircleOff className="size-5" aria-hidden="true" />}</span><div><div className="flex flex-wrap items-center gap-2"><p className="text-sm font-semibold">{label}</p><span className="rounded-full bg-surface-muted px-2 py-0.5 text-xs font-medium text-muted">{configured ? "Configured" : "Not configured"}</span></div><p className="mt-1 text-sm leading-6 text-muted">{description}</p></div></div>;
}
