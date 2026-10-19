export type ExternalJob = {
  externalId: string;
  url: string;
  title: string;
  description: string;
  publishedAt: Date;
  payload: Record<string, unknown>;
};

export interface UpworkGateway {
  listAuthorizedJobs(
    cursor?: string,
  ): Promise<{ jobs: ExternalJob[]; nextCursor?: string }>;
}

export class UpworkIntegrationNotConfiguredError extends Error {
  constructor() {
    super("An authorized Upwork integration is not configured.");
    this.name = "UpworkIntegrationNotConfiguredError";
  }
}
