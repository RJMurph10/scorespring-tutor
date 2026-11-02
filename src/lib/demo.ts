/**
 * DEMO MODE — explore the whole app without signing in.
 *
 * When enabled, a visitor who isn't signed in is dropped straight into the app as a sample
 * student. All "database" reads and writes are answered by an in-browser store (localStorage),
 * so nothing touches the real Supabase project and every visitor gets their own private copy.
 *
 * To put the sign-in wall back, set DEMO_ENABLED to false. Nothing else needs to change.
 */
import { DEMO_QUESTIONS, DEMO_SKILLS } from "@/lib/demo-seed";
import { QUESTION_BANK } from "@/lib/question-bank";
import { computeSkillStats, type AttemptLite } from "@/lib/domain/mastery";
import { buildWeekPlan, toISODate } from "@/lib/domain/plan";

export const DEMO_ENABLED = true;

const FLAG_KEY = "scorespring-demo";
// Bump the version when the sample data changes so existing demo visitors get fresh data.
const DB_KEY = "scorespring-demo-db-v2";
export const DEMO_UID = "de300000-0000-4000-8000-000000000001";

const SUPABASE_URL = ((import.meta.env["VITE_SUPABASE_URL"] as string | undefined) ?? "").replace(
  /\/+$/,
  "",
);
function authStorageKey() {
  try {
    return `sb-${new URL(SUPABASE_URL).hostname.split(".")[0]}-auth-token`;
  } catch {
    return "sb-demo-auth-token";
  }
}

type Row = Record<string, unknown>;
type Db = Record<string, Row[]>;

export function isDemo() {
  if (typeof window === "undefined") return false;
  try {
    return DEMO_ENABLED && localStorage.getItem(FLAG_KEY) === "1";
  } catch {
    return false;
  }
}

/* ----------------------------------------------------------------- session */

function b64url(o: unknown) {
  return btoa(JSON.stringify(o)).replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function demoSession() {
  const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30;
  const user = {
    id: DEMO_UID,
    aud: "authenticated",
    role: "authenticated",
    email: "demo@scorespring.app",
    app_metadata: { provider: "demo" },
    user_metadata: { display_name: "Alex" },
    created_at: new Date().toISOString(),
  };
  const token = `${b64url({ alg: "none", typ: "JWT" })}.${b64url({ sub: DEMO_UID, exp, role: "authenticated", email: user.email })}.demo`;
  return {
    access_token: token,
    refresh_token: "demo",
    token_type: "bearer",
    expires_in: 2592000,
    expires_at: exp,
    user,
  };
}

/** Enter demo mode and reload into the app. */
export function startDemo(redirect = "/dashboard") {
  if (!DEMO_ENABLED) return;
  localStorage.setItem(FLAG_KEY, "1");
  if (!localStorage.getItem(DB_KEY)) localStorage.setItem(DB_KEY, JSON.stringify(seedDb()));
  localStorage.setItem(authStorageKey(), JSON.stringify(demoSession()));
  window.location.assign(redirect);
}

/** Wipe the sample data and start again from a fresh sample student. */
export function resetDemo(redirect = "/dashboard") {
  localStorage.setItem(DB_KEY, JSON.stringify(seedDb()));
  window.location.assign(redirect);
}

export function exitDemo(redirect = "/") {
  localStorage.removeItem(FLAG_KEY);
  localStorage.removeItem(DB_KEY);
  localStorage.removeItem(authStorageKey());
  window.location.assign(redirect);
}

/* -------------------------------------------------------------- seed data */

function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function uuid() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : "xxxxxxxx-xxxx-4xxx-8xxx-xxxxxxxxxxxx".replace(/x/g, () =>
        Math.floor(Math.random() * 16).toString(16),
      );
}

/** A believable sample student: diagnostic two weeks ago, steady practice since, a few weak spots. */
function seedDb(): Db {
  const r = rng(20261101);
  const now = Date.now();
  const day = 86400000;
  const at = (daysAgo: number, minute = 0) =>
    new Date(now - daysAgo * day + minute * 60000 - 2 * 3600000).toISOString();

  const ability: Record<string, number> = {
    "sat-algebra": 0.82,
    "sat-advanced-math": 0.48,
    "sat-psda": 0.7,
    "sat-geo-trig": 0.55,
    "sat-info-ideas": 0.74,
    "sat-craft-structure": 0.62,
    "sat-expression-ideas": 0.78,
    "sat-conventions": 0.45,
    "act-eng-conventions": 0.66,
    "act-eng-rhetoric": 0.72,
    "act-math-algebra": 0.7,
    "act-math-geometry": 0.5,
    "act-reading-key-ideas": 0.68,
    "act-reading-craft": 0.6,
    "act-sci-data": 0.75,
    "act-sci-experiments": 0.52,
  };

  const questions = [
    ...DEMO_QUESTIONS.map((q) => ({
      ...q,
      source: "Original practice content",
      generation_method: "human_authored",
    })),
    ...QUESTION_BANK.map((q) => ({
      ...q,
      source: "Original ScoreSpring practice content (AI-drafted; answer keys checked)",
      generation_method: "ai_generated",
    })),
  ].map((q) => ({ ...q, review_status: "approved", created_by: null, created_at: at(30) }));
  const bySkill = new Map<string, typeof questions>();
  for (const q of questions) bySkill.set(q.skill_id, [...(bySkill.get(q.skill_id) ?? []), q]);

  const attempts: Row[] = [];
  const sessions: Row[] = [];

  function runSession(o: {
    kind: "diagnostic" | "practice" | "test";
    exam: "SAT" | "ACT";
    daysAgo: number;
    title: string;
    picks: typeof questions;
    growth: number;
    mode: string;
    showFeedback: boolean;
  }) {
    const id = uuid();
    const answers: Record<string, unknown> = {};
    let correct = 0;
    const bySection: Record<string, { correct: number; total: number }> = {};
    const bySkillRes: Record<string, { correct: number; total: number }> = {};
    let time = 0;
    o.picks.forEach((q, i) => {
      const p = Math.min(0.95, (ability[q.skill_id] ?? 0.6) + o.growth - (q.difficulty - 2) * 0.12);
      const ok = r() < p;
      const wrong = [0, 1, 2, 3].filter((x) => x !== q.correct_index);
      const selected = ok ? q.correct_index : wrong[Math.floor(r() * wrong.length)]!;
      const timeMs = Math.round(q.est_seconds * (0.7 + r() * 0.8) * 1000);
      time += timeMs;
      if (ok) correct++;
      (bySection[q.section] ??= { correct: 0, total: 0 }).total++;
      if (ok) bySection[q.section]!.correct++;
      (bySkillRes[q.skill_id] ??= { correct: 0, total: 0 }).total++;
      if (ok) bySkillRes[q.skill_id]!.correct++;
      answers[q.id] = {
        selected,
        timeMs,
        flagged: false,
        usedHint: false,
        confidence: o.kind === "diagnostic" ? (ok ? 3 : 2) : null,
        submitted: o.showFeedback,
      };
      attempts.push({
        id: uuid(),
        user_id: DEMO_UID,
        session_id: id,
        question_id: q.id,
        kind: o.kind,
        exam: o.exam,
        section: q.section,
        skill_id: q.skill_id,
        difficulty: q.difficulty,
        selected_index: selected,
        correct_index: q.correct_index,
        is_correct: ok,
        time_ms: timeMs,
        confidence: o.kind === "diagnostic" ? (ok ? 3 : 2) : null,
        used_hint: false,
        created_at: at(o.daysAgo, i * 2),
      });
    });
    const sections = Array.from(new Set(o.picks.map((q) => q.section)));
    sessions.push({
      id,
      user_id: DEMO_UID,
      kind: o.kind,
      exam: o.exam,
      mode: o.mode,
      title: o.title,
      config: {
        showFeedback: o.showFeedback,
        allowHints: o.showFeedback,
        askConfidence: o.kind === "diagnostic",
        sections: sections.map((s) => ({
          label: o.kind === "practice" ? o.title : s,
          section: s,
          questionIds: o.picks.filter((q) => q.section === s).map((q) => q.id),
          seconds: null,
        })),
        ...(o.kind === "test"
          ? {
              unofficial: true,
              description:
                "Unofficial practice test — original questions, not an official College Board or ACT exam.",
            }
          : {}),
        ...(o.kind === "diagnostic"
          ? {
              description:
                "Informal diagnostic — results estimate your starting point, not an official score.",
            }
          : {}),
      },
      question_ids: o.picks.map((q) => q.id),
      state: { sectionIdx: sections.length - 1, index: 0, answers, remaining: {} },
      status: "completed",
      results: {
        total: o.picks.length,
        correct,
        answered: o.picks.length,
        avgTimeMs: Math.round(time / o.picks.length),
        bySection,
        bySkill: bySkillRes,
      },
      started_at: at(o.daysAgo),
      completed_at: at(o.daysAgo, o.picks.length * 2),
    });
  }

  const skillsFor = (exam: string) => DEMO_SKILLS.filter((s) => s.exam === exam);
  const pickPerSkill = (exam: string, n: number) =>
    skillsFor(exam).flatMap((s) => {
      const qs = [...(bySkill.get(s.id) ?? [])].sort(() => r() - 0.5);
      return qs.slice(0, n);
    });

  // SAT: diagnostic, then a run of practice, then a section test
  runSession({
    kind: "diagnostic",
    exam: "SAT",
    daysAgo: 14,
    title: "SAT diagnostic",
    picks: pickPerSkill("SAT", 2),
    growth: -0.05,
    mode: "simulation",
    showFeedback: false,
  });
  const satDays = [12, 11, 9, 8, 6, 5, 4, 2, 1];
  satDays.forEach((d, i) => {
    const weakFirst = [...skillsFor("SAT")].sort(
      (a, b) => (ability[a.id] ?? 0) - (ability[b.id] ?? 0),
    );
    const focus = weakFirst.slice(0, 3 + (i % 3)).map((s) => s.id);
    const pool = questions
      .filter((q) => q.exam === "SAT" && focus.includes(q.skill_id))
      .sort(() => r() - 0.5)
      .slice(0, 6 + (i % 4));
    runSession({
      kind: "practice",
      exam: "SAT",
      daysAgo: d,
      title: i % 3 === 2 ? "Timed practice · mixed topics" : "Learning practice · weak skills",
      picks: pool,
      growth: i * 0.012,
      mode: i % 3 === 2 ? "timed" : "learning",
      showFeedback: i % 3 !== 2,
    });
  });
  runSession({
    kind: "test",
    exam: "SAT",
    daysAgo: 3,
    title: "Unofficial SAT Math section",
    picks: questions
      .filter((q) => q.exam === "SAT" && q.section === "Math")
      .sort(() => r() - 0.5)
      .slice(0, 10),
    growth: 0.05,
    mode: "simulation",
    showFeedback: false,
  });

  // ACT: a diagnostic and a couple of practice sets so the exam switcher has something to show
  runSession({
    kind: "diagnostic",
    exam: "ACT",
    daysAgo: 7,
    title: "ACT diagnostic",
    picks: pickPerSkill("ACT", 2),
    growth: 0,
    mode: "simulation",
    showFeedback: false,
  });
  [5, 2].forEach((d) =>
    runSession({
      kind: "practice",
      exam: "ACT",
      daysAgo: d,
      title: "Learning practice · mixed topics",
      picks: questions
        .filter((q) => q.exam === "ACT")
        .sort(() => r() - 0.5)
        .slice(0, 12),
      growth: 0.04,
      mode: "learning",
      showFeedback: true,
    }),
  );

  attempts.sort((a, b) => String(a["created_at"]).localeCompare(String(b["created_at"])));

  const testDate = new Date(now + 45 * day);
  const profile: Row = {
    id: DEMO_UID,
    display_name: "Alex",
    exam: "BOTH",
    active_exam: "SAT",
    current_score: 1180,
    target_score: 1400,
    test_date: toISODate(testDate),
    grade: 11,
    minutes_per_day: 45,
    days_per_week: 5,
    strengths: ["Reading and Writing"],
    weaknesses: ["Math"],
    learning_style: "mixed",
    act_include_science: true,
    act_include_writing: false,
    onboarded: true,
    created_at: at(15),
    updated_at: at(15),
  };

  const lessons: Row[] = [
    { user_id: DEMO_UID, skill_id: "sat-advanced-math", completed_at: at(8) },
    { user_id: DEMO_UID, skill_id: "sat-conventions", completed_at: at(5) },
  ];

  // This week's plan, built by the real planning engine from the sample attempts.
  const satLite = attempts.filter((a) => a["exam"] === "SAT") as unknown as AttemptLite[];
  const plan = buildWeekPlan({
    profile: { exam: "SAT", minutesPerDay: 45, daysPerWeek: 5, testDate: toISODate(testDate) },
    skills: DEMO_SKILLS.filter((s) => s.exam === "SAT"),
    stats: computeSkillStats(satLite),
    completedLessons: new Set(lessons.map((l) => String(l["skill_id"]))),
    hasDiagnostic: true,
    today: new Date(),
  });
  const yesterday = toISODate(new Date(now - day));
  const tasks: Row[] = [
    {
      kind: "guided_practice",
      skill_id: "sat-geo-trig",
      title: "Guided practice: Area, triangles, circles & right-triangle trig",
      objective:
        "Work through hinted problems on area, triangles, circles & right-triangle trig and fix recurring mistakes.",
      minutes: 15,
      status: "done",
      completed_at: at(1, 30),
      scheduled_date: yesterday,
      exam: "SAT",
    },
    {
      kind: "lesson",
      skill_id: "sat-craft-structure",
      title: "Lesson: Words in context, text structure & purpose",
      objective:
        "Understand the core idea and common traps in words in context, text structure & purpose.",
      minutes: 10,
      status: "pending",
      completed_at: null,
      scheduled_date: yesterday,
      exam: "SAT",
    },
    ...plan.map((t) => ({ ...t, status: "pending", completed_at: null })),
  ].map((t) => ({ id: uuid(), user_id: DEMO_UID, created_at: at(1), ...t }));

  const convId = uuid();
  const conversations: Row[] = [
    {
      id: convId,
      user_id: DEMO_UID,
      exam: "SAT",
      title: "Factoring quadratics (sample)",
      created_at: at(2),
      updated_at: at(2),
    },
  ];
  const msg = (role: "user" | "assistant", text: string, m: number): Row => ({
    id: uuid(),
    conversation_id: convId,
    user_id: DEMO_UID,
    sdk_id: uuid(),
    role,
    parts: [{ type: "text", text }],
    created_at: at(2, m),
  });
  const chat_messages: Row[] = [
    msg("user", "I keep missing questions like x² + x − 12 = 0. Why was my answer wrong?", 0),
    msg(
      "assistant",
      "Looking at your last miss, you picked **4** — that's the number that appears *inside* the factor (x + 4), not the solution.\n\nBefore I show the fix, try this: if (x + 4)(x − 3) = 0, what has to be true about at least one of the two factors?",
      1,
    ),
    msg("user", "One of them has to equal zero?", 2),
    msg(
      "assistant",
      "Exactly. So set each factor to zero:\n\n1. x + 4 = 0 → x = **−4**\n2. x − 3 = 0 → x = **3**\n\nThe trap is flipping the sign. Quick check: plug 3 back in → 9 + 3 − 12 = 0 ✓\n\nYour Advanced Math mastery is still in the *developing* range, so here's a similar one at the same level: **x² − 2x − 15 = 0, and x > 0. What is x?**",
      3,
    ),
  ];

  return {
    profiles: [profile],
    skills: DEMO_SKILLS as unknown as Row[],
    questions: questions as unknown as Row[],
    question_attempts: attempts,
    sessions,
    study_tasks: tasks,
    lesson_progress: lessons,
    conversations,
    chat_messages,
  };
}

/* --------------------------------------------- fake Supabase REST backend */

function loadDb(): Db {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (raw) return JSON.parse(raw) as Db;
  } catch {
    /* fall through */
  }
  const db = seedDb();
  saveDb(db);
  return db;
}

function saveDb(db: Db) {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
  } catch {
    /* storage full or blocked — keep working in memory */
  }
}

function parseList(v: string) {
  return v
    .replace(/^\(|\)$/g, "")
    .split(",")
    .map((s) => s.trim().replace(/^"|"$/g, ""));
}

function applyFilters(rows: Row[], params: URLSearchParams) {
  let out = rows;
  for (const [k, raw] of params) {
    if (["select", "order", "limit", "offset", "on_conflict", "columns"].includes(k)) continue;
    const m = raw.match(/^(not\.)?(eq|neq|in|gte|lte|gt|lt|is)\.(.*)$/);
    if (!m) continue;
    const [, not, op, val] = m;
    const test = (r: Row) => {
      const cell = r[k];
      const s = cell == null ? null : String(cell);
      switch (op) {
        case "eq":
          return s === val;
        case "neq":
          return s !== val;
        case "in":
          return s != null && parseList(val!).includes(s);
        case "gte":
          return s != null && s >= val!;
        case "lte":
          return s != null && s <= val!;
        case "gt":
          return s != null && s > val!;
        case "lt":
          return s != null && s < val!;
        case "is":
          return val === "null" ? cell == null : String(cell) === val;
      }
      return true;
    };
    out = out.filter((r) => (not ? !test(r) : test(r)));
  }
  return out;
}

function applyOrder(rows: Row[], params: URLSearchParams) {
  const order = params.getAll("order").join(",");
  if (!order) return rows;
  const keys = order.split(",").map((o) => {
    const [col, dir] = o.split(".");
    return { col: col!, desc: dir === "desc" };
  });
  return [...rows].sort((a, b) => {
    for (const { col, desc } of keys) {
      const x = String(a[col] ?? "");
      const y = String(b[col] ?? "");
      if (x !== y) return (x < y ? -1 : 1) * (desc ? -1 : 1);
    }
    return 0;
  });
}

const DEFAULTS: Record<string, () => Row> = {
  sessions: () => ({
    id: uuid(),
    started_at: new Date().toISOString(),
    status: "in_progress",
    state: {},
    results: null,
    completed_at: null,
    config: {},
    mode: "learning",
    question_ids: [],
  }),
  question_attempts: () => ({
    id: uuid(),
    created_at: new Date().toISOString(),
    session_id: null,
    confidence: null,
    used_hint: false,
    time_ms: 0,
    selected_index: null,
  }),
  study_tasks: () => ({
    id: uuid(),
    created_at: new Date().toISOString(),
    status: "pending",
    completed_at: null,
    skill_id: null,
  }),
  conversations: () => ({
    id: uuid(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    title: "New conversation",
    exam: "SAT",
  }),
  chat_messages: () => ({ id: uuid(), created_at: new Date().toISOString(), sdk_id: null }),
  lesson_progress: () => ({ completed_at: new Date().toISOString() }),
  questions: () => ({
    id: uuid(),
    created_at: new Date().toISOString(),
    passage: null,
    distractor_notes: {},
    est_seconds: 75,
  }),
  profiles: () => ({ created_at: new Date().toISOString(), updated_at: new Date().toISOString() }),
};
const KEYS: Record<string, string[]> = {
  lesson_progress: ["user_id", "skill_id"],
  profiles: ["id"],
};

function json(body: unknown, status = 200) {
  return new Response(body === undefined ? null : JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

async function handle(
  url: URL,
  method: string,
  headers: Headers,
  body: string | null,
): Promise<Response> {
  const path = url.pathname;
  if (path.startsWith("/auth/v1/")) {
    const s = demoSession();
    if (path.endsWith("/user")) return json(s.user);
    if (path.endsWith("/token")) return json(s);
    if (path.endsWith("/logout")) return new Response(null, { status: 204 });
    return json({});
  }
  const table = path.split("/rest/v1/")[1]?.split("/")[0];
  if (!table) return json({ message: "Not available in demo mode" }, 404);
  const db = loadDb();
  const rows = (db[table] ??= []);
  const single = (headers.get("accept") ?? "").includes("vnd.pgrst.object");
  const prefer = headers.get("prefer") ?? "";
  const wantsRows = prefer.includes("return=representation");
  const respond = (list: Row[], status = 200) => {
    if (single) {
      if (list.length !== 1)
        return json(
          {
            code: "PGRST116",
            message: "JSON object requested, multiple (or no) rows returned",
            details: null,
            hint: null,
          },
          406,
        );
      return json(list[0], status);
    }
    return json(list, status);
  };

  if (method === "GET" || method === "HEAD") {
    let list = applyOrder(applyFilters(rows, url.searchParams), url.searchParams);
    const offset = Number(url.searchParams.get("offset") ?? 0);
    const limit = url.searchParams.get("limit");
    list = list.slice(offset, limit ? offset + Number(limit) : undefined);
    return respond(list);
  }

  if (method === "POST") {
    const input = JSON.parse(body || "[]") as Row | Row[];
    const items = Array.isArray(input) ? input : [input];
    const merge = prefer.includes("resolution=merge-duplicates");
    const keys = KEYS[table];
    const made: Row[] = [];
    for (const item of items) {
      const existing =
        merge && keys ? rows.find((r) => keys.every((k) => r[k] === item[k])) : undefined;
      if (existing) {
        Object.assign(existing, item);
        made.push(existing);
      } else {
        const row = { ...(DEFAULTS[table]?.() ?? {}), ...item };
        rows.push(row);
        made.push(row);
      }
    }
    saveDb(db);
    return wantsRows ? respond(made, 201) : new Response(null, { status: 201 });
  }

  if (method === "PATCH") {
    const patch = JSON.parse(body || "{}") as Row;
    const hit = applyFilters(rows, url.searchParams);
    for (const r of hit)
      Object.assign(r, patch, table === "profiles" ? { updated_at: new Date().toISOString() } : {});
    saveDb(db);
    return wantsRows ? respond(hit) : new Response(null, { status: 204 });
  }

  if (method === "DELETE") {
    const hit = new Set(applyFilters(rows, url.searchParams));
    db[table] = rows.filter((r) => !hit.has(r));
    // cascade the one relationship the app relies on
    if (table === "conversations")
      db["chat_messages"] = (db["chat_messages"] ?? []).filter(
        (m) => ![...hit].some((c) => c["id"] === m["conversation_id"]),
      );
    saveDb(db);
    return wantsRows ? respond([...hit]) : new Response(null, { status: 204 });
  }

  return json({ message: "Unsupported in demo mode" }, 405);
}

/** Route Supabase traffic to the in-browser store while demo mode is on. Installed once at startup. */
function install() {
  if (typeof window === "undefined" || !isDemo() || !SUPABASE_URL) return;
  const w = window as typeof window & { __scorespringDemo?: boolean };
  if (w.__scorespringDemo) return;
  w.__scorespringDemo = true;
  try {
    localStorage.removeItem("scorespring-demo-db"); // sample data from before the question bank
  } catch {
    /* ignore */
  }
  // Keep the stored session fresh so the auth client never tries to refresh against the real backend.
  localStorage.setItem(authStorageKey(), JSON.stringify(demoSession()));
  const original = window.fetch.bind(window);
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const href = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    if (!href.startsWith(SUPABASE_URL + "/")) return original(input, init);
    const req = input instanceof Request ? input : null;
    const headers = new Headers(req?.headers);
    new Headers(init?.headers).forEach((v, k) => headers.set(k, v));
    const method = (init?.method ?? req?.method ?? "GET").toUpperCase();
    const body = typeof init?.body === "string" ? init.body : req ? await req.clone().text() : null;
    return handle(new URL(href), method, headers, body);
  };
}

install();

export const DEMO_AI_MESSAGE =
  "AI features need a real account. Exit the demo and sign up to use them (and enable Lovable AI for the project).";
