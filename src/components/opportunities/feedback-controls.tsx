import { ThumbsDown, ThumbsUp } from "lucide-react";
import { submitAnalysisFeedback } from "@/app/dashboard/opportunities/actions";
export function FeedbackControls({
  analysisId,
  feedback,
}: {
  analysisId: string;
  feedback: string | null;
}) {
  return (
    <section
      className="rounded-2xl border bg-surface p-5"
      aria-labelledby="feedback-heading"
    >
      <h2 id="feedback-heading" className="font-semibold">
        Was this recommendation accurate?
      </h2>
      <p className="mt-1 text-sm text-muted">
        Your feedback is saved for future scoring preference improvements.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {(["accurate", "inaccurate"] as const).map((value) => (
          <form action={submitAnalysisFeedback} key={value}>
            <input type="hidden" name="analysisId" value={analysisId} />
            <input type="hidden" name="feedback" value={value} />
            <button
              className={
                feedback === value ? "button-primary" : "button-secondary"
              }
              type="submit"
            >
              {value === "accurate" ? (
                <ThumbsUp className="size-4" aria-hidden="true" />
              ) : (
                <ThumbsDown className="size-4" aria-hidden="true" />
              )}
              {value === "accurate" ? "Accurate" : "Inaccurate"}
            </button>
          </form>
        ))}
      </div>
    </section>
  );
}
