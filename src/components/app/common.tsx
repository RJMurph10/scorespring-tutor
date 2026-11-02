import { Link } from "@tanstack/react-router";
import { AlertTriangle, Loader2 } from "lucide-react";
import type { ReactNode } from "react";

import logo from "@/assets/apex-mark.png";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Logo({ className, compact }: { className?: string; compact?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <img src={logo} alt="" className="size-8 -m-1" />
      {!compact && (
        <span className="text-[17px] font-extrabold tracking-tight text-navy">ScoreSpring</span>
      )}
    </span>
  );
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-navy sm:text-[28px]">{title}</h1>
        {description && (
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function LoadingState({ label = "Loading…" }: { label?: string }) {
  return (
    <div
      className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground"
      role="status"
    >
      <Loader2 className="mr-2 size-4 animate-spin" /> {label}
    </div>
  );
}

export function ErrorState({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  const msg = error instanceof Error ? error.message : String(error ?? "Unknown error");
  return (
    <div className="mx-auto my-12 max-w-md rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
      <AlertTriangle className="mx-auto size-6 text-destructive" />
      <p className="mt-2 font-semibold text-navy">Something went wrong</p>
      <p className="mt-1 text-sm text-muted-foreground">{msg}</p>
      {onRetry && (
        <Button variant="outline" size="sm" className="mt-4" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  children,
  action,
}: {
  icon?: ReactNode;
  title: string;
  children?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-dashed bg-card/60 px-6 py-10 text-center">
      {icon && <div className="mb-3 rounded-full bg-accent p-3 text-primary">{icon}</div>}
      <p className="font-semibold text-navy">{title}</p>
      {children && <div className="mt-1 max-w-md text-sm text-muted-foreground">{children}</div>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Panel({
  title,
  action,
  children,
  className,
  description,
}: {
  title?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-2xl border bg-card p-5 shadow-[0_1px_2px_rgba(16,24,64,0.04)]",
        className,
      )}
    >
      {(title || action) && (
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            {title && <h2 className="text-[15px] font-semibold text-navy">{title}</h2>}
            {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function Meter({
  value,
  className,
  tone = "primary",
}: {
  value: number;
  className?: string;
  tone?: "primary" | "success" | "warning" | "destructive";
}) {
  const color = {
    primary: "bg-primary",
    success: "bg-success",
    warning: "bg-warning",
    destructive: "bg-destructive",
  }[tone];
  return (
    <div
      className={cn("h-2 w-full overflow-hidden rounded-full bg-muted", className)}
      role="progressbar"
      aria-valuenow={Math.round(value * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={cn("h-full rounded-full transition-all", color)}
        style={{ width: `${Math.max(0, Math.min(1, value)) * 100}%` }}
      />
    </div>
  );
}

export function TextLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link to={to} className="font-medium text-primary hover:underline">
      {children}
    </Link>
  );
}

export function fmtDate(
  d: string | Date,
  opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" },
) {
  const date =
    typeof d === "string" ? (d.length === 10 ? new Date(d + "T00:00:00") : new Date(d)) : d;
  return date.toLocaleDateString(undefined, opts);
}

export function pct(n: number) {
  return `${Math.round(n * 100)}%`;
}

export function levelTone(level: string): "primary" | "success" | "warning" {
  return level === "mastered" || level === "proficient"
    ? "success"
    : level === "learning"
      ? "warning"
      : "primary";
}
