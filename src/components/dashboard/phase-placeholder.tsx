import Link from "next/link";
import { Construction } from "lucide-react";
import { EmptyState } from "@/components/dashboard/empty-state";
import { PageShell } from "@/components/dashboard/page-shell";

export function PhasePlaceholder({
  title,
  phase,
  description,
}: {
  title: string;
  phase: number;
  description: string;
}) {
  return (
    <PageShell
      title={title}
      description="The foundation is ready for this capability"
    >
      <EmptyState
        icon={Construction}
        title={`Planned for Phase ${phase}`}
        description={description}
        action={
          <Link href="/dashboard" className="button-secondary">
            Return to overview
          </Link>
        }
      />
    </PageShell>
  );
}
