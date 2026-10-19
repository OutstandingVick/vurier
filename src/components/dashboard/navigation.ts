import {
  BarChart3,
  BriefcaseBusiness,
  Compass,
  FileText,
  FolderKanban,
  LayoutDashboard,
  Send,
  Settings,
  Bell,
  Radar,
  FlaskConical,
} from "lucide-react";

export const dashboardNavigation = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Discover jobs", href: "/dashboard/discover", icon: Compass },
  {
    label: "Opportunities",
    href: "/dashboard/opportunities",
    icon: BriefcaseBusiness,
  },
  { label: "Proposals", href: "/dashboard/proposals", icon: FileText },
  {
    label: "Applications",
    href: "/dashboard/applications",
    icon: Send,
  },
  { label: "Monitoring", href: "/dashboard/monitoring", icon: Radar },
  { label: "Notifications", href: "/dashboard/notifications", icon: Bell },
  { label: "Portfolio", href: "/dashboard/portfolio", icon: FolderKanban },
  { label: "Demo intelligence", href: "/dashboard/demos", icon: FlaskConical },
  {
    label: "Analytics",
    href: "/dashboard/analytics",
    icon: BarChart3,
    comingSoon: true,
  },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
] as const;
