"use client";

import { useActionState } from "react";
import { LoaderCircle, Save } from "lucide-react";
import { saveSettings } from "@/app/dashboard/settings/actions";

type InitialSettings = {
  displayName: string;
  headline: string;
  bio: string;
  verifiedSkills: string[];
  categories: string[];
  minimumFixedBudget: number | null;
  minimumHourlyRate: number | null;
  maximumConnects: number | null;
  model: string;
  reasoning: string;
  scoringWeights: Record<string, number>;
  dailyAnalysisLimit: number;
  monthlyAiBudgetUsd: number;
  dailyConnectsLimit: number;
  monthlyConnectsLimit: number;
  connectsUsdRate: number;
  monthlyResearchBudgetUsd: number;
  feedbackMaxAdjustment: number;
};
const categoryOptions = [
  "Frontend Development",
  "Web3 & Fintech",
  "Technical Writing",
  "AI Applications",
  "Product Engineering",
];

export function SettingsForm({ initial }: { initial: InitialSettings }) {
  const [state, action, pending] = useActionState(saveSettings, {});
  return (
    <form action={action} className="space-y-6">
      <section className="rounded-2xl bg-surface p-5 shadow-card sm:p-6">
        <h2 className="text-lg font-semibold">Connects guardrails</h2>
        <p className="mt-1 text-sm text-muted">
          Approved submissions are blocked before they exceed either limit.
        </p>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <NumberField
            name="dailyConnectsLimit"
            label="Daily Connects limit"
            value={initial.dailyConnectsLimit}
          />
          <NumberField
            name="monthlyConnectsLimit"
            label="Monthly Connects limit"
            value={initial.monthlyConnectsLimit}
          />
          <NumberField
            name="connectsUsdRate"
            label="Estimated USD per Connect"
            value={initial.connectsUsdRate}
            step="0.0001"
          />
        </div>
      </section>
      <section className="rounded-2xl bg-surface p-5 shadow-card sm:p-6">
        <h2 className="text-lg font-semibold tracking-[-0.02em]">Profile</h2>
        <p className="mt-1 text-sm text-muted">
          Only verified skills and saved portfolio evidence are used for
          matching.
        </p>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <label className="space-y-2 text-sm font-medium">
            Display name
            <input
              className="field"
              name="displayName"
              defaultValue={initial.displayName}
              autoComplete="name"
            />
          </label>
          <label className="space-y-2 text-sm font-medium">
            Professional headline
            <input
              className="field"
              name="headline"
              defaultValue={initial.headline}
            />
          </label>
          <label className="space-y-2 text-sm font-medium sm:col-span-2">
            Verified skills{" "}
            <span className="font-normal text-muted">(comma-separated)</span>
            <input
              className="field"
              name="verifiedSkills"
              defaultValue={initial.verifiedSkills.join(", ")}
              placeholder="React, Next.js, TypeScript"
            />
          </label>
          <label className="space-y-2 text-sm font-medium sm:col-span-2">
            Professional summary
            <textarea
              className="field min-h-32 resize-y"
              name="bio"
              defaultValue={initial.bio}
            />
          </label>
        </div>
      </section>
      <section className="rounded-2xl bg-surface p-5 shadow-card sm:p-6">
        <h2 className="text-lg font-semibold">Opportunity preferences</h2>
        <fieldset className="mt-5">
          <legend className="text-sm font-medium">Preferred categories</legend>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {categoryOptions.map((category) => (
              <label
                key={category}
                className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border px-3 text-sm"
              >
                <input
                  className="size-4 accent-[var(--accent-strong)]"
                  type="checkbox"
                  name="categories"
                  value={category}
                  defaultChecked={initial.categories.includes(category)}
                />
                {category}
              </label>
            ))}
          </div>
        </fieldset>
        <div className="mt-5 grid gap-5 sm:grid-cols-3">
          <NumberField
            name="minimumFixedBudget"
            label="Minimum fixed budget"
            value={initial.minimumFixedBudget}
          />
          <NumberField
            name="minimumHourlyRate"
            label="Minimum hourly rate"
            value={initial.minimumHourlyRate}
          />
          <NumberField
            name="maximumConnects"
            label="Maximum Connects per job"
            value={initial.maximumConnects}
          />
        </div>
      </section>
      <section className="rounded-2xl bg-surface p-5 shadow-card sm:p-6">
        <h2 className="text-lg font-semibold">Scoring weights</h2>
        <p className="mt-1 text-sm text-muted">
          Weights must total 100%. Missing evidence is excluded and does not
          reduce the score.
        </p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries({
            skillMatch: "Skill match",
            portfolioRelevance: "Portfolio relevance",
            budgetValue: "Budget and value",
            competition: "Competition",
            clientCredibility: "Client credibility",
            recency: "Posting recency",
          }).map(([name, label]) => (
            <NumberField
              key={name}
              name={name}
              label={`${label} (%)`}
              value={initial.scoringWeights[name]}
            />
          ))}
        </div>
      </section>
      <section className="rounded-2xl bg-surface p-5 shadow-card sm:p-6">
        <h2 className="text-lg font-semibold">AI usage controls</h2>
        <p className="mt-1 text-sm text-muted">
          Hard limits prevent unexpected analysis usage. Costs shown in Vurier
          are estimates.
        </p>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <NumberField
            name="dailyAnalysisLimit"
            label="Daily analysis limit"
            value={initial.dailyAnalysisLimit}
          />
          <NumberField
            name="monthlyAiBudgetUsd"
            label="Monthly estimated budget (USD)"
            value={initial.monthlyAiBudgetUsd}
            step="0.01"
          />
          <NumberField
            name="monthlyResearchBudgetUsd"
            label="Monthly research budget (USD)"
            value={initial.monthlyResearchBudgetUsd}
            step="0.01"
          />
          <NumberField
            name="feedbackMaxAdjustment"
            label="Maximum feedback adjustment (points)"
            value={initial.feedbackMaxAdjustment}
            step="0.5"
          />
        </div>
        <input type="hidden" name="model" value={initial.model} />
        <input type="hidden" name="reasoning" value={initial.reasoning} />
      </section>
      <section className="rounded-2xl border border-accent-strong/30 bg-accent/10 p-5 sm:p-6">
        <h2 className="text-lg font-semibold">Approval guardrails</h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          Proposal generation, submission, and Connects spending are not part of
          this phase. Submission and spending always require explicit approval.
        </p>
      </section>
      {state.error ? (
        <p
          className="rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger"
          role="alert"
        >
          {state.error}
        </p>
      ) : null}
      {state.message ? (
        <p className="rounded-xl bg-accent/20 px-4 py-3 text-sm" role="status">
          {state.message}
        </p>
      ) : null}
      <div className="flex justify-end">
        <button
          className="button-primary min-w-36"
          type="submit"
          disabled={pending}
        >
          {pending ? (
            <LoaderCircle
              className="size-4 animate-spin motion-reduce:animate-none"
              aria-hidden="true"
            />
          ) : (
            <Save className="size-4" aria-hidden="true" />
          )}
          {pending ? "Saving…" : "Save settings"}
        </button>
      </div>
    </form>
  );
}
function NumberField({
  name,
  label,
  value,
  step = "1",
}: {
  name: string;
  label: string;
  value: number | null;
  step?: string;
}) {
  return (
    <label className="space-y-2 text-sm font-medium">
      {label}
      <input
        className="field"
        name={name}
        type="number"
        min="0"
        step={step}
        inputMode="decimal"
        defaultValue={value ?? ""}
      />
    </label>
  );
}
