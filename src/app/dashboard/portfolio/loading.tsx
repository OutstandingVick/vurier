import { PageShell } from "@/components/dashboard/page-shell";
export default function PortfolioLoading() { return <PageShell title="Portfolio" description="Loading verified evidence"><div className="h-96 animate-pulse rounded-2xl bg-surface motion-reduce:animate-none" role="status" aria-label="Loading portfolio" /></PageShell>; }
