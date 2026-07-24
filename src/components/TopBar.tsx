import React, { useState } from 'react';
import {
  Skull,
  Zap,
  Dices,
  BookOpen,
  Volume2,
  VolumeX,
  Search,
  Sparkles,
  Swords,
  Layers,
  Clock,
  Tv,
  Plus,
  Minus,
  Layout,
  PlusCircle,
  Compass,
} from 'lucide-react';
import { SessionState } from '../types';
import { soundFX } from '../utils/audioSynth';

interface TopBarProps {
  sessionState: SessionState;
  setSessionState: React.Dispatch<React.SetStateAction<SessionState>>;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenDiceRoller: () => void;
  onOpenRules: () => void;
  onOpenAutoEncounter: () => void;
  onOpenQuickSearch: () => void;
  onOpenPlayerView: () => void;
  onOpenWidgetCatalog?: () => void;
  vttMode: boolean;
  setVttMode: (v: boolean) => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  sessionState,
  setSessionState,
  activeTab,
  setActiveTab,
  onOpenDiceRoller,
  onOpenRules,
  onOpenAutoEncounter,
  onOpenQuickSearch,
  onOpenPlayerView,
  onOpenWidgetCatalog,
  vttMode,
  setVttMode,
}) => {
  const [isAmbientOn, setIsAmbientOn] = useState(false);

  const handleFearChange = (delta: number) => {
    setSessionState((prev) => {
      const nextFear = Math.max(0, Math.min(prev.maxFearPool, prev.fearPool + delta));
      if (delta > 0) soundFX.playFearBoom();
      return { ...prev, fearPool: nextFear };
    });
  };

  const handleActionTokenChange = (delta: number) => {
    setSessionState((prev) => {
      const nextTokens = Math.max(0, prev.actionTokens + delta);
      if (delta > 0) soundFX.playClockTick();
      return { ...prev, actionTokens: nextTokens };
    });
  };

  const handleClearActionTokens = () => {
    setSessionState((prev) => ({ ...prev, actionTokens: 0 }));
  };

  const toggleAmbientSound = () => {
    const newState = soundFX.toggleAmbientPad();
    setIsAmbientOn(newState);
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur border-b border-amber-900/40 text-slate-100 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Logo & Title */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-600 via-purple-700 to-indigo-900 p-0.5 shadow-lg shadow-purple-900/30 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-amber-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-serif font-bold text-lg text-amber-200 tracking-wide leading-tight">
                DAGGERHEART
              </h1>
              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-md">
                GM Screen
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              {sessionState.activeSceneName || 'Active Session'}
            </p>
          </div>
        </div>

        {/* Core Session Trackers: Fear Pool & Action Tracker */}
        <div className="flex items-center space-x-3 bg-slate-950/80 p-1.5 rounded-xl border border-slate-800">
          {/* Fear Pool Counter */}
          <div className="flex items-center space-x-2 px-2.5 py-1 bg-red-950/40 rounded-lg border border-red-900/40">
            <div className="flex items-center space-x-1.5">
              <Skull className="w-4 h-4 text-purple-400 animate-pulse" />
              <span className="text-xs font-semibold text-purple-200 uppercase tracking-wider">
                Fear
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => handleFearChange(-1)}
                className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-xs text-slate-300 transition"
                title="Spend 1 Fear"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="font-mono text-base font-bold text-amber-300 min-w-[20px] text-center">
                {sessionState.fearPool}
              </span>
              <button
                onClick={() => handleFearChange(1)}
                className="w-5 h-5 rounded bg-purple-900/80 hover:bg-purple-800 flex items-center justify-center text-xs text-purple-200 transition"
                title="Gain 1 Fear"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Action Tokens Counter */}
          <div className="flex items-center space-x-2 px-2.5 py-1 bg-amber-950/30 rounded-lg border border-amber-900/40">
            <div className="flex items-center space-x-1.5">
              <Zap className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-semibold text-amber-200 uppercase tracking-wider">
                Action Tokens
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => handleActionTokenChange(-1)}
                className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-xs text-slate-300 transition"
                title="Spend 1 Action Token"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="font-mono text-base font-bold text-amber-400 min-w-[24px] text-center">
                {sessionState.actionTokens}
              </span>
              <button
                onClick={() => handleActionTokenChange(1)}
                className="w-5 h-5 rounded bg-amber-700/80 hover:bg-amber-600 flex items-center justify-center text-xs text-amber-100 transition"
                title="Add 1 Action Token"
              >
                <Plus className="w-3 h-3" />
              </button>
              {sessionState.actionTokens > 0 && (
                <button
                  onClick={handleClearActionTokens}
                  className="ml-1 text-[10px] text-amber-400/80 hover:text-amber-300 underline px-1"
                  title="Clear all tokens"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Global Action Quick Buttons */}
        <div className="flex items-center space-x-2">
          {/* Quick Search */}
          <button
            onClick={onOpenQuickSearch}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-xs font-medium text-slate-300 border border-slate-700 transition"
            title="Global Search (Cmd+K)"
          >
            <Search className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">Search</span>
            <kbd className="hidden lg:inline text-[9px] bg-slate-900 text-slate-400 px-1 rounded border border-slate-700">
              ⌘K
            </kbd>
          </button>

          {/* Duality Dice Roller Modal trigger */}
          <button
            onClick={onOpenDiceRoller}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-xs font-semibold text-slate-950 shadow-md shadow-amber-900/20 transition"
          >
            <Dices className="w-4 h-4" />
            <span>Duality Dice</span>
          </button>

          {/* Rules Reference */}
          <button
            onClick={onOpenRules}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 border border-slate-700 transition"
            title="Daggerheart Rules SRD"
          >
            <BookOpen className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline">Rules</span>
          </button>

          {/* Sound Ambient toggle */}
          <button
            onClick={toggleAmbientSound}
            className={`p-2 rounded-lg border text-xs transition ${
              isAmbientOn
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
            title={isAmbientOn ? 'Mute Fantasy Soundscape' : 'Play Fantasy Soundscape'}
          >
            {isAmbientOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Player View Popout */}
          <button
            onClick={onOpenPlayerView}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-indigo-900/60 hover:bg-indigo-800 text-xs font-medium text-indigo-200 border border-indigo-700/50 transition"
            title="Open Player Display View"
          >
            <Tv className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Player View</span>
          </button>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="bg-slate-950/90 border-t border-slate-800/80 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between py-1">
          <div className="flex items-center space-x-1 overflow-x-auto scrollbar-none">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition ${
                activeTab === 'dashboard'
                  ? 'bg-amber-500 text-slate-950 shadow-md ring-1 ring-amber-300'
                  : 'text-amber-300 hover:text-amber-200 hover:bg-amber-900/30 border border-amber-500/30'
              }`}
            >
              <Layout className="w-3.5 h-3.5" />
              <span>Modular Screen Canvas</span>
            </button>

            <button
              onClick={() => setActiveTab('players')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                activeTab === 'players'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Players & Status</span>
            </button>

          <button
            onClick={() => setActiveTab('encounter')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              activeTab === 'encounter'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Swords className="w-3.5 h-3.5" />
            <span>Active Combat Runner</span>
            {sessionState.combatParticipants.length > 0 && (
              <span className="ml-1 bg-red-900/80 text-red-200 px-1.5 py-0.2 text-[10px] rounded-full">
                {sessionState.combatParticipants.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('adversaries')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              activeTab === 'adversaries'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Skull className="w-3.5 h-3.5" />
            <span>Adversary Library</span>
          </button>

          <button
            onClick={() => setActiveTab('environments')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              activeTab === 'environments'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Environments & Scenes</span>
          </button>

          <button
            onClick={() => setActiveTab('domains')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              activeTab === 'domains'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span>Domain Deck & SRD</span>
          </button>

          <button
            onClick={() => setActiveTab('clocks')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              activeTab === 'clocks'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Clocks & Session Notes</span>
          </button>

          </div>

          <div className="flex items-center space-x-2 shrink-0 ml-2">
            {/* VTT Sandbox Toggle Button */}
            <button
              onClick={() => {
                setVttMode(!vttMode);
                soundFX.playHopeChime();
              }}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-md text-xs font-extrabold shadow transition duration-200 border ${
                vttMode
                  ? 'bg-gradient-to-r from-purple-800 to-indigo-900 border-purple-500 text-white hover:from-purple-700 hover:to-indigo-800'
                  : 'bg-gradient-to-r from-amber-600 to-amber-700 border-amber-500 text-slate-950 hover:from-amber-500 hover:to-amber-600'
              }`}
            >
              <Compass className={`w-3.5 h-3.5 ${vttMode ? 'animate-spin' : ''}`} />
              <span>{vttMode ? '📋 GM Screen View' : '✨ Foundry VTT Sandbox'}</span>
            </button>

            {/* Quick Customize Button */}
            {!vttMode && onOpenWidgetCatalog && (
              <button
                onClick={onOpenWidgetCatalog}
                className="flex items-center space-x-1.5 px-3 py-1 rounded-md bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold shadow transition shrink-0"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>+ Customize Widgets</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
