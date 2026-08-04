export interface SubclassDefinition {
  id: string;
  name: string;
  classId: string;
  className: string;
  description: string;
  spellOrAttunement?: string;
  foundationFeature: {
    name: string;
    description: string;
  };
  specializationFeature?: {
    name: string;
    description: string;
  };
  masteryFeature?: {
    name: string;
    description: string;
  };
}

export const SUBCLASSES_DATA: SubclassDefinition[] = [
  // BARD SUBCLASSES
  {
    id: 'bard-troubadour',
    name: 'Troubadour',
    classId: 'bard',
    className: 'Bard',
    description:
      'Master of martial ballads and inspiring performances. Troubadours weave performance magic into the chaos of battle, soothing wounded companions and rallying their allies\' spirits.',
    foundationFeature: {
      name: 'Epic Ballad',
      description:
        'At the start of combat, choose a Battle Ballad. Spent Hope can be gifted to any ally in Far range or used to clear 1 Stress from an ally when you roll with Hope.',
    },
    specializationFeature: {
      name: 'Crescendo',
      description:
        'Spend 2 Hope to give all adjacent allies +2 to their next attack roll or damage roll.',
    },
    masteryFeature: {
      name: 'Legendary Performance',
      description:
        'Once per session, perform a masterpiece that restores 1 Hope to every party member and clears 2 Hit Points.',
    },
  },
  {
    id: 'bard-wordsmith',
    name: 'Wordsmith',
    classId: 'bard',
    className: 'Bard',
    description:
      'A cunning orator and master rhetorician who turns the power of language into a sharp weapon. Wordsmiths inspire allies with fiery rhetoric and disarm foes with biting wit.',
    foundationFeature: {
      name: 'Sharp Wit & Rhetoric',
      description:
        'When you or an ally within Far range makes a social check, spend 1 Hope to add your Presence modifier or grant Advantage.',
    },
    specializationFeature: {
      name: 'Biting Satire',
      description:
        'Target an adversary in Close range with taunting rhetoric. Mark 1 Stress to force them to focus their next attack on you, taking Dazed on a fail.',
    },
    masteryFeature: {
      name: 'Master Orator',
      description:
        'When rolling with Hope on Presence checks, grant all allies within Far range 1 Hope.',
    },
  },

  // DRUID SUBCLASSES
  {
    id: 'druid-warden-elements',
    name: 'Warden of the Elements',
    classId: 'druid',
    className: 'Druid',
    description:
      'Channels raw elemental forces—fire, ice, lightning, and stone—to smite foes and alter the battlefield environment.',
    foundationFeature: {
      name: 'Elemental Attunement',
      description:
        'Attune to Fire, Cold, Lightning, or Earth. Attacks deal attuned elemental damage type, and you gain resistance against that element.',
    },
    specializationFeature: {
      name: 'Primal Burst',
      description:
        'Spend 2 Hope to emit an elemental surge dealing 1d8 elemental damage to all enemies within Close range.',
    },
    masteryFeature: {
      name: 'Elemental Metamorphosis',
      description:
        'While in Beastform, automatically infuse all physical attacks with +1d8 elemental damage and gain flight or burrowing speed.',
    },
  },
  {
    id: 'druid-warden-renewal',
    name: 'Warden of Renewal',
    classId: 'druid',
    className: 'Druid',
    description:
      'A guardian of life and nature\'s regrowth. Wardens of Renewal bring vitality, healing remedies, and protective growth to their allies.',
    foundationFeature: {
      name: 'Nature\'s Gift',
      description:
        'When you cast a Sage domain spell or use Beastform, clear 1 Hit Point or 1 Stress from an ally within Close range.',
    },
    specializationFeature: {
      name: 'Verdant Sanctuary',
      description:
        'Spend 2 Hope to create a 15ft aura of lush growth. Allies standing inside clear 1 Stress at the start of their turn.',
    },
    masteryFeature: {
      name: 'Breath of Life',
      description:
        'Once per session, when an ally would mark their final Hit Point, interpose with nature magic to restore 3 HP instead.',
    },
  },

  // GUARDIAN SUBCLASSES
  {
    id: 'guardian-stalwart',
    name: 'Stalwart',
    classId: 'guardian',
    className: 'Guardian',
    description:
      'An unyielding shield for companions. Stalwarts rely on heavy armor absorption, impenetrable guard stances, and raw physical fortitude.',
    foundationFeature: {
      name: 'Unshakable Defender',
      description:
        'Gain +1 max Armor Slot. When an ally within Melee range takes physical damage, spend 1 Armor Slot to absorb all of that damage.',
    },
    specializationFeature: {
      name: 'Hold the Line',
      description:
        'Enemies cannot move past your space without succeeding on a Strength check against your Evasion.',
    },
    masteryFeature: {
      name: 'Indomitable Bastion',
      description:
        'Clear 1 Armor Slot whenever you roll with Hope in combat.',
    },
  },
  {
    id: 'guardian-vengeance',
    name: 'Vengeance',
    classId: 'guardian',
    className: 'Guardian',
    description:
      'A fierce combatant who channels fury and retribution into devastating counter-attacks whenever adversaries strike.',
    foundationFeature: {
      name: 'Retaliatory Strike',
      description:
        'When an adversary hits you with an attack, spend 1 Hope to make an immediate free counter-attack.',
    },
    specializationFeature: {
      name: 'Marked for Punishment',
      description:
        'When an enemy damages an ally, mark that enemy as Vengeance Target. Gain +1d6 extra damage against them.',
    },
    masteryFeature: {
      name: 'Furious Wrath',
      description:
        'Critical strikes against your Vengeance Target automatically deal severe threshold damage.',
    },
  },

  // RANGER SUBCLASSES
  {
    id: 'ranger-beastbound',
    name: 'Beastbound',
    classId: 'ranger',
    className: 'Ranger',
    description:
      'Formed an unbreakable spirit-bond with a loyal animal companion who hunts and defends alongside them.',
    foundationFeature: {
      name: 'Animal Companion',
      description:
        'Call a Beast Companion (Wolf, Hawk, Bear, Hound). Companion can move and make attack rolls using your Instinct stat.',
    },
    specializationFeature: {
      name: 'Tandem Strike',
      description:
        'When you attack a target adjacent to your Beast Companion, gain Advantage on the attack roll and deal +1d6 damage.',
    },
    masteryFeature: {
      name: 'Shared Soul',
      description:
        'When taking damage, you or your companion can split the marked Hit Points evenly between both of you.',
    },
  },
  {
    id: 'ranger-wayfinder',
    name: 'Wayfinder',
    classId: 'ranger',
    className: 'Ranger',
    description:
      'The master scout and apex hunter. Wayfinders read the wilderness like a book and stalk their prey with deadly precision.',
    foundationFeature: {
      name: 'Pathfinding & Stalking',
      description:
        'You and your party ignore natural difficult terrain. When attacking your marked Prey, ignore cover and gain +1d6 bonus damage.',
    },
    specializationFeature: {
      name: 'Ambush Master',
      description:
        'During surprise rounds or the first turn of combat, your attacks against Prey deal Major threshold damage on a hit.',
    },
    masteryFeature: {
      name: 'Apex Predator',
      description:
        'When you defeat a marked Prey, immediately regain 2 Hope and mark a new Prey for free.',
    },
  },

  // ROGUE SUBCLASSES
  {
    id: 'rogue-nightwalker',
    name: 'Nightwalker',
    classId: 'rogue',
    className: 'Rogue',
    description:
      'Wields shadow magic to slip through darkness, step through shadows, and strike from unexpected angles.',
    foundationFeature: {
      name: 'Shadow Stepper',
      description:
        'Spend 1 Hope or mark 1 Stress to teleport between shadows within Close range. Gain the Cloaked condition until your next action.',
    },
    specializationFeature: {
      name: 'Grasp of Shadows',
      description:
        'When attacking while Cloaked or Hidden, add +1d8 shadow damage and force the target to become Impaired.',
    },
    masteryFeature: {
      name: 'Shadow Veil',
      description:
        'When taking damage while Cloaked, spend 1 Hope to completely fade into shadows and negate the attack.',
    },
  },
  {
    id: 'rogue-syndicate',
    name: 'Syndicate',
    classId: 'rogue',
    className: 'Rogue',
    description:
      'A well-connected figure of the underworld who leverages crime networks, hidden informants, and streetwise tricks.',
    foundationFeature: {
      name: 'Well-Connected',
      description:
        'In any urban settlement, you automatically know a reliable underworld contact. Spend 1 Hope to secure secret supplies or intel.',
    },
    specializationFeature: {
      name: 'Underworld Favors',
      description:
        'Call in a favor during combat to spawn a temporary Syndicate Thug minion or distract an adversary.',
    },
    masteryFeature: {
      name: 'Mastermind Execution',
      description:
        'When an ally hits a target adjacent to you, add your Finesse modifier to their damage roll.',
    },
  },

  // SERAPH SUBCLASSES
  {
    id: 'seraph-divine-wielder',
    name: 'Divine Wielder',
    classId: 'seraph',
    className: 'Seraph',
    description:
      'Channels celestial power to manifest glowing weapons of radiant light and strike down dark adversaries.',
    foundationFeature: {
      name: 'Manifest Holy Weapon',
      description:
        'Summon a spirit weapon of holy light (Melee or Range). Deals 1d10+Presence radiant damage and glows in darkness.',
    },
    specializationFeature: {
      name: 'Smite the Evil',
      description:
        'Spend 2 Hope when hitting an adversary to deal +2d8 radiant damage and apply Vulnerable.',
    },
    masteryFeature: {
      name: 'Radiant Avatar',
      description:
        'Transform into a celestial avatar for 1 scene, gaining +2 Armor Score and dealing radiant damage to all adjacent foes.',
    },
  },
  {
    id: 'seraph-winged-sentinel',
    name: 'Winged Sentinel',
    classId: 'seraph',
    className: 'Seraph',
    description:
      'Sprouts ethereal wings of luminous energy, diving across battlefields to shield allies and strike from above.',
    foundationFeature: {
      name: 'Celestial Wings',
      description:
        'Manifest wings at will for flight speed. Spend 1 Hope to swoop to an ally in Far range and interpose for an attack.',
    },
    specializationFeature: {
      name: 'Aegis Dive',
      description:
        'Swoop down on a target from above. Add +1d8 impact damage and knock the target Dazed.',
    },
    masteryFeature: {
      name: 'Seraphic Guardian',
      description:
        'Project a wing barrier around all nearby allies, increasing their Armor Scores by +3 until your next turn.',
    },
  },

  // SORCERER SUBCLASSES
  {
    id: 'sorcerer-elemental-origin',
    name: 'Elemental Origin',
    classId: 'sorcerer',
    className: 'Sorcerer',
    description:
      'Born from a surge of elemental chaotic energy, wielding wild surges of elemental fire, storm, and ice.',
    foundationFeature: {
      name: 'Elemental Blast',
      description:
        'When casting an Arcana or Midnight spell, choose Fire, Lightning, or Ice. Adds +1d6 elemental damage and elemental status effect.',
    },
    specializationFeature: {
      name: 'Primal Overload',
      description:
        'Spend 2 Hope to overload your spell, doubling its target area and knocking targets Restrained.',
    },
    masteryFeature: {
      name: 'Elemental Incarnation',
      description:
        'Gain immunity to your primary chosen element and regain 1 Hope whenever hit by elemental attacks.',
    },
  },
  {
    id: 'sorcerer-primal-origin',
    name: 'Primal Origin',
    classId: 'sorcerer',
    className: 'Sorcerer',
    description:
      'Taps into the raw, unstructured magic that weaves through creation, altering spells dynamically.',
    foundationFeature: {
      name: 'Spell Alteration',
      description:
        'When casting any spell, spend 1 Hope to modify its target range, damage type, or spend extra Hope to remove Stress.',
    },
    specializationFeature: {
      name: 'Chaos Surge',
      description:
        'When you roll a Critical with Hope on spell rolls, trigger a free secondary spell cast without paying Hope.',
    },
    masteryFeature: {
      name: 'Arcane Unbinding',
      description:
        'Once per scene, completely negate a spell cast by an adversary within Far range.',
    },
  },

  // WARRIOR SUBCLASSES
  {
    id: 'warrior-call-brave',
    name: 'Call of the Brave',
    classId: 'warrior',
    className: 'Warrior',
    description:
      'A courageous leader whose brave battle cries rally companions and convert dangerous combat situations into triumphs.',
    foundationFeature: {
      name: 'Rise to the Challenge',
      description:
        'Gain +1 Hope whenever an adversary dealing Major or Severe damage strikes you or an ally.',
    },
    specializationFeature: {
      name: 'Camaraderie Tag-Team',
      description:
        'Spend 1 Hope to initiate a Tag-Team strike with an ally. Both make attack rolls and use the highest result.',
    },
    masteryFeature: {
      name: 'Courageous Banner',
      description:
        'Rally all allies in Far range. Clear 1 Stress from everyone and grant Advantage on all attack checks for 1 round.',
    },
  },
  {
    id: 'warrior-call-slayer',
    name: 'Call of the Slayer',
    classId: 'warrior',
    className: 'Warrior',
    description:
      'A deadly weapon specialist who wields Slayer Dice to deliver brutal executioner strikes against single targets.',
    foundationFeature: {
      name: 'Slayer Dice',
      description:
        'Gain a pool of Slayer Dice (d6s). Add Slayer Dice to weapon damage rolls or attack checks against wounded targets.',
    },
    specializationFeature: {
      name: 'Lethal Precision',
      description:
        'When you score a hit with a Slayer Die, score an automatic Critical strike on rolls of 10+.',
    },
    masteryFeature: {
      name: 'Martial Execution',
      description:
        'When you reduce an adversary to 0 HP, grant all allies 1 Slayer Die for their next attack.',
    },
  },

  // WIZARD SUBCLASSES
  {
    id: 'wizard-school-knowledge',
    name: 'School of Knowledge',
    classId: 'wizard',
    className: 'Wizard',
    description:
      'A scholar of ancient lore, spellbook mastery, tactical analysis, and non-violent arcana resolution.',
    foundationFeature: {
      name: 'Tactical Analysis',
      description:
        'Spend 1 Hope to analyze an adversary\'s stats. Reveal their Evasion, Armor, and vulnerabilities, granting allies +2 on attacks against them.',
    },
    specializationFeature: {
      name: 'Arcane Memory',
      description:
        'Cast Codex domain spells directly from your vault without preparing them into active slots.',
    },
    masteryFeature: {
      name: 'Grand Polymath',
      description:
        'Gain +2 to all Knowledge checks and automatically succeed on deciphering magical runes and ancient scripts.',
    },
  },
  {
    id: 'wizard-school-war',
    name: 'School of War',
    classId: 'wizard',
    className: 'Wizard',
    description:
      'A battlemage trained in combat evocation, spell shielding, and casting deadly offensive spells in the thick of battle.',
    foundationFeature: {
      name: 'War Magic Readiness',
      description:
        'Gain +1 Armor Rating. Casting spells in Melee range does not provoke attacks of opportunity.',
    },
    specializationFeature: {
      name: 'Arcane Shielding',
      description:
        'When hit by an attack, spend 1 Hope to absorb incoming damage with a magical shield equal to your Knowledge stat.',
    },
    masteryFeature: {
      name: 'Evocation Devastation',
      description:
        'Offensive spells deal +1d10 extra damage and bypass 2 points of target Armor.',
    },
  },
];

export function getSubclassesForClass(className: string): SubclassDefinition[] {
  const norm = className.trim().toLowerCase();
  return SUBCLASSES_DATA.filter(
    (sub) => sub.className.toLowerCase() === norm || sub.classId.toLowerCase() === norm
  );
}

export function getSubclassByName(subclassName: string): SubclassDefinition | undefined {
  const norm = subclassName.trim().toLowerCase();
  return SUBCLASSES_DATA.find((sub) => sub.name.toLowerCase() === norm);
}
