export interface GmGuideSection {
  id: string;
  category: 'GM Core' | 'Moves & Fear' | 'Encounters & Hazards' | 'Clocks & Story' | 'Campaigns & Tools' | 'Rolltables' | 'SRD Reference';
  title: string;
  anchorId: string;
  anchorUrl: string;
  summary: string;
  details: string[];
  bulletPoints: string[];
  quickTips?: string[];
}

export const GM_HELP_DATA: GmGuideSection[] = [
  {
    "id": "gm-guidance",
    "category": "GM Core",
    "title": "Running an Adventure & Principles",
    "anchorId": "gm-guidance",
    "anchorUrl": "https://callmepartario.github.io/og-dhsrd/#gm-guidance",
    "summary": "Foundational guidelines for framing scenes, passing spotlight, and applying the Golden Rule.",
    "details": [
      "Be a Fan of the Characters: Highlight heroic successes and turn failures into dramatically exciting complications.",
      "Address the Characters, Not the Players: Speak directly to the heroes in-world to maintain immersion.",
      "Play to Find Out: Never force a rigid plot outcome. Allow player choices and dice rolls to shape the world.",
      "The Golden Rule: When a rule is ambiguous, make a fair ruling that favors drama, then check the exact wording after the session."
    ],
    "bulletPoints": [
      "Be a fan of the PCs",
      "Address characters, not players",
      "Play to find out what happens next",
      "Golden Rule: Prioritize fun and story flow"
    ],
    "quickTips": [
      "Fail forward: Always keep the narrative moving even when rolls fail."
    ]
  },
  {
    "id": "resolving-actions",
    "category": "GM Core",
    "title": "Resolving Actions & Rolls",
    "anchorId": "resolving-actions",
    "anchorUrl": "https://callmepartario.github.io/og-dhsrd/#resolving-actions",
    "summary": "How to determine when to ask for a roll, interpreting Hope vs. Fear, and critical successes.",
    "details": [
      "When to Roll: Ask for an Action Roll only when there is uncertainty, meaningful risk, or time pressure.",
      "Success with Hope: The PC achieves their goal and gains 1 Hope (or clears 1 Stress).",
      "Success with Fear: The PC achieves their goal, but the GM gains 1 Fear or introduces a minor complication.",
      "Failure with Hope: The PC fails their goal, but gains 1 Hope and the GM makes a Soft Move.",
      "Failure with Fear: The PC fails, the GM gains 1 Fear (or spends 1 Fear), and the GM makes a Hard Move.",
      "Critical Success: Both Duality Dice match. The PC achieves their goal with dramatic bonus effects and clears 1 Stress or gains 1 Hope."
    ],
    "bulletPoints": [
      "Success + Hope = Full success + 1 Hope/Clear Stress",
      "Success + Fear = Full success + 1 GM Fear/Minor Complication",
      "Failure + Hope = Failure + 1 Hope + GM Soft Move",
      "Failure + Fear = Failure + 1 GM Fear + GM Hard Move",
      "Critical = Matching Duality Dice (Instant Critical Impact)"
    ],
    "quickTips": [
      "If an action carries no consequence or time pressure, let the PC succeed automatically without rolling."
    ]
  },
  {
    "id": "difficulty-benchmarks",
    "category": "GM Core",
    "title": "Difficulty Benchmarks (Target DCs)",
    "anchorId": "difficulty-benchmarks",
    "anchorUrl": "https://callmepartario.github.io/og-dhsrd/#difficulty-benchmarks",
    "summary": "Target Difficulty standards for Action Rolls across tiers.",
    "details": [
      "Very Easy (DC 5–8): Simple tasks performed under light stress.",
      "Easy (DC 10–12): Standard adventuring tasks for trained heroes.",
      "Medium (DC 13–15): Challenging feats requiring effort or domain knowledge.",
      "Hard (DC 16–18): Heroic actions pushing physical or magical limits.",
      "Very Hard (DC 19–22): Exceptional legendary feats bordering on miraculous.",
      "Tier Escalation: Increase difficulty benchmarks by +2 or +3 when facing higher-tier environments or adversaries."
    ],
    "bulletPoints": [
      "DC 10 = Easy / Standard",
      "DC 13–15 = Medium / Challenging",
      "DC 18 = Hard / Heroic",
      "DC 20+ = Very Hard / Legendary"
    ],
    "quickTips": [
      "Announce the Target Difficulty before the player rolls to heighten tension!"
    ]
  },
  {
    "id": "fear",
    "category": "Moves & Fear",
    "title": "The Fear Economy & GM Fear Pool",
    "anchorId": "fear",
    "anchorUrl": "https://callmepartario.github.io/og-dhsrd/#fear",
    "summary": "Earning, spending, and managing the GM Fear pool during gameplay.",
    "details": [
      "Earning Fear: Gain 1 Fear whenever a player rolls with Fear on an Action Roll, or when narrative events warrant it.",
      "Fear Cap: The GM Fear pool holds up to 6 Fear (or up to 10 Fear during climax campaign boss encounters).",
      "Spending Fear (1 Fear per effect):",
      "• Interrupt Player Turn: Take an immediate GM Move out of player sequence.",
      "• Trigger Special Feature: Activate an adversary or environment ability that costs Fear.",
      "• Add Action Token: Grant adversaries additional actions during combat turn sequence.",
      "• Overwhelm Complication: Inflict sudden narrative disasters or environment collapses."
    ],
    "bulletPoints": [
      "Gain Fear on player rolls with Fear",
      "Max Fear Pool = 6 (10 in Climax Battles)",
      "Spend 1 Fear = Interrupt turn, trigger special, add action token",
      "Fear fuels high-stakes adversary powers"
    ],
    "quickTips": [
      "Spend Fear visibly to signal dangerous incoming moves to your players!"
    ]
  },
  {
    "id": "gm-moves",
    "category": "Moves & Fear",
    "title": "GM Moves (Soft Moves vs. Hard Moves)",
    "anchorId": "gm-moves",
    "anchorUrl": "https://callmepartario.github.io/og-dhsrd/#gm-moves",
    "summary": "Types of GM Moves and when to unleash them against the party.",
    "details": [
      "Soft Moves: Telegraph impending danger, ask evocative questions, or change the environment state. Use Soft Moves when players look to you, or on Failure with Hope.",
      "Hard Moves: Deal immediate direct damage, mark HP/Stress, break equipment, separate party members, or fulfill telegraphed threats. Use Hard Moves on Failure with Fear, or when players ignore direct warnings.",
      "Examples of GM Moves:",
      "• Deal Damage / Mark Stress",
      "• Separate the Party / Isolate a Hero",
      "• Present a New Threat or Reinforcements",
      "• Consume Resources or Damage Gear",
      "• Offer a Costly Choice"
    ],
    "bulletPoints": [
      "Soft Move = Telegraph threat, set up danger, ask \"What do you do?\"",
      "Hard Move = Direct consequence, instant damage, resource loss",
      "Always match move intensity to the drama of the scene"
    ],
    "quickTips": [
      "Telegraph danger with a Soft Move first; if ignored, punish with a Hard Move."
    ]
  },
  {
    "id": "pacing",
    "category": "Clocks & Story",
    "title": "Pacing, Spotlights & Countdown Clocks",
    "anchorId": "pacing",
    "anchorUrl": "https://callmepartario.github.io/og-dhsrd/#pacing",
    "summary": "Managing narrative momentum, passing the spotlight, and using countdown clocks.",
    "details": [
      "Passing the Spotlight: Move fluidly between players based on fiction logic rather than strict initiative turn order.",
      "Progress Clocks (4, 6, 8 segments): Track complex player goals like picking a complex vault or escaping a collapsing temple.",
      "Countdown / Danger Clocks: Track impending disasters. Fill segments on player failures or Fear rolls.",
      "When a Countdown Clock fills, the threat triggers immediately with catastrophic impact!"
    ],
    "bulletPoints": [
      "Spotlight follows fiction, not fixed turns",
      "4-Segment Clock = Urgent/short challenge",
      "6-Segment Clock = Standard obstacle",
      "8-Segment Clock = Epic quest or campaign goal"
    ],
    "quickTips": [
      "Keep clocks visible to players to build delicious suspense!"
    ]
  },
  {
    "id": "campaign-frames",
    "category": "Campaigns & Tools",
    "title": "Campaign Frames & World Building",
    "anchorId": "campaign-frames",
    "anchorUrl": "https://callmepartario.github.io/og-dhsrd/#campaign-frames",
    "summary": "Setting up campaign themes, party ties, session zero, and world pillars.",
    "details": [
      "Campaign Frames define the setting, central conflict, dominant factions, and tone of your adventure.",
      "Session Zero: Establish safety tools (Lines & Veils), party connections, shared campaign goals, and house rules.",
      "World Pillars: Define 3 to 5 core truths about magic, deities, technology, and ancient mysteries in your realm."
    ],
    "bulletPoints": [
      "Establish theme, tone, and safety tools in Session Zero",
      "Define 3–5 World Pillars for setting consistency",
      "Connect PC backstories directly to campaign factions"
    ],
    "quickTips": [
      "Involve players in building towns and NPCs to increase emotional investment."
    ]
  },
  {
    "id": "the-witherwild",
    "category": "Campaigns & Tools",
    "title": "Sample Setting: The Witherwild",
    "anchorId": "the-witherwild",
    "anchorUrl": "https://callmepartario.github.io/og-dhsrd/#the-witherwild",
    "summary": "Official sample campaign frame showcasing corrupted wilderness and ancient ruins.",
    "details": [
      "The Witherwild is an overgrown, encroaching magical forest twisted by wild corruption.",
      "Factions include ancient dryad guardians, desperate frontier settlements, and void-corrupted warlords.",
      "Use the Witherwild for sandbox exploration, relic hunting, and forest corruption hazards."
    ],
    "bulletPoints": [
      "Theme: Overgrown fantasy wilderness & ancient corruption",
      "Key Hazards: Poisonous spores, mutated beasts, shifting paths",
      "Inspiration for custom campaign settings"
    ]
  },
  {
    "id": "gm-tools",
    "category": "Campaigns & Tools",
    "title": "GM Tools & Reference Tables",
    "anchorId": "gm-tools",
    "anchorUrl": "https://callmepartario.github.io/og-dhsrd/#gm-tools",
    "summary": "Quick generator tools for improvising NPCs, loot, hazards, and room descriptors.",
    "details": [
      "NPC Generator: Combine a physical trait, a secret motive, and an immediate goal.",
      "Hazard Generator: Combine an environmental trigger, damage type, and escape DC.",
      "Loot & Rewards: Distribute Gold, SRD Consumables, Weapons, and Domain Cards appropriate for player Tiers."
    ],
    "bulletPoints": [
      "Quick NPC improviser: Trait + Motive + Goal",
      "Hazard builder: Trigger + Damage + Escape DC",
      "Tiered rewards and Domain Card loot tables"
    ]
  },
  {
    "id": "old-gus-combat-and-damage",
    "category": "GM Core",
    "title": "Old Gus' Combat & Damage Resolution",
    "anchorId": "old-gus-combat",
    "anchorUrl": "https://callmepartario.github.io/og-dhsrd/pdfs/old-gus-daggerheart-gm-screen.pdf",
    "summary": "Step-by-step resolution for attack rolls, damage thresholds, armor score mitigation, and stress overflow.",
    "details": [
      "Attack Roll: Duality Roll + Trait Mod vs Target Evasion. Success hits, Failure misses.",
      "Damage Calculation: Roll weapon or spell damage dice + Trait Mod.",
      "Armor Slot Mitigation: Before comparing to thresholds, spend 1 Armor Slot to subtract your Armor Score from total incoming damage.",
      "Damage Thresholds & HP Loss:",
      "• Damage < Minor Threshold = 0 HP marked (scratched).",
      "• Minor <= Damage < Major = Mark 1 HP.",
      "• Major <= Damage < Severe = Mark 2 HP.",
      "• Severe <= Damage = Mark 3 HP.",
      "Stress Overflow: When forced to mark Stress when all Stress slots are full, mark 1 HP for each excess Stress point."
    ],
    "bulletPoints": [
      "Duality Roll vs. Target Evasion",
      "Spend 1 Armor Slot = Reduce damage by Armor Score",
      "Minor = 1 HP | Major = 2 HP | Severe = 3 HP",
      "Full Stress overflow marks 1 HP per excess Stress"
    ],
    "quickTips": [
      "Players choose whether to spend Armor Slots before marking HP!"
    ]
  },
  {
    "id": "old-gus-death-and-scars",
    "category": "GM Core",
    "title": "Old Gus' Death, Dying & Scars",
    "anchorId": "old-gus-death",
    "anchorUrl": "https://callmepartario.github.io/og-dhsrd/pdfs/old-gus-daggerheart-gm-screen.pdf",
    "summary": "Mechanics for hero incapacitation, choosing a Death Move, gaining permanent Scars, or going out in a Blaze of Glory.",
    "details": [
      "When a character marks their final HP slot, they fall mortally wounded/unconscious and must immediately choose one of 3 Death Moves:",
      "1. Avoid Death (Gain a Scar): Clear all marked HP, permanently erase 1 Experience, and write a new Scar describing the physical or psychological trauma.",
      "2. Risk It All: Roll your Duality Dice with no modifiers. If Hope >= Fear, survive with 1 HP. If Fear > Hope, your hero dies instantly.",
      "3. Blaze of Glory: Take one final guaranteed legendary action with Critical Success effect, then heroically perish."
    ],
    "bulletPoints": [
      "Avoid Death = Clear HP, lose 1 Experience, gain 1 Scar",
      "Risk It All = Duality roll (Hope = Live with 1 HP, Fear = Die)",
      "Blaze of Glory = Final guaranteed Critical action, then death"
    ],
    "quickTips": [
      "Scars remain permanent story traits that shape future roleplay and character growth."
    ]
  },
  {
    "id": "old-gus-rest-and-downtime",
    "category": "GM Core",
    "title": "Old Gus' Short & Long Rest Moves",
    "anchorId": "old-gus-rest",
    "anchorUrl": "https://callmepartario.github.io/og-dhsrd/pdfs/old-gus-daggerheart-gm-screen.pdf",
    "summary": "Rules for short rests in dangerous areas and long rests in safe sanctuaries.",
    "details": [
      "Short Rest (~1 Hour in a safe spot): PCs choose any 2 Short Rest Moves:",
      "• Clear 1d4 Stress",
      "• Clear 1d4 HP (or heal 1d4 HP on an ally in Close range)",
      "• Repair 2 Armor Slots",
      "• Prepare (Gain +1 Hope)",
      "• Swap Domain Cards with your card vault",
      "Long Rest (~8 Hours in a secure sanctuary/inn):",
      "• Clear ALL Stress & ALL HP",
      "• Repair ALL Armor Slots",
      "• Swap any Domain Cards",
      "• Grant +1 bonus Hope to every party member"
    ],
    "bulletPoints": [
      "Short Rest: Choose 2 moves (Clear 1d4 HP, Clear 1d4 Stress, Repair 2 Armor, Prepare, Swap Cards)",
      "Long Rest: Fully restore HP, Stress & Armor + gain +1 Hope per player"
    ]
  },
  {
    "id": "old-gus-ranges-and-conditions",
    "category": "GM Core",
    "title": "Old Gus' Ranges & Conditions Reference",
    "anchorId": "old-gus-ranges",
    "anchorUrl": "https://callmepartario.github.io/og-dhsrd/pdfs/old-gus-daggerheart-gm-screen.pdf",
    "summary": "Standard distance ranges and combat status conditions quick reference.",
    "details": [
      "Distance Ranges:",
      "• Melee: Touch / 5 ft.",
      "• Very Close: 10–15 ft (a few strides).",
      "• Close: 15–30 ft (standard chamber).",
      "• Far: 30–60 ft (across a large hall).",
      "• Very Far: 60+ ft (as far as sight line allows).",
      "Combat Conditions:",
      "• Vulnerable: All attacks made against target have Advantage.",
      "• Restrained: Cannot move or take movement actions; Agility rolls have Disadvantage.",
      "• Dazed: Cannot gain or spend Hope until cured.",
      "• Hidden: Cannot be targeted by direct attacks; gain Advantage on next attack.",
      "• Poisoned: Mark 1 Stress at the start of each scene/turn until cured."
    ],
    "bulletPoints": [
      "Ranges: Melee (5ft) -> Very Close (15ft) -> Close (30ft) -> Far (60ft) -> Very Far (60ft+)",
      "Vulnerable = Attackers get Advantage",
      "Restrained = No movement & Disadvantage on Agility",
      "Dazed = No Hope gained or spent",
      "Hidden = Cannot be targeted & Advantage on next strike",
      "Poisoned = Mark 1 Stress per scene/turn"
    ]
  },
  {
    "id": "building-encounters",
    "category": "Encounters & Hazards",
    "title": "Building Encounters & Threat Budgets",
    "anchorId": "building-encounters",
    "anchorUrl": "https://callmepartario.github.io/og-dhsrd/#building-encounters",
    "summary": "Balancing adversary encounters against party tier and player headcount.",
    "details": [
      "Adversary Threat Budget:",
      "• Standard Adversary: 1 per PC (same Tier as party).",
      "• Minion Groups: 3 to 4 Minions = 1 Standard Adversary.",
      "• Leader / Elite: Counts as 2 Standard Adversaries with bonus action tokens.",
      "• Solo Boss: Counts as 3 to 5 Standard Adversaries (full party challenge).",
      "Combine Frontline Bruisers, Ranged Skirmishers, and Support Buffers to create tactical depth."
    ],
    "bulletPoints": [
      "1 PC = 1 Standard Adversary equivalent",
      "1 Solo Boss = Challenge for entire party",
      "Minions fall in 1 hit for heroic fantasy",
      "Use dynamic terrain & environment cards in battles"
    ],
    "quickTips": [
      "Never run plain static fights—always add an interactive environmental hazard or ticking clock!"
    ]
  },
  {
    "id": "environments",
    "category": "Encounters & Hazards",
    "title": "Environment Cards & Battle Hazards",
    "anchorId": "environments",
    "anchorUrl": "https://callmepartario.github.io/og-dhsrd/#environments",
    "summary": "Using environment cards, cover, terrain height, and interactive traps.",
    "details": [
      "Environment Cards represent battlefields (e.g., Burning Tavern, Crumbling Bridge, Haunted Crypt).",
      "Environment Features cost Fear or Action Tokens to trigger, forcing PCs to move, jump, or take cover.",
      "Cover Rules: Low Cover (+2 Evasion against ranged), Heavy Cover (+4 Evasion)."
    ],
    "bulletPoints": [
      "Environment cards give battlefields distinct actions & hazards",
      "Low Cover = +2 Evasion, Heavy Cover = +4 Evasion",
      "Interactive hazards reward creative player movement"
    ]
  },
  {
    "id": "rolltables-loot-and-items",
    "category": "Rolltables",
    "title": "Random Loot & Artifact Rolltables",
    "anchorId": "gm-tools",
    "anchorUrl": "https://callmepartario.github.io/og-dhsrd/#gm-tools",
    "summary": "Randomized 1d12 & 1d20 tables for Tier 1 minor loot pockets, Tier 2 major relics, and consumables.",
    "details": [
      "Use the interactive rolltable generator to quickly award gold, health elixirs, masterwork gear, and domain relics.",
      "Roll 1d12 during dungeon searches or after defeating enemy leaders."
    ],
    "bulletPoints": [
      "1d12 Minor Loot & Pocket Finds",
      "1d12 Major Treasures & Domain Relics",
      "Quick consumables and gold rewards"
    ],
    "quickTips": [
      "Use the 1-click Roll Table buttons in the GM Screen to generate instant loot results!"
    ]
  },
  {
    "id": "rolltables-npc-and-motives",
    "category": "Rolltables",
    "title": "NPC Trait & Secret Drive Rolltables",
    "anchorId": "gm-tools",
    "anchorUrl": "https://callmepartario.github.io/og-dhsrd/#gm-tools",
    "summary": "Randomized tables for instant NPC physical quirks, mannerisms, secret motives, and plot drives.",
    "details": [
      "Improvise memorable NPCs on the fly with distinct visual features (clockwork eyes, rune tattoos) and secret agenda."
    ],
    "bulletPoints": [
      "1d12 NPC Secret Motives & Drives",
      "1d12 NPC Physical Quirks & Heritage Traits",
      "Instant plot hooks for unexpected tavern encounters"
    ]
  },
  {
    "id": "rolltables-complications-and-hazards",
    "category": "Rolltables",
    "title": "Complications, Fear & Hazard Rolltables",
    "anchorId": "rolltables",
    "anchorUrl": "https://callmepartario.github.io/og-dhsrd/#gm-moves",
    "summary": "Random tables for Success with Fear complications, Hard Move consequences, and wilderness hazards.",
    "details": [
      "When players roll with Fear or fail crucial action rolls, consult these rolltables to unleash dynamic narrative complications."
    ],
    "bulletPoints": [
      "1d12 Success with Fear Complications",
      "1d12 Failure with Fear Hard Moves",
      "1d12 Wilderness & Dungeon Hazards"
    ]
  }
];
