import { MobileNav } from "@/components/dashboard/mobile-nav";
import { ThemeToggle } from "@/components/theme/theme-toggle";

export function DashboardHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <header className="flex min-h-20 items-center justify-between gap-4 border-b px-4 sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <MobileNav />
        <div className="min-w-0">
          <h1 className="truncate text-lg font-semibold tracking-[-0.02em]">
            {title}
          </h1>
          {description ? (
            <p className="hidden text-sm text-muted sm:block">{description}</p>
          ) : null}
        </div>
      </div>
      <ThemeToggle />
    </header>
  );
}
