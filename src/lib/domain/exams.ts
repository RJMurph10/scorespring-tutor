export type Exam = "SAT" | "ACT";

export const EXAM_SECTIONS: Record<Exam, string[]> = {
  SAT: ["Reading and Writing", "Math"],
  ACT: ["English", "Math", "Reading", "Science"],
};

export function sectionsFor(exam: Exam, includeScience = true) {
  return EXAM_SECTIONS[exam].filter((s) => includeScience || s !== "Science");
}

export const SCORE_RANGE: Record<Exam, { min: number; max: number; step: number }> = {
  SAT: { min: 400, max: 1600, step: 10 },
  ACT: { min: 1, max: 36, step: 1 },
};

/** Real-exam section structure (used to scale unofficial practice tests). */
export type SectionSpec = { section: string; label: string; minutes: number; questions: number; breakAfterMinutes?: number };

export const FULL_TEST_STRUCTURE: Record<Exam, SectionSpec[]> = {
  SAT: [
    { section: "Reading and Writing", label: "Reading & Writing — Module 1", minutes: 32, questions: 27 },
    { section: "Reading and Writing", label: "Reading & Writing — Module 2", minutes: 32, questions: 27, breakAfterMinutes: 10 },
    { section: "Math", label: "Math — Module 1", minutes: 35, questions: 22 },
    { section: "Math", label: "Math — Module 2", minutes: 35, questions: 22 },
  ],
  ACT: [
    { section: "English", label: "English", minutes: 35, questions: 50 },
    { section: "Math", label: "Mathematics", minutes: 50, questions: 45, breakAfterMinutes: 10 },
    { section: "Reading", label: "Reading", minutes: 40, questions: 36 },
    { section: "Science", label: "Science (optional)", minutes: 40, questions: 40 },
  ],
};

/** Seconds per question on the real exam, used to scale timing to the questions we actually have. */
export function secondsPerQuestion(spec: SectionSpec) {
  return Math.round((spec.minutes * 60) / spec.questions);
}
