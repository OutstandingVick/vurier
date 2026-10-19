import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  DraftContent,
  ProposalGenerationResult,
} from "@/core/proposals/types";
import { nextVersionNumber } from "@/core/proposals/versioning";
import { createAdminClient } from "@/lib/supabase/admin";
export async function saveGeneratedProposal(
  client: SupabaseClient,
  userId: string,
  jobId: string,
  result: ProposalGenerationResult,
  evidenceIds: string[],
) {
  const { data: strategy, error: strategyError } = await client
    .from("proposal_strategies")
    .insert({
      user_id: userId,
      job_id: jobId,
      strategy: result.strategy,
      selected_evidence_ids: evidenceIds,
      model: "deepseek-v4-pro",
      input_tokens: result.strategyTokens,
      estimated_cost_usd: result.estimatedCostUsd,
    })
    .select("id")
    .single();
  if (strategyError) throw strategyError;
  const { data: proposal, error } = await client
    .from("proposals")
    .insert({
      user_id: userId,
      job_id: jobId,
      strategy_id: strategy.id,
      cover_letter: result.draft.coverLetter,
      model: "deepseek-flash",
      input_tokens: result.strategyTokens,
      output_tokens: result.draftTokens,
      qa_result: result.qa,
      suggested_bid: result.strategy.suggestedBid,
      estimated_timeline: result.strategy.timeline,
      milestones: result.draft.milestones,
      screening_answers: result.draft.screeningAnswers,
      attachment_ids: result.draft.attachmentIds,
    })
    .select("id")
    .single();
  if (error) throw error;
  await saveProposalVersion(
    client,
    userId,
    proposal.id,
    result.draft,
    "generated",
    "conversational",
    "standard",
    result.qa,
  );
  return proposal.id;
}
export async function saveProposalVersion(
  client: SupabaseClient,
  userId: string,
  proposalId: string,
  draft: DraftContent,
  source: string,
  tone: string,
  length: string,
  qa: unknown,
) {
  const { data: versions, error: readError } = await client
    .from("proposal_versions")
    .select("version_number")
    .eq("user_id", userId)
    .eq("proposal_id", proposalId);
  if (readError) throw readError;
  const { data: savedVersion, error } = await client
    .from("proposal_versions")
    .insert({
      user_id: userId,
      proposal_id: proposalId,
      version_number: nextVersionNumber(versions ?? []),
      cover_letter: draft.coverLetter,
      draft_content: draft,
      source,
      tone,
      length,
      qa_result: qa,
    })
    .select("id")
    .single();
  if (error) throw error;
  await client
    .from("proposals")
    .update({ cover_letter: draft.coverLetter, qa_result: qa })
    .eq("id", proposalId)
    .eq("user_id", userId);

  const workflowClient = createAdminClient();
  const { data: affectedApplications } = await workflowClient
    .from("applications")
    .select("id,application_version")
    .eq("proposal_id", proposalId)
    .eq("user_id", userId)
    .in("status", ["ready_for_review", "approved"]);
  for (const application of affectedApplications ?? []) {
    await workflowClient
      .from("applications")
      .update({
        status: "draft",
        proposal_version_id: savedVersion.id,
        application_version: application.application_version + 1,
      })
      .eq("id", application.id)
      .eq("user_id", userId);
    await workflowClient
      .from("application_approvals")
      .update({ invalidated_at: new Date().toISOString() })
      .eq("application_id", application.id)
      .eq("user_id", userId)
      .is("invalidated_at", null);
  }
}
