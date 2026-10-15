"use client";

import Link from "next/link";
import { Menu, Sparkles, X } from "lucide-react";
import { useState } from "react";
import { dashboardNavigation } from "@/components/dashboard/navigation";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  return <div className="lg:hidden"><button className="grid size-10 place-items-center rounded-xl outline-none hover:bg-surface-muted focus-visible:ring-2 focus-visible:ring-accent-strong" type="button" onClick={() => setOpen(true)} aria-label="Open navigation"><Menu className="size-5" aria-hidden="true" /></button>{open ? <div className="fixed inset-0 z-50 bg-ink/40" onClick={() => setOpen(false)}><div className="min-h-full w-[min(20rem,88vw)] bg-surface p-4 shadow-2xl" role="dialog" aria-modal="true" aria-label="Dashboard navigation" onClick={(event) => event.stopPropagation()}><div className="flex items-center justify-between"><Link href="/dashboard" onClick={() => setOpen(false)} className="flex min-h-11 items-center gap-3 font-semibold"><span className="grid size-9 place-items-center rounded-xl bg-accent text-ink"><Sparkles className="size-4" aria-hidden="true" /></span>Vurier</Link><button className="grid size-10 place-items-center rounded-xl outline-none hover:bg-surface-muted focus-visible:ring-2 focus-visible:ring-accent-strong" type="button" onClick={() => setOpen(false)} aria-label="Close navigation"><X className="size-5" aria-hidden="true" /></button></div><nav className="mt-8" aria-label="Mobile dashboard"><ul className="space-y-1">{dashboardNavigation.map((item) => <li key={item.href}><Link className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium text-muted hover:bg-surface-muted hover:text-foreground" href={item.href} onClick={() => setOpen(false)}><item.icon className="size-4" aria-hidden="true" />{item.label}</Link></li>)}</ul></nav></div></div> : null}</div>;
}
