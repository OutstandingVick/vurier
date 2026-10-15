"use client";

import Link from "next/link";
import { useActionState } from "react";
import { ArrowRight, LoaderCircle } from "lucide-react";
import type { AuthState } from "@/app/auth/actions";

type AuthFormProps = {
  action: (state: AuthState, formData: FormData) => Promise<AuthState>;
  mode: "sign-in" | "sign-up";
};

export function AuthForm({ action, mode }: AuthFormProps) {
  const [state, formAction, pending] = useActionState(action, {});
  const isSignIn = mode === "sign-in";

  return (
    <form action={formAction} className="mt-8 space-y-5">
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground" htmlFor="email">Email address</label>
        <input className="field" id="email" name="email" type="email" inputMode="email" autoComplete="email" placeholder="name@example.com" required />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground" htmlFor="password">Password</label>
        <input className="field" id="password" name="password" type="password" autoComplete={isSignIn ? "current-password" : "new-password"} placeholder="At least 8 characters" minLength={8} required />
      </div>
      {state.error ? <p className="rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger" role="alert">{state.error}</p> : null}
      <button className="button-primary w-full" disabled={pending} type="submit">
        {pending ? <LoaderCircle aria-hidden="true" className="size-4 animate-spin motion-reduce:animate-none" /> : null}
        {pending ? (isSignIn ? "Signing in…" : "Creating account…") : (isSignIn ? "Sign in" : "Create account")}
        {!pending ? <ArrowRight aria-hidden="true" className="size-4" strokeWidth={2} /> : null}
      </button>
      <p className="text-center text-sm text-muted">
        {isSignIn ? "New to Vurier?" : "Already have an account?"}{" "}
        <Link className="font-medium text-foreground underline underline-offset-4" href={isSignIn ? "/auth/sign-up" : "/auth/sign-in"}>
          {isSignIn ? "Create an account" : "Sign in"}
        </Link>
      </p>
    </form>
  );
}
