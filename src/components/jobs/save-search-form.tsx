"use client";

import { useActionState } from "react";
import { Save } from "lucide-react";
import { saveSearch } from "@/app/dashboard/discover/saved-search-actions";
import type { JobSearchFilters } from "@/core/jobs/types";

export function SaveSearchForm({ filters }: { filters: JobSearchFilters }) {
  const [state, action, pending] = useActionState(saveSearch, {});
  return <form action={action} className="flex flex-col gap-2 sm:flex-row"><label className="sr-only" htmlFor="search-name">Saved search name</label><input className="field sm:w-52" id="search-name" name="name" placeholder="e.g. React fintech" required /><input type="hidden" name="filters" value={JSON.stringify(filters)} /><button className="button-secondary" type="submit" disabled={pending}><Save className="size-4" aria-hidden="true" />{pending ? "Saving…" : "Save search"}</button>{state.error ? <span className="self-center text-sm text-danger" role="alert">{state.error}</span> : null}{state.message ? <span className="self-center text-sm text-muted" role="status">{state.message}</span> : null}</form>;
}
