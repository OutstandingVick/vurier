import Link from "next/link";
import { MailCheck } from "lucide-react";
import { AuthShell } from "@/components/auth/auth-shell";

export default function CheckEmailPage() {
  return (
    <AuthShell
      title="Check your email"
      description="Use the confirmation link we sent to finish creating your account."
    >
      <div className="mt-8 rounded-2xl bg-surface p-6 shadow-card">
        <MailCheck className="size-6 text-accent-strong" aria-hidden="true" />
        <p className="mt-4 text-sm leading-6 text-muted">
          After confirming your email, return here to sign in. If the message
          does not arrive, check your spam folder.
        </p>
        <Link className="button-secondary mt-6 w-full" href="/auth/sign-in">
          Return to sign in
        </Link>
      </div>
    </AuthShell>
  );
}
