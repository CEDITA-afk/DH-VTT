import React, { useEffect, useState } from 'react';
import {
  Tv,
  X,
  Heart,
  Shield,
  Sparkles,
  Flame,
  Zap,
  Clock,
  Layers,
  AlertTriangle,
} from 'lucide-react';
import { PlayerCharacter, SessionState } from '../types';
import { syncService, SyncMessage } from '../utils/syncService';

interface PlayerViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  players: PlayerCharacter[];
  sessionState: SessionState;
}

export const PlayerViewModal: React.FC<PlayerViewModalProps> = ({
  isOpen,
  onClose,
  players: initialPlayers,
  sessionState: initialSessionState,
}) => {
  const [players, setPlayers] = useState<PlayerCharacter[]>(initialPlayers);
  const [sessionState, setSessionState] = useState<SessionState>(initialSessionState);

  useEffect(() => {
    setPlayers(initialPlayers);
  }, [initialPlayers]);

  useEffect(() => {
    setSessionState(initialSessionState);
  }, [initialSessionState]);

  useEffect(() => {
    const unsubscribe = syncService.subscribe((msg: SyncMessage) => {
      if (msg.type === 'PLAYER_UPDATE') {
        const updated = msg.payload as PlayerCharacter;
        setPlayers((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      } else if (msg.type === 'SESSION_STATE_UPDATE') {
        setSessionState(msg.payload as SessionState);
      }
    });

    return () => unsubscribe();
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-slate-100 flex flex-col overflow-y-auto">
      {/* Top Bar for Player View */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300">
            <Tv className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-serif font-bold text-lg text-amber-200">
              DAGGERHEART PLAYER DISPLAY
            </h1>
            <p className="text-xs text-slate-400">
              {sessionState.activeSceneName || 'Live Player Roster & Scene Status'}
            </p>
          </div>
        </div>

        {/* Action Tokens Badge */}
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2 bg-amber-950/60 px-4 py-2 rounded-xl border border-amber-500/40">
            <Zap className="w-5 h-5 text-amber-400 animate-pulse" />
            <span className="text-xs uppercase font-bold text-amber-200">Action Tokens:</span>
            <span className="font-mono text-xl font-extrabold text-amber-300">
              {sessionState.actionTokens}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            title="Exit Player View"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="p-6 max-w-7xl mx-auto w-full space-y-8 flex-1">
        {/* Active Scene Environment Banner */}
        {sessionState.activeEnvironment && (
          <div className="bg-gradient-to-r from-purple-950/80 via-slate-900 to-purple-950/80 p-5 rounded-3xl border border-purple-500/40 shadow-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                <Layers className="w-4 h-4" />
                <span>Active Scene Environment: {sessionState.activeEnvironment.name}</span>
              </span>
              <span className="text-xs font-mono font-bold text-amber-300">
                Difficulty DC {sessionState.activeEnvironment.difficulty}
              </span>
            </div>
            <p className="text-xs text-slate-300 italic">
              "{sessionState.activeEnvironment.description}"
            </p>
          </div>
        )}

        {/* Player Roster Cards */}
        <div>
          <h2 className="font-serif font-bold text-xl text-amber-200 mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <span>Party Health & Status</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {players.map((pc) => (
              <div
                key={pc.id}
                className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-serif font-bold text-xl text-slate-100">{pc.name}</h3>
                    <p className="text-xs text-amber-400">
                      Level {pc.level} {pc.ancestry} {pc.class}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">Hope</span>
                    <span className="font-mono text-lg font-bold text-amber-300">
                      {pc.hope}/{pc.maxHope}
                    </span>
                  </div>
                </div>

                {/* HP & Stress */}
                <div className="space-y-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                  {/* HP */}
                  <div>
                    <div className="flex justify-between text-xs font-bold text-red-300 mb-1.5">
                      <span className="flex items-center gap-1">
                        <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                        Hit Points
                      </span>
                      <span>
                        {pc.currentHp} / {pc.maxHp}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {Array.from({ length: pc.maxHp }).map((_, idx) => {
                        const isMarked = idx >= pc.currentHp;
                        return (
                          <div
                            key={idx}
                            className={`flex-1 h-6 rounded-lg transition ${
                              isMarked ? 'bg-slate-900 border border-slate-800' : 'bg-red-600 shadow'
                            }`}
                          />
                        );
                      })}
                    </div>
                  </div>

                  {/* Stress */}
                  <div>
                    <div className="flex justify-between text-xs font-bold text-purple-300 mb-1.5">
                      <span className="flex items-center gap-1">
                        <Flame className="w-4 h-4 text-purple-400" />
                        Stress
                      </span>
                      <span>
                        {pc.currentStress} / {pc.maxStress}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {Array.from({ length: pc.maxStress }).map((_, idx) => {
                        const isFilled = idx < pc.currentStress;
                        return (
                          <div
                            key={idx}
                            className={`flex-1 h-5 rounded-md transition ${
                              isFilled ? 'bg-purple-600' : 'bg-slate-900'
                            }`}
                          />
                        );
                      })}
                    </div>
                  </div>

                  {/* Armor */}
                  <div>
                    <div className="flex justify-between text-xs font-bold text-amber-300 mb-1.5">
                      <span className="flex items-center gap-1">
                        <Shield className="w-4 h-4 text-amber-400" />
                        Armor Slots
                      </span>
                      <span>
                        {pc.currentArmorSlots} / {pc.maxArmorSlots}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {Array.from({ length: pc.maxArmorSlots }).map((_, idx) => {
                        const isReady = idx < pc.currentArmorSlots;
                        return (
                          <div
                            key={idx}
                            className={`flex-1 h-5 rounded-md transition ${
                              isReady ? 'bg-amber-600' : 'bg-slate-900 opacity-40'
                            }`}
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Conditions */}
                {pc.conditions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {pc.conditions.map((c) => (
                      <span
                        key={c}
                        className="px-2.5 py-1 rounded-lg text-xs font-bold bg-red-950 text-red-300 border border-red-800"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Active Clocks Display */}
        {sessionState.clocks.length > 0 && (
          <div>
            <h2 className="font-serif font-bold text-xl text-amber-200 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-400" />
              <span>Active Scene Threat Clocks</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {sessionState.clocks.map((clock) => (
                <div key={clock.id} className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl space-y-2">
                  <div className="font-serif font-bold text-base text-slate-100">{clock.name}</div>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: clock.maxSegments }).map((_, idx) => {
                      const isFilled = idx < clock.currentSegments;
                      return (
                        <div
                          key={idx}
                          className={`flex-1 h-6 rounded-md ${
                            isFilled ? 'bg-amber-500' : 'bg-slate-950'
                          }`}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
