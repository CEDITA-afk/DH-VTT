import React, { useState } from 'react';
import { BookOpen, Search, X, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { RULES_DATA } from '../data/rulesData';
import { RuleSection } from '../types';

interface RulesReferenceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesReferenceModal: React.FC<RulesReferenceModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({
    'rule-duality-dice': true,
    'rule-action-tracker': true,
  });

  if (!isOpen) return null;

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredRules = RULES_DATA.filter((rule) => {
    const matchesSearch =
      rule.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rule.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rule.details.some((d) => d.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCat =
      selectedCategory === 'all' || rule.category === selectedCategory;

    return matchesSearch && matchesCat;
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full p-6 shadow-2xl relative space-y-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-purple-950 border border-purple-800 text-purple-300">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-xl text-amber-200">
                Daggerheart Rules & SRD Reference
              </h3>
              <p className="text-xs text-slate-400">
                Quick-reference combat mechanics, Fear/Hope spending, damage thresholds & conditions.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-100 p-1.5 rounded-lg bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Category Filter */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search rules, keywords, mechanics..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
          >
            <option value="all">All Categories</option>
            <option value="Combat">Combat & Action Tracker</option>
            <option value="Fear & Hope">Fear & Hope Mechanics</option>
            <option value="Damage & Health">Damage, Armor & Death</option>
            <option value="Conditions">Conditions</option>
            <option value="Rests & Healing">Rests & Healing</option>
          </select>
        </div>

        {/* Rules List Container */}
        <div className="overflow-y-auto flex-1 space-y-3 pr-1">
          {filteredRules.map((rule) => {
            const isExpanded = !!expandedIds[rule.id];

            return (
              <div
                key={rule.id}
                className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2 hover:border-slate-700 transition"
              >
                <div
                  onClick={() => toggleExpand(rule.id)}
                  className="flex items-center justify-between cursor-pointer"
                >
                  <div>
                    <span className="text-[10px] uppercase font-bold text-amber-400 px-2 py-0.5 bg-amber-950/60 border border-amber-800/60 rounded">
                      {rule.category}
                    </span>
                    <h4 className="font-serif font-bold text-base text-slate-100 mt-1">
                      {rule.title}
                    </h4>
                  </div>
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </div>

                <p className="text-xs text-slate-300 font-medium">{rule.summary}</p>

                {isExpanded && (
                  <div className="pt-2 border-t border-slate-800 space-y-2 text-xs">
                    <ul className="list-disc list-inside space-y-1 text-slate-400">
                      {rule.details.map((dt, i) => (
                        <li key={i}>{dt}</li>
                      ))}
                    </ul>

                    {rule.bulletPoints && (
                      <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 space-y-1">
                        <span className="text-[11px] font-bold text-amber-300 block">
                          Key Takeaways:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {rule.bulletPoints.map((bp, i) => (
                            <span
                              key={i}
                              className="text-[10px] bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-slate-300 font-mono"
                            >
                              ✓ {bp}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
