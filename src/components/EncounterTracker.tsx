import React, { useState } from 'react';
import {
  Swords,
  Skull,
  Shield,
  Heart,
  Zap,
  Flame,
  Dices,
  Layers,
  Plus,
  Minus,
  Trash2,
  AlertCircle,
  Sparkles,
  Calculator,
} from 'lucide-react';
import { CombatParticipant, SessionState } from '../types';
import { soundFX } from '../utils/audioSynth';

interface EncounterTrackerProps {
  sessionState: SessionState;
  setSessionState: React.Dispatch<React.SetStateAction<SessionState>>;
  onOpenDiceRollerWithConfig: (rollerName: string, modifier: number) => void;
  onOpenAutoEncounter: () => void;
}

export const EncounterTracker: React.FC<EncounterTrackerProps> = ({
  sessionState,
  setSessionState,
  onOpenDiceRollerWithConfig,
  onOpenAutoEncounter,
}) => {
  const [selectedAttackRoll, setSelectedAttackRoll] = useState<{
    adversaryName: string;
    attackName: string;
    modifier: number;
    damage: string;
    rollResult?: number;
  } | null>(null);

  const participants = sessionState.combatParticipants;
  const env = sessionState.activeEnvironment;

  const updateParticipant = (id: string, updater: (p: CombatParticipant) => CombatParticipant) => {
    setSessionState((prev) => ({
      ...prev,
      combatParticipants: prev.combatParticipants.map((p) => (p.id === id ? updater(p) : p)),
    }));
  };

  const handleHpChange = (id: string, delta: number) => {
    updateParticipant(id, (p) => {
      const nextHp = Math.max(0, Math.min(p.maxHp, p.currentHp + delta));
      if (delta < 0) soundFX.playDamageHit();
      return { ...p, currentHp: nextHp };
    });
  };

  const handleMinionCountChange = (id: string, delta: number) => {
    updateParticipant(id, (p) => {
      if (p.minionCount === undefined || p.maxMinionCount === undefined) return p;
      const nextCount = Math.max(0, Math.min(p.maxMinionCount, p.minionCount + delta));
      if (delta < 0) soundFX.playDamageHit();
      return { ...p, minionCount: nextCount };
    });
  };

  const handleStressChange = (id: string, delta: number) => {
    updateParticipant(id, (p) => {
      const nextStress = Math.max(0, Math.min(p.maxStress, p.currentStress + delta));
      return { ...p, currentStress: nextStress };
    });
  };

  const removeParticipant = (id: string) => {
    setSessionState((prev) => ({
      ...prev,
      combatParticipants: prev.combatParticipants.filter((p) => p.id !== id),
    }));
  };

  const clearAllCombat = () => {
    setSessionState((prev) => ({ ...prev, combatParticipants: [], actionTokens: 0 }));
  };

  const handleSpendFearMove = (cost: number, featureName: string) => {
    if (sessionState.fearPool < cost) {
      alert(`Not enough Fear in pool! Need ${cost} Fear, have ${sessionState.fearPool}.`);
      return;
    }
    setSessionState((prev) => ({
      ...prev,
      fearPool: Math.max(0, prev.fearPool - cost),
    }));
    soundFX.playFearBoom();
  };

  const triggerAttackRoll = (adversaryName: string, attackName: string, modifier: number, damage: string) => {
    const d20 = Math.floor(Math.random() * 20) + 1;
    const total = d20 + modifier;
    setSelectedAttackRoll({
      adversaryName,
      attackName,
      modifier,
      damage,
      rollResult: total,
    });
    soundFX.playDiceRoll();
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 p-4 rounded-2xl border border-slate-800 shadow-md">
        <div>
          <h2 className="font-serif font-bold text-xl text-amber-200 flex items-center gap-2">
            <Swords className="w-5 h-5 text-amber-400" />
            <span>Active Combat Encounter Runner</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Initiative-less action combat! Spend Action Tokens from the tracker to trigger adversary turns.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onOpenAutoEncounter}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-slate-950 text-xs font-semibold shadow transition"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate New Encounter</span>
          </button>

          {participants.length > 0 && (
            <button
              onClick={clearAllCombat}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-900/50 text-xs transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Combat</span>
            </button>
          )}
        </div>
      </div>

      {/* Active Scene Environment Header Box */}
      {env && (
        <div className="bg-gradient-to-r from-slate-900 via-purple-950/40 to-slate-900 p-4 rounded-2xl border border-purple-900/40 shadow-lg">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-purple-900/40 border border-purple-700/50 text-purple-300">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-purple-400 tracking-wider">
                  Active Scene Environment (Tier {env.tier})
                </span>
                <h3 className="font-serif font-bold text-lg text-slate-100">{env.name}</h3>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-400 block">Environment DC</span>
              <span className="font-mono text-base font-bold text-amber-300">{env.difficulty}</span>
            </div>
          </div>

          {/* Fear Moves Bar */}
          <div className="mt-3 pt-3 border-t border-purple-900/30 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-purple-300">Environment Fear Moves:</span>
            {env.fearMoves.map((fm, i) => (
              <button
                key={i}
                onClick={() => handleSpendFearMove(fm.cost, fm.name)}
                className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-purple-900/60 hover:bg-purple-800 text-purple-200 border border-purple-700/50 text-xs font-medium transition"
                title={fm.effect}
              >
                <Skull className="w-3 h-3 text-purple-400" />
                <span>
                  {fm.name} ({fm.cost} Fear)
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Active Adversaries Combat List */}
      {participants.length === 0 ? (
        <div className="bg-slate-900/50 border border-dashed border-slate-800 rounded-2xl p-10 text-center space-y-3">
          <Swords className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="font-serif font-bold text-lg text-slate-300">No Active Encounter Running</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Use the Auto-Build Encounter generator or browse the Adversary Library to populate foes into active combat.
          </p>
          <button
            onClick={onOpenAutoEncounter}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-semibold text-xs rounded-xl shadow transition inline-flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate Encounter Now</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {participants.map((p) => {
            return (
              <div
                key={p.id}
                className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4 hover:border-slate-700 transition"
              >
                {/* Adversary Title Bar */}
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-red-950 text-red-300 border border-red-800/80 rounded">
                        Tier {p.tier} {p.type}
                      </span>
                      <h3 className="font-serif font-bold text-lg text-slate-100">{p.name}</h3>
                    </div>
                  </div>

                  {/* Core Stats Badge Row */}
                  <div className="flex items-center space-x-3 text-xs bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Diff (DC)</span>
                      <span className="font-mono font-bold text-amber-300">{p.difficulty}</span>
                    </div>
                    <div className="border-x border-slate-800 px-3">
                      <span className="text-[10px] text-slate-500 block">Evasion</span>
                      <span className="font-mono font-bold text-cyan-300">{p.evasion}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Armor</span>
                      <span className="font-mono font-bold text-amber-200">{p.armor}</span>
                    </div>
                    <button
                      onClick={() => removeParticipant(p.id)}
                      className="ml-2 text-slate-500 hover:text-red-400 p-1"
                      title="Remove from combat"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* HP / Minion Squad Tracker */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  {/* Standard HP or Minion Count */}
                  {p.minionCount !== undefined ? (
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-bold text-red-300 flex items-center gap-1">
                          <Skull className="w-3.5 h-3.5 text-red-400" />
                          Minion Squad Active ({p.minionCount}/{p.maxMinionCount})
                        </span>
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => handleMinionCountChange(p.id, -1)}
                            className="px-2 py-0.5 text-xs bg-red-950 text-red-200 hover:bg-red-900 rounded"
                          >
                            -1 Minion
                          </button>
                          <button
                            onClick={() => handleMinionCountChange(p.id, 1)}
                            className="px-2 py-0.5 text-xs bg-slate-800 text-slate-300 hover:bg-slate-700 rounded"
                          >
                            +1 Minion
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: p.maxMinionCount || 6 }).map((_, idx) => {
                          const isAlive = idx < (p.minionCount || 0);
                          return (
                            <div
                              key={idx}
                              className={`flex-1 h-4 rounded transition ${
                                isAlive ? 'bg-red-600 shadow-sm shadow-red-900/50' : 'bg-slate-900 opacity-30'
                              }`}
                            />
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-bold text-red-300 flex items-center gap-1">
                          <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
                          Hit Points ({p.currentHp}/{p.maxHp})
                        </span>
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => handleHpChange(p.id, -1)}
                            className="px-2 py-0.5 text-xs bg-slate-800 text-slate-300 hover:bg-slate-700 rounded"
                          >
                            -1 HP
                          </button>
                          <button
                            onClick={() => handleHpChange(p.id, 1)}
                            className="px-2 py-0.5 text-xs bg-red-900/60 text-red-200 hover:bg-red-800 rounded"
                          >
                            +1 HP
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: p.maxHp }).map((_, idx) => {
                          const isFilled = idx < p.currentHp;
                          return (
                            <button
                              key={idx}
                              onClick={() =>
                                updateParticipant(p.id, (prev) => ({
                                  ...prev,
                                  currentHp: isFilled ? idx : idx + 1,
                                }))
                              }
                              className={`flex-1 h-5 rounded border transition ${
                                isFilled
                                  ? 'bg-red-600 border-red-500 text-white'
                                  : 'bg-slate-900 border-slate-800'
                              }`}
                            />
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Stress */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold text-purple-300 flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5 text-purple-400" />
                        Stress ({p.currentStress}/{p.maxStress})
                      </span>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleStressChange(p.id, -1)}
                          className="px-2 py-0.5 text-xs bg-slate-800 text-slate-300 hover:bg-slate-700 rounded"
                        >
                          -1
                        </button>
                        <button
                          onClick={() => handleStressChange(p.id, 1)}
                          className="px-2 py-0.5 text-xs bg-purple-900/60 text-purple-200 hover:bg-purple-800 rounded"
                        >
                          +1
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: p.maxStress }).map((_, idx) => {
                        const isFilled = idx < p.currentStress;
                        return (
                          <div
                            key={idx}
                            className={`flex-1 h-5 rounded border transition ${
                              isFilled
                                ? 'bg-purple-600 border-purple-400'
                                : 'bg-slate-900 border-slate-800'
                            }`}
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Thresholds Display */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs bg-slate-950 p-2 rounded-xl border border-slate-800">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Minor Threshold</span>
                    <span className="font-bold text-amber-200">{p.thresholds.minor}+</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Major Threshold</span>
                    <span className="font-bold text-amber-300">{p.thresholds.major}+</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Severe Threshold</span>
                    <span className="font-bold text-red-400">{p.thresholds.severe}+</span>
                  </div>
                </div>

                {/* Attacks & Actions */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-300 block">Attacks & Action Moves:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {p.attacks.map((atk, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between"
                      >
                        <div>
                          <div className="font-bold text-xs text-amber-300">{atk.name}</div>
                          <div className="text-[11px] text-slate-400">
                            Range: {atk.range} | Damage: <span className="text-red-300 font-mono font-semibold">{atk.damage}</span>
                          </div>
                        </div>

                        <button
                          onClick={() => triggerAttackRoll(p.name, atk.name, atk.modifier, atk.damage)}
                          className="px-2.5 py-1 bg-amber-600/90 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-lg shadow flex items-center gap-1 transition"
                        >
                          <Dices className="w-3.5 h-3.5" />
                          <span>Roll (+{atk.modifier})</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Special Features & Spend Fear Moves */}
                {p.features.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <span className="text-xs font-bold text-slate-300 block">Special Features & Reactions:</span>
                    <div className="space-y-1.5">
                      {p.features.map((feat, idx) => (
                        <div
                          key={idx}
                          className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 flex flex-wrap items-center justify-between gap-2"
                        >
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <span className="text-[10px] uppercase font-bold text-purple-400 px-1.5 py-0.2 bg-purple-950 border border-purple-800 rounded">
                                {feat.type}
                              </span>
                              <span className="font-bold text-xs text-slate-200">{feat.name}</span>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-1">{feat.description}</p>
                          </div>

                          {feat.cost ? (
                            <button
                              onClick={() => handleSpendFearMove(feat.cost || 1, feat.name)}
                              className="px-3 py-1 bg-purple-900/80 hover:bg-purple-800 text-purple-200 font-bold text-xs rounded-lg border border-purple-700/50 flex items-center gap-1 transition"
                            >
                              <Skull className="w-3.5 h-3.5 text-purple-400" />
                              <span>Spend {feat.cost} Fear</span>
                            </button>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Attack Roll Result Overlay Modal */}
      {selectedAttackRoll && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 text-center">
            <h3 className="font-serif font-bold text-lg text-amber-200">
              {selectedAttackRoll.adversaryName} Attack Roll
            </h3>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="text-xs text-slate-400">{selectedAttackRoll.attackName}</div>
              <div className="font-mono text-3xl font-extrabold text-amber-400">
                {selectedAttackRoll.rollResult}
              </div>
              <div className="text-xs text-slate-400">
                1d20 + {selectedAttackRoll.modifier} vs Player Evasion
              </div>
              <div className="pt-2 border-t border-slate-800 text-xs font-bold text-red-400">
                Damage on Hit: {selectedAttackRoll.damage}
              </div>
            </div>

            <button
              onClick={() => setSelectedAttackRoll(null)}
              className="w-full py-2 rounded-xl bg-amber-600 hover:bg-amber-500 font-bold text-xs text-slate-950 shadow"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
