import React, { useState } from 'react';
import {
  X,
  ChevronUp,
  ChevronDown,
  Maximize2,
  Minimize2,
  Move,
  Plus,
  Layout,
  Zap,
  Dices,
  Users,
  Swords,
  Layers,
  Clock,
  Skull,
  BookOpen,
  FileText,
  HelpCircle,
  Columns,
} from 'lucide-react';
import {
  DashboardWidgetConfig,
  PlayerCharacter,
  SessionState,
  CombatParticipant,
  EnvironmentCard,
  WidgetType,
} from '../types';
import { PlayerDashboard } from './PlayerDashboard';
import { EncounterTracker } from './EncounterTracker';
import { AdversaryLibrary } from './AdversaryLibrary';
import { EnvironmentLibrary } from './EnvironmentLibrary';
import { DomainDeckLibrary } from './DomainDeckLibrary';
import { SessionNotesAndClocks } from './SessionNotesAndClocks';
import { rollDualityDice } from '../utils/dualityDice';
import { RULES_DATA } from '../data/rulesData';
import { soundFX } from '../utils/audioSynth';

interface ModularDashboardProps {
  widgets: DashboardWidgetConfig[];
  setWidgets: React.Dispatch<React.SetStateAction<DashboardWidgetConfig[]>>;
  players: PlayerCharacter[];
  setPlayers: React.Dispatch<React.SetStateAction<PlayerCharacter[]>>;
  sessionState: SessionState;
  setSessionState: React.Dispatch<React.SetStateAction<SessionState>>;
  onOpenWidgetCatalog: () => void;
  onOpenDiceRoller: () => void;
  onOpenRulesModal: () => void;
  onOpenAutoEncounter: () => void;
}

export const ModularDashboard: React.FC<ModularDashboardProps> = ({
  widgets,
  setWidgets,
  players,
  setPlayers,
  sessionState,
  setSessionState,
  onOpenWidgetCatalog,
  onOpenDiceRoller,
  onOpenRulesModal,
  onOpenAutoEncounter,
}) => {
  // Local quick roller state for inline Duality dice widget
  const [quickRollerName, setQuickRollerName] = useState('Player');
  const [quickRollerMod, setQuickRollerMod] = useState(2);
  const [quickRollerDc, setQuickRollerDc] = useState(13);
  const [lastRollResult, setLastRollResult] = useState<any | null>(null);

  // Quick Rules search state
  const [ruleSearch, setRuleSearch] = useState('');

  const handleRemoveWidget = (id: string) => {
    setWidgets((prev) => prev.filter((w) => w.id !== id));
    soundFX.playClockTick();
  };

  const handleToggleCollapse = (id: string) => {
    setWidgets((prev) =>
      prev.map((w) => (w.id === id ? { ...w, isCollapsed: !w.isCollapsed } : w))
    );
  };

  const handleChangeColSpan = (id: string) => {
    setWidgets((prev) =>
      prev.map((w) => {
        if (w.id !== id) return w;
        const nextSpan = (w.colSpan === 3 ? 1 : (w.colSpan || 1) + 1) as 1 | 2 | 3;
        return { ...w, colSpan: nextSpan };
      })
    );
  };

  const handleMoveWidget = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= widgets.length) return;

    const updated = [...widgets];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setWidgets(updated);
    soundFX.playClockTick();
  };

  const handleInlineRoll = () => {
    soundFX.playDiceRoll();
    setTimeout(() => {
      const res = rollDualityDice({
        roller: quickRollerName,
        modifier: quickRollerMod,
        targetDifficulty: quickRollerDc,
      });
      setLastRollResult(res);
      setSessionState((prev) => ({
        ...prev,
        actionTokens: prev.actionTokens + 1,
      }));
      if (res.isCritical || res.outcome.includes('Hope')) {
        soundFX.playHopeChime();
      } else {
        soundFX.playFearBoom();
      }
    }, 300);
  };

  const handleAddAdversaryToCombat = (participant: CombatParticipant) => {
    setSessionState((prev) => ({
      ...prev,
      combatParticipants: [...prev.combatParticipants, participant],
      isCombatActive: true,
    }));
  };

  const handleSelectEnvironment = (env: EnvironmentCard) => {
    setSessionState((prev) => ({
      ...prev,
      activeEnvironment: env,
      activeSceneName: `Scene: ${env.name}`,
    }));
  };

  const visibleWidgets = widgets.filter((w) => w.isVisible);

  return (
    <div className="space-y-6">
      {/* Dashboard Top Control Toolbar */}
      <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300">
            <Layout className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-serif font-bold text-lg text-amber-200">
              Modular GM Screen Canvas
            </h2>
            <p className="text-xs text-slate-400">
              Add, remove, reorder, and scale components on your interactive digital screen.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onOpenWidgetCatalog}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-extrabold text-xs shadow-lg transition flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>+ Customize / Add Components</span>
          </button>
        </div>
      </div>

      {/* Grid Canvas for Widgets */}
      {visibleWidgets.length === 0 ? (
        <div className="bg-slate-900/40 border border-dashed border-slate-800 rounded-3xl p-12 text-center space-y-4">
          <Layout className="w-12 h-12 text-slate-600 mx-auto" />
          <div>
            <h3 className="font-serif font-bold text-lg text-slate-300">
              Your GM Screen is Currently Empty
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              Click "+ Customize / Add Components" to add Fear Trackers, Player Health Cards, Duality Dice, Combat Runners, or Domain Cards.
            </p>
          </div>
          <button
            onClick={onOpenWidgetCatalog}
            className="px-4 py-2 bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow"
          >
            Add Components Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
          {visibleWidgets.map((widget, index) => {
            const colSpanClass =
              widget.colSpan === 3
                ? 'lg:col-span-3 md:col-span-2 col-span-1'
                : widget.colSpan === 2
                ? 'lg:col-span-2 md:col-span-2 col-span-1'
                : 'col-span-1';

            return (
              <div
                key={widget.id}
                className={`${colSpanClass} bg-slate-900/95 border border-slate-800 rounded-3xl shadow-xl transition-all duration-200 overflow-hidden space-y-0`}
              >
                {/* Widget Card Header */}
                <div className="bg-slate-950/80 px-5 py-3.5 border-b border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    {widget.type === 'fear-action-tracker' && <Zap className="w-4 h-4 text-amber-400" />}
                    {widget.type === 'duality-roller' && <Dices className="w-4 h-4 text-purple-400" />}
                    {widget.type === 'player-roster' && <Users className="w-4 h-4 text-amber-300" />}
                    {widget.type === 'encounter-tracker' && <Swords className="w-4 h-4 text-red-400" />}
                    {widget.type === 'active-environment' && <Layers className="w-4 h-4 text-purple-300" />}
                    {widget.type === 'threat-clocks' && <Clock className="w-4 h-4 text-amber-400" />}
                    {widget.type === 'adversary-library' && <Skull className="w-4 h-4 text-red-500" />}
                    {widget.type === 'domain-deck' && <BookOpen className="w-4 h-4 text-cyan-400" />}
                    {widget.type === 'gm-scratchpad' && <FileText className="w-4 h-4 text-amber-200" />}
                    {widget.type === 'rules-quick-ref' && <HelpCircle className="w-4 h-4 text-emerald-400" />}

                    <h3 className="font-serif font-bold text-sm text-slate-100">
                      {widget.title}
                    </h3>
                  </div>

                  {/* Widget Actions (Reorder, ColSpan, Collapse, Remove) */}
                  <div className="flex items-center space-x-1">
                    {/* Move Up */}
                    <button
                      onClick={() => handleMoveWidget(index, 'up')}
                      disabled={index === 0}
                      className="text-slate-500 hover:text-slate-200 disabled:opacity-30 p-1"
                      title="Move up"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>

                    {/* Move Down */}
                    <button
                      onClick={() => handleMoveWidget(index, 'down')}
                      disabled={index === visibleWidgets.length - 1}
                      className="text-slate-500 hover:text-slate-200 disabled:opacity-30 p-1"
                      title="Move down"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>

                    {/* Column Span Toggle */}
                    <button
                      onClick={() => handleChangeColSpan(widget.id)}
                      className="text-slate-500 hover:text-amber-300 p-1"
                      title={`Change width (Current: ${widget.colSpan || 1} col)`}
                    >
                      <Columns className="w-3.5 h-3.5" />
                    </button>

                    {/* Collapse / Expand */}
                    <button
                      onClick={() => handleToggleCollapse(widget.id)}
                      className="text-slate-500 hover:text-slate-200 p-1"
                      title={widget.isCollapsed ? 'Expand widget' : 'Collapse widget'}
                    >
                      {widget.isCollapsed ? (
                        <Maximize2 className="w-3.5 h-3.5" />
                      ) : (
                        <Minimize2 className="w-3.5 h-3.5" />
                      )}
                    </button>

                    {/* Remove Widget */}
                    <button
                      onClick={() => handleRemoveWidget(widget.id)}
                      className="text-slate-500 hover:text-red-400 p-1 rounded hover:bg-slate-800 transition"
                      title="Remove component from screen"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Widget Card Body */}
                {!widget.isCollapsed && (
                  <div className="p-5">
                    {/* 1. Fear Pool & Action Tracker Widget */}
                    {widget.type === 'fear-action-tracker' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {/* Fear Pool Box */}
                        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                              <Skull className="w-4 h-4 text-purple-400" />
                              Fear Pool ({sessionState.fearPool} / {sessionState.maxFearPool})
                            </span>
                            <div className="flex items-center space-x-1">
                              <button
                                onClick={() =>
                                  setSessionState((prev) => ({
                                    ...prev,
                                    fearPool: Math.max(0, prev.fearPool - 1),
                                  }))
                                }
                                className="w-6 h-6 rounded bg-slate-900 text-slate-300 font-bold hover:bg-purple-900"
                              >
                                -
                              </button>
                              <button
                                onClick={() =>
                                  setSessionState((prev) => ({
                                    ...prev,
                                    fearPool: Math.min(prev.maxFearPool, prev.fearPool + 1),
                                  }))
                                }
                                className="w-6 h-6 rounded bg-purple-900 text-purple-200 font-bold hover:bg-purple-800"
                              >
                                +
                              </button>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {Array.from({ length: sessionState.maxFearPool }).map((_, i) => (
                              <button
                                key={i}
                                onClick={() =>
                                  setSessionState((prev) => ({
                                    ...prev,
                                    fearPool: i + 1 === prev.fearPool ? i : i + 1,
                                  }))
                                }
                                className={`flex-1 h-10 rounded-xl border transition flex items-center justify-center font-bold ${
                                  i < sessionState.fearPool
                                    ? 'bg-purple-600 border-purple-400 text-white shadow-lg shadow-purple-900/50'
                                    : 'bg-slate-900 border-slate-800 text-slate-600'
                                }`}
                              >
                                💀
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Action Tokens Box */}
                        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                              <Zap className="w-4 h-4 text-amber-400" />
                              Action Tokens ({sessionState.actionTokens})
                            </span>
                            <button
                              onClick={() =>
                                setSessionState((prev) => ({ ...prev, actionTokens: 0 }))
                              }
                              className="text-[10px] text-slate-400 hover:text-amber-300"
                            >
                              Reset
                            </button>
                          </div>

                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() =>
                                setSessionState((prev) => ({
                                  ...prev,
                                  actionTokens: Math.max(0, prev.actionTokens - 1),
                                }))
                              }
                              className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold text-slate-300 hover:border-amber-500"
                            >
                              Spend Token (-1)
                            </button>
                            <button
                              onClick={() =>
                                setSessionState((prev) => ({
                                  ...prev,
                                  actionTokens: prev.actionTokens + 1,
                                }))
                              }
                              className="flex-1 py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 rounded-xl text-xs font-extrabold shadow"
                            >
                              + Add Action Token
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 2. Duality Dice Quick Roller */}
                    {widget.type === 'duality-roller' && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div>
                            <label className="text-slate-400 block mb-1 font-semibold">Roller</label>
                            <input
                              type="text"
                              value={quickRollerName}
                              onChange={(e) => setQuickRollerName(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                            />
                          </div>
                          <div>
                            <label className="text-slate-400 block mb-1 font-semibold">Mod</label>
                            <input
                              type="number"
                              value={quickRollerMod}
                              onChange={(e) => setQuickRollerMod(Number(e.target.value))}
                              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-bold"
                            />
                          </div>
                          <div>
                            <label className="text-slate-400 block mb-1 font-semibold">DC</label>
                            <input
                              type="number"
                              value={quickRollerDc}
                              onChange={(e) => setQuickRollerDc(Number(e.target.value))}
                              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-bold"
                            />
                          </div>
                        </div>

                        <button
                          onClick={handleInlineRoll}
                          className="w-full py-2.5 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-extrabold text-xs rounded-xl shadow transition flex items-center justify-center space-x-1.5"
                        >
                          <Dices className="w-4 h-4" />
                          <span>ROLL DUALITY DICE (2d12)</span>
                        </button>

                        {lastRollResult && (
                          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center space-y-1 text-xs">
                            <div className="flex justify-center space-x-4 font-bold">
                              <span className="text-amber-300">Hope: {lastRollResult.hopeValue}</span>
                              <span className="text-purple-300">Fear: {lastRollResult.fearValue}</span>
                            </div>
                            <div className="font-mono text-xl font-extrabold text-slate-100">
                              Total: {lastRollResult.total}{' '}
                              <span className="text-xs font-normal text-slate-400">
                                vs DC {lastRollResult.targetDifficulty}
                              </span>
                            </div>
                            <div className="text-[10px] font-bold text-amber-400 uppercase">
                              {lastRollResult.outcome}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* 3. Player Roster & Health Cards */}
                    {widget.type === 'player-roster' && (
                      <PlayerDashboard
                        players={players}
                        setPlayers={setPlayers}
                        onActionTokenAdded={() =>
                          setSessionState((prev) => ({
                            ...prev,
                            actionTokens: prev.actionTokens + 1,
                          }))
                        }
                      />
                    )}

                    {/* 4. Active Combat Encounter Tracker */}
                    {widget.type === 'encounter-tracker' && (
                      <EncounterTracker
                        sessionState={sessionState}
                        setSessionState={setSessionState}
                        onOpenDiceRollerWithConfig={() => onOpenDiceRoller()}
                        onOpenAutoEncounter={onOpenAutoEncounter}
                      />
                    )}

                    {/* 5. Active Environment Card */}
                    {widget.type === 'active-environment' && (
                      <EnvironmentLibrary
                        activeEnvironment={sessionState.activeEnvironment}
                        onSelectActiveEnvironment={handleSelectEnvironment}
                      />
                    )}

                    {/* 6. Threat Clocks */}
                    {widget.type === 'threat-clocks' && (
                      <SessionNotesAndClocks
                        sessionState={sessionState}
                        setSessionState={setSessionState}
                      />
                    )}

                    {/* 7. Adversary Library Vault */}
                    {widget.type === 'adversary-library' && (
                      <AdversaryLibrary
                        onAddAdversaryToCombat={handleAddAdversaryToCombat}
                      />
                    )}

                    {/* 8. Domain Deck & SRD */}
                    {widget.type === 'domain-deck' && <DomainDeckLibrary />}

                    {/* 9. GM Scratchpad & Loot */}
                    {widget.type === 'gm-scratchpad' && (
                      <SessionNotesAndClocks
                        sessionState={sessionState}
                        setSessionState={setSessionState}
                      />
                    )}

                    {/* 10. Rules Quick Reference */}
                    {widget.type === 'rules-quick-ref' && (
                      <div className="space-y-3 text-xs">
                        <input
                          type="text"
                          value={ruleSearch}
                          onChange={(e) => setRuleSearch(e.target.value)}
                          placeholder="Search rules, damage thresholds, action tracker..."
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200"
                        />

                        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                          {RULES_DATA.filter(
                            (r) =>
                              r.title.toLowerCase().includes(ruleSearch.toLowerCase()) ||
                              r.summary.toLowerCase().includes(ruleSearch.toLowerCase())
                          ).map((rule) => (
                            <div
                              key={rule.id}
                              className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 space-y-1"
                            >
                              <div className="font-serif font-bold text-amber-300">
                                {rule.title}
                              </div>
                              <p className="text-slate-400 text-[11px]">{rule.summary}</p>
                            </div>
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
      )}
    </div>
  );
};
