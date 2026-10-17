"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  createApprovalSnapshot,
  assertValidApproval,
} from "@/core/applications/approval";
import { auditApplication } from "@/core/applications/audit";
import { upworkCapabilities } from "@/core/applications/capabilities";
import { submissionIdempotencyKey } from "@/core/applications/idempotency";
import { applicationFingerprint } from "@/core/applications/fingerprint";
import { manualFallbackReason } from "@/core/applications/manual";
import { notify } from "@/core/applications/notifications";
import { prepareApplicationPackage } from "@/core/applications/package";
import { assertSpendingAllowed } from "@/core/applications/spending";
import { assertApplicationTransition } from "@/core/applications/state-machine";
import { mapUpworkStatus } from "@/core/applications/status";
import { getValidUpworkToken } from "@/integrations/upwork/connection-service";
import { UpworkApiClient } from "@/integrations/upwork/client";
import { UpworkApiError } from "@/integrations/upwork/errors";
import type {
  ApplicationPackage,
  ApprovalSnapshot,
} from "@/core/applications/types";
import { createClient } from "@/lib/supabase/server";
import { getApprovalSigningKey } from "@/lib/env";
export type ApplicationActionState = { error?: string; message?: string };
async function session() {
  const client = await createClient();
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) throw new Error("Your session expired. Sign in and try again.");
  return { client, user };
}
export async function prepareApplication(
  _: ApplicationActionState,
  formData: FormData,
): Promise<ApplicationActionState> {
  const parsed = z
    .object({
      proposalId: z.string().uuid(),
      connectsCost: z.coerce.number().int().nonnegative(),
      boostConnects: z.coerce.number().int().nonnegative().default(0),
    })
    .safeParse(Object.fromEntries(formData));
  if (!parsed.success)
    return { error: "Enter verified non-negative Connects costs." };
  try {
    const { client, user } = await session();
    const { data: proposal } = await client
      .from("proposals")
      .select("*,jobs(*)")
      .eq("id", parsed.data.proposalId)
      .eq("user_id", user.id)
      .single();
    if (!proposal) return { error: "Proposal not found." };
    const { data: version } = await client
      .from("proposal_versions")
      .select("*")
      .eq("proposal_id", proposal.id)
      .eq("user_id", user.id)
      .order("version_number", { ascending: false })
      .limit(1)
      .single();
    if (!version)
      return {
        error: "Save a proposal version before preparing an application.",
      };
    const packageData = prepareApplicationPackage({
      proposal,
      version,
      job: proposal.jobs,
      connectsCost: parsed.data.connectsCost,
      boostConnects: parsed.data.boostConnects,
    });
    const { data: existing } = await client
      .from("applications")
      .select("id,status,application_version")
      .eq("user_id", user.id)
      .eq("job_id", proposal.job_id)
      .maybeSingle();
    if (
      existing &&
      !["draft", "failed", "ready_for_review"].includes(existing.status)
    )
      return { error: "An application for this job already exists." };
    const row = {
      user_id: user.id,
      proposal_id: proposal.id,
      job_id: proposal.job_id,
      proposal_version_id: version.id,
      status: "draft",
      package: packageData,
      package_fingerprint: applicationFingerprint(packageData),
      bid_amount: packageData.bidAmount,
      connects_cost: packageData.connectsCost,
      boost_connects: packageData.boostConnects,
      application_version: existing ? existing.application_version + 1 : 1,
      submitted_at: null,
    };
    const result = existing
      ? await client
          .from("applications")
          .update(row)
          .eq("id", existing.id)
          .select("id")
          .single()
      : await client.from("applications").insert(row).select("id").single();
    if (result.error) throw result.error;
    await auditApplication(
      client,
      user.id,
      result.data.id,
      "application_prepared",
      { proposalVersionId: version.id },
    );
    revalidatePath("/dashboard/applications");
    return { message: "Application package prepared." };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Unable to prepare application.",
    };
  }
}
export async function markReady(formData: FormData) {
  const id = z.string().uuid().safeParse(formData.get("applicationId"));
  if (!id.success) return;
  const { client, user } = await session();
  const { data } = await client
    .from("applications")
    .select("status")
    .eq("id", id.data)
    .eq("user_id", user.id)
    .single();
  if (!data) return;
  assertApplicationTransition(data.status, "ready_for_review");
  await client
    .from("applications")
    .update({ status: "ready_for_review" })
    .eq("id", id.data);
  await client.from("application_status_history").insert({
    user_id: user.id,
    application_id: id.data,
    from_status: data.status,
    to_status: "ready_for_review",
    source: "system",
  });
  await notify(client, user.id, {
    kind: "approval",
    title: "Application ready for approval",
    message: "Review the exact bid and Connects cost before approving.",
    applicationId: id.data,
  });
  revalidatePath(`/dashboard/applications/${id.data}`);
}
export async function approveApplication(
  _: ApplicationActionState,
  formData: FormData,
): Promise<ApplicationActionState> {
  const parsed = z
    .object({ applicationId: z.string().uuid(), confirm: z.literal("yes") })
    .safeParse(Object.fromEntries(formData));
  if (!parsed.success)
    return { error: "Confirm the exact application details to approve." };
  try {
    const { client, user } = await session();
    const [{ data: app }, { data: settings }, { data: ledger }] =
      await Promise.all([
        client
          .from("applications")
          .select("*")
          .eq("id", parsed.data.applicationId)
          .eq("user_id", user.id)
          .single(),
        client
          .from("settings")
          .select("daily_connects_limit,monthly_connects_limit")
          .eq("user_id", user.id)
          .single(),
        client
          .from("connects_ledger")
          .select("amount,created_at")
          .eq("user_id", user.id),
      ]);
    if (!app) return { error: "Application not found." };
    assertApplicationTransition(app.status, "approved");
    const now = new Date();
    const daily = (ledger ?? [])
      .filter(
        (x) => new Date(x.created_at).toDateString() === now.toDateString(),
      )
      .reduce((s, x) => s + x.amount, 0);
    const monthly = (ledger ?? [])
      .filter(
        (x) =>
          new Date(x.created_at).getUTCMonth() === now.getUTCMonth() &&
          new Date(x.created_at).getUTCFullYear() === now.getUTCFullYear(),
      )
      .reduce((s, x) => s + x.amount, 0);
    assertSpendingAllowed(
      app.connects_cost,
      app.boost_connects,
      { daily, monthly, available: null },
      {
        daily: settings?.daily_connects_limit ?? 40,
        monthly: settings?.monthly_connects_limit ?? 200,
      },
    );
    const snap = createApprovalSnapshot(
      app.id,
      app.application_version,
      app.package as ApplicationPackage,
      getApprovalSigningKey(),
    );
    await client.from("application_approvals").insert({
      user_id: user.id,
      application_id: app.id,
      application_version: snap.applicationVersion,
      fingerprint: snap.fingerprint,
      signature: snap.signature,
      bid_amount: snap.bidAmount,
      connects_cost: snap.connectsCost,
      boost_connects: snap.boostConnects,
      expires_at: snap.expiresAt,
    });
    await client
      .from("applications")
      .update({ status: "approved" })
      .eq("id", app.id);
    await auditApplication(client, user.id, app.id, "explicit_approval", {
      version: app.application_version,
      bid: app.bid_amount,
      connects: app.connects_cost,
      boost: app.boost_connects,
    });
    revalidatePath(`/dashboard/applications/${app.id}`);
    return {
      message:
        "Approved for 15 minutes. Submission still requires selecting Submit now.",
    };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Unable to approve application.",
    };
  }
}
export async function submitApplication(
  _: ApplicationActionState,
  formData: FormData,
): Promise<ApplicationActionState> {
  const id = z.string().uuid().safeParse(formData.get("applicationId"));
  if (!id.success) return { error: "Application not found." };
  try {
    const { client, user } = await session();
    const [{ data: app }, { data: approval }, { data: source }] =
      await Promise.all([
        client
          .from("applications")
          .select("*")
          .eq("id", id.data)
          .eq("user_id", user.id)
          .single(),
        client
          .from("application_approvals")
          .select("*")
          .eq("application_id", id.data)
          .eq("user_id", user.id)
          .is("invalidated_at", null)
          .order("confirmed_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
        client
          .from("discovery_sources")
          .select("scopes")
          .eq("user_id", user.id)
          .eq("provider", "upwork_api")
          .maybeSingle(),
      ]);
    if (!app) return { error: "Application not found." };
    assertValidApproval(
      approval
        ? ({
            applicationId: approval.application_id,
            applicationVersion: approval.application_version,
            fingerprint: approval.fingerprint,
            bidAmount: approval.bid_amount,
            connectsCost: approval.connects_cost,
            boostConnects: approval.boost_connects,
            expiresAt: approval.expires_at,
            signature: approval.signature,
          } as ApprovalSnapshot)
        : null,
      app.id,
      app.application_version,
      app.package as ApplicationPackage,
      getApprovalSigningKey(),
    );
    const capabilities = upworkCapabilities(source?.scopes ?? []);
    const fallback = manualFallbackReason(
      app.package as ApplicationPackage,
      capabilities.canSubmit,
    );
    if (fallback) {
      await client
        .from("applications")
        .update({ manual_apply: true })
        .eq("id", app.id);
      await notify(client, user.id, {
        kind: "manual_apply",
        title: "Manual application required",
        message: fallback,
        applicationId: app.id,
      });
      revalidatePath(`/dashboard/applications/${app.id}`);
      return { message: fallback };
    }
    const key = submissionIdempotencyKey(
      user.id,
      app.id,
      app.application_version,
    );
    const { data: attempt, error: attemptError } = await client
      .from("submission_attempts")
      .insert({
        user_id: user.id,
        application_id: app.id,
        application_version: app.application_version,
        idempotency_key: key,
        status: "started",
      })
      .select("id")
      .single();
    if (attemptError)
      return {
        error:
          "This exact application version already has a submission attempt. Reconcile its status before retrying.",
      };
    await client
      .from("applications")
      .update({ status: "submitting" })
      .eq("id", app.id);
    const token = await getValidUpworkToken(user.id);
    if (!token) throw new Error("Upwork connection is unavailable.");
    try {
      const result = await new UpworkApiClient().submitJobProposal(
        token.accessToken,
        (app.package as ApplicationPackage).providerInput!,
        user.id,
        key,
      );
      await client
        .from("submission_attempts")
        .update({
          status: "succeeded",
          external_id: result.externalId,
          completed_at: new Date().toISOString(),
        })
        .eq("id", attempt.id);
      await client
        .from("applications")
        .update({
          status: "submitted",
          external_id: result.externalId,
          submitted_at: new Date().toISOString(),
          connects_spent: (app.connects_cost ?? 0) + app.boost_connects,
        })
        .eq("id", app.id);
      await client.from("connects_ledger").insert([
        {
          user_id: user.id,
          application_id: app.id,
          kind: "application",
          amount: app.connects_cost ?? 0,
          source: "confirmed_submission",
        },
        {
          user_id: user.id,
          application_id: app.id,
          kind: "boost",
          amount: app.boost_connects,
          source: "confirmed_submission",
        },
      ]);
      await notify(client, user.id, {
        kind: "submitted",
        title: "Application submitted",
        message: "Upwork confirmed the proposal ID.",
        applicationId: app.id,
      });
      return { message: "Upwork confirmed submission." };
    } catch (error) {
      const uncertain =
        error instanceof UpworkApiError &&
        error.code === "uncertain_submission";
      await client
        .from("submission_attempts")
        .update({
          status: uncertain ? "uncertain" : "failed",
          error_code: error instanceof UpworkApiError ? error.code : null,
          error_message:
            error instanceof Error ? error.message : "Submission failed",
          retryable:
            !uncertain &&
            error instanceof UpworkApiError &&
            error.status === 429,
          completed_at: new Date().toISOString(),
        })
        .eq("id", attempt.id);
      await client
        .from("applications")
        .update({
          status: "failed",
          uncertain_submission: uncertain,
          last_error:
            error instanceof Error ? error.message : "Submission failed",
        })
        .eq("id", app.id);
      return {
        error: uncertain
          ? "Submission outcome is uncertain. Check Upwork before retrying."
          : error instanceof Error
            ? error.message
            : "Submission failed.",
      };
    }
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Unable to submit application.",
    };
  } finally {
    revalidatePath(`/dashboard/applications/${id.data}`);
  }
}
export async function updateManualStatus(formData: FormData) {
  const parsed = z
    .object({
      applicationId: z.string().uuid(),
      status: z.enum([
        "submitted",
        "viewed",
        "interviewing",
        "hired",
        "rejected",
        "withdrawn",
      ]),
    })
    .safeParse(Object.fromEntries(formData));
  if (!parsed.success) return;
  const { client, user } = await session();
  const [{ data: app }, { data: approval }] = await Promise.all([
    client
      .from("applications")
      .select("*")
      .eq("id", parsed.data.applicationId)
      .eq("user_id", user.id)
      .single(),
    client
      .from("application_approvals")
      .select("*")
      .eq("application_id", parsed.data.applicationId)
      .eq("user_id", user.id)
      .is("invalidated_at", null)
      .order("confirmed_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);
  if (!app) return;
  if (parsed.data.status === "submitted") {
    if (!app.manual_apply || app.status !== "approved")
      throw new Error(
        "Only an approved manual-fallback application can be marked submitted.",
      );
    assertValidApproval(
      approval
        ? {
            applicationId: approval.application_id,
            applicationVersion: approval.application_version,
            fingerprint: approval.fingerprint,
            bidAmount: approval.bid_amount,
            connectsCost: approval.connects_cost,
            boostConnects: approval.boost_connects,
            expiresAt: approval.expires_at,
            signature: approval.signature,
          }
        : null,
      app.id,
      app.application_version,
      app.package as ApplicationPackage,
      getApprovalSigningKey(),
    );
  } else {
    assertApplicationTransition(app.status, parsed.data.status);
  }
  await client
    .from("applications")
    .update({
      status: parsed.data.status,
      ...(parsed.data.status === "submitted"
        ? { submitted_at: new Date().toISOString() }
        : {}),
    })
    .eq("id", parsed.data.applicationId);
  await client.from("application_status_history").insert({
    user_id: user.id,
    application_id: parsed.data.applicationId,
    from_status: app.status,
    to_status: parsed.data.status,
    source: "manual",
    note: "User-confirmed manual status",
  });
  await auditApplication(
    client,
    user.id,
    parsed.data.applicationId,
    "manual_status_update",
    { status: parsed.data.status },
  );
  revalidatePath(`/dashboard/applications/${parsed.data.applicationId}`);
  revalidatePath("/dashboard/applications");
}

export async function syncApplicationStatus(
  _: ApplicationActionState,
  formData: FormData,
): Promise<ApplicationActionState> {
  const id = z.string().uuid().safeParse(formData.get("applicationId"));
  if (!id.success) return { error: "Application not found." };
  try {
    const { client, user } = await session();
    const [{ data: app }, { data: source }] = await Promise.all([
      client
        .from("applications")
        .select("id,status,external_id")
        .eq("id", id.data)
        .eq("user_id", user.id)
        .single(),
      client
        .from("discovery_sources")
        .select("scopes")
        .eq("user_id", user.id)
        .eq("provider", "upwork_api")
        .maybeSingle(),
    ]);
    if (!app?.external_id)
      return { error: "No Upwork proposal ID is available to synchronize." };
    if (!upworkCapabilities(source?.scopes ?? []).canTrackStatus)
      return {
        error:
          "The Upwork connection lacks proposal status permission. Use a verified manual update.",
      };
    const token = await getValidUpworkToken(user.id);
    if (!token) return { error: "Reconnect Upwork before synchronizing." };
    const remote = await new UpworkApiClient().getVendorProposal(
      token.accessToken,
      app.external_id,
      user.id,
    );
    if (!remote)
      return {
        error: "Upwork did not return this proposal. No status changed.",
      };
    const remoteStatus = remote.status?.status
      ? mapUpworkStatus(remote.status.status)
      : null;
    const nextStatus = remote.viewedByClient
      ? app.status === "submitted"
        ? "viewed"
        : remoteStatus
      : remoteStatus;
    if (!nextStatus || nextStatus === app.status)
      return { message: "Status is current. Upwork reported no new stage." };
    assertApplicationTransition(app.status, nextStatus);
    await client
      .from("applications")
      .update({ status: nextStatus })
      .eq("id", app.id)
      .eq("user_id", user.id);
    await client.from("application_status_history").insert({
      user_id: user.id,
      application_id: app.id,
      from_status: app.status,
      to_status: nextStatus,
      source: "upwork_api",
      note: "Synchronized through authorized Upwork GraphQL access",
    });
    revalidatePath(`/dashboard/applications/${app.id}`);
    revalidatePath("/dashboard/applications");
    return { message: "Status synchronized from Upwork." };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Unable to synchronize status.",
    };
  }
}
