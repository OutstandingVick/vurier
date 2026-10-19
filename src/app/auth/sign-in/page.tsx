import { signIn } from "@/app/auth/actions";
import { AuthForm } from "@/components/auth/auth-form";
import { AuthShell } from "@/components/auth/auth-shell";

export default function SignInPage() {
  return (
    <AuthShell
      title="Welcome back"
      description="Sign in to review your opportunity pipeline and agent settings."
    >
      <AuthForm action={signIn} mode="sign-in" />
    </AuthShell>
  );
}
