import { DashboardHeader } from "@/components/dashboard/header";

export function PageShell({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <DashboardHeader title={title} description={description} />
      <div className="mx-auto w-full max-w-7xl p-4 sm:p-6 lg:p-8">
        {children}
      </div>
    </>
  );
}
