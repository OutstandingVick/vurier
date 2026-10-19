"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { canAttachDemoAsset } from "@/core/demos/assets";
import { draftContentSchema } from "@/core/proposals/schema";
import { saveProposalVersion } from "@/core/proposals/repository";
import { createClient } from "@/lib/supabase/server";

export async function attachDemoToProposal(formData: FormData) {
  const parsed = z
    .object({ proposalId: z.string().uuid(), assetId: z.string().uuid() })
    .safeParse(Object.fromEntries(formData));
  if (!parsed.success) return;
  const client = await createClient();
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) throw new Error("Your session expired. Sign in and try again.");
  const [{ data: asset }, { data: proposal }, { data: version }] =
    await Promise.all([
      client
        .from("demo_assets")
        .select("*,demo_strategies(job_id)")
        .eq("id", parsed.data.assetId)
        .eq("user_id", user.id)
        .single(),
      client
        .from("proposals")
        .select("id,job_id,attachment_ids")
        .eq("id", parsed.data.proposalId)
        .eq("user_id", user.id)
        .single(),
      client
        .from("proposal_versions")
        .select("draft_content,tone,length,qa_result")
        .eq("proposal_id", parsed.data.proposalId)
        .eq("user_id", user.id)
        .order("version_number", { ascending: false })
        .limit(1)
        .single(),
    ]);
  if (
    !asset ||
    !proposal ||
    !version ||
    asset.demo_strategies?.job_id !== proposal.job_id ||
    !canAttachDemoAsset({
      status: asset.status,
      verified: asset.verified,
      url: asset.url,
      filePath: asset.file_path,
    })
  )
    throw new Error(
      "Only completed, verified proof-of-work assets for this opportunity can be attached.",
    );
  const currentDraft = draftContentSchema.parse(version.draft_content);
  const attachmentIds = [
    ...new Set([...(currentDraft.attachmentIds ?? []), asset.id]),
  ];
  const { error: linkError } = await client
    .from("proposal_demo_assets")
    .insert({ user_id: user.id, proposal_id: proposal.id, asset_id: asset.id });
  if (linkError?.code === "23505") return;
  if (linkError) throw linkError;
  const { error: updateError } = await client
    .from("proposals")
    .update({ attachment_ids: attachmentIds })
    .eq("id", proposal.id)
    .eq("user_id", user.id);
  if (updateError) throw updateError;
  await saveProposalVersion(
    client,
    user.id,
    proposal.id,
    { ...currentDraft, attachmentIds },
    "manual",
    version.tone ?? "conversational",
    version.length ?? "standard",
    version.qa_result,
  );
  revalidatePath(`/dashboard/proposals/${proposal.id}`);
}
