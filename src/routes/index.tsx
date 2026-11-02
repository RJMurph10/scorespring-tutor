import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BookOpen,
  CalendarCheck,
  CheckCircle2,
  ClipboardList,
  LineChart,
  Sparkles,
  Target,
} from "lucide-react";

import { Logo } from "@/components/app/common";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";

// No head() here: the home route inherits title/description/og/twitter from __root.tsx.
export const Route = createFileRoute("/")({
  component: Landing,
});

const STEPS = [
  {
    n: "01",
    title: "Diagnose",
    body: "A short mixed-difficulty diagnostic finds the specific skills costing you points.",
  },
  {
    n: "02",
    title: "Plan",
    body: "Your target, test date and free minutes become a week-by-week plan that never overloads a day.",
  },
  {
    n: "03",
    title: "Practice",
    body: "Questions adapt to you — weak skills first, harder as you improve, with spaced review of what you've mastered.",
  },
  {
    n: "04",
    title: "Ask",
    body: "An AI tutor that sees your results explains the misconception, offers a hint first, then walks the steps.",
  },
];

const FEATURES = [
  {
    icon: Sparkles,
    title: "AI tutor",
    body: "Conversational help that knows SAT from ACT, gives hints before answers, and has a step-by-step problem mode.",
  },
  {
    icon: Target,
    title: "Adaptive practice",
    body: "5, 10 or 20-question sets, timed or untimed, by skill or mixed, plus a dedicated weak-skill mode.",
  },
  {
    icon: CalendarCheck,
    title: "Study plan",
    body: "Lessons, drills and review scheduled around your week. Missed a day? Reschedule without losing the plan.",
  },
  {
    icon: BookOpen,
    title: "Lesson library",
    body: "Every SAT and ACT domain: the concept, worked examples, common traps and a mastery check.",
  },
  {
    icon: ClipboardList,
    title: "Practice tests",
    body: "Section-timed simulations with flagging, breaks and saved progress. Clearly labeled unofficial.",
  },
  {
    icon: LineChart,
    title: "Honest analytics",
    body: "Accuracy by skill and difficulty, what's improving and what isn't. Score ranges only once there's enough data.",
  },
];

function Landing() {
  const { session } = useAuth();
  return (
    <div className="min-h-screen overflow-x-hidden bg-background">
      <header className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-8">
        <Logo />
        <nav className="flex items-center gap-2">
          {session ? (
            <Button asChild>
              <Link to="/dashboard">Open dashboard</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost">
                <Link to="/auth">Sign in</Link>
              </Button>
              <Button asChild>
                <Link to="/auth" search={{ mode: "signup" }}>
                  Get started
                </Link>
              </Button>
            </>
          )}
        </nav>
      </header>

      <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 pt-12 pb-20 md:grid-cols-[1.1fr_1fr] md:px-8 md:pt-20">
        <div>
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs font-semibold text-primary">
            SAT · ACT · personalized
          </p>
          <h1 className="text-4xl font-extrabold leading-[1.08] text-navy md:text-[56px]">
            A tutor that remembers what you missed yesterday.
          </h1>
          <p className="mt-5 max-w-xl text-lg text-muted-foreground">
            ScoreSpring diagnoses your skill gaps, builds a plan around your test date, and adapts
            every practice set — with an AI tutor that explains the why behind each mistake.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="h-12 px-6 text-base">
              {session ? (
                <Link to="/dashboard">
                  Continue learning <ArrowRight className="ml-1 size-4" />
                </Link>
              ) : (
                <Link to="/auth" search={{ mode: "signup" }}>
                  Start free diagnostic <ArrowRight className="ml-1 size-4" />
                </Link>
              )}
            </Button>
          </div>
          <ul className="mt-8 space-y-2 text-sm text-muted-foreground">
            {[
              "Original practice questions with full explanations",
              "Informal score ranges — never presented as official scores",
              "Works on phone, tablet and desktop",
            ].map((t) => (
              <li key={t} className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-success" /> {t}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative">
          <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-[radial-gradient(60%_60%_at_70%_30%,oklch(0.93_0.05_258),transparent)]" />
          <div className="rounded-2xl border bg-card p-5 shadow-[0_20px_50px_-20px_rgba(20,40,120,0.25)]">
            <div className="flex items-center justify-between border-b pb-3">
              <p className="text-sm font-semibold text-navy">SAT Math · Advanced Math</p>
              <span className="rounded-md bg-accent px-2 py-0.5 text-xs font-semibold text-primary">
                Learning mode
              </span>
            </div>
            <p className="mt-4 text-[15px] text-navy">
              If x² + x − 12 = 0 and x &gt; 0, what is the value of x?
            </p>
            <div className="mt-4 space-y-2">
              {["2", "3", "4", "6"].map((c, i) => (
                <div
                  key={c}
                  className={`flex items-center gap-3 rounded-lg border px-3 py-2 text-sm ${i === 1 ? "border-success bg-success-soft font-semibold text-navy" : i === 2 ? "border-destructive/40 text-muted-foreground line-through" : ""}`}
                >
                  <span className="flex size-6 items-center justify-center rounded-md border bg-background text-xs font-bold">
                    {"ABCD"[i]}
                  </span>
                  {c}
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-xl bg-muted p-4 text-sm">
              <p className="flex items-center gap-1.5 font-semibold text-navy">
                <Sparkles className="size-4 text-primary" /> Tutor
              </p>
              <p className="mt-1 text-muted-foreground">
                You picked 4 — that's the number <em>inside</em> the factor (x + 4). Set each factor
                to zero: x + 4 = 0 gives x = −4. Want a similar one to try?
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y bg-card">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-16 md:grid-cols-4 md:px-8">
          {STEPS.map((s) => (
            <div key={s.n}>
              <p className="text-sm font-bold text-primary">{s.n}</p>
              <h3 className="mt-2 text-lg font-bold text-navy">{s.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 md:px-8">
        <h2 className="max-w-xl text-3xl font-extrabold text-navy">
          Everything a good private tutor does — on your schedule.
        </h2>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-2xl border bg-card p-6">
              <f.icon className="size-5 text-primary" />
              <h3 className="mt-3 font-bold text-navy">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-xs text-muted-foreground md:flex-row md:justify-between md:px-8">
          <p>© {new Date().getFullYear()} ScoreSpring. Original practice content.</p>
          <p>
            SAT® is a trademark of the College Board; ACT® is a trademark of ACT, Inc. Neither is
            affiliated with ScoreSpring.
          </p>
        </div>
      </footer>
    </div>
  );
}
