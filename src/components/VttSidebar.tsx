import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Swords,
  Map,
  Book,
  Compass,
  Settings,
  Send,
  Skull,
  Zap,
  Clock,
  BookOpen,
  Volume2,
  VolumeX,
  PlusCircle,
  HelpCircle,
  Dices,
  Layers,
  Heart,
  Plus,
  Minus,
  Trash2,
  RefreshCw,
} from 'lucide-react';
import { SessionState, PlayerCharacter, CombatParticipant, CountdownClock, EnvironmentCard, DomainCard } from '../types';
import { rollDualityDice } from '../utils/dualityDice';
import { soundFX } from '../utils/audioSynth';
import { RULES_DATA } from '../data/rulesData';
import { ADVERSARIES_DATA } from '../data/adversaries';
import { ENVIRONMENTS_DATA } from '../data/environments';

export interface ChatEntry {
  id: string;
  timestamp: string;
  sender: string;
  text?: string;
  rollResult?: {
    hopeValue: number;
    fearValue: number;
    modifier: number;
    total: number;
    outcome: string;
    isCritical: boolean;
    targetDifficulty?: number;
  };
  type: 'chat' | 'roll' | 'system';
}

interface VttSidebarProps {
  sessionState: SessionState;
  setSessionState: React.Dispatch<React.SetStateAction<SessionState>>;
  players: PlayerCharacter[];
  setPlayers: React.Dispatch<React.SetStateAction<PlayerCharacter[]>>;
  chatLog: ChatEntry[];
  setChatLog: React.Dispatch<React.SetStateAction<ChatEntry[]>>;
  onOpenDiceRoller: () => void;
  onOpenWidgetCatalog: () => void;
  onSelectEnvironment: (env: EnvironmentCard) => void;
  onAddAdversaryToCombat: (participant: CombatParticipant) => void;
  onOpenWindow: (type: 'player' | 'adversary' | 'rule', id: string, name: string) => void;
}

export const VttSidebar: React.FC<VttSidebarProps> = ({
  sessionState,
  setSessionState,
  players,
  setPlayers,
  chatLog,
  setChatLog,
  onOpenDiceRoller,
  onOpenWidgetCatalog,
  onSelectEnvironment,
  onAddAdversaryToCombat,
  onOpenWindow,
}) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'combat' | 'scenes' | 'journal' | 'compendium' | 'settings'>('chat');
  
  // Chat Input State
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  // Search States
  const [ruleSearch, setRuleSearch] = useState('');
  const [advSearch, setAdvSearch] = useState('');
  
  // Sound toggle helper
  const [isAmbientOn, setIsAmbientOn] = useState(false);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (activeTab === 'chat') {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatLog, activeTab]);

  // Command parser for Chat
  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const text = chatInput.trim();

    // 1. Check for command: /roll or /r
    if (text.startsWith('/roll ') || text.startsWith('/r ')) {
      const rest = text.replace(/^\/(roll|r)\s+/, '');
      // Match modifier and target DC: e.g. "+3 vs 14" or "2 vs 10" or "+1"
      const match = rest.match(/^([+-]?\d+)(?:\s+vs\s+(\d+))?/i);
      
      let mod = 2;
      let dc: number | undefined = undefined;
      
      if (match) {
        mod = parseInt(match[1], 10);
        if (match[2]) {
          dc = parseInt(match[2], 10);
        }
      }

      soundFX.playDiceRoll();
      setTimeout(() => {
        const roll = rollDualityDice({
          roller: 'GM (VTT Chat)',
          modifier: mod,
          targetDifficulty: dc,
        });

        // Append Roll entry
        const rollEntry: ChatEntry = {
          id: `chat-${Date.now()}`,
          timestamp,
          sender: 'GM (Duality Roll)',
          type: 'roll',
          rollResult: {
            hopeValue: roll.hopeValue,
            fearValue: roll.fearValue,
            modifier: roll.modifier,
            total: roll.total,
            outcome: roll.outcome,
            isCritical: roll.isCritical,
            targetDifficulty: roll.targetDifficulty,
          },
        };

        setChatLog((prev) => [...prev, rollEntry]);
        
        // Add Action token on any dice roll
        setSessionState((prev) => ({
          ...prev,
          actionTokens: prev.actionTokens + 1,
        }));

        if (roll.isCritical || roll.outcome.includes('Hope')) {
          soundFX.playHopeChime();
        } else {
          soundFX.playFearBoom();
        }
      }, 300);

    } else {
      // Standard chat message
      const message: ChatEntry = {
        id: `chat-${Date.now()}`,
        timestamp,
        sender: 'GM',
        text,
        type: 'chat',
      };
      setChatLog((prev) => [...prev, message]);
      soundFX.playClockTick();
    }

    setChatInput('');
  };

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

  const toggleAmbientSound = () => {
    const newState = soundFX.toggleAmbientPad();
    setIsAmbientOn(newState);
  };

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

  const spawnAdversaryToken = (adv: any) => {
    const participant: CombatParticipant = {
      id: 'adv-' + Date.now(),
      adversaryId: adv.id,
      name: adv.name,
      tier: adv.tier,
      type: adv.type,
      difficulty: adv.difficulty,
      evasion: adv.evasion,
      armor: adv.armor,
      maxHp: adv.hp,
      currentHp: adv.hp,
      maxStress: adv.stress,
      currentStress: 0,
      thresholds: adv.thresholds,
      attacks: adv.attacks,
      features: adv.features,
      conditions: [],
    };
    onAddAdversaryToCombat(participant);
    soundFX.playClockTick();
  };

  return (
    <div className="w-80 h-full bg-slate-900 border-l border-slate-800 flex flex-col relative select-none">
      {/* VTT Sidebar Tabs */}
      <div className="flex bg-slate-950 border-b border-slate-800 px-1 py-1 text-slate-400 gap-1">
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex-1 py-1.5 rounded flex items-center justify-center transition ${
            activeTab === 'chat' ? 'bg-slate-800 text-amber-300 border border-amber-900/30' : 'hover:bg-slate-900 hover:text-slate-200'
          }`}
          title="Chat Log & Roll Feed (💬)"
        >
          <MessageSquare className="w-4 h-4" />
        </button>

        <button
          onClick={() => setActiveTab('combat')}
          className={`flex-1 py-1.5 rounded flex items-center justify-center transition ${
            activeTab === 'combat' ? 'bg-slate-800 text-amber-300 border border-amber-900/30' : 'hover:bg-slate-900 hover:text-slate-200'
          }`}
          title="Combat / Initiative Tracker (⚔️)"
        >
          <Swords className="w-4 h-4" />
          {sessionState.combatParticipants.length > 0 && (
            <span className="absolute ml-5 mb-3 bg-red-600 text-white rounded-full w-2 h-2" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('scenes')}
          className={`flex-1 py-1.5 rounded flex items-center justify-center transition ${
            activeTab === 'scenes' ? 'bg-slate-800 text-amber-300 border border-amber-900/30' : 'hover:bg-slate-900 hover:text-slate-200'
          }`}
          title="Scene / Environments Directory (🗺️)"
        >
          <Map className="w-4 h-4" />
        </button>

        <button
          onClick={() => setActiveTab('journal')}
          className={`flex-1 py-1.5 rounded flex items-center justify-center transition ${
            activeTab === 'journal' ? 'bg-slate-800 text-amber-300 border border-amber-900/30' : 'hover:bg-slate-900 hover:text-slate-200'
          }`}
          title="Journal entries & clocks (📔)"
        >
          <Book className="w-4 h-4" />
        </button>

        <button
          onClick={() => setActiveTab('compendium')}
          className={`flex-1 py-1.5 rounded flex items-center justify-center transition ${
            activeTab === 'compendium' ? 'bg-slate-800 text-amber-300 border border-amber-900/30' : 'hover:bg-slate-900 hover:text-slate-200'
          }`}
          title="Rules & Monsters Compendium (📚)"
        >
          <BookOpen className="w-4 h-4" />
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex-1 py-1.5 rounded flex items-center justify-center transition ${
            activeTab === 'settings' ? 'bg-slate-800 text-amber-300 border border-amber-900/30' : 'hover:bg-slate-900 hover:text-slate-200'
          }`}
          title="Game Settings (⚙️)"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>

      {/* Sidebar Content Area */}
      <div className="flex-1 overflow-y-auto bg-slate-900/55 scrollbar-thin scrollbar-thumb-slate-800 text-xs">
        {/* 1. Chat Feed Tab */}
        {activeTab === 'chat' && (
          <div className="h-full flex flex-col justify-between p-3 space-y-3">
            <div className="flex-1 overflow-y-auto pr-1 space-y-2.5 max-h-[calc(100vh-170px)]">
              {chatLog.length === 0 ? (
                <div className="text-center py-10 text-slate-600">
                  <MessageSquare className="w-8 h-8 mx-auto opacity-35 mb-2" />
                  <p>Chat log is empty.</p>
                  <p className="text-[10px] mt-1">Roll duality dice or enter a chat message below.</p>
                </div>
              ) : (
                chatLog.map((log) => (
                  <div key={log.id} className="bg-slate-950/70 border border-slate-800 rounded p-2.5 space-y-1.5 shadow">
                    <div className="flex justify-between items-center text-[10px] text-slate-500 border-b border-slate-900 pb-1">
                      <span className="font-serif font-bold text-amber-400/80">{log.sender}</span>
                      <span>{log.timestamp}</span>
                    </div>

                    {log.type === 'chat' && (
                      <p className="text-slate-300 text-[11px] leading-relaxed break-words font-sans select-text">{log.text}</p>
                    )}

                    {log.type === 'roll' && log.rollResult && (
                      <div className="space-y-2">
                        {/* Gold / Purple die results */}
                        <div className="grid grid-cols-2 gap-2 text-center text-xs">
                          <div className="bg-amber-950/30 border border-amber-500/20 rounded py-1">
                            <span className="text-[9px] uppercase font-bold text-amber-400 block">Hope Die</span>
                            <span className="font-mono font-extrabold text-amber-300 text-sm">{log.rollResult.hopeValue}</span>
                          </div>
                          <div className="bg-purple-950/30 border border-purple-500/20 rounded py-1">
                            <span className="text-[9px] uppercase font-bold text-purple-400 block">Fear Die</span>
                            <span className="font-mono font-extrabold text-purple-300 text-sm">{log.rollResult.fearValue}</span>
                          </div>
                        </div>

                        {/* Roll calculation */}
                        <div className="text-center">
                          <div className="text-[10px] text-slate-400">
                            Dice ({log.rollResult.hopeValue} + {log.rollResult.fearValue}) + Mod ({log.rollResult.modifier >= 0 ? `+${log.rollResult.modifier}` : log.rollResult.modifier})
                          </div>
                          <div className="font-mono font-extrabold text-base text-slate-200">
                            Total: {log.rollResult.total}{' '}
                            {log.rollResult.targetDifficulty && (
                              <span className="text-[10px] font-normal text-slate-400">vs DC {log.rollResult.targetDifficulty}</span>
                            )}
                          </div>
                          <div className={`mt-1 inline-block text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase border ${
                            log.rollResult.isCritical
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                              : log.rollResult.outcome.includes('Hope')
                              ? 'bg-amber-600/10 text-amber-300 border-amber-600/30'
                              : 'bg-purple-600/10 text-purple-300 border-purple-600/30'
                          }`}>
                            {log.rollResult.outcome}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Chat Input Field */}
            <form onSubmit={handleSendChat} className="flex items-center space-x-1.5 border-t border-slate-800 pt-2.5 bg-slate-900/90 z-10">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Message or /roll +2 vs 13..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-slate-200 text-xs focus:outline-none focus:border-amber-500"
              />
              <button
                type="submit"
                className="p-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded transition"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}

        {/* 2. Combat Tracker Tab */}
        {activeTab === 'combat' && (
          <div className="p-3 space-y-4">
            {/* Fear and Action Counters */}
            <div className="grid grid-cols-2 gap-2">
              {/* Fear Pool */}
              <div className="bg-slate-950/70 p-2 border border-slate-800 rounded space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-purple-400 flex items-center gap-1">
                  <Skull className="w-3 h-3" />
                  Fear Pool
                </span>
                <div className="flex items-center justify-between">
                  <button onClick={() => handleFearChange(-1)} className="w-5 h-5 rounded bg-slate-900 text-slate-300 font-bold">-</button>
                  <span className="font-mono text-base font-bold text-amber-400">{sessionState.fearPool}</span>
                  <button onClick={() => handleFearChange(1)} className="w-5 h-5 rounded bg-purple-900 text-purple-100 font-bold">+</button>
                </div>
              </div>

              {/* Action Tokens */}
              <div className="bg-slate-950/70 p-2 border border-slate-800 rounded space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-amber-400 flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  Actions
                </span>
                <div className="flex items-center justify-between">
                  <button onClick={() => handleActionTokenChange(-1)} className="w-5 h-5 rounded bg-slate-900 text-slate-300 font-bold">-</button>
                  <span className="font-mono text-base font-bold text-amber-400">{sessionState.actionTokens}</span>
                  <button onClick={() => handleActionTokenChange(1)} className="w-5 h-5 rounded bg-amber-600 text-slate-950 font-bold">+</button>
                </div>
              </div>
            </div>

            {/* Combatant List */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <span>Active Combatants</span>
                <span className="text-amber-400">{sessionState.combatParticipants.length} foes</span>
              </div>

              {sessionState.combatParticipants.length === 0 ? (
                <div className="text-center py-8 text-slate-600 border border-dashed border-slate-800 rounded">
                  <p>No active adversaries.</p>
                  <p className="text-[9px] mt-0.5">Add monster from Compendium tab.</p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {sessionState.combatParticipants.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => onOpenWindow('adversary', p.id, p.name)}
                      className="bg-slate-950/60 hover:bg-slate-950 p-2 border border-slate-800 rounded flex items-center justify-between gap-2 cursor-pointer transition"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-1.5">
                          <span className="text-[9px] uppercase font-semibold text-red-400 bg-red-950 px-1 border border-red-900 rounded">
                            T{p.tier}
                          </span>
                          <span className="font-bold text-slate-200">{p.name}</span>
                        </div>
                        {/* HP bar overlay */}
                        <div className="w-full bg-slate-900 h-1 rounded overflow-hidden mt-1.5">
                          <div
                            className="bg-red-600 h-full"
                            style={{ width: `${(p.currentHp / p.maxHp) * 100}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center space-x-1 text-[10px]">
                        <span className="font-mono text-amber-400 font-bold" title="Difficulty Score">DC {p.difficulty}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 3. Scenes / Environments Tab */}
        {activeTab === 'scenes' && (
          <div className="p-3 space-y-4">
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Active Environment</span>
              {sessionState.activeEnvironment ? (
                <div className="bg-gradient-to-r from-purple-950/20 to-slate-950 border border-purple-500/20 p-3 rounded space-y-2">
                  <div className="flex justify-between items-center border-b border-slate-900 pb-1">
                    <span className="font-serif font-bold text-amber-200">{sessionState.activeEnvironment.name}</span>
                    <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1 rounded text-[9px] font-mono">
                      DC {sessionState.activeEnvironment.difficulty}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 select-text leading-relaxed">{sessionState.activeEnvironment.description}</p>
                </div>
              ) : (
                <div className="text-center py-4 text-slate-500">No active environment selected.</div>
              )}
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Scene Directory</span>
              <div className="space-y-1.5">
                {ENVIRONMENTS_DATA.map((env) => {
                  const isActive = sessionState.activeEnvironment?.id === env.id;
                  return (
                    <div
                      key={env.id}
                      className={`p-2 rounded border flex justify-between items-center transition ${
                        isActive ? 'bg-amber-500/10 border-amber-500/50 text-amber-200' : 'bg-slate-950/50 border-slate-800'
                      }`}
                    >
                      <div>
                        <div className="font-bold">{env.name}</div>
                        <span className="text-[9px] text-slate-500">Tier {env.tier} • {env.category}</span>
                      </div>
                      {!isActive && (
                        <button
                          onClick={() => {
                            onSelectEnvironment(env);
                            soundFX.playClockTick();
                          }}
                          className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 rounded text-[10px] font-bold border border-slate-700"
                        >
                          Activate
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* 4. Journal / Notes & Clocks Tab */}
        {activeTab === 'journal' && (
          <div className="p-3 space-y-4">
            {/* Clocks */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase">
                <span>Countdown Clocks</span>
              </div>
              
              {sessionState.clocks.length === 0 ? (
                <div className="text-center py-6 text-slate-600 border border-dashed border-slate-800 rounded">
                  No clocks running.
                </div>
              ) : (
                <div className="space-y-2">
                  {sessionState.clocks.map((clock) => (
                    <div key={clock.id} className="bg-slate-950/70 p-2.5 border border-slate-800 rounded space-y-2">
                      <div className="font-bold flex justify-between">
                        <span>{clock.name}</span>
                        <span className="text-[9px] text-slate-500">{clock.currentSegments}/{clock.maxSegments} Segs</span>
                      </div>
                      
                      {/* Segment wedge selector */}
                      <div className="flex gap-1">
                        {Array.from({ length: clock.maxSegments }).map((_, idx) => {
                          const isFilled = idx < clock.currentSegments;
                          return (
                            <button
                              key={idx}
                              onClick={() => handleClockSegmentClick(clock.id, idx)}
                              className={`flex-1 h-4 rounded-sm border transition ${
                                isFilled ? 'bg-amber-500 border-amber-400' : 'bg-slate-900 border-slate-800'
                              }`}
                            />
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick campaign notes pad */}
            <div className="space-y-2 border-t border-slate-800 pt-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Campaign Diary / Notes</span>
              <textarea
                value={sessionState.sessionNotes}
                onChange={(e) => setSessionState((prev) => ({ ...prev, sessionNotes: e.target.value }))}
                rows={8}
                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-300 font-mono text-[11px] leading-relaxed resize-none focus:outline-none focus:border-amber-500"
                placeholder="Type session clues, loot, NPC notes here..."
              />
            </div>
          </div>
        )}

        {/* 5. Rules & Monster Compendium Tab */}
        {activeTab === 'compendium' && (
          <div className="p-3 space-y-4">
            {/* Rules SRD Directory */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Rules Reference SRD</span>
              <input
                type="text"
                value={ruleSearch}
                onChange={(e) => setRuleSearch(e.target.value)}
                placeholder="Search rule keys (e.g., evasion, combat)..."
                className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs focus:outline-none focus:border-amber-500"
              />
              <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
                {RULES_DATA.filter((r) =>
                  r.title.toLowerCase().includes(ruleSearch.toLowerCase()) ||
                  r.summary.toLowerCase().includes(ruleSearch.toLowerCase())
                ).map((rule) => (
                  <div
                    key={rule.id}
                    onClick={() => onOpenWindow('rule', rule.id, rule.title)}
                    className="bg-slate-950/50 hover:bg-slate-950 p-2 border border-slate-800 rounded cursor-pointer text-[11px] transition"
                  >
                    <div className="font-serif font-bold text-amber-300">{rule.title}</div>
                    <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">{rule.summary}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Adversaries Directory */}
            <div className="space-y-2 border-t border-slate-800 pt-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Adversary Compendium</span>
              <input
                type="text"
                value={advSearch}
                onChange={(e) => setAdvSearch(e.target.value)}
                placeholder="Search creatures (e.g. cultist, skeleton)..."
                className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs focus:outline-none focus:border-amber-500"
              />
              <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                {ADVERSARIES_DATA.filter((a) =>
                  a.name.toLowerCase().includes(advSearch.toLowerCase())
                ).map((adv) => (
                  <div
                    key={adv.id}
                    className="bg-slate-950/50 p-2 border border-slate-800 rounded flex justify-between items-center transition"
                  >
                    <div
                      onClick={() => onOpenWindow('adversary', adv.id, adv.name)}
                      className="cursor-pointer flex-1"
                    >
                      <div className="font-bold text-slate-200">{adv.name}</div>
                      <span className="text-[9px] text-slate-500">Tier {adv.tier} {adv.type} • HP {adv.hp}</span>
                    </div>
                    <button
                      onClick={() => spawnAdversaryToken(adv)}
                      className="p-1 bg-red-900/60 hover:bg-red-800 text-red-200 rounded border border-red-700/50"
                      title="Add to VTT Active Combat"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 6. Settings & Widgets Tab */}
        {activeTab === 'settings' && (
          <div className="p-3 space-y-4">
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Ambient Soundscapes</span>
              <button
                onClick={toggleAmbientSound}
                className={`w-full py-2 rounded flex items-center justify-center space-x-1.5 font-bold border transition ${
                  isAmbientOn
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                    : 'bg-slate-950 text-slate-500 border-slate-800 hover:text-slate-300'
                }`}
              >
                {isAmbientOn ? (
                  <>
                    <Volume2 className="w-4 h-4 animate-bounce" />
                    <span>Mute Ambient Path (Playing)</span>
                  </>
                ) : (
                  <>
                    <VolumeX className="w-4 h-4" />
                    <span>Play Ambient Path (Muted)</span>
                  </>
                )}
              </button>
            </div>

            <div className="space-y-2 border-t border-slate-800 pt-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Sidebar Quick Rolls</span>
              <button
                onClick={onOpenDiceRoller}
                className="w-full py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-bold rounded shadow transition flex items-center justify-center space-x-1.5"
              >
                <Dices className="w-4 h-4" />
                <span>Trigger Duality Dice Roll</span>
              </button>
            </div>

            <div className="space-y-2 border-t border-slate-800 pt-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">VTT Grid Layout Controls</span>
              <button
                onClick={onOpenWidgetCatalog}
                className="w-full py-2 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 rounded font-bold transition flex items-center justify-center space-x-1.5"
              >
                <PlusCircle className="w-4 h-4 text-amber-400" />
                <span>Configure Widget Widgets</span>
              </button>
            </div>

            <div className="space-y-2 border-t border-slate-800 pt-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Maintenance</span>
              <button
                onClick={() => {
                  if (confirm('Clear rolling chat feed history?')) {
                    setChatLog([]);
                  }
                }}
                className="w-full py-1.5 bg-red-950/45 hover:bg-red-900 text-red-200 border border-red-900/50 rounded font-bold transition flex items-center justify-center space-x-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear Chat Log</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
