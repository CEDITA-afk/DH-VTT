import React, { useState } from 'react';
import {
  Heart,
  Shield,
  Activity,
  Sparkles,
  Plus,
  Minus,
  Flame,
  Award,
  ChevronDown,
  ChevronUp,
  UserPlus,
  Trash2,
  Calculator,
  RotateCcw,
  Download,
  Upload,
  Feather,
  BookOpen,
  Backpack,
  Users,
  Eye,
  Check,
} from 'lucide-react';
import { PlayerCharacter, Condition, DomainCardRef } from '../types';
import { soundFX } from '../utils/audioSynth';
import { syncService } from '../utils/syncService';
import { ANCESTRIES_DATA, COMMUNITIES_DATA, CLASSES_DATA, DOMAIN_CARDS_DATA } from '../data/domainsAndClasses';
import { SUBCLASSES_DATA, getSubclassesForClass, getSubclassByName } from '../data/subclassesData';
import { PlayerSheetModal } from './PlayerSheetModal';

interface PlayerDashboardProps {
  players: PlayerCharacter[];
  setPlayers: React.Dispatch<React.SetStateAction<PlayerCharacter[]>>;
}

const ALL_CONDITIONS: Condition[] = [
  'Vulnerable',
  'Restrained',
  'Dazed',
  'Hidden',
  'Weakened',
  'Silenced',
  'Impaired',
];

export const PlayerDashboard: React.FC<PlayerDashboardProps> = ({
  players,
  setPlayers,
}) => {
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});
  const [damageCalcTarget, setDamageCalcTarget] = useState<PlayerCharacter | null>(null);
  const [selectedSheetPlayer, setSelectedSheetPlayer] = useState<PlayerCharacter | null>(null);
  const [rawDamage, setRawDamage] = useState<number>(10);
  const [useArmor, setUseArmor] = useState<boolean>(true);
  const [showAddPlayer, setShowAddPlayer] = useState<boolean>(false);
  const [creationStep, setCreationStep] = useState<number>(1);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleExportCharacters = () => {
    try {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(players, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', 'daggerheart_characters.json');
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      soundFX.playHopeChime();

      setNotification({ message: 'Characters exported successfully as daggerheart_characters.json', type: 'success' });
      setTimeout(() => setNotification(null), 4000);
    } catch {
      setNotification({ message: 'Failed to export characters.', type: 'error' });
      setTimeout(() => setNotification(null), 4000);
    }
  };

  const handleImportCharacters = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], 'UTF-8');
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (Array.isArray(parsed)) {
            const isValid = parsed.every((p) => p.id && p.name);
            if (isValid) {
              setPlayers(parsed);
              soundFX.playHopeChime();
              setNotification({ message: `Successfully imported ${parsed.length} characters!`, type: 'success' });
              setTimeout(() => setNotification(null), 4000);
            } else {
              setNotification({ message: 'Invalid file format: Each character must have a name.', type: 'error' });
              setTimeout(() => setNotification(null), 4000);
            }
          } else {
            setNotification({ message: 'Invalid file: JSON must be an array of characters.', type: 'error' });
            setTimeout(() => setNotification(null), 4000);
          }
        } catch {
          setNotification({ message: 'Error parsing JSON file.', type: 'error' });
          setTimeout(() => setNotification(null), 4000);
        }
      };
    }
  };

  // Comprehensive 7-Section New Player Form State
  const [newPlayer, setNewPlayer] = useState({
    // Section 1: Heritage
    ancestry: 'Human',
    ancestryFeature: 'Versatile Ambition: Gain +1 Hope at the start of each session.',
    community: 'Wildborne',
    communityFeature: 'Savage Instincts: Gain +1 to Instinct checks and cannot be surprised.',
    
    // Section 2: Class and Subclass
    name: '',
    pronouns: 'they/them',
    class: 'Warrior',
    subclass: 'Slayer',
    classFeature: 'Battle Stance: Choose Aggressive Stance (+2 dmg) or Defensive Stance (+2 Evasion).',
    level: 1,

    // Section 3: Domain Cards
    domainCards: [
      { name: 'Whirlwind Strike', domain: 'Blade', level: 1, description: 'Strike all enemies in Melee range for physical damage.' },
      { name: 'Unstoppable Bulwark', domain: 'Valor', level: 1, description: 'Gain +2 Armor Score and resistance to physical strikes.' }
    ] as DomainCardRef[],

    // Section 4: Equipment and Inventory
    equipment: ['Greatsword (1d10+2)', 'Steel Breastplate', 'Health Potion x2'],
    inventory: 'Torches x3, Rations x5, 50ft Hemp Rope, Tinderbox',
    gold: 25,

    // Section 5: Traits and Statistics
    agility: 1,
    strength: 2,
    finesse: 0,
    instinct: 1,
    presence: 0,
    knowledge: 0,
    evasion: 11,
    armor: 4,
    maxArmorSlots: 4,
    currentArmorSlots: 4,
    maxHp: 6,
    maxStress: 6,
    maxHope: 6,
    minor: 5,
    major: 10,
    severe: 15,

    // Section 6: Experiences and Description
    experiences: [
      { name: 'Veteran Mercenary', value: 2 },
      { name: 'Swamp Survivalist', value: 1 }
    ],
    description: 'Tall, broad-shouldered warrior with weather-beaten leather armor and a scarred shield.',

    // Section 7: Background and Connections
    background: 'Former guard captain who left the garrison after witnessing corrupt officials.',
    connections: 'Owes a life-debt to Lyra for repairing core gemstone; distrusts guild wizards.'
  });

  const toggleExpand = (id: string) => {
    setExpandedCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const updatePlayer = (id: string, updater: (p: PlayerCharacter) => PlayerCharacter) => {
    setPlayers((prev) => {
      const next = prev.map((p) => (p.id === id ? updater(p) : p));
      const updatedPlayer = next.find((p) => p.id === id);
      if (updatedPlayer) {
        syncService.broadcast('PLAYER_UPDATE', updatedPlayer);
      }
      return next;
    });
  };

  const handleHpChange = (id: string, delta: number) => {
    updatePlayer(id, (p) => {
      const nextHp = Math.max(0, Math.min(p.maxHp, p.currentHp + delta));
      if (delta < 0) soundFX.playDamageHit();
      return { ...p, currentHp: nextHp };
    });
  };

  const handleStressChange = (id: string, delta: number) => {
    updatePlayer(id, (p) => {
      const nextStress = Math.max(0, Math.min(p.maxStress, p.currentStress + delta));
      return { ...p, currentStress: nextStress };
    });
  };

  const handleArmorSlotToggle = (id: string, index: number) => {
    updatePlayer(id, (p) => {
      const slots = p.currentArmorSlots;
      const nextSlots = index < slots ? index : index + 1;
      return { ...p, currentArmorSlots: nextSlots };
    });
  };

  const handleHopeChange = (id: string, delta: number) => {
    updatePlayer(id, (p) => {
      const nextHope = Math.max(0, Math.min(p.maxHope, p.hope + delta));
      if (delta > 0) soundFX.playHopeChime();
      return { ...p, hope: nextHope };
    });
  };

  const toggleCondition = (id: string, condition: Condition) => {
    updatePlayer(id, (p) => {
      const exists = p.conditions.includes(condition);
      const nextConds = exists
        ? p.conditions.filter((c) => c !== condition)
        : [...p.conditions, condition];
      return { ...p, conditions: nextConds };
    });
  };

  const handlePlayerActed = (id: string) => {
    updatePlayer(id, (p) => ({ ...p, spotlightCount: p.spotlightCount + 1 }));
    soundFX.playClockTick();
  };

  const resetAllSpotlights = () => {
    setPlayers((prev) => prev.map((p) => ({ ...p, spotlightCount: 0 })));
  };

  const applyCalculatedDamage = () => {
    if (!damageCalcTarget) return;
    let effectiveDamage = rawDamage;
    let slotsUsed = 0;

    if (useArmor && damageCalcTarget.currentArmorSlots > 0 && damageCalcTarget.armor > 0) {
      effectiveDamage = Math.max(0, rawDamage - damageCalcTarget.armor);
      slotsUsed = 1;
    }

    let hpToMark = 0;
    if (effectiveDamage >= damageCalcTarget.thresholds.severe) {
      hpToMark = 3;
    } else if (effectiveDamage >= damageCalcTarget.thresholds.major) {
      hpToMark = 2;
    } else if (effectiveDamage >= damageCalcTarget.thresholds.minor) {
      hpToMark = 1;
    }

    updatePlayer(damageCalcTarget.id, (p) => ({
      ...p,
      currentHp: Math.max(0, p.currentHp - hpToMark),
      currentArmorSlots: Math.max(0, p.currentArmorSlots - slotsUsed),
    }));

    soundFX.playDamageHit();
    setDamageCalcTarget(null);
  };

  const handleCreatePlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlayer.name.trim()) return;

    const created: PlayerCharacter = {
      id: 'pc-' + Date.now(),
      name: newPlayer.name.trim(),
      pronouns: newPlayer.pronouns,
      ancestry: newPlayer.ancestry,
      ancestryFeature: newPlayer.ancestryFeature,
      community: newPlayer.community,
      communityFeature: newPlayer.communityFeature,
      class: newPlayer.class,
      subclass: newPlayer.subclass,
      classFeature: newPlayer.classFeature,
      level: newPlayer.level,
      agility: newPlayer.agility,
      strength: newPlayer.strength,
      finesse: newPlayer.finesse,
      instinct: newPlayer.instinct,
      presence: newPlayer.presence,
      knowledge: newPlayer.knowledge,
      evasion: newPlayer.evasion,
      armor: newPlayer.armor,
      maxArmorSlots: newPlayer.maxArmorSlots,
      currentArmorSlots: newPlayer.maxArmorSlots,
      maxHp: newPlayer.maxHp,
      currentHp: newPlayer.maxHp,
      maxStress: newPlayer.maxStress,
      currentStress: 0,
      hope: 3,
      maxHope: newPlayer.maxHope,
      thresholds: {
        minor: newPlayer.minor,
        major: newPlayer.major,
        severe: newPlayer.severe,
      },
      conditions: [],
      experiences: newPlayer.experiences,
      domainCards: newPlayer.domainCards,
      equipment: newPlayer.equipment,
      inventory: newPlayer.inventory,
      gold: newPlayer.gold,
      description: newPlayer.description,
      background: newPlayer.background,
      connections: newPlayer.connections,
      spotlightCount: 0,
      avatarColor: 'from-amber-600 to-amber-800',
    };

    setPlayers((prev) => [...prev, created]);
    setShowAddPlayer(false);
    setCreationStep(1);
    soundFX.playHopeChime();
  };

  const removePlayer = (id: string) => {
    setPlayers((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Notification Banner */}
      {notification && (
        <div
          className={`p-3 rounded-xl border text-xs font-semibold text-center transition-all duration-300 ${
            notification.type === 'success'
              ? 'bg-emerald-950/60 border-emerald-500/30 text-emerald-300 shadow-md shadow-emerald-950/55'
              : 'bg-red-950/60 border-red-500/30 text-red-300 shadow-md shadow-red-950/55'
          }`}
        >
          {notification.message}
        </div>
      )}

      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 p-4 rounded-2xl border border-slate-800 shadow-md">
        <div>
          <h2 className="font-serif font-bold text-xl text-amber-200 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <span>Party Roster & Live Status Dashboard</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time tracking of Hit Points, Stress, Armor, Domain Cards, and Full Character Sheets.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportCharacters}
            accept=".json"
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 border border-slate-700 transition"
            title="Import characters from a JSON file"
          >
            <Upload className="w-3.5 h-3.5 text-amber-400" />
            <span>Import JSON</span>
          </button>

          <button
            onClick={handleExportCharacters}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 border border-slate-700 transition"
            title="Export characters to a JSON file"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>Export JSON</span>
          </button>

          <button
            onClick={resetAllSpotlights}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 border border-slate-700 transition"
            title="Reset scene turn spotlight counters"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            <span>Reset Spotlight</span>
          </button>

          <button
            onClick={() => {
              setCreationStep(1);
              setShowAddPlayer(true);
            }}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-slate-950 text-xs font-bold shadow transition"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Create Character</span>
          </button>
        </div>
      </div>

      {/* Character Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5">
        {players.map((pc) => {
          const isExpanded = !!expandedCards[pc.id];

          return (
            <div
              key={pc.id}
              className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg relative flex flex-col justify-between hover:border-slate-700 transition"
            >
              {/* Card Header */}
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-11 h-11 rounded-xl bg-gradient-to-br ${
                        pc.avatarColor || 'from-amber-600 to-amber-800'
                      } flex items-center justify-center font-serif font-bold text-lg text-slate-950 shadow-md cursor-pointer`}
                      onClick={() => setSelectedSheetPlayer(pc)}
                    >
                      {pc.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3
                          onClick={() => setSelectedSheetPlayer(pc)}
                          className="font-serif font-bold text-lg text-slate-100 leading-tight hover:text-amber-300 cursor-pointer transition"
                        >
                          {pc.name}
                        </h3>
                        {pc.pronouns && (
                          <span className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded font-mono">
                            {pc.pronouns}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-amber-400/90 font-medium">
                        Level {pc.level} {pc.ancestry} {pc.class} ({pc.subclass})
                      </p>
                    </div>
                  </div>

                  {/* Top Right Quick Actions */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setSelectedSheetPlayer(pc)}
                      className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold transition"
                      title="Open Full 7-Section Player Sheet"
                    >
                      <Eye className="w-3.5 h-3.5 text-amber-400" />
                      <span>Full Sheet</span>
                    </button>

                    <button
                      onClick={() => handlePlayerActed(pc.id)}
                      className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold transition"
                      title="Mark turn action taken"
                    >
                      <Activity className="w-3.5 h-3.5 text-amber-400" />
                      <span>Acted ({pc.spotlightCount})</span>
                    </button>

                    <button
                      onClick={() => setDamageCalcTarget(pc)}
                      className="p-1.5 rounded-lg bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-900/50 transition"
                      title="Calculate Incoming Damage"
                    >
                      <Calculator className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Main Stats Row: Evasion, Armor, Hope */}
                <div className="grid grid-cols-3 gap-2 my-4">
                  <div className="bg-slate-950/70 p-2 rounded-xl border border-slate-800 text-center">
                    <div className="text-[10px] uppercase font-bold text-slate-400">Evasion</div>
                    <div className="text-base font-bold font-mono text-cyan-300">{pc.evasion}</div>
                  </div>
                  <div className="bg-slate-950/70 p-2 rounded-xl border border-slate-800 text-center">
                    <div className="text-[10px] uppercase font-bold text-slate-400">Armor Score</div>
                    <div className="text-base font-bold font-mono text-amber-300">{pc.armor}</div>
                  </div>
                  <div className="bg-slate-950/70 p-2 rounded-xl border border-slate-800 text-center flex flex-col items-center justify-center">
                    <div className="text-[10px] uppercase font-bold text-slate-400">Hope</div>
                    <div className="flex items-center space-x-1 mt-0.5">
                      <button
                        onClick={() => handleHopeChange(pc.id, -1)}
                        className="w-4 h-4 rounded bg-slate-800 text-slate-300 flex items-center justify-center text-xs"
                      >
                        -
                      </button>
                      <span className="font-mono text-sm font-bold text-amber-400">
                        {pc.hope}/{pc.maxHope}
                      </span>
                      <button
                        onClick={() => handleHopeChange(pc.id, 1)}
                        className="w-4 h-4 rounded bg-amber-700 text-amber-100 flex items-center justify-center text-xs"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                {/* HP & Stress Trackers */}
                <div className="space-y-3 bg-slate-950/50 p-3 rounded-xl border border-slate-800/80">
                  {/* Hit Points */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold text-red-300 flex items-center gap-1">
                        <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
                        Hit Points ({pc.currentHp}/{pc.maxHp})
                      </span>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleHpChange(pc.id, -1)}
                          className="px-1.5 py-0.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded"
                        >
                          -1 HP
                        </button>
                        <button
                          onClick={() => handleHpChange(pc.id, 1)}
                          className="px-1.5 py-0.5 text-xs bg-red-900/60 hover:bg-red-800 text-red-200 rounded"
                        >
                          +1 HP
                        </button>
                      </div>
                    </div>
                    {/* HP Hitboxes */}
                    <div className="flex items-center gap-1.5">
                      {Array.from({ length: pc.maxHp }).map((_, idx) => {
                        const isMarked = idx >= pc.currentHp;
                        return (
                          <button
                            key={idx}
                            onClick={() =>
                              updatePlayer(pc.id, (p) => ({
                                ...p,
                                currentHp: isMarked ? idx + 1 : idx,
                              }))
                            }
                            className={`flex-1 h-6 rounded-md border transition flex items-center justify-center text-[10px] font-bold ${
                              isMarked
                                ? 'bg-slate-900 border-slate-800 text-slate-600 line-through'
                                : 'bg-red-950/80 border-red-600/80 text-red-200 shadow-sm shadow-red-900/20'
                            }`}
                          >
                            {idx + 1}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Stress */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold text-purple-300 flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5 text-purple-400" />
                        Stress ({pc.currentStress}/{pc.maxStress})
                      </span>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleStressChange(pc.id, -1)}
                          className="px-1.5 py-0.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded"
                        >
                          -1
                        </button>
                        <button
                          onClick={() => handleStressChange(pc.id, 1)}
                          className="px-1.5 py-0.5 text-xs bg-purple-900/60 hover:bg-purple-800 text-purple-200 rounded"
                        >
                          +1
                        </button>
                      </div>
                    </div>
                    {/* Stress Checkboxes */}
                    <div className="flex items-center gap-1.5">
                      {Array.from({ length: pc.maxStress }).map((_, idx) => {
                        const isFilled = idx < pc.currentStress;
                        return (
                          <button
                            key={idx}
                            onClick={() =>
                              updatePlayer(pc.id, (p) => ({
                                ...p,
                                currentStress: isFilled ? idx : idx + 1,
                              }))
                            }
                            className={`flex-1 h-5 rounded border transition ${
                              isFilled
                                ? 'bg-purple-600 border-purple-500 shadow-sm'
                                : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                            }`}
                          />
                        );
                      })}
                    </div>
                  </div>

                  {/* Armor Slots */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold text-amber-300 flex items-center gap-1">
                        <Shield className="w-3.5 h-3.5 text-amber-400" />
                        Armor Slots ({pc.currentArmorSlots}/{pc.maxArmorSlots})
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {Array.from({ length: pc.maxArmorSlots }).map((_, idx) => {
                        const isAvailable = idx < pc.currentArmorSlots;
                        return (
                          <button
                            key={idx}
                            onClick={() => handleArmorSlotToggle(pc.id, idx)}
                            className={`flex-1 py-1 rounded border text-xs font-bold transition ${
                              isAvailable
                                ? 'bg-amber-950/80 border-amber-500/80 text-amber-200'
                                : 'bg-slate-950 border-slate-800 text-slate-600 line-through'
                            }`}
                          >
                            Slot {idx + 1}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Damage Thresholds & Active Conditions */}
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800">
                  <div className="flex items-center space-x-3 font-mono text-[11px]">
                    <span>Min: <strong className="text-amber-300">{pc.thresholds.minor}</strong></span>
                    <span>Maj: <strong className="text-amber-400">{pc.thresholds.major}</strong></span>
                    <span>Sev: <strong className="text-red-400">{pc.thresholds.severe}</strong></span>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {ALL_CONDITIONS.map((cond) => {
                      const isActive = pc.conditions.includes(cond);
                      return (
                        <button
                          key={cond}
                          onClick={() => toggleCondition(pc.id, cond)}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border transition ${
                            isActive
                              ? 'bg-red-500/20 text-red-300 border-red-500/50'
                              : 'bg-slate-900 text-slate-600 border-slate-800'
                          }`}
                        >
                          {cond}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Expandable Section for Quick 7-Section Overview */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-slate-800 space-y-3 text-xs text-slate-300">
                    <div className="grid grid-cols-2 gap-3 bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                      <div>
                        <span className="font-bold text-amber-300 block">Heritage:</span>
                        <p className="text-[11px] text-slate-400">{pc.ancestryFeature || 'Ancestral traits active.'}</p>
                      </div>
                      <div>
                        <span className="font-bold text-cyan-300 block">Community:</span>
                        <p className="text-[11px] text-slate-400">{pc.communityFeature || pc.community}</p>
                      </div>
                    </div>

                    <div>
                      <span className="font-bold text-purple-300 block mb-1">Equipped Domain Cards:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {pc.domainCards.map((c, i) => (
                          <span
                            key={i}
                            className="bg-purple-950/60 text-purple-200 border border-purple-800/60 px-2 py-0.5 rounded text-[11px] font-semibold"
                          >
                            {c.name} ({c.domain})
                          </span>
                        ))}
                      </div>
                    </div>

                    {pc.equipment && pc.equipment.length > 0 && (
                      <div>
                        <span className="font-bold text-slate-300 block mb-1">Equipment:</span>
                        <p className="text-[11px] text-slate-400">{pc.equipment.join(', ')}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Bottom Card Controls */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <button
                  onClick={() => toggleExpand(pc.id)}
                  className="flex items-center space-x-1 text-xs text-slate-400 hover:text-amber-300 transition"
                >
                  {isExpanded ? (
                    <>
                      <ChevronUp className="w-3.5 h-3.5" />
                      <span>Collapse Quick View</span>
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-3.5 h-3.5" />
                      <span>Quick Details</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => removePlayer(pc.id)}
                  className="text-slate-500 hover:text-red-400 text-xs flex items-center space-x-1 transition"
                  title="Remove hero from party"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Full Sheet Modal */}
      {selectedSheetPlayer && (
        <PlayerSheetModal
          player={selectedSheetPlayer}
          onClose={() => setSelectedSheetPlayer(null)}
          onUpdatePlayer={(updated) => {
            updatePlayer(updated.id, () => updated);
            setSelectedSheetPlayer(updated);
          }}
        />
      )}

      {/* Calculator Modal */}
      {damageCalcTarget && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-serif font-bold text-lg text-red-300 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-red-400" />
              <span>Calculate Damage for {damageCalcTarget.name}</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Raw Incoming Damage Amount</label>
                <input
                  type="number"
                  value={rawDamage}
                  onChange={(e) => setRawDamage(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-slate-100 font-mono text-base font-bold"
                />
              </div>

              <div className="flex items-center space-x-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                <input
                  type="checkbox"
                  id="useArmor"
                  checked={useArmor}
                  onChange={(e) => setUseArmor(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-0"
                />
                <label htmlFor="useArmor" className="text-slate-200 font-semibold cursor-pointer">
                  Spend 1 Armor Slot to subtract Armor Score (-{damageCalcTarget.armor} dmg)
                </label>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                <div className="text-[10px] uppercase font-bold text-slate-400">Calculated Impact:</div>
                {(() => {
                  let eff = rawDamage;
                  let slots = 0;
                  if (useArmor && damageCalcTarget.currentArmorSlots > 0 && damageCalcTarget.armor > 0) {
                    eff = Math.max(0, rawDamage - damageCalcTarget.armor);
                    slots = 1;
                  }
                  let hp = 0;
                  if (eff >= damageCalcTarget.thresholds.severe) hp = 3;
                  else if (eff >= damageCalcTarget.thresholds.major) hp = 2;
                  else if (eff >= damageCalcTarget.thresholds.minor) hp = 1;

                  return (
                    <div className="text-xs text-amber-300 font-semibold space-y-1">
                      <div>Effective Damage: <span className="font-mono">{eff}</span></div>
                      <div>HP Hitboxes Marked: <span className="font-mono text-red-400 font-bold">{hp} HP</span></div>
                      <div>Armor Slots Spent: <span className="font-mono text-amber-400">{slots} Slot</span></div>
                    </div>
                  );
                })()}
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => setDamageCalcTarget(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={applyCalculatedDamage}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-bold text-white shadow"
              >
                Apply Damage
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7-SECTION CHARACTER CREATION WIZARD MODAL */}
      {showAddPlayer && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
          <form
            onSubmit={handleCreatePlayer}
            className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-slate-100"
          >
            {/* Creation Header */}
            <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between shrink-0">
              <h3 className="font-serif font-bold text-lg text-amber-200 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-amber-400" />
                <span>Character Creator (7-Section Guided Builder)</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddPlayer(false)}
                className="text-slate-400 hover:text-slate-200 text-xs font-bold"
              >
                Cancel
              </button>
            </div>

            {/* Step Selector Tabs */}
            <div className="bg-slate-950/80 px-4 py-2 border-b border-slate-800 flex items-center space-x-1.5 overflow-x-auto scrollbar-thin scrollbar-thumb-amber-500/30 shrink-0">
              {[
                { step: 1, label: '1. Heritage', icon: Feather },
                { step: 2, label: '2. Class & Subclass', icon: Sparkles },
                { step: 3, label: '3. Domain Cards', icon: BookOpen },
                { step: 4, label: '4. Equipment', icon: Backpack },
                { step: 5, label: '5. Statistics', icon: Shield },
                { step: 6, label: '6. Experiences', icon: Award },
                { step: 7, label: '7. Background', icon: Users },
              ].map((s) => {
                const Icon = s.icon;
                const isActive = creationStep === s.step;
                return (
                  <button
                    key={s.step}
                    type="button"
                    onClick={() => setCreationStep(s.step)}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                      isActive
                        ? 'bg-amber-500 text-slate-950 shadow-md'
                        : 'text-slate-400 hover:text-amber-200 hover:bg-slate-900'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{s.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Creation Step Content */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">

              {/* Step 1: Heritage */}
              {creationStep === 1 && (
                <div className="space-y-4">
                  <h4 className="font-serif font-bold text-base text-amber-300">
                    Section 1: Heritage (Ancestry & Community)
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-slate-300 font-bold block mb-1">Select Ancestry</label>
                      <select
                        value={newPlayer.ancestry}
                        onChange={(e) => {
                          const chosen = ANCESTRIES_DATA.find((a) => a.name === e.target.value);
                          setNewPlayer((prev) => ({
                            ...prev,
                            ancestry: e.target.value,
                            ancestryFeature: chosen ? `${chosen.featureName}: ${chosen.description}` : prev.ancestryFeature,
                          }));
                        }}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100 font-semibold"
                      >
                        {ANCESTRIES_DATA.map((a) => (
                          <option key={a.id} value={a.name}>
                            {a.name} ({a.featureName})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-slate-300 font-bold block mb-1">Select Community</label>
                      <select
                        value={newPlayer.community}
                        onChange={(e) => {
                          const chosen = COMMUNITIES_DATA.find((c) => c.name === e.target.value);
                          setNewPlayer((prev) => ({
                            ...prev,
                            community: e.target.value,
                            communityFeature: chosen ? `${chosen.featureName}: ${chosen.description}` : prev.communityFeature,
                          }));
                        }}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100 font-semibold"
                      >
                        {COMMUNITIES_DATA.map((c) => (
                          <option key={c.id} value={c.name}>
                            {c.name} ({c.featureName})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-300 font-bold block mb-1">Ancestry Feature Details</label>
                    <textarea
                      rows={2}
                      value={newPlayer.ancestryFeature}
                      onChange={(e) => setNewPlayer({ ...newPlayer, ancestryFeature: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-slate-200"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 font-bold block mb-1">Community Feature Details</label>
                    <textarea
                      rows={2}
                      value={newPlayer.communityFeature}
                      onChange={(e) => setNewPlayer({ ...newPlayer, communityFeature: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-slate-200"
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Class & Subclass */}
              {creationStep === 2 && (
                <div className="space-y-4">
                  <h4 className="font-serif font-bold text-base text-amber-300">
                    Section 2: Class and Subclass Archetype
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-slate-300 font-bold block mb-1">Hero Name *</label>
                      <input
                        type="text"
                        required
                        value={newPlayer.name}
                        onChange={(e) => setNewPlayer({ ...newPlayer, name: e.target.value })}
                        placeholder="e.g. Valen Ironheart"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100 font-bold"
                      />
                    </div>

                    <div>
                      <label className="text-slate-300 font-bold block mb-1">Pronouns</label>
                      <input
                        type="text"
                        value={newPlayer.pronouns}
                        onChange={(e) => setNewPlayer({ ...newPlayer, pronouns: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100"
                      />
                    </div>

                    <div>
                      <label className="text-slate-300 font-bold block mb-1">Class Archetype</label>
                      <select
                        value={newPlayer.class}
                        onChange={(e) => {
                          const chosen = CLASSES_DATA.find((cls) => cls.name === e.target.value);
                          if (chosen) {
                            const availableSubs = getSubclassesForClass(chosen.name);
                            const firstSubName = availableSubs.length > 0 ? availableSubs[0].name : (chosen.subclasses[0] || 'Specialist');
                            setNewPlayer((prev) => ({
                              ...prev,
                              class: chosen.name,
                              subclass: firstSubName,
                              classFeature: `${chosen.classFeature.name}: ${chosen.classFeature.description}`,
                              evasion: chosen.evasionBase,
                            }));
                          }
                        }}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100 font-semibold"
                      >
                        {CLASSES_DATA.map((cls) => (
                          <option key={cls.id} value={cls.name}>
                            {cls.name} ({cls.domains.join(' & ')})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-slate-300 font-bold block mb-1">Subclass</label>
                      <select
                        value={newPlayer.subclass}
                        onChange={(e) => setNewPlayer({ ...newPlayer, subclass: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100 font-semibold"
                      >
                        {getSubclassesForClass(newPlayer.class).map((sub) => (
                          <option key={sub.id} value={sub.name}>
                            {sub.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-300 font-bold block mb-1">Class Primary Power / Feature</label>
                    <textarea
                      rows={2}
                      value={newPlayer.classFeature}
                      onChange={(e) => setNewPlayer({ ...newPlayer, classFeature: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-slate-200"
                    />
                  </div>

                  {/* Subclass Feature Preview Card */}
                  {(() => {
                    const activeSubclassDef = getSubclassByName(newPlayer.subclass);
                    if (!activeSubclassDef) return null;

                    return (
                      <div className="bg-gradient-to-br from-purple-950/60 to-slate-950 p-4 rounded-2xl border border-purple-500/40 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300 bg-purple-900/60 px-2.5 py-0.5 rounded-full border border-purple-500/40">
                            Subclass Feature • {activeSubclassDef.className} ({activeSubclassDef.name})
                          </span>
                        </div>

                        <p className="text-xs text-slate-300 italic leading-relaxed">
                          "{activeSubclassDef.description}"
                        </p>

                        <div className="space-y-2 pt-2 border-t border-purple-900/50">
                          <div className="bg-slate-900/90 p-2.5 rounded-xl border border-purple-900/40">
                            <span className="font-bold text-amber-300 block text-xs">
                              Foundation Feature: {activeSubclassDef.foundationFeature.name}
                            </span>
                            <p className="text-[11px] text-slate-300 leading-relaxed mt-0.5">
                              {activeSubclassDef.foundationFeature.description}
                            </p>
                          </div>

                          {activeSubclassDef.specializationFeature && (
                            <div className="bg-slate-900/90 p-2.5 rounded-xl border border-purple-900/40">
                              <span className="font-bold text-cyan-300 block text-xs">
                                Specialization Feature: {activeSubclassDef.specializationFeature.name}
                              </span>
                              <p className="text-[11px] text-slate-300 leading-relaxed mt-0.5">
                                {activeSubclassDef.specializationFeature.description}
                              </p>
                            </div>
                          )}

                          {activeSubclassDef.masteryFeature && (
                            <div className="bg-slate-900/90 p-2.5 rounded-xl border border-purple-900/40">
                              <span className="font-bold text-purple-300 block text-xs">
                                Mastery Feature: {activeSubclassDef.masteryFeature.name}
                              </span>
                              <p className="text-[11px] text-slate-300 leading-relaxed mt-0.5">
                                {activeSubclassDef.masteryFeature.description}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Step 3: Domain Cards */}
              {creationStep === 3 && (
                <div className="space-y-4">
                  <h4 className="font-serif font-bold text-base text-amber-300">
                    Section 3: Starting Domain Cards Loadout
                  </h4>

                  <p className="text-slate-400">Choose 2 starting Level 1 Domain Cards for your hero's vault:</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-1">
                    {DOMAIN_CARDS_DATA.map((card) => {
                      const isEquipped = newPlayer.domainCards.some((c) => c.name === card.name);
                      return (
                        <div
                          key={card.id}
                          className={`p-3 rounded-xl border flex flex-col justify-between transition ${
                            isEquipped
                              ? 'bg-purple-950/60 border-purple-500 text-purple-100'
                              : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          <div>
                            <div className="flex justify-between font-bold text-amber-300">
                              <span>{card.name}</span>
                              <span className="text-[10px] text-purple-400">{card.domain} Lvl {card.level}</span>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-1">{card.description}</p>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              if (isEquipped) {
                                setNewPlayer((prev) => ({
                                  ...prev,
                                  domainCards: prev.domainCards.filter((c) => c.name !== card.name),
                                }));
                              } else {
                                setNewPlayer((prev) => ({
                                  ...prev,
                                  domainCards: [
                                    ...prev.domainCards,
                                    { name: card.name, domain: card.domain, level: card.level, description: card.description },
                                  ],
                                }));
                              }
                            }}
                            className={`mt-2 py-1 rounded-lg font-bold text-[10px] text-center transition ${
                              isEquipped
                                ? 'bg-red-900/60 text-red-200 hover:bg-red-800'
                                : 'bg-amber-600 text-slate-950 hover:bg-amber-500'
                            }`}
                          >
                            {isEquipped ? 'Remove Card' : '+ Equip Domain Card'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Step 4: Equipment & Inventory */}
              {creationStep === 4 && (
                <div className="space-y-4">
                  <h4 className="font-serif font-bold text-base text-amber-300">
                    Section 4: Equipment, Weapons & Inventory
                  </h4>

                  <div>
                    <label className="text-slate-300 font-bold block mb-1">Starting Gold Currency</label>
                    <input
                      type="number"
                      value={newPlayer.gold}
                      onChange={(e) => setNewPlayer({ ...newPlayer, gold: Number(e.target.value) })}
                      className="w-32 bg-slate-950 border border-slate-700 rounded-xl p-2 text-amber-300 font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 font-bold block mb-1">Primary Weapons & Armor Items</label>
                    <input
                      type="text"
                      value={newPlayer.equipment.join(', ')}
                      onChange={(e) =>
                        setNewPlayer({
                          ...newPlayer,
                          equipment: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                        })
                      }
                      placeholder="e.g. Greatsword [1d10+2], Steel Plate, Health Potion"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 font-bold block mb-1">Inventory Satchel Items</label>
                    <textarea
                      rows={3}
                      value={newPlayer.inventory}
                      onChange={(e) => setNewPlayer({ ...newPlayer, inventory: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100"
                    />
                  </div>
                </div>
              )}

              {/* Step 5: Statistics */}
              {creationStep === 5 && (
                <div className="space-y-4">
                  <h4 className="font-serif font-bold text-base text-amber-300">
                    Section 5: Traits & Vital Statistics
                  </h4>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {[
                      { key: 'agility', label: 'Agility' },
                      { key: 'strength', label: 'Strength' },
                      { key: 'finesse', label: 'Finesse' },
                      { key: 'instinct', label: 'Instinct' },
                      { key: 'presence', label: 'Presence' },
                      { key: 'knowledge', label: 'Knowledge' },
                    ].map((t) => (
                      <div key={t.key} className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                        <label className="text-slate-400 font-bold block mb-1 uppercase text-[10px]">{t.label}</label>
                        <input
                          type="number"
                          value={(newPlayer as any)[t.key]}
                          onChange={(e) => setNewPlayer({ ...newPlayer, [t.key]: Number(e.target.value) })}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 font-mono font-bold text-amber-300 text-center text-sm"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
                    <div>
                      <label className="text-slate-300 font-bold block mb-1">Evasion</label>
                      <input
                        type="number"
                        value={newPlayer.evasion}
                        onChange={(e) => setNewPlayer({ ...newPlayer, evasion: Number(e.target.value) })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 font-mono text-cyan-300 font-bold"
                      />
                    </div>

                    <div>
                      <label className="text-slate-300 font-bold block mb-1">Armor Score</label>
                      <input
                        type="number"
                        value={newPlayer.armor}
                        onChange={(e) => setNewPlayer({ ...newPlayer, armor: Number(e.target.value) })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 font-mono text-amber-300 font-bold"
                      />
                    </div>

                    <div>
                      <label className="text-slate-300 font-bold block mb-1">Minor Threshold</label>
                      <input
                        type="number"
                        value={newPlayer.minor}
                        onChange={(e) => setNewPlayer({ ...newPlayer, minor: Number(e.target.value) })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 font-mono text-amber-300 font-bold"
                      />
                    </div>

                    <div>
                      <label className="text-slate-300 font-bold block mb-1">Severe Threshold</label>
                      <input
                        type="number"
                        value={newPlayer.severe}
                        onChange={(e) => setNewPlayer({ ...newPlayer, severe: Number(e.target.value) })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 font-mono text-red-400 font-bold"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 6: Experiences */}
              {creationStep === 6 && (
                <div className="space-y-4">
                  <h4 className="font-serif font-bold text-base text-amber-300">
                    Section 6: Experiences and Visual Description
                  </h4>

                  <div>
                    <label className="text-slate-300 font-bold block mb-1">Physical Appearance Description</label>
                    <textarea
                      rows={3}
                      value={newPlayer.description}
                      onChange={(e) => setNewPlayer({ ...newPlayer, description: e.target.value })}
                      placeholder="Hair, armor details, height, scars..."
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100"
                    />
                  </div>
                </div>
              )}

              {/* Step 7: Background & Connections */}
              {creationStep === 7 && (
                <div className="space-y-4">
                  <h4 className="font-serif font-bold text-base text-amber-300">
                    Section 7: Background Lore & Party Connections
                  </h4>

                  <div>
                    <label className="text-slate-300 font-bold block mb-1">Origin Story / Backstory</label>
                    <textarea
                      rows={3}
                      value={newPlayer.background}
                      onChange={(e) => setNewPlayer({ ...newPlayer, background: e.target.value })}
                      placeholder="Where did this hero grow up? What drives them?"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 font-bold block mb-1">Party Connections & Bonds</label>
                    <textarea
                      rows={3}
                      value={newPlayer.connections}
                      onChange={(e) => setNewPlayer({ ...newPlayer, connections: e.target.value })}
                      placeholder="e.g. Owes a debt to Lyra; childhood rival of Kaelen..."
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100"
                    />
                  </div>
                </div>
              )}

            </div>

            {/* Creation Footer Controls */}
            <div className="bg-slate-950 px-6 py-4 border-t border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex space-x-2">
                {creationStep > 1 && (
                  <button
                    type="button"
                    onClick={() => setCreationStep(creationStep - 1)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-semibold"
                  >
                    Previous
                  </button>
                )}
                {creationStep < 7 && (
                  <button
                    type="button"
                    onClick={() => setCreationStep(creationStep + 1)}
                    className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 text-xs font-bold"
                  >
                    Next Section
                  </button>
                )}
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition"
              >
                Complete Character Creation
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
