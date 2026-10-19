import { redirect } from "next/navigation";
import { Sidebar } from "@/components/dashboard/sidebar";
import { hasSupabaseEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (hasSupabaseEnv()) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect("/auth/sign-in");
  }
  return (
    <div className="flex min-h-screen">
      <a
        href="#main-content"
        className="fixed start-3 top-3 z-[100] -translate-y-20 rounded-lg bg-foreground px-4 py-2 text-sm font-semibold text-background focus:translate-y-0"
      >
        Skip to content
      </a>
      <Sidebar />
      <main id="main-content" className="min-w-0 flex-1">
        {children}
      </main>
    </div>
  );
}
