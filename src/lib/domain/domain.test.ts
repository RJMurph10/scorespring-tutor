import { describe, expect, it } from "vitest";
import { computeSkillStats, MASTERY_MIN_ATTEMPTS, type AttemptLite } from "./mastery";
import { estimateScore, MIN_ATTEMPTS_PER_SECTION } from "./scoring";
import { selectAdaptive } from "./adaptive";
import { buildWeekPlan } from "./plan";

const att = (skill: string, section: string, ok: boolean, i = 0, exam = "SAT"): AttemptLite => ({
  skill_id: skill,
  section,
  exam,
  difficulty: 2,
  is_correct: ok,
  time_ms: 30000,
  created_at: new Date(2026, 0, 1, 0, i).toISOString(),
});

describe("mastery", () => {
  it("does not mark a skill mastered with fewer than the minimum attempts, even if all correct", () => {
    const list = Array.from({ length: MASTERY_MIN_ATTEMPTS - 1 }, (_, i) =>
      att("a", "Math", true, i),
    );
    expect(computeSkillStats(list).get("a")!.level).not.toBe("mastered");
  });
  it("marks a skill mastered after enough correct attempts", () => {
    const list = Array.from({ length: 12 }, (_, i) => att("a", "Math", true, i));
    expect(computeSkillStats(list).get("a")!.level).toBe("mastered");
  });
});

describe("score estimate", () => {
  it("refuses to estimate until every section has enough answers", () => {
    const list = Array.from({ length: 20 }, (_, i) => att("m", "Math", true, i));
    const est = estimateScore("SAT", list);
    expect(est.ready).toBe(false);
    if (!est.ready) expect(est.needed["Reading and Writing"]).toBe(MIN_ATTEMPTS_PER_SECTION);
  });
  it("produces an SAT range within 400–1600", () => {
    const list = [
      ...Array.from({ length: 10 }, (_, i) => att("m", "Math", i % 2 === 0, i)),
      ...Array.from({ length: 10 }, (_, i) => att("r", "Reading and Writing", true, i)),
    ];
    const est = estimateScore("SAT", list);
    expect(est.ready).toBe(true);
    if (est.ready) {
      expect(est.low).toBeGreaterThanOrEqual(400);
      expect(est.high).toBeLessThanOrEqual(1600);
      expect(est.low).toBeLessThan(est.high);
    }
  });
});

describe("adaptive selection", () => {
  it("favors the weak skill over the mastered skill", () => {
    const stats = computeSkillStats([
      ...Array.from({ length: 10 }, (_, i) => att("weak", "Math", false, i)),
      ...Array.from({ length: 10 }, (_, i) => att("strong", "Math", true, i)),
    ]);
    const pool = Array.from({ length: 20 }, (_, i) => ({
      id: `q${i}`,
      skill_id: i < 10 ? "weak" : "strong",
      difficulty: 1 + (i % 3),
      section: "Math",
    }));
    const ids = selectAdaptive(pool, { count: 10, stats, random: () => 0.5 });
    const weak = ids.filter((id) => Number(id.slice(1)) < 10).length;
    expect(weak).toBeGreaterThan(5);
    expect(weak).toBeLessThan(10); // some spaced review of the strong skill remains
  });
});

describe("study plan", () => {
  const skills = [
    { id: "alg", name: "Algebra", exam: "SAT", section: "Math" },
    { id: "geo", name: "Geometry", exam: "SAT", section: "Math" },
  ];
  it("never schedules more minutes per day than the student has", () => {
    const tasks = buildWeekPlan({
      profile: { minutesPerDay: 20, daysPerWeek: 5, testDate: null, exam: "SAT" },
      skills,
      stats: new Map(),
      completedLessons: new Set(),
      hasDiagnostic: true,
      today: new Date(2026, 0, 5),
    });
    const perDay = new Map<string, number>();
    for (const t of tasks)
      perDay.set(t.scheduled_date, (perDay.get(t.scheduled_date) ?? 0) + t.minutes);
    for (const m of perDay.values()) expect(m).toBeLessThanOrEqual(20);
    expect(perDay.size).toBe(5);
  });
  it("gives more work to the weaker skill", () => {
    const stats = computeSkillStats([
      ...Array.from({ length: 8 }, (_, i) => att("alg", "Math", false, i)),
      ...Array.from({ length: 8 }, (_, i) => att("geo", "Math", true, i)),
    ]);
    const tasks = buildWeekPlan({
      profile: { minutesPerDay: 30, daysPerWeek: 7, testDate: null, exam: "SAT" },
      skills: [
        ...skills,
        { id: "x", name: "X", exam: "SAT", section: "Math" },
        { id: "y", name: "Y", exam: "SAT", section: "Math" },
        { id: "z", name: "Z", exam: "SAT", section: "Math" },
      ],
      stats,
      completedLessons: new Set(),
      hasDiagnostic: true,
      today: new Date(2026, 0, 5),
    });
    const alg = tasks.filter((t) => t.skill_id === "alg" && t.kind !== "review").length;
    const geo = tasks.filter((t) => t.skill_id === "geo" && t.kind !== "review").length;
    expect(alg).toBeGreaterThan(geo);
  });
  it("skips lessons when the test is within two weeks", () => {
    const tasks = buildWeekPlan({
      profile: { minutesPerDay: 30, daysPerWeek: 7, testDate: "2026-01-12", exam: "SAT" },
      skills,
      stats: new Map(),
      completedLessons: new Set(),
      hasDiagnostic: true,
      today: new Date(2026, 0, 5),
    });
    expect(tasks.some((t) => t.kind === "lesson")).toBe(false);
    expect(tasks.every((t) => t.scheduled_date <= "2026-01-12")).toBe(true);
  });
});

describe("buildWeekPlan lessons", () => {
  it("schedules each skill's lesson at most once per week", () => {
    const skills = ["a", "b", "c"].map((id) => ({
      id,
      name: `Skill ${id}`,
      exam: "SAT",
      section: "Math",
    }));
    const plan = buildWeekPlan({
      profile: { exam: "SAT", minutesPerDay: 45, daysPerWeek: 7, testDate: null },
      skills,
      stats: new Map(),
      completedLessons: new Set(),
      hasDiagnostic: true,
      today: new Date(2026, 10, 1),
    });
    const lessons = plan.filter((t) => t.kind === "lesson").map((t) => t.skill_id);
    expect(new Set(lessons).size).toBe(lessons.length);
    expect(plan.some((t) => t.kind === "guided_practice")).toBe(true);
  });
});

describe("ACT composite (enhanced format)", () => {
  const mk = (section: string, n: number, correct: boolean): AttemptLite[] =>
    Array.from({ length: n }, (_, i) => ({
      skill_id: "x",
      section,
      exam: "ACT",
      difficulty: 2,
      is_correct: correct,
      time_ms: 60000,
      created_at: new Date(2026, 9, 1, 0, i).toISOString(),
    }));

  it("doesn't require Science and excludes it from the composite", () => {
    const base = [...mk("English", 10, true), ...mk("Math", 10, true), ...mk("Reading", 10, true)];
    const withoutScience = estimateScore("ACT", base, true);
    expect(withoutScience.ready).toBe(true);
    const withWeakScience = estimateScore("ACT", [...base, ...mk("Science", 10, false)], true);
    expect(withWeakScience.ready && withoutScience.ready && withWeakScience.mid).toBe(
      withoutScience.ready ? withoutScience.mid : -1,
    );
    expect(
      withWeakScience.ready && withWeakScience.sections.some((s) => s.section === "Science"),
    ).toBe(true);
  });
});
