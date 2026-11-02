import { Link, useRouterState } from "@tanstack/react-router";
import {
  BookOpen,
  CalendarCheck,
  ClipboardList,
  LayoutDashboard,
  LineChart,
  LogOut,
  Menu,
  Settings,
  Sparkles,
  Target,
} from "lucide-react";
import type { ReactNode } from "react";
import { toast } from "sonner";

import { Logo } from "@/components/app/common";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/lib/auth";
import { DEMO_ENABLED } from "@/lib/demo";
import { useProfile, useUpdateProfile } from "@/lib/data";
import { cn } from "@/lib/utils";

export const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/tutor", label: "AI Tutor", icon: Sparkles },
  { to: "/practice", label: "Practice", icon: Target },
  { to: "/plan", label: "Study Plan", icon: CalendarCheck },
  { to: "/lessons", label: "Lessons", icon: BookOpen },
  { to: "/tests", label: "Practice Tests", icon: ClipboardList },
  { to: "/progress", label: "Progress", icon: LineChart },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

const MOBILE_TABS = ["/dashboard", "/tutor", "/practice", "/plan"] as const;

function useActive() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (to: string) => path === to || path.startsWith(to + "/");
}

function ExamSwitch() {
  const { data: profile } = useProfile();
  const update = useUpdateProfile();
  if (!profile || profile.exam !== "BOTH") return null;
  return (
    <div
      className="flex rounded-lg border bg-muted/60 p-0.5 text-xs font-semibold"
      role="group"
      aria-label="Active exam"
    >
      {(["SAT", "ACT"] as const).map((e) => (
        <button
          key={e}
          type="button"
          aria-pressed={profile.active_exam === e}
          onClick={() =>
            profile.active_exam !== e &&
            update.mutate(
              { active_exam: e },
              { onSuccess: () => toast.success(`Switched to ${e}`) },
            )
          }
          className={cn(
            "rounded-md px-3 py-1 transition-colors",
            profile.active_exam === e
              ? "bg-card text-navy shadow-sm"
              : "text-muted-foreground hover:text-navy",
          )}
        >
          {e}
        </button>
      ))}
    </div>
  );
}

function SideNav() {
  const isActive = useActive();
  const { setOpenMobile } = useSidebar();
  const { user, signOut } = useAuth();
  const { data: profile } = useProfile();
  return (
    <Sidebar>
      <SidebarHeader className="px-4 pt-5 pb-3">
        <Link to="/dashboard" onClick={() => setOpenMobile(false)}>
          <Logo />
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV.map((item) => (
                <SidebarMenuItem key={item.to}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.to)}
                    className="h-9 font-medium"
                  >
                    <Link to={item.to} onClick={() => setOpenMobile(false)}>
                      <item.icon />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t p-3">
        <div className="flex items-center gap-2">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-bold text-primary">
            {(profile?.display_name || "S").slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-navy">
              {profile?.display_name || "Student"}
            </p>
            {!DEMO_ENABLED && user?.email && (
              <p className="truncate text-xs text-muted-foreground">{user.email}</p>
            )}
          </div>
          {!DEMO_ENABLED && (
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={() => signOut()}
              aria-label="Sign out"
            >
              <LogOut className="size-4" />
            </Button>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

function MobileTabs() {
  const isActive = useActive();
  const { setOpenMobile } = useSidebar();
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
      aria-label="Primary"
    >
      {NAV.filter((n) => (MOBILE_TABS as readonly string[]).includes(n.to)).map((item) => (
        <Link
          key={item.to}
          to={item.to}
          className={cn(
            "flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium",
            isActive(item.to) ? "text-primary" : "text-muted-foreground",
          )}
        >
          <item.icon className="size-5" />
          {item.label.replace("Study ", "")}
        </Link>
      ))}
      <button
        type="button"
        onClick={() => setOpenMobile(true)}
        className="flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium text-muted-foreground"
      >
        <Menu className="size-5" />
        More
      </button>
    </nav>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <SideNav />
      <div className="flex min-h-svh w-full min-w-0 flex-col bg-background">
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between gap-3 border-b bg-background/85 px-4 backdrop-blur md:px-8">
          <Link to="/dashboard" className="md:hidden">
            <Logo />
          </Link>
          <div className="hidden md:block" />
          <ExamSwitch />
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 pt-6 pb-24 md:px-8 md:pb-12">
          {children}
        </main>
      </div>
      <MobileTabs />
    </SidebarProvider>
  );
}
