import { BarChart3, BriefcaseBusiness, Compass, FileText, FolderKanban, LayoutDashboard, Send, Settings } from "lucide-react";

export const dashboardNavigation = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Discover jobs", href: "/dashboard/discover", icon: Compass },
  { label: "Opportunities", href: "/dashboard/opportunities", icon: BriefcaseBusiness },
  { label: "Proposals", href: "/dashboard/proposals", icon: FileText, comingSoon: true },
  { label: "Applications", href: "/dashboard/applications", icon: Send, comingSoon: true },
  { label: "Portfolio", href: "/dashboard/portfolio", icon: FolderKanban, comingSoon: true },
  { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3, comingSoon: true },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
] as const;
