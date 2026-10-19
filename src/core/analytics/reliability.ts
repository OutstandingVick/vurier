export function reliabilitySummary(
  input: {
    runs: Array<{ status: string }>;
    attempts: Array<{ status: string }>;
    errors: Array<{ created_at: string }>;
    integrations: Array<{
      name: string;
      status: "connected" | "disabled" | "error" | "unknown";
      detail: string;
    }>;
  },
  now = new Date(),
) {
  const terminal = input.runs.filter((run) =>
    ["completed", "partial", "failed", "skipped", "interrupted"].includes(
      run.status,
    ),
  );
  const successful = terminal.filter(
    (run) => run.status === "completed",
  ).length;
  return {
    monitoringSuccessRate: terminal.length
      ? Math.round((successful / terminal.length) * 1000) / 10
      : null,
    failedRuns: terminal.filter((run) =>
      ["failed", "interrupted"].includes(run.status),
    ).length,
    unresolvedSubmissionAttempts: input.attempts.filter((attempt) =>
      ["started", "uncertain"].includes(attempt.status),
    ).length,
    recentErrors: input.errors.filter(
      (error) =>
        now.getTime() - new Date(error.created_at).getTime() <= 7 * 86_400_000,
    ).length,
    integrations: input.integrations,
  };
}
