/**
 * Daggerheart Digital GM Screen Types
 */

export type Tier = 0 | 1 | 2 | 3 | 4;

export type AdversaryType =
  | 'Minion'
  | 'Social'
  | 'Bruiser'
  | 'Skirmisher'
  | 'Leader'
  | 'Support'
  | 'Solo'
  | 'Horde';

export interface DamageThresholds {
  minor: number;
  major: number;
  severe: number;
}

export interface AdversaryAttack {
  name: string;
  modifier: number;
  range: 'Melee' | 'Very Close' | 'Close' | 'Far' | 'Very Far';
  damage: string; // e.g., "1d8+2 Physical" or "2d10+4 Magick"
}

export interface AdversaryFeature {
  name: string;
  type: 'Passive' | 'Action' | 'Reaction' | 'Spend Fear';
  cost?: number; // Fear cost or stress cost
  description: string;
}

export interface Adversary {
  id: string;
  name: string;
  tier: Tier;
  type: AdversaryType;
  difficulty: number;
  evasion: number;
  armor: number;
  hp: number;
  stress: number;
  thresholds: DamageThresholds;
  attacks: AdversaryAttack[];
  motives: string[];
  features: AdversaryFeature[];
  description?: string;
  experiences?: string[];
  isCustom?: boolean;
}

export interface EnvironmentHazard {
  name: string;
  tier: Tier;
  difficulty: number;
  description: string;
  impendingDangers: string[];
  countdownClocks: { name: string; maxSegments: number; currentSegments: number }[];
  fearMoves: { name: string; cost: number; effect: string }[];
}

export interface EnvironmentCard {
  id: string;
  name: string;
  tier: Tier;
  category: 'Wilderness' | 'Dungeon' | 'Urban' | 'Mystic' | 'Coastal' | 'Planar';
  difficulty: number;
  description: string;
  impendingDangers: string[];
  features: string[];
  fearMoves: { name: string; cost: number; effect: string }[];
  clocks: { name: string; segments: number; current: number }[];
}

export type Condition =
  | 'Vulnerable'
  | 'Restrained'
  | 'Dazed'
  | 'Hidden'
  | 'Weakened'
  | 'Silenced'
  | 'Impaired';

export interface Experience {
  name: string;
  value: number;
}

export type DomainName =
  | 'Arcana'
  | 'Blade'
  | 'Bone'
  | 'Codex'
  | 'Grace'
  | 'Midnight'
  | 'Sage'
  | 'Splendor'
  | 'Valor';

export interface DomainCard {
  id: string;
  name: string;
  domain: DomainName;
  level: number;
  type: 'Ability' | 'Spell' | 'Grimoire' | 'Transformation';
  hopeCost?: number;
  recallCost?: number;
  description: string;
  effectDetails?: string;
}

export interface ClassDefinition {
  id: string;
  name: string;
  domains: [DomainName, DomainName];
  classFeature: { name: string; description: string };
  hopeFeature: { name: string; description: string };
  evasionBase: number;
  subclasses: string[];
}

export interface AncestryDefinition {
  id: string;
  name: string;
  featureName: string;
  description: string;
}

export interface CommunityDefinition {
  id: string;
  name: string;
  featureName: string;
  description: string;
}

export interface DomainCardRef {
  name: string;
  domain: string;
  level: number;
  description: string;
}

export interface PlayerCharacter {
  id: string;
  name: string;
  ancestry: string;
  community: string;
  class: string;
  subclass: string;
  level: number;
  agility: number;
  strength: number;
  finesse: number;
  instinct: number;
  presence: number;
  knowledge: number;
  evasion: number;
  armor: number;
  maxArmorSlots: number;
  currentArmorSlots: number;
  maxHp: number;
  currentHp: number;
  maxStress: number;
  currentStress: number;
  hope: number;
  maxHope: number;
  thresholds: DamageThresholds;
  conditions: Condition[];
  experiences: Experience[];
  domainCards: DomainCardRef[];
  notes?: string;
  spotlightCount: number; // times acted in current scene
  avatarColor?: string;
}

export interface CombatParticipant {
  id: string; // unique instance ID
  adversaryId: string;
  name: string;
  tier: Tier;
  type: AdversaryType;
  difficulty: number;
  evasion: number;
  armor: number;
  maxHp: number;
  currentHp: number;
  maxStress: number;
  currentStress: number;
  thresholds: DamageThresholds;
  attacks: AdversaryAttack[];
  features: AdversaryFeature[];
  conditions: Condition[];
  minionCount?: number; // for minions/hordes
  maxMinionCount?: number;
  notes?: string;
  isActive?: boolean;
}

export interface CountdownClock {
  id: string;
  name: string;
  maxSegments: 4 | 6 | 8 | 10 | 12;
  currentSegments: number;
  type: 'Threat' | 'Progress' | 'Environment' | 'Custom';
  notes?: string;
}

export interface DualityRollResult {
  id: string;
  timestamp: string;
  roller: string;
  hopeValue: number;
  fearValue: number;
  modifier: number;
  total: number;
  isCritical: boolean;
  outcome: 'Success with Hope' | 'Success with Fear' | 'Failure with Hope' | 'Failure with Fear' | 'Critical Success';
  targetDifficulty?: number;
  notes?: string;
}

export interface RuleSection {
  id: string;
  title: string;
  category: 'Combat' | 'Fear & Hope' | 'Damage & Health' | 'Adversaries' | 'Environments' | 'Conditions' | 'Rests & Healing' | 'Classes & Domains';
  summary: string;
  details: string[];
  bulletPoints?: string[];
}

export interface EncounterTemplate {
  name: string;
  tier: Tier;
  difficulty: 'Easy' | 'Standard' | 'Hard' | 'Deadly';
  description: string;
  adversaryConfigs: { adversaryId: string; count: number }[];
  environmentId?: string;
}

export type WidgetType =
  | 'fear-action-tracker'
  | 'duality-roller'
  | 'player-roster'
  | 'encounter-tracker'
  | 'active-environment'
  | 'threat-clocks'
  | 'adversary-library'
  | 'domain-deck'
  | 'gm-scratchpad'
  | 'rules-quick-ref';

export interface DashboardWidgetConfig {
  id: string;
  type: WidgetType;
  title: string;
  colSpan?: 1 | 2 | 3;
  isCollapsed?: boolean;
  isVisible: boolean;
}

export interface SessionState {
  fearPool: number;
  maxFearPool: number;
  actionTokens: number;
  activeSceneName: string;
  activeEnvironment?: EnvironmentCard;
  combatParticipants: CombatParticipant[];
  clocks: CountdownClock[];
  rollHistory: DualityRollResult[];
  sessionNotes: string;
  isCombatActive: boolean;
}
