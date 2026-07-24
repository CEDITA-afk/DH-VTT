import React from 'react';
import {
  Plus,
  X,
  Layout,
  Skull,
  Zap,
  Dices,
  Users,
  Swords,
  Layers,
  Clock,
  BookOpen,
  FileText,
  Check,
  RotateCcw,
} from 'lucide-react';
import { DashboardWidgetConfig, WidgetType } from '../types';
import { soundFX } from '../utils/audioSynth';

interface WidgetCatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  widgets: DashboardWidgetConfig[];
  onAddWidget: (type: WidgetType, title: string, colSpan?: 1 | 2 | 3) => void;
  onToggleWidgetVisibility: (id: string) => void;
  onResetLayout: (preset?: 'all' | 'combat' | 'minimal') => void;
}

const AVAILABLE_WIDGET_TYPES: {
  type: WidgetType;
  title: string;
  description: string;
  icon: React.ReactNode;
  defaultColSpan: 1 | 2 | 3;
}[] = [
  {
    type: 'fear-action-tracker',
    title: 'Fear Pool & Action Tracker',
    description: 'Track Fear tokens, max Fear budget, action tokens, and quick Fear moves.',
    icon: <Zap className="w-5 h-5 text-amber-400" />,
    defaultColSpan: 3,
  },
  {
    type: 'duality-roller',
    title: 'Duality Dice Quick Roller (2d12)',
    description: 'Roll Hope (Gold) and Fear (Purple) d12 dice with modifiers and DC checks directly on screen.',
    icon: <Dices className="w-5 h-5 text-purple-400" />,
    defaultColSpan: 1,
  },
  {
    type: 'player-roster',
    title: 'Party Roster & Health Cards',
    description: 'Live HP, Stress, Armor Slots, Hope, Conditions, and Rest controls for all PCs.',
    icon: <Users className="w-5 h-5 text-amber-300" />,
    defaultColSpan: 2,
  },
  {
    type: 'encounter-tracker',
    title: 'Combat Encounter & Adversary Tracker',
    description: 'Active battle participant list, HP, Stress, Armor, attacks, status conditions, and Spotlight.',
    icon: <Swords className="w-5 h-5 text-red-400" />,
    defaultColSpan: 2,
  },
  {
    type: 'active-environment',
    title: 'Active Environment Scene Card',
    description: 'Active scene hazards, difficulty DC, impending dangers, and Fear moves.',
    icon: <Layers className="w-5 h-5 text-purple-300" />,
    defaultColSpan: 1,
  },
  {
    type: 'threat-clocks',
    title: 'Session Threat Clocks',
    description: 'Interactive countdown threat clock wedges with custom segment sizes.',
    icon: <Clock className="w-5 h-5 text-amber-400" />,
    defaultColSpan: 1,
  },
  {
    type: 'adversary-library',
    title: 'Adversary & Monster Search Vault',
    description: 'Search official Daggerheart adversaries by Tier & Type and add them instantly to combat.',
    icon: <Skull className="w-5 h-5 text-red-500" />,
    defaultColSpan: 2,
  },
  {
    type: 'domain-deck',
    title: 'Domain Deck & Ability Cards SRD',
    description: 'Quick lookup for all 9 Domain ability cards, Class features, Ancestries, and Communities.',
    icon: <BookOpen className="w-5 h-5 text-cyan-400" />,
    defaultColSpan: 2,
  },
  {
    type: 'gm-scratchpad',
    title: 'GM Campaign Notes & Loot Generator',
    description: 'Campaign scratchpad auto-saved to session state plus 1-click magic item generator.',
    icon: <FileText className="w-5 h-5 text-amber-200" />,
    defaultColSpan: 1,
  },
];

export const WidgetCatalogModal: React.FC<WidgetCatalogModalProps> = ({
  isOpen,
  onClose,
  widgets,
  onAddWidget,
  onToggleWidgetVisibility,
  onResetLayout,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full p-6 shadow-2xl relative space-y-5 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-300">
              <Layout className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-xl text-amber-200">
                Customize GM Screen Components
              </h3>
              <p className="text-xs text-slate-400">
                Add, remove, or toggle modules to craft your custom Daggerheart GM interface.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-100 p-1.5 rounded-xl bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Presets Row */}
        <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            <span>Layout Presets:</span>
          </span>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                onResetLayout('all');
                soundFX.playClockTick();
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs text-amber-300 font-bold border border-slate-700 transition"
            >
              Full Master Screen (All Widgets)
            </button>

            <button
              onClick={() => {
                onResetLayout('combat');
                soundFX.playClockTick();
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs text-red-300 font-bold border border-slate-700 transition"
            >
              Combat Focus
            </button>

            <button
              onClick={() => {
                onResetLayout('minimal');
                soundFX.playClockTick();
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs text-cyan-300 font-bold border border-slate-700 transition"
            >
              Minimalist Story Mode
            </button>
          </div>
        </div>

        {/* Widgets List */}
        <div className="overflow-y-auto flex-1 space-y-3 pr-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {AVAILABLE_WIDGET_TYPES.map((avail) => {
              const activeWidget = widgets.find((w) => w.type === avail.type);
              const isAdded = !!activeWidget && activeWidget.isVisible;

              return (
                <div
                  key={avail.type}
                  className={`p-4 rounded-2xl border transition flex flex-col justify-between space-y-3 ${
                    isAdded
                      ? 'bg-purple-950/20 border-purple-500/50 ring-1 ring-purple-500/30'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 shrink-0">
                      {avail.icon}
                    </div>
                    <div>
                      <h4 className="font-serif font-bold text-sm text-slate-100">
                        {avail.title}
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                        {avail.description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-900 flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 font-mono">
                      Default Width: {avail.defaultColSpan} Column{avail.defaultColSpan > 1 ? 's' : ''}
                    </span>

                    {isAdded ? (
                      <button
                        onClick={() => {
                          if (activeWidget) onToggleWidgetVisibility(activeWidget.id);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-purple-900/60 hover:bg-purple-800 text-purple-200 border border-purple-700/50 text-xs font-bold transition flex items-center space-x-1"
                      >
                        <Check className="w-3.5 h-3.5 text-purple-300" />
                        <span>Active on Screen</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          onAddWidget(avail.type, avail.title, avail.defaultColSpan);
                          soundFX.playHopeChime();
                        }}
                        className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 text-xs font-bold transition flex items-center space-x-1 shadow"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add to Screen</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
