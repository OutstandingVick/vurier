"use client";
import { PageShell } from "@/components/dashboard/page-shell";
export default function PortfolioError({ retry }: { error: Error & { digest?: string }; retry: () => void }) { return <PageShell title="Unable to load portfolio" description="Saved evidence is unchanged."><button className="button-primary" onClick={() => retry()}>Retry loading</button></PageShell>; }
