export function isAlertEligible(input: {
  score: number;
  threshold: number;
  budgetMin: number | null;
  hourlyMin: number | null;
  preferredFixed: number | null;
  preferredHourly: number | null;
}) {
  if (input.score < input.threshold) return false;
  if (
    input.budgetMin !== null &&
    input.preferredFixed !== null &&
    input.budgetMin < input.preferredFixed
  )
    return false;
  if (
    input.hourlyMin !== null &&
    input.preferredHourly !== null &&
    input.hourlyMin < input.preferredHourly
  )
    return false;
  return true;
}
