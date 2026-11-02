// Server-only AI helpers. Never import this from client components.
import { createOpenAI } from "@ai-sdk/openai";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/integrations/supabase/types";
import { computeSkillStats, LEVEL_LABEL } from "@/lib/domain/mastery";
import { estimateScore } from "@/lib/domain/scoring";

export const AI_GATEWAY_URL = "https://ai.gateway.lovable.dev/v1";
export const DEFAULT_MODEL = "google/gemini-3.7-flash";

export function aiConfigured() {
  return !!process.env["LOVABLE_API_KEY"];
}

export function aiModel() {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new AiNotConfiguredError();
  const provider = createOpenAI({ baseURL: AI_GATEWAY_URL, apiKey: key, name: "lovable" });
  return provider.chat(process.env["AI_MODEL"] || DEFAULT_MODEL);
}

export class AiNotConfiguredError extends Error {
  constructor() {
    super(
      "AI is not configured. Enable Lovable AI for this project (it provides LOVABLE_API_KEY on the server).",
    );
  }
}

type Db = SupabaseClient<Database>;

/** Verifies a bearer token from a raw Request and returns a user-scoped (RLS-enforced) client. */
export async function userClientFromRequest(
  request: Request,
): Promise<{ supabase: Db; userId: string }> {
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key) throw new Error("Missing Supabase environment variables.");
  const auth = request.headers.get("authorization") ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token || token.split(".").length !== 3) throw new UnauthorizedError();
  const supabase = createClient<Database>(url, key, {
    global: {
      headers: { Authorization: `Bearer ${token}` },
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      },
    },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await supabase.auth.getClaims(token);
  if (error || !data?.claims?.sub) throw new UnauthorizedError();
  return { supabase, userId: data.claims.sub };
}

export class UnauthorizedError extends Error {
  constructor() {
    super("Unauthorized");
  }
}

/**
 * Builds a compact, non-identifying summary of the student's learning data for the model:
 * exam, goals, schedule, mastery by skill, recent misses. No name or email is included.
 */
export async function studentContext(supabase: Db, userId: string, examOverride?: string) {
  const [profileRes, skillsRes, attemptsRes] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
    supabase.from("skills").select("*").order("sort"),
    supabase
      .from("question_attempts")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(400),
  ]);
  const p = profileRes.data;
  const exam =
    (examOverride === "ACT" || examOverride === "SAT" ? examOverride : p?.active_exam) === "ACT"
      ? "ACT"
      : "SAT";
  const skills = (skillsRes.data ?? []).filter((s) => s.exam === exam);
  const attempts = (attemptsRes.data ?? []).filter((a) => a.exam === exam).reverse();
  const stats = computeSkillStats(attempts);
  const est = estimateScore(exam, attempts, p?.act_include_science ?? true);

  const skillLines = skills.map((s) => {
    const st = stats.get(s.id);
    return `- ${s.section} / ${s.domain} (${s.name}): ${st ? `${LEVEL_LABEL[st.level]}, mastery ${Math.round(st.mastery * 100)}%, ${st.correct}/${st.attempts} correct` : "no data yet"}`;
  });

  const misses = attempts.filter((a) => !a.is_correct).slice(-5);
  let missLines: string[] = [];
  if (misses.length) {
    const qs = await supabase
      .from("questions")
      .select("id,prompt,choices,correct_index,skill_id")
      .in(
        "id",
        misses.map((m) => m.question_id),
      );
    const byId = new Map((qs.data ?? []).map((q) => [q.id, q]));
    missLines = misses.map((m) => {
      const q = byId.get(m.question_id);
      const choices = Array.isArray(q?.choices) ? (q!.choices as string[]) : [];
      return `- [${m.skill_id}] "${(q?.prompt ?? "").slice(0, 160)}" — chose ${m.selected_index != null ? `"${choices[m.selected_index] ?? "?"}"` : "nothing"}, correct "${choices[m.correct_index] ?? "?"}"`;
    });
  }

  const text = [
    `Exam: ${exam}${exam === "ACT" ? ` (enhanced format; Science ${p?.act_include_science ? "included" : "not taken"}; Writing prep ${p?.act_include_writing ? "on" : "off"})` : " (digital SAT)"}`,
    p?.grade ? `Grade: ${p.grade}` : null,
    p?.target_score ? `Target score: ${p.target_score}` : null,
    p?.current_score ? `Self-reported practice score: ${p.current_score}` : null,
    p?.test_date ? `Test date: ${p.test_date}` : null,
    `Learning style preference: ${p?.learning_style ?? "mixed"}`,
    est.ready
      ? `Informal estimated range from practice: ${est.low}-${est.high}`
      : "Not enough data for a score estimate yet.",
    `Total answered (${exam}): ${attempts.length}`,
    "Skill mastery:",
    ...skillLines,
    missLines.length ? "Recent missed questions:" : null,
    ...missLines,
  ]
    .filter(Boolean)
    .join("\n");
  return { text, exam, profile: p, stats, skills };
}

export function tutorSystemPrompt(context: string, mode: "chat" | "steps") {
  return `You are ScoreSpring, a patient, expert SAT and ACT tutor for a high-school student.

Teaching rules:
- Match the exam in the student context. Digital SAT: Reading and Writing (short passages, one question each) and Math (calculator allowed, student-produced responses exist). Enhanced ACT: English, Math, Reading, optional Science; ACT Math has no formula sheet. Never mix formats.
- Pitch explanations at the student's demonstrated level (see mastery below). If they're struggling with a skill, use simpler language and smaller steps.
- When the student is working a problem, ask a guiding question or give a hint before revealing the full solution, unless they explicitly ask for the answer.
- When an answer is wrong, name the specific misconception behind it, then show the correct reasoning.
- Offer a similar practice problem after explaining, and check their answer when they reply.
- Be warm but direct. No generic praise ("Great question!"). Keep responses focused; use short paragraphs, numbered steps and LaTeX-free plain math (x², √, ≤).
- Any practice question you write is original, labeled as unofficial practice, and must have exactly one defensible correct answer.
- Never claim to produce official scores; any score talk is an informal estimate.
- If asked about anything unrelated to test prep or studying, briefly redirect.
${
  mode === "steps"
    ? `
PROBLEM-SOLVING MODE: The student wants to work through one problem step by step.
- If they haven't given a problem, ask for one or offer one at their level for their weakest skill.
- Present only ONE step at a time. End each message with a short question asking the student to do that step.
- Wait for their attempt; confirm or correct it, then move to the next step.
- Only give the final answer after they've worked through the steps or ask for it.`
    : ""
}

Student context (from their saved practice data):
${context}`;
}

/** Pull the first JSON object out of a model response (handles code fences and leading prose). */
export function extractJson<T>(text: string): T {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = fenced?.[1] ?? text;
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start < 0 || end < start) throw new Error("Model did not return JSON");
  return JSON.parse(raw.slice(start, end + 1)) as T;
}
