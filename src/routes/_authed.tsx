import { createFileRoute, Navigate, Outlet, useRouterState } from "@tanstack/react-router";
import { useEffect, useRef } from "react";

import { AppShell } from "@/components/app/app-shell";
import { ErrorState, LoadingState } from "@/components/app/common";
import { useAuth } from "@/lib/auth";
import { useProfile } from "@/lib/data";
import { DEMO_ENABLED, startVisitor } from "@/lib/demo";

// Signed-in area. Sessions live in browser storage, so these pages render on the client only.
export const Route = createFileRoute("/_authed")({
  ssr: false,
  component: AuthedLayout,
});

function AuthedLayout() {
  const { session, loading } = useAuth();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const profile = useProfile();

  // Open access: no sign-in wall. A visitor without a session silently gets one (see lib/demo.ts).
  const starting = useRef(false);
  useEffect(() => {
    if (!loading && !session && DEMO_ENABLED && !starting.current) {
      starting.current = true;
      void startVisitor(window.location.pathname + window.location.search);
    }
  }, [loading, session]);

  if (loading) return <LoadingState />;
  if (!session && DEMO_ENABLED) return <LoadingState />;
  if (!session) return <Navigate to="/auth" search={{ redirect: path }} replace />;
  if (profile.isLoading) return <LoadingState label="Loading your profile…" />;
  if (profile.error) return <ErrorState error={profile.error} onRetry={() => profile.refetch()} />;

  const onboarding = path === "/onboarding";
  if (profile.data && !profile.data.onboarded && !onboarding)
    return <Navigate to="/onboarding" replace />;
  if (onboarding) return <Outlet />;
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}
