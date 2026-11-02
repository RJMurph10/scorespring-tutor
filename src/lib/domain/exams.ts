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
export type SectionSpec = {
  section: string;
  label: string;
  minutes: number;
  questions: number;
  breakAfterMinutes?: number;
};

export const FULL_TEST_STRUCTURE: Record<Exam, SectionSpec[]> = {
  SAT: [
    {
      section: "Reading and Writing",
      label: "Reading & Writing — Module 1",
      minutes: 32,
      questions: 27,
    },
    {
      section: "Reading and Writing",
      label: "Reading & Writing — Module 2",
      minutes: 32,
      questions: 27,
      breakAfterMinutes: 10,
    },
    { section: "Math", label: "Math — Module 1", minutes: 35, questions: 22 },
    { section: "Math", label: "Math — Module 2", minutes: 35, questions: 22 },
  ],
  ACT: [
    { section: "English", label: "English", minutes: 35, questions: 50 },
    { section: "Math", label: "Math", minutes: 50, questions: 45, breakAfterMinutes: 10 },
    { section: "Reading", label: "Reading", minutes: 40, questions: 36 },
    { section: "Science", label: "Science (optional)", minutes: 40, questions: 40 },
  ],
};

/** Seconds per question on the real exam, used to scale timing to the questions we actually have. */
export function secondsPerQuestion(spec: SectionSpec) {
  return Math.round((spec.minutes * 60) / spec.questions);
}

/** What each section of the current test format covers, for the Practice Tests page. */
export type SectionInfo = {
  section: string;
  name: string;
  summary: string;
  calculator?: string;
  optional?: string;
};

export const SECTION_INFO: Record<Exam, SectionInfo[]> = {
  SAT: [
    {
      section: "Reading and Writing",
      name: "Reading and Writing",
      summary:
        "Short passages with one question each: words in context, main ideas and evidence, text structure, transitions, and grammar. Reading and writing are combined into one section on the digital SAT.",
    },
    {
      section: "Math",
      name: "Math",
      summary:
        "Algebra, advanced math, problem-solving and data analysis, and geometry and trigonometry.",
      calculator:
        "Calculator allowed on every question (the real test has a built-in Desmos calculator).",
    },
  ],
  ACT: [
    {
      section: "English",
      name: "English",
      summary:
        "Edit essays for grammar, punctuation, sentence structure, and organization and style.",
    },
    {
      section: "Math",
      name: "Math",
      summary:
        "Algebra, functions, geometry, trigonometry, statistics and probability. Four answer choices per question.",
      calculator: "Calculator allowed throughout.",
    },
    {
      section: "Reading",
      name: "Reading",
      summary:
        "Four passages — literary narrative, social science, humanities, and natural science.",
    },
    {
      section: "Science",
      name: "Science",
      summary: "Interpret data, evaluate experiments, and compare conflicting viewpoints.",
      optional:
        "Optional on the enhanced ACT and not part of the composite score; reported separately.",
    },
  ],
};
