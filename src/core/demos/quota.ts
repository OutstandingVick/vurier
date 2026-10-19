export function assertDemoBudget(input: {
  monthlySpent: number;
  monthlyLimit: number;
  estimatedMaximum?: number;
}) {
  const reserve = input.estimatedMaximum ?? 0.25;
  if (input.monthlySpent + reserve > input.monthlyLimit)
    throw new Error(
      "Monthly AI budget is exhausted. Increase the limit or wait for the next billing period.",
    );
}
