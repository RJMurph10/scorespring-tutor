// Original ACT-style Science passages: data representation, research summaries, and
// conflicting viewpoints. Seven questions per passage. Correct answer listed first.
import { passageSet, type Draft } from "./build";

const DA = "act-sci-data";
const EX = "act-sci-experiments";

const S1 = `Passage I

The solubility of a substance is the maximum mass of that substance that will dissolve in a given amount of water at a given temperature. Table 1 shows the solubility of three salts — potassium nitrate (KNO₃), sodium chloride (NaCl), and potassium chloride (KCl) — in grams of salt per 100 grams (g) of water.

Table 1: Solubility (g per 100 g of water)
Temperature (°C): 0 | 20 | 40 | 60 | 80
KNO₃: 13 | 32 | 64 | 110 | 169
NaCl: 35.7 | 36.0 | 36.6 | 37.3 | 38.4
KCl: 28 | 34 | 40 | 46 | 51`;

const S2 = `Passage II

Pill bugs are small land crustaceans. A student studied which conditions pill bugs prefer using a rectangular chamber divided into two equal halves. In each trial, 20 pill bugs were placed in the center of the chamber, and the number of pill bugs in each half was counted after 10 minutes. Each experiment was performed 3 times with new pill bugs.

Experiment 1
One half of the chamber contained dry paper towel; the other contained moist paper towel. Both halves were lit.
Trial: 1 | 2 | 3
Dry half: 4 | 3 | 5
Moist half: 16 | 17 | 15

Experiment 2
Both halves contained moist paper towel. One half was covered to make it dark; the other was lit.
Trial: 1 | 2 | 3
Lit half: 6 | 7 | 5
Dark half: 14 | 13 | 15

Experiment 3
One half was dry and dark; the other half was moist and lit.
Trial: 1 | 2 | 3
Dry and dark half: 9 | 11 | 10
Moist and lit half: 11 | 9 | 10`;

const S3 = `Passage III

Air pressure decreases as altitude increases. The temperature at which water boils depends on the air pressure above it. Table 1 shows the average air pressure, in kilopascals (kPa), and the boiling point of pure water at several altitudes above sea level.

Table 1
Altitude (m): 0 | 1,000 | 2,000 | 3,000 | 4,000
Air pressure (kPa): 101.3 | 89.9 | 79.5 | 70.1 | 61.6
Boiling point (°C): 100.0 | 96.7 | 93.4 | 90.0 | 86.7`;

const S4 = `Passage IV

Over the past 20 years, the population of a native fish species in a large lake has declined by about half. During this period, the average summer surface temperature of the lake rose by 2°C, and average summer dissolved oxygen levels in deep water fell slightly. Zebra mussels, an invasive species that filters plankton from the water, were first found in the lake 10 years ago. Since then, plankton levels in the lake have fallen by about 60%. Young fish of the native species feed mainly on plankton. Two scientists discuss the cause of the decline.

Scientist 1
The decline is mainly caused by warming. Warm water holds less dissolved oxygen than cold water, and the native fish need cool, oxygen-rich deep water in summer. As the lake has warmed, the amount of suitable summer habitat has shrunk, crowding the fish and lowering their survival. The mussels may affect plankton, but the fish population had already begun to decline before the mussels arrived.

Scientist 2
The decline is mainly caused by zebra mussels. By filtering enormous amounts of plankton, the mussels have reduced the food available to young fish, so fewer young fish survive to become adults. Dissolved oxygen levels have fallen only slightly and remain above the level the fish need. Most of the population decline has occurred in the last 10 years, after the mussels became established.`;

const S5 = `Passage V

A pendulum consists of a mass (the bob) hanging from a string. The period of a pendulum is the time it takes to complete one full back-and-forth swing. Students measured the period of pendulums under different conditions. In each experiment, the bob was pulled to one side and released, and the time for 10 swings was divided by 10.

Experiment 1: Mass = 100 g, release angle = 10°
Length (m): 0.25 | 0.50 | 1.00 | 2.00
Period (s): 1.00 | 1.42 | 2.01 | 2.84

Experiment 2: Length = 1.00 m, release angle = 10°
Mass (g): 50 | 100 | 200
Period (s): 2.01 | 2.01 | 2.00

Experiment 3: Length = 1.00 m, mass = 100 g
Release angle (°): 5 | 10 | 30 | 60
Period (s): 2.00 | 2.01 | 2.04 | 2.15`;

const S6 = `Passage VI

Catalase is an enzyme that breaks down hydrogen peroxide into water and oxygen gas. Researchers measured catalase activity as the volume of oxygen gas produced per minute, in milliliters (mL/min).

Study 1
Catalase activity was measured at different temperatures. The pH was kept at 7.
Temperature (°C): 10 | 20 | 30 | 37 | 45 | 60
Activity (mL/min): 12 | 25 | 38 | 45 | 30 | 5

Study 2
Catalase activity was measured at different pH values. The temperature was kept at 37°C.
pH: 3 | 5 | 7 | 9 | 11
Activity (mL/min): 6 | 22 | 45 | 28 | 8`;

export const ACT_SCIENCE: Draft[] = [
  ...passageSet(1, S1, [
    {
      skill: DA,
      d: 1,
      q: "According to Table 1, at 40°C, which salt has the greatest solubility?",
      c: ["KNO₃", "NaCl", "KCl", "All three salts have equal solubility."],
      e: "At 40°C: KNO₃ = 64, KCl = 40, NaCl = 36.6 g. KNO₃ is greatest.",
    },
    {
      skill: DA,
      d: 1,
      q: "According to Table 1, as temperature increases from 0°C to 80°C, the solubility of NaCl:",
      c: [
        "increases only slightly.",
        "increases sharply.",
        "decreases only slightly.",
        "stays exactly the same.",
      ],
      e: "NaCl rises from 35.7 to 38.4 g — a small increase.",
    },
    {
      skill: DA,
      d: 2,
      q: "Based on Table 1, the solubilities of KNO₃ and KCl are most nearly equal at which of the following temperatures?",
      c: ["20°C", "0°C", "40°C", "80°C"],
      e: "At 20°C, KNO₃ is 32 g and KCl is 34 g — a difference of only 2 g.",
    },
    {
      skill: DA,
      d: 2,
      q: "Based on Table 1, the solubility of KCl at 50°C is closest to:",
      c: [
        "43 g per 100 g of water.",
        "37 g per 100 g of water.",
        "48 g per 100 g of water.",
        "52 g per 100 g of water.",
      ],
      e: "50°C is halfway between 40°C (40 g) and 60°C (46 g), so about 43 g.",
    },
    {
      skill: DA,
      d: 2,
      q: "If 50 g of KNO₃ is stirred into 100 g of water at 20°C, approximately how much KNO₃ will remain undissolved?",
      c: ["18 g", "32 g", "50 g", "0 g"],
      e: "Only 32 g can dissolve at 20°C, so 50 − 32 = 18 g remains undissolved.",
      n: { 1: "32 g is the amount that dissolves." },
    },
    {
      skill: DA,
      d: 3,
      q: "A saturated solution of KNO₃ in 100 g of water is cooled from 60°C to 20°C. Based on Table 1, approximately what mass of KNO₃ will come out of solution?",
      c: ["78 g", "32 g", "110 g", "142 g"],
      e: "At 60°C the water holds 110 g; at 20°C it holds 32 g. The difference, 78 g, crystallizes.",
    },
    {
      skill: DA,
      d: 2,
      q: "Based on Table 1, which salt's solubility is LEAST affected by changes in temperature?",
      c: ["NaCl", "KNO₃", "KCl", "KNO₃ and KCl are equally least affected."],
      e: "NaCl changes by only 2.7 g across the range, far less than the others.",
    },
  ]),
  ...passageSet(2, S2, [
    {
      skill: EX,
      d: 1,
      q: "In Experiment 1, the independent variable was the:",
      c: [
        "moisture level of each half of the chamber.",
        "number of pill bugs counted in each half.",
        "amount of light in each half of the chamber.",
        "length of time before counting.",
      ],
      e: "Experiment 1 changed whether each half was dry or moist; the counts were the dependent variable.",
      n: { 1: "The counts are what was measured — the dependent variable." },
    },
    {
      skill: DA,
      d: 1,
      q: "In Experiment 2, what was the average number of pill bugs found in the dark half?",
      c: ["14", "6", "13", "15"],
      e: "(14 + 13 + 15) ÷ 3 = 14.",
    },
    {
      skill: EX,
      d: 2,
      q: "Which factor was held constant in Experiment 2 but varied in Experiment 1?",
      c: ["Moisture", "Light", "Number of pill bugs", "Time before counting"],
      e: "In Experiment 2 both halves were moist; in Experiment 1 moisture differed between halves.",
    },
    {
      skill: EX,
      d: 2,
      q: "The results of Experiments 1 and 2 together best support which conclusion?",
      c: [
        "Pill bugs tend to prefer moist and dark conditions.",
        "Pill bugs tend to prefer dry and lit conditions.",
        "Pill bugs show no preference for moisture or light.",
        "Pill bugs prefer light more strongly than moisture.",
      ],
      e: "Most pill bugs chose the moist half in Experiment 1 and the dark half in Experiment 2.",
    },
    {
      skill: EX,
      d: 3,
      q: "In Experiment 3, the pill bugs divided nearly evenly between the two halves. This result most likely suggests that:",
      c: [
        "the pill bugs' preferences for moisture and for darkness were about equally strong in this setup.",
        "pill bugs cannot detect moisture or light.",
        "the chamber was not divided into equal halves.",
        "pill bugs prefer dry conditions over all others.",
      ],
      e: "Each half offered one preferred condition (dark or moist), and the pill bugs split evenly — consistent with competing preferences of similar strength.",
    },
    {
      skill: EX,
      d: 2,
      q: "The main reason the student repeated each experiment 3 times with new pill bugs was most likely to:",
      c: [
        "check whether the results were consistent.",
        "increase the amount of light in the chamber.",
        "allow the pill bugs to rest.",
        "change the independent variable.",
      ],
      e: "Repeated trials test whether results are reliable rather than due to chance.",
    },
    {
      skill: EX,
      d: 3,
      q: "If Experiment 1 were repeated with 40 pill bugs instead of 20, the number found in the moist half would most likely be closest to:",
      c: ["32", "16", "20", "40"],
      e: "About 80% of pill bugs (16 of 20) chose the moist half, so about 32 of 40 would be expected.",
    },
  ]),
  ...passageSet(3, S3, [
    {
      skill: DA,
      d: 1,
      q: "According to Table 1, the air pressure at an altitude of 2,000 m is:",
      c: ["79.5 kPa.", "89.9 kPa.", "70.1 kPa.", "93.4 kPa."],
      e: "Read the 2,000 m column: 79.5 kPa.",
      n: { 3: "93.4 is the boiling point in °C at 2,000 m." },
    },
    {
      skill: DA,
      d: 1,
      q: "According to Table 1, as altitude increases, the boiling point of water:",
      c: ["decreases.", "increases.", "stays the same.", "increases, then decreases."],
      e: "The boiling point falls from 100.0°C to 86.7°C as altitude rises.",
    },
    {
      skill: DA,
      d: 2,
      q: "Based on Table 1, the boiling point of water at an altitude of 2,500 m would be closest to:",
      c: ["91.7°C", "93.4°C", "90.0°C", "95.0°C"],
      e: "2,500 m is halfway between 2,000 m (93.4°C) and 3,000 m (90.0°C), so about 91.7°C.",
    },
    {
      skill: DA,
      d: 2,
      q: "Based on Table 1, water boils at 90.0°C when the air pressure is about:",
      c: ["70.1 kPa", "61.6 kPa", "79.5 kPa", "101.3 kPa"],
      e: "90.0°C occurs at 3,000 m, where the pressure is 70.1 kPa.",
    },
    {
      skill: DA,
      d: 3,
      q: "A hiker finds that water boils at 88°C. Based on Table 1, the hiker's altitude is closest to:",
      c: ["3,600 m", "2,600 m", "4,400 m", "1,600 m"],
      e: "88°C is between 90.0°C (3,000 m) and 86.7°C (4,000 m), a bit more than halfway — about 3,600 m.",
    },
    {
      skill: EX,
      d: 2,
      q: "Pasta takes longer to cook in boiling water at high altitudes. Based on the passage, the best explanation is that at high altitudes:",
      c: [
        "water boils at a lower temperature.",
        "water boils at a higher temperature.",
        "air pressure is higher.",
        "water cannot reach its boiling point.",
      ],
      e: "Lower pressure at altitude lowers the boiling point, so boiling water is cooler and cooks food more slowly.",
    },
    {
      skill: DA,
      d: 3,
      q: "Based on Table 1, for every 1,000 m increase in altitude, the boiling point of water decreases by approximately:",
      c: ["3.3°C", "1.0°C", "10°C", "11.4°C"],
      e: "Each 1,000 m step lowers the boiling point by about 3.3°C (100.0 → 96.7 → 93.4 → 90.0 → 86.7).",
      n: { 3: "11.4 is the pressure drop in kPa for the first 1,000 m." },
    },
  ]),
  ...passageSet(4, S4, [
    {
      skill: EX,
      d: 1,
      q: "Scientist 1 attributes the fish decline mainly to:",
      c: [
        "warmer water reducing suitable oxygen-rich habitat.",
        "zebra mussels reducing plankton.",
        "overfishing by people.",
        "a disease spreading among the fish.",
      ],
      e: "Scientist 1 says warming has shrunk cool, oxygen-rich summer habitat.",
    },
    {
      skill: EX,
      d: 1,
      q: "According to Scientist 2, the decline in plankton has mainly affected:",
      c: [
        "young fish, which depend on plankton for food.",
        "adult fish, which eat zebra mussels.",
        "dissolved oxygen levels in the lake.",
        "the surface temperature of the lake.",
      ],
      e: "Scientist 2 says reduced plankton means less food for young fish, so fewer survive.",
    },
    {
      skill: EX,
      d: 2,
      q: "Both scientists would most likely agree that:",
      c: [
        "the native fish population has declined over the past 20 years.",
        "zebra mussels are the main cause of the decline.",
        "warming is the main cause of the decline.",
        "dissolved oxygen levels have not changed at all.",
      ],
      e: "They disagree about the cause but both accept that the decline occurred.",
    },
    {
      skill: EX,
      d: 2,
      q: "Which of the following findings, if true, would most strengthen Scientist 2's viewpoint?",
      c: [
        "The stomachs of young fish contain much less food now than before the mussels arrived.",
        "The lake's surface temperature has risen steadily for 20 years.",
        "Adult fish move to deeper water during summer.",
        "The fish population began declining 18 years ago.",
      ],
      e: "Less food in young fish directly supports the claim that mussels reduced their food supply.",
      n: { 3: "A decline beginning before the mussels arrived supports Scientist 1." },
    },
    {
      skill: EX,
      d: 2,
      q: "Which of the following findings, if true, would most weaken Scientist 1's viewpoint?",
      c: [
        "Deep-water oxygen levels have remained well above what the fish need all summer.",
        "Warm water holds less oxygen than cold water.",
        "The lake's average summer temperature rose by 2°C.",
        "Plankton levels have dropped since the mussels arrived.",
      ],
      e: "Scientist 1's argument depends on low oxygen limiting habitat; plentiful oxygen would undercut it.",
    },
    {
      skill: EX,
      d: 3,
      q: "Suppose a nearby lake has warmed by the same amount but has no zebra mussels, and its population of the same fish species has not declined. This finding would most likely be used to support the viewpoint of:",
      c: [
        "Scientist 2, because warming alone did not cause a decline in that lake.",
        "Scientist 1, because warming occurred in both lakes.",
        "Scientist 1, because the nearby lake has no mussels.",
        "neither scientist, because the lakes are different.",
      ],
      e: "If warming without mussels caused no decline, warming alone is unlikely to explain the decline — supporting Scientist 2.",
    },
    {
      skill: EX,
      d: 3,
      q: "Based on Scientist 1's viewpoint, the fish population would be expected to decline most in years when:",
      c: [
        "summer water temperatures are highest.",
        "zebra mussel numbers are highest.",
        "plankton levels are highest.",
        "winter ice cover lasts longest.",
      ],
      e: "Scientist 1 links decline to warm water reducing oxygen-rich habitat, so the hottest summers should be worst.",
    },
  ]),
  ...passageSet(5, S5, [
    {
      skill: EX,
      d: 1,
      q: "In Experiment 2, which variable was changed?",
      c: [
        "The mass of the bob",
        "The length of the string",
        "The release angle",
        "The number of swings timed",
      ],
      e: "Experiment 2 used masses of 50, 100, and 200 g while keeping length and angle constant.",
    },
    {
      skill: DA,
      d: 1,
      q: "According to Experiment 1, as the length of a pendulum increases, its period:",
      c: ["increases.", "decreases.", "stays the same.", "increases, then decreases."],
      e: "Period rose from 1.00 s to 2.84 s as length increased.",
    },
    {
      skill: EX,
      d: 2,
      q: "The results of Experiment 2 suggest that the period of a pendulum:",
      c: [
        "does not depend significantly on the mass of the bob.",
        "doubles when the mass doubles.",
        "decreases sharply as mass increases.",
        "depends only on the mass of the bob.",
      ],
      e: "Periods were 2.01, 2.01, and 2.00 s — essentially unchanged across masses.",
    },
    {
      skill: DA,
      d: 2,
      q: "Based on Experiment 1, the period of a pendulum with a length of 4.00 m (mass 100 g, release angle 10°) would be closest to:",
      c: ["4.0 s", "5.7 s", "3.4 s", "8.0 s"],
      e: "Each time the length doubles, the period increases by a factor of about 1.41 (0.25 → 0.50 → 1.00 → 2.00 m). 2.84 × 1.41 ≈ 4.0 s.",
      n: { 1: "5.7 s doubles the period; period doesn't increase in proportion to length." },
    },
    {
      skill: EX,
      d: 1,
      q: "Which variable was held constant at 1.00 m in Experiment 3?",
      c: ["String length", "Mass", "Release angle", "Period"],
      e: 'Experiment 3 lists "Length = 1.00 m, mass = 100 g" and varies the release angle.',
    },
    {
      skill: DA,
      d: 3,
      q: "A student wants a pendulum with a period of 1.42 s using a 200 g bob and a 10° release angle. Based on the experiments, what string length should the student use?",
      c: ["0.50 m", "0.25 m", "1.00 m", "2.00 m"],
      e: "In Experiment 1, a 0.50 m pendulum had a period of 1.42 s, and Experiment 2 shows mass doesn't matter.",
    },
    {
      skill: EX,
      d: 3,
      q: "Which conclusion is best supported by the results of all three experiments?",
      c: [
        "Period depends mainly on length, changes slightly at large release angles, and is not affected by mass.",
        "Period depends mainly on mass.",
        "Period depends equally on length, mass, and release angle.",
        "Period is not affected by any of the variables tested.",
      ],
      e: "Length changed the period greatly, large angles changed it slightly (2.00 → 2.15 s), and mass had no meaningful effect.",
    },
  ]),
  ...passageSet(6, S6, [
    {
      skill: DA,
      d: 1,
      q: "According to Study 1, catalase activity was greatest at which temperature?",
      c: ["37°C", "30°C", "45°C", "60°C"],
      e: "Activity peaked at 45 mL/min at 37°C.",
    },
    {
      skill: DA,
      d: 1,
      q: "According to Study 2, what was the catalase activity at pH 9?",
      c: ["28 mL/min", "45 mL/min", "22 mL/min", "8 mL/min"],
      e: "Read the pH 9 column: 28 mL/min.",
    },
    {
      skill: DA,
      d: 2,
      q: "According to Study 1, as temperature increased from 37°C to 60°C, catalase activity:",
      c: ["decreased.", "increased.", "stayed the same.", "decreased, then increased."],
      e: "Activity fell from 45 to 30 to 5 mL/min.",
    },
    {
      skill: DA,
      d: 2,
      q: "In Study 1, catalase activity at 45°C was closest to the activity at which other temperature?",
      c: ["20°C", "30°C", "37°C", "10°C"],
      e: "At 45°C, activity was 30 mL/min. At 20°C it was 25 (a difference of 5); at 30°C it was 38 (a difference of 8).",
    },
    {
      skill: EX,
      d: 2,
      q: "Why did the researchers keep the temperature at 37°C throughout Study 2?",
      c: [
        "So that any change in activity could be attributed to pH",
        "Because catalase cannot function at other temperatures",
        "To measure how temperature affects activity",
        "So that pH would stay constant",
      ],
      e: "Holding temperature constant isolates pH as the only variable being tested.",
      n: { 1: "Study 1 shows catalase works at many temperatures." },
    },
    {
      skill: DA,
      d: 3,
      q: "Based on both studies, catalase activity at 20°C and pH 7 would most likely be closest to:",
      c: ["25 mL/min", "45 mL/min", "6 mL/min", "60 mL/min"],
      e: "Study 1 was done at pH 7, and at 20°C it measured 25 mL/min.",
    },
    {
      skill: EX,
      d: 3,
      q: "Which of the following best explains the very low activity at 60°C in Study 1?",
      c: [
        "High temperature changed the enzyme's shape so it could no longer work effectively.",
        "There was no hydrogen peroxide in the sample at 60°C.",
        "The pH at 60°C was much lower than in other trials.",
        "Enzymes always work faster at higher temperatures.",
      ],
      e: "Enzymes lose their working shape (denature) at high temperatures, sharply reducing activity.",
      n: { 2: "Study 1 held pH at 7 for every temperature." },
    },
  ]),
];
