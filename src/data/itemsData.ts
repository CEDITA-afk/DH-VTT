import { SrdItem } from '../types';
import { SRD_WEAPONS } from './srdWeapons';
import { SRD_LOOT } from './srdLoot';
import { SRD_CONSUMABLES } from './srdConsumables';
import { SRD_ARMORS } from './srdArmors';

const NON_WEAPON_ITEMS: SrdItem[] = [
  // --- Armor ---
  {
    id: 'item-leather-armor',
    name: 'Boiled Leather Jerkin',
    category: 'Armor',
    subCategory: 'Light Armor',
    armorRating: 1,
    description: 'Light, flexible armor composed of hardened leather plates. Allows full agility and stealth.',
    cost: 'Starter / 5 Silver',
  },
  {
    id: 'item-hide-armor',
    name: 'Reinforced Beast Hide',
    category: 'Armor',
    subCategory: 'Medium Armor',
    armorRating: 2,
    description: 'Layered animal skins reinforced with metallic studs or bone plaques. Well-suited for wildland survival.',
    cost: 'Starter / 1 Gold',
  },
  {
    id: 'item-chainmail',
    name: 'Sentry Chainmail Hauberk',
    category: 'Armor',
    subCategory: 'Medium Armor',
    armorRating: 3,
    description: 'Interlocking metal rings worn over padded fabric. Offers balanced protection against blades.',
    cost: '2 Gold 5 Silver',
  },
  {
    id: 'item-plate-armor',
    name: 'Dwarven Gilded Plate',
    category: 'Armor',
    subCategory: 'Heavy Armor',
    armorRating: 4,
    description: 'Heavy interlocking steel plates covering the entire body. Drastically limits stealth but makes you nigh-invulnerable.',
    cost: '5 Gold',
  },

  // --- Gear / Consumables ---
  {
    id: 'item-healing-potion',
    name: 'Elixir of Rejuvenation (Healing Potion)',
    category: 'Gear',
    subCategory: 'Consumable Potion',
    description: 'Drinking this liquid restores 1 Hit Point or removes 2 Stress points instantly.',
    cost: '3 Silver',
  },
  {
    id: 'item-hope-potion',
    name: 'Vial of Pure Starlight (Hope Potion)',
    category: 'Gear',
    subCategory: 'Consumable Potion',
    description: 'A swirling silver liquid. When consumed, the hero gains +2 Hope instantly.',
    cost: '5 Silver',
  },
  {
    id: 'item-rope',
    name: 'Silk Climbing Rope (50 ft)',
    category: 'Gear',
    subCategory: 'Adventuring Gear',
    description: 'Sturdy, light rope made of woven spider-silk. Supports up to 1,000 lbs. Essential for dungeon descents.',
    cost: '1 Silver',
  },
  {
    id: 'item-lockpicks',
    name: 'Mechanist Lockpick Set',
    category: 'Gear',
    subCategory: 'Special Tool',
    description: 'A fine set of picks, tension wrenches, and steel files used for bypass and mechanism lockpicking checks.',
    cost: '4 Silver',
  },
  {
    id: 'item-torch',
    name: 'Everburn Torch',
    category: 'Gear',
    subCategory: 'Adventuring Gear',
    description: 'Imbued with a tiny speck of fire elemental essence. Burns brightly for 6 hours even in deep damp vaults.',
    cost: '5 Copper',
  },
  {
    id: 'item-climbing-claws',
    name: 'Steel-Claw Grappling Gauntlets',
    category: 'Gear',
    subCategory: 'Adventuring Gear',
    description: 'Claws worn on the hands and boots. Grant +1 to any Agility checks made to climb vertical stone surfaces.',
    cost: '8 Silver',
  },

  // --- Magic Items ---
  {
    id: 'item-luck-stone',
    name: 'Sovereign Luck Pebble',
    category: 'Magic Item',
    subCategory: 'Wondrous Trinket',
    description: 'Once per session, after rolling dice, you may rub this pebble to reroll a single Fear or Hope die.',
    cost: '3 Gold',
  },
  {
    id: 'item-shadow-cloak',
    name: 'Midnight Weave Cloak',
    category: 'Magic Item',
    subCategory: 'Wondrous Cloak',
    description: 'Grants +1 Evasion and gives you ADVANTAGE on stealth and hidden rolls when in dim light or shadows.',
    cost: '4 Gold',
  },
  {
    id: 'item-phoenix-feather',
    name: 'Phoenix-Ash Amulet',
    category: 'Magic Item',
    subCategory: 'Amulet',
    description: 'When you take damage that would reduce you to 0 HP, this amulet shatters, keeping you at 1 HP instead.',
    cost: '6 Gold',
  },
];

export const ITEMS_DATA: SrdItem[] = [...SRD_WEAPONS, ...SRD_LOOT, ...SRD_CONSUMABLES, ...SRD_ARMORS, ...NON_WEAPON_ITEMS];
