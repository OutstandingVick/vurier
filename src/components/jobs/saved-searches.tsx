import Link from "next/link";
import { Trash2 } from "lucide-react";
import { deleteSavedSearch } from "@/app/dashboard/discover/saved-search-actions";

type SavedSearch = {
  id: string;
  name: string;
  filters: Record<string, unknown>;
};

export function SavedSearches({ searches }: { searches: SavedSearch[] }) {
  if (!searches.length) return null;
  return (
    <section
      className="mt-4 flex flex-wrap items-center gap-2"
      aria-label="Saved searches"
    >
      <span className="me-1 text-xs font-semibold text-muted">Saved</span>
      {searches.map((search) => {
        const params = new URLSearchParams();
        Object.entries(search.filters).forEach(([key, value]) => {
          if (
            value !== undefined &&
            value !== null &&
            value !== "" &&
            value !== "all"
          )
            params.set(key, String(value));
        });
        const remove = async () => {
          "use server";
          await deleteSavedSearch(search.id);
        };
        return (
          <span
            className="inline-flex items-center rounded-xl border bg-surface"
            key={search.id}
          >
            <Link
              className="min-h-10 px-3 py-2.5 text-sm font-medium"
              href={`?${params}`}
            >
              {search.name}
            </Link>
            <form action={remove}>
              <button
                className="grid size-10 place-items-center text-muted outline-none hover:text-danger focus-visible:ring-2 focus-visible:ring-accent-strong"
                type="submit"
                aria-label={`Delete saved search ${search.name}`}
              >
                <Trash2 className="size-4" aria-hidden="true" />
              </button>
            </form>
          </span>
        );
      })}
    </section>
  );
}
