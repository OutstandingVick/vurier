export function assertRunLimits(input: {
  dailyCost: number;
  monthlyCost: number;
  dailyLimit: number;
  monthlyLimit: number;
  analyzed: number;
  maxJobs: number;
}) {
  if (input.dailyCost >= input.dailyLimit)
    throw new Error(
      "Daily DeepSeek spending limit reached. AI monitoring is paused.",
    );
  if (input.monthlyCost >= input.monthlyLimit)
    throw new Error(
      "Monthly DeepSeek spending limit reached. AI monitoring is paused.",
    );
  if (input.analyzed >= input.maxJobs)
    throw new Error("Maximum jobs per monitoring run reached.");
}
