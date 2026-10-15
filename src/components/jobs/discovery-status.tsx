import Link from "next/link";
import { Cable, CircleAlert, FileInput, LockKeyhole } from "lucide-react";

export function DisconnectedState({ configured }: { configured: boolean }) {
  return <section className="rounded-2xl border border-dashed bg-surface/50 p-6 sm:p-8"><div className="max-w-2xl"><span className="grid size-11 place-items-center rounded-2xl bg-surface-muted text-muted"><Cable className="size-5" aria-hidden="true" /></span><h2 className="mt-5 text-xl font-semibold tracking-[-0.025em]">Authorized discovery is disconnected</h2><p className="mt-2 text-pretty text-sm leading-6 text-muted">{configured ? "Connect your Upwork account to retrieve jobs through the official integration, or import an opportunity from details you already have." : "Official API credentials are not configured for this deployment. You can still import opportunities from details you provide."}</p><div className="mt-5 flex flex-wrap gap-3">{configured ? <a className="button-primary" href="/api/integrations/upwork/connect">Connect Upwork</a> : null}<Link className="button-secondary" href="/dashboard/discover/import"><FileInput className="size-4" aria-hidden="true" />Import manually</Link></div></div></section>;
}

export function PermissionDeniedState() {
  return <div className="rounded-2xl bg-danger-soft p-5 text-danger" role="alert"><div className="flex gap-3"><LockKeyhole className="mt-0.5 size-5 shrink-0" aria-hidden="true" /><div><h2 className="font-semibold">Upwork permission is unavailable</h2><p className="mt-1 text-sm leading-6">Reconnect with the required job-search permission, or use manual import while access is unavailable.</p></div></div></div>;
}

export function DiscoveryError({ message }: { message: string }) {
  return <div className="rounded-2xl bg-danger-soft p-5 text-danger" role="alert"><div className="flex gap-3"><CircleAlert className="mt-0.5 size-5 shrink-0" aria-hidden="true" /><div><h2 className="font-semibold">Unable to load opportunities</h2><p className="mt-1 text-sm leading-6">{message} Refresh the page or adjust the filters and try again.</p></div></div></div>;
}
