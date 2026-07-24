import React, { useState } from 'react';
import { Layers, Search, Check, Skull, Clock, AlertCircle } from 'lucide-react';
import { ENVIRONMENTS_DATA } from '../data/environments';
import { EnvironmentCard } from '../types';
import { soundFX } from '../utils/audioSynth';

interface EnvironmentLibraryProps {
  activeEnvironment?: EnvironmentCard;
  onSelectActiveEnvironment: (env: EnvironmentCard) => void;
}

export const EnvironmentLibrary: React.FC<EnvironmentLibraryProps> = ({
  activeEnvironment,
  onSelectActiveEnvironment,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredEnvironments = ENVIRONMENTS_DATA.filter((env) => {
    const matchesSearch =
      env.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      env.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === 'all' || env.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleSelect = (env: EnvironmentCard) => {
    onSelectActiveEnvironment(env);
    soundFX.playClockTick();
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 shadow-md space-y-4">
        <div>
          <h2 className="font-serif font-bold text-xl text-amber-200 flex items-center gap-2">
            <Layers className="w-5 h-5 text-purple-400" />
            <span>Daggerheart Environment Cards & Scenes</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Set active environment cards with impending dangers, fear move triggers, and environmental clocks.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search environments..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
          >
            <option value="all">All Categories</option>
            <option value="Wilderness">Wilderness</option>
            <option value="Dungeon">Dungeon</option>
            <option value="Mystic">Mystic</option>
            <option value="Planar">Planar</option>
          </select>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredEnvironments.map((env) => {
          const isActive = activeEnvironment?.id === env.id;

          return (
            <div
              key={env.id}
              className={`bg-slate-900/90 border rounded-2xl p-5 shadow-lg space-y-4 transition ${
                isActive
                  ? 'border-purple-500 bg-purple-950/20 ring-1 ring-purple-500/50'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-purple-900/80 text-purple-200 rounded">
                      Tier {env.tier} {env.category}
                    </span>
                    <span className="text-xs font-mono font-bold text-amber-300">
                      DC {env.difficulty}
                    </span>
                  </div>
                  <h3 className="font-serif font-bold text-lg text-slate-100 mt-1">
                    {env.name}
                  </h3>
                </div>

                <button
                  onClick={() => handleSelect(env)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition shadow ${
                    isActive
                      ? 'bg-purple-600 text-white cursor-default'
                      : 'bg-purple-900/60 hover:bg-purple-800 text-purple-200 border border-purple-700/50'
                  }`}
                >
                  {isActive ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Active Scene</span>
                    </>
                  ) : (
                    <span>Set Active Scene</span>
                  )}
                </button>
              </div>

              <p className="text-xs text-slate-300 italic bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                "{env.description}"
              </p>

              {/* Impending Dangers */}
              <div className="space-y-1">
                <span className="text-xs font-bold text-amber-300 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Impending Dangers:
                </span>
                <ul className="list-disc list-inside text-xs text-slate-400 space-y-0.5">
                  {env.impendingDangers.map((danger, i) => (
                    <li key={i}>{danger}</li>
                  ))}
                </ul>
              </div>

              {/* Fear Moves */}
              <div className="space-y-1.5 pt-2 border-t border-slate-800">
                <span className="text-xs font-bold text-purple-300 flex items-center gap-1">
                  <Skull className="w-3.5 h-3.5" />
                  Spend Fear Environment Moves:
                </span>
                <div className="space-y-1.5">
                  {env.fearMoves.map((fm, i) => (
                    <div key={i} className="bg-slate-950 p-2 rounded-xl border border-slate-800 text-xs">
                      <div className="font-bold text-purple-200">
                        {fm.name} <span className="text-amber-400">({fm.cost} Fear)</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">{fm.effect}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Environmental Clocks */}
              {env.clocks.length > 0 && (
                <div className="space-y-1 pt-2 border-t border-slate-800">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    Built-in Threat Clocks:
                  </span>
                  <div className="flex flex-wrap gap-2 text-xs">
                    {env.clocks.map((c, i) => (
                      <span
                        key={i}
                        className="bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 text-slate-300 font-medium"
                      >
                        {c.name}: {c.segments} Segments
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
