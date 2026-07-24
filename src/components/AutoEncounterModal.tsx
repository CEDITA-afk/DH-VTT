import React, { useState } from 'react';
import { Sparkles, Swords, X, Layers } from 'lucide-react';
import { Tier, SessionState } from '../types';
import { generateEncounter } from '../utils/encounterGenerator';
import { ENVIRONMENTS_DATA } from '../data/environments';
import { soundFX } from '../utils/audioSynth';

interface AutoEncounterModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionState: SessionState;
  setSessionState: React.Dispatch<React.SetStateAction<SessionState>>;
}

export const AutoEncounterModal: React.FC<AutoEncounterModalProps> = ({
  isOpen,
  onClose,
  sessionState,
  setSessionState,
}) => {
  const [partySize, setPartySize] = useState<number>(4);
  const [partyTier, setPartyTier] = useState<Tier>(1);
  const [difficulty, setDifficulty] = useState<'Easy' | 'Standard' | 'Hard' | 'Deadly'>('Standard');
  const [environmentId, setEnvironmentId] = useState<string>(ENVIRONMENTS_DATA[0].id);

  if (!isOpen) return null;

  const handleGenerateAndLoad = () => {
    const generated = generateEncounter({
      partySize,
      partyTier,
      difficulty,
      environmentId,
    });

    setSessionState((prev) => ({
      ...prev,
      activeSceneName: generated.title,
      activeEnvironment: generated.environment || prev.activeEnvironment,
      combatParticipants: generated.participants,
      fearPool: Math.max(prev.fearPool, generated.suggestedFearBudget),
      actionTokens: 0,
      isCombatActive: true,
    }));

    soundFX.playFearBoom();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-amber-900/40 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative space-y-5 animate-in fade-in zoom-in duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-100 p-1 rounded-lg bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 border-b border-slate-800 pb-3">
          <div className="p-2.5 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-800 text-purple-100 shadow-md">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-xl text-amber-200">
              Auto-Populate Daggerheart Encounter
            </h3>
            <p className="text-xs text-slate-400">
              Generates balanced adversary squads, leader synergy & environment hazards in 1-click.
            </p>
          </div>
        </div>

        <div className="space-y-4 text-xs">
          {/* Party Size & Tier */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Party Size (# Players)</label>
              <input
                type="number"
                min={1}
                max={8}
                value={partySize}
                onChange={(e) => setPartySize(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-200 font-mono font-bold"
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">Party Tier (0 to 4)</label>
              <select
                value={partyTier}
                onChange={(e) => setPartyTier(Number(e.target.value) as Tier)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-200"
              >
                <option value={0}>Tier 0 (Novice)</option>
                <option value={1}>Tier 1 (Adventurers)</option>
                <option value={2}>Tier 2 (Heroic)</option>
                <option value={3}>Tier 3 (Epic)</option>
                <option value={4}>Tier 4 (Legendary)</option>
              </select>
            </div>
          </div>

          {/* Difficulty */}
          <div>
            <label className="text-slate-300 font-semibold block mb-1">Desired Encounter Threat</label>
            <div className="grid grid-cols-4 gap-2">
              {(['Easy', 'Standard', 'Hard', 'Deadly'] as const).map((diff) => (
                <button
                  key={diff}
                  type="button"
                  onClick={() => setDifficulty(diff)}
                  className={`p-2 rounded-xl font-bold border transition ${
                    difficulty === diff
                      ? 'bg-amber-600 border-amber-400 text-slate-950 shadow'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          {/* Environment */}
          <div>
            <label className="text-slate-300 font-semibold block mb-1 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-purple-400" />
              <span>Environment Context</span>
            </label>
            <select
              value={environmentId}
              onChange={(e) => setEnvironmentId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-200"
            >
              {ENVIRONMENTS_DATA.map((env) => (
                <option key={env.id} value={env.id}>
                  {env.name} (Tier {env.tier} - {env.category})
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={handleGenerateAndLoad}
          className="w-full py-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-bold text-sm rounded-2xl shadow-lg transition flex items-center justify-center space-x-2"
        >
          <Swords className="w-4 h-4" />
          <span>BUILD & LAUNCH ENCOUNTER</span>
        </button>
      </div>
    </div>
  );
};
