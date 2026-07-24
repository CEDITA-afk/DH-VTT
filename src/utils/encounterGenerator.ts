import { ADVERSARIES_DATA } from '../data/adversaries';
import { ENVIRONMENTS_DATA } from '../data/environments';
import { CombatParticipant, Tier, EnvironmentCard } from '../types';

export interface EncounterGeneratorOptions {
  partySize: number;
  partyTier: Tier;
  difficulty: 'Easy' | 'Standard' | 'Hard' | 'Deadly';
  environmentId?: string;
  themeKeyword?: string;
}

export interface GeneratedEncounter {
  title: string;
  participants: CombatParticipant[];
  environment?: EnvironmentCard;
  suggestedFearBudget: number;
  tacticalNotes: string;
}

export function generateEncounter(options: EncounterGeneratorOptions): GeneratedEncounter {
  const { partySize, partyTier, difficulty, environmentId } = options;

  // Filter adversaries by tier
  const tierAdversaries = ADVERSARIES_DATA.filter((a) => a.tier <= partyTier);
  const exactTier = tierAdversaries.filter((a) => a.tier === partyTier);
  const candidates = exactTier.length > 0 ? exactTier : tierAdversaries;

  const participants: CombatParticipant[] = [];

  // Pick Leaders / Solos / Bruisers
  const leaders = candidates.filter((a) => a.type === 'Leader' || a.type === 'Solo');
  const bruisers = candidates.filter((a) => a.type === 'Bruiser');
  const skirmishers = candidates.filter((a) => a.type === 'Skirmisher' || a.type === 'Support');
  const minions = candidates.filter((a) => a.type === 'Minion' || a.type === 'Horde');

  let title = `${difficulty} Tier ${partyTier} Encounter`;

  if (difficulty === 'Easy') {
    const main = skirmishers[0] || bruisers[0] || candidates[0];
    if (main) {
      participants.push(createParticipantInstance(main, '1'));
    }
    const minionTemplate = minions[0] || candidates[1] || main;
    if (minionTemplate) {
      const minionGroup = createParticipantInstance(minionTemplate, 'Minions Group');
      minionGroup.minionCount = partySize * 2;
      minionGroup.maxMinionCount = partySize * 2;
      minionGroup.name = `${minionTemplate.name} Squad (${minionGroup.minionCount}x)`;
      participants.push(minionGroup);
    }
    title = `Skirmish: ${main?.name || 'Guards'} & Squad`;
  } else if (difficulty === 'Standard') {
    const leaderTemplate = leaders[0] || bruisers[0] || candidates[0];
    if (leaderTemplate) {
      participants.push(createParticipantInstance(leaderTemplate, 'Leader'));
    }
    const skirmisherTemplate = skirmishers[0] || candidates[1] || leaderTemplate;
    if (skirmisherTemplate) {
      participants.push(createParticipantInstance(skirmisherTemplate, 'A'));
      participants.push(createParticipantInstance(skirmisherTemplate, 'B'));
    }
    const minionTemplate = minions[0];
    if (minionTemplate) {
      const minionGroup = createParticipantInstance(minionTemplate, 'Squad');
      minionGroup.minionCount = partySize * 3;
      minionGroup.maxMinionCount = partySize * 3;
      minionGroup.name = `${minionTemplate.name} Swarm (${minionGroup.minionCount}x)`;
      participants.push(minionGroup);
    }
    title = `Combat: ${leaderTemplate?.name || 'Chief'} & Cadre`;
  } else if (difficulty === 'Hard') {
    const soloOrLeader = leaders[0] || bruisers[0] || candidates[0];
    if (soloOrLeader) {
      participants.push(createParticipantInstance(soloOrLeader, 'Alpha'));
    }
    const secondaryBruiser = bruisers[0] || skirmishers[0];
    if (secondaryBruiser) {
      participants.push(createParticipantInstance(secondaryBruiser, 'Vanguard A'));
      participants.push(createParticipantInstance(secondaryBruiser, 'Vanguard B'));
    }
    const minionTemplate = minions[0];
    if (minionTemplate) {
      const minionGroup = createParticipantInstance(minionTemplate, 'Horde');
      minionGroup.minionCount = partySize * 4;
      minionGroup.maxMinionCount = partySize * 4;
      minionGroup.name = `${minionTemplate.name} Horde (${minionGroup.minionCount}x)`;
      participants.push(minionGroup);
    }
    title = `High Threat: ${soloOrLeader?.name || 'Warlord'} Assault`;
  } else {
    // Deadly
    const apex = candidates.find((a) => a.type === 'Solo') || leaders[0] || candidates[0];
    if (apex) {
      participants.push(createParticipantInstance(apex, 'Boss'));
    }
    const eliteSupport = skirmishers[0] || bruisers[0];
    if (eliteSupport) {
      participants.push(createParticipantInstance(eliteSupport, 'Lieutenant 1'));
      participants.push(createParticipantInstance(eliteSupport, 'Lieutenant 2'));
    }
    title = `Climax Encounter: ${apex?.name || 'Ancient Threat'} Sovereign`;
  }

  const env = ENVIRONMENTS_DATA.find((e) => e.id === environmentId) || ENVIRONMENTS_DATA[0];

  const suggestedFear = difficulty === 'Easy' ? 2 : difficulty === 'Standard' ? 3 : difficulty === 'Hard' ? 4 : 6;

  const tacticalNotes = `Focus on keeping ${participants[0]?.name || 'Adversaries'} pressure high. Use minion squads to generate action tokens and soak player hits. Spend Fear when players roll with Fear to trigger environment moves!`;

  return {
    title,
    participants,
    environment: env,
    suggestedFearBudget: suggestedFear,
    tacticalNotes,
  };
}

export function createParticipantInstance(template: typeof ADVERSARIES_DATA[0], suffix = '1'): CombatParticipant {
  return {
    id: `part-${template.id}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    adversaryId: template.id,
    name: `${template.name} #${suffix}`,
    tier: template.tier,
    type: template.type,
    difficulty: template.difficulty,
    evasion: template.evasion,
    armor: template.armor,
    maxHp: template.hp,
    currentHp: template.hp,
    maxStress: template.stress,
    currentStress: 0,
    thresholds: { ...template.thresholds },
    attacks: template.attacks.map((a) => ({ ...a })),
    features: template.features.map((f) => ({ ...f })),
    conditions: [],
    minionCount: template.type === 'Minion' ? 6 : undefined,
    maxMinionCount: template.type === 'Minion' ? 6 : undefined,
    isActive: true,
  };
}
