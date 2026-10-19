"use client";
import { useActionState, useState } from "react";
import { saveDemoDraft } from "@/app/dashboard/demos/actions";
export function DemoEditor({
  strategyId,
  brief,
  prompt,
}: {
  strategyId: string;
  brief: unknown;
  prompt: string;
}) {
  const [state, action, pending] = useActionState(saveDemoDraft, {});
  const [copied, setCopied] = useState(false);
  const [promptValue, setPromptValue] = useState(prompt);
  async function copyPrompt() {
    await navigator.clipboard.writeText(promptValue);
    setCopied(true);
  }
  return (
    <section className="rounded-2xl bg-surface p-5 shadow-card">
      <h2 className="text-lg font-semibold">
        Editable brief and implementation prompt
      </h2>
      <p className="mt-1 text-sm text-muted">
        Review every detail before using this prompt in Claude or Codex.
      </p>
      <form action={action} className="mt-5 space-y-4">
        <input type="hidden" name="strategyId" value={strategyId} />
        <label className="block space-y-2 text-sm font-medium">
          Implementation brief (JSON)
          <textarea
            className="field min-h-72 font-mono text-xs leading-6"
            name="brief"
            defaultValue={JSON.stringify(brief, null, 2)}
          />
        </label>
        <label className="block space-y-2 text-sm font-medium">
          Claude/Codex prompt
          <textarea
            className="field min-h-80 text-sm leading-6"
            name="implementationPrompt"
            value={promptValue}
            onChange={(event) => {
              setPromptValue(event.target.value);
              setCopied(false);
            }}
          />
        </label>
        <div className="flex flex-wrap gap-3">
          <button className="button-primary" type="submit" disabled={pending}>
            {pending ? "Saving…" : "Save draft"}
          </button>
          <button
            className="button-secondary"
            type="button"
            onClick={copyPrompt}
          >
            {copied ? "Copied" : "Copy prompt"}
          </button>
        </div>
        <div role="status" aria-live="polite">
          {state.error ? (
            <p className="text-sm text-danger">{state.error}</p>
          ) : null}
          {state.message ? (
            <p className="text-sm text-success">{state.message}</p>
          ) : null}
        </div>
      </form>
    </section>
  );
}
