"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { demoArtifactSchema } from "@/core/demos/schema";
import { demoFingerprint } from "@/core/demos/fingerprint";
import { rankPortfolioEvidence } from "@/core/demos/evidence-ranker";
import { suggestedDemoKind } from "@/core/demos/kind";
import { generateDemoStrategy } from "@/core/demos/generator";
import { deriveRoiSignals } from "@/core/demos/signals";
import { assertDemoBudget } from "@/core/demos/quota";
import {
  findCachedDemoStrategy,
  saveDemoStrategy,
} from "@/core/demos/repository";
import { verifyReferenceUrl } from "@/core/demos/reference-url";
import { validateDemoFile } from "@/core/demos/file-validation";
import type { PortfolioEvidence, PortfolioKind } from "@/core/proposals/types";
import { hasDeepSeekEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { releaseAiCost, reserveAiCost } from "@/core/analytics/ai-reservation";

export type DemoActionState = {
  error?: string;
  message?: string;
  strategyId?: string;
};
async function auth() {
  const client = await createClient();
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) throw new Error("Your session expired. Sign in and try again.");
  return { client, user };
}

export async function generateProofOfWork(
  _: DemoActionState,
  formData: FormData,
): Promise<DemoActionState> {
  const jobId = z.string().uuid().safeParse(formData.get("jobId"));
  if (!jobId.success) return { error: "Opportunity not found." };
  if (!hasDeepSeekEnv())
    return {
      error:
        "DeepSeek is not configured. Add the server-side key before generating a strategy.",
    };
  try {
    const { client, user } = await auth();
    const month = new Date();
    month.setUTCDate(1);
    month.setUTCHours(0, 0, 0, 0);
    const [
      { data: job },
      { data: analysis },
      { data: portfolio },
      { data: settings },
      { data: demoCosts },
      { data: analysisCosts },
      { data: proposalCosts },
    ] = await Promise.all([
      client
        .from("jobs")
        .select("*")
        .eq("id", jobId.data)
        .eq("user_id", user.id)
        .single(),
      client
        .from("job_analyses")
        .select("*")
        .eq("job_id", jobId.data)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      client
        .from("portfolio_items")
        .select(
          "id,title,description,kind,skills,achievements,project_url,repository_url,file_path,verified",
        )
        .eq("user_id", user.id)
        .eq("verified", true),
      client
        .from("settings")
        .select(
          "minimum_fixed_budget,minimum_hourly_rate,monthly_ai_budget_usd",
        )
        .eq("user_id", user.id)
        .single(),
      client
        .from("demo_strategies")
        .select("estimated_cost_usd")
        .eq("user_id", user.id)
        .gte("created_at", month.toISOString()),
      client
        .from("job_analyses")
        .select("estimated_cost_usd")
        .eq("user_id", user.id)
        .gte("created_at", month.toISOString()),
      client
        .from("proposal_strategies")
        .select("estimated_cost_usd")
        .eq("user_id", user.id)
        .gte("created_at", month.toISOString()),
    ]);
    if (!job) return { error: "Opportunity not found." };
    const evidence = (portfolio ?? []).map((item): PortfolioEvidence => ({
      id: item.id,
      title: item.title,
      description: item.description ?? "",
      kind: item.kind as PortfolioKind,
      skills: item.skills ?? [],
      achievements: item.achievements ?? [],
      projectUrl: item.project_url,
      repositoryUrl: item.repository_url,
      filePath: item.file_path,
      verified: item.verified,
    }));
    const kind = suggestedDemoKind(job.category, job.title, job.description);
    const ranked = rankPortfolioEvidence(
      `${job.title} ${job.description} ${(job.skills ?? []).join(" ")}`,
      evidence,
      kind,
    );
    const fingerprint = demoFingerprint({
      job: { id: job.id, updated: job.updated_at },
      analysis: analysis?.input_fingerprint ?? null,
      evidence: ranked.map((item) => [item.id, item.relevance]),
      version: "phase7-v1",
    });
    const cached = await findCachedDemoStrategy(
      client,
      user.id,
      job.id,
      fingerprint,
    );
    if (cached)
      return {
        message: "Existing strategy loaded from cache.",
        strategyId: cached.id,
      };
    const sum = (rows: Array<{ estimated_cost_usd: number }> | null) =>
      (rows ?? []).reduce(
        (total, row) => total + Number(row.estimated_cost_usd ?? 0),
        0,
      );
    assertDemoBudget({
      monthlySpent: sum(demoCosts) + sum(analysisCosts) + sum(proposalCosts),
      monthlyLimit: Number(settings?.monthly_ai_budget_usd ?? 10),
    });
    const reservationId = await reserveAiCost(client, user.id, "demo_strategy");
    try {
      const result = await generateDemoStrategy({
        job,
        analysis,
        evidence: ranked,
        expectedKind: kind,
        roiSignals: deriveRoiSignals({
          budgetMax: job.budget_max,
          hourlyMax: job.hourly_max,
          proposalCount: job.proposal_count,
          paymentVerification: job.client_payment_verification,
          clientRating:
            job.client_rating === null ? null : Number(job.client_rating),
          publishedAt: job.published_at,
          minimumBudget:
            settings?.minimum_fixed_budget === null
              ? null
              : Number(settings?.minimum_fixed_budget),
          minimumHourly:
            settings?.minimum_hourly_rate === null
              ? null
              : Number(settings?.minimum_hourly_rate),
        }),
      });
      const saved = await saveDemoStrategy(client, {
        userId: user.id,
        jobId: job.id,
        fingerprint,
        result: result.strategy,
        roi: result.roi,
        selectedEvidenceIds: result.selectedEvidence.map((item) => item.id),
        usage: result.usage,
        models: result.models,
        estimatedCostUsd: result.estimatedCostUsd,
      });
      revalidatePath("/dashboard/demos");
      revalidatePath(`/dashboard/opportunities/${job.id}`);
      return {
        message: "Proof-of-work strategy generated for review.",
        strategyId: saved.id,
      };
    } finally {
      await releaseAiCost(client, user.id, reservationId).catch(
        () => undefined,
      );
    }
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Unable to generate proof-of-work strategy.",
    };
  }
}

export async function saveDemoDraft(
  _: DemoActionState,
  formData: FormData,
): Promise<DemoActionState> {
  const parsed = z
    .object({
      strategyId: z.string().uuid(),
      brief: z.string().max(20_000),
      implementationPrompt: z.string().min(80).max(8_000),
    })
    .safeParse(Object.fromEntries(formData));
  if (!parsed.success)
    return {
      error: parsed.error.issues[0]?.message ?? "Check the draft content.",
    };
  try {
    const { client, user } = await auth();
    let brief: unknown;
    try {
      brief = JSON.parse(parsed.data.brief);
    } catch {
      return { error: "Brief must remain valid JSON." };
    }
    const artifact = demoArtifactSchema.safeParse({
      brief,
      implementationPrompt: parsed.data.implementationPrompt,
    });
    if (!artifact.success)
      return {
        error: artifact.error.issues[0]?.message ?? "Brief is incomplete.",
      };
    const { error } = await client
      .from("demo_strategies")
      .update({
        brief: artifact.data.brief,
        implementation_prompt: artifact.data.implementationPrompt,
        updated_at: new Date().toISOString(),
      })
      .eq("id", parsed.data.strategyId)
      .eq("user_id", user.id);
    if (error) throw error;
    revalidatePath(`/dashboard/demos/${parsed.data.strategyId}`);
    return { message: "Draft saved." };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unable to save draft.",
    };
  }
}

export async function addDemoReference(
  _: DemoActionState,
  formData: FormData,
): Promise<DemoActionState> {
  const parsed = z
    .object({
      strategyId: z.string().uuid(),
      title: z.string().trim().min(1).max(200),
      url: z.string().url(),
      relevance: z.string().trim().min(1).max(1_000),
    })
    .safeParse(Object.fromEntries(formData));
  if (!parsed.success)
    return { error: parsed.error.issues[0]?.message ?? "Check the reference." };
  try {
    const { client, user } = await auth();
    const verified = await verifyReferenceUrl(parsed.data.url);
    const { error } = await client.from("demo_references").insert({
      user_id: user.id,
      strategy_id: parsed.data.strategyId,
      title: parsed.data.title,
      url: verified.url,
      relevance: parsed.data.relevance,
      source: "user",
      http_status: verified.status,
      verified_at: verified.verifiedAt,
    });
    if (error) throw error;
    revalidatePath(`/dashboard/demos/${parsed.data.strategyId}`);
    return { message: "Reference verified and saved." };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Unable to verify reference.",
    };
  }
}

export async function saveDemoAsset(
  _: DemoActionState,
  formData: FormData,
): Promise<DemoActionState> {
  const parsed = z
    .object({
      strategyId: z.string().uuid(),
      title: z.string().trim().min(1).max(200),
      status: z.enum(["draft", "in_progress", "completed"]),
      url: z.union([z.literal(""), z.string().url()]),
      notes: z.string().max(3_000),
      verified: z.boolean(),
    })
    .safeParse({
      ...Object.fromEntries(formData),
      verified: formData.get("verified") === "on",
    });
  if (!parsed.success)
    return {
      error: parsed.error.issues[0]?.message ?? "Check the asset details.",
    };
  try {
    const { client, user } = await auth();
    let filePath: string | null = null;
    const file = formData.get("file");
    if (file instanceof File && file.size) {
      const fileError = validateDemoFile(file);
      if (fileError) return { error: fileError };
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
      filePath = `${user.id}/${crypto.randomUUID()}-${safeName}`;
      const upload = await client.storage
        .from("demos")
        .upload(filePath, file, { upsert: false });
      if (upload.error) throw upload.error;
    }
    if (parsed.data.verified && parsed.data.url)
      await verifyReferenceUrl(parsed.data.url);
    if (
      parsed.data.verified &&
      (parsed.data.status !== "completed" || (!parsed.data.url && !filePath))
    )
      return {
        error:
          "Only completed work with a verified URL or file can be approved.",
      };
    const { error } = await client.from("demo_assets").insert({
      user_id: user.id,
      strategy_id: parsed.data.strategyId,
      title: parsed.data.title,
      status: parsed.data.status,
      url: parsed.data.url || null,
      file_path: filePath,
      notes: parsed.data.notes || null,
      verified: parsed.data.verified,
      approved_at: parsed.data.verified ? new Date().toISOString() : null,
    });
    if (error) throw error;
    revalidatePath(`/dashboard/demos/${parsed.data.strategyId}`);
    return {
      message: parsed.data.verified
        ? "Completed asset approved."
        : "Asset progress saved.",
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unable to save asset.",
    };
  }
}
