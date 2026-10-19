"use client";
import { useActionState } from "react";
import {
  saveExternalExpense,
  type AnalyticsActionState,
} from "@/app/dashboard/analytics/actions";
const initial: AnalyticsActionState = {};
export function ExpenseForm() {
  const [state, action, pending] = useActionState(saveExternalExpense, initial);
  return (
    <section className="rounded-2xl border bg-surface p-5">
      <h2 className="font-semibold">Record external expense</h2>
      <p className="mt-1 text-sm text-muted">
        Add real research or infrastructure costs. Mark uncertain amounts as
        estimates.
      </p>
      <form action={action} className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="space-y-2 text-sm font-medium">
          Category
          <select className="field" name="category">
            <option value="research">Research</option>
            <option value="infrastructure">Infrastructure</option>
            <option value="other">Other</option>
          </select>
        </label>
        <label className="space-y-2 text-sm font-medium">
          Provider
          <input className="field" name="provider" maxLength={100} />
        </label>
        <label className="space-y-2 text-sm font-medium sm:col-span-2">
          Description
          <input
            className="field"
            required
            name="description"
            maxLength={500}
          />
        </label>
        <label className="space-y-2 text-sm font-medium">
          Amount (USD)
          <input
            className="field"
            required
            name="amountUsd"
            type="number"
            min="0"
            max="1000000"
            step="0.0001"
          />
        </label>
        <label className="space-y-2 text-sm font-medium">
          Incurred date
          <input
            className="field"
            required
            name="incurredAt"
            type="date"
            defaultValue={new Date().toISOString().slice(0, 10)}
          />
        </label>
        <label className="flex min-h-11 items-center gap-2 text-sm sm:col-span-2">
          <input name="estimated" type="checkbox" />
          This amount is estimated
        </label>
        {state.error ? (
          <p className="text-sm text-danger sm:col-span-2" role="alert">
            {state.error}
          </p>
        ) : null}
        {state.message ? (
          <p className="text-sm text-success sm:col-span-2" role="status">
            {state.message}
          </p>
        ) : null}
        <button
          className="button-secondary sm:col-span-2"
          disabled={pending}
          type="submit"
        >
          {pending ? "Saving…" : "Save expense"}
        </button>
      </form>
    </section>
  );
}
