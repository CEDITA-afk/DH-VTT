import { DomainCard, ClassDefinition, AncestryDefinition, CommunityDefinition } from '../types';
import { DOMAIN_CARDS_DATA } from './domainCardsData';

export { DOMAIN_CARDS_DATA };

export const CLASSES_DATA: ClassDefinition[] = [
  {
    id: 'bard',
    name: 'Bard',
    domains: ['Grace', 'Codex'],
    classFeature: {
      name: 'Rally',
      description: 'Spend 1 Hope to give an ally within Far range Advantage on their next roll or clear 1 Stress.',
    },
    hopeFeature: {
      name: 'Words of Encouragement',
      description: 'When you make a roll with Hope, you may transfer 1 Hope to a party member.',
    },
    evasionBase: 10,
    subclasses: ['Troubadour', 'Wordsmith'],
  },
  {
    id: 'druid',
    name: 'Druid',
    domains: ['Sage', 'Arcana'],
    classFeature: {
      name: 'Beastform',
      description: 'Spend 1 Hope to transform into a wild beast. Gain temporary beast stats, natural weapons, and specialized movement.',
    },
    hopeFeature: {
      name: 'Nature Synergy',
      description: 'When you roll with Hope, heal 1 Hit Point or clear 1 Stress on yourself or an adjacent wild creature.',
    },
    evasionBase: 10,
    subclasses: ['Warden of the Elements', 'Warden of Renewal'],
  },
  {
    id: 'guardian',
    name: 'Guardian',
    domains: ['Valor', 'Blade'],
    classFeature: {
      name: 'Unstoppable Shield',
      description: 'Spend 1 Hope to mark an enemy in Melee range; when they attack an ally, you may interpose and take the damage instead.',
    },
    hopeFeature: {
      name: 'Vanguard Spirit',
      description: 'When you succeed on a roll with Hope, clear 1 Armor Slot or gain +2 Armor Score until your next turn.',
    },
    evasionBase: 9,
    subclasses: ['Stalwart', 'Vengeance'],
  },
  {
    id: 'ranger',
    name: 'Ranger',
    domains: ['Bone', 'Sage'],
    classFeature: {
      name: 'Hunter Marks',
      description: 'Mark a target in sight as your Prey. Gain +1d6 damage and Advantage on tracking checks against your Prey.',
    },
    hopeFeature: {
      name: 'Keen Sight',
      description: 'When rolling with Hope on an attack check, ignore target cover and physical concealment.',
    },
    evasionBase: 11,
    subclasses: ['Beastbound', 'Wayfinder'],
  },
  {
    id: 'rogue',
    name: 'Rogue',
    domains: ['Midnight', 'Grace'],
    classFeature: {
      name: 'Sneak Attack',
      description: 'Deal +1d6 extra damage when attacking from Hidden or when an ally is adjacent to your target.',
    },
    hopeFeature: {
      name: 'Shadow Slip',
      description: 'When rolling with Hope on Agility, become Hidden immediately without taking an action.',
    },
    evasionBase: 12,
    subclasses: ['Nightwalker', 'Syndicate'],
  },
  {
    id: 'seraph',
    name: 'Seraph',
    domains: ['Splendor', 'Valor'],
    classFeature: {
      name: 'Prayer Spheres',
      description: 'Allocate Prayer Dice to heal allies, generate protective wards, or smite undead and dark creatures.',
    },
    hopeFeature: {
      name: 'Divine Flare',
      description: 'When rolling with Hope, emit a radiant burst that blinds or dazes adjacent adversaries.',
    },
    evasionBase: 9,
    subclasses: ['Divine Wielder', 'Winged Sentinel'],
  },
  {
    id: 'sorcerer',
    name: 'Sorcerer',
    domains: ['Arcana', 'Midnight'],
    classFeature: {
      name: 'Metamagic Surge',
      description: 'Spend 1 Hope to double spell range, target an additional enemy, or convert spell damage type.',
    },
    hopeFeature: {
      name: 'Arcane Overflow',
      description: 'When you roll with Hope on a spell roll, regain 1 spent Hope or clear 1 Stress.',
    },
    evasionBase: 10,
    subclasses: ['Elemental Origin', 'Primal Origin'],
  },
  {
    id: 'warrior',
    name: 'Warrior',
    domains: ['Blade', 'Bone'],
    classFeature: {
      name: 'Battle Stance',
      description: 'Choose Aggressive Stance (+2 damage) or Defensive Stance (+2 Evasion) at the start of your turn.',
    },
    hopeFeature: {
      name: 'Relentless Strike',
      description: 'When you roll with Hope on a weapon strike, make an extra free melee strike against a nearby enemy.',
    },
    evasionBase: 10,
    subclasses: ['Call of the Brave', 'Call of the Slayer'],
  },
  {
    id: 'wizard',
    name: 'Wizard',
    domains: ['Codex', 'Splendor'],
    classFeature: {
      name: 'Spellbook Focus',
      description: 'Prepare domain spells into your active vault. Cast prepared spells using Presence or Knowledge.',
    },
    hopeFeature: {
      name: 'Flash of Insight',
      description: 'When rolling with Hope on Knowledge, instantly recall a spell from your vault into hand.',
    },
    evasionBase: 10,
    subclasses: ['School of Knowledge', 'School of War'],
  },
];

export const ANCESTRIES_DATA: AncestryDefinition[] = [
  {
    id: 'clank',
    name: 'Clank',
    featureName: 'Purpose Built',
    description: 'Gain a +1 bonus to an Experience that aligns with your purpose. During a short rest, you can choose a long rest move instead.',
  },
  {
    id: 'drakona',
    name: 'Drakona',
    featureName: 'Elemental Breath & Scales',
    description: 'Exhale elemental breath using Instinct in Close range. Mark 1 Stress as a reaction to reduce severe physical or elemental damage.',
  },
  {
    id: 'dwarf',
    name: 'Dwarf',
    featureName: 'Stout Fortitude',
    description: 'Gain +1 max Stress slot. When taking physical damage, mark 1 Stress to reduce incoming damage by 3.',
  },
  {
    id: 'elf',
    name: 'Elf',
    featureName: 'Celestial Trance',
    description: 'Spend 1 Hope to reroll any Agility or Finesse check or regain Focus during combat rests.',
  },
  {
    id: 'faerie',
    name: 'Faerie',
    featureName: 'Wings & Luckbender',
    description: 'Hover and fly short distances with membranous wings. Spend 1 Hope to force an adversary within Far range to reroll an attack die.',
  },
  {
    id: 'faun',
    name: 'Faun',
    featureName: 'Caprine Leap & Headbutt',
    description: 'Leap across wide gaps and high ledges without checks. Deliver a headbutt dealing +1d6 impact damage.',
  },
  {
    id: 'firbolg',
    name: 'Firbolg',
    featureName: 'Nature Speech',
    description: 'Communicate with natural flora and fauna. Spend 1 Hope to temporarily expand your physical size to absorb incoming strikes.',
  },
  {
    id: 'fungril',
    name: 'Fungril',
    featureName: 'Fungril Network & Death Connection',
    description: 'Telepathically communicate with other Fungril across any distance. Touch a corpse to extract its most recent memories.',
  },
  {
    id: 'galapa',
    name: 'Galapa',
    featureName: 'Shell Retreat',
    description: 'Retract into your armored shell as a reaction, gaining +4 Armor Score until your next turn.',
  },
  {
    id: 'giant',
    name: 'Giant',
    featureName: 'Colossal Might',
    description: 'Gain +2 to Strength checks and wield massive two-handed weapons without movement penalty.',
  },
  {
    id: 'goblin',
    name: 'Goblin',
    featureName: 'Nimble Scurry',
    description: 'Do not provoke opportunity attacks when moving through enemy spaces, and gain Advantage on hiding in small spaces.',
  },
  {
    id: 'halfling',
    name: 'Halfling',
    featureName: 'Lucky Spirit',
    description: 'When you roll a failure on a Duality check, spend 1 Hope to force a complete reroll.',
  },
  {
    id: 'human',
    name: 'Human',
    featureName: 'Resourceful & Versatile',
    description: 'Gain +1 bonus Hope at the start of every session and choose an extra skill proficiency from any class.',
  },
  {
    id: 'katari',
    name: 'Katari',
    featureName: 'Feline Reflexes',
    description: 'Always land on your feet. Ignore falling damage under 30 feet and gain +1 Evasion.',
  },
  {
    id: 'orc',
    name: 'Orc',
    featureName: 'Ferocious Resolve',
    description: 'When reduced to 0 HP or hit with severe damage, mark 2 Stress instead of falling unconscious.',
  },
  {
    id: 'ribbet',
    name: 'Ribbet',
    featureName: 'Amphibious & Prehensile Tongue',
    description: 'Move naturally underwater. Use your tongue to grab distant objects or pull enemies in Very Close range.',
  },
  {
    id: 'simiah',
    name: 'Simiah',
    featureName: 'Nimble Climber & Evasion',
    description: 'Gain Advantage on Agility checks for climbing and balancing, and gain a permanent +1 bonus to Evasion.',
  },
  {
    id: 'mixed-ancestry',
    name: 'Mixed Ancestry',
    featureName: 'Heritage Blend',
    description: 'Choose two distinct ancestries and gain the primary feature of both lineages to create your custom heritage.',
  },
];

export const COMMUNITIES_DATA: CommunityDefinition[] = [
  {
    id: 'highborne',
    name: 'Highborne',
    featureName: 'Aristocratic Prestige',
    description: 'Gain Advantage on social checks when dealing with nobles, merchants, and political officials.',
  },
  {
    id: 'loreborne',
    name: 'Loreborne',
    featureName: 'Academic Mastery',
    description: 'Gain Advantage on Knowledge rolls regarding ancient history, arcana, culture, and political figures.',
  },
  {
    id: 'orderborne',
    name: 'Orderborne',
    featureName: 'Dedicated Principle',
    description: 'When acting in direct alignment with your community’s core oath or principle, roll a d20 as a bonus Hope die once per rest.',
  },
  {
    id: 'ridgeborne',
    name: 'Ridgeborne',
    featureName: 'Mountain Traverser',
    description: 'Gain Advantage on rolls to traverse steep cliffs, ledges, and navigate harsh mountain terrain.',
  },
  {
    id: 'seaborne',
    name: 'Seaborne',
    featureName: 'Know the Tide',
    description: 'Can swim at full speed and hold breath for 10 minutes. Gain bonuses to navigation and water maneuvers.',
  },
  {
    id: 'slyborne',
    name: 'Slyborne',
    featureName: 'Streetwise',
    description: 'Gain Advantage on rolls to negotiate with criminals, detect deceptions, or find safe urban hideouts.',
  },
  {
    id: 'underborne',
    name: 'Underborne',
    featureName: 'Low-Light Living',
    description: 'Gain Advantage on rolls to hide, investigate, or perceive details in low light or heavy shadow.',
  },
  {
    id: 'wildborne',
    name: 'Wildborne',
    featureName: 'Lightfoot',
    description: 'Your movement is naturally silent. Gain Advantage on rolls to move stealthily through wilderness environments.',
  },
  {
    id: 'wanderborne',
    name: 'Wanderborne',
    featureName: 'Nomadic Wisdom',
    description: 'Gain 1 Hope whenever you arrive at a new settlement or successfully navigate uncharted territory.',
  },
  {
    id: 'hearthborne',
    name: 'Hearthborne',
    featureName: 'Community Bond',
    description: 'When assisting an ally during a short or long rest, both you and your ally clear 1 extra Stress.',
  },
];

