export type MetricValue = {
  value: number;
  previous: number;
  changePercent: number | null;
};
export type FunnelStage =
  | "discovered"
  | "qualified"
  | "proposal"
  | "submitted"
  | "viewed"
  | "interview"
  | "hired";
export type FunnelPoint = {
  stage: FunnelStage;
  label: string;
  count: number;
  conversionFromPrior: number | null;
};
export type DateWindow = {
  from: Date;
  to: Date;
  previousFrom: Date;
  previousTo: Date;
  key: "7d" | "30d" | "90d" | "12m";
};
export type ApplicationAnalyticsRow = {
  id: string;
  jobId: string | null;
  status: string;
  createdAt: string;
  submittedAt: string | null;
  bidAmount: number | null;
  connectsCost: number | null;
  boostConnects: number;
  earnings: number | null;
  earningsConfirmed: boolean;
  timeInvestedMinutes: number | null;
  timeConfirmed: boolean;
};
export type CostEntry = {
  source: "deepseek" | "research" | "connects";
  model?: string | null;
  amountUsd: number;
  estimated: boolean;
  occurredAt: string;
};
export type StrategyDimension = {
  key: string;
  label: string;
  applications: number;
  interviews: number;
  hires: number;
  earnings: number;
  interviewRate: number;
  hireRate: number;
  sampleSufficient: boolean;
};
export type ReliabilitySummary = {
  monitoringSuccessRate: number | null;
  failedRuns: number;
  unresolvedSubmissionAttempts: number;
  recentErrors: number;
  integrations: Array<{
    name: string;
    status: "connected" | "disabled" | "error" | "unknown";
    detail: string;
  }>;
};
