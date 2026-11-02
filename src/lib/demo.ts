/**
 * GUEST MODE — use the whole app without signing in.
 *
 * When enabled, a visitor who isn't signed in starts as a brand-new guest student: onboarding
 * first, then a dashboard built only from their own answers. Nothing is invented — no sample
 * name, scores or history. All "database" reads and writes are answered by an in-browser store
 * (localStorage), so nothing touches the real Supabase project and each visitor's data stays in
 * their own browser.
 *
 * To put the sign-in wall back, set DEMO_ENABLED to false. Nothing else needs to change.
 */
import { DEMO_QUESTIONS, DEMO_SKILLS } from "@/lib/demo-seed";
import { QUESTION_BANK } from "@/lib/question-bank";

export const DEMO_ENABLED = true;

const FLAG_KEY = "scorespring-demo";
// Bump the version when the sample data changes so existing demo visitors get fresh data.
const DB_KEY = "scorespring-guest-db-v3";
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
    email: "",
    app_metadata: { provider: "demo" },
    user_metadata: {},
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

/* ------------------------------------------------------------ guest data */

function uuid() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : "xxxxxxxx-xxxx-4xxx-8xxx-xxxxxxxxxxxx".replace(/x/g, () =>
        Math.floor(Math.random() * 16).toString(16),
      );
}

/**
 * A guest starts exactly like a new student: no name, no scores, no history. Only the shared
 * content (skills and questions) is loaded; everything else comes from what the guest does.
 */
function seedDb(): Db {
  const now = new Date().toISOString();
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
  ].map((q) => ({ ...q, review_status: "approved", created_by: null, created_at: now }));

  return {
    profiles: [],
    skills: DEMO_SKILLS as unknown as Row[],
    questions: questions as unknown as Row[],
    question_attempts: [],
    sessions: [],
    study_tasks: [],
    lesson_progress: [],
    conversations: [],
    chat_messages: [],
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
  profiles: () => ({
    display_name: null,
    exam: "SAT",
    active_exam: "SAT",
    current_score: null,
    target_score: null,
    test_date: null,
    grade: null,
    minutes_per_day: 30,
    days_per_week: 5,
    strengths: [],
    weaknesses: [],
    learning_style: "mixed",
    act_include_science: true,
    act_include_writing: false,
    onboarded: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }),
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
    // Older demo versions stored a made-up sample student; discard it.
    localStorage.removeItem("scorespring-demo-db");
    localStorage.removeItem("scorespring-demo-db-v2");
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
  "AI features need a free account. Create one to use them — your guest progress stays in this browser.";
