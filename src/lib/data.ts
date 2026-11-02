import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";

import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";
import { useAuth } from "@/lib/auth";
import type { Exam } from "@/lib/domain/exams";
import { computeSkillStats, type AttemptLite } from "@/lib/domain/mastery";
import { buildWeekPlan, toISODate } from "@/lib/domain/plan";
import { estimateScore } from "@/lib/domain/scoring";

export type Profile = Tables<"profiles">;
export type Skill = Tables<"skills">;
export type Question = Tables<"questions">;
export type Attempt = Tables<"question_attempts">;
export type Session = Tables<"sessions">;
export type StudyTask = Tables<"study_tasks">;

export function useUserId() {
  return useAuth().user?.id ?? null;
}

function must<T>(res: { data: T; error: { message: string } | null }): NonNullable<T> {
  if (res.error) throw new Error(res.error.message);
  return res.data as NonNullable<T>;
}

/* ------------------------------------------------------------------ queries */

export function useProfile() {
  const uid = useUserId();
  return useQuery({
    queryKey: ["profile", uid],
    enabled: !!uid,
    queryFn: async () => {
      const res = await supabase.from("profiles").select("*").eq("id", uid!).maybeSingle();
      if (res.error) throw new Error(res.error.message);
      if (res.data) return res.data;
      // The signup trigger normally creates the row; create it defensively if missing.
      const created = await supabase.from("profiles").insert({ id: uid! }).select("*").single();
      return must(created);
    },
  });
}

export function useSkills() {
  const uid = useUserId();
  return useQuery({
    queryKey: ["skills"],
    enabled: !!uid,
    staleTime: Infinity,
    queryFn: async () => must(await supabase.from("skills").select("*").order("sort")),
  });
}

export function useAttempts() {
  const uid = useUserId();
  return useQuery({
    queryKey: ["attempts", uid],
    enabled: !!uid,
    queryFn: async () =>
      must(
        await supabase
          .from("question_attempts")
          .select("*")
          .eq("user_id", uid!)
          .order("created_at", { ascending: true })
          .limit(5000),
      ),
  });
}

export function useLessonProgress() {
  const uid = useUserId();
  return useQuery({
    queryKey: ["lessons", uid],
    enabled: !!uid,
    queryFn: async () =>
      must(await supabase.from("lesson_progress").select("*").eq("user_id", uid!)),
  });
}

export function useTasks() {
  const uid = useUserId();
  return useQuery({
    queryKey: ["tasks", uid],
    enabled: !!uid,
    queryFn: async () => {
      const since = new Date();
      since.setDate(since.getDate() - 21);
      return must(
        await supabase
          .from("study_tasks")
          .select("*")
          .eq("user_id", uid!)
          .gte("scheduled_date", toISODate(since))
          .order("scheduled_date")
          .order("created_at"),
      );
    },
  });
}

export function useSessions() {
  const uid = useUserId();
  return useQuery({
    queryKey: ["sessions", uid],
    enabled: !!uid,
    queryFn: async () =>
      must(
        await supabase
          .from("sessions")
          .select("*")
          .eq("user_id", uid!)
          .order("started_at", { ascending: false })
          .limit(200),
      ),
  });
}

export function useSessionById(id: string) {
  const uid = useUserId();
  return useQuery({
    queryKey: ["session", id],
    enabled: !!uid,
    queryFn: async () => must(await supabase.from("sessions").select("*").eq("id", id).single()),
  });
}

export function useQuestionsForExam(exam: Exam | undefined) {
  const uid = useUserId();
  return useQuery({
    queryKey: ["questions", exam],
    enabled: !!uid && !!exam,
    queryFn: async () =>
      must(
        await supabase
          .from("questions")
          .select("*")
          .eq("exam", exam!)
          .in("review_status", ["approved", "ai_verified"]),
      ),
  });
}

export async function fetchQuestionsByIds(ids: string[]) {
  if (ids.length === 0) return [] as Question[];
  const rows = must(await supabase.from("questions").select("*").in("id", ids));
  const map = new Map(rows.map((q) => [q.id, q]));
  return ids.map((id) => map.get(id)).filter((q): q is Question => !!q);
}

/* ---------------------------------------------------------------- derived */

export function toLite(a: Attempt): AttemptLite {
  return {
    skill_id: a.skill_id,
    section: a.section,
    exam: a.exam,
    difficulty: a.difficulty,
    is_correct: a.is_correct,
    time_ms: a.time_ms,
    created_at: a.created_at,
    used_hint: a.used_hint,
  };
}

export function activeExam(p: Profile | undefined | null): Exam {
  return p?.active_exam === "ACT" ? "ACT" : "SAT";
}

/** Consecutive days (ending today or yesterday) with at least one answered question or finished task. */
export function computeStreak(dates: string[], today = new Date()) {
  const days = new Set(dates.map((d) => toISODate(new Date(d))));
  const cursor = new Date(today);
  if (!days.has(toISODate(cursor))) cursor.setDate(cursor.getDate() - 1);
  let streak = 0;
  while (days.has(toISODate(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function useStudentModel() {
  const profile = useProfile();
  const skills = useSkills();
  const attempts = useAttempts();
  const lessons = useLessonProgress();
  const tasks = useTasks();

  const exam = activeExam(profile.data);
  const model = useMemo(() => {
    const all = attempts.data ?? [];
    const examAttempts = all.filter((a) => a.exam === exam);
    const lite = examAttempts.map(toLite);
    const stats = computeSkillStats(lite);
    const estimate = estimateScore(exam, lite, profile.data?.act_include_science ?? true);
    const examSkills = (skills.data ?? []).filter(
      (s) =>
        s.exam === exam &&
        (exam !== "ACT" || profile.data?.act_include_science !== false || s.section !== "Science"),
    );
    const completedLessons = new Set((lessons.data ?? []).map((l) => l.skill_id));
    const lessonDates = new Map((lessons.data ?? []).map((l) => [l.skill_id, l.completed_at]));
    const activity = [
      ...all.map((a) => a.created_at),
      ...(tasks.data ?? []).filter((t) => t.completed_at).map((t) => t.completed_at!),
    ];
    const streak = computeStreak(activity);
    const weekAgo = Date.now() - 7 * 86400000;
    const weekMinutes = Math.round(
      all
        .filter((a) => new Date(a.created_at).getTime() >= weekAgo)
        .reduce((s, a) => s + a.time_ms, 0) /
        60000 +
        (tasks.data ?? [])
          .filter(
            (t) =>
              t.kind === "lesson" &&
              t.completed_at &&
              new Date(t.completed_at).getTime() >= weekAgo,
          )
          .reduce((s, t) => s + t.minutes, 0),
    );
    const hasDiagnostic = examAttempts.some((a) => a.kind === "diagnostic");
    const weakest = [...examSkills]
      .map((s) => ({ skill: s, stat: stats.get(s.id) }))
      .sort((a, b) => (a.stat?.mastery ?? 0.55) - (b.stat?.mastery ?? 0.55));
    return {
      exam,
      all,
      examAttempts,
      stats,
      estimate,
      examSkills,
      completedLessons,
      lessonDates,
      streak,
      weekMinutes,
      hasDiagnostic,
      weakest,
    };
  }, [
    attempts.data,
    skills.data,
    lessons.data,
    tasks.data,
    exam,
    profile.data?.act_include_science,
  ]);

  const isLoading =
    profile.isLoading ||
    skills.isLoading ||
    attempts.isLoading ||
    lessons.isLoading ||
    tasks.isLoading;
  const error = profile.error || skills.error || attempts.error || lessons.error || tasks.error;
  return {
    ...model,
    profile: profile.data,
    skills: skills.data ?? [],
    tasks: tasks.data ?? [],
    isLoading,
    error,
  };
}

/* -------------------------------------------------------------- mutations */

export function useUpdateProfile() {
  const qc = useQueryClient();
  const uid = useUserId();
  return useMutation({
    mutationFn: async (patch: TablesUpdate<"profiles">) =>
      must(await supabase.from("profiles").update(patch).eq("id", uid!).select("*").single()),
    onSuccess: (data) => {
      qc.setQueryData(["profile", uid], data);
    },
  });
}

/** Replace today's-and-future pending tasks with a freshly computed week plan. */
export async function regeneratePlan(args: {
  uid: string;
  profile: Profile;
  skills: Skill[];
  attempts: Attempt[];
  completedLessons: Set<string>;
}) {
  const exam = activeExam(args.profile);
  const lite = args.attempts.filter((a) => a.exam === exam).map(toLite);
  const stats = computeSkillStats(lite);
  const skills = args.skills.filter(
    (s) =>
      s.exam === exam &&
      (exam !== "ACT" || args.profile.act_include_science || s.section !== "Science"),
  );
  const today = new Date();
  const plan = buildWeekPlan({
    profile: {
      exam,
      minutesPerDay: args.profile.minutes_per_day,
      daysPerWeek: args.profile.days_per_week,
      testDate: args.profile.test_date,
    },
    skills,
    stats,
    completedLessons: args.completedLessons,
    hasDiagnostic: args.attempts.some((a) => a.exam === exam && a.kind === "diagnostic"),
    today,
  });
  const del = await supabase
    .from("study_tasks")
    .delete()
    .eq("user_id", args.uid)
    .eq("status", "pending")
    .gte("scheduled_date", toISODate(today));
  if (del.error) throw new Error(del.error.message);
  if (plan.length === 0) return [];
  const rows: TablesInsert<"study_tasks">[] = plan.map((t) => ({ ...t, user_id: args.uid }));
  return must(await supabase.from("study_tasks").insert(rows).select("*"));
}

export async function markTaskDone(taskId: string | undefined | null) {
  if (!taskId) return;
  await supabase
    .from("study_tasks")
    .update({ status: "done", completed_at: new Date().toISOString() })
    .eq("id", taskId);
}
