import { PageShell } from "@/components/dashboard/page-shell";
import { JobFeedSkeleton } from "@/components/jobs/job-feed-skeleton";

export default function Loading() { return <PageShell title="Discover jobs" description="Search authorized and manually imported opportunities"><JobFeedSkeleton /></PageShell>; }
