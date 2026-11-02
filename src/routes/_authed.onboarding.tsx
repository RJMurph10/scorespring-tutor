import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Logo } from "@/components/app/common";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/lib/auth";
import {
  regeneratePlan,
  useAttempts,
  useLessonProgress,
  useProfile,
  useSkills,
  useUpdateProfile,
} from "@/lib/data";
import {
  ChoiceGrid,
  NumberChips,
  SUBJECTS,
  validateScores,
  type ProfileForm,
} from "@/components/app/profile-form";
import { SCORE_RANGE } from "@/lib/domain/exams";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authed/onboarding")({
  head: () => ({ meta: [{ title: "Set up your plan — ScoreSpring" }] }),
  component: Onboarding,
});

const STEPS = ["Your exam", "Your goal", "Your schedule", "How you learn"];

function Onboarding() {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const skills = useSkills();
  const attempts = useAttempts();
  const lessons = useLessonProgress();
  const update = useUpdateProfile();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [f, setF] = useState<ProfileForm>(() => ({
    display_name: profile?.display_name ?? "",
    exam: (profile?.exam as ProfileForm["exam"]) ?? "SAT",
    active_exam: profile?.active_exam === "ACT" ? "ACT" : "SAT",
    grade: profile?.grade ? String(profile.grade) : "11",
    current_score: profile?.current_score ? String(profile.current_score) : "",
    knows_score: !!profile?.current_score,
    target_score: profile?.target_score ? String(profile.target_score) : "",
    test_date: profile?.test_date ?? "",
    minutes_per_day: profile?.minutes_per_day ?? 30,
    days_per_week: profile?.days_per_week ?? 5,
    strengths: profile?.strengths ?? [],
    weaknesses: profile?.weaknesses ?? [],
    learning_style: (profile?.learning_style as ProfileForm["learning_style"]) ?? "mixed",
    act_include_science: profile?.act_include_science ?? true,
    act_include_writing: profile?.act_include_writing ?? false,
  }));
  const set = <K extends keyof ProfileForm>(k: K, v: ProfileForm[K]) =>
    setF((p) => ({ ...p, [k]: v }));
  const toggle = (k: "strengths" | "weaknesses", v: string) =>
    setF((p) => ({ ...p, [k]: p[k].includes(v) ? p[k].filter((x) => x !== v) : [...p[k], v] }));
  const range = SCORE_RANGE[f.active_exam];

  function next() {
    if (step === 1) {
      const err = validateScores(f);
      if (err) return void toast.error(err);
      if (!f.target_score)
        return void toast.error("Add a target score so we can measure progress toward it.");
    }
    setStep((s) => Math.min(STEPS.length - 1, s + 1));
  }

  async function finish() {
    if (!user) return;
    setSaving(true);
    try {
      const saved = await update.mutateAsync({
        display_name: f.display_name.trim() || null,
        exam: f.exam,
        active_exam: f.exam === "BOTH" ? f.active_exam : f.exam,
        grade: f.grade ? Number(f.grade) : null,
        current_score: f.knows_score && f.current_score ? Number(f.current_score) : null,
        target_score: f.target_score ? Number(f.target_score) : null,
        test_date: f.test_date || null,
        minutes_per_day: f.minutes_per_day,
        days_per_week: f.days_per_week,
        strengths: f.strengths,
        weaknesses: f.weaknesses,
        learning_style: f.learning_style,
        act_include_science: f.act_include_science,
        act_include_writing: f.act_include_writing,
        onboarded: true,
      });
      await regeneratePlan({
        uid: user.id,
        profile: saved,
        skills: skills.data ?? [],
        attempts: attempts.data ?? [],
        completedLessons: new Set((lessons.data ?? []).map((l) => l.skill_id)),
      });
      await qc.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Your study plan is ready");
      navigate({ to: "/dashboard" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't save your profile");
    } finally {
      setSaving(false);
    }
  }

  const subjects =
    f.exam === "BOTH" ? Array.from(new Set([...SUBJECTS.SAT, ...SUBJECTS.ACT])) : SUBJECTS[f.exam];

  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex h-16 max-w-2xl items-center justify-between px-4">
        <Logo />
        <span className="text-xs font-medium text-muted-foreground">
          Step {step + 1} of {STEPS.length}
        </span>
      </header>
      <div className="mx-auto max-w-2xl px-4 pb-16">
        <div className="mb-8 grid grid-cols-4 gap-1.5">
          {STEPS.map((s, i) => (
            <div
              key={s}
              className={cn("h-1.5 rounded-full", i <= step ? "bg-primary" : "bg-muted")}
            />
          ))}
        </div>
        <h1 className="text-2xl font-bold text-navy">{STEPS[step]}</h1>

        <div className="mt-6 space-y-7">
          {step === 0 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="dn">What should we call you?</Label>
                <Input
                  id="dn"
                  value={f.display_name}
                  onChange={(e) => set("display_name", e.target.value)}
                  placeholder="First name"
                  className="max-w-xs"
                />
              </div>
              <div className="space-y-2">
                <Label>Which test are you preparing for?</Label>
                <ChoiceGrid
                  value={f.exam}
                  onChange={(v) =>
                    setF((p) => ({ ...p, exam: v, active_exam: v === "BOTH" ? p.active_exam : v }))
                  }
                  options={[
                    { value: "SAT", label: "SAT", hint: "Digital SAT · 400–1600" },
                    { value: "ACT", label: "ACT", hint: "Enhanced ACT · 1–36" },
                    { value: "BOTH", label: "Both", hint: "Switch any time" },
                  ]}
                />
              </div>
              {f.exam === "BOTH" && (
                <div className="space-y-2">
                  <Label>Which one first?</Label>
                  <ChoiceGrid
                    value={f.active_exam}
                    onChange={(v) => set("active_exam", v)}
                    columns={2}
                    options={[
                      { value: "SAT", label: "SAT" },
                      { value: "ACT", label: "ACT" },
                    ]}
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label>Grade</Label>
                <ChoiceGrid
                  value={f.grade}
                  onChange={(v) => set("grade", v)}
                  columns={4}
                  options={["9", "10", "11", "12"].map((g) => ({
                    value: g,
                    label: `${g}th grade`,
                  }))}
                />
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <div className="space-y-2">
                <Label>Do you have a recent {f.active_exam} practice score?</Label>
                <ChoiceGrid
                  value={f.knows_score ? "yes" : "no"}
                  onChange={(v) => set("knows_score", v === "yes")}
                  columns={2}
                  options={[
                    { value: "yes", label: "Yes, I know it" },
                    { value: "no", label: "Not sure", hint: "We'll recommend a diagnostic first" },
                  ]}
                />
              </div>
              {f.knows_score && (
                <div className="space-y-2">
                  <Label htmlFor="cs">Current practice score</Label>
                  <Input
                    id="cs"
                    type="number"
                    inputMode="numeric"
                    min={range.min}
                    max={range.max}
                    step={range.step}
                    value={f.current_score}
                    onChange={(e) => set("current_score", e.target.value)}
                    className="max-w-[160px]"
                    placeholder={f.active_exam === "SAT" ? "e.g. 1150" : "e.g. 24"}
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="ts">Target score</Label>
                <Input
                  id="ts"
                  type="number"
                  inputMode="numeric"
                  min={range.min}
                  max={range.max}
                  step={range.step}
                  value={f.target_score}
                  onChange={(e) => set("target_score", e.target.value)}
                  className="max-w-[160px]"
                  placeholder={f.active_exam === "SAT" ? "e.g. 1350" : "e.g. 30"}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="td">Test date (optional)</Label>
                <Input
                  id="td"
                  type="date"
                  value={f.test_date}
                  min={new Date().toISOString().slice(0, 10)}
                  onChange={(e) => set("test_date", e.target.value)}
                  className="max-w-[200px]"
                />
                <p className="text-xs text-muted-foreground">
                  With a date, your plan shifts toward timed practice and section tests as the day
                  gets close.
                </p>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="space-y-2">
                <Label>Minutes you can study per day</Label>
                <NumberChips
                  value={f.minutes_per_day}
                  onChange={(n) => set("minutes_per_day", n)}
                  options={[15, 20, 30, 45, 60, 90]}
                  suffix=" min"
                />
              </div>
              <div className="space-y-2">
                <Label>Days per week</Label>
                <NumberChips
                  value={f.days_per_week}
                  onChange={(n) => set("days_per_week", n)}
                  options={[2, 3, 4, 5, 6, 7]}
                />
              </div>
              <p className="rounded-xl bg-accent px-4 py-3 text-sm text-navy">
                That's about{" "}
                <strong>{Math.round((f.minutes_per_day * f.days_per_week) / 6) / 10} hours</strong>{" "}
                a week. You can change this any time in Settings.
              </p>
            </>
          )}

          {step === 3 && (
            <>
              <div className="space-y-2">
                <Label>How do you like to learn?</Label>
                <ChoiceGrid
                  value={f.learning_style}
                  onChange={(v) => set("learning_style", v)}
                  columns={2}
                  options={[
                    {
                      value: "explanations",
                      label: "Explanations",
                      hint: "Understand the concept first",
                    },
                    {
                      value: "examples",
                      label: "Worked examples",
                      hint: "See it done step by step",
                    },
                    { value: "practice", label: "Practice problems", hint: "Learn by doing" },
                    { value: "mixed", label: "A mix", hint: "Balance of all three" },
                  ]}
                />
              </div>
              <div className="space-y-2">
                <Label>Strongest subjects (optional)</Label>
                <ChoiceGrid
                  multi
                  value={f.strengths}
                  onChange={(v) => toggle("strengths", v)}
                  columns={2}
                  options={subjects.map((s) => ({ value: s, label: s }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Weakest subjects (optional)</Label>
                <ChoiceGrid
                  multi
                  value={f.weaknesses}
                  onChange={(v) => toggle("weaknesses", v)}
                  columns={2}
                  options={subjects.map((s) => ({ value: s, label: s }))}
                />
              </div>
              {f.exam !== "SAT" && (
                <div className="space-y-3 rounded-xl border bg-card p-4">
                  <p className="text-sm font-semibold text-navy">ACT format</p>
                  <label className="flex items-center justify-between gap-4 text-sm">
                    <span>
                      Include Science
                      <span className="block text-xs text-muted-foreground">
                        Science is optional on the enhanced ACT. Turn off if you're not taking it.
                      </span>
                    </span>
                    <Switch
                      checked={f.act_include_science}
                      onCheckedChange={(v) => set("act_include_science", v)}
                    />
                  </label>
                  <label className="flex items-center justify-between gap-4 text-sm">
                    <span>
                      Prepare for the Writing test
                      <span className="block text-xs text-muted-foreground">
                        Writing practice happens with the AI tutor.
                      </span>
                    </span>
                    <Switch
                      checked={f.act_include_writing}
                      onCheckedChange={(v) => set("act_include_writing", v)}
                    />
                  </label>
                </div>
              )}
            </>
          )}
        </div>

        <div className="mt-10 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0 || saving}
          >
            <ArrowLeft className="size-4" /> Back
          </Button>
          {step < STEPS.length - 1 ? (
            <Button onClick={next}>
              Continue <ArrowRight className="size-4" />
            </Button>
          ) : (
            <Button onClick={finish} disabled={saving}>
              {saving && <Loader2 className="size-4 animate-spin" />} Build my plan
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
