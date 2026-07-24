import { EnvironmentCard } from '../types';

export const ENVIRONMENTS_DATA: EnvironmentCard[] = [
  // ==================== TIER 0 ====================
  {
    id: 'env-sinking-swamp',
    name: 'Misty Murkwood Swamp',
    tier: 0,
    category: 'Wilderness',
    difficulty: 11,
    description: 'A stagnant, foul-smelling swamp choked with knee-deep mud, glowing toxic mushrooms, and sudden sinkholes.',
    impendingDangers: [
      'Sinking mud bogs trap unwary travelers.',
      'Poisonous spore clouds bloom without warning.',
      'Swamp lurkers stalk from beneath murky water.',
    ],
    features: [
      'Muddy Terrain: Moving further than Close range requires an Agility check (DC 11) or costs 1 extra movement.',
      'Heavy Fog: Line of sight beyond Far range is heavily obscured.',
    ],
    fearMoves: [
      {
        name: 'Spore Burst',
        cost: 1,
        effect: 'Spend 1 Fear: A spore pod explodes near a player. Target takes 1d6 Toxic damage and marks 1 Stress.',
      },
      {
        name: 'Sinking Quicksand',
        cost: 1,
        effect: 'Spend 1 Fear: Target player sinks into mud bog; becomes Restrained until they spend an action on Strength (DC 12) to break free.',
      },
      {
        name: 'Miasma Surge',
        cost: 2,
        effect: 'Spend 2 Fear: All players in the scene become Weakened until the end of the next action turn.',
      },
    ],
    clocks: [
      { name: 'Swamp Gas Explosion', segments: 4, current: 0 },
      { name: 'Rising Tide Bog', segments: 6, current: 1 },
    ],
  },
  {
    id: 'env-thieves-alley',
    name: 'Crowded Market & Thieves Alley',
    tier: 0,
    category: 'Urban',
    difficulty: 11,
    description: 'A bustling medieval alley packed with wooden market stalls, shouting vendors, runaway livestock, and pickpockets.',
    impendingDangers: [
      'Collapsing vendor stalls crush anyone trapped underneath.',
      'Crowd chaos separates party members.',
      'Pickpockets swipe coins and potions during combat.',
    ],
    features: [
      'Crowded Thoroughfares: Area attacks risk striking innocent bystanders.',
      'Rooftop Vantage: Climbing onto cloth awnings requires Agility DC 11.',
    ],
    fearMoves: [
      {
        name: 'Panicked Stampede',
        cost: 1,
        effect: 'Spend 1 Fear: Frightened crowd surges through the street. Targets make Strength (DC 11) or fall Prone.',
      },
      {
        name: 'Thieves Cutpurse',
        cost: 1,
        effect: 'Spend 1 Fear: A shadowy thief snatches a potion or key from a target player.',
      },
    ],
    clocks: [
      { name: 'City Watch Arrives', segments: 4, current: 1 },
    ],
  },
  {
    id: 'env-abandoned-watchtower',
    name: 'Ruined Hilltop Watchtower',
    tier: 0,
    category: 'Dungeon',
    difficulty: 11,
    description: 'A stone tower partially destroyed by siege warfare, featuring spiral wooden stairs and exposed ramparts.',
    impendingDangers: [
      'Rotting wooden steps threaten to give way under heavy armor.',
      'Arrow slits provide high cover to defenders inside.',
      'Howling wind hampers ranged bow shots.',
    ],
    features: [
      'High Rampart: Characters on upper level gain High Ground advantage (+1 to hit).',
      'Rotting Floorboards: Rolling a natural 1 on Agility causes floor to crack.',
    ],
    fearMoves: [
      {
        name: 'Stair Collapse',
        cost: 1,
        effect: 'Spend 1 Fear: A flight of stairs collapses. Players standing on it take 1d6 Physical damage.',
      },
    ],
    clocks: [
      { name: 'Tower Roof Collapse', segments: 4, current: 0 },
    ],
  },
  {
    id: 'env-shipwreck-cove',
    name: 'Smuggler Shipwreck Cove',
    tier: 0,
    category: 'Coastal',
    difficulty: 11,
    description: 'A jagged rocky beach strewn with splinters of broken galleons, treacherous tide pools, and barnacle-encrusted hulls.',
    impendingDangers: [
      'Rising ocean surges sweep combatants off slippery sea rocks.',
      'Slippery seaweed causes footing hazards.',
      'Roving giant crabs attack anything that bleeds.',
    ],
    features: [
      'Slippery Barnacles: Moving fast across rocks requires Agility DC 11 check.',
      'Flotsam Cover: Hull timbers offer partial cover against ranged strikes.',
    ],
    fearMoves: [
      {
        name: 'Rogue Wave',
        cost: 1,
        effect: 'Spend 1 Fear: A crashing wave sweeps targets in Close range Prone and washes them 10ft into the sea.',
      },
    ],
    clocks: [
      { name: 'High Tide Flood', segments: 6, current: 2 },
    ],
  },

  // ==================== TIER 1 ====================
  {
    id: 'env-crumbling-ruins',
    name: 'Ancestral Citadel Ruins',
    tier: 1,
    category: 'Dungeon',
    difficulty: 13,
    description: 'An ancient ruined stone fortress crumbling into ruin, featuring fallen pillars, elevated battlements, and unstable stone floors.',
    impendingDangers: [
      'Collapsing stone archways threaten to crush anyone beneath.',
      'Archers on elevated stone platforms gain superior vantage.',
      'Ancient glyph traps activate under heavy footsteps.',
    ],
    features: [
      'Elevated Ramparts: Characters on high stone gain +1 to hit with ranged attacks.',
      'Unstable Floor: High-impact rolls (3+ damage dice) risk triggering stone collapses.',
    ],
    fearMoves: [
      {
        name: 'Falling Pillars',
        cost: 1,
        effect: 'Spend 1 Fear: A stone pillar falls towards a player. Player makes Agility check (DC 13) or suffers 1d10 Physical damage and Prone.',
      },
      {
        name: 'Glyph Trap Detonation',
        cost: 2,
        effect: 'Spend 2 Fear: Ancient rune glows and detonates in Close range. 2d8 Magick damage to all nearby characters.',
      },
    ],
    clocks: [
      { name: 'Castle Collapse', segments: 6, current: 0 },
      { name: 'Reinforcements Arrive', segments: 4, current: 2 },
    ],
  },
  {
    id: 'env-bramblewood-forest',
    name: 'Whispering Bramblewood Forest',
    tier: 1,
    category: 'Wilderness',
    difficulty: 13,
    description: 'A dark primeval forest where dense razor-thorns intertwine with giant glowing fungi and whispering trees.',
    impendingDangers: [
      'Razor-sharp brambles tear armor and flesh on fast movement.',
      'Bewitching forest illusions cause players to attack empty shadows.',
      'Carnivorous flora snags trailing limbs.',
    ],
    features: [
      'Thorn Thickets: Passing through thickets inflicts 2 Physical damage unless Agility (DC 13) is passed.',
      'Eerie Whispers: Players mark 1 Stress at the start of combat from psychic whispers.',
    ],
    fearMoves: [
      {
        name: 'Vines Snare',
        cost: 1,
        effect: 'Spend 1 Fear: Thorny creepers burst from soil, dragging a target Prone and applying Restrained.',
      },
      {
        name: 'Hallucinogenic Spores',
        cost: 2,
        effect: 'Spend 2 Fear: Target player perceives allies as shadowy monsters for 1 turn (Disadvantage on rolls near allies).',
      },
    ],
    clocks: [
      { name: 'Forest Encroachment', segments: 4, current: 0 },
    ],
  },
  {
    id: 'env-ironclad-dockyards',
    name: 'Ironclad Merchant Dockyards',
    tier: 1,
    category: 'Urban',
    difficulty: 13,
    description: 'A bustling deepwater harbor lined with wooden cranes, heavy iron chains, cargo crates, and docked warships.',
    impendingDangers: [
      'Swinging cargo cranes crush combatants caught in movement arcs.',
      'Deep harbor water threatens non-swimmers in heavy armor.',
      'Oil barrels ignite easily near fire magic.',
    ],
    features: [
      'Stacked Crates: High climbing obstacles provide total cover.',
      'Explosive Oil Barrels: Striking an oil barrel with fire deals 2d8 Fire damage in Close range.',
    ],
    fearMoves: [
      {
        name: 'Swinging Crane Deflect',
        cost: 1,
        effect: 'Spend 1 Fear: Heavy wooden crate swings across deck, knocking target Prone and dealing 1d8 damage.',
      },
    ],
    clocks: [
      { name: 'Ship Sets Sail', segments: 6, current: 3 },
    ],
  },
  {
    id: 'env-sunken-catacombs',
    name: 'Sunken Crypt Catacombs',
    tier: 1,
    category: 'Dungeon',
    difficulty: 13,
    description: 'An ancient underground burial vault flooded with knee-deep water and lined with alcoves of decaying bones.',
    impendingDangers: [
      'Hidden underwater pressure plates trigger poison darts.',
      'Narrow damp corridors prevent double-weapon swinging.',
      'Rising water levels submerge lower alcoves.',
    ],
    features: [
      'Waist-Deep Water: Half movement speed unless swimming or flying.',
      'Echoing Vaults: Sonic or thunder spells gain +2 to damage.',
    ],
    fearMoves: [
      {
        name: 'Grave Pillar Collapse',
        cost: 1,
        effect: 'Spend 1 Fear: Crypt ceiling slab falls. Target takes 2d6 Bludgeoning damage.',
      },
    ],
    clocks: [
      { name: 'Chamber Floods Completely', segments: 6, current: 1 },
    ],
  },

  // ==================== TIER 2 ====================
  {
    id: 'env-burning-volcano',
    name: 'Infernal Caldera Ridge',
    tier: 2,
    category: 'Mystic',
    difficulty: 15,
    description: 'A scorching volcanic ridge with rivers of molten magma, sulfurous steam vents, and blinding heat waves.',
    impendingDangers: [
      'Lava surges threaten to incinerate anyone knocked off stone paths.',
      'Ash clouds blind ranged combatants and choke breathing.',
      'Earthquakes crack stone footing every few minutes.',
    ],
    features: [
      'Magma Hazards: Touching magma deals instant 2d10 Fire damage and marks 2 Stress.',
      'Sulfur Fumes: Players suffer 1 Stress every 3 action turns if not protected.',
    ],
    fearMoves: [
      {
        name: 'Lava Geyser Burst',
        cost: 1,
        effect: 'Spend 1 Fear: Lava erupts under a target. 2d6 Fire damage and Vulnerable condition.',
      },
      {
        name: 'Volcanic Tremor',
        cost: 2,
        effect: 'Spend 2 Fear: All players must make Strength check (DC 15) or fall Prone and drop held weapons.',
      },
    ],
    clocks: [
      { name: 'Caldera Eruption', segments: 8, current: 3 },
    ],
  },
  {
    id: 'env-storm-lighthouse',
    name: 'Storm-Swept Cliff Lighthouse',
    tier: 2,
    category: 'Coastal',
    difficulty: 15,
    description: 'A towering stone lighthouse perched on a sheer sea cliff during a howling electrical hurricane.',
    impendingDangers: [
      'Gale force winds blow characters towards the cliff edge.',
      'Lightning strikes attract metal armor wearers.',
      'Blinding searchlight beam dazes anyone looking directly at it.',
    ],
    features: [
      'Gale Winds: Ranged missile attacks suffer Disadvantage.',
      'Slippery Spiral Stairs: Moving full speed requires Agility DC 15.',
    ],
    fearMoves: [
      {
        name: 'Lightning Bolt Strike',
        cost: 2,
        effect: 'Spend 2 Fear: Lightning strikes metal-clad player. Deal 3d8 Lightning damage.',
      },
    ],
    clocks: [
      { name: 'Lighthouse Lens Shatters', segments: 4, current: 0 },
    ],
  },
  {
    id: 'env-underdark-obsidian-pass',
    name: 'Underdark Obsidian Pass',
    tier: 2,
    category: 'Dungeon',
    difficulty: 15,
    description: 'A pitch-black cavernous abyss spanned by narrow obsidian natural bridges suspended over lava chasms.',
    impendingDangers: [
      'Abyssal falls lead to instant death or severe trauma.',
      'Echolocating subterranean bats swarm light sources.',
      'Razor obsidian edges cut boots and hands.',
    ],
    features: [
      'Pitch Darkness: Non-darkvision characters cannot target beyond Close range without torch.',
      'Narrow Bridge: Only 1 character can stand abreast on the span.',
    ],
    fearMoves: [
      {
        name: 'Bridge Tremor',
        cost: 2,
        effect: 'Spend 2 Fear: The obsidian bridge cracks. Everyone on it makes Agility DC 15 or hangs from the ledge.',
      },
    ],
    clocks: [
      { name: 'Abyssal Swarm Arrives', segments: 6, current: 1 },
    ],
  },

  // ==================== TIER 3 ====================
  {
    id: 'env-astral-rift',
    name: 'Shifting Astral Nexus',
    tier: 3,
    category: 'Planar',
    difficulty: 17,
    description: 'A surreal realm where floating obsidian islands drift in a violet void under zero gravity conditions.',
    impendingDangers: [
      'Gravity inversions hurl combatants into the void.',
      'Temporal anomalies accelerate or rewind combat turns.',
      'Astral storms tear through magic shields.',
    ],
    features: [
      'Zero-G Bounds: Jump distances are tripled, but missed attacks carry momentum.',
      'Planar Resonances: Spellcast checks gain +2 to hit, but failures generate +1 Fear.',
    ],
    fearMoves: [
      {
        name: 'Gravity Shear',
        cost: 2,
        effect: 'Spend 2 Fear: Gravity flips for 1 turn. All players fall upwards and take 2d8 damage upon landing.',
      },
      {
        name: 'Chrono Disruption',
        cost: 2,
        effect: 'Spend 2 Fear: Target player skips their next action turn as time stutters around them.',
      },
    ],
    clocks: [
      { name: 'Planar Implosion', segments: 6, current: 1 },
    ],
  },
  {
    id: 'env-frostbite-citadel',
    name: 'Frostbite Glacier Citadel',
    tier: 3,
    category: 'Wilderness',
    difficulty: 17,
    description: 'A fortress carved into solid blue glacier ice where sub-zero blizzards freeze blood in veins.',
    impendingDangers: [
      'Extreme frostbite causes cumulative Agility penalties.',
      'Slippery ice slides launch combatants into crevasse pits.',
      'Icicle spires fall from high vaulted ceilings.',
    ],
    features: [
      'Freezing Gale: Characters taking damage mark 1 additional Stress from frost shock.',
      'Mirror Ice: Ranged magic attacks reflect off polished ice walls on misses.',
    ],
    fearMoves: [
      {
        name: 'Glacier Crevasse Open',
        cost: 2,
        effect: 'Spend 2 Fear: Ice splits beneath a target. Target falls into crevasse taking 3d8 Cold damage and Restrained.',
      },
    ],
    clocks: [
      { name: 'Whiteout Blizzard', segments: 6, current: 2 },
    ],
  },

  // ==================== TIER 4 ====================
  {
    id: 'env-abyssal-void-spire',
    name: 'Abyssal Void Spire',
    tier: 4,
    category: 'Planar',
    difficulty: 20,
    description: 'The pinnacle of a dark god’s unholy spire suspended over an infinite swirling abyssal vortex.',
    impendingDangers: [
      'Disintegrating void bolts strip armor and flesh completely.',
      'Mind-bending eldritch geometry forces Instinct DC 20 sanity checks.',
      'Vortex gravitational pull drags all living soul matter into oblivion.',
    ],
    features: [
      'Eldritch Resonance: All spell damage is increased by +1d10.',
      'Unstable Floor Geometry: Spaces shift position at the end of each round.',
    ],
    fearMoves: [
      {
        name: 'Eldritch Void Surge',
        cost: 3,
        effect: 'Spend 3 Fear: Unholy anti-matter beam strikes all players in the scene for 4d10 Void damage and 2 Stress.',
      },
      {
        name: 'Mind Fracture',
        cost: 2,
        effect: 'Spend 2 Fear: Target player becomes Dazed and Silenced until they pass Presence check (DC 20).',
      },
    ],
    clocks: [
      { name: 'Reality Collapse', segments: 8, current: 2 },
    ],
  },
];
