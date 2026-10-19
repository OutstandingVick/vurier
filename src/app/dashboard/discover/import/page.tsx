import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageShell } from "@/components/dashboard/page-shell";
import { ManualImportForm } from "@/components/jobs/manual-import-form";

export default function ImportJobPage() {
  return (
    <PageShell
      title="Import opportunity"
      description="Add an Upwork job from details you provide"
    >
      <Link
        className="mb-5 inline-flex min-h-10 items-center gap-2 text-sm font-medium text-muted hover:text-foreground"
        href="/dashboard/discover"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to job discovery
      </Link>
      <ManualImportForm />
    </PageShell>
  );
}
