/**
 * Daggerheart Digital GM Screen & Foundry VTT Main Application
 */

import React, { useState, useEffect } from 'react';
import { TopBar } from './components/TopBar';
import { ModularDashboard } from './components/ModularDashboard';
import { WidgetCatalogModal } from './components/WidgetCatalogModal';
import { PlayerDashboard } from './components/PlayerDashboard';
import { EncounterTracker } from './components/EncounterTracker';
import { AdversaryLibrary } from './components/AdversaryLibrary';
import { EnvironmentLibrary } from './components/EnvironmentLibrary';
import { DomainDeckLibrary } from './components/DomainDeckLibrary';
import { SessionNotesAndClocks } from './components/SessionNotesAndClocks';
import { DualityDiceRoller } from './components/DualityDiceRoller';
import { RulesReferenceModal } from './components/RulesReferenceModal';
import { AutoEncounterModal } from './components/AutoEncounterModal';
import { PlayerViewModal } from './components/PlayerViewModal';
import { QuickSearchModal } from './components/QuickSearchModal';

// Interactive VTT Elements
import { VttMapCanvas } from './components/VttMapCanvas';
import { VttSidebar, ChatEntry } from './components/VttSidebar';
import { VttWindow } from './components/VttWindow';
import { DualityDiceRollerEmbed } from './components/DualityDiceRollerEmbed';

// Icons
import { Compass, Sparkles, Swords, Clock, BookOpen, Dices } from 'lucide-react';

import { DEFAULT_PLAYERS } from './data/defaultPlayers';
import { ENVIRONMENTS_DATA } from './data/environments';
import { RULES_DATA } from './data/rulesData';
import {
  PlayerCharacter,
  SessionState,
  CombatParticipant,
  EnvironmentCard,
  DashboardWidgetConfig,
  WidgetType,
  Campaign,
  VttScene,
} from './types';
import { syncService } from './utils/syncService';
import { soundFX } from './utils/audioSynth';

const DEFAULT_WIDGETS: DashboardWidgetConfig[] = [
  {
    id: 'w-fear-action',
    type: 'fear-action-tracker',
    title: 'Fear Pool & Action Token Tracker',
    colSpan: 3,
    isVisible: true,
  },
  {
    id: 'w-duality-roller',
    type: 'duality-roller',
    title: 'Duality Dice Quick Roller (2d12)',
    colSpan: 1,
    isVisible: true,
  },
  {
    id: 'w-player-roster',
    type: 'player-roster',
    title: 'Party Roster & Health Cards',
    colSpan: 2,
    isVisible: true,
  },
  {
    id: 'w-encounter-tracker',
    type: 'encounter-tracker',
    title: 'Active Combat Encounter Runner',
    colSpan: 2,
    isVisible: true,
  },
  {
    id: 'w-active-environment',
    type: 'active-environment',
    title: 'Active Scene & Hazards',
    colSpan: 1,
    isVisible: true,
  },
  {
    id: 'w-threat-clocks',
    type: 'threat-clocks',
    title: 'Session Threat Clocks',
    colSpan: 1,
    isVisible: true,
  },
  {
    id: 'w-scratchpad',
    type: 'gm-scratchpad',
    title: 'GM Campaign Scratchpad & Notes',
    colSpan: 2,
    isVisible: true,
  },
];

const DEFAULT_CHAT_LOG: ChatEntry[] = [
  {
    id: 'c-init-1',
    timestamp: '08:14:22 PM',
    sender: 'System Log',
    type: 'system',
    text: '🛡️ Interactive Foundry VTT Sandbox Initialized. Grid coordinate battle map is fully armed! Click & drag tokens to test.',
  },
  {
    id: 'c-init-2',
    timestamp: '08:15:05 PM',
    sender: 'Valen (Duality Roll)',
    type: 'roll',
    rollResult: {
      hopeValue: 9,
      fearValue: 4,
      modifier: 2,
      total: 15,
      outcome: 'Success with Hope',
      isCritical: false,
      targetDifficulty: 13,
    }
  },
  {
    id: 'c-init-3',
    timestamp: '08:15:40 PM',
    sender: 'GM Prompt',
    type: 'chat',
    text: 'A howling wind blows through the Murkwood branches. Several skeletons raise their ancient, rusted claymores from the swamp bed!',
  }
];

const DEFAULT_CAMPAIGNS: Campaign[] = [
  {
    id: 'camp-1',
    name: 'The Murkwood Chronicles',
    description: 'An ancient, swampy wilderness campaign filled with skeletons, rising mist, and mysterious relics.',
    activeSceneId: 'scene-1-1',
    scenes: [
      {
        id: 'scene-1-1',
        name: 'The Swamp Ambush',
        description: 'A tactical grid battle map set in the heart of the Murkwood swamp.',
        mapUrl: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=1000',
        mapTheme: 'wood',
        gridVisible: true,
      },
      {
        id: 'scene-1-2',
        name: 'Sunken Relic Citadel',
        description: 'An ancient flooded stone hall deep beneath the marshlands.',
        mapUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1000',
        mapTheme: 'stone',
        gridVisible: true,
      },
    ],
  },
  {
    id: 'camp-2',
    name: 'Shattered Peaks Expedition',
    description: 'A high-altitude trek across frozen cliffs and wind-swept stone ruins.',
    activeSceneId: 'scene-2-1',
    scenes: [
      {
        id: 'scene-2-1',
        name: 'Wyvern\'s Crest Pass',
        description: 'A treacherous narrow path hanging off the mountain peak.',
        mapUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1000',
        mapTheme: 'parchment',
        gridVisible: true,
      },
    ],
  },
];

interface VttWindowConfig {
  id: string;
  title: string;
  type: 'combat' | 'players' | 'adversary' | 'rule' | 'clocks' | 'domains' | 'roller';
  refId?: string;
  zIndex: number;
}

export default function App() {
  const [campaigns, setCampaigns] = useState<Campaign[]>(() => {
    const saved = localStorage.getItem('dh_campaigns');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return DEFAULT_CAMPAIGNS;
  });

  const [activeCampaignId, setActiveCampaignId] = useState<string>(() => {
    const saved = localStorage.getItem('dh_active_campaign_id');
    return saved || 'camp-1';
  });

  // Save campaigns to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('dh_campaigns', JSON.stringify(campaigns));
  }, [campaigns]);

  useEffect(() => {
    localStorage.setItem('dh_active_campaign_id', activeCampaignId);
  }, [activeCampaignId]);

  const activeCampaign = campaigns.find(c => c.id === activeCampaignId) || campaigns[0] || null;
  const activeScene = activeCampaign ? (activeCampaign.scenes.find(s => s.id === activeCampaign.activeSceneId) || activeCampaign.scenes[0] || null) : null;

  const handleUpdateActiveScene = (updatedScene: VttScene) => {
    setCampaigns(prev => prev.map(camp => {
      if (camp.id === activeCampaignId) {
        return {
          ...camp,
          scenes: camp.scenes.map(sc => sc.id === updatedScene.id ? updatedScene : sc)
        };
      }
      return camp;
    }));
  };
  const [widgets, setWidgets] = useState<DashboardWidgetConfig[]>(() => {
    const saved = localStorage.getItem('dh_dashboard_widgets');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return DEFAULT_WIDGETS;
  });

  const [players, setPlayers] = useState<PlayerCharacter[]>(() => {
    const saved = localStorage.getItem('dh_party_roster');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return DEFAULT_PLAYERS;
  });

  const [sessionState, setSessionState] = useState<SessionState>(() => {
    const saved = localStorage.getItem('dh_session_state');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return {
      fearPool: 2,
      maxFearPool: 6,
      actionTokens: 0,
      activeSceneName: 'Act I: The Murkwood Ambush',
      activeEnvironment: ENVIRONMENTS_DATA[0],
      combatParticipants: [],
      clocks: [
        { id: 'c1', name: 'Swamp Gas Eruption', maxSegments: 6, currentSegments: 1, type: 'Threat' },
        { id: 'c2', name: 'Reinforcement Horn', maxSegments: 4, currentSegments: 2, type: 'Threat' },
      ],
      rollHistory: [],
      sessionNotes: 'Campaign Note: The cultists are looking for the Sunken Relic beneath the Citadel ruins. Valen has a personal score to settle with the Bandit Captain.',
      isCombatActive: false,
    };
  });

  // Theme & Layout Toggle State
  const [vttMode, setVttMode] = useState<boolean>(true); // Defaults to beautiful VTT mode on load!
  const [chatLog, setChatLog] = useState<ChatEntry[]>(() => {
    const saved = localStorage.getItem('dh_vtt_chat_log');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return DEFAULT_CHAT_LOG;
  });

  // Floating windows manager state
  const [openWindows, setOpenWindows] = useState<VttWindowConfig[]>(() => {
    // Open some default windows so it looks populated
    return [
      { id: 'combat', title: 'Active Combat Tracker', type: 'combat', zIndex: 51 },
      { id: 'players', title: 'Party Status & Character Sheets', type: 'players', zIndex: 52 },
    ];
  });

  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Modals (Used in classic dashboard)
  const [isDiceRollerOpen, setIsDiceRollerOpen] = useState(false);
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [isAutoEncounterOpen, setIsAutoEncounterOpen] = useState(false);
  const [isPlayerViewOpen, setIsPlayerViewOpen] = useState(false);
  const [isQuickSearchOpen, setIsQuickSearchOpen] = useState(false);
  const [isWidgetCatalogOpen, setIsWidgetCatalogOpen] = useState(false);

  // Persistence
  useEffect(() => {
    localStorage.setItem('dh_dashboard_widgets', JSON.stringify(widgets));
  }, [widgets]);

  useEffect(() => {
    localStorage.setItem('dh_party_roster', JSON.stringify(players));
  }, [players]);

  useEffect(() => {
    localStorage.setItem('dh_session_state', JSON.stringify(sessionState));
    syncService.broadcast('SESSION_STATE_UPDATE', sessionState);
  }, [sessionState]);

  useEffect(() => {
    localStorage.setItem('dh_vtt_chat_log', JSON.stringify(chatLog));
  }, [chatLog]);

  // Window Focus Helpers
  const handleOpenWindow = (type: VttWindowConfig['type'], refId?: string, title?: string) => {
    const id = `${type}${refId ? `-${refId}` : ''}`;
    soundFX.playClockTick();

    setOpenWindows((prev) => {
      const exists = prev.some((w) => w.id === id);
      const maxZ = prev.length > 0 ? Math.max(...prev.map((w) => w.zIndex)) : 50;

      if (exists) {
        // Bring to front
        return prev.map((w) => (w.id === id ? { ...w, zIndex: maxZ + 1 } : w));
      }

      // Append new floating window
      const newWin: VttWindowConfig = {
        id,
        title: title || `${type.charAt(0).toUpperCase()}${type.slice(1)} Window`,
        type,
        refId,
        zIndex: maxZ + 1,
      };
      return [...prev, newWin];
    });
  };

  const handleFocusWindow = (id: string) => {
    setOpenWindows((prev) => {
      const maxZ = prev.length > 0 ? Math.max(...prev.map((w) => w.zIndex)) : 50;
      return prev.map((w) => (w.id === id ? { ...w, zIndex: maxZ + 1 } : w));
    });
  };

  const handleCloseWindow = (id: string) => {
    setOpenWindows((prev) => prev.filter((w) => w.id !== id));
  };

  const winTypeMapper = (type: string): VttWindowConfig['type'] => {
    if (type === 'player' || type === 'players') return 'players';
    if (type === 'adversary') return 'adversary';
    if (type === 'rule') return 'rule';
    return 'combat';
  };

  const handleAddWidget = (type: WidgetType, title: string, colSpan?: 1 | 2 | 3) => {
    const newWidget: DashboardWidgetConfig = {
      id: `w-${type}-${Date.now()}`,
      type,
      title,
      colSpan: colSpan || 2,
      isVisible: true,
    };
    setWidgets((prev) => [...prev, newWidget]);
  };

  const handleToggleWidgetVisibility = (id: string) => {
    setWidgets((prev) =>
      prev.map((w) => (w.id === id ? { ...w, isVisible: !w.isVisible } : w))
    );
  };

  const handleResetLayout = (preset: 'all' | 'combat' | 'minimal' = 'all') => {
    if (preset === 'combat') {
      setWidgets([
        { id: 'w-fear-action', type: 'fear-action-tracker', title: 'Fear Pool & Action Token Tracker', colSpan: 3, isVisible: true },
        { id: 'w-encounter-tracker', type: 'encounter-tracker', title: 'Active Combat Encounter Runner', colSpan: 2, isVisible: true },
        { id: 'w-duality-roller', type: 'duality-roller', title: 'Duality Dice Quick Roller (2d12)', colSpan: 1, isVisible: true },
        { id: 'w-player-roster', type: 'player-roster', title: 'Party Roster & Health Cards', colSpan: 3, isVisible: true },
      ]);
    } else if (preset === 'minimal') {
      setWidgets([
        { id: 'w-fear-action', type: 'fear-action-tracker', title: 'Fear Pool & Action Token Tracker', colSpan: 3, isVisible: true },
        { id: 'w-threat-clocks', type: 'threat-clocks', title: 'Session Threat Clocks', colSpan: 1, isVisible: true },
        { id: 'w-active-environment', type: 'active-environment', title: 'Active Scene & Hazards', colSpan: 2, isVisible: true },
      ]);
    } else {
      setWidgets(DEFAULT_WIDGETS);
    }
    setIsWidgetCatalogOpen(false);
  };

  const handleAddAdversaryToCombat = (participant: CombatParticipant) => {
    setSessionState((prev) => ({
      ...prev,
      combatParticipants: [...prev.combatParticipants, participant],
      isCombatActive: true,
    }));
    setActiveTab('encounter');
  };

  const handleSelectEnvironment = (env: EnvironmentCard) => {
    setSessionState((prev) => ({
      ...prev,
      activeEnvironment: env,
      activeSceneName: `Scene: ${env.name}`,
    }));
    setActiveTab('environments');
  };

  return (
    <div className={`min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col selection:bg-amber-500 selection:text-slate-950 ${vttMode ? 'h-screen overflow-hidden' : ''}`}>
      {/* Top Bar Navigation & Trackers */}
      <TopBar
        sessionState={sessionState}
        setSessionState={setSessionState}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenDiceRoller={() => {
          if (vttMode) {
            handleOpenWindow('roller');
          } else {
            setIsDiceRollerOpen(true);
          }
        }}
        onOpenRules={() => {
          if (vttMode) {
            handleOpenWindow('rule', 'r1', 'Combat Rules SRD');
          } else {
            setIsRulesOpen(true);
          }
        }}
        onOpenAutoEncounter={() => setIsAutoEncounterOpen(true)}
        onOpenQuickSearch={() => setIsQuickSearchOpen(true)}
        onOpenPlayerView={() => setIsPlayerViewOpen(true)}
        onOpenWidgetCatalog={() => setIsWidgetCatalogOpen(true)}
        vttMode={vttMode}
        setVttMode={setVttMode}
        activeCampaignName={activeCampaign?.name}
      />

      {vttMode ? (
        /* ==================== STUNNING FOUNDRY VTT SANDBOX WORKSPACE ==================== */
        <div className="flex-1 flex overflow-hidden relative">
          
          {/* Left-Floating Vertical Controls Palette */}
          <div className="absolute left-3 top-3 z-20 flex flex-col bg-slate-950/90 border border-amber-500/30 p-1.5 rounded-xl shadow-2xl gap-2 text-slate-400">
            <button
              onClick={() => handleOpenWindow('players', undefined, 'Party Status & Character Sheets')}
              className="p-2 rounded-lg hover:bg-slate-800 hover:text-amber-300 transition"
              title="Party Characters Sheet"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
            </button>
            <button
              onClick={() => handleOpenWindow('combat', undefined, 'Active Combat Tracker')}
              className="p-2 rounded-lg hover:bg-slate-800 hover:text-red-400 transition"
              title="Combat Tracker"
            >
              <Swords className="w-4 h-4 text-red-500" />
            </button>
            <button
              onClick={() => handleOpenWindow('clocks', undefined, 'Campaign Notes & Countdown Clocks')}
              className="p-2 rounded-lg hover:bg-slate-800 hover:text-amber-300 transition"
              title="Campaign Clocks & Notes"
            >
              <Clock className="w-4 h-4 text-amber-500" />
            </button>
            <button
              onClick={() => handleOpenWindow('domains', undefined, 'Domain Magic Card Deck')}
              className="p-2 rounded-lg hover:bg-slate-800 hover:text-amber-400 transition"
              title="Domain Card Deck SRD"
            >
              <BookOpen className="w-4 h-4 text-amber-400" />
            </button>
            <button
              onClick={() => handleOpenWindow('roller', undefined, 'Duality 2d12 Quick Roller')}
              className="p-2 rounded-lg hover:bg-slate-800 hover:text-amber-300 transition animate-pulse"
              title="2d12 Dice Roller"
            >
              <Dices className="w-4 h-4 text-amber-400" />
            </button>
          </div>

          {/* Center Tactical Board Area */}
          <div className="flex-1 relative p-3 pl-16 overflow-hidden">
            <VttMapCanvas
              players={players}
              combatParticipants={sessionState.combatParticipants}
              setPlayers={setPlayers}
              setCombatParticipants={(updater) => {
                setSessionState((prev) => ({
                  ...prev,
                  combatParticipants: updater(prev.combatParticipants),
                }));
              }}
              onDoubleSelectToken={(type, id) => {
                if (type === 'player') {
                  handleOpenWindow('players', undefined, 'Party Status & Character Sheets');
                } else {
                  const foe = sessionState.combatParticipants.find((p) => p.id === id);
                  if (foe) {
                    handleOpenWindow('adversary', id, `${foe.name} Actor Sheet`);
                  }
                }
              }}
              activeScene={activeScene}
              onUpdateActiveScene={handleUpdateActiveScene}
            />
          </div>

          {/* Floating Sheets Windows Overlay Layer */}
          {openWindows.map((win) => (
            <VttWindow
              key={win.id}
              id={win.id}
              title={win.title}
              onClose={() => handleCloseWindow(win.id)}
              onFocus={() => handleFocusWindow(win.id)}
              zIndex={win.zIndex}
              width={win.type === 'players' || win.type === 'clocks' ? 'w-[520px]' : win.type === 'combat' ? 'w-[420px]' : 'w-96'}
              height="max-h-[550px]"
            >
              {win.type === 'players' && (
                <PlayerDashboard
                  players={players}
                  setPlayers={setPlayers}
                />
              )}

              {win.type === 'combat' && (
                <EncounterTracker
                  sessionState={sessionState}
                  setSessionState={setSessionState}
                  onOpenDiceRollerWithConfig={(name, mod) => handleOpenWindow('roller')}
                  onOpenAutoEncounter={() => setIsAutoEncounterOpen(true)}
                />
              )}

              {win.type === 'clocks' && (
                <SessionNotesAndClocks
                  sessionState={sessionState}
                  setSessionState={setSessionState}
                />
              )}

              {win.type === 'domains' && <DomainDeckLibrary />}

              {win.type === 'roller' && (
                <div className="space-y-4">
                  <p className="text-slate-400 text-[11px]">Choose modifier and trigger a duality 2d12 roll (Hope & Fear dice):</p>
                  <DualityDiceRollerEmbed
                    onRollCompleted={(res) => {
                      // Append to chat log
                      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                      const rollEntry: ChatEntry = {
                        id: `chat-${Date.now()}`,
                        timestamp,
                        sender: 'GM (Duality Roller)',
                        type: 'roll',
                        rollResult: {
                          hopeValue: res.hopeValue,
                          fearValue: res.fearValue,
                          modifier: res.modifier,
                          total: res.total,
                          outcome: res.outcome,
                          isCritical: res.isCritical,
                          targetDifficulty: res.targetDifficulty,
                        },
                      };
                      setChatLog((prev) => [...prev, rollEntry]);
                    }}
                  />
                </div>
              )}

              {win.type === 'adversary' && (() => {
                const foe = sessionState.combatParticipants.find((p) => p.id === win.refId);
                if (!foe) return <p className="text-slate-400 text-center py-4">Adversary not found or removed.</p>;
                return (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="text-[10px] uppercase font-bold text-red-400 bg-red-950 px-2 py-0.5 rounded border border-red-900/60">
                        Tier {foe.tier} {foe.type}
                      </span>
                      <span className="font-mono font-bold text-amber-300">Difficulty DC {foe.difficulty}</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center bg-slate-950 p-2 rounded-xl border border-slate-800 text-xs">
                      <div>
                        <span className="text-[9px] text-slate-500 block">Evasion</span>
                        <span className="font-bold text-cyan-300">{foe.evasion}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-500 block">Armor</span>
                        <span className="font-bold text-amber-300">{foe.armor}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-500 block">HP/Stress</span>
                        <span className="font-bold text-red-400">{foe.currentHp}/{foe.maxHp} HP</span>
                      </div>
                    </div>

                    <div className="space-y-1 text-xs font-semibold">
                      <span className="font-bold text-slate-300 block">Attacks:</span>
                      {foe.attacks.map((atk, i) => (
                        <div key={i} className="bg-slate-950/80 p-2 border border-slate-800/60 rounded flex justify-between items-center">
                          <div>
                            <div className="font-bold text-amber-300">{atk.name}</div>
                            <div className="text-[10px] text-slate-400 font-normal">Range: {atk.range} | Damage: {atk.damage}</div>
                          </div>
                          <button
                            onClick={() => {
                              const d20 = Math.floor(Math.random() * 20) + 1;
                              const total = d20 + atk.modifier;
                              const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                              const chatEntry: ChatEntry = {
                                id: `chat-${Date.now()}`,
                                timestamp,
                                sender: `${foe.name} (Attack Roll)`,
                                type: 'chat',
                                text: `🎯 Rolls ${atk.name}: 1d20 + ${atk.modifier} = **${total}** vs Player Evasion! (Damage on Hit: **${atk.damage}**)`,
                              };
                              setChatLog((prev) => [...prev, chatEntry]);
                              soundFX.playDiceRoll();
                            }}
                            className="px-2 py-0.5 bg-red-900 hover:bg-red-800 text-white font-bold rounded text-[10px]"
                          >
                            Roll
                          </button>
                        </div>
                      ))}
                    </div>

                    {foe.features.length > 0 && (
                      <div className="space-y-1.5 border-t border-slate-800 pt-2">
                        <span className="font-bold text-slate-300 block">Moves & Features:</span>
                        {foe.features.map((feat, i) => (
                          <div key={i} className="text-[11px] leading-relaxed text-slate-400">
                            <span className="font-bold text-purple-400">{feat.name}</span>: {feat.description}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}

              {win.type === 'rule' && (() => {
                const rule = RULES_DATA.find((r) => r.id === win.refId) || RULES_DATA[0];
                return (
                  <div className="space-y-3">
                    <span className="text-[10px] uppercase font-bold text-amber-400 px-2 py-0.5 bg-amber-950 border border-amber-900 rounded">
                      {rule.category} Rules SRD
                    </span>
                    <h4 className="font-serif font-bold text-base text-slate-100">{rule.title}</h4>
                    <p className="text-slate-300 leading-relaxed text-xs">{rule.summary}</p>
                    
                    {rule.bulletPoints && rule.bulletPoints.length > 0 && (
                      <ul className="list-disc list-inside text-slate-400 text-xs space-y-1 pt-1">
                        {rule.bulletPoints.map((bp, i) => (
                          <li key={i}>{bp}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })()}
            </VttWindow>
          ))}

          {/* VTT Sidebar Right Tabs Menu */}
          <VttSidebar
            sessionState={sessionState}
            setSessionState={setSessionState}
            players={players}
            setPlayers={setPlayers}
            chatLog={chatLog}
            setChatLog={setChatLog}
            onOpenDiceRoller={() => handleOpenWindow('roller')}
            onOpenWidgetCatalog={() => setIsWidgetCatalogOpen(true)}
            onSelectEnvironment={(env) => {
              setSessionState((prev) => ({
                ...prev,
                activeEnvironment: env,
                activeSceneName: `Scene: ${env.name}`,
              }));
            }}
            onAddAdversaryToCombat={(adv) => {
              setSessionState((prev) => ({
                ...prev,
                combatParticipants: [...prev.combatParticipants, adv],
              }));
              handleOpenWindow('combat', undefined, 'Active Combat Tracker');
            }}
            onOpenWindow={(type, id, name) => handleOpenWindow(winTypeMapper(type), id, name)}
            campaigns={campaigns}
            setCampaigns={setCampaigns}
            activeCampaignId={activeCampaignId}
            setActiveCampaignId={setActiveCampaignId}
            activeScene={activeScene}
          />
        </div>
      ) : (
        /* ==================== CLASSIC modular DASHBOARD ==================== */
        <>
          {/* Main Container View Area */}
          <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
            {activeTab === 'dashboard' && (
              <ModularDashboard
                widgets={widgets}
                setWidgets={setWidgets}
                players={players}
                setPlayers={setPlayers}
                sessionState={sessionState}
                setSessionState={setSessionState}
                onOpenWidgetCatalog={() => setIsWidgetCatalogOpen(true)}
                onOpenDiceRoller={() => setIsDiceRollerOpen(true)}
                onOpenRulesModal={() => setIsRulesOpen(true)}
                onOpenAutoEncounter={() => setIsAutoEncounterOpen(true)}
              />
            )}

            {activeTab === 'players' && (
              <PlayerDashboard
                players={players}
                setPlayers={setPlayers}
              />
            )}

            {activeTab === 'encounter' && (
              <EncounterTracker
                sessionState={sessionState}
                setSessionState={setSessionState}
                onOpenDiceRollerWithConfig={(name, mod) => {
                  setIsDiceRollerOpen(true);
                }}
                onOpenAutoEncounter={() => setIsAutoEncounterOpen(true)}
              />
            )}

            {activeTab === 'adversaries' && (
              <AdversaryLibrary
                onAddAdversaryToCombat={handleAddAdversaryToCombat}
              />
            )}

            {activeTab === 'environments' && (
              <EnvironmentLibrary
                activeEnvironment={sessionState.activeEnvironment}
                onSelectActiveEnvironment={handleSelectEnvironment}
              />
            )}

            {activeTab === 'domains' && <DomainDeckLibrary />}

            {activeTab === 'clocks' && (
              <SessionNotesAndClocks
                sessionState={sessionState}
                setSessionState={setSessionState}
              />
            )}
          </main>

          {/* Footer */}
          <footer className="border-t border-slate-900 bg-slate-950/90 py-4 px-6 text-center text-xs text-slate-500">
            <p>
              Daggerheart Digital GM Screen & Combat Encounter Runner • Powered by SRD Rules Data & Integrated Real-Time Player Status
            </p>
          </footer>
        </>
      )}

      {/* Modals & Overlays */}
      <DualityDiceRoller
        isOpen={isDiceRollerOpen}
        onClose={() => setIsDiceRollerOpen(false)}
        onRollCompleted={() => {}}
      />

      <RulesReferenceModal
        isOpen={isRulesOpen}
        onClose={() => setIsRulesOpen(false)}
      />

      <AutoEncounterModal
        isOpen={isAutoEncounterOpen}
        onClose={() => setIsAutoEncounterOpen(false)}
        sessionState={sessionState}
        setSessionState={setSessionState}
      />

      <PlayerViewModal
        isOpen={isPlayerViewOpen}
        onClose={() => setIsPlayerViewOpen(false)}
        players={players}
        sessionState={sessionState}
      />

      <QuickSearchModal
        isOpen={isQuickSearchOpen}
        onClose={() => setIsQuickSearchOpen(false)}
        players={players}
        onSelectAdversary={(id) => setActiveTab('adversaries')}
        onSelectEnvironment={(id) => setActiveTab('environments')}
        onSelectRule={(id) => setIsRulesOpen(true)}
      />

      <WidgetCatalogModal
        isOpen={isWidgetCatalogOpen}
        onClose={() => setIsWidgetCatalogOpen(false)}
        widgets={widgets}
        onAddWidget={handleAddWidget}
        onToggleWidgetVisibility={handleToggleWidgetVisibility}
        onResetLayout={handleResetLayout}
      />
    </div>
  );
}
