"use client";
import { useActionState } from "react";
import { LoaderCircle, Save } from "lucide-react";
import { savePortfolioItem } from "@/app/dashboard/portfolio/actions";
import type { PortfolioEvidence } from "@/core/proposals/types";
export function PortfolioForm({ initial }: { initial?: PortfolioEvidence }) {
  const [state, action, pending] = useActionState(savePortfolioItem, {});
  return (
    <form
      action={action}
      className="rounded-2xl bg-surface p-5 shadow-card sm:p-6"
    >
      {initial ? <input type="hidden" name="id" value={initial.id} /> : null}
      <h2 className="text-lg font-semibold">
        {initial ? "Edit portfolio evidence" : "Add portfolio evidence"}
      </h2>
      <p className="mt-1 text-sm text-muted">
        Only mark facts as verified when you can substantiate them.
      </p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="space-y-2 text-sm font-medium">
          Title
          <input
            className="field"
            name="title"
            defaultValue={initial?.title}
            required
          />
        </label>
        <label className="space-y-2 text-sm font-medium">
          Category
          <select
            className="field"
            name="kind"
            defaultValue={initial?.kind ?? "project"}
          >
            <option value="project">Project</option>
            <option value="writing_sample">Writing sample</option>
            <option value="achievement">Achievement</option>
            <option value="experience">Experience</option>
            <option value="resume">Resume</option>
            <option value="link">Portfolio link</option>
          </select>
        </label>
        <label className="space-y-2 text-sm font-medium sm:col-span-2">
          Description
          <textarea
            className="field min-h-28 resize-y"
            name="description"
            defaultValue={initial?.description}
          />
        </label>
        <label className="space-y-2 text-sm font-medium">
          Skills{" "}
          <span className="font-normal text-muted">(comma-separated)</span>
          <input
            className="field"
            name="skills"
            defaultValue={initial?.skills.join(", ")}
            placeholder="React, Next.js, TypeScript"
          />
        </label>
        <label className="space-y-2 text-sm font-medium">
          Evidence file{" "}
          <span className="font-normal text-muted">
            (PDF, DOCX, or text; 10 MB)
          </span>
          <input
            className="field file:me-3"
            name="file"
            type="file"
            accept=".pdf,.docx,.txt"
          />
        </label>
        <label className="space-y-2 text-sm font-medium">
          Project or sample URL
          <input
            className="field"
            name="projectUrl"
            defaultValue={initial?.projectUrl ?? ""}
            type="url"
            placeholder="https://"
          />
        </label>
        <label className="space-y-2 text-sm font-medium">
          Repository URL
          <input
            className="field"
            name="repositoryUrl"
            defaultValue={initial?.repositoryUrl ?? ""}
            type="url"
            placeholder="https://github.com/"
          />
        </label>
        <label className="space-y-2 text-sm font-medium sm:col-span-2">
          Verified achievements{" "}
          <span className="font-normal text-muted">(one per line)</span>
          <textarea
            className="field min-h-24 resize-y"
            name="achievements"
            defaultValue={initial?.achievements.join("\n")}
          />
        </label>
        <label className="flex min-h-11 items-center gap-3 rounded-xl border px-3 text-sm font-medium sm:col-span-2">
          <input
            className="size-4 accent-[var(--accent-strong)]"
            type="checkbox"
            name="verified"
            defaultChecked={initial?.verified}
          />
          I confirm this evidence is accurate and can be substantiated
        </label>
      </div>
      {state.error ? (
        <p
          className="mt-4 rounded-xl bg-danger-soft p-3 text-sm text-danger"
          role="alert"
        >
          {state.error}
        </p>
      ) : null}
      {state.message ? (
        <p className="mt-4 rounded-xl bg-accent/20 p-3 text-sm" role="status">
          {state.message}
        </p>
      ) : null}
      <button className="button-primary mt-5" disabled={pending} type="submit">
        {pending ? (
          <LoaderCircle
            className="size-4 animate-spin motion-reduce:animate-none"
            aria-hidden="true"
          />
        ) : (
          <Save className="size-4" aria-hidden="true" />
        )}
        {pending ? "Saving…" : initial ? "Save changes" : "Save evidence"}
      </button>
    </form>
  );
}
