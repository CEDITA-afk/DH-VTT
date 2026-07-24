import React, { useState } from 'react';
import {
  Skull,
  Search,
  Plus,
  Shield,
  Heart,
  Swords,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from 'lucide-react';
import { ADVERSARIES_DATA } from '../data/adversaries';
import { Adversary, AdversaryType, Tier, CombatParticipant } from '../types';
import { createParticipantInstance } from '../utils/encounterGenerator';
import { soundFX } from '../utils/audioSynth';

interface AdversaryLibraryProps {
  onAddAdversaryToCombat: (participant: CombatParticipant) => void;
}

export const AdversaryLibrary: React.FC<AdversaryLibraryProps> = ({
  onAddAdversaryToCombat,
}) => {
  const [adversaries, setAdversaries] = useState<Adversary[]>(ADVERSARIES_DATA);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTier, setSelectedTier] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showCustomModal, setShowCustomModal] = useState(false);

  // Custom Adversary Form
  const [customAdv, setCustomAdv] = useState({
    name: '',
    tier: 1 as Tier,
    type: 'Bruiser' as AdversaryType,
    difficulty: 12,
    evasion: 11,
    armor: 2,
    hp: 5,
    stress: 3,
    minor: 5,
    major: 10,
    severe: 15,
    attackName: 'Melee Strike',
    attackMod: 3,
    attackDamage: '1d8+3 Physical',
  });

  const filteredAdversaries = adversaries.filter((adv) => {
    const matchesSearch =
      adv.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      adv.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      adv.type.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTier =
      selectedTier === 'all' || adv.tier === Number(selectedTier);

    const matchesType = selectedType === 'all' || adv.type === selectedType;

    return matchesSearch && matchesTier && matchesType;
  });

  const handleAdd = (adv: Adversary) => {
    const participant = createParticipantInstance(
      adv,
      String(Math.floor(Math.random() * 90 + 10))
    );
    onAddAdversaryToCombat(participant);
    soundFX.playClockTick();
  };

  const handleCreateCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customAdv.name.trim()) return;

    const created: Adversary = {
      id: 'custom-' + Date.now(),
      name: customAdv.name,
      tier: customAdv.tier,
      type: customAdv.type,
      difficulty: customAdv.difficulty,
      evasion: customAdv.evasion,
      armor: customAdv.armor,
      hp: customAdv.hp,
      stress: customAdv.stress,
      thresholds: {
        minor: customAdv.minor,
        major: customAdv.major,
        severe: customAdv.severe,
      },
      attacks: [
        {
          name: customAdv.attackName,
          modifier: customAdv.attackMod,
          range: 'Melee',
          damage: customAdv.attackDamage,
        },
      ],
      motives: ['Custom Motivations'],
      features: [],
      isCustom: true,
    };

    setAdversaries((prev) => [created, ...prev]);
    setShowCustomModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 shadow-md space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-serif font-bold text-xl text-amber-200 flex items-center gap-2">
              <Skull className="w-5 h-5 text-amber-400" />
              <span>Daggerheart Adversary Library</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Browse adversaries across Tier 0 to Tier 4, view stats & moves, or add to active combat.
            </p>
          </div>

          <button
            onClick={() => setShowCustomModal(true)}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-slate-950 font-semibold text-xs shadow transition"
          >
            <Plus className="w-4 h-4" />
            <span>Create Custom Adversary</span>
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search adversaries by name, motive..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Tier Filter */}
          <select
            value={selectedTier}
            onChange={(e) => setSelectedTier(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
          >
            <option value="all">All Tiers (0 to 4)</option>
            <option value="0">Tier 0 (Novice / Low Threat)</option>
            <option value="1">Tier 1 (Standard)</option>
            <option value="2">Tier 2 (Heroic)</option>
            <option value="3">Tier 3 (Epic)</option>
            <option value="4">Tier 4 (Legendary / Apex)</option>
          </select>

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
          >
            <option value="all">All Roles & Types</option>
            <option value="Bruiser">Bruiser</option>
            <option value="Skirmisher">Skirmisher</option>
            <option value="Leader">Leader</option>
            <option value="Minion">Minion</option>
            <option value="Solo">Solo</option>
            <option value="Support">Support</option>
            <option value="Horde">Horde</option>
            <option value="Social">Social</option>
          </select>
        </div>
      </div>

      {/* Adversaries Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAdversaries.map((adv) => {
          const isExpanded = expandedId === adv.id;

          return (
            <div
              key={adv.id}
              className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col justify-between hover:border-slate-700 transition"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-purple-950 text-purple-300 border border-purple-800 rounded">
                        Tier {adv.tier} {adv.type}
                      </span>
                      {adv.isCustom && (
                        <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.2 rounded">
                          Custom
                        </span>
                      )}
                    </div>
                    <h3 className="font-serif font-bold text-base text-slate-100 mt-1">
                      {adv.name}
                    </h3>
                  </div>

                  <button
                    onClick={() => handleAdd(adv)}
                    className="flex items-center space-x-1 px-2.5 py-1.5 bg-amber-600/90 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow transition"
                    title="Add to Active Encounter Runner"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>

                {/* Core Quick Stats */}
                <div className="grid grid-cols-4 gap-1.5 my-3 bg-slate-950 p-2 rounded-xl border border-slate-800 text-center text-xs">
                  <div>
                    <span className="text-[9px] text-slate-500 block">Diff DC</span>
                    <span className="font-mono font-bold text-amber-300">{adv.difficulty}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 block">Evasion</span>
                    <span className="font-mono font-bold text-cyan-300">{adv.evasion}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 block">Armor</span>
                    <span className="font-mono font-bold text-amber-200">{adv.armor}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 block">HP/Stress</span>
                    <span className="font-mono font-bold text-red-400">
                      {adv.hp}/{adv.stress}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-400 line-clamp-2">
                  {adv.description || 'Standard Daggerheart adversary foe.'}
                </p>
              </div>

              {/* Expand Toggle */}
              <div className="mt-3 pt-2 border-t border-slate-800">
                <button
                  onClick={() => setExpandedId(isExpanded ? null : adv.id)}
                  className="w-full flex items-center justify-between text-xs text-amber-400/80 hover:text-amber-300"
                >
                  <span className="font-semibold">View Attacks & Features</span>
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {isExpanded && (
                  <div className="mt-3 space-y-3 text-xs bg-slate-950 p-3 rounded-xl border border-slate-800">
                    {/* Thresholds */}
                    <div>
                      <span className="font-semibold text-slate-300 block mb-1">Damage Thresholds:</span>
                      <div className="flex gap-2 text-[11px] font-mono">
                        <span className="text-amber-200">Minor: {adv.thresholds.minor}+</span>
                        <span className="text-amber-300">Major: {adv.thresholds.major}+</span>
                        <span className="text-red-400">Severe: {adv.thresholds.severe}+</span>
                      </div>
                    </div>

                    {/* Attacks */}
                    <div>
                      <span className="font-semibold text-slate-300 block mb-1">Attacks:</span>
                      {adv.attacks.map((atk, i) => (
                        <div key={i} className="text-slate-300 bg-slate-900 p-1.5 rounded mb-1">
                          <span className="font-bold text-amber-300">{atk.name}</span> (+{atk.modifier} to hit, {atk.range}):{' '}
                          <span className="text-red-300 font-mono">{atk.damage}</span>
                        </div>
                      ))}
                    </div>

                    {/* Features */}
                    {adv.features.length > 0 && (
                      <div>
                        <span className="font-semibold text-slate-300 block mb-1">Special Features:</span>
                        {adv.features.map((feat, i) => (
                          <div key={i} className="text-slate-400 bg-slate-900 p-1.5 rounded mb-1">
                            <span className="font-bold text-purple-300">{feat.name}</span>{' '}
                            {feat.cost ? `(${feat.cost} Fear)` : ''}: {feat.description}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Motives */}
                    {adv.motives.length > 0 && (
                      <div>
                        <span className="font-semibold text-slate-300 block mb-0.5">Motives / Directives:</span>
                        <ul className="list-disc list-inside text-slate-400 space-y-0.5 text-[11px]">
                          {adv.motives.map((m, i) => (
                            <li key={i}>{m}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Custom Adversary Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateCustom}
            className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <h3 className="font-serif font-bold text-lg text-amber-200 flex items-center gap-2">
              <Plus className="w-5 h-5 text-amber-400" />
              <span>Create Custom Daggerheart Adversary</span>
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Adversary Name</label>
                <input
                  type="text"
                  required
                  value={customAdv.name}
                  onChange={(e) => setCustomAdv({ ...customAdv, name: e.target.value })}
                  placeholder="e.g. Shadow Drake"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Tier (0 to 4)</label>
                <select
                  value={customAdv.tier}
                  onChange={(e) =>
                    setCustomAdv({ ...customAdv, tier: Number(e.target.value) as Tier })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200"
                >
                  <option value={0}>Tier 0</option>
                  <option value={1}>Tier 1</option>
                  <option value={2}>Tier 2</option>
                  <option value={3}>Tier 3</option>
                  <option value={4}>Tier 4</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Role / Type</label>
                <select
                  value={customAdv.type}
                  onChange={(e) =>
                    setCustomAdv({ ...customAdv, type: e.target.value as AdversaryType })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200"
                >
                  <option value="Bruiser">Bruiser</option>
                  <option value="Skirmisher">Skirmisher</option>
                  <option value="Leader">Leader</option>
                  <option value="Minion">Minion</option>
                  <option value="Solo">Solo</option>
                  <option value="Support">Support</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Difficulty (DC)</label>
                <input
                  type="number"
                  value={customAdv.difficulty}
                  onChange={(e) =>
                    setCustomAdv({ ...customAdv, difficulty: Number(e.target.value) })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Evasion</label>
                <input
                  type="number"
                  value={customAdv.evasion}
                  onChange={(e) =>
                    setCustomAdv({ ...customAdv, evasion: Number(e.target.value) })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Armor</label>
                <input
                  type="number"
                  value={customAdv.armor}
                  onChange={(e) =>
                    setCustomAdv({ ...customAdv, armor: Number(e.target.value) })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Max HP</label>
                <input
                  type="number"
                  value={customAdv.hp}
                  onChange={(e) => setCustomAdv({ ...customAdv, hp: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Max Stress</label>
                <input
                  type="number"
                  value={customAdv.stress}
                  onChange={(e) =>
                    setCustomAdv({ ...customAdv, stress: Number(e.target.value) })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Primary Attack Name</label>
                <input
                  type="text"
                  value={customAdv.attackName}
                  onChange={(e) => setCustomAdv({ ...customAdv, attackName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Primary Attack Damage</label>
                <input
                  type="text"
                  value={customAdv.attackDamage}
                  onChange={(e) =>
                    setCustomAdv({ ...customAdv, attackDamage: e.target.value })
                  }
                  placeholder="e.g. 2d8+3 Physical"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-3">
              <button
                type="button"
                onClick={() => setShowCustomModal(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-xs font-semibold text-slate-950 shadow"
              >
                Create Adversary
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
