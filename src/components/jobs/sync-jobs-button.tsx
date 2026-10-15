"use client";

import { useState, useTransition } from "react";
import { RefreshCw } from "lucide-react";
import { syncAuthorizedJobs } from "@/app/dashboard/discover/actions";
import type { JobSearchFilters } from "@/core/jobs/types";

export function SyncJobsButton({ filters }: { filters: JobSearchFilters }) {
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState("");
  return <div><button className="button-secondary" type="button" disabled={pending} onClick={() => startTransition(async () => { const result = await syncAuthorizedJobs(filters); setStatus(result.error ?? result.message ?? ""); })}><RefreshCw className={`size-4 ${pending ? "animate-spin motion-reduce:animate-none" : ""}`} aria-hidden="true" />{pending ? "Retrieving…" : "Retrieve latest"}</button><span className="sr-only" role="status">{status}</span></div>;
}
