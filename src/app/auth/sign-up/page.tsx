import { signUp } from "@/app/auth/actions";
import { AuthForm } from "@/components/auth/auth-form";
import { AuthShell } from "@/components/auth/auth-shell";

export default function SignUpPage() {
  return <AuthShell title="Build your opportunity engine" description="Create an account to configure the work Vurier should prioritize for you."><AuthForm action={signUp} mode="sign-up" /></AuthShell>;
}
