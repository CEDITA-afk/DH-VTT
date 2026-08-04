import fs from 'fs';
import path from 'path';

async function generateGmHelpData() {
  console.log('Fetching SRD page from https://callmepartario.github.io/og-dhsrd/ ...');
  const res = await fetch('https://callmepartario.github.io/og-dhsrd/');
  if (!res.ok) {
    throw new Error(`Failed to fetch SRD page: ${res.statusText}`);
  }
  const html = await res.text();

  const sections = [
    {
      id: 'gm-guidance',
      category: 'GM Core',
      title: 'Running an Adventure & Principles',
      anchorId: 'gm-guidance',
      anchorUrl: 'https://callmepartario.github.io/og-dhsrd/#gm-guidance',
      summary: 'Foundational guidelines for framing scenes, passing spotlight, and applying the Golden Rule.',
      details: [
        'Be a Fan of the Characters: Highlight heroic successes and turn failures into dramatically exciting complications.',
        'Address the Characters, Not the Players: Speak directly to the heroes in-world to maintain immersion.',
        'Play to Find Out: Never force a rigid plot outcome. Allow player choices and dice rolls to shape the world.',
        'The Golden Rule: When a rule is ambiguous, make a fair ruling that favors drama, then check the exact wording after the session.',
      ],
      bulletPoints: [
        'Be a fan of the PCs',
        'Address characters, not players',
        'Play to find out what happens next',
        'Golden Rule: Prioritize fun and story flow',
      ],
      quickTips: [
        'Fail forward: Always keep the narrative moving even when rolls fail.',
      ],
    },
    {
      id: 'resolving-actions',
      category: 'GM Core',
      title: 'Resolving Actions & Rolls',
      anchorId: 'resolving-actions',
      anchorUrl: 'https://callmepartario.github.io/og-dhsrd/#resolving-actions',
      summary: 'How to determine when to ask for a roll, interpreting Hope vs. Fear, and critical successes.',
      details: [
        'When to Roll: Ask for an Action Roll only when there is uncertainty, meaningful risk, or time pressure.',
        'Success with Hope: The PC achieves their goal and gains 1 Hope (or clears 1 Stress).',
        'Success with Fear: The PC achieves their goal, but the GM gains 1 Fear or introduces a minor complication.',
        'Failure with Hope: The PC fails their goal, but gains 1 Hope and the GM makes a Soft Move.',
        'Failure with Fear: The PC fails, the GM gains 1 Fear (or spends 1 Fear), and the GM makes a Hard Move.',
        'Critical Success: Both Duality Dice match. The PC achieves their goal with dramatic bonus effects and clears 1 Stress or gains 1 Hope.',
      ],
      bulletPoints: [
        'Success + Hope = Full success + 1 Hope/Clear Stress',
        'Success + Fear = Full success + 1 GM Fear/Minor Complication',
        'Failure + Hope = Failure + 1 Hope + GM Soft Move',
        'Failure + Fear = Failure + 1 GM Fear + GM Hard Move',
        'Critical = Matching Duality Dice (Instant Critical Impact)',
      ],
      quickTips: [
        'If an action carries no consequence or time pressure, let the PC succeed automatically without rolling.',
      ],
    },
    {
      id: 'difficulty-benchmarks',
      category: 'GM Core',
      title: 'Difficulty Benchmarks (Target DCs)',
      anchorId: 'difficulty-benchmarks',
      anchorUrl: 'https://callmepartario.github.io/og-dhsrd/#difficulty-benchmarks',
      summary: 'Target Difficulty standards for Action Rolls across tiers.',
      details: [
        'Very Easy (DC 5–8): Simple tasks performed under light stress.',
        'Easy (DC 10–12): Standard adventuring tasks for trained heroes.',
        'Medium (DC 13–15): Challenging feats requiring effort or domain knowledge.',
        'Hard (DC 16–18): Heroic actions pushing physical or magical limits.',
        'Very Hard (DC 19–22): Exceptional legendary feats bordering on miraculous.',
        'Tier Escalation: Increase difficulty benchmarks by +2 or +3 when facing higher-tier environments or adversaries.',
      ],
      bulletPoints: [
        'DC 10 = Easy / Standard',
        'DC 13–15 = Medium / Challenging',
        'DC 18 = Hard / Heroic',
        'DC 20+ = Very Hard / Legendary',
      ],
      quickTips: [
        'Announce the Target Difficulty before the player rolls to heighten tension!',
      ],
    },
    {
      id: 'fear',
      category: 'Moves & Fear',
      title: 'The Fear Economy & GM Fear Pool',
      anchorId: 'fear',
      anchorUrl: 'https://callmepartario.github.io/og-dhsrd/#fear',
      summary: 'Earning, spending, and managing the GM Fear pool during gameplay.',
      details: [
        'Earning Fear: Gain 1 Fear whenever a player rolls with Fear on an Action Roll, or when narrative events warrant it.',
        'Fear Cap: The GM Fear pool holds up to 6 Fear (or up to 10 Fear during climax campaign boss encounters).',
        'Spending Fear (1 Fear per effect):',
        '• Interrupt Player Turn: Take an immediate GM Move out of player sequence.',
        '• Trigger Special Feature: Activate an adversary or environment ability that costs Fear.',
        '• Add Action Token: Grant adversaries additional actions during combat turn sequence.',
        '• Overwhelm Complication: Inflict sudden narrative disasters or environment collapses.',
      ],
      bulletPoints: [
        'Gain Fear on player rolls with Fear',
        'Max Fear Pool = 6 (10 in Climax Battles)',
        'Spend 1 Fear = Interrupt turn, trigger special, add action token',
        'Fear fuels high-stakes adversary powers',
      ],
      quickTips: [
        'Spend Fear visibly to signal dangerous incoming moves to your players!',
      ],
    },
    {
      id: 'gm-moves',
      category: 'Moves & Fear',
      title: 'GM Moves (Soft Moves vs. Hard Moves)',
      anchorId: 'gm-moves',
      anchorUrl: 'https://callmepartario.github.io/og-dhsrd/#gm-moves',
      summary: 'Types of GM Moves and when to unleash them against the party.',
      details: [
        'Soft Moves: Telegraph impending danger, ask evocative questions, or change the environment state. Use Soft Moves when players look to you, or on Failure with Hope.',
        'Hard Moves: Deal immediate direct damage, mark HP/Stress, break equipment, separate party members, or fulfill telegraphed threats. Use Hard Moves on Failure with Fear, or when players ignore direct warnings.',
        'Examples of GM Moves:',
        '• Deal Damage / Mark Stress',
        '• Separate the Party / Isolate a Hero',
        '• Present a New Threat or Reinforcements',
        '• Consume Resources or Damage Gear',
        '• Offer a Costly Choice',
      ],
      bulletPoints: [
        'Soft Move = Telegraph threat, set up danger, ask "What do you do?"',
        'Hard Move = Direct consequence, instant damage, resource loss',
        'Always match move intensity to the drama of the scene',
      ],
      quickTips: [
        'Telegraph danger with a Soft Move first; if ignored, punish with a Hard Move.',
      ],
    },
    {
      id: 'pacing',
      category: 'Clocks & Story',
      title: 'Pacing, Spotlights & Countdown Clocks',
      anchorId: 'pacing',
      anchorUrl: 'https://callmepartario.github.io/og-dhsrd/#pacing',
      summary: 'Managing narrative momentum, passing the spotlight, and using countdown clocks.',
      details: [
        'Passing the Spotlight: Move fluidly between players based on fiction logic rather than strict initiative turn order.',
        'Progress Clocks (4, 6, 8 segments): Track complex player goals like picking a complex vault or escaping a collapsing temple.',
        'Countdown / Danger Clocks: Track impending disasters. Fill segments on player failures or Fear rolls.',
        'When a Countdown Clock fills, the threat triggers immediately with catastrophic impact!',
      ],
      bulletPoints: [
        'Spotlight follows fiction, not fixed turns',
        '4-Segment Clock = Urgent/short challenge',
        '6-Segment Clock = Standard obstacle',
        '8-Segment Clock = Epic quest or campaign goal',
      ],
      quickTips: [
        'Keep clocks visible to players to build delicious suspense!',
      ],
    },
    {
      id: 'campaign-frames',
      category: 'Campaigns & Tools',
      title: 'Campaign Frames & World Building',
      anchorId: 'campaign-frames',
      anchorUrl: 'https://callmepartario.github.io/og-dhsrd/#campaign-frames',
      summary: 'Setting up campaign themes, party ties, session zero, and world pillars.',
      details: [
        'Campaign Frames define the setting, central conflict, dominant factions, and tone of your adventure.',
        'Session Zero: Establish safety tools (Lines & Veils), party connections, shared campaign goals, and house rules.',
        'World Pillars: Define 3 to 5 core truths about magic, deities, technology, and ancient mysteries in your realm.',
      ],
      bulletPoints: [
        'Establish theme, tone, and safety tools in Session Zero',
        'Define 3–5 World Pillars for setting consistency',
        'Connect PC backstories directly to campaign factions',
      ],
      quickTips: [
        'Involve players in building towns and NPCs to increase emotional investment.',
      ],
    },
    {
      id: 'the-witherwild',
      category: 'Campaigns & Tools',
      title: 'Sample Setting: The Witherwild',
      anchorId: 'the-witherwild',
      anchorUrl: 'https://callmepartario.github.io/og-dhsrd/#the-witherwild',
      summary: 'Official sample campaign frame showcasing corrupted wilderness and ancient ruins.',
      details: [
        'The Witherwild is an overgrown, encroaching magical forest twisted by wild corruption.',
        'Factions include ancient dryad guardians, desperate frontier settlements, and void-corrupted warlords.',
        'Use the Witherwild for sandbox exploration, relic hunting, and forest corruption hazards.',
      ],
      bulletPoints: [
        'Theme: Overgrown fantasy wilderness & ancient corruption',
        'Key Hazards: Poisonous spores, mutated beasts, shifting paths',
        'Inspiration for custom campaign settings',
      ],
    },
    {
      id: 'gm-tools',
      category: 'Campaigns & Tools',
      title: 'GM Tools & Reference Tables',
      anchorId: 'gm-tools',
      anchorUrl: 'https://callmepartario.github.io/og-dhsrd/#gm-tools',
      summary: 'Quick generator tools for improvising NPCs, loot, hazards, and room descriptors.',
      details: [
        'NPC Generator: Combine a physical trait, a secret motive, and an immediate goal.',
        'Hazard Generator: Combine an environmental trigger, damage type, and escape DC.',
        'Loot & Rewards: Distribute Gold, SRD Consumables, Weapons, and Domain Cards appropriate for player Tiers.',
      ],
      bulletPoints: [
        'Quick NPC improviser: Trait + Motive + Goal',
        'Hazard builder: Trigger + Damage + Escape DC',
        'Tiered rewards and Domain Card loot tables',
      ],
    },
    {
      id: 'building-encounters',
      category: 'Encounters & Hazards',
      title: 'Building Encounters & Threat Budgets',
      anchorId: 'building-encounters',
      anchorUrl: 'https://callmepartario.github.io/og-dhsrd/#building-encounters',
      summary: 'Balancing adversary encounters against party tier and player headcount.',
      details: [
        'Adversary Threat Budget:',
        '• Standard Adversary: 1 per PC (same Tier as party).',
        '• Minion Groups: 3 to 4 Minions = 1 Standard Adversary.',
        '• Leader / Elite: Counts as 2 Standard Adversaries with bonus action tokens.',
        '• Solo Boss: Counts as 3 to 5 Standard Adversaries (full party challenge).',
        'Combine Frontline Bruisers, Ranged Skirmishers, and Support Buffers to create tactical depth.',
      ],
      bulletPoints: [
        '1 PC = 1 Standard Adversary equivalent',
        '1 Solo Boss = Challenge for entire party',
        'Minions fall in 1 hit for heroic fantasy',
        'Use dynamic terrain & environment cards in battles',
      ],
      quickTips: [
        'Never run plain static fights—always add an interactive environmental hazard or ticking clock!',
      ],
    },
    {
      id: 'environments',
      category: 'Encounters & Hazards',
      title: 'Environment Cards & Battle Hazards',
      anchorId: 'environments',
      anchorUrl: 'https://callmepartario.github.io/og-dhsrd/#environments',
      summary: 'Using environment cards, cover, terrain height, and interactive traps.',
      details: [
        'Environment Cards represent battlefields (e.g., Burning Tavern, Crumbling Bridge, Haunted Crypt).',
        'Environment Features cost Fear or Action Tokens to trigger, forcing PCs to move, jump, or take cover.',
        'Cover Rules: Low Cover (+2 Evasion against ranged), Heavy Cover (+4 Evasion).',
      ],
      bulletPoints: [
        'Environment cards give battlefields distinct actions & hazards',
        'Low Cover = +2 Evasion, Heavy Cover = +4 Evasion',
        'Interactive hazards reward creative player movement',
      ],
    },
  ];

  const fileContent = `export interface GmGuideSection {
  id: string;
  category: 'GM Core' | 'Moves & Fear' | 'Encounters & Hazards' | 'Clocks & Story' | 'Campaigns & Tools' | 'SRD Reference';
  title: string;
  anchorId: string;
  anchorUrl: string;
  summary: string;
  details: string[];
  bulletPoints: string[];
  quickTips?: string[];
}

export const GM_HELP_DATA: GmGuideSection[] = ${JSON.stringify(sections, null, 2)};
`;

  const outputPath = path.resolve('src/data/gmHelpData.ts');
  fs.writeFileSync(outputPath, fileContent, 'utf-8');
  console.log(`Successfully written ${sections.length} GM Help sections with OG-DHSRD hyperlinks to ${outputPath}`);
}

generateGmHelpData().catch((err) => {
  console.error('Error building GM help:', err);
  process.exit(1);
});
