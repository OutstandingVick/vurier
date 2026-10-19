import Link from "next/link";
import { ShieldCheck, Sparkles } from "lucide-react";

export function AuthShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <main
      id="main-content"
      className="grid min-h-screen lg:grid-cols-[1.1fr_0.9fr]"
    >
      <section className="relative hidden overflow-hidden bg-ink p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(94,234,212,.16),transparent_35%),radial-gradient(circle_at_80%_80%,rgba(129,140,248,.18),transparent_40%)]" />
        <Link
          href="/"
          className="relative flex items-center gap-3 text-lg font-semibold"
        >
          <span className="grid size-9 place-items-center rounded-xl bg-accent text-ink">
            <Sparkles className="size-4" aria-hidden="true" />
          </span>
          Vurier
        </Link>
        <div className="relative max-w-xl">
          <p className="mb-5 text-sm font-medium text-teal-200">
            Your opportunity intelligence layer
          </p>
          <p className="text-balance text-4xl font-semibold leading-[1.12] tracking-[-0.035em]">
            Spend your attention—and your Connects—on work worth winning.
          </p>
          <div className="mt-8 flex items-center gap-3 text-sm text-slate-300">
            <ShieldCheck className="size-5 text-teal-300" aria-hidden="true" />
            Every submission and Connects purchase stays under your control.
          </div>
        </div>
        <p className="relative text-sm text-slate-400">
          Built for independent specialists who choose fit over volume.
        </p>
      </section>
      <section className="flex items-center justify-center px-5 py-12 sm:px-8">
        <div className="w-full max-w-md">
          <Link
            href="/"
            className="mb-10 flex items-center gap-3 text-lg font-semibold lg:hidden"
          >
            <span className="grid size-9 place-items-center rounded-xl bg-accent text-ink">
              <Sparkles className="size-4" aria-hidden="true" />
            </span>
            Vurier
          </Link>
          <h1 className="text-balance text-3xl font-semibold tracking-[-0.03em] text-foreground">
            {title}
          </h1>
          <p className="mt-3 max-w-prose text-pretty text-base leading-7 text-muted">
            {description}
          </p>
          {children}
        </div>
      </section>
    </main>
  );
}
