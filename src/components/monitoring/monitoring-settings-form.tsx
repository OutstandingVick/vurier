"use client";

import { useActionState } from "react";
import { saveMonitoringSettings } from "@/app/dashboard/monitoring/actions";
import { JOB_CATEGORIES } from "@/core/jobs/types";

type Initial = Record<string, unknown>;
export function MonitoringSettingsForm({ initial }: { initial: Initial }) {
  const [state, action, pending] = useActionState(saveMonitoringSettings, {});
  return (
    <form action={action} className="space-y-6">
      <section className="rounded-2xl bg-surface p-5 shadow-card sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold tracking-[-0.02em]">
              Automated discovery
            </h2>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-muted">
              Runs saved searches through authorized Upwork access. Disabling
              this stops future runs without deleting history.
            </p>
          </div>
          <label className="flex min-h-11 items-center gap-3 rounded-xl border px-4 text-sm font-medium">
            <input
              type="checkbox"
              name="enabled"
              defaultChecked={Boolean(initial.enabled)}
            />
            Enable monitoring
          </label>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <label className="space-y-2 text-sm font-medium">
            Interval
            <select
              className="field"
              name="interval"
              defaultValue={String(initial.interval ?? "hourly")}
            >
              <option value="15m">Every 15 minutes</option>
              <option value="30m">Every 30 minutes</option>
              <option value="hourly">Hourly</option>
              <option value="daily">Daily at 08:00</option>
            </select>
          </label>
          <label className="space-y-2 text-sm font-medium">
            Timezone
            <input
              className="field"
              name="timezone"
              defaultValue={String(initial.timezone ?? "Africa/Lagos")}
              placeholder="Africa/Lagos"
            />
          </label>
          <label className="space-y-2 text-sm font-medium">
            Alert score threshold
            <input
              className="field"
              type="number"
              min="0"
              max="100"
              name="scoreThreshold"
              defaultValue={Number(initial.scoreThreshold ?? 80)}
            />
          </label>
          <label className="space-y-2 text-sm font-medium">
            Jobs analyzed per run
            <input
              className="field"
              type="number"
              min="1"
              max="25"
              name="maxJobsPerRun"
              defaultValue={Number(initial.maxJobsPerRun ?? 10)}
            />
          </label>
          <label className="space-y-2 text-sm font-medium">
            Daily AI budget (USD)
            <input
              className="field"
              type="number"
              min="0"
              max="1000"
              step="0.01"
              name="dailyAiBudgetUsd"
              defaultValue={Number(initial.dailyAiBudgetUsd ?? 2)}
            />
          </label>
          <label className="space-y-2 text-sm font-medium">
            Daily notification limit
            <input
              className="field"
              type="number"
              min="0"
              max="100"
              name="dailyNotificationLimit"
              defaultValue={Number(initial.dailyNotificationLimit ?? 10)}
            />
          </label>
        </div>
        <fieldset className="mt-6">
          <legend className="text-sm font-semibold">Categories</legend>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {JOB_CATEGORIES.map((category) => (
              <label
                key={category}
                className="flex min-h-11 items-center gap-3 rounded-xl border px-4 text-sm"
              >
                <input
                  type="checkbox"
                  name="categories"
                  value={category}
                  defaultChecked={(
                    initial.categories as string[] | undefined
                  )?.includes(category)}
                />
                {category}
              </label>
            ))}
          </div>
        </fieldset>
      </section>
      <section className="rounded-2xl bg-surface p-5 shadow-card sm:p-6">
        <h2 className="text-lg font-semibold tracking-[-0.02em]">
          Alerts and quiet hours
        </h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="flex min-h-11 items-center gap-3 rounded-xl border px-4 text-sm font-medium">
            <input
              type="checkbox"
              name="inAppEnabled"
              defaultChecked={initial.inAppEnabled !== false}
            />
            Send in-app alerts
          </label>
          <label className="flex min-h-11 items-center gap-3 rounded-xl border px-4 text-sm font-medium">
            <input
              type="checkbox"
              name="telegramEnabled"
              defaultChecked={Boolean(initial.telegramEnabled)}
            />
            Send Telegram alerts
          </label>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="space-y-2 text-sm font-medium">
            Quiet hours start
            <input
              className="field"
              type="time"
              name="quietStart"
              defaultValue={String(initial.quietStart ?? "22:00")}
            />
          </label>
          <label className="space-y-2 text-sm font-medium">
            Quiet hours end
            <input
              className="field"
              type="time"
              name="quietEnd"
              defaultValue={String(initial.quietEnd ?? "07:00")}
            />
          </label>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="space-y-2 text-sm font-medium">
            Telegram bot token
            <input
              className="field"
              type="password"
              name="telegramBotToken"
              autoComplete="off"
              placeholder={
                initial.hasTelegramToken
                  ? "Saved—enter only to replace"
                  : "123456:bot-token"
              }
            />
          </label>
          <label className="space-y-2 text-sm font-medium">
            Telegram chat ID
            <input
              className="field"
              name="telegramChatId"
              defaultValue={String(initial.telegramChatId ?? "")}
              placeholder="123456789"
            />
          </label>
        </div>
        {initial.hasTelegramToken ? (
          <input type="hidden" name="hasTelegramToken" value="true" />
        ) : null}
      </section>
      <div role="status" aria-live="polite">
        {state.error ? (
          <p className="text-sm text-danger">{state.error}</p>
        ) : null}
        {state.message ? (
          <p className="text-sm text-success">{state.message}</p>
        ) : null}
      </div>
      <button className="button-primary" type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save monitoring settings"}
      </button>
    </form>
  );
}
