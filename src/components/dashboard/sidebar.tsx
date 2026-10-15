"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Sparkles } from "lucide-react";
import { signOut } from "@/app/auth/actions";
import { dashboardNavigation } from "@/components/dashboard/navigation";

export function Sidebar() {
  const pathname = usePathname();
  return <aside className="hidden min-h-screen w-64 shrink-0 border-e bg-surface p-4 lg:flex lg:flex-col"><Link href="/dashboard" className="flex min-h-11 items-center gap-3 px-2 font-semibold"><span className="grid size-9 place-items-center rounded-xl bg-accent text-ink"><Sparkles className="size-4" aria-hidden="true" /></span>Vurier</Link><nav className="mt-8 flex-1" aria-label="Dashboard"><ul className="space-y-1">{dashboardNavigation.map((item) => { const active = item.href === "/dashboard" ? pathname === item.href : pathname.startsWith(item.href); return <li key={item.href}><Link className={`flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-accent-strong ${active ? "bg-surface-muted text-foreground" : "text-muted hover:bg-surface-muted hover:text-foreground"}`} href={item.href}><item.icon className="size-4" strokeWidth={active ? 2 : 1.5} aria-hidden="true" /><span className="flex-1">{item.label}</span>{"comingSoon" in item && item.comingSoon ? <span className="rounded-full bg-surface-muted px-2 py-0.5 text-[11px] font-medium text-muted">Soon</span> : null}</Link></li>; })}</ul></nav><form action={signOut}><button className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-sm font-medium text-muted outline-none hover:bg-surface-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-accent-strong" type="submit"><LogOut className="size-4" aria-hidden="true" />Sign out</button></form></aside>;
}
