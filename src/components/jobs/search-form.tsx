/* eslint-disable @next/next/no-html-link-for-pages */
import { Search, SlidersHorizontal } from "lucide-react";
import { JOB_CATEGORIES, type JobSearchFilters } from "@/core/jobs/types";

export function JobSearchForm({ filters }: { filters: JobSearchFilters }) {
  return (
    <form
      className="rounded-2xl bg-surface p-4 shadow-card sm:p-5"
      method="get"
    >
      <div className="flex flex-col gap-3 sm:flex-row">
        <label className="relative flex-1">
          <span className="sr-only">Search opportunities</span>
          <Search
            className="pointer-events-none absolute start-3.5 top-1/2 size-4 -translate-y-1/2 text-muted"
            aria-hidden="true"
          />
          <input
            className="field ps-10"
            type="search"
            name="query"
            defaultValue={filters.query}
            placeholder="Search React, fintech, technical writing…"
          />
        </label>
        <button className="button-primary sm:min-w-28" type="submit">
          Search
        </button>
      </div>
      <details className="mt-4 group">
        <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-xl text-sm font-semibold text-muted outline-none focus-visible:ring-2 focus-visible:ring-accent-strong">
          <SlidersHorizontal className="size-4" aria-hidden="true" />
          Filters
          <span className="ms-auto text-xs font-medium group-open:hidden">
            Show
          </span>
          <span className="ms-auto hidden text-xs font-medium group-open:inline">
            Hide
          </span>
        </summary>
        <div className="grid gap-4 border-t pt-4 sm:grid-cols-2 xl:grid-cols-4">
          <FilterSelect
            label="Category"
            name="category"
            value={filters.category ?? ""}
            options={[
              { value: "", label: "All categories" },
              ...JOB_CATEGORIES.map((value) => ({ value, label: value })),
            ]}
          />
          <FilterSelect
            label="Contract type"
            name="jobType"
            value={filters.jobType ?? "all"}
            options={[
              { value: "all", label: "Hourly and fixed" },
              { value: "hourly", label: "Hourly" },
              { value: "fixed", label: "Fixed-price" },
            ]}
          />
          <FilterSelect
            label="Experience"
            name="experienceLevel"
            value={filters.experienceLevel ?? "all"}
            options={[
              { value: "all", label: "All levels" },
              { value: "entry", label: "Entry" },
              { value: "intermediate", label: "Intermediate" },
              { value: "expert", label: "Expert" },
            ]}
          />
          <FilterSelect
            label="Client payment"
            name="paymentVerified"
            value={filters.paymentVerified ?? "all"}
            options={[
              { value: "all", label: "Any verification" },
              { value: "verified", label: "Payment verified" },
              { value: "unverified", label: "Payment unverified" },
            ]}
          />
          <FilterSelect
            label="Proposals"
            name="proposalCount"
            value={filters.proposalCount ?? "all"}
            options={[
              { value: "all", label: "Any competition" },
              { value: "less_than_5", label: "Fewer than 5" },
              { value: "5_to_10", label: "5–10" },
              { value: "10_to_15", label: "10–15" },
              { value: "15_to_20", label: "15–20" },
              { value: "20_to_50", label: "20–50" },
              { value: "50_plus", label: "50+" },
            ]}
          />
          <label className="space-y-2 text-sm font-medium">
            Minimum budget
            <input
              className="field"
              type="number"
              min="0"
              step="25"
              name="minimumBudget"
              defaultValue={filters.minimumBudget}
              placeholder="500"
            />
          </label>
          <FilterSelect
            label="Posting age"
            name="maximumAgeHours"
            value={
              filters.maximumAgeHours ? String(filters.maximumAgeHours) : ""
            }
            options={[
              { value: "", label: "Any time" },
              { value: "24", label: "Past 24 hours" },
              { value: "72", label: "Past 3 days" },
              { value: "168", label: "Past 7 days" },
            ]}
          />
          <FilterSelect
            label="Sort by"
            name="sort"
            value={filters.sort ?? "newest"}
            options={[
              { value: "newest", label: "Newest" },
              { value: "budget_high", label: "Highest budget" },
              { value: "competition_low", label: "Lowest competition" },
            ]}
          />
          <div className="flex items-end gap-2 sm:col-span-2 xl:col-span-4">
            <button className="button-primary" type="submit">
              Apply filters
            </button>
            <a className="button-secondary" href="/dashboard/discover">
              Clear filters
            </a>
          </div>
        </div>
      </details>
    </form>
  );
}

function FilterSelect({
  label,
  name,
  value,
  options,
}: {
  label: string;
  name: string;
  value: string;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <label className="space-y-2 text-sm font-medium">
      {label}
      <select className="field" name={name} defaultValue={value}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
