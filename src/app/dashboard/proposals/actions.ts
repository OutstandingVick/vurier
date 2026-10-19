"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { matchEvidence } from "@/core/proposals/evidence-matcher";
import { generateProposal, rewriteProposal } from "@/core/proposals/generator";
import { validateProposal } from "@/core/proposals/qa";
import {
  saveGeneratedProposal,
  saveProposalVersion,
} from "@/core/proposals/repository";
import type {
  PortfolioEvidence,
  PortfolioKind,
  ProposalLength,
  ProposalTone,
} from "@/core/proposals/types";
import { hasDeepSeekEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { releaseAiCost, reserveAiCost } from "@/core/analytics/ai-reservation";
export type ProposalActionState = { error?: string; message?: string };
async function session() {
  const client = await createClient();
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) throw new Error("Your session expired. Sign in and try again.");
  return { client, user };
}
async function loadEvidence(
  client: Awaited<ReturnType<typeof createClient>>,
  userId: string,
): Promise<PortfolioEvidence[]> {
  const { data } = await client
    .from("portfolio_items")
    .select(
      "id,title,description,kind,skills,achievements,project_url,repository_url,file_path,verified",
    )
    .eq("user_id", userId)
    .eq("verified", true);
  return (data ?? []).map((item) => ({
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
}
export async function createProposal(
  _: ProposalActionState,
  formData: FormData,
): Promise<ProposalActionState> {
  const jobId = z.string().uuid().safeParse(formData.get("jobId"));
  if (!jobId.success) return { error: "Select a valid opportunity." };
  if (!hasDeepSeekEnv())
    return {
      error:
        "DeepSeek is not configured. Add the server API key before generating a proposal.",
    };
  try {
    const { client, user } = await session();
    const [{ data: job }, { data: analysis }, { data: settings }, evidence] =
      await Promise.all([
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
          .from("settings")
          .select("monthly_ai_budget_usd")
          .eq("user_id", user.id)
          .single(),
        loadEvidence(client, user.id),
      ]);
    if (!job) return { error: "Opportunity not found." };
    if (!analysis)
      return {
        error: "Analyze this opportunity before creating a proposal strategy.",
      };
    if (!evidence.length)
      return {
        error:
          "Add and verify portfolio evidence before generating a proposal.",
      };
    const month = new Date(
      Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), 1),
    ).toISOString();
    const { data: costs } = await client
      .from("proposal_strategies")
      .select("estimated_cost_usd")
      .eq("user_id", user.id)
      .gte("created_at", month);
    const spent = (costs ?? []).reduce(
      (sum, row) => sum + Number(row.estimated_cost_usd ?? 0),
      0,
    );
    if (spent >= Number(settings?.monthly_ai_budget_usd ?? 10))
      return {
        error:
          "Monthly AI spending limit reached. Adjust it in Settings before continuing.",
      };
    const matched = matchEvidence(
      `${job.title} ${job.description} ${(job.skills ?? []).join(" ")}`,
      evidence,
      8,
    );
    if (!matched.length)
      return {
        error:
          "No verified portfolio evidence matches this opportunity. Add relevant evidence first.",
      };
    const reservationId = await reserveAiCost(
      client,
      user.id,
      "proposal_generation",
    );
    let proposalId: string;
    try {
      const result = await generateProposal({
        job,
        jobText: `${job.title}\n${job.description}`,
        analysis,
        evidence: matched,
      });
      proposalId = await saveGeneratedProposal(
        client,
        user.id,
        job.id,
        result,
        matched.map((item) => item.id),
      );
    } finally {
      await releaseAiCost(client, user.id, reservationId).catch(
        () => undefined,
      );
    }
    redirect(`/dashboard/proposals/${proposalId}`);
  } catch (error) {
    if (error && typeof error === "object" && "digest" in error) throw error;
    return {
      error:
        error instanceof Error
          ? error.message
          : "Unable to generate the proposal. Try again.",
    };
  }
}
export async function saveManualDraft(
  _: ProposalActionState,
  formData: FormData,
): Promise<ProposalActionState> {
  const parsed = z
    .object({
      proposalId: z.string().uuid(),
      coverLetter: z.string().min(1).max(6000),
    })
    .safeParse(Object.fromEntries(formData));
  if (!parsed.success)
    return { error: "Proposal text must be between 1 and 6,000 characters." };
  try {
    const { client, user } = await session();
    const { data: proposal } = await client
      .from("proposals")
      .select("job_id,attachment_ids,milestones,screening_answers")
      .eq("id", parsed.data.proposalId)
      .eq("user_id", user.id)
      .single();
    if (!proposal) return { error: "Proposal not found." };
    const { data: job } = await client
      .from("jobs")
      .select("title,description")
      .eq("id", proposal.job_id)
      .eq("user_id", user.id)
      .single();
    const evidence = await loadEvidence(client, user.id);
    const question =
      parsed.data.coverLetter
        .trim()
        .split(/(?<=[?])\s*/)
        .filter((x) => x.endsWith("?"))
        .at(-1) ?? "What would you like to prioritize first?";
    const draft = {
      coverLetter: parsed.data.coverLetter,
      openingLines: parsed.data.coverLetter
        .split("\n")
        .filter(Boolean)
        .slice(0, 2)
        .concat([""])
        .slice(0, 2) as [string, string],
      closingQuestion: question,
      milestones: proposal.milestones ?? [],
      screeningAnswers: proposal.screening_answers ?? [],
      attachmentIds: proposal.attachment_ids ?? [],
    };
    const qa = validateProposal(
      draft,
      evidence,
      `${job?.title ?? ""} ${job?.description ?? ""}`,
    );
    await saveProposalVersion(
      client,
      user.id,
      parsed.data.proposalId,
      draft,
      "manual",
      "manual",
      "manual",
      qa,
    );
    revalidatePath(`/dashboard/proposals/${parsed.data.proposalId}`);
    return {
      message: qa.passed
        ? "Draft saved and quality checks passed."
        : "Draft saved with quality warnings to review.",
    };
  } catch {
    return { error: "Unable to save this draft. Try again." };
  }
}
export async function rewriteDraft(
  _: ProposalActionState,
  formData: FormData,
): Promise<ProposalActionState> {
  const parsed = z
    .object({
      proposalId: z.string().uuid(),
      tone: z.enum(["conversational", "confident", "technical", "concise"]),
      length: z.enum(["short", "standard", "detailed"]),
    })
    .safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Choose a valid tone and length." };
  if (!hasDeepSeekEnv()) return { error: "DeepSeek is not configured." };
  try {
    const { client, user } = await session();
    const { data: proposal } = await client
      .from("proposals")
      .select("*,proposal_strategies(strategy,selected_evidence_ids),jobs(*)")
      .eq("id", parsed.data.proposalId)
      .eq("user_id", user.id)
      .single();
    if (!proposal) return { error: "Proposal not found." };
    const evidence = (await loadEvidence(client, user.id)).filter((item) =>
      proposal.proposal_strategies?.selected_evidence_ids?.includes(item.id),
    );
    const reservationId = await reserveAiCost(
      client,
      user.id,
      "proposal_generation",
    );
    try {
      const result = await rewriteProposal({
        job: proposal.jobs,
        strategy: proposal.proposal_strategies.strategy,
        evidence: evidence.map((item) => ({
          ...item,
          relevance: 100,
          matchedTerms: item.skills,
        })),
        previousDraft: proposal.cover_letter,
        tone: parsed.data.tone as ProposalTone,
        length: parsed.data.length as ProposalLength,
      });
      const qa = validateProposal(
        result.data,
        evidence,
        `${proposal.jobs.title} ${proposal.jobs.description}`,
      );
      await saveProposalVersion(
        client,
        user.id,
        proposal.id,
        result.data,
        "rewrite",
        parsed.data.tone,
        parsed.data.length,
        qa,
      );
      revalidatePath(`/dashboard/proposals/${proposal.id}`);
      return {
        message: qa.passed
          ? "Rewrite saved."
          : "Rewrite saved with quality warnings.",
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
          : "Unable to rewrite this draft.",
    };
  }
}
