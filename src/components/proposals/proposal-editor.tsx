"use client";
import { useActionState, useState } from "react";
import { Check, Copy, LoaderCircle, Save, WandSparkles } from "lucide-react";
import {
  rewriteDraft,
  saveManualDraft,
} from "@/app/dashboard/proposals/actions";
export function ProposalEditor({
  proposalId,
  initialText,
}: {
  proposalId: string;
  initialText: string;
}) {
  const [text, setText] = useState(initialText);
  const [copied, setCopied] = useState(false);
  const [saveState, saveAction, saving] = useActionState(saveManualDraft, {});
  const [rewriteState, rewriteAction, rewriting] = useActionState(
    rewriteDraft,
    {},
  );
  async function copy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }
  return (
    <section
      className="rounded-2xl bg-surface p-5 shadow-card sm:p-6"
      aria-labelledby="editor-heading"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="editor-heading" className="text-lg font-semibold">
            Proposal editor
          </h2>
          <p className="mt-1 text-sm text-muted">
            Edit freely. Saving creates a new version.
          </p>
        </div>
        <button className="button-secondary" type="button" onClick={copy}>
          {copied ? (
            <Check className="size-4" aria-hidden="true" />
          ) : (
            <Copy className="size-4" aria-hidden="true" />
          )}
          {copied ? "Copied" : "Copy proposal"}
        </button>
      </div>
      <form action={saveAction} className="mt-5">
        <input type="hidden" name="proposalId" value={proposalId} />
        <label className="sr-only" htmlFor="coverLetter">
          Proposal text
        </label>
        <textarea
          id="coverLetter"
          className="field min-h-96 resize-y leading-7"
          name="coverLetter"
          value={text}
          onChange={(event) => setText(event.target.value)}
        />
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs text-muted">
            {text.length.toLocaleString()} characters
          </span>
          <button className="button-primary" disabled={saving} type="submit">
            {saving ? (
              <LoaderCircle
                className="size-4 animate-spin motion-reduce:animate-none"
                aria-hidden="true"
              />
            ) : (
              <Save className="size-4" aria-hidden="true" />
            )}
            {saving ? "Saving…" : "Save new version"}
          </button>
        </div>
        {saveState.error ? (
          <p className="mt-3 text-sm text-danger" role="alert">
            {saveState.error}
          </p>
        ) : null}
        {saveState.message ? (
          <p className="mt-3 text-sm" role="status">
            {saveState.message}
          </p>
        ) : null}
      </form>
      <form action={rewriteAction} className="mt-6 border-t pt-5">
        <input type="hidden" name="proposalId" value={proposalId} />
        <h3 className="font-semibold">AI rewrite</h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="space-y-2 text-sm font-medium">
            Tone
            <select className="field" name="tone">
              <option value="conversational">Conversational</option>
              <option value="confident">Confident</option>
              <option value="technical">Technical</option>
              <option value="concise">Concise</option>
            </select>
          </label>
          <label className="space-y-2 text-sm font-medium">
            Length
            <select className="field" name="length">
              <option value="short">Short</option>
              <option value="standard">Standard</option>
              <option value="detailed">Detailed</option>
            </select>
          </label>
        </div>
        <button
          className="button-secondary mt-4"
          disabled={rewriting}
          type="submit"
        >
          {rewriting ? (
            <LoaderCircle
              className="size-4 animate-spin motion-reduce:animate-none"
              aria-hidden="true"
            />
          ) : (
            <WandSparkles className="size-4" aria-hidden="true" />
          )}
          {rewriting ? "Rewriting…" : "Rewrite and save"}
        </button>
        {rewriteState.error ? (
          <p className="mt-3 text-sm text-danger" role="alert">
            {rewriteState.error}
          </p>
        ) : null}
        {rewriteState.message ? (
          <p className="mt-3 text-sm" role="status">
            {rewriteState.message}
          </p>
        ) : null}
      </form>
    </section>
  );
}
