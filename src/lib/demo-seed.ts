// Generated from drizzle/migrations/0000_migration.sql — the same original seed content as the live database.
// Used only by demo mode (src/lib/demo.ts).
export const DEMO_SKILLS = [
 {
  "id": "sat-algebra",
  "exam": "SAT",
  "section": "Math",
  "domain": "Algebra",
  "name": "Linear equations, inequalities & systems",
  "sort": 1
 },
 {
  "id": "sat-advanced-math",
  "exam": "SAT",
  "section": "Math",
  "domain": "Advanced Math",
  "name": "Nonlinear functions & quadratics",
  "sort": 2
 },
 {
  "id": "sat-psda",
  "exam": "SAT",
  "section": "Math",
  "domain": "Problem-Solving and Data Analysis",
  "name": "Ratios, percentages, statistics & probability",
  "sort": 3
 },
 {
  "id": "sat-geo-trig",
  "exam": "SAT",
  "section": "Math",
  "domain": "Geometry and Trigonometry",
  "name": "Area, triangles, circles & right-triangle trig",
  "sort": 4
 },
 {
  "id": "sat-info-ideas",
  "exam": "SAT",
  "section": "Reading and Writing",
  "domain": "Information and Ideas",
  "name": "Central ideas, evidence & inferences",
  "sort": 5
 },
 {
  "id": "sat-craft-structure",
  "exam": "SAT",
  "section": "Reading and Writing",
  "domain": "Craft and Structure",
  "name": "Words in context, text structure & purpose",
  "sort": 6
 },
 {
  "id": "sat-expression-ideas",
  "exam": "SAT",
  "section": "Reading and Writing",
  "domain": "Expression of Ideas",
  "name": "Transitions & rhetorical synthesis",
  "sort": 7
 },
 {
  "id": "sat-conventions",
  "exam": "SAT",
  "section": "Reading and Writing",
  "domain": "Standard English Conventions",
  "name": "Boundaries, agreement & sentence form",
  "sort": 8
 },
 {
  "id": "act-eng-conventions",
  "exam": "ACT",
  "section": "English",
  "domain": "Conventions of Standard English",
  "name": "Punctuation, usage & sentence structure",
  "sort": 9
 },
 {
  "id": "act-eng-rhetoric",
  "exam": "ACT",
  "section": "English",
  "domain": "Production of Writing",
  "name": "Concision, relevance & organization",
  "sort": 10
 },
 {
  "id": "act-math-algebra",
  "exam": "ACT",
  "section": "Math",
  "domain": "Algebra & Functions",
  "name": "Equations, slope & functions",
  "sort": 11
 },
 {
  "id": "act-math-geometry",
  "exam": "ACT",
  "section": "Math",
  "domain": "Geometry",
  "name": "Perimeter, angles & shapes",
  "sort": 12
 },
 {
  "id": "act-reading-key-ideas",
  "exam": "ACT",
  "section": "Reading",
  "domain": "Key Ideas and Details",
  "name": "Details, inferences & main ideas",
  "sort": 13
 },
 {
  "id": "act-reading-craft",
  "exam": "ACT",
  "section": "Reading",
  "domain": "Craft and Structure",
  "name": "Word choice, tone & function",
  "sort": 14
 },
 {
  "id": "act-sci-data",
  "exam": "ACT",
  "section": "Science",
  "domain": "Interpretation of Data",
  "name": "Reading tables & trends",
  "sort": 15
 },
 {
  "id": "act-sci-experiments",
  "exam": "ACT",
  "section": "Science",
  "domain": "Scientific Investigation",
  "name": "Variables, controls & design",
  "sort": 16
 }
];

export const DEMO_QUESTIONS = [
 {
  "exam": "SAT",
  "section": "Math",
  "skill_id": "sat-algebra",
  "difficulty": 1,
  "passage": null,
  "prompt": "If 3x + 7 = 22, what is the value of x?",
  "choices": [
   "3",
   "5",
   "7",
   "15"
  ],
  "correct_index": 1,
  "explanation": "Subtract 7 from both sides: 3x = 15. Divide by 3: x = 5.",
  "distractor_notes": {
   "3": "15 is the value of 3x. You stopped one step early — divide by 3."
  },
  "est_seconds": 60,
  "id": "d0000000-0000-4000-8000-000000000001"
 },
 {
  "exam": "SAT",
  "section": "Math",
  "skill_id": "sat-algebra",
  "difficulty": 2,
  "passage": null,
  "prompt": "A gym charges a one-time $25 sign-up fee plus $15 per month. Which equation gives the total cost C, in dollars, after m months?",
  "choices": [
   "C = 15m + 25",
   "C = 25m + 15",
   "C = 40m",
   "C = 15(m + 25)"
  ],
  "correct_index": 0,
  "explanation": "The monthly charge is the rate that multiplies m (15m). The one-time fee is added once (+25). So C = 15m + 25.",
  "distractor_notes": {
   "1": "This swaps the rate and the fixed fee.",
   "2": "This charges the sign-up fee every month."
  },
  "est_seconds": 75,
  "id": "d0000000-0000-4000-8000-000000000002"
 },
 {
  "exam": "SAT",
  "section": "Math",
  "skill_id": "sat-algebra",
  "difficulty": 3,
  "passage": null,
  "prompt": "2x + y = 11 and x − y = 1. What is the value of x?",
  "choices": [
   "3",
   "4",
   "5",
   "6"
  ],
  "correct_index": 1,
  "explanation": "Add the equations to eliminate y: 3x = 12, so x = 4. Check: y = 3, and 2(4) + 3 = 11.",
  "distractor_notes": {
   "0": "3 is the value of y, not x."
  },
  "est_seconds": 90,
  "id": "d0000000-0000-4000-8000-000000000003"
 },
 {
  "exam": "SAT",
  "section": "Math",
  "skill_id": "sat-advanced-math",
  "difficulty": 1,
  "passage": null,
  "prompt": "If f(x) = x² − 4x, what is f(5)?",
  "choices": [
   "5",
   "−5",
   "45",
   "1"
  ],
  "correct_index": 0,
  "explanation": "f(5) = 5² − 4(5) = 25 − 20 = 5.",
  "distractor_notes": {
   "2": "45 comes from adding 20 instead of subtracting it."
  },
  "est_seconds": 60,
  "id": "d0000000-0000-4000-8000-000000000004"
 },
 {
  "exam": "SAT",
  "section": "Math",
  "skill_id": "sat-advanced-math",
  "difficulty": 2,
  "passage": null,
  "prompt": "What are the solutions to x² − 5x + 6 = 0?",
  "choices": [
   "2 and 3",
   "−2 and −3",
   "1 and 6",
   "−1 and 6"
  ],
  "correct_index": 0,
  "explanation": "Factor: (x − 2)(x − 3) = 0, so x = 2 or x = 3.",
  "distractor_notes": {
   "1": "These are the numbers inside the factors, not the solutions — set each factor equal to zero."
  },
  "est_seconds": 75,
  "id": "d0000000-0000-4000-8000-000000000005"
 },
 {
  "exam": "SAT",
  "section": "Math",
  "skill_id": "sat-advanced-math",
  "difficulty": 3,
  "passage": null,
  "prompt": "If (x + 3)² = 49 and x > 0, what is the value of x?",
  "choices": [
   "10",
   "7",
   "4",
   "46"
  ],
  "correct_index": 2,
  "explanation": "Take the square root: x + 3 = 7 or x + 3 = −7. Since x > 0, x + 3 = 7, so x = 4.",
  "distractor_notes": {
   "1": "7 is the value of x + 3, not x.",
   "0": "10 comes from adding 3 instead of subtracting."
  },
  "est_seconds": 90,
  "id": "d0000000-0000-4000-8000-000000000006"
 },
 {
  "exam": "SAT",
  "section": "Math",
  "skill_id": "sat-psda",
  "difficulty": 1,
  "passage": null,
  "prompt": "A shirt originally priced at $40 is discounted by 25%. What is the sale price?",
  "choices": [
   "$10",
   "$15",
   "$30",
   "$35"
  ],
  "correct_index": 2,
  "explanation": "25% of $40 is $10. The sale price is $40 − $10 = $30.",
  "distractor_notes": {
   "0": "$10 is the discount, not the sale price."
  },
  "est_seconds": 60,
  "id": "d0000000-0000-4000-8000-000000000007"
 },
 {
  "exam": "SAT",
  "section": "Math",
  "skill_id": "sat-psda",
  "difficulty": 2,
  "passage": null,
  "prompt": "What is the mean of the data set 4, 7, 7, 9, 13?",
  "choices": [
   "7",
   "8",
   "9",
   "13"
  ],
  "correct_index": 1,
  "explanation": "The sum is 4 + 7 + 7 + 9 + 13 = 40. Divide by 5 values: 40 ÷ 5 = 8.",
  "distractor_notes": {
   "0": "7 is the median and the mode, not the mean."
  },
  "est_seconds": 60,
  "id": "d0000000-0000-4000-8000-000000000008"
 },
 {
  "exam": "SAT",
  "section": "Math",
  "skill_id": "sat-psda",
  "difficulty": 3,
  "passage": null,
  "prompt": "In a random sample of 200 students at a school, 120 said they prefer online homework. The school has 1,500 students. Based on the sample, which is the best estimate of the number of students at the school who prefer online homework?",
  "choices": [
   "120",
   "600",
   "900",
   "1,380"
  ],
  "correct_index": 2,
  "explanation": "The sample proportion is 120/200 = 0.6. Apply it to the population: 0.6 × 1,500 = 900.",
  "distractor_notes": {
   "0": "120 is the count in the sample, not the school.",
   "3": "This adds the sample count to the population instead of using a proportion."
  },
  "est_seconds": 90,
  "id": "d0000000-0000-4000-8000-000000000009"
 },
 {
  "exam": "SAT",
  "section": "Math",
  "skill_id": "sat-geo-trig",
  "difficulty": 1,
  "passage": null,
  "prompt": "A right triangle has legs of length 6 and 8. What is the length of the hypotenuse?",
  "choices": [
   "10",
   "14",
   "12",
   "48"
  ],
  "correct_index": 0,
  "explanation": "By the Pythagorean theorem, c² = 6² + 8² = 36 + 64 = 100, so c = 10.",
  "distractor_notes": {
   "1": "14 adds the legs; the theorem adds their squares."
  },
  "est_seconds": 60,
  "id": "d0000000-0000-4000-8000-000000000010"
 },
 {
  "exam": "SAT",
  "section": "Math",
  "skill_id": "sat-geo-trig",
  "difficulty": 2,
  "passage": null,
  "prompt": "What is the area of a circle with radius 5?",
  "choices": [
   "10π",
   "25π",
   "5π",
   "100π"
  ],
  "correct_index": 1,
  "explanation": "Area = πr² = π(5²) = 25π.",
  "distractor_notes": {
   "0": "10π is the circumference (2πr)."
  },
  "est_seconds": 60,
  "id": "d0000000-0000-4000-8000-000000000011"
 },
 {
  "exam": "SAT",
  "section": "Math",
  "skill_id": "sat-geo-trig",
  "difficulty": 3,
  "passage": null,
  "prompt": "In right triangle ABC, angle C is the right angle and sin A = 3/5. What is cos A?",
  "choices": [
   "3/4",
   "4/3",
   "4/5",
   "5/3"
  ],
  "correct_index": 2,
  "explanation": "sin A = opposite/hypotenuse = 3/5, so use a 3-4-5 triangle: the adjacent side is 4. cos A = adjacent/hypotenuse = 4/5.",
  "distractor_notes": {
   "0": "3/4 is tan A.",
   "1": "4/3 is the reciprocal of tan A."
  },
  "est_seconds": 90,
  "id": "d0000000-0000-4000-8000-000000000012"
 },
 {
  "exam": "SAT",
  "section": "Reading and Writing",
  "skill_id": "sat-info-ideas",
  "difficulty": 1,
  "passage": "Honeybees communicate the location of food through a \"waggle dance.\" The angle of the dance relative to vertical indicates the direction of the food relative to the sun, while the duration of the waggle portion signals how far away the food is.",
  "prompt": "According to the text, what does the duration of the waggle portion indicate?",
  "choices": [
   "The direction of the food",
   "The distance to the food",
   "The quality of the food",
   "The number of bees needed"
  ],
  "correct_index": 1,
  "explanation": "The text states that the duration of the waggle \"signals how far away the food is\" — that is distance.",
  "distractor_notes": {
   "0": "Direction is shown by the angle of the dance, not its duration."
  },
  "est_seconds": 70,
  "id": "d0000000-0000-4000-8000-000000000013"
 },
 {
  "exam": "SAT",
  "section": "Reading and Writing",
  "skill_id": "sat-info-ideas",
  "difficulty": 2,
  "passage": "Ecologist Lena Ortiz hypothesized that community gardens increase the variety of bird species in city neighborhoods. To test this, she surveyed birds in 30 neighborhoods with different numbers of gardens.",
  "prompt": "Which finding, if true, would most directly support Ortiz's hypothesis?",
  "choices": [
   "Neighborhoods with more community gardens had more bird species recorded.",
   "Birds in cities sing at higher pitches than birds in rural areas.",
   "Most community gardens are planted in the spring.",
   "Neighborhoods without gardens had more total trees."
  ],
  "correct_index": 0,
  "explanation": "The hypothesis links gardens to bird variety (number of species). Only the first choice connects more gardens with more species.",
  "distractor_notes": {
   "3": "Trees are not part of the hypothesis, and this says nothing about species variety."
  },
  "est_seconds": 80,
  "id": "d0000000-0000-4000-8000-000000000014"
 },
 {
  "exam": "SAT",
  "section": "Reading and Writing",
  "skill_id": "sat-info-ideas",
  "difficulty": 3,
  "passage": "When the city library eliminated late fees, some officials worried that fewer books would be returned. However, the return rate stayed nearly the same, while the number of active cardholders rose by 18 percent in the following year.",
  "prompt": "Which choice best states the main idea of the text?",
  "choices": [
   "Officials were wrong about most library policies.",
   "Late fees are the main source of library funding.",
   "Active cardholders return books more quickly than others.",
   "Eliminating late fees increased library use without substantially reducing book returns."
  ],
  "correct_index": 3,
  "explanation": "The text contrasts the worry (fewer returns) with the result (returns unchanged, more cardholders). The last choice captures both parts.",
  "distractor_notes": {
   "0": "Too broad — the text discusses only one policy."
  },
  "est_seconds": 90,
  "id": "d0000000-0000-4000-8000-000000000015"
 },
 {
  "exam": "SAT",
  "section": "Reading and Writing",
  "skill_id": "sat-craft-structure",
  "difficulty": 1,
  "passage": "The new bridge design was so ______ that engineers from several countries traveled to study it.",
  "prompt": "Which choice completes the text with the most logical and precise word?",
  "choices": [
   "ordinary",
   "innovative",
   "fragile",
   "hidden"
  ],
  "correct_index": 1,
  "explanation": "Engineers traveling to study a design implies it is new and noteworthy — \"innovative.\"",
  "distractor_notes": {
   "0": "An ordinary design would not attract international study."
  },
  "est_seconds": 60,
  "id": "d0000000-0000-4000-8000-000000000016"
 },
 {
  "exam": "SAT",
  "section": "Reading and Writing",
  "skill_id": "sat-craft-structure",
  "difficulty": 2,
  "passage": "Although critics initially dismissed the novel as sentimental, later readers have praised its careful portrait of rural labor.",
  "prompt": "Which choice best describes the function of the first clause (\"Although critics … sentimental\") in the sentence?",
  "choices": [
   "It presents an earlier view that the rest of the sentence contrasts.",
   "It summarizes the novel's plot.",
   "It provides evidence that the novel was popular.",
   "It explains why the author wrote the novel."
  ],
  "correct_index": 0,
  "explanation": "\"Although\" signals contrast: the critics' early dismissal is set against later praise.",
  "distractor_notes": {
   "2": "Being dismissed by critics is not evidence of popularity."
  },
  "est_seconds": 70,
  "id": "d0000000-0000-4000-8000-000000000017"
 },
 {
  "exam": "SAT",
  "section": "Reading and Writing",
  "skill_id": "sat-craft-structure",
  "difficulty": 3,
  "passage": "The scientist's tone in the report was measured: she noted the promising results but cautioned that the sample was small.",
  "prompt": "As used in the text, what does \"measured\" most nearly mean?",
  "choices": [
   "calculated numerically",
   "restrained",
   "lengthy",
   "rhythmic"
  ],
  "correct_index": 1,
  "explanation": "The colon explains the tone: she balances promise with caution. That describes a restrained, careful tone.",
  "distractor_notes": {
   "0": "This is a common meaning of \"measured,\" but it doesn't fit a description of tone."
  },
  "est_seconds": 80,
  "id": "d0000000-0000-4000-8000-000000000018"
 },
 {
  "exam": "SAT",
  "section": "Reading and Writing",
  "skill_id": "sat-expression-ideas",
  "difficulty": 1,
  "passage": "Maria practiced the piano every day for a year. ______ she performed flawlessly at the recital.",
  "prompt": "Which choice completes the text with the most logical transition?",
  "choices": [
   "However,",
   "As a result,",
   "Similarly,",
   "In contrast,"
  ],
  "correct_index": 1,
  "explanation": "Daily practice leads to a flawless performance — a cause and effect, so \"As a result.\"",
  "distractor_notes": {
   "0": "\"However\" signals contrast, but the second sentence follows from the first."
  },
  "est_seconds": 50,
  "id": "d0000000-0000-4000-8000-000000000019"
 },
 {
  "exam": "SAT",
  "section": "Reading and Writing",
  "skill_id": "sat-expression-ideas",
  "difficulty": 2,
  "passage": "Solar panels have become far cheaper over the past decade. ______ many homeowners still cite installation costs as a barrier.",
  "prompt": "Which choice completes the text with the most logical transition?",
  "choices": [
   "Therefore,",
   "For example,",
   "Nevertheless,",
   "Likewise,"
  ],
  "correct_index": 2,
  "explanation": "The second sentence is surprising given the first (cheaper, yet still seen as costly), so a contrast transition — \"Nevertheless\" — fits.",
  "distractor_notes": {
   "0": "\"Therefore\" implies the barrier is caused by panels getting cheaper."
  },
  "est_seconds": 60,
  "id": "d0000000-0000-4000-8000-000000000020"
 },
 {
  "exam": "SAT",
  "section": "Reading and Writing",
  "skill_id": "sat-expression-ideas",
  "difficulty": 3,
  "passage": "While researching a topic, a student has taken the following notes:\n• Mount Everest is 8,849 meters tall.\n• K2 is 8,611 meters tall.\n• Both mountains are in Asia.",
  "prompt": "The student wants to emphasize the difference in height between the two mountains. Which choice most effectively uses relevant information from the notes to accomplish this goal?",
  "choices": [
   "Mount Everest and K2 are both mountains in Asia.",
   "K2 is a mountain that is 8,611 meters tall.",
   "Mount Everest, at 8,849 meters, is about 238 meters taller than K2, which stands at 8,611 meters.",
   "Many climbers attempt to reach the summit of Mount Everest."
  ],
  "correct_index": 2,
  "explanation": "Only this choice compares the two heights and states the difference (8,849 − 8,611 = 238).",
  "distractor_notes": {
   "1": "Gives only one height, so no comparison is made."
  },
  "est_seconds": 80,
  "id": "d0000000-0000-4000-8000-000000000021"
 },
 {
  "exam": "SAT",
  "section": "Reading and Writing",
  "skill_id": "sat-conventions",
  "difficulty": 1,
  "passage": "The team of researchers ______ published its findings last week.",
  "prompt": "Which choice completes the text so that it conforms to the conventions of Standard English?",
  "choices": [
   "have",
   "has",
   "are",
   "were"
  ],
  "correct_index": 1,
  "explanation": "The subject is \"team\" (singular); \"of researchers\" is a prepositional phrase. Singular subject → \"has.\" The singular pronoun \"its\" confirms it.",
  "distractor_notes": {
   "0": "\"Have\" agrees with \"researchers,\" which is not the subject."
  },
  "est_seconds": 50,
  "id": "d0000000-0000-4000-8000-000000000022"
 },
 {
  "exam": "SAT",
  "section": "Reading and Writing",
  "skill_id": "sat-conventions",
  "difficulty": 2,
  "passage": "The museum's newest exhibit features work from three artists______ a painter, a sculptor, and a photographer.",
  "prompt": "Which choice completes the text so that it conforms to the conventions of Standard English?",
  "choices": [
   ",",
   ";",
   ":",
   "no punctuation"
  ],
  "correct_index": 2,
  "explanation": "A colon can introduce a list that explains what came before it when the preceding part is a complete clause.",
  "distractor_notes": {
   "1": "A semicolon must join two independent clauses; the list is not one."
  },
  "est_seconds": 60,
  "id": "d0000000-0000-4000-8000-000000000023"
 },
 {
  "exam": "SAT",
  "section": "Reading and Writing",
  "skill_id": "sat-conventions",
  "difficulty": 3,
  "passage": "Walking through the old library, ______",
  "prompt": "Which choice completes the text so that it conforms to the conventions of Standard English?",
  "choices": [
   "the shelves seemed to stretch forever.",
   "the dust made Jonah sneeze.",
   "Jonah noticed that the shelves seemed to stretch forever.",
   "there was a smell of old paper."
  ],
  "correct_index": 2,
  "explanation": "The opening phrase describes someone walking, so the subject right after the comma must be the walker — Jonah. Other choices create dangling modifiers.",
  "distractor_notes": {
   "0": "This says the shelves were walking.",
   "1": "This says the dust was walking."
  },
  "est_seconds": 70,
  "id": "d0000000-0000-4000-8000-000000000024"
 },
 {
  "exam": "ACT",
  "section": "English",
  "skill_id": "act-eng-conventions",
  "difficulty": 1,
  "passage": "The company announced that ______ new headquarters will open in May.",
  "prompt": "Which choice is correct?",
  "choices": [
   "it's",
   "its",
   "its'",
   "their"
  ],
  "correct_index": 1,
  "explanation": "\"Its\" is the possessive form. \"It's\" means \"it is,\" and \"its'\" is never correct. \"Their\" is plural, but \"company\" is singular.",
  "distractor_notes": {
   "0": "\"It's\" = \"it is\" — \"it is new headquarters\" doesn't make sense."
  },
  "est_seconds": 40,
  "id": "d0000000-0000-4000-8000-000000000025"
 },
 {
  "exam": "ACT",
  "section": "English",
  "skill_id": "act-eng-conventions",
  "difficulty": 2,
  "passage": "Rosa loves hiking, she goes every weekend.",
  "prompt": "Which choice best corrects the underlined portion \"hiking, she\"?",
  "choices": [
   "NO CHANGE",
   "hiking; she",
   "hiking she",
   "hiking, and, she"
  ],
  "correct_index": 1,
  "explanation": "The original is a comma splice (two independent clauses joined by only a comma). A semicolon correctly joins them.",
  "distractor_notes": {
   "2": "Removing the comma creates a run-on sentence."
  },
  "est_seconds": 45,
  "id": "d0000000-0000-4000-8000-000000000026"
 },
 {
  "exam": "ACT",
  "section": "English",
  "skill_id": "act-eng-rhetoric",
  "difficulty": 2,
  "passage": "The meeting will begin at 9 a.m. in the morning.",
  "prompt": "Which choice is the most concise replacement for \"at 9 a.m. in the morning\"?",
  "choices": [
   "NO CHANGE",
   "at 9 a.m.",
   "at 9 a.m. early in the morning",
   "at the time of 9 a.m. in the morning"
  ],
  "correct_index": 1,
  "explanation": "\"a.m.\" already means morning, so \"in the morning\" is redundant.",
  "distractor_notes": {},
  "est_seconds": 40,
  "id": "d0000000-0000-4000-8000-000000000027"
 },
 {
  "exam": "ACT",
  "section": "English",
  "skill_id": "act-eng-rhetoric",
  "difficulty": 3,
  "passage": "[Paragraph about the history of bicycle design, from early wooden \"hobby horses\" to modern chain-driven frames.] The writer is considering adding the sentence: \"My cousin owns a red bicycle.\"",
  "prompt": "Should the writer make this addition?",
  "choices": [
   "Yes, because it gives a specific example of a bicycle.",
   "Yes, because it adds a personal touch.",
   "No, because it distracts from the paragraph's focus on the history of bicycle design.",
   "No, because it contradicts information earlier in the paragraph."
  ],
  "correct_index": 2,
  "explanation": "The paragraph is about design history; a personal detail about a cousin's bike is irrelevant to that focus.",
  "distractor_notes": {
   "3": "It doesn't contradict anything — it's just off-topic."
  },
  "est_seconds": 60,
  "id": "d0000000-0000-4000-8000-000000000028"
 },
 {
  "exam": "ACT",
  "section": "Math",
  "skill_id": "act-math-algebra",
  "difficulty": 1,
  "passage": null,
  "prompt": "If 5x − 3 = 2x + 9, what is the value of x?",
  "choices": [
   "2",
   "3",
   "4",
   "6"
  ],
  "correct_index": 2,
  "explanation": "Subtract 2x: 3x − 3 = 9. Add 3: 3x = 12. So x = 4.",
  "distractor_notes": {},
  "est_seconds": 50,
  "id": "d0000000-0000-4000-8000-000000000029"
 },
 {
  "exam": "ACT",
  "section": "Math",
  "skill_id": "act-math-algebra",
  "difficulty": 2,
  "passage": null,
  "prompt": "What is the slope of the line that passes through (1, 2) and (4, 11)?",
  "choices": [
   "1/3",
   "3",
   "9",
   "13/5"
  ],
  "correct_index": 1,
  "explanation": "Slope = (11 − 2)/(4 − 1) = 9/3 = 3.",
  "distractor_notes": {
   "0": "1/3 is run over rise — slope is rise over run."
  },
  "est_seconds": 50,
  "id": "d0000000-0000-4000-8000-000000000030"
 },
 {
  "exam": "ACT",
  "section": "Math",
  "skill_id": "act-math-geometry",
  "difficulty": 1,
  "passage": null,
  "prompt": "What is the perimeter of a rectangle with length 7 and width 4?",
  "choices": [
   "11",
   "22",
   "28",
   "14"
  ],
  "correct_index": 1,
  "explanation": "Perimeter = 2(7 + 4) = 22.",
  "distractor_notes": {
   "2": "28 is the area."
  },
  "est_seconds": 40,
  "id": "d0000000-0000-4000-8000-000000000031"
 },
 {
  "exam": "ACT",
  "section": "Math",
  "skill_id": "act-math-geometry",
  "difficulty": 3,
  "passage": null,
  "prompt": "The measures of the angles of a triangle are in the ratio 2 : 3 : 4. What is the measure of the largest angle?",
  "choices": [
   "40°",
   "60°",
   "80°",
   "90°"
  ],
  "correct_index": 2,
  "explanation": "The parts total 2 + 3 + 4 = 9, and the angles sum to 180°, so each part is 20°. The largest is 4 × 20° = 80°.",
  "distractor_notes": {
   "0": "40° is the smallest angle."
  },
  "est_seconds": 70,
  "id": "d0000000-0000-4000-8000-000000000032"
 },
 {
  "exam": "ACT",
  "section": "Reading",
  "skill_id": "act-reading-key-ideas",
  "difficulty": 1,
  "passage": "When the factory closed in 1987, Marisol's father took a job driving a delivery truck across three counties. He left before sunrise and returned after dinner, and on weekends he slept until noon. Still, every Sunday evening he spread out his old drafting paper on the kitchen table and sketched buildings no one had asked him to design.",
  "prompt": "According to the passage, what did Marisol's father do after the factory closed?",
  "choices": [
   "He became an architect.",
   "He drove a delivery truck.",
   "He opened a restaurant.",
   "He moved to another state."
  ],
  "correct_index": 1,
  "explanation": "The first sentence states he \"took a job driving a delivery truck.\"",
  "distractor_notes": {
   "0": "He sketched buildings as a hobby; nothing says he became an architect."
  },
  "est_seconds": 60,
  "id": "d0000000-0000-4000-8000-000000000033"
 },
 {
  "exam": "ACT",
  "section": "Reading",
  "skill_id": "act-reading-key-ideas",
  "difficulty": 2,
  "passage": "When the factory closed in 1987, Marisol's father took a job driving a delivery truck across three counties. He left before sunrise and returned after dinner, and on weekends he slept until noon. Still, every Sunday evening he spread out his old drafting paper on the kitchen table and sketched buildings no one had asked him to design.",
  "prompt": "The details in the last sentence most strongly suggest that the father:",
  "choices": [
   "continued to value his drafting skills despite his new job.",
   "planned to return to the factory soon.",
   "disliked driving the delivery truck.",
   "was designing a new home for the family."
  ],
  "correct_index": 0,
  "explanation": "He keeps sketching on his own time, even when exhausted, which shows he still values drafting.",
  "distractor_notes": {
   "2": "The passage never states his feelings about driving."
  },
  "est_seconds": 75,
  "id": "d0000000-0000-4000-8000-000000000034"
 },
 {
  "exam": "ACT",
  "section": "Reading",
  "skill_id": "act-reading-craft",
  "difficulty": 2,
  "passage": "When the factory closed in 1987, Marisol's father took a job driving a delivery truck across three counties. He left before sunrise and returned after dinner, and on weekends he slept until noon. Still, every Sunday evening he spread out his old drafting paper on the kitchen table and sketched buildings no one had asked him to design.",
  "prompt": "The phrase \"no one had asked him to design\" mainly emphasizes that the sketches were:",
  "choices": [
   "made for his own reasons rather than for pay or assignment.",
   "rejected by his family.",
   "poorly designed.",
   "made for several clients."
  ],
  "correct_index": 0,
  "explanation": "\"No one had asked\" means there was no client or assignment — he drew them for himself.",
  "distractor_notes": {
   "3": "The phrase says the opposite: there were no clients."
  },
  "est_seconds": 70,
  "id": "d0000000-0000-4000-8000-000000000035"
 },
 {
  "exam": "ACT",
  "section": "Reading",
  "skill_id": "act-reading-craft",
  "difficulty": 3,
  "passage": "When the factory closed in 1987, Marisol's father took a job driving a delivery truck across three counties. He left before sunrise and returned after dinner, and on weekends he slept until noon. Still, every Sunday evening he spread out his old drafting paper on the kitchen table and sketched buildings no one had asked him to design.",
  "prompt": "The word \"Still\" at the start of the last sentence signals:",
  "choices": [
   "a cause-and-effect relationship.",
   "a return to an earlier time.",
   "agreement with a previous claim.",
   "a contrast between his exhausting schedule and his continued sketching."
  ],
  "correct_index": 3,
  "explanation": "\"Still\" here means \"nevertheless\": despite his tiring schedule, he kept sketching.",
  "distractor_notes": {
   "0": "The schedule doesn't cause the sketching — it makes it surprising."
  },
  "est_seconds": 70,
  "id": "d0000000-0000-4000-8000-000000000036"
 },
 {
  "exam": "ACT",
  "section": "Science",
  "skill_id": "act-sci-data",
  "difficulty": 1,
  "passage": "Table 1: Dissolved oxygen in water at different temperatures\nTemperature (°C): 10 | 20 | 30 | 40\nDissolved O₂ (mg/L): 11.3 | 9.1 | 7.6 | 6.4",
  "prompt": "According to Table 1, as temperature increases, dissolved oxygen:",
  "choices": [
   "increases.",
   "decreases.",
   "stays the same.",
   "increases, then decreases."
  ],
  "correct_index": 1,
  "explanation": "Every increase in temperature is paired with a lower oxygen value: 11.3 → 9.1 → 7.6 → 6.4.",
  "distractor_notes": {},
  "est_seconds": 45,
  "id": "d0000000-0000-4000-8000-000000000037"
 },
 {
  "exam": "ACT",
  "section": "Science",
  "skill_id": "act-sci-data",
  "difficulty": 2,
  "passage": "Table 1: Dissolved oxygen in water at different temperatures\nTemperature (°C): 10 | 20 | 30 | 40\nDissolved O₂ (mg/L): 11.3 | 9.1 | 7.6 | 6.4",
  "prompt": "Based on Table 1, the dissolved oxygen at 25°C would most likely be:",
  "choices": [
   "below 6.4 mg/L.",
   "between 6.4 and 7.6 mg/L.",
   "between 7.6 and 9.1 mg/L.",
   "above 11.3 mg/L."
  ],
  "correct_index": 2,
  "explanation": "25°C is between 20°C (9.1) and 30°C (7.6), so the value should fall between 7.6 and 9.1 mg/L.",
  "distractor_notes": {
   "1": "That range corresponds to 30–40°C."
  },
  "est_seconds": 60,
  "id": "d0000000-0000-4000-8000-000000000038"
 },
 {
  "exam": "ACT",
  "section": "Science",
  "skill_id": "act-sci-experiments",
  "difficulty": 2,
  "passage": "A student tested how the amount of fertilizer affects plant height. She grew 4 groups of the same plant species in identical soil, with the same water and light, adding 0 g, 5 g, 10 g, or 15 g of fertilizer per week.",
  "prompt": "What is the independent variable in this experiment?",
  "choices": [
   "Plant height",
   "Amount of fertilizer",
   "Amount of water",
   "Amount of light"
  ],
  "correct_index": 1,
  "explanation": "The independent variable is the factor the experimenter deliberately changes: fertilizer amount.",
  "distractor_notes": {
   "0": "Plant height is measured — it's the dependent variable.",
   "2": "Water was held constant."
  },
  "est_seconds": 50,
  "id": "d0000000-0000-4000-8000-000000000039"
 },
 {
  "exam": "ACT",
  "section": "Science",
  "skill_id": "act-sci-experiments",
  "difficulty": 3,
  "passage": "A student tested how the amount of fertilizer affects plant height. She grew 4 groups of the same plant species in identical soil, with the same water and light, adding 0 g, 5 g, 10 g, or 15 g of fertilizer per week.",
  "prompt": "What is the main purpose of the group that received 0 g of fertilizer?",
  "choices": [
   "To increase the sample size of tall plants",
   "To test the effect of light",
   "To serve as a control for comparison",
   "To change the soil type"
  ],
  "correct_index": 2,
  "explanation": "The 0 g group shows how plants grow without fertilizer, giving a baseline to compare the other groups against.",
  "distractor_notes": {},
  "est_seconds": 60,
  "id": "d0000000-0000-4000-8000-000000000040"
 }
];
