import { z } from "zod";

const publicEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
});

const serverEnvSchema = publicEnvSchema.extend({
  DEEPSEEK_API_KEY: z.string().min(1),
  DEEPSEEK_BASE_URL: z.string().url().default("https://api.deepseek.com"),
  UPWORK_CLIENT_ID: z.string().min(1).optional(),
  UPWORK_CLIENT_SECRET: z.string().min(1).optional(),
  UPWORK_REDIRECT_URI: z.string().url().optional(),
  UPWORK_API_BASE_URL: z.string().url().default("https://api.upwork.com"),
  UPWORK_AUTH_BASE_URL: z.string().url().default("https://www.upwork.com"),
  UPWORK_SCOPES: z.string().optional(),
  INTEGRATION_ENCRYPTION_KEY: z.string().min(1).optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  APPROVAL_SIGNING_KEY: z.string().min(32).optional(),
});

export type PublicEnv = z.infer<typeof publicEnvSchema>;
export type ServerEnv = z.infer<typeof serverEnvSchema>;

export function getPublicEnv(): PublicEnv {
  return publicEnvSchema.parse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  });
}

export function getServerEnv(): ServerEnv {
  return serverEnvSchema.parse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY,
    DEEPSEEK_BASE_URL: process.env.DEEPSEEK_BASE_URL,
    UPWORK_CLIENT_ID: process.env.UPWORK_CLIENT_ID,
    UPWORK_CLIENT_SECRET: process.env.UPWORK_CLIENT_SECRET,
    UPWORK_REDIRECT_URI: process.env.UPWORK_REDIRECT_URI,
    UPWORK_API_BASE_URL: process.env.UPWORK_API_BASE_URL,
    UPWORK_AUTH_BASE_URL: process.env.UPWORK_AUTH_BASE_URL,
    UPWORK_SCOPES: process.env.UPWORK_SCOPES,
    INTEGRATION_ENCRYPTION_KEY: process.env.INTEGRATION_ENCRYPTION_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    APPROVAL_SIGNING_KEY: process.env.APPROVAL_SIGNING_KEY,
  });
}

export function hasSupabaseEnv() {
  return publicEnvSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  }).success;
}

export function hasDeepSeekEnv() {
  return Boolean(process.env.DEEPSEEK_API_KEY);
}

export function hasUpworkEnv() {
  return Boolean(
    process.env.UPWORK_CLIENT_ID &&
    process.env.UPWORK_CLIENT_SECRET &&
    process.env.UPWORK_REDIRECT_URI &&
    process.env.INTEGRATION_ENCRYPTION_KEY,
  );
}

export function getApprovalSigningKey() {
  const key = getServerEnv().APPROVAL_SIGNING_KEY;
  if (!key)
    throw new Error(
      "Application approvals are unavailable until APPROVAL_SIGNING_KEY is configured.",
    );
  return key;
}
