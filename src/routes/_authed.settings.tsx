import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Loader2, LogOut } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { ErrorState, LoadingState, PageHeader, Panel } from "@/components/app/common";
import {
  ChoiceGrid,
  NumberChips,
  SUBJECTS,
  validateScores,
  type ProfileForm,
} from "@/components/app/profile-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/lib/auth";
import { DEMO_ENABLED } from "@/lib/demo";
import { regeneratePlan, useStudentModel, useUpdateProfile, type Profile } from "@/lib/data";
import { SCORE_RANGE } from "@/lib/domain/exams";

export const Route = createFileRoute("/_authed/settings")({
  head: () => ({ meta: [{ title: "Settings — ScoreSpring" }] }),
  component: Settings,
});

function toForm(p: Profile): ProfileForm {
  return {
    display_name: p.display_name ?? "",
    exam: (p.exam as ProfileForm["exam"]) ?? "SAT",
    active_exam: p.active_exam === "ACT" ? "ACT" : "SAT",
    grade: p.grade ? String(p.grade) : "",
    current_score: p.current_score != null ? String(p.current_score) : "",
    knows_score: p.current_score != null,
    target_score: p.target_score != null ? String(p.target_score) : "",
    test_date: p.test_date ?? "",
    minutes_per_day: p.minutes_per_day,
    days_per_week: p.days_per_week,
    strengths: p.strengths,
    weaknesses: p.weaknesses,
    learning_style: p.learning_style as ProfileForm["learning_style"],
    act_include_science: p.act_include_science,
    act_include_writing: p.act_include_writing,
  };
}

function Settings() {
  const m = useStudentModel();
  if (m.isLoading) return <LoadingState />;
  if (m.error || !m.profile) return <ErrorState error={m.error ?? "Profile missing"} />;
  return <SettingsForm key={m.profile.updated_at} profile={m.profile} />;
}

function SettingsForm({ profile }: { profile: Profile }) {
  const m = useStudentModel();
  const { user, signOut } = useAuth();
  const update = useUpdateProfile();
  const qc = useQueryClient();
  const [f, setF] = useState<ProfileForm>(() => toForm(profile));
  const [saving, setSaving] = useState(false);
  const set = <K extends keyof ProfileForm>(k: K, v: ProfileForm[K]) =>
    setF((p) => ({ ...p, [k]: v }));
  const toggle = (k: "strengths" | "weaknesses", v: string) =>
    setF((p) => ({ ...p, [k]: p[k].includes(v) ? p[k].filter((x) => x !== v) : [...p[k], v] }));
  const range = SCORE_RANGE[f.active_exam];
  const subjects =
    f.exam === "BOTH" ? Array.from(new Set([...SUBJECTS.SAT, ...SUBJECTS.ACT])) : SUBJECTS[f.exam];

  async function save() {
    const err = validateScores({ ...f, knows_score: !!f.current_score });
    if (err) return void toast.error(err);
    if (!user) return;
    setSaving(true);
    try {
      const saved = await update.mutateAsync({
        display_name: f.display_name.trim() || null,
        exam: f.exam,
        active_exam: f.exam === "BOTH" ? f.active_exam : f.exam,
        grade: f.grade ? Number(f.grade) : null,
        current_score: f.current_score ? Number(f.current_score) : null,
        target_score: f.target_score ? Number(f.target_score) : null,
        test_date: f.test_date || null,
        minutes_per_day: f.minutes_per_day,
        days_per_week: f.days_per_week,
        strengths: f.strengths,
        weaknesses: f.weaknesses,
        learning_style: f.learning_style,
        act_include_science: f.act_include_science,
        act_include_writing: f.act_include_writing,
      });
      await regeneratePlan({
        uid: user.id,
        profile: saved,
        skills: m.skills,
        attempts: m.all,
        completedLessons: m.completedLessons,
      });
      await qc.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Saved — your plan was updated to match");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Settings"
        description="Edit your goals and schedule any time. Saving recalculates the upcoming week of your plan; completed work is kept."
      />
      <div className="space-y-6">
        <Panel title="Profile">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="dn">Name</Label>
              <Input
                id="dn"
                value={f.display_name}
                onChange={(e) => set("display_name", e.target.value)}
              />
            </div>
            {!DEMO_ENABLED && (
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input value={user?.email ?? ""} disabled />
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="gr">Grade</Label>
              <Input
                id="gr"
                type="number"
                min={6}
                max={12}
                value={f.grade}
                onChange={(e) => set("grade", e.target.value)}
              />
            </div>
          </div>
        </Panel>

        <Panel title="Exam & goals">
          <div className="space-y-5">
            <ChoiceGrid
              value={f.exam}
              onChange={(v) =>
                setF((p) => ({ ...p, exam: v, active_exam: v === "BOTH" ? p.active_exam : v }))
              }
              options={[
                { value: "SAT", label: "SAT" },
                { value: "ACT", label: "ACT" },
                { value: "BOTH", label: "Both" },
              ]}
            />
            {f.exam === "BOTH" && (
              <div className="space-y-1.5">
                <Label>Active exam</Label>
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
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="cs">Current practice score</Label>
                <Input
                  id="cs"
                  type="number"
                  min={range.min}
                  max={range.max}
                  step={range.step}
                  value={f.current_score}
                  onChange={(e) => set("current_score", e.target.value)}
                  placeholder="Optional"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ts">Target score</Label>
                <Input
                  id="ts"
                  type="number"
                  min={range.min}
                  max={range.max}
                  step={range.step}
                  value={f.target_score}
                  onChange={(e) => set("target_score", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="td">Test date</Label>
                <Input
                  id="td"
                  type="date"
                  value={f.test_date}
                  onChange={(e) => set("test_date", e.target.value)}
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Scores are for the {f.active_exam} ({range.min}–{range.max}).
            </p>
          </div>
        </Panel>

        <Panel title="Schedule">
          <div className="space-y-4">
            <div>
              <Label className="mb-2 block">Minutes per day</Label>
              <NumberChips
                value={f.minutes_per_day}
                onChange={(n) => set("minutes_per_day", n)}
                options={[15, 20, 30, 45, 60, 90]}
                suffix=" min"
              />
            </div>
            <div>
              <Label className="mb-2 block">Days per week</Label>
              <NumberChips
                value={f.days_per_week}
                onChange={(n) => set("days_per_week", n)}
                options={[2, 3, 4, 5, 6, 7]}
              />
            </div>
          </div>
        </Panel>

        <Panel title="Learning preferences">
          <div className="space-y-5">
            <ChoiceGrid
              value={f.learning_style}
              onChange={(v) => set("learning_style", v)}
              columns={4}
              options={[
                { value: "explanations", label: "Explanations" },
                { value: "examples", label: "Worked examples" },
                { value: "practice", label: "Practice" },
                { value: "mixed", label: "A mix" },
              ]}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Strongest subjects</Label>
                <ChoiceGrid
                  multi
                  value={f.strengths}
                  onChange={(v) => toggle("strengths", v)}
                  columns={2}
                  options={subjects.map((s) => ({ value: s, label: s }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Weakest subjects</Label>
                <ChoiceGrid
                  multi
                  value={f.weaknesses}
                  onChange={(v) => toggle("weaknesses", v)}
                  columns={2}
                  options={subjects.map((s) => ({ value: s, label: s }))}
                />
              </div>
            </div>
            {f.exam !== "SAT" && (
              <div className="space-y-3 rounded-xl border p-4">
                <label className="flex items-center justify-between gap-4 text-sm">
                  <span>ACT: include Science section</span>
                  <Switch
                    checked={f.act_include_science}
                    onCheckedChange={(v) => set("act_include_science", v)}
                  />
                </label>
                <label className="flex items-center justify-between gap-4 text-sm">
                  <span>ACT: prepare for optional Writing</span>
                  <Switch
                    checked={f.act_include_writing}
                    onCheckedChange={(v) => set("act_include_writing", v)}
                  />
                </label>
              </div>
            )}
          </div>
        </Panel>

        <div className="flex flex-wrap items-center justify-between gap-3">
          {DEMO_ENABLED ? (
            <span />
          ) : (
            <Button variant="ghost" onClick={() => signOut()}>
              <LogOut className="size-4" /> Sign out
            </Button>
          )}
          <Button size="lg" onClick={save} disabled={saving}>
            {saving && <Loader2 className="size-4 animate-spin" />} Save changes
          </Button>
        </div>
      </div>
    </div>
  );
}
