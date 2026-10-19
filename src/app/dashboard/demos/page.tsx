import Link from "next/link";
import { FlaskConical } from "lucide-react";
import { EmptyState } from "@/components/dashboard/empty-state";
import { PageShell } from "@/components/dashboard/page-shell";
import { StrategyCard } from "@/components/demos/strategy-card";
import { hasSupabaseEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
export const instant = false;
export default async function DemosPage({
  searchParams,
}: {
  searchParams: Promise<{ decision?: string; q?: string }>;
}) {
  const filters = await searchParams;
  let strategies: Array<Record<string, unknown>> = [];
  if (hasSupabaseEnv()) {
    const client = await createClient();
    const {
      data: { user },
    } = await client.auth.getUser();
    if (user) {
      let query = client
        .from("demo_strategies")
        .select("*,jobs(title)")
        .eq("user_id", user.id)
        .neq("status", "archived")
        .order("updated_at", { ascending: false });
      if (["build", "reuse", "skip"].includes(filters.decision ?? ""))
        query = query.eq("decision", filters.decision);
      const { data } = await query;
      strategies = (data ?? []).filter(
        (item) =>
          !filters.q ||
          String((item.jobs as { title?: string } | null)?.title ?? "")
            .toLowerCase()
            .includes(filters.q.toLowerCase()),
      );
    }
  }
  return (
    <PageShell
      title="Demo intelligence"
      description="Proof-of-work strategy, briefs, and approved assets"
    >
      <div className="space-y-6">
        <section className="rounded-2xl bg-surface p-4 shadow-card">
          <form className="grid gap-3 sm:grid-cols-[1fr_14rem_auto]">
            <label className="space-y-2 text-sm font-medium">
              Search strategies
              <input
                className="field"
                name="q"
                defaultValue={filters.q}
                placeholder="Opportunity title"
              />
            </label>
            <label className="space-y-2 text-sm font-medium">
              Recommendation
              <select
                className="field"
                name="decision"
                defaultValue={filters.decision ?? "all"}
              >
                <option value="all">All recommendations</option>
                <option value="build">Build</option>
                <option value="reuse">Reuse</option>
                <option value="skip">Skip</option>
              </select>
            </label>
            <button className="button-secondary self-end" type="submit">
              Filter
            </button>
          </form>
        </section>
        {strategies.length ? (
          <section
            className="grid gap-4 lg:grid-cols-2"
            aria-label="Proof-of-work strategies"
          >
            {strategies.map((strategy) => (
              <StrategyCard key={String(strategy.id)} strategy={strategy} />
            ))}
          </section>
        ) : (
          <EmptyState
            icon={FlaskConical}
            title="No proof-of-work strategies yet"
            description="Generate a strategy from an analyzed opportunity. Vurier will evaluate whether building custom work is worth the effort."
            action={
              <Link
                className="button-secondary"
                href="/dashboard/opportunities"
              >
                Review opportunities
              </Link>
            }
          />
        )}
      </div>
    </PageShell>
  );
}
