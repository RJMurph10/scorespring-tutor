import {
  BookOpen,
  CheckCircle2,
  ClipboardList,
  Gauge,
  Repeat,
  Stethoscope,
  Target,
  Timer,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import type { StudyTask } from "@/lib/data";
import { cn } from "@/lib/utils";

export const TASK_META: Record<string, { label: string; icon: typeof BookOpen; tone: string }> = {
  lesson: { label: "Lesson", icon: BookOpen, tone: "text-primary bg-accent" },
  guided_practice: { label: "Guided practice", icon: Target, tone: "text-primary bg-accent" },
  timed_drill: {
    label: "Timed drill",
    icon: Timer,
    tone: "text-[oklch(0.5_0.15_300)] bg-[oklch(0.96_0.03_300)]",
  },
  review: { label: "Spaced review", icon: Repeat, tone: "text-success bg-success-soft" },
  progress_check: {
    label: "Progress check",
    icon: Gauge,
    tone: "text-[oklch(0.55_0.13_70)] bg-warning-soft",
  },
  practice_test: {
    label: "Practice test",
    icon: ClipboardList,
    tone: "text-[oklch(0.55_0.13_70)] bg-warning-soft",
  },
  diagnostic: { label: "Diagnostic", icon: Stethoscope, tone: "text-primary bg-accent" },
};

export function TaskRow({
  task,
  onStart,
  onDone,
  onReschedule,
  busy,
  missed,
}: {
  task: StudyTask;
  onStart?: () => void;
  onDone?: () => void;
  onReschedule?: () => void;
  busy?: boolean;
  missed?: boolean;
}) {
  const meta = TASK_META[task.kind] ?? TASK_META["lesson"]!;
  const done = task.status === "done";
  return (
    <div
      className={cn("flex items-start gap-3 rounded-xl border bg-card p-3.5", done && "opacity-70")}
    >
      <div className={cn("mt-0.5 rounded-lg p-2", meta.tone)}>
        {done ? <CheckCircle2 className="size-4 text-success" /> : <meta.icon className="size-4" />}
      </div>
      <div className="min-w-0 flex-1">
        <p className={cn("text-sm font-semibold text-navy", done && "line-through")}>
          {task.title}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">{task.objective}</p>
        <p className="mt-1 text-[11px] font-medium text-muted-foreground">
          {meta.label} · ~{task.minutes} min
          {missed && <span className="ml-1 text-destructive">· missed</span>}
        </p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1.5 sm:flex-row sm:items-center">
        {!done && onReschedule && (
          <Button size="sm" variant="ghost" onClick={onReschedule} disabled={busy}>
            Reschedule
          </Button>
        )}
        {!done && onDone && (
          <Button size="sm" variant="ghost" onClick={onDone} disabled={busy} aria-label="Mark done">
            Done
          </Button>
        )}
        {!done && onStart && (
          <Button size="sm" onClick={onStart} disabled={busy}>
            Start
          </Button>
        )}
      </div>
    </div>
  );
}
