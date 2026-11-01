export type Lesson = {
  concept: string;
  examples: { problem: string; steps: string[] }[];
  mistakes: string[];
  nextSteps: string;
};

export const LESSONS: Record<string, Lesson> = {
  "sat-algebra": {
    concept: "Linear equations describe a constant rate of change. Solve by undoing operations in reverse order, keeping both sides balanced. In word problems, the rate multiplies the variable and a one-time amount is the constant. For systems, add or subtract equations to eliminate a variable, or substitute.",
    examples: [
      { problem: "Solve 4x − 9 = 3x + 2.", steps: ["Subtract 3x from both sides: x − 9 = 2.", "Add 9: x = 11.", "Check: 4(11) − 9 = 35 and 3(11) + 2 = 35 ✓"] },
      { problem: "x + y = 10 and x − y = 4. Find y.", steps: ["Add the equations: 2x = 14, so x = 7.", "Substitute: 7 + y = 10, so y = 3."] },
    ],
    mistakes: ["Stopping one step early (finding 3x instead of x).", "Swapping the rate and the starting value in a word problem.", "Answering for the wrong variable in a system — re-read what the question asks."],
    nextSteps: "Once you're accurate, move on to quadratics and nonlinear functions in Advanced Math.",
  },
  "sat-advanced-math": {
    concept: "Advanced Math covers quadratics, exponentials and function notation. f(a) means substitute a for x. Solve quadratics by factoring, the quadratic formula, or square roots. Remember a squared expression has two possible roots.",
    examples: [
      { problem: "Solve x² + x − 12 = 0.", steps: ["Find two numbers that multiply to −12 and add to 1: 4 and −3.", "(x + 4)(x − 3) = 0.", "x = −4 or x = 3."] },
      { problem: "If g(x) = 2x² − 1, find g(−3).", steps: ["Substitute: 2(−3)² − 1.", "(−3)² = 9, so 2(9) − 1 = 17."] },
    ],
    mistakes: ["Reporting the numbers in the factors instead of the roots (sign flip).", "Forgetting the negative root when taking a square root.", "Squaring a negative number incorrectly: (−3)² = 9, not −9."],
    nextSteps: "Practice mixed questions and try harder exponential-growth problems.",
  },
  "sat-psda": {
    concept: "Problem-Solving and Data Analysis tests ratios, percentages, unit rates, statistics (mean, median) and inference from samples. Percent change = (new − old) / old. A random sample's proportion can be applied to the whole population.",
    examples: [
      { problem: "A price rises from $50 to $65. What is the percent increase?", steps: ["Change = 15.", "15 / 50 = 0.30.", "30% increase."] },
      { problem: "Median of 3, 9, 4, 8, 1?", steps: ["Order the data: 1, 3, 4, 8, 9.", "The middle value is 4."] },
    ],
    mistakes: ["Giving the discount amount instead of the final price.", "Confusing mean and median.", "Dividing by the new value instead of the original for percent change."],
    nextSteps: "Move to two-way tables and probability questions.",
  },
  "sat-geo-trig": {
    concept: "Know area and circumference formulas, the Pythagorean theorem, special right triangles, and SOH-CAH-TOA. Many trig questions reduce to a 3-4-5 or 5-12-13 triangle. The SAT provides a formula reference sheet — know what's on it.",
    examples: [
      { problem: "A circle has circumference 12π. What is its area?", steps: ["C = 2πr = 12π, so r = 6.", "Area = πr² = 36π."] },
      { problem: "In a right triangle, tan A = 5/12. Find sin A.", steps: ["Opposite 5, adjacent 12, hypotenuse 13.", "sin A = 5/13."] },
    ],
    mistakes: ["Mixing up area (πr²) and circumference (2πr).", "Adding legs instead of their squares.", "Mixing up opposite and adjacent sides."],
    nextSteps: "Try circle-equation and arc-length problems next.",
  },
  "sat-info-ideas": {
    concept: "Information and Ideas questions ask what a text says, what it implies, and which evidence supports a claim. The right answer is always supported by the text — not just plausible. For evidence questions, restate the claim first, then find the choice that directly matches it.",
    examples: [
      { problem: "A text says a plant blooms only after a cold winter. Which inference fits?", steps: ["Identify the condition: cold winter → bloom.", "A correct inference: after a mild winter, the plant may not bloom.", "Reject choices about soil or sunlight — the text never mentions them."] },
    ],
    mistakes: ["Choosing an answer that's true in real life but not stated in the text.", "Picking choices that are too broad for a short passage.", "Matching keywords instead of meaning."],
    nextSteps: "Pair this with Craft and Structure to read for purpose.",
  },
  "sat-craft-structure": {
    concept: "Craft and Structure covers word choice in context, the function of a sentence, and how a text is organized. Predict a word before looking at the choices. For function questions, ask: what job is this sentence doing for the whole text?",
    examples: [
      { problem: "\"Her response was guarded: she answered briefly and avoided details.\" Guarded means…", steps: ["The colon explains the word: brief, avoiding details.", "Prediction: cautious.", "Choose the closest match."] },
    ],
    mistakes: ["Choosing the most common meaning of a word instead of its meaning in context.", "Describing what a sentence says instead of what it does.", "Ignoring contrast words like although, however, yet."],
    nextSteps: "Practice transitions in Expression of Ideas.",
  },
  "sat-expression-ideas": {
    concept: "Expression of Ideas tests transitions and rhetorical synthesis (using notes to meet a goal). For transitions, name the relationship between sentences: contrast, cause/effect, example, or addition. For synthesis questions, the goal in the question stem decides the answer.",
    examples: [
      { problem: "\"The trail was steep. ______, the view made it worthwhile.\"", steps: ["Relationship: difficulty vs. reward → contrast.", "Pick a contrast word: Still, / However,."] },
    ],
    mistakes: ["Choosing a transition that sounds smart without checking the logic.", "In synthesis questions, picking an accurate choice that doesn't meet the stated goal."],
    nextSteps: "Move on to Standard English Conventions.",
  },
  "sat-conventions": {
    concept: "Conventions questions test sentence boundaries (periods, semicolons, colons), subject-verb agreement, pronouns, and modifiers. Find the true subject by crossing out prepositional phrases. A semicolon joins two complete sentences; a colon introduces an explanation or list after a complete sentence.",
    examples: [
      { problem: "\"The box of old letters ___ on the shelf.\" (is / are)", steps: ["Cross out \"of old letters.\"", "Subject: box (singular) → is."] },
    ],
    mistakes: ["Matching the verb to the nearest noun instead of the subject.", "Using a comma to join two complete sentences (comma splice).", "Dangling modifiers — the noun after an opening phrase must be the one doing the action."],
    nextSteps: "Mix conventions with transitions in timed drills.",
  },
  "act-eng-conventions": {
    concept: "ACT English conventions questions cover punctuation, usage (its/it's, who/whom), and sentence structure. 'NO CHANGE' is correct about as often as any other choice — don't avoid it. Read the whole sentence before choosing.",
    examples: [
      { problem: "\"The dog wagged it's tail.\"", steps: ["\"It's\" = \"it is\": \"wagged it is tail\" fails.", "Use the possessive \"its.\""] },
    ],
    mistakes: ["Avoiding NO CHANGE out of habit.", "Fixing one error but introducing a comma splice.", "Using \"their\" for singular collective nouns like company or team."],
    nextSteps: "Practice concision and relevance in Production of Writing.",
  },
  "act-eng-rhetoric": {
    concept: "Production of Writing questions ask whether to add or delete text, which choice is most concise, and how to order ideas. When choices mean the same thing, the shortest grammatically correct choice is usually right. For add/delete questions, check the paragraph's focus.",
    examples: [
      { problem: "\"She returned back to the office.\"", steps: ["\"Returned\" already means went back.", "Cut \"back\": \"She returned to the office.\""] },
    ],
    mistakes: ["Keeping redundant phrases that sound formal.", "Adding interesting but off-topic sentences."],
    nextSteps: "Do a timed English drill to work on pacing.",
  },
  "act-math-algebra": {
    concept: "ACT algebra covers linear equations, slope, and function evaluation. Slope = rise / run = (y₂ − y₁)/(x₂ − x₁). Keep moving: about one minute per question.",
    examples: [
      { problem: "Line through (2, 5) and (6, 13). Slope?", steps: ["Rise: 13 − 5 = 8.", "Run: 6 − 2 = 4.", "Slope = 2."] },
    ],
    mistakes: ["Flipping rise and run.", "Sign errors when moving terms across the equals sign."],
    nextSteps: "Try geometry and coordinate geometry next.",
  },
  "act-math-geometry": {
    concept: "ACT geometry covers perimeter, area, angle relationships, and triangles. Unlike the SAT, the ACT gives no formula sheet — memorize the basics. Triangle angles sum to 180°; a straight line is 180°.",
    examples: [
      { problem: "Two angles of a triangle are 50° and 65°. Third angle?", steps: ["180 − 50 − 65 = 65°."] },
    ],
    mistakes: ["Mixing up perimeter and area.", "Answering with one part of a ratio instead of the requested angle."],
    nextSteps: "Mix algebra and geometry in a timed drill.",
  },
  "act-reading-key-ideas": {
    concept: "Key Ideas and Details questions ask what the passage states or strongly implies. Go back to the text for each answer; the correct choice is supported by specific lines.",
    examples: [
      { problem: "A passage says a character \"checked the clock every few minutes.\" What can you infer?", steps: ["Behavior: repeated clock-checking.", "Reasonable inference: impatience or anxiety about time.", "Reject choices that go further, like \"was late for work.\""] },
    ],
    mistakes: ["Choosing extreme answers (always, never) the passage doesn't support.", "Relying on memory instead of rereading."],
    nextSteps: "Work on Craft and Structure: tone and word function.",
  },
  "act-reading-craft": {
    concept: "Craft and Structure questions ask why an author used a word, phrase, or structure. Think about function: contrast, emphasis, characterization, or transition.",
    examples: [
      { problem: "Why might a narrator begin a sentence with \"Even so,\"?", steps: ["\"Even so\" introduces something that happens despite the previous idea.", "Function: contrast."] },
    ],
    mistakes: ["Explaining what a phrase means instead of why it's used.", "Ignoring small signal words like still, yet, even so."],
    nextSteps: "Take a timed Reading section to practice pacing.",
  },
  "act-sci-data": {
    concept: "Interpretation of Data questions ask you to read tables and graphs, spot trends, and interpolate. You rarely need outside science knowledge — read axes and units first.",
    examples: [
      { problem: "Values at 10 and 20 are 50 and 30. Estimate at 15.", steps: ["15 is halfway between 10 and 20.", "Halfway between 50 and 30 is 40."] },
    ],
    mistakes: ["Reading the wrong row or column.", "Ignoring units.", "Assuming a trend continues far beyond the data."],
    nextSteps: "Study experimental design in Scientific Investigation.",
  },
  "act-sci-experiments": {
    concept: "Scientific Investigation questions test experimental design: independent variable (what's changed), dependent variable (what's measured), controls, and constants.",
    examples: [
      { problem: "Researchers vary light color and measure plant growth. Which is dependent?", steps: ["Changed: light color (independent).", "Measured: growth (dependent)."] },
    ],
    mistakes: ["Swapping independent and dependent variables.", "Forgetting the purpose of a control group."],
    nextSteps: "Combine data and experiment questions in a timed Science drill.",
  },
};
