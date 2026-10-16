import { PageShell } from "@/components/dashboard/page-shell";
import { EmptyState } from "@/components/dashboard/empty-state";
import { EvidenceCard } from "@/components/portfolio/evidence-card";
import { PortfolioForm } from "@/components/portfolio/portfolio-form";
import { FolderKanban } from "lucide-react";
import { searchPortfolio } from "@/core/proposals/search";
import type { PortfolioEvidence, PortfolioKind } from "@/core/proposals/types";
import { hasSupabaseEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
export const instant = false;
export default async function PortfolioPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; kind?: string; edit?: string }>;
}) {
  const filters = await searchParams;
  let items: PortfolioEvidence[] = [];
  if (hasSupabaseEnv()) {
    const client = await createClient();
    const {
      data: { user },
    } = await client.auth.getUser();
    if (user) {
      const { data } = await client
        .from("portfolio_items")
        .select(
          "id,title,description,kind,skills,achievements,project_url,repository_url,file_path,verified",
        )
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });
      items = (data ?? []).map((item) => ({
        id: item.id,
        title: item.title,
        description: item.description ?? "",
        kind: item.kind as PortfolioKind,
        skills: item.skills ?? [],
        achievements: item.achievements ?? [],
        projectUrl: item.project_url,
        repositoryUrl: item.repository_url,
        filePath: item.file_path,
        verified: item.verified,
      }));
    }
  }
  const visible = searchPortfolio(items, filters.q ?? "", filters.kind);
  const editing = items.find((item) => item.id === filters.edit);
  return (
    <PageShell
      title="Portfolio"
      description="Verified evidence for personalized proposals"
    >
      <div className="space-y-6">
        <PortfolioForm initial={editing} />
        <section className="rounded-2xl bg-surface p-4 shadow-card">
          <form className="grid gap-3 sm:grid-cols-[1fr_14rem_auto]">
            <label className="space-y-2 text-sm font-medium">
              Search evidence
              <input
                className="field"
                name="q"
                defaultValue={filters.q}
                placeholder="Skill, project, or achievement"
              />
            </label>
            <label className="space-y-2 text-sm font-medium">
              Category
              <select
                className="field"
                name="kind"
                defaultValue={filters.kind ?? "all"}
              >
                <option value="all">All categories</option>
                <option value="project">Projects</option>
                <option value="writing_sample">Writing samples</option>
                <option value="achievement">Achievements</option>
                <option value="experience">Experience</option>
                <option value="resume">Resumes</option>
                <option value="link">Links</option>
              </select>
            </label>
            <button className="button-secondary self-end" type="submit">
              Search
            </button>
          </form>
        </section>
        {visible.length ? (
          <section
            className="grid gap-4 lg:grid-cols-2"
            aria-label="Portfolio evidence"
          >
            {visible.map((item) => (
              <EvidenceCard item={item} key={item.id} />
            ))}
          </section>
        ) : (
          <EmptyState
            icon={FolderKanban}
            title="No portfolio evidence found"
            description={
              items.length
                ? "Adjust your search or category filter."
                : "Add verified projects, samples, achievements, or a resume to ground proposal writing."
            }
          />
        )}
      </div>
    </PageShell>
  );
}
