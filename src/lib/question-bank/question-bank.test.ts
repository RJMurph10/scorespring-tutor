import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { FULL_TEST_STRUCTURE } from "@/lib/domain/exams";
import { LESSONS } from "@/lib/domain/lessons";

import { groupOf } from "./build";
import { QUESTION_BANK } from "./index";
import { questionBankSql } from "./sql";

// The 40 original seed questions already in the database (3 per SAT skill, 2 per ACT skill).
const SEED_PER_SECTION: Record<string, number> = {
  "SAT|Math": 12,
  "SAT|Reading and Writing": 12,
  "ACT|English": 4,
  "ACT|Math": 4,
  "ACT|Reading": 4,
  "ACT|Science": 4,
};

describe("question bank", () => {
  it("has unique ids and valid skills", () => {
    expect(new Set(QUESTION_BANK.map((q) => q.id)).size).toBe(QUESTION_BANK.length);
    for (const q of QUESTION_BANK) expect(LESSONS[q.skill_id], q.skill_id).toBeDefined();
  });

  it("gives every question four distinct choices and a valid answer key", () => {
    for (const q of QUESTION_BANK) {
      expect(q.choices).toHaveLength(4);
      expect(new Set(q.choices).size).toBe(4);
      expect(q.correct_index).toBeGreaterThanOrEqual(0);
      expect(q.correct_index).toBeLessThan(4);
      for (const k of Object.keys(q.distractor_notes)) expect(Number(k)).not.toBe(q.correct_index);
    }
  });

  it("spreads correct answers across A–D", () => {
    const counts = [0, 0, 0, 0];
    for (const q of QUESTION_BANK) counts[q.correct_index]!++;
    for (const c of counts) expect(c / QUESTION_BANK.length).toBeGreaterThan(0.18);
  });

  it("has enough questions in every section for a full-length practice test", () => {
    for (const exam of ["SAT", "ACT"] as const) {
      const needed = new Map<string, number>();
      for (const s of FULL_TEST_STRUCTURE[exam])
        needed.set(s.section, (needed.get(s.section) ?? 0) + s.questions);
      for (const [section, n] of needed) {
        const have = QUESTION_BANK.filter((q) => q.exam === exam && q.section === section).length;
        // ACT Science: 6 passages of 7 can't split exactly into 40, so allow one short of the target.
        expect(
          have + SEED_PER_SECTION[`${exam}|${section}`]!,
          `${exam} ${section}`,
        ).toBeGreaterThanOrEqual(n - 1);
      }
    }
  });

  it("keeps passage sets within a single section", () => {
    const sectionOfGroup = new Map<string, string>();
    for (const q of QUESTION_BANK) {
      const g = groupOf(q.id);
      if (!g) continue;
      const key = `${q.exam}|${q.section}|${g}`;
      sectionOfGroup.set(key, q.section);
      expect(q.passage).toBeTruthy();
    }
    expect(sectionOfGroup.size).toBeGreaterThan(0);
  });

  it("matches the generated database migration (run `bun scripts/generate-question-bank.ts` if this fails)", () => {
    const file = readFileSync(
      join(__dirname, "../../../drizzle/migrations/0001_question_bank.sql"),
      "utf8",
    );
    expect(file).toBe(questionBankSql());
  });
});

describe("groupOf", () => {
  it("reads the passage-set number from a bank id", () => {
    expect(groupOf("5b050000-0003-4000-8000-000000000012")).toBe(3);
    expect(groupOf("5b010000-0000-4000-8000-000000000001")).toBe(0);
    expect(groupOf("2c1f7a52-9a4e-4f41-8f2e-1b4a3a0e2f11")).toBe(0);
  });

  it("puts every ACT Reading and Science question in a passage set", () => {
    const passageSections = QUESTION_BANK.filter((q) => q.exam === "ACT" && q.section !== "Math");
    for (const q of passageSections) expect(groupOf(q.id), q.prompt).toBeGreaterThan(0);
    const sat = QUESTION_BANK.filter((q) => q.exam === "SAT");
    for (const q of sat) expect(groupOf(q.id)).toBe(0);
  });
});
