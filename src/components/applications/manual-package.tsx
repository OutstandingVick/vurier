"use client";
import { useState } from "react";
import { Check, Copy, ExternalLink } from "lucide-react";
import type { ApplicationPackage } from "@/core/applications/types";
export function ManualPackage({
  value,
  enabled,
}: {
  value: ApplicationPackage;
  enabled: boolean;
}) {
  const [copied, setCopied] = useState(false);
  if (!enabled) return null;
  const copy = async () => {
    await navigator.clipboard.writeText(
      `${value.coverLetter}\n\nBid: ${value.bidAmount ?? "Unavailable"} ${value.currency}\nConnects: ${value.connectsCost ?? "Unavailable"}\nBoost: ${value.boostConnects}`,
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <section className="rounded-2xl border bg-surface p-5">
      <h2 className="font-semibold">Manual application package</h2>
      <p className="mt-2 text-sm text-muted">
        Upwork submission access or required provider fields are unavailable.
        Copy these reviewed details and apply yourself; Vurier will not claim
        submission occurred.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button className="button-secondary" onClick={copy} type="button">
          {copied ? (
            <Check className="size-4" aria-hidden="true" />
          ) : (
            <Copy className="size-4" aria-hidden="true" />
          )}
          {copied ? "Copied" : "Copy package"}
        </button>
        {value.directUrl ? (
          <a
            className="button-primary"
            href={value.directUrl}
            target="_blank"
            rel="noreferrer"
          >
            Open Upwork application{" "}
            <ExternalLink className="size-4" aria-hidden="true" />
          </a>
        ) : null}
      </div>
    </section>
  );
}
