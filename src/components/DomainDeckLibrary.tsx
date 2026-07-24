import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  Sparkles,
  Shield,
  Layers,
  Award,
  Users,
  Feather,
  Compass,
} from 'lucide-react';
import {
  DOMAIN_CARDS_DATA,
  CLASSES_DATA,
  ANCESTRIES_DATA,
  COMMUNITIES_DATA,
} from '../data/domainsAndClasses';
import { DomainCard, DomainName } from '../types';
import { soundFX } from '../utils/audioSynth';

export const DomainDeckLibrary: React.FC = () => {
  const [subTab, setSubTab] = useState<'cards' | 'classes' | 'ancestries' | 'communities'>('cards');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<string>('all');

  const filteredCards = DOMAIN_CARDS_DATA.filter((card) => {
    const matchesSearch =
      card.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (card.effectDetails && card.effectDetails.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesDomain = selectedDomain === 'all' || card.domain === selectedDomain;

    return matchesSearch && matchesDomain;
  });

  const DOMAIN_COLORS: Record<DomainName, { bg: string; text: string; border: string }> = {
    Arcana: { bg: 'bg-purple-950/60', text: 'text-purple-300', border: 'border-purple-700/50' },
    Blade: { bg: 'bg-red-950/60', text: 'text-red-300', border: 'border-red-700/50' },
    Bone: { bg: 'bg-slate-900', text: 'text-slate-300', border: 'border-slate-700/50' },
    Codex: { bg: 'bg-blue-950/60', text: 'text-blue-300', border: 'border-blue-700/50' },
    Grace: { bg: 'bg-pink-950/60', text: 'text-pink-300', border: 'border-pink-700/50' },
    Midnight: { bg: 'bg-indigo-950/60', text: 'text-indigo-300', border: 'border-indigo-700/50' },
    Sage: { bg: 'bg-emerald-950/60', text: 'text-emerald-300', border: 'border-emerald-700/50' },
    Splendor: { bg: 'bg-amber-950/60', text: 'text-amber-300', border: 'border-amber-700/50' },
    Valor: { bg: 'bg-orange-950/60', text: 'text-orange-300', border: 'border-orange-700/50' },
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 shadow-md space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-serif font-bold text-xl text-amber-200 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-400" />
              <span>Daggerheart Domain Deck & Character SRD</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Explore official Domain Ability Cards, Classes, Ancestries, and Communities.
            </p>
          </div>

          {/* Subtabs */}
          <div className="flex items-center space-x-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setSubTab('cards')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                subTab === 'cards'
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Domain Cards</span>
            </button>

            <button
              onClick={() => setSubTab('classes')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                subTab === 'classes'
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Classes</span>
            </button>

            <button
              onClick={() => setSubTab('ancestries')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                subTab === 'ancestries'
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Feather className="w-3.5 h-3.5" />
              <span>Ancestries</span>
            </button>

            <button
              onClick={() => setSubTab('communities')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                subTab === 'communities'
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Communities</span>
            </button>
          </div>
        </div>

        {/* Filter Bar for Cards */}
        {subTab === 'cards' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search domain cards..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>

            <select
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
            >
              <option value="all">All 9 Domains</option>
              <option value="Arcana">Arcana</option>
              <option value="Blade">Blade</option>
              <option value="Bone">Bone</option>
              <option value="Codex">Codex</option>
              <option value="Grace">Grace</option>
              <option value="Midnight">Midnight</option>
              <option value="Sage">Sage</option>
              <option value="Splendor">Splendor</option>
              <option value="Valor">Valor</option>
            </select>
          </div>
        )}
      </div>

      {/* Domain Cards Vault View */}
      {subTab === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCards.map((card) => {
            const style = DOMAIN_COLORS[card.domain] || {
              bg: 'bg-slate-900',
              text: 'text-slate-200',
              border: 'border-slate-800',
            };

            return (
              <div
                key={card.id}
                className={`${style.bg} border ${style.border} rounded-2xl p-5 shadow-lg space-y-3 relative hover:border-amber-500/50 transition`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${style.border} ${style.text}`}
                      >
                        {card.domain} Domain • Level {card.level}
                      </span>
                      <span className="text-[10px] uppercase font-mono text-slate-400">
                        {card.type}
                      </span>
                    </div>
                    <h3 className="font-serif font-bold text-lg text-slate-100 mt-1">
                      {card.name}
                    </h3>
                  </div>

                  {card.hopeCost !== undefined && card.hopeCost > 0 && (
                    <span className="px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono text-xs font-bold">
                      {card.hopeCost} Hope
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-300 italic">{card.description}</p>

                {card.effectDetails && (
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs text-slate-300 font-mono leading-relaxed">
                    {card.effectDetails}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Classes View */}
      {subTab === 'classes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {CLASSES_DATA.map((cls) => (
            <div
              key={cls.id}
              className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4 hover:border-slate-700 transition"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-serif font-bold text-xl text-amber-200">{cls.name}</h3>
                  <p className="text-xs text-purple-400 font-semibold mt-0.5">
                    Domains: {cls.domains.join(' & ')}
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-slate-400 bg-slate-950 px-2 py-1 rounded border border-slate-800">
                  Evasion: {cls.evasionBase}
                </span>
              </div>

              {/* Features */}
              <div className="space-y-2 text-xs">
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <span className="font-bold text-amber-300 block mb-0.5">
                    Class Feature: {cls.classFeature.name}
                  </span>
                  <p className="text-slate-400">{cls.classFeature.description}</p>
                </div>

                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <span className="font-bold text-purple-300 block mb-0.5">
                    Hope Feature: {cls.hopeFeature.name}
                  </span>
                  <p className="text-slate-400">{cls.hopeFeature.description}</p>
                </div>
              </div>

              {/* Subclasses */}
              <div className="pt-2 border-t border-slate-800 text-xs">
                <span className="text-slate-500 font-bold block mb-1">Subclasses:</span>
                <div className="flex flex-wrap gap-1">
                  {cls.subclasses.map((sc) => (
                    <span
                      key={sc}
                      className="px-2 py-0.5 rounded bg-slate-950 text-slate-300 text-[10px] font-mono border border-slate-800"
                    >
                      {sc}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Ancestries View */}
      {subTab === 'ancestries' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ANCESTRIES_DATA.map((anc) => (
            <div
              key={anc.id}
              className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-md space-y-2"
            >
              <h3 className="font-serif font-bold text-base text-amber-200">{anc.name}</h3>
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs">
                <span className="font-bold text-amber-400 block mb-0.5">
                  {anc.featureName}
                </span>
                <p className="text-slate-300">{anc.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Communities View */}
      {subTab === 'communities' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {COMMUNITIES_DATA.map((com) => (
            <div
              key={com.id}
              className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-md space-y-2"
            >
              <h3 className="font-serif font-bold text-base text-purple-200">{com.name}</h3>
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs">
                <span className="font-bold text-purple-300 block mb-0.5">
                  {com.featureName}
                </span>
                <p className="text-slate-300">{com.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
