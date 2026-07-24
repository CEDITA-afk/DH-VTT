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
    subclasses: ['Warden of the Elements', 'Warden of the Wild'],
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
    subclasses: ['Vengeance Guardian', 'Stalwart Defender'],
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
    subclasses: ['Wayfinder', 'Beastmaster'],
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
    subclasses: ['Nightwalker', 'Syndicate Executioner'],
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
    subclasses: ['Winged Redeemer', 'Divine Hammer'],
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
    subclasses: ['Elemental Primordial', 'Chaos Weaver'],
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
    subclasses: ['Weapon Master', 'Slayer'],
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
    subclasses: ['School of Knowledge', 'School of Transmutation'],
  },
];

export const ANCESTRIES_DATA: AncestryDefinition[] = [
  {
    id: 'clank',
    name: 'Clank',
    featureName: 'Constructed Resilience',
    description: 'Immune to natural toxins and diseases. Gain +1 Armor Slot.',
  },
  {
    id: 'drakona',
    name: 'Drakona',
    featureName: 'Elemental Breath',
    description: 'Unleash a line of elemental breath dealing 1d8 elemental damage to targets in Close range.',
  },
  {
    id: 'dwarf',
    name: 'Dwarf',
    featureName: 'Thick Skin',
    description: 'When taking physical damage, mark 1 Stress to reduce incoming damage by 3.',
  },
  {
    id: 'elf',
    name: 'Elf',
    featureName: 'Celestial Grace',
    description: 'Spend 1 Hope to reroll any Agility or Finesse die.',
  },
  {
    id: 'farborne',
    name: 'Farborne',
    featureName: 'Planar Tether',
    description: 'Can sense magic, planar rifts, and invisible creatures within Far range.',
  },
  {
    id: 'fungril',
    name: 'Fungril',
    featureName: 'Spore Cloud',
    description: 'Release a spore cloud that confuses adjacent attackers, applying Dazed condition.',
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
    description: 'Gain +2 to Strength checks and can wield heavy two-handed weapons in one hand.',
  },
  {
    id: 'goblin',
    name: 'Goblin',
    featureName: 'Nimble Scurry',
    description: 'Do not provoke opportunity attacks when moving through enemy spaces.',
  },
  {
    id: 'halfling',
    name: 'Halfling',
    featureName: 'Lucky Spirit',
    description: 'When you roll a failure on a Duality check, spend 1 Hope to force a complete reroll.',
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
    description: 'When reduced to 0 HP, mark 2 Stress instead of falling unconscious and take an immediate bonus action.',
  },
  {
    id: 'ribbet',
    name: 'Ribbet',
    featureName: 'Prehensile Tongue',
    description: 'Use your tongue to grab objects or pull enemies within Very Close range.',
  },
  {
    id: 'simurgh',
    name: 'Simurgh',
    featureName: 'Feathered Glide',
    description: 'Can glide through the air over gaps and descend safely without falling damage.',
  },
];

export const COMMUNITIES_DATA: CommunityDefinition[] = [
  {
    id: 'highborne',
    name: 'Highborne',
    featureName: 'Aristocratic Prestige',
    description: 'Gain Advantage on social checks with nobles, merchants, and guild leaders.',
  },
  {
    id: 'ironborne',
    name: 'Ironborne',
    featureName: 'Craftsman Tradition',
    description: 'Repair weapons and armor during short rests without consuming specialized tools.',
  },
  {
    id: 'loreborne',
    name: 'Loreborne',
    featureName: 'Academic Mastery',
    description: 'Gain +2 to Knowledge checks when deciphering ancient runes, history, or arcane scripts.',
  },
  {
    id: 'orderborne',
    name: 'Orderborne',
    featureName: 'Strict Discipline',
    description: 'Gain +2 resistance against fear, charm, and mental compulsion effects.',
  },
  {
    id: 'ridgeborne',
    name: 'Ridgeborne',
    featureName: 'Mountain Endurance',
    description: 'Ignore difficult terrain caused by rocks, ice, or steep mountain slopes.',
  },
  {
    id: 'seaborne',
    name: 'Seaborne',
    featureName: 'Naval Agility',
    description: 'Can swim at full speed and hold breath for up to 10 minutes.',
  },
  {
    id: 'slyborne',
    name: 'Slyborne',
    featureName: 'Streetwise',
    description: 'Know how to find black markets, thieves guilds, and hidden alleys in any city.',
  },
  {
    id: 'underborne',
    name: 'Underborne',
    featureName: 'Subterranean Vision',
    description: 'Possess darkvision up to Far range in absolute darkness.',
  },
  {
    id: 'wildborne',
    name: 'Wildborne',
    featureName: 'Savage Instincts',
    description: 'Cannot be surprised while conscious and gain +1 to Instinct checks.',
  },
];

