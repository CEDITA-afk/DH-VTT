import React, { useState } from 'react';
import {
  Heart,
  Shield,
  Activity,
  Sparkles,
  Plus,
  Minus,
  AlertTriangle,
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
} from 'lucide-react';
import { PlayerCharacter, Condition } from '../types';
import { soundFX } from '../utils/audioSynth';
import { syncService } from '../utils/syncService';

interface PlayerDashboardProps {
  players: PlayerCharacter[];
  setPlayers: React.Dispatch<React.SetStateAction<PlayerCharacter[]>>;
  onActionTokenAdded: () => void;
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
  onActionTokenAdded,
}) => {
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});
  const [damageCalcTarget, setDamageCalcTarget] = useState<PlayerCharacter | null>(null);
  const [rawDamage, setRawDamage] = useState<number>(10);
  const [useArmor, setUseArmor] = useState<boolean>(true);
  const [showAddPlayer, setShowAddPlayer] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleExportCharacters = () => {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(players, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", "daggerheart_characters.json");
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      soundFX.playHopeChime();
      
      setNotification({ message: 'Characters exported successfully as daggerheart_characters.json', type: 'success' });
      setTimeout(() => setNotification(null), 4000);
    } catch (err) {
      setNotification({ message: 'Failed to export characters.', type: 'error' });
      setTimeout(() => setNotification(null), 4000);
    }
  };

  const handleImportCharacters = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (Array.isArray(parsed)) {
            const isValid = parsed.every(p => p.id && p.name);
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
        } catch (err) {
          setNotification({ message: 'Error parsing JSON file.', type: 'error' });
          setTimeout(() => setNotification(null), 4000);
        }
      };
    }
  };

  // New Player Form State
  const [newPlayer, setNewPlayer] = useState({
    name: '',
    ancestry: 'Human',
    class: 'Warrior',
    subclass: 'Slayer',
    agility: 1,
    strength: 2,
    finesse: 0,
    instinct: 0,
    presence: 0,
    knowledge: 0,
    evasion: 12,
    armor: 3,
    minor: 5,
    major: 10,
    severe: 15,
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
      // Toggle logic
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
    onActionTokenAdded();
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
      name: newPlayer.name,
      ancestry: newPlayer.ancestry,
      community: 'Adventurer',
      class: newPlayer.class,
      subclass: newPlayer.subclass,
      level: 1,
      agility: newPlayer.agility,
      strength: newPlayer.strength,
      finesse: newPlayer.finesse,
      instinct: newPlayer.instinct,
      presence: newPlayer.presence,
      knowledge: newPlayer.knowledge,
      evasion: newPlayer.evasion,
      armor: newPlayer.armor,
      maxArmorSlots: 4,
      currentArmorSlots: 4,
      maxHp: 6,
      currentHp: 6,
      maxStress: 6,
      currentStress: 0,
      hope: 3,
      maxHope: 6,
      thresholds: {
        minor: newPlayer.minor,
        major: newPlayer.major,
        severe: newPlayer.severe,
      },
      conditions: [],
      experiences: [{ name: `${newPlayer.class} Training`, value: 2 }],
      domainCards: [],
      spotlightCount: 0,
      avatarColor: 'from-amber-600 to-amber-800',
    };

    setPlayers((prev) => [...prev, created]);
    setShowAddPlayer(false);
  };

  const removePlayer = (id: string) => {
    setPlayers((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Notification Banner */}
      {notification && (
        <div className={`p-3 rounded-xl border text-xs font-semibold text-center transition-all duration-300 ${
          notification.type === 'success' 
            ? 'bg-emerald-950/60 border-emerald-500/30 text-emerald-300 shadow-md shadow-emerald-950/55' 
            : 'bg-red-950/60 border-red-500/30 text-red-300 shadow-md shadow-red-950/55'
        }`}>
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
            Real-time track of Hit Points, Stress, Armor Slots, Hope, Conditions, and Action Spotlight.
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
            onClick={() => setShowAddPlayer(true)}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-slate-950 text-xs font-semibold shadow transition"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Add Player</span>
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
                      } flex items-center justify-center font-serif font-bold text-lg text-slate-950 shadow-md`}
                    >
                      {pc.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-lg text-slate-100 leading-tight">
                        {pc.name}
                      </h3>
                      <p className="text-xs text-amber-400/90 font-medium">
                        Level {pc.level} {pc.ancestry} {pc.class} ({pc.subclass})
                      </p>
                    </div>
                  </div>

                  {/* Spotlight & Actions */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handlePlayerActed(pc.id)}
                      className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold transition"
                      title="Mark action taken (+1 Action Token to GM Tracker)"
                    >
                      <Activity className="w-3.5 h-3.5 text-amber-400" />
                      <span>Acted ({pc.spotlightCount})</span>
                    </button>

                    <button
                      onClick={() => setDamageCalcTarget(pc)}
                      className="p-1.5 rounded-lg bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-900/50 transition"
                      title="Calculate Incoming Damage vs Armor/Thresholds"
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
                            title={isMarked ? 'HP Marked (Damaged)' : 'HP Active'}
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
                          -1 Stress
                        </button>
                        <button
                          onClick={() => handleStressChange(pc.id, 1)}
                          className="px-1.5 py-0.5 text-xs bg-purple-900/60 hover:bg-purple-800 text-purple-200 rounded"
                        >
                          +1 Stress
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
                                ? 'bg-purple-600 border-purple-400 text-purple-950 shadow-sm'
                                : 'bg-slate-900 border-slate-800'
                            }`}
                            title={isFilled ? 'Stress Marked' : 'Stress Clear'}
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
                    <div className="flex items-center gap-1.5">
                      {Array.from({ length: pc.maxArmorSlots }).map((_, idx) => {
                        const isAvailable = idx < pc.currentArmorSlots;
                        return (
                          <button
                            key={idx}
                            onClick={() => handleArmorSlotToggle(pc.id, idx)}
                            className={`flex-1 h-5 rounded border transition ${
                              isAvailable
                                ? 'bg-amber-600/80 border-amber-400 text-amber-950 shadow-sm'
                                : 'bg-slate-900 border-slate-800 opacity-40'
                            }`}
                            title={isAvailable ? 'Armor Slot Ready' : 'Armor Slot Used'}
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Thresholds Display Bar */}
                <div className="mt-3 grid grid-cols-3 gap-1 bg-slate-950/80 p-2 rounded-xl border border-slate-800 text-center text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Minor</span>
                    <span className="font-bold text-amber-200">{pc.thresholds.minor}+</span>
                  </div>
                  <div className="border-x border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Major</span>
                    <span className="font-bold text-amber-300">{pc.thresholds.major}+</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Severe</span>
                    <span className="font-bold text-red-400">{pc.thresholds.severe}+</span>
                  </div>
                </div>

                {/* Conditions Toggles */}
                <div className="mt-3">
                  <div className="text-[11px] font-semibold text-slate-400 mb-1.5 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-amber-400" />
                    <span>Conditions:</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {ALL_CONDITIONS.map((cond) => {
                      const isActive = pc.conditions.includes(cond);
                      return (
                        <button
                          key={cond}
                          onClick={() => toggleCondition(pc.id, cond)}
                          className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border transition ${
                            isActive
                              ? 'bg-red-500/20 text-red-300 border-red-500/50 shadow-sm'
                              : 'bg-slate-950/60 text-slate-500 border-slate-800 hover:text-slate-300'
                          }`}
                        >
                          {cond}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Expandable Section: Experiences & Traits */}
              <div className="mt-4 pt-3 border-t border-slate-800">
                <button
                  onClick={() => toggleExpand(pc.id)}
                  className="w-full flex items-center justify-between text-xs text-amber-400/80 hover:text-amber-300 transition"
                >
                  <span className="font-semibold flex items-center gap-1">
                    <Award className="w-3.5 h-3.5" />
                    <span>Experiences & Domain Details</span>
                  </span>
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {isExpanded && (
                  <div className="mt-3 space-y-3 text-xs bg-slate-950 p-3 rounded-xl border border-slate-800">
                    {/* Traits */}
                    <div>
                      <span className="font-semibold text-slate-300 block mb-1">Attribute Traits:</span>
                      <div className="grid grid-cols-6 gap-1 text-center font-mono">
                        <div className="bg-slate-900 p-1 rounded border border-slate-800">
                          <span className="text-[9px] text-slate-500 block">AGI</span>
                          <span className="text-amber-300">{pc.agility >= 0 ? `+${pc.agility}` : pc.agility}</span>
                        </div>
                        <div className="bg-slate-900 p-1 rounded border border-slate-800">
                          <span className="text-[9px] text-slate-500 block">STR</span>
                          <span className="text-amber-300">{pc.strength >= 0 ? `+${pc.strength}` : pc.strength}</span>
                        </div>
                        <div className="bg-slate-900 p-1 rounded border border-slate-800">
                          <span className="text-[9px] text-slate-500 block">FIN</span>
                          <span className="text-amber-300">{pc.finesse >= 0 ? `+${pc.finesse}` : pc.finesse}</span>
                        </div>
                        <div className="bg-slate-900 p-1 rounded border border-slate-800">
                          <span className="text-[9px] text-slate-500 block">INS</span>
                          <span className="text-amber-300">{pc.instinct >= 0 ? `+${pc.instinct}` : pc.instinct}</span>
                        </div>
                        <div className="bg-slate-900 p-1 rounded border border-slate-800">
                          <span className="text-[9px] text-slate-500 block">PRE</span>
                          <span className="text-amber-300">{pc.presence >= 0 ? `+${pc.presence}` : pc.presence}</span>
                        </div>
                        <div className="bg-slate-900 p-1 rounded border border-slate-800">
                          <span className="text-[9px] text-slate-500 block">KNO</span>
                          <span className="text-amber-300">{pc.knowledge >= 0 ? `+${pc.knowledge}` : pc.knowledge}</span>
                        </div>
                      </div>
                    </div>

                    {/* Experiences */}
                    <div>
                      <span className="font-semibold text-slate-300 block mb-1">Experiences:</span>
                      <div className="space-y-1">
                        {pc.experiences.map((exp, i) => (
                          <div key={i} className="flex justify-between text-slate-400 bg-slate-900 px-2 py-1 rounded">
                            <span>{exp.name}</span>
                            <span className="text-amber-300 font-mono font-bold">+{exp.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Domain Cards */}
                    {pc.domainCards.length > 0 && (
                      <div>
                        <span className="font-semibold text-slate-300 block mb-1">Domain Loadout:</span>
                        <div className="space-y-1.5">
                          {pc.domainCards.map((dc, i) => (
                            <div key={i} className="bg-slate-900 p-2 rounded border border-slate-800">
                              <div className="flex justify-between font-bold text-amber-300">
                                <span>{dc.name}</span>
                                <span className="text-[10px] uppercase text-purple-400">{dc.domain}</span>
                              </div>
                              <p className="text-[11px] text-slate-400 mt-0.5">{dc.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end pt-1">
                      <button
                        onClick={() => removePlayer(pc.id)}
                        className="text-[11px] text-red-400 hover:text-red-300 flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Remove Character</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Damage Calculator Modal */}
      {damageCalcTarget && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-serif font-bold text-lg text-amber-200 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-amber-400" />
              <span>Deal Damage to {damageCalcTarget.name}</span>
            </h3>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Raw Damage Amount
                </label>
                <input
                  type="number"
                  value={rawDamage}
                  onChange={(e) => setRawDamage(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-base font-mono font-bold text-amber-300 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="useArmor"
                  checked={useArmor}
                  onChange={(e) => setUseArmor(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-950 text-amber-500 focus:ring-amber-500"
                />
                <label htmlFor="useArmor" className="text-xs text-slate-300">
                  Mark 1 Armor Slot to reduce damage by Armor Score (-{damageCalcTarget.armor})
                </label>
              </div>

              {/* Calculation Preview */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1 text-xs">
                {(() => {
                  let eff = rawDamage;
                  if (useArmor && damageCalcTarget.currentArmorSlots > 0 && damageCalcTarget.armor > 0) {
                    eff = Math.max(0, rawDamage - damageCalcTarget.armor);
                  }
                  let hpMark = 0;
                  if (eff >= damageCalcTarget.thresholds.severe) hpMark = 3;
                  else if (eff >= damageCalcTarget.thresholds.major) hpMark = 2;
                  else if (eff >= damageCalcTarget.thresholds.minor) hpMark = 1;

                  return (
                    <>
                      <div className="flex justify-between text-slate-400">
                        <span>Raw Damage:</span>
                        <span className="font-mono text-slate-200">{rawDamage}</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Armor Subtraction:</span>
                        <span className="font-mono text-amber-300">
                          {useArmor ? `-${damageCalcTarget.armor}` : '0'}
                        </span>
                      </div>
                      <div className="flex justify-between font-bold text-slate-200 border-t border-slate-800 pt-1">
                        <span>Effective Damage:</span>
                        <span className="font-mono text-cyan-300">{eff}</span>
                      </div>
                      <div className="flex justify-between font-bold text-red-400 border-t border-slate-800 pt-1">
                        <span>HP Boxes to Mark:</span>
                        <span className="font-mono text-lg">{hpMark} HP</span>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => setDamageCalcTarget(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={applyCalculatedDamage}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-xs font-semibold text-white shadow"
              >
                Apply Damage
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Custom Player Modal */}
      {showAddPlayer && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCreatePlayer}
            className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <h3 className="font-serif font-bold text-lg text-amber-200 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-amber-400" />
              <span>Add New Hero to Party Roster</span>
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Character Name</label>
                <input
                  type="text"
                  required
                  value={newPlayer.name}
                  onChange={(e) => setNewPlayer({ ...newPlayer, name: e.target.value })}
                  placeholder="e.g. Thorin Oakshield"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Ancestry</label>
                <input
                  type="text"
                  value={newPlayer.ancestry}
                  onChange={(e) => setNewPlayer({ ...newPlayer, ancestry: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Class</label>
                <input
                  type="text"
                  value={newPlayer.class}
                  onChange={(e) => setNewPlayer({ ...newPlayer, class: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Subclass</label>
                <input
                  type="text"
                  value={newPlayer.subclass}
                  onChange={(e) => setNewPlayer({ ...newPlayer, subclass: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Evasion</label>
                <input
                  type="number"
                  value={newPlayer.evasion}
                  onChange={(e) => setNewPlayer({ ...newPlayer, evasion: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Armor Score</label>
                <input
                  type="number"
                  value={newPlayer.armor}
                  onChange={(e) => setNewPlayer({ ...newPlayer, armor: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Minor Threshold</label>
                <input
                  type="number"
                  value={newPlayer.minor}
                  onChange={(e) => setNewPlayer({ ...newPlayer, minor: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Major Threshold</label>
                <input
                  type="number"
                  value={newPlayer.major}
                  onChange={(e) => setNewPlayer({ ...newPlayer, major: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Severe Threshold</label>
                <input
                  type="number"
                  value={newPlayer.severe}
                  onChange={(e) => setNewPlayer({ ...newPlayer, severe: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3">
              <button
                type="button"
                onClick={() => setShowAddPlayer(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-xs font-semibold text-slate-950 shadow"
              >
                Add Character
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
