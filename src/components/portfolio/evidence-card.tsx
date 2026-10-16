"use client";

import Link from "next/link";
import { CheckCircle2, FileText, Pencil, Trash2 } from "lucide-react";
import { deletePortfolioItem } from "@/app/dashboard/portfolio/actions";
import type { PortfolioEvidence } from "@/core/proposals/types";
export function EvidenceCard({ item }: { item: PortfolioEvidence }) {
  return (
    <article className="rounded-2xl border bg-surface p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wide text-muted">
            {item.kind.replace("_", " ")}
          </span>
          <h2 className="mt-1 font-semibold">{item.title}</h2>
        </div>
        {item.verified ? (
          <span className="inline-flex items-center gap-1 text-xs font-semibold">
            <CheckCircle2 className="size-4" aria-hidden="true" />
            Verified
          </span>
        ) : (
          <span className="text-xs text-muted">Unverified</span>
        )}
      </div>
      <p className="mt-2 text-sm leading-6 text-muted">
        {item.description || "No description provided."}
      </p>
      {item.skills.length ? (
        <ul className="mt-3 flex flex-wrap gap-2">
          {item.skills.map((skill) => (
            <li
              className="rounded-lg bg-surface-muted px-2 py-1 text-xs"
              key={skill}
            >
              {skill}
            </li>
          ))}
        </ul>
      ) : null}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        {item.filePath ? (
          <span className="inline-flex items-center gap-1 text-xs text-muted">
            <FileText className="size-4" aria-hidden="true" />
            Private file attached
          </span>
        ) : (
          <span />
        )}
        <div className="flex gap-2">
          <Link
            className="inline-flex min-h-10 items-center gap-2 rounded-xl px-3 text-sm font-medium hover:bg-surface-muted"
            href={`/dashboard/portfolio?edit=${item.id}`}
          >
            <Pencil className="size-4" aria-hidden="true" />
            Edit
          </Link>
          <form
            action={deletePortfolioItem}
            onSubmit={(event) => {
              if (!window.confirm(`Delete “${item.title}”? This cannot be undone.`)) event.preventDefault();
            }}
          >
            <input type="hidden" name="id" value={item.id} />
            <button
              className="inline-flex min-h-10 items-center gap-2 rounded-xl px-3 text-sm font-medium text-danger outline-none hover:bg-danger-soft focus-visible:ring-2 focus-visible:ring-danger"
              type="submit"
            >
              <Trash2 className="size-4" aria-hidden="true" />
              Delete
            </button>
          </form>
        </div>
      </div>
    </article>
  );
}
