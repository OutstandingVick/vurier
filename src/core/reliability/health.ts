export type HealthInput = {
  supabase: boolean;
  deepseek: boolean;
  upworkConfigured: boolean;
  upworkConnected: boolean;
  trigger: boolean;
  telegramConnected: boolean;
};
export function integrationHealth(input: HealthInput) {
  return [
    {
      integration: "supabase",
      status: input.supabase ? "connected" : "error",
      detail: input.supabase
        ? "Database environment is configured."
        : "Supabase configuration is missing.",
    },
    {
      integration: "deepseek",
      status: input.deepseek ? "connected" : "disabled",
      detail: input.deepseek
        ? "Server-side AI credentials are configured."
        : "AI generation is disabled.",
    },
    {
      integration: "upwork",
      status: input.upworkConnected ? "connected" : "disabled",
      detail: input.upworkConnected
        ? "Authorized Upwork connection recorded."
        : input.upworkConfigured
          ? "Configured but not connected."
          : "Official Upwork access is not configured.",
    },
    {
      integration: "trigger",
      status: input.trigger ? "connected" : "disabled",
      detail: input.trigger
        ? "Trigger.dev production values are configured."
        : "Scheduled monitoring is disabled.",
    },
    {
      integration: "telegram",
      status: input.telegramConnected ? "connected" : "disabled",
      detail: input.telegramConnected
        ? "Telegram delivery is connected."
        : "Telegram delivery is disabled.",
    },
  ] as const;
}
