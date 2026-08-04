import { SrdItem } from '../types';

export const SRD_LOOT: SrdItem[] = [
  {
    "id": "cTYvyaSKBxosM9Y9",
    "name": "Airblade Charm",
    "category": "Magic Item",
    "subCategory": "Loot / Relic / Charm",
    "description": "You can attach this charm to a weapon with a Melee range. Three times per rest, you can activate the charm and attack a target within Close range.",
    "features": [
      {
        "name": "Action: Activate [Uses: 3 per shortRest]",
        "description": "Performable item action."
      }
    ],
    "cost": "Loot"
  },
  {
    "id": "MeEg57T6MKpw3sme",
    "name": "Alistair’s Torch",
    "category": "Magic Item",
    "subCategory": "Loot / Relic",
    "description": "You can light this magic torch at will. The flame’s light fills a much larger space than it should, enough to illuminate a cave bright as day.",
    "features": [],
    "cost": "Loot"
  },
  {
    "id": "4STt98biZwjFoKOe",
    "name": "Arcane Cloak",
    "category": "Magic Item",
    "subCategory": "Loot / Wondrous Gear",
    "description": "A creature with a Spellcast trait wearing this cloak can adjust its color, texture, and size at will.",
    "features": [],
    "cost": "Loot"
  },
  {
    "id": "Mn1eo2Mdtu1kzyxB",
    "name": "Arcane Prism",
    "category": "Magic Item",
    "subCategory": "Loot / Relic",
    "description": "Position this prism in a location of your choosing and activate it. All allies within Close range of it gain a +1 bonus to their Spellcast Rolls. While activated, the prism can’t be moved. Once the prism is deactivated, it can’t be activated again until your next long rest.",
    "features": [
      {
        "name": "Action: Activate [Uses: 1 per longRest]",
        "description": "Performable item action."
      },
      {
        "name": "Effect: Arcane Prism [Bonus: bonus add 1]",
        "description": "Grants: bonus add 1"
      }
    ],
    "cost": "Loot"
  },
  {
    "id": "vK6bKyQTT3m8WvMh",
    "name": "Attune Relic",
    "category": "Magic Item",
    "subCategory": "Loot / Relic / Charm",
    "description": "You gain a +1 bonus to your Instinct. You can only carry one relic.",
    "features": [
      {
        "name": "Effect: Attune Relic [Bonus: value add 1]",
        "description": "You gain a +1 bonus to your Instinct."
      }
    ],
    "cost": "Loot"
  },
  {
    "id": "v758j4FwNVAurhYK",
    "name": "Bag of Ficklesand",
    "category": "Magic Item",
    "subCategory": "Loot / Relic",
    "description": "You can convince this small bag of sand to be much heavier or lighter with a successful (Roll check). Additionally, on a successful (Roll check), you can blow a bit of sand into a target’s face to make them temporarily Vulnerable.",
    "features": [
      {
        "name": "Action: Blow Sand [Roll: FINESSE (DC 10)]",
        "description": "Performable item action."
      },
      {
        "name": "Effect: Bag of Ficklesand [Applies: vulnerable]",
        "description": "Passive or triggered item effect."
      }
    ],
    "cost": "Loot"
  },
  {
    "id": "gFzkUGCjkRJtyoe9",
    "name": "Belt of Unity",
    "category": "Magic Item",
    "subCategory": "Loot / Wondrous Gear",
    "description": "Once per session, you can spend 5 Hope to lead a Tag Team Roll with three PCs instead of two.",
    "features": [
      {
        "name": "Action: Use [Cost: 5 HOPE | Uses: 1 per session]",
        "description": "Performable item action."
      }
    ],
    "cost": "Loot"
  },
  {
    "id": "oMd78vhL2x2NO8Mg",
    "name": "Bloodstone",
    "category": "Magic Item",
    "subCategory": "Loot / Relic / Charm",
    "description": "You can attach this stone to a weapon that doesn’t already have a feature. The weapon gains the following feature.Brutal: When you roll the maximum value on a damage die, roll an additional damage die.",
    "features": [],
    "cost": "Loot"
  },
  {
    "id": "m3EpxlDgxn2tCDDR",
    "name": "Bolster Relic",
    "category": "Magic Item",
    "subCategory": "Loot / Relic / Charm",
    "description": "You gain a +1 bonus to your Strength. You can only carry one relic.",
    "features": [
      {
        "name": "Effect: Bolster Relic [Bonus: value add 1]",
        "description": "You gain a +1 bonus to your Strength."
      }
    ],
    "cost": "Loot"
  },
  {
    "id": "bZyT7Qw7iafswlTY",
    "name": "Box of Many Goods",
    "category": "Magic Item",
    "subCategory": "Loot / Relic",
    "description": "Once per long rest, you can open this small box and roll a [[/r d12]]. On a result of 1–6, it’s empty. On a result of 7–10, it contains one random common consumable. On a result of 11–12, it contains two random common consumables.",
    "features": [
      {
        "name": "Action: Open [Uses: 1 per longRest]",
        "description": "Performable item action."
      }
    ],
    "cost": "Loot"
  },
  {
    "id": "tgFFMxpuRSiRrrEB",
    "name": "Calming Pendant",
    "category": "Magic Item",
    "subCategory": "Loot / Jewelry",
    "description": "When you would mark your last Stress, roll a [[/r d6]]. On a result of 5 or higher, don’t mark it.",
    "features": [
      {
        "name": "Action: Use",
        "description": "Performable item action."
      }
    ],
    "cost": "Loot"
  },
  {
    "id": "gsUDP90d4SRtLEUn",
    "name": "Charging Quiver",
    "category": "Magic Item",
    "subCategory": "Loot / Relic",
    "description": "When you succeed on an attack with an arrow stored in this quiver, gain a bonus to the damage roll equal to your current tier.",
    "features": [
      {
        "name": "Effect: Charging Quiver [Bonus: bonus add @system.tier, bonus add @system.tier]",
        "description": "Grants: bonus add @system.tier, bonus add @system.tier"
      }
    ],
    "cost": "Loot"
  },
  {
    "id": "9P9jqGSlxVCbTdLe",
    "name": "Charm Relic",
    "category": "Magic Item",
    "subCategory": "Loot / Relic / Charm",
    "description": "You gain a +1 bonus to your Presence. You can only carry one relic.",
    "features": [
      {
        "name": "Effect: Charm Relic [Bonus: value add 1]",
        "description": "You gain a +1 bonus to your Presence."
      }
    ],
    "cost": "Loot"
  },
  {
    "id": "lGIk9vBNz0jvskXD",
    "name": "Clay Companion",
    "category": "Magic Item",
    "subCategory": "Loot / Relic",
    "description": "When you sculpt this ball of clay into a clay animal companion, it behaves as that animal. For example, a clay spider can spin clay webs, while a clay bird can fly. The clay companion retains memory and identity across different shapes, but they can adopt new mannerisms with each form.",
    "features": [],
    "cost": "Loot"
  },
  {
    "id": "V25uXkAQvK3hUta4",
    "name": "Companion Case",
    "category": "Magic Item",
    "subCategory": "Loot / Relic",
    "description": "This case can fit a small animal companion. While the companion is inside, the animal and case are immune to all damage and harmful effects.",
    "features": [],
    "cost": "Loot"
  },
  {
    "id": "QPGBDItjrRhXU6iJ",
    "name": "Control Relic",
    "category": "Magic Item",
    "subCategory": "Loot / Relic / Charm",
    "description": "You gain a +1 bonus to your Finesse. You can only carry one relic.",
    "features": [
      {
        "name": "Effect: Control Relic [Bonus: value add 1]",
        "description": "You gain a +1 bonus to your Finesse."
      }
    ],
    "cost": "Loot"
  },
  {
    "id": "G0RktbmtnuAlKCRH",
    "name": "Corrector Sprite",
    "category": "Magic Item",
    "subCategory": "Loot / Relic",
    "description": "This tiny sprite sits in the curve of your ear canal and whispers helpful advice during combat. Once per short rest, you can gain advantage on an attack roll.",
    "features": [
      {
        "name": "Action: Listen [Uses: 1 per shortRest]",
        "description": "Performable item action."
      }
    ],
    "cost": "Loot"
  },
  {
    "id": "HCvcAu3sdHCspGMP",
    "name": "Dual Flask",
    "category": "Gear",
    "subCategory": "Consumable / Potion / Recipe",
    "description": "This flask can hold two different liquids. You can swap between them by flipping a small switch on the flask’s side.",
    "features": [],
    "cost": "Loot"
  },
  {
    "id": "PkmTZXRMZL022O75",
    "name": "Elusive Amulet",
    "category": "Magic Item",
    "subCategory": "Loot / Jewelry",
    "description": "Once per long rest, you can activate this amulet to become Hidden until you move. While Hidden in this way, you remain unseen even if an adversary moves to where they would normally see you.",
    "features": [
      {
        "name": "Action: Activate [Uses: 1 per longRest]",
        "description": "Performable item action."
      },
      {
        "name": "Effect: Elusive Amulet [Applies: hidden]",
        "description": "You are Hidden until you move. While Hidden in this way, you remain unseen even if an adversary moves to where they would normally see you."
      }
    ],
    "cost": "Loot"
  },
  {
    "id": "p2yy61uKsyIsl8cU",
    "name": "Empty Chest",
    "category": "Magic Item",
    "subCategory": "Loot / Relic",
    "description": "This magical chest appears empty. When you speak a specific trigger word or action and open the chest, you can see the items stored within it.",
    "features": [],
    "cost": "Loot"
  },
  {
    "id": "vSGx1f9SYUiA29L3",
    "name": "Enlighten Relic",
    "category": "Magic Item",
    "subCategory": "Loot / Relic / Charm",
    "description": "You gain a +1 bonus to your Knowledge. You can only carry one relic.",
    "features": [
      {
        "name": "Effect: Enlighten Relic [Bonus: value add 1]",
        "description": "You gain a +1 bonus to your Knowledge."
      }
    ],
    "cost": "Loot"
  },
  {
    "id": "X6RMkIt89wf7qX2E",
    "name": "Fire Jar",
    "category": "Magic Item",
    "subCategory": "Loot / Relic",
    "description": "You can pour out the strange liquid contents of this jar to instantly produce fire. The contents regenerate when you take a long rest.",
    "features": [
      {
        "name": "Action: Pour [Uses: 1 per longRest]",
        "description": "Performable item action."
      }
    ],
    "cost": "Loot"
  },
  {
    "id": "9VKYSBQxN9XFWlAm",
    "name": "Flickerfly Pendant",
    "category": "Magic Item",
    "subCategory": "Loot / Jewelry",
    "description": "While you carry this pendant, your weapons with a Melee range that deal physical damage have a gossamer sheen and can attack targets within Very Close range.",
    "features": [],
    "cost": "Loot"
  },
  {
    "id": "CGzjBpHJRG8KSt5Y",
    "name": "Gecko Gloves",
    "category": "Magic Item",
    "subCategory": "Loot / Wondrous Gear",
    "description": "You can climb up vertical surfaces and across ceilings.",
    "features": [],
    "cost": "Loot"
  },
  {
    "id": "zecFwBUSWtB3HW8X",
    "name": "Gem of Alacrity",
    "category": "Magic Item",
    "subCategory": "Loot / Relic / Charm",
    "description": "You can attach this gem to a weapon, allowing you to use your Agility when making an attack with that weapon.",
    "features": [],
    "cost": "Loot"
  },
  {
    "id": "hMu9It3ThCLCXuCA",
    "name": "Gem of Audacity",
    "category": "Magic Item",
    "subCategory": "Loot / Relic / Charm",
    "description": "You can attach this gem to a weapon, allowing you to use your Presence when making an attack with that weapon.",
    "features": [],
    "cost": "Loot"
  },
  {
    "id": "TbgeT9ZxKHqFqJSN",
    "name": "Gem of Insight",
    "category": "Magic Item",
    "subCategory": "Loot / Relic / Charm",
    "description": "You can attach this gem to a weapon, allowing you to use your Instinct when making an attack with that weapon.",
    "features": [],
    "cost": "Loot"
  },
  {
    "id": "rtSInNPc4B3ChBUZ",
    "name": "Gem of Might",
    "category": "Magic Item",
    "subCategory": "Loot / Relic / Charm",
    "description": "You can attach this gem to a weapon, allowing you to use your Strength when making an attack with that weapon.",
    "features": [],
    "cost": "Loot"
  },
  {
    "id": "CrvJ7vb4s40YgEcy",
    "name": "Gem of Precision",
    "category": "Magic Item",
    "subCategory": "Loot / Relic / Charm",
    "description": "You can attach this gem to a weapon, allowing you to use your Finesse when making an attack with that weapon.",
    "features": [],
    "cost": "Loot"
  },
  {
    "id": "ua351S7CsH22X1x2",
    "name": "Gem of Sagacity",
    "category": "Magic Item",
    "subCategory": "Loot / Relic / Charm",
    "description": "You can attach this gem to a weapon, allowing you to use your Knowledge when making an attack with that weapon.",
    "features": [],
    "cost": "Loot"
  },
  {
    "id": "Pj17cvdJ1XG1jv6I",
    "name": "Glamour Stone",
    "category": "Magic Item",
    "subCategory": "Loot / Relic / Charm",
    "description": "Activate this pebble-sized stone to memorize the appearance of someone you can see. Spend a Hope to magically recreate this guise on yourself as an illusion.",
    "features": [
      {
        "name": "Action: Create Illusion [Cost: 1 HOPE]",
        "description": "Activate this pebble-sized stone to memorize the appearance of someone you can see. Spend a Hope to magically recreate this guise on yourself as an illusion."
      },
      {
        "name": "Effect: Glamour Stone",
        "description": "Activate this pebble-sized stone to memorize the appearance of someone you can see. Spend a Hope to magically recreate this guise on yourself as an illusion."
      }
    ],
    "cost": "Loot"
  },
  {
    "id": "CiXwelozmBDcPY48",
    "name": "Glider",
    "category": "Magic Item",
    "subCategory": "Loot / Relic",
    "description": "While falling, you can mark a Stress to deploy this small parachute and glide safely to the ground.",
    "features": [
      {
        "name": "Action: Mark Stress [Cost: 1 STRESS]",
        "description": "Performable item action."
      }
    ],
    "cost": "Loot"
  },
  {
    "id": "y7zABzR0Q2fRskTw",
    "name": "Greatstone",
    "category": "Magic Item",
    "subCategory": "Loot / Relic / Charm",
    "description": "You can attach this stone to a weapon that doesn’t already have a feature. The weapon gains the following feature.Powerful: On a successful attack, roll an additional damage die and discard the lowest result.",
    "features": [],
    "cost": "Loot"
  },
  {
    "id": "yrAGYlDyoe4OYl7d",
    "name": "Homing Compasses",
    "category": "Magic Item",
    "subCategory": "Loot / Relic",
    "description": "These two compasses point toward each other no matter how far apart they are.",
    "features": [],
    "cost": "Loot"
  },
  {
    "id": "SAAnEAeXDnhBbLjB",
    "name": "Honing Relic",
    "category": "Magic Item",
    "subCategory": "Loot / Relic / Charm",
    "description": "You gain a +1 bonus to an Experience of your choice. You can only carry one relic.",
    "features": [],
    "cost": "Loot"
  },
  {
    "id": "9DcFR75tsnBYIp6Z",
    "name": "Hopekeeper Locket",
    "category": "Magic Item",
    "subCategory": "Loot / Jewelry",
    "description": "During a long rest, if you have 6 Hope, you can spend a Hope to imbue this locket with your bountiful resolve.When you have 0 Hope, you can use the locket to immediately gain a Hope. The locket must be re-imbued before it can be used this way again.",
    "features": [
      {
        "name": "Action: Imbue [Cost: 1 HOPE]",
        "description": "Performable item action."
      },
      {
        "name": "Action: Use",
        "description": "Performable item action."
      }
    ],
    "cost": "Loot"
  },
  {
    "id": "Iedjw1LVWEozVh0J",
    "name": "Infinite Bag",
    "category": "Magic Item",
    "subCategory": "Loot / Relic",
    "description": "When you store items in this bag, they are kept in a pocket dimension that never runs out of space. You can retrieve an item at any time.",
    "features": [],
    "cost": "Loot"
  },
  {
    "id": "NgvmrJYKpA2PrRSo",
    "name": "Lakestrider Boots",
    "category": "Magic Item",
    "subCategory": "Loot / Wondrous Gear",
    "description": "You can walk on the surface of water as if it were soft ground.",
    "features": [],
    "cost": "Loot"
  },
  {
    "id": "JsPYzrqpITqGj23I",
    "name": "Lorekeeper",
    "category": "Magic Item",
    "subCategory": "Loot / Relic",
    "description": "You can store the name and details of up to three hostile creatures inside this book. You gain a +1 bonus to action rolls against those creatures.",
    "features": [],
    "cost": "Loot"
  },
  {
    "id": "GkmATIuemyFtQX1D",
    "name": "Manacles",
    "category": "Magic Item",
    "subCategory": "Loot / Relic",
    "description": "This pair of locking cuffs comes with a key.",
    "features": [],
    "cost": "Loot"
  },
  {
    "id": "PQxvxAVBbkt0TleC",
    "name": "Minor Health Potion Recipe",
    "category": "Gear",
    "subCategory": "Consumable / Potion / Recipe",
    "description": "As a downtime move, you can use a vial of blood to craft a Minor Health Potion.",
    "features": [],
    "cost": "Loot"
  },
  {
    "id": "1TLpFsp3PLDsqoTw",
    "name": "Minor Stamina Potion Recipe",
    "category": "Gear",
    "subCategory": "Consumable / Potion / Recipe",
    "description": "As a downtime move, you can use the bone of a creature to craft a Minor Stamina Potion.",
    "features": [],
    "cost": "Loot"
  },
  {
    "id": "5YZls8XH3MB7twNa",
    "name": "Mythic Dust Recipe",
    "category": "Gear",
    "subCategory": "Consumable / Potion / Recipe",
    "description": "As a downtime move, you can use a handful of fine gold dust to craft Mythic Dust.",
    "features": [],
    "cost": "Loot"
  },
  {
    "id": "F4hoRfvVdZq5bhhI",
    "name": "Paragon’s Chain",
    "category": "Magic Item",
    "subCategory": "Loot / Relic",
    "description": "As a downtime move, you can meditate on an ideal or principle you hold dear and focus your will into this chain.Once per long rest, you can spend a Hope to roll a d20 as your Hope Die for rolls that directly align with that principle.",
    "features": [
      {
        "name": "Action: Use [Cost: 1 HOPE | Uses: 1 per longRest]",
        "description": "Performable item action."
      }
    ],
    "cost": "Loot"
  },
  {
    "id": "QNtzJSVENww63THa",
    "name": "Phoenix Feather",
    "category": "Magic Item",
    "subCategory": "Loot / Relic",
    "description": "If you have at least one Phoenix Feather on you when you fall unconscious, you gain a +1 bonus to the roll you make to determine whether you gain a scar.",
    "features": [],
    "cost": "Loot"
  },
  {
    "id": "I63LTFD6GXHgyGpR",
    "name": "Piercing Arrows",
    "category": "Magic Item",
    "subCategory": "Loot / Relic",
    "description": "Three times per rest when you succeed on an attack with one of these arrows, you can add your Proficiency to the damage roll.",
    "features": [
      {
        "name": "Action: Use [Uses: 3 per shortRest]",
        "description": "Three times per rest when you succeed on an attack with one of these arrows, you can add your Proficiency to the damage roll."
      },
      {
        "name": "Effect: Piercing Arrows [Bonus: bonus add @system.proficiency, bonus add @system.proficiency]",
        "description": "Add your Proficiency to the damage roll of this attack."
      }
    ],
    "cost": "Loot"
  },
  {
    "id": "v4PIoCCEjeE3acys",
    "name": "Piper Whistle",
    "category": "Magic Item",
    "subCategory": "Loot / Relic",
    "description": "This handcrafted whistle has a distinctive sound. When you blow this whistle, its piercing tone can be heard within a 1-mile radius.",
    "features": [],
    "cost": "Loot"
  },
  {
    "id": "eRd5Gk7J7hPCqp11",
    "name": "Portal Seed",
    "category": "Magic Item",
    "subCategory": "Loot / Relic",
    "description": "You can plant this seed in the ground to grow a portal in that spot. The portal is ready to use in 24 hours. You can use this portal to travel to any other location where you planted a portal seed. A portal can be destroyed by dealing any amount of magic damage to it.",
    "features": [],
    "cost": "Loot"
  },
  {
    "id": "QGYPNBIufpBguwjC",
    "name": "Premium Bedroll",
    "category": "Magic Item",
    "subCategory": "Loot / Relic",
    "description": "During downtime, you automatically clear a Stress.",
    "features": [
      {
        "name": "Action: Take a nap",
        "description": "Performable item action."
      }
    ],
    "cost": "Loot"
  },
  {
    "id": "aUqRifqR5JXXa1dN",
    "name": "Ring of Resistance",
    "category": "Magic Item",
    "subCategory": "Loot / Jewelry",
    "description": "Once per long rest, you can activate this ring after a successful attack against you to halve the damage.",
    "features": [
      {
        "name": "Action: Activate [Uses: 1 per longRest]",
        "description": "Once per long rest, you can activate this ring after a successful attack against you to halve the damage."
      },
      {
        "name": "Effect: Ring of Resistance [Bonus: resistance override 1, resistance override 1]",
        "description": "Once per long rest, you can activate this ring after a successful attack against you to halve the damage."
      }
    ],
    "cost": "Loot"
  },
  {
    "id": "K1ysGnTpNyxPu5Au",
    "name": "Ring of Silence",
    "category": "Magic Item",
    "subCategory": "Loot / Jewelry",
    "description": "Spend a Hope to activate this ring. Your footsteps are silent until your next rest.",
    "features": [
      {
        "name": "Action: Activate [Cost: 1 HOPE | Uses: 1 per shortRest]",
        "description": "Spend a Hope to activate this ring. Your footsteps are silent until your next rest."
      },
      {
        "name": "Effect: Ring of Silence",
        "description": "Your footsteps are silent until your next rest."
      }
    ],
    "cost": "Loot"
  },
  {
    "id": "kn71qCQY0DnjmQBJ",
    "name": "Ring of Unbreakable Resolve",
    "category": "Magic Item",
    "subCategory": "Loot / Jewelry",
    "description": "Once per session, when the GM spends a Fear, you can spend 4 Hope to cancel the effects of that spent Fear.",
    "features": [
      {
        "name": "Action: Use [Cost: 4 HOPE | Uses: 1 per session]",
        "description": "Performable item action."
      }
    ],
    "cost": "Loot"
  },
  {
    "id": "2ULPgNyqCrxea0v0",
    "name": "Shard of Memory",
    "category": "Magic Item",
    "subCategory": "Loot / Relic",
    "description": "Once per long rest, you can spend 2 Hope to recall a domain card from your vault instead of paying its Recall Cost.",
    "features": [
      {
        "name": "Action: Use [Cost: 2 HOPE | Uses: 1 per longRest]",
        "description": "Performable item action."
      }
    ],
    "cost": "Loot"
  },
  {
    "id": "edkNgwy4xghZreBa",
    "name": "Skeleton Key",
    "category": "Magic Item",
    "subCategory": "Loot / Relic",
    "description": "When you use this key to open a locked door, you gain advantage on the Finesse Roll.",
    "features": [
      {
        "name": "Action: Use Key [Roll: FINESSE ]",
        "description": "Performable item action."
      }
    ],
    "cost": "Loot"
  },
  {
    "id": "LZrG6CFiSjpLA2F1",
    "name": "Speaking Orbs",
    "category": "Magic Item",
    "subCategory": "Loot / Relic",
    "description": "This pair of orbs allows any creatures holding them to communicate with each other across any distance.",
    "features": [],
    "cost": "Loot"
  },
  {
    "id": "FfJISMzYATaPQPLc",
    "name": "Stride Relic",
    "category": "Magic Item",
    "subCategory": "Loot / Relic / Charm",
    "description": "You gain a +1 bonus to your Agility. You can only carry one relic.",
    "features": [
      {
        "name": "Effect: Stride Relic [Bonus: value add 1]",
        "description": "You gain a +1 bonus to your Agility."
      }
    ],
    "cost": "Loot"
  },
  {
    "id": "nnj12RiFanq7s5zv",
    "name": "Suspended Rod",
    "category": "Magic Item",
    "subCategory": "Loot / Relic",
    "description": "This flat rod is inscribed with runes. When you activate the rod, it is immediately suspended in place. Until the rod is deactivated, it can’t move, doesn’t abide by the rules of gravity, and remains in place.",
    "features": [],
    "cost": "Loot"
  },
  {
    "id": "7yywua9TmQ4WP5WH",
    "name": "Valorstone",
    "category": "Magic Item",
    "subCategory": "Loot / Relic / Charm",
    "description": "You can attach this stone to armor that doesn’t already have a feature. The armor gains the following feature.Resilient: Before you mark your last Armor Slot, roll a d6. On a result of 6, reduce the severity by one threshold without marking an Armor Slot.",
    "features": [],
    "cost": "Loot"
  },
  {
    "id": "MhCo8i0cRXzdnXbA",
    "name": "Vial of Darksmoke Recipe",
    "category": "Gear",
    "subCategory": "Consumable / Potion / Recipe",
    "description": "As a downtime move, you can mark a Stress to craft a Vial of Darksmoke.",
    "features": [],
    "cost": "Loot"
  },
  {
    "id": "ARuv48PWUGJGBC4n",
    "name": "Woven Net",
    "category": "Magic Item",
    "subCategory": "Loot / Relic",
    "description": "You can make a Finesse Roll using this net to trap a small creature. A trapped target can break free with a successful Attack Roll (16).",
    "features": [
      {
        "name": "Action: Throw [Roll: FINESSE ]",
        "description": "Performable item action."
      },
      {
        "name": "Effect: Woven Net",
        "description": "Passive or triggered item effect."
      },
      {
        "name": "Effect: Woven Net [Applies: restrained]",
        "description": "Passive or triggered item effect."
      }
    ],
    "cost": "Loot"
  }
];
