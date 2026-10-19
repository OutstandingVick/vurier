import { z } from "zod";

const optionalNumber = z.preprocess(
  (value) =>
    value === "" || value === null || value === undefined
      ? undefined
      : Number(value),
  z.number().nonnegative().optional(),
);

export const jobSearchSchema = z.object({
  query: z.string().trim().max(200).optional(),
  category: z.string().trim().max(100).optional(),
  jobType: z.enum(["all", "hourly", "fixed", "unknown"]).default("all"),
  experienceLevel: z
    .enum(["all", "entry", "intermediate", "expert", "unknown"])
    .default("all"),
  paymentVerified: z.enum(["all", "verified", "unverified"]).default("all"),
  proposalCount: z
    .enum([
      "all",
      "less_than_5",
      "5_to_10",
      "10_to_15",
      "15_to_20",
      "20_to_50",
      "50_plus",
      "unknown",
    ])
    .default("all"),
  minimumBudget: optionalNumber,
  maximumAgeHours: optionalNumber,
  sort: z.enum(["newest", "budget_high", "competition_low"]).default("newest"),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
});

export const manualJobSchema = z.object({
  sourceUrl: z
    .string()
    .trim()
    .url("Enter a valid Upwork job URL.")
    .refine((value) => {
      const host = new URL(value).hostname.toLowerCase();
      return host === "upwork.com" || host.endsWith(".upwork.com");
    }, "Use an upwork.com job URL."),
  title: z.string().trim().min(3, "Enter a job title.").max(300),
  description: z
    .string()
    .trim()
    .min(30, "Paste at least 30 characters of job details.")
    .max(30_000),
  category: z.string().trim().max(100).optional(),
  jobType: z.enum(["hourly", "fixed", "unknown"]).default("unknown"),
  budgetMin: optionalNumber,
  budgetMax: optionalNumber,
  skills: z.string().trim().max(1000).optional(),
});

export type ManualJobInput = z.infer<typeof manualJobSchema>;
