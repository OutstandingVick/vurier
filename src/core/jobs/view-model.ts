export type JobFeedItem = {
  id: string;
  title: string;
  description: string;
  category: string | null;
  source: string;
  source_url: string | null;
  job_type: string;
  budget_min: number | null;
  budget_max: number | null;
  hourly_min: number | null;
  hourly_max: number | null;
  currency: string | null;
  experience_level: string;
  skills: string[];
  client_country: string | null;
  client_payment_verification: string;
  client_rating: number | null;
  client_spend: number | null;
  proposal_count: string;
  published_at: string | null;
  retrieved_at: string;
  missing_fields: string[];
  state?: string | null;
};

export const JOB_FEED_SELECT =
  "id,title,description,category,source,source_url,job_type,budget_min,budget_max,hourly_min,hourly_max,currency,experience_level,skills,client_country,client_payment_verification,client_rating,client_spend,proposal_count,published_at,retrieved_at,missing_fields,job_user_states(state)";

export function toJobFeedItem(row: Record<string, unknown>): JobFeedItem {
  const states = Array.isArray(row.job_user_states) ? row.job_user_states : [];
  const state =
    states[0] && typeof states[0] === "object"
      ? (states[0] as { state?: string }).state
      : null;
  return { ...(row as Omit<JobFeedItem, "state">), state };
}
