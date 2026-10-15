import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { JobSearchFilters } from "@/core/jobs/types";
import { searchParamsFor } from "@/core/jobs/search-params";

export function Pagination({ filters, count }: { filters: JobSearchFilters & { page: number; pageSize: number }; count: number }) {
  const pages = Math.max(1, Math.ceil(count / filters.pageSize));
  if (pages <= 1) return null;
  return <nav className="mt-6 flex items-center justify-between gap-4" aria-label="Job feed pages"><Link className={`button-secondary ${filters.page <= 1 ? "pointer-events-none opacity-50" : ""}`} aria-disabled={filters.page <= 1} href={`?${searchParamsFor(filters, { page: Math.max(1, filters.page - 1) })}`}><ChevronLeft className="size-4" aria-hidden="true" />Previous</Link><span className="text-sm font-medium text-muted">Page <span className="tabular-nums text-foreground">{filters.page}</span> of <span className="tabular-nums text-foreground">{pages}</span></span><Link className={`button-secondary ${filters.page >= pages ? "pointer-events-none opacity-50" : ""}`} aria-disabled={filters.page >= pages} href={`?${searchParamsFor(filters, { page: Math.min(pages, filters.page + 1) })}`}>Next<ChevronRight className="size-4" aria-hidden="true" /></Link></nav>;
}
