import React, { useState } from 'react';
import {
  Clock,
  Plus,
  Trash2,
  FileText,
  Gift,
  Sparkles,
  Check,
  RotateCcw,
} from 'lucide-react';
import { CountdownClock, SessionState } from '../types';
import { soundFX } from '../utils/audioSynth';
import { DAGGERHEART_ROLLTABLES } from '../data/rollTablesData';

interface SessionNotesAndClocksProps {
  sessionState: SessionState;
  setSessionState: React.Dispatch<React.SetStateAction<SessionState>>;
}

const SAMPLE_LOOT = [
  'Amulet of the Sunken Citadel (+1 Armor Slot)',
  'Potion of Hopeful Valor (Restores 2 Hope instantly)',
  'Phoenix Feather Scroll (Clears 3 Stress on target)',
  'Ring of Evasion (+1 Evasion Score)',
  'Ancient Runed Shortsword (1d8+2 Physical + 1d4 Void)',
  'Elixir of Natural Grace (Clears all Conditions)',
  'Bag of 150 Golden Crowns',
  'Griffin Talon Dagger (Advantage on Sneak Attacks)',
];

export const SessionNotesAndClocks: React.FC<SessionNotesAndClocksProps> = ({
  sessionState,
  setSessionState,
}) => {
  const [newClockName, setNewClockName] = useState('');
  const [newClockSegments, setNewClockSegments] = useState<4 | 6 | 8 | 10 | 12>(6);
  const [generatedLoot, setGeneratedLoot] = useState<string[]>([]);

  const handleClockSegmentClick = (clockId: string, segmentIdx: number) => {
    setSessionState((prev) => ({
      ...prev,
      clocks: prev.clocks.map((c) => {
        if (c.id !== clockId) return c;
        const nextCurrent = segmentIdx + 1 === c.currentSegments ? segmentIdx : segmentIdx + 1;
        soundFX.playClockTick();
        return { ...c, currentSegments: nextCurrent };
      }),
    }));
  };

  const handleAddClock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClockName.trim()) return;

    const clock: CountdownClock = {
      id: 'clock-' + Date.now(),
      name: newClockName,
      maxSegments: newClockSegments,
      currentSegments: 0,
      type: 'Threat',
    };

    setSessionState((prev) => ({
      ...prev,
      clocks: [...prev.clocks, clock],
    }));

    setNewClockName('');
  };

  const handleRemoveClock = (id: string) => {
    setSessionState((prev) => ({
      ...prev,
      clocks: prev.clocks.filter((c) => c.id !== id),
    }));
  };

  const handleNotesChange = (val: string) => {
    setSessionState((prev) => ({ ...prev, sessionNotes: val }));
  };

  const generateLoot = () => {
    const lootTables = DAGGERHEART_ROLLTABLES.filter(t => t.category === 'Loot & Items');
    const items: string[] = [];
    
    lootTables.forEach(t => {
      const idx = Math.floor(Math.random() * t.results.length);
      items.push(`${t.title}: ${t.results[idx].text}`);
    });

    if (items.length < 3) {
      const shuffled = [...SAMPLE_LOOT].sort(() => 0.5 - Math.random());
      while (items.length < 3) {
        items.push(shuffled.pop() || '50 Gold Pieces');
      }
    }

    setGeneratedLoot(items.slice(0, 3));
    soundFX.playHopeChime();
  };

  return (
    <div className="space-y-6">
      {/* Clocks Section Header */}
      <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 shadow-md flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-serif font-bold text-xl text-amber-200 flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-400" />
            <span>Session Threat Clocks & Campaign Tracker</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Daggerheart countdown progress and threat clocks. Click segment wedges to mark progress!
          </p>
        </div>
      </div>

      {/* Clocks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {sessionState.clocks.map((clock) => {
          const isComplete = clock.currentSegments >= clock.maxSegments;

          return (
            <div
              key={clock.id}
              className={`bg-slate-900/90 border rounded-2xl p-5 shadow-lg space-y-4 relative transition ${
                isComplete
                  ? 'border-red-500 bg-red-950/20 ring-1 ring-red-500/50'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-amber-400 px-2 py-0.5 bg-amber-950/60 border border-amber-800/60 rounded">
                    {clock.maxSegments}-Segment Clock
                  </span>
                  <h3 className="font-serif font-bold text-base text-slate-100 mt-1">
                    {clock.name}
                  </h3>
                </div>

                <button
                  onClick={() => handleRemoveClock(clock.id)}
                  className="text-slate-500 hover:text-red-400 p-1"
                  title="Delete clock"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Circular / Block Progress Segments */}
              <div className="flex items-center justify-center py-2">
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 w-full">
                  {Array.from({ length: clock.maxSegments }).map((_, idx) => {
                    const isFilled = idx < clock.currentSegments;

                    return (
                      <button
                        key={idx}
                        onClick={() => handleClockSegmentClick(clock.id, idx)}
                        className={`h-10 rounded-xl border font-mono font-bold text-xs transition flex items-center justify-center shadow-sm ${
                          isFilled
                            ? 'bg-gradient-to-br from-amber-500 to-amber-700 border-amber-400 text-slate-950 shadow-amber-500/30'
                            : 'bg-slate-950 border-slate-800 text-slate-600 hover:border-slate-700'
                        }`}
                        title={`Segment ${idx + 1}`}
                      >
                        {isFilled ? '✓' : idx + 1}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-800 pt-2">
                <span>
                  Progress: {clock.currentSegments} / {clock.maxSegments}
                </span>
                {isComplete && (
                  <span className="text-red-400 font-bold uppercase animate-pulse">
                    Threat Triggered!
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {/* Add Custom Clock Box */}
        <form
          onSubmit={handleAddClock}
          className="bg-slate-900/50 border border-dashed border-slate-800 rounded-2xl p-5 space-y-3 flex flex-col justify-between"
        >
          <div>
            <h4 className="font-serif font-bold text-sm text-slate-200 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-amber-400" />
              <span>Create New Countdown Clock</span>
            </h4>
            <div className="space-y-2 mt-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Clock Name</label>
                <input
                  type="text"
                  required
                  value={newClockName}
                  onChange={(e) => setNewClockName(e.target.value)}
                  placeholder="e.g. Castle Collapse or Ritual Complete"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-slate-200"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Max Segments</label>
                <select
                  value={newClockSegments}
                  onChange={(e) =>
                    setNewClockSegments(Number(e.target.value) as 4 | 6 | 8 | 10 | 12)
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-slate-200"
                >
                  <option value={4}>4 Segments (Short Threat)</option>
                  <option value={6}>6 Segments (Standard)</option>
                  <option value={8}>8 Segments (Long Countdown)</option>
                  <option value={10}>10 Segments</option>
                  <option value={12}>12 Segments (Major Campaign Event)</option>
                </select>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-amber-600 hover:bg-amber-500 font-bold text-xs text-slate-950 rounded-xl shadow transition"
          >
            Add Clock
          </button>
        </form>
      </div>

      {/* GM Scratchpad & Loot Generator Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Scratchpad */}
        <div className="md:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-bold text-base text-amber-200 flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-400" />
              <span>GM Campaign Scratchpad & Secret Notes</span>
            </h3>
            <span className="text-[10px] text-slate-500">Auto-saved to session</span>
          </div>

          <textarea
            value={sessionState.sessionNotes}
            onChange={(e) => handleNotesChange(e.target.value)}
            rows={7}
            placeholder="Write secret campaign clues, NPC motives, loot locations, or encounter notes here..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-mono leading-relaxed resize-none"
          />
        </div>

        {/* Loot Generator */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-serif font-bold text-base text-amber-200 flex items-center gap-2">
              <Gift className="w-4 h-4 text-amber-400" />
              <span>Random Treasure Generator</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Roll quick Daggerheart treasure and domain magic items for player rewards.
            </p>

            {generatedLoot.length > 0 && (
              <div className="mt-3 space-y-1.5 bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
                {generatedLoot.map((item, idx) => (
                  <div key={idx} className="flex items-start space-x-2 text-slate-300">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={generateLoot}
            className="w-full py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow transition flex items-center justify-center space-x-1.5"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate 3 Loot Rewards</span>
          </button>
        </div>
      </div>
    </div>
  );
};
