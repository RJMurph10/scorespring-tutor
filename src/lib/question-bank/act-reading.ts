// Original ACT-style Reading passages (one literary, one social science, one humanities,
// one natural science), nine questions each. Correct answer is listed first in each `c` array.
import { passageSet, type Draft } from "./build";

const KI = "act-reading-key-ideas";
const CR = "act-reading-craft";

const P1 = `Passage I — Literary Narrative: This passage is from a short story.

On the last day the shop was open, my grandfather wound every clock in it, though he knew no customer would come to hear them. There were forty-one of them, from the tall walnut case clock by the door to the small brass carriage clocks lined up on the shelf behind the counter, and he went from one to the next with the same unhurried care he had shown them for thirty-eight years.

"They should go out the way they came in," he said when I asked why he bothered. "Running."

I had come to help him pack, but for most of the morning there was little to do except watch. He had sold the building months before, and the new owners planned to open a phone repair store. My mother had told me that Grandpa was relieved to be retiring, that his eyes were no longer good enough for the tiny gears, and that he was looking forward to fishing. But standing in the narrow room, with all the clocks ticking slightly out of step, like a crowd of people talking at once, I wasn't sure she was right.

Around noon a woman came in carrying a shoebox. Inside was a wristwatch with a cracked face. It had been her father's, she said, and it hadn't worked in years. She'd seen the sign in the window and hoped she wasn't too late.

My grandfather looked at the watch for a long moment. Then he cleared a space on the counter, switched on the lamp, and fitted his loupe to his eye. I had seen him do this a thousand times, but I watched now as if for the first time: the way his hands, which shook slightly when he held a coffee cup, became perfectly still over the open watch.

It took him almost an hour. When he finally handed it back, the second hand was sweeping smoothly around the cracked face. The woman tried to pay him, and he waved the money away.

"Last job," he said. "On the house."

After she left, he sat for a while without speaking. Then he stood, took one of the carriage clocks from the shelf, and wrapped it carefully in newspaper.

"For you," he said, placing it in my hands. "You'll have to wind it yourself."`;

const P2 = `Passage II — Social Science: This passage is adapted from an essay about decision-making.

Most people believe that their important choices reflect their own preferences. When we enroll in a retirement plan, choose a health insurance option, or decide whether to become an organ donor, we assume we have weighed the alternatives and picked the one we want. Research in behavioral economics suggests that the situation is more complicated: very often, the option we end up with is simply the one that was already selected for us.

Economists call this pre-selected option the default. A default is what happens if a person does nothing. For decades, many employers required workers to sign up actively for retirement savings plans; workers who never filled out the form were not enrolled. When some companies reversed this arrangement, automatically enrolling new employees while allowing them to opt out at any time, participation rose dramatically. The workers' options had not changed at all. Only the starting point had.

Why should a starting point matter so much? Researchers point to several forces. Choosing requires effort, and even a few minutes of paperwork can be enough to make people postpone a decision indefinitely. Defaults can also carry an implied endorsement: people may assume that whoever chose the default did so for good reasons. Finally, people tend to feel losses more sharply than equivalent gains, so giving up an option they already "have" can feel like a loss.

Similar patterns appear in other areas. Countries in which citizens are organ donors unless they opt out tend to have far higher registration rates than countries that require people to opt in, even when surveys show that attitudes toward donation are similar.

This power raises difficult questions. If those who design forms and policies inevitably influence choices, there may be no truly neutral way to present options. Some scholars argue that designers should therefore choose defaults that most people would want if they thought carefully, while keeping it easy to choose differently. Critics respond that this approach places too much trust in designers' judgment about what is best for others. Both sides agree on one point, however: the question is not whether defaults shape decisions, but how.`;

const P3 = `Passage III — Humanities: This passage is adapted from an essay by a literary translator.

People often ask me whether a translation can ever be faithful to its original. The question assumes that faithfulness is a single, simple thing — that a translator's job is to find, for every word in one language, its twin in another. Anyone who has tried to translate even a short poem knows that this is not how languages work.

Consider the problem of a single word. The language I translate from has a word for the particular quiet of a house after guests have left: not silence exactly, but a silence that still holds the shape of conversation. English has no such word. I can explain it in a phrase, as I have just done, but a phrase is heavier than a word. Placed in a line of poetry, it slows the rhythm and draws attention to itself in a way the original never did. If I keep the meaning, I lose the music; if I keep the music, I lose some of the meaning.

Every translation is built from hundreds of decisions like this one. Should a joke be translated literally, so that readers understand what was said, or replaced with a different joke, so that readers laugh where the original audience laughed? Should an old-fashioned phrase sound old-fashioned in English, or should it sound as natural to modern readers as it once did to the original ones? There is no rule that settles these questions. There is only judgment, and judgment can always be argued with.

For this reason, I have come to think of translation less as copying than as performance. A pianist playing a sonata does not change the notes the composer wrote, yet no two pianists play it the same way, and we do not say that one of them has betrayed the music. We say that each has interpreted it. A translator, too, is an interpreter, faithful not to every word but to what she understands the work to be doing.

This view does not make every translation equally good. A performance can be careless or wrongheaded, and so can a translation. But it does free the translator from an impossible standard and replaces it with a demanding one: not to reproduce the original, but to give it a second life.`;

const P4 = `Passage IV — Natural Science: This passage is adapted from an article about tardigrades.

Tardigrades, sometimes called water bears, are among the toughest animals known. Most species are less than a millimeter long, with plump bodies and eight stubby legs ending in claws. They live almost everywhere: in ocean sediments, in hot springs, in Antarctic ice, and — most commonly — in the thin film of water that coats mosses and lichens.

That film of water is the key to their reputation. A patch of moss may dry out completely in a single sunny afternoon. Many animals living there would die, but tardigrades respond by entering a state called anhydrobiosis, meaning "life without water." As it dries, a tardigrade pulls in its legs and head and curls into a compact, barrel-shaped form known as a tun. Its metabolism slows to an almost undetectable level. In this state, a tardigrade can survive for years. When water returns, it can rehydrate and resume activity within hours.

Tuns are remarkably resistant to other stresses as well. In laboratory experiments, dried tardigrades have survived temperatures far below freezing, pressures greater than those at the bottom of the deepest ocean trench, and doses of radiation many times higher than would be lethal to humans. In 2007, researchers sent dried tardigrades into low Earth orbit, exposing them to the vacuum of space. After returning to Earth, many of the animals revived, and some went on to reproduce.

Scientists are still working out how tardigrades accomplish these feats. One clue came from the discovery of a protein, found in at least one tardigrade species, that appears to shield DNA from damage. When researchers introduced the gene for this protein into human cells grown in the laboratory, the cells suffered noticeably less DNA damage from X-rays than unaltered cells did. Other tardigrade proteins seem to form a glass-like material inside drying cells, holding delicate molecules in place until water returns.

Researchers caution that tardigrades are not indestructible. Active, hydrated tardigrades are far more vulnerable than tuns, and long exposure to high temperatures can kill even dried ones. Still, the mechanisms that allow these tiny animals to survive extreme conditions may someday help scientists preserve vaccines and other medicines without refrigeration.`;

export const ACT_READING: Draft[] = [
  ...passageSet(1, P1, [
    {
      skill: KI,
      d: 1,
      q: "The main purpose of the passage is to:",
      c: [
        "depict a significant final day at the grandfather's shop through the narrator's eyes.",
        "explain the technical process of repairing a wristwatch.",
        "describe the history of the building that housed the shop.",
        "argue that phone repair stores are replacing traditional businesses.",
      ],
      e: "The passage centers on the shop's last day — winding the clocks, the final repair, the gift — as observed by the narrator.",
    },
    {
      skill: KI,
      d: 1,
      q: "According to the passage, why did the grandfather wind every clock on the shop's last day?",
      c: [
        "He wanted the clocks to be running when the shop closed, just as they had been when it opened.",
        "He expected many customers to visit before closing.",
        "The new owners had asked him to leave the clocks running.",
        "He needed to test the clocks before selling them.",
      ],
      e: 'He says, "They should go out the way they came in…Running."',
      n: { 1: "The passage says he knew no customer would come." },
    },
    {
      skill: CR,
      d: 2,
      q: 'The narrator\'s comparison of the clocks to "a crowd of people talking at once" primarily serves to:',
      c: [
        "suggest that the shop feels full of life, which makes the narrator doubt that the grandfather is eager to leave.",
        "show that the clocks are broken and need repair.",
        "indicate that the shop is crowded with customers.",
        "emphasize that the narrator finds the clocks annoying.",
      ],
      e: "The image appears right as the narrator wonders whether the mother is right about the grandfather's relief; the lively room makes the narrator doubt it.",
    },
    {
      skill: KI,
      d: 2,
      q: "It can most reasonably be inferred that the narrator's mother believes the grandfather is:",
      c: [
        "ready to retire.",
        "unhappy about selling the building.",
        "planning to open a new shop.",
        "unable to repair watches at all.",
      ],
      e: "She told the narrator the grandfather was relieved to retire and looking forward to fishing.",
      n: {
        3: "She says his eyes weren't good enough for tiny gears — not that he couldn't repair anything.",
      },
    },
    {
      skill: CR,
      d: 2,
      q: 'The detail that the grandfather\'s hands "shook slightly when he held a coffee cup" but became "perfectly still over the open watch" mainly emphasizes:',
      c: [
        "his lasting skill and focus when doing the work he knows best.",
        "his poor health and need to retire.",
        "the narrator's worry that he will damage the watch.",
        "the difficulty of drinking coffee while working.",
      ],
      e: "The contrast highlights how his steadiness returns when he works on a watch.",
    },
    {
      skill: KI,
      d: 2,
      q: "How long did it take the grandfather to repair the woman's watch?",
      c: ["Almost an hour", "A few minutes", "All afternoon", "Several days"],
      e: 'The passage states, "It took him almost an hour."',
    },
    {
      skill: KI,
      d: 3,
      q: "The grandfather's refusal of the woman's payment most strongly suggests that he:",
      c: [
        "valued the repair as a meaningful final act rather than as a business transaction.",
        "believed the watch was not worth repairing.",
        "was angry that she had arrived so late in the day.",
        "didn't want to keep any records of his last sale.",
      ],
      e: 'He calls it his "Last job" and gives it "On the house," treating it as a fitting end rather than a sale.',
    },
    {
      skill: CR,
      d: 3,
      q: "The grandfather's final statement, \"You'll have to wind it yourself,\" most likely suggests that he:",
      c: [
        "is passing on to the narrator a responsibility for keeping something he cares about alive.",
        "is disappointed that the narrator doesn't know how clocks work.",
        "expects the clock to break soon.",
        "plans to visit regularly to wind the clock.",
      ],
      e: "After his ritual of winding every clock, handing one to the narrator to wind symbolically passes on that care.",
      n: { 3: "The line implies the opposite: the narrator will now be responsible for it." },
    },
    {
      skill: CR,
      d: 2,
      q: "The passage is told from the point of view of:",
      c: [
        "a grandchild who observes the grandfather on the shop's last day.",
        "the grandfather looking back on his career.",
        "the woman who brings in the broken watch.",
        "an outside narrator who knows every character's thoughts.",
      ],
      e: 'The narrator uses "my grandfather" and "I," observing events and only guessing at the grandfather\'s feelings.',
    },
  ]),
  ...passageSet(2, P2, [
    {
      skill: KI,
      d: 1,
      q: "The main idea of the passage is that:",
      c: [
        "pre-selected options strongly influence the choices people end up with.",
        "most people make important decisions carefully and independently.",
        "retirement savings plans should be mandatory for all workers.",
        "organ donation rates are the same in every country.",
      ],
      e: "The passage argues that defaults often determine outcomes, and it explores why and what that means.",
    },
    {
      skill: KI,
      d: 1,
      q: "As defined in the passage, a default is:",
      c: [
        "the outcome that occurs if a person takes no action.",
        "an option chosen by most people after careful thought.",
        "a penalty for failing to complete a form.",
        "the most expensive option available.",
      ],
      e: '"A default is what happens if a person does nothing."',
    },
    {
      skill: KI,
      d: 2,
      q: "According to the passage, when companies began automatically enrolling new employees in retirement plans, workers' available options:",
      c: [
        "stayed the same.",
        "became more limited.",
        "became more expensive.",
        "were explained in more detail.",
      ],
      e: '"The workers\' options had not changed at all. Only the starting point had."',
    },
    {
      skill: KI,
      d: 2,
      q: "The passage identifies all of the following as reasons defaults are powerful EXCEPT:",
      c: [
        "defaults are always the least expensive option.",
        "choosing requires effort.",
        "defaults may seem to carry an endorsement.",
        "giving up an option one already has can feel like a loss.",
      ],
      e: "The third paragraph lists effort, implied endorsement, and loss aversion. Cost is never mentioned.",
    },
    {
      skill: CR,
      d: 2,
      q: 'The main purpose of the fourth paragraph (beginning "Similar patterns appear") is to:',
      c: [
        "show that the effect of defaults extends beyond retirement plans.",
        "argue that organ donation should be required by law.",
        "present evidence that contradicts the earlier claims.",
        "explain why surveys about donation are unreliable.",
      ],
      e: "It applies the same pattern to organ donation, showing the effect in another area.",
    },
    {
      skill: KI,
      d: 3,
      q: "Based on the passage, the organ donation example suggests that differences in registration rates between countries are most likely due to:",
      c: [
        "how the choice is presented rather than differences in attitudes.",
        "differences in how strongly citizens support donation.",
        "the cost of registering as a donor.",
        "the number of hospitals in each country.",
      ],
      e: "The passage notes attitudes are similar even though registration rates differ — pointing to the opt-in/opt-out design.",
    },
    {
      skill: CR,
      d: 2,
      q: 'As used in the final paragraph, the word "neutral" most nearly means:',
      c: [
        "free of influence on the outcome.",
        "lacking strong emotion.",
        "located in the middle.",
        "unimportant.",
      ],
      e: "The point is that there may be no way to present options that doesn't influence choices.",
    },
    {
      skill: CR,
      d: 3,
      q: "In the final paragraph, the author presents the views of scholars and critics primarily in order to:",
      c: [
        "describe a disagreement about how defaults should be chosen while noting a point both sides accept.",
        "prove that the critics are correct.",
        "show that defaults have no real effect on decisions.",
        "argue that forms should offer no options at all.",
      ],
      e: "The paragraph lays out both positions and ends with their shared agreement that defaults shape decisions.",
    },
    {
      skill: CR,
      d: 2,
      q: "The author's tone in discussing the ethical questions raised by defaults is best described as:",
      c: [
        "balanced and thoughtful.",
        "angry and accusatory.",
        "dismissive and sarcastic.",
        "uncertain and confused.",
      ],
      e: 'The author presents both sides fairly and calls the questions "difficult" without taking an aggressive stance.',
    },
  ]),
  ...passageSet(3, P3, [
    {
      skill: KI,
      d: 1,
      q: "The author's main claim in the passage is that translation is best understood as:",
      c: [
        "a kind of interpretation that requires judgment.",
        "the process of matching each word to its exact equivalent.",
        "an impossible task that should not be attempted.",
        "a skill that requires no special training.",
      ],
      e: "The author describes translation as performance and the translator as an interpreter making judgments.",
    },
    {
      skill: KI,
      d: 2,
      q: "The author uses the example of the word for a quiet house primarily to illustrate that:",
      c: [
        "preserving a word's meaning can come at the cost of its sound and rhythm.",
        "English has more words than other languages.",
        "poetry cannot be translated into English.",
        "translators should always choose the shortest phrase.",
      ],
      e: 'Explaining the word requires a phrase that keeps meaning but "slows the rhythm": "If I keep the meaning, I lose the music."',
    },
    {
      skill: CR,
      d: 2,
      q: "The questions in the third paragraph (about jokes and old-fashioned phrases) mainly serve to:",
      c: [
        "show the kinds of decisions translators must make that have no fixed answer.",
        "suggest that jokes should never be translated.",
        "criticize translators who modernize old texts.",
        "explain the history of translation.",
      ],
      e: 'The paragraph follows them with "There is no rule that settles these questions. There is only judgment."',
    },
    {
      skill: CR,
      d: 2,
      q: "The comparison between a translator and a pianist suggests that:",
      c: [
        "two different translations of a work can both be legitimate.",
        "translators should study music.",
        "pianists are more skilled than translators.",
        "a translation should change the original's content.",
      ],
      e: "No two pianists play a sonata the same way, yet neither betrays the music; likewise translations can differ legitimately.",
    },
    {
      skill: KI,
      d: 2,
      q: "According to the passage, viewing translation as performance does NOT mean that:",
      c: [
        "every translation is equally good.",
        "translators must use judgment.",
        "translators interpret the work.",
        "translations can differ from each other.",
      ],
      e: 'The last paragraph says, "This view does not make every translation equally good."',
    },
    {
      skill: CR,
      d: 3,
      q: 'In the final paragraph, the author contrasts an "impossible standard" with a "demanding one" in order to suggest that:',
      c: [
        "rejecting word-for-word faithfulness doesn't make translation easier, only achievable.",
        "translators should lower their expectations.",
        "translation is less difficult than people believe.",
        "readers should not judge translations.",
      ],
      e: 'The new standard — giving the work a second life — is still "demanding," just not impossible.',
    },
    {
      skill: CR,
      d: 2,
      q: 'As used in the second paragraph, the word "heavier" most nearly means:',
      c: [
        "more cumbersome.",
        "more important.",
        "more serious in tone.",
        "greater in physical weight.",
      ],
      e: "A phrase takes up more space and slows the line — it is clumsier than a single word.",
    },
    {
      skill: KI,
      d: 1,
      q: "The passage indicates that people often ask the author:",
      c: [
        "whether a translation can be faithful to its original.",
        "how long it takes to translate a poem.",
        "which languages are hardest to translate.",
        "why she became a translator.",
      ],
      e: 'The first sentence: "People often ask me whether a translation can ever be faithful to its original."',
    },
    {
      skill: CR,
      d: 3,
      q: "The author's attitude toward the idea that translation means finding each word's \"twin\" is best described as:",
      c: [
        "skeptical, because languages don't correspond word for word.",
        "enthusiastic, because it makes translation simple.",
        "neutral, because she has no opinion on the matter.",
        "confused, because she has never tried to translate.",
      ],
      e: 'She says anyone who has translated knows "this is not how languages work."',
    },
  ]),
  ...passageSet(4, P4, [
    {
      skill: KI,
      d: 1,
      q: "The passage is primarily concerned with:",
      c: [
        "explaining how tardigrades survive extreme conditions and why scientists study them.",
        "describing the life cycle of mosses and lichens.",
        "arguing that tardigrades are the oldest animals on Earth.",
        "comparing tardigrades to bears.",
      ],
      e: "The passage describes tardigrade survival abilities, possible mechanisms, and potential applications.",
    },
    {
      skill: KI,
      d: 1,
      q: "According to the passage, tardigrades most commonly live in:",
      c: [
        "the thin film of water on mosses and lichens.",
        "the bottom of ocean trenches.",
        "hot springs.",
        "Antarctic ice.",
      ],
      e: 'The first paragraph says "most commonly — in the thin film of water that coats mosses and lichens."',
    },
    {
      skill: KI,
      d: 2,
      q: "Based on the passage, a tardigrade in the tun state is characterized by:",
      c: [
        "a curled-up body and a nearly undetectable metabolism.",
        "increased activity and rapid reproduction.",
        "a larger body and longer legs.",
        "the ability to absorb water from dry air.",
      ],
      e: 'The tun is a compact, curled form, and metabolism "slows to an almost undetectable level."',
    },
    {
      skill: CR,
      d: 2,
      q: 'As used in the second paragraph, the phrase "life without water" is the author\'s:',
      c: [
        "translation of the term anhydrobiosis.",
        "description of the Antarctic environment.",
        "claim that tardigrades never need water.",
        "name for a separate species.",
      ],
      e: "The author introduces anhydrobiosis, \"meaning 'life without water.'\"",
      n: { 2: "Tardigrades revive when water returns; they do need it to be active." },
    },
    {
      skill: KI,
      d: 2,
      q: "According to the passage, what happened to tardigrades sent into low Earth orbit in 2007?",
      c: [
        "Many revived after returning to Earth, and some reproduced.",
        "All of them died from exposure to space.",
        "They remained in the tun state permanently.",
        "They grew larger than tardigrades on Earth.",
      ],
      e: '"Many of the animals revived, and some went on to reproduce."',
    },
    {
      skill: KI,
      d: 3,
      q: "The experiment with human cells described in the fourth paragraph suggests that the tardigrade protein:",
      c: [
        "can reduce DNA damage from radiation even outside a tardigrade.",
        "allows human cells to survive without water.",
        "causes human cells to form a tun.",
        "has no effect on human cells.",
      ],
      e: 'Human cells with the gene suffered "noticeably less DNA damage from X-rays."',
    },
    {
      skill: CR,
      d: 2,
      q: "The main purpose of the final paragraph is to:",
      c: [
        "qualify the earlier claims about tardigrades' toughness and note a possible application.",
        "argue that tardigrades are indestructible.",
        "introduce a new species of tardigrade.",
        "explain how vaccines are made.",
      ],
      e: "It cautions that tardigrades aren't indestructible and then mentions preserving medicines.",
    },
    {
      skill: CR,
      d: 3,
      q: "The author describes the glass-like material formed inside drying cells mainly to:",
      c: [
        "give a second possible explanation for how tardigrades survive drying.",
        "show that tardigrades are made of glass.",
        "contrast tardigrades with human cells.",
        "explain why active tardigrades are vulnerable.",
      ],
      e: 'After the DNA-shielding protein, "Other tardigrade proteins" forming glass offer another mechanism.',
    },
    {
      skill: KI,
      d: 3,
      q: "It can reasonably be inferred from the passage that a hydrated, active tardigrade exposed to strong radiation would be:",
      c: [
        "less likely to survive than a tardigrade in the tun state.",
        "more likely to survive than a tardigrade in the tun state.",
        "unaffected by the radiation.",
        "unable to enter the tun state ever again.",
      ],
      e: 'The passage says active tardigrades are "far more vulnerable than tuns," and the radiation results describe dried tardigrades.',
    },
  ]),
];
