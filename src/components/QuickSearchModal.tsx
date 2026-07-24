import React, { useState, useEffect } from 'react';
import { Search, X, Skull, Layers, BookOpen, User } from 'lucide-react';
import { ADVERSARIES_DATA } from '../data/adversaries';
import { ENVIRONMENTS_DATA } from '../data/environments';
import { RULES_DATA } from '../data/rulesData';
import { PlayerCharacter } from '../types';

interface QuickSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  players: PlayerCharacter[];
  onSelectAdversary: (id: string) => void;
  onSelectEnvironment: (id: string) => void;
  onSelectRule: (id: string) => void;
}

export const QuickSearchModal: React.FC<QuickSearchModalProps> = ({
  isOpen,
  onClose,
  players,
  onSelectAdversary,
  onSelectEnvironment,
  onSelectRule,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();

  const matchedAdversaries = q
    ? ADVERSARIES_DATA.filter((a) => a.name.toLowerCase().includes(q) || a.type.toLowerCase().includes(q))
    : ADVERSARIES_DATA.slice(0, 3);

  const matchedEnvironments = q
    ? ENVIRONMENTS_DATA.filter((e) => e.name.toLowerCase().includes(q) || e.category.toLowerCase().includes(q))
    : ENVIRONMENTS_DATA.slice(0, 2);

  const matchedRules = q
    ? RULES_DATA.filter((r) => r.title.toLowerCase().includes(q) || r.summary.toLowerCase().includes(q))
    : RULES_DATA.slice(0, 3);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-start justify-center pt-20 p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-4 shadow-2xl space-y-4 relative">
        <div className="relative">
          <Search className="w-5 h-5 text-amber-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Global Search (Adversaries, Environments, Rules, Players)..."
            className="w-full bg-slate-950 border border-slate-700 rounded-2xl pl-11 pr-10 py-3 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
          />
          <button
            onClick={onClose}
            className="absolute right-3 top-3 text-slate-400 hover:text-slate-100 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto space-y-4 pr-1 text-xs">
          {/* Adversaries */}
          {matchedAdversaries.length > 0 && (
            <div className="space-y-1.5">
              <span className="font-bold text-amber-400 flex items-center gap-1">
                <Skull className="w-3.5 h-3.5" />
                <span>Adversaries</span>
              </span>
              {matchedAdversaries.map((adv) => (
                <div
                  key={adv.id}
                  onClick={() => {
                    onSelectAdversary(adv.id);
                    onClose();
                  }}
                  className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 hover:border-slate-700 cursor-pointer flex justify-between items-center"
                >
                  <div>
                    <span className="font-bold text-slate-200">{adv.name}</span>
                    <span className="text-slate-500 text-[10px] ml-2">
                      Tier {adv.tier} {adv.type}
                    </span>
                  </div>
                  <span className="text-amber-300 font-mono">DC {adv.difficulty}</span>
                </div>
              ))}
            </div>
          )}

          {/* Environments */}
          {matchedEnvironments.length > 0 && (
            <div className="space-y-1.5">
              <span className="font-bold text-purple-400 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5" />
                <span>Environments</span>
              </span>
              {matchedEnvironments.map((env) => (
                <div
                  key={env.id}
                  onClick={() => {
                    onSelectEnvironment(env.id);
                    onClose();
                  }}
                  className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 hover:border-slate-700 cursor-pointer flex justify-between items-center"
                >
                  <span className="font-bold text-slate-200">{env.name}</span>
                  <span className="text-purple-300 text-[10px]">{env.category}</span>
                </div>
              ))}
            </div>
          )}

          {/* Rules */}
          {matchedRules.length > 0 && (
            <div className="space-y-1.5">
              <span className="font-bold text-cyan-400 flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Rules Reference</span>
              </span>
              {matchedRules.map((rule) => (
                <div
                  key={rule.id}
                  onClick={() => {
                    onSelectRule(rule.id);
                    onClose();
                  }}
                  className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 hover:border-slate-700 cursor-pointer"
                >
                  <div className="font-bold text-slate-200">{rule.title}</div>
                  <div className="text-slate-400 text-[11px] line-clamp-1">{rule.summary}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
