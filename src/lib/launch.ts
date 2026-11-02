import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import {
  markTaskDone,
  useQuestionsForExam,
  useStudentModel,
  useUserId,
  type StudyTask,
} from "@/lib/data";
import {
  startDiagnostic,
  startPractice,
  startPracticeTest,
  type PracticeOptions,
} from "@/lib/sessions";

/** Shared "start something" actions used by the dashboard, plan, lessons and practice pages. */
export function useLaunchers() {
  const uid = useUserId();
  const m = useStudentModel();
  const questions = useQuestionsForExam(m.profile ? m.exam : undefined);
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [busy, setBusy] = useState(false);
  const includeScience = m.profile?.act_include_science ?? true;

  async function run(fn: () => Promise<{ id: string }>) {
    if (!uid) return;
    setBusy(true);
    try {
      const s = await fn();
      await qc.invalidateQueries({ queryKey: ["sessions"] });
      navigate({ to: "/session/$id", params: { id: s.id } });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't start the session");
    } finally {
      setBusy(false);
    }
  }

  const pool = () => {
    if (!questions.data) throw new Error("Questions are still loading — try again in a moment.");
    return questions.data;
  };

  const practice = (o: Partial<PracticeOptions> & { count: number; timed: boolean }) =>
    run(() =>
      startPractice({
        uid: uid!,
        exam: m.exam,
        pool: pool(),
        attempts: m.examAttempts,
        stats: m.stats,
        includeScience,
        ...o,
      }),
    );

  const diagnostic = (taskId?: string) =>
    run(() =>
      startDiagnostic({
        uid: uid!,
        exam: m.exam,
        pool: pool(),
        skills: m.skills,
        includeScience,
        taskId,
      }),
    );

  const practiceTest = (sectionsOnly?: string[], taskId?: string) =>
    run(() =>
      startPracticeTest({
        uid: uid!,
        exam: m.exam,
        pool: pool(),
        // Choosing the Science section directly always includes it, even if it's off in Settings.
        includeScience: sectionsOnly?.includes("Science") ? true : includeScience,
        sectionsOnly,
        taskId,
      }),
    );

  const practiceWeakest = () => {
    const w = m.weakest[0];
    if (!w) return toast.error("No skills available yet.");
    return practice({
      count: 5,
      timed: false,
      skillId: w.skill.id,
      title: `Weak-skill practice: ${w.skill.name}`,
    });
  };

  async function launchTask(t: StudyTask) {
    const skillName = m.skills.find((s) => s.id === t.skill_id)?.name;
    switch (t.kind) {
      case "diagnostic":
        return diagnostic(t.id);
      case "lesson":
        return navigate({
          to: "/lessons/$skillId",
          params: { skillId: t.skill_id ?? "" },
          search: { task: t.id },
        });
      case "guided_practice":
        return practice({
          count: 5,
          timed: false,
          skillId: t.skill_id ?? undefined,
          taskId: t.id,
          title: `Guided practice: ${skillName ?? "mixed"}`,
        });
      case "timed_drill":
        return practice({
          count: 5,
          timed: true,
          skillId: t.skill_id ?? undefined,
          taskId: t.id,
          title: `Timed drill: ${skillName ?? "mixed"}`,
        });
      case "review":
        return practice({
          count: 4,
          timed: false,
          skillId: t.skill_id ?? undefined,
          taskId: t.id,
          title: `Spaced review: ${skillName ?? "mixed"}`,
        });
      case "progress_check":
        return practice({ count: 10, timed: false, taskId: t.id, title: "Weekly progress check" });
      case "practice_test":
        return practiceTest(undefined, t.id);
    }
  }

  return {
    busy: busy || questions.isLoading,
    practice,
    diagnostic,
    practiceTest,
    practiceWeakest,
    launchTask,
    markTaskDone: async (id: string) => {
      await markTaskDone(id);
      await qc.invalidateQueries({ queryKey: ["tasks"] });
    },
  };
}
