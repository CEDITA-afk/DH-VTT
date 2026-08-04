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
  FolderPlus,
  Pencil,
  Download,
  Upload,
  Menu,
  X,
  ChevronDown,
  ExternalLink,
  Maximize2,
  Minimize2,
  MoveHorizontal,
} from 'lucide-react';
import { SessionState, PlayerCharacter, CombatParticipant, CountdownClock, EnvironmentCard, DomainCard, Campaign, VttScene } from '../types';
import { rollDualityDice } from '../utils/dualityDice';
import { soundFX } from '../utils/audioSynth';
import { RULES_DATA } from '../data/rulesData';
import { ADVERSARIES_DATA } from '../data/adversaries';
import { ENVIRONMENTS_DATA } from '../data/environments';
import { ITEMS_DATA } from '../data/itemsData';
import { GM_HELP_DATA } from '../data/gmHelpData';

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
  campaigns: Campaign[];
  setCampaigns: React.Dispatch<React.SetStateAction<Campaign[]>>;
  activeCampaignId: string;
  setActiveCampaignId: (id: string) => void;
  activeScene: VttScene | null;
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
  campaigns,
  setCampaigns,
  activeCampaignId,
  setActiveCampaignId,
  activeScene,
}) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'combat' | 'scenes' | 'journal' | 'compendium' | 'settings'>('chat');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isHamburgerOpen, setIsHamburgerOpen] = useState(false);

  // Dynamic Sidebar Width (Enlargeable / Shrinkable)
  const [sidebarWidth, setSidebarWidth] = useState<number>(() => {
    const saved = localStorage.getItem('vtt_sidebar_width');
    return saved ? parseInt(saved, 10) : 340;
  });
  const [isResizing, setIsResizing] = useState(false);
  const [isSrdModalOpen, setIsSrdModalOpen] = useState(false);
  const [activeSrdUrl, setActiveSrdUrl] = useState('https://callmepartario.github.io/og-dhsrd/#gm-guidance');
  const [gmHelpSearch, setGmHelpSearch] = useState('');

  const handleMouseDownResize = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    const startX = e.clientX;
    const startWidth = sidebarWidth;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = startX - moveEvent.clientX; // dragging left increases width
      const newWidth = Math.max(280, Math.min(750, startWidth + deltaX));
      setSidebarWidth(newWidth);
      localStorage.setItem('vtt_sidebar_width', newWidth.toString());
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };
  
  // Campaigns & Scenes UI States
  const [showAddCampaign, setShowAddCampaign] = useState(false);
  const [newCampaignName, setNewCampaignName] = useState('');
  const [newCampaignDesc, setNewCampaignDesc] = useState('');

  const [showAddScene, setShowAddScene] = useState(false);
  const [newSceneName, setNewSceneName] = useState('');
  const [newSceneDesc, setNewSceneDesc] = useState('');
  const [newSceneMapUrl, setNewSceneMapUrl] = useState('');
  const [newSceneTheme, setNewSceneTheme] = useState<'wood' | 'stone' | 'parchment' | 'custom'>('wood');

  const [editingSceneId, setEditingSceneId] = useState<string | null>(null);
  const [editSceneName, setEditSceneName] = useState('');
  const [editSceneDesc, setEditSceneDesc] = useState('');
  const [editSceneMapUrl, setEditSceneMapUrl] = useState('');

  const activeCampaign = campaigns.find((c) => c.id === activeCampaignId) || campaigns[0] || null;

  const handleExportCampaign = () => {
    if (!activeCampaign) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(activeCampaign, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    const sanitizedName = activeCampaign.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    downloadAnchor.setAttribute("download", `daggerheart_campaign_${sanitizedName}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    soundFX.playHopeChime();
  };

  const handleExportAllCampaigns = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(campaigns, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `all_daggerheart_campaigns.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    soundFX.playHopeChime();
  };

  const handleImportCampaigns = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        
        // Helper to validate a campaign structure
        const isValidCampaign = (obj: any): obj is Campaign => {
          return obj && typeof obj === 'object' && typeof obj.name === 'string' && Array.isArray(obj.scenes);
        };

        if (Array.isArray(parsed)) {
          // It's an array of campaigns
          const validCamps = parsed.filter(isValidCampaign);
          if (validCamps.length === 0) {
            alert("No valid campaigns found in the imported file.");
            return;
          }

          // Merge campaigns with new unique IDs to avoid duplicate key conflicts
          setCampaigns((prev) => {
            const updated = [...prev];
            validCamps.forEach((newC) => {
              const uniqueId = 'camp-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
              updated.push({
                ...newC,
                id: uniqueId,
              });
            });
            return updated;
          });
          
          alert(`Successfully imported ${validCamps.length} campaigns!`);
          soundFX.playHopeChime();
        } else if (isValidCampaign(parsed)) {
          // It's a single campaign
          const uniqueId = 'camp-' + Date.now();
          const newCamp = {
            ...parsed,
            id: uniqueId,
          };
          setCampaigns((prev) => [...prev, newCamp]);
          setActiveCampaignId(uniqueId);
          alert(`Successfully imported campaign: "${parsed.name}"!`);
          soundFX.playHopeChime();
        } else {
          alert("Invalid campaign file format. Must be a single campaign JSON or an array of campaigns.");
        }
      } catch (err) {
        alert("Error parsing JSON file: " + (err as Error).message);
      }
    };
    reader.readAsText(file);
    // Reset file input value so same file can be selected again
    e.target.value = '';
  };

  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCampaignName.trim()) return;

    const newCamp: Campaign = {
      id: 'camp-' + Date.now(),
      name: newCampaignName,
      description: newCampaignDesc,
      scenes: [
        {
          id: 'scene-' + Date.now(),
          name: 'First Battle Map',
          description: 'A default tactical grid scene.',
          mapUrl: '',
          mapTheme: 'wood',
          gridVisible: true,
        },
      ],
      activeSceneId: 'scene-' + Date.now(),
    };

    setCampaigns((prev) => [...prev, newCamp]);
    setActiveCampaignId(newCamp.id);
    
    // reset form
    setNewCampaignName('');
    setNewCampaignDesc('');
    setShowAddCampaign(false);
    soundFX.playHopeChime();
  };

  const handleDeleteCampaign = (id: string) => {
    if (campaigns.length <= 1) {
      alert("You must keep at least one campaign.");
      return;
    }
    const filtered = campaigns.filter((c) => c.id !== id);
    setCampaigns(filtered);
    if (activeCampaignId === id) {
      setActiveCampaignId(filtered[0].id);
    }
    soundFX.playClockTick();
  };

  const handleCreateScene = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSceneName.trim()) return;

    const newScene: VttScene = {
      id: 'scene-' + Date.now(),
      name: newSceneName,
      description: newSceneDesc,
      mapUrl: newSceneMapUrl,
      mapTheme: newSceneTheme,
      gridVisible: true,
    };

    setCampaigns((prev) =>
      prev.map((c) => {
        if (c.id === activeCampaignId) {
          return {
            ...c,
            scenes: [...c.scenes, newScene],
            activeSceneId: c.activeSceneId || newScene.id, // set active if none exists
          };
        }
        return c;
      })
    );

    // reset form
    setNewSceneName('');
    setNewSceneDesc('');
    setNewSceneMapUrl('');
    setNewSceneTheme('wood');
    setShowAddScene(false);
    soundFX.playHopeChime();
  };

  const handleDeleteScene = (sceneId: string) => {
    if (!activeCampaign) return;
    if (activeCampaign.scenes.length <= 1) {
      alert("A campaign must have at least one scene.");
      return;
    }

    setCampaigns((prev) =>
      prev.map((c) => {
        if (c.id === activeCampaignId) {
          const nextScenes = c.scenes.filter((s) => s.id !== sceneId);
          let nextActiveSceneId = c.activeSceneId;
          if (c.activeSceneId === sceneId) {
            nextActiveSceneId = nextScenes[0].id;
          }
          return {
            ...c,
            scenes: nextScenes,
            activeSceneId: nextActiveSceneId,
          };
        }
        return c;
      })
    );
    soundFX.playClockTick();
  };

  const handleActivateScene = (scene: VttScene) => {
    setCampaigns((prev) =>
      prev.map((c) => {
        if (c.id === activeCampaignId) {
          return {
            ...c,
            activeSceneId: scene.id,
          };
        }
        return c;
      })
    );

    // Also update sessionState activeSceneName for compatibility
    setSessionState((prev) => ({
      ...prev,
      activeSceneName: `Scene: ${scene.name}`,
    }));

    soundFX.playHopeChime();
  };

  const handleStartEditScene = (scene: VttScene) => {
    setEditingSceneId(scene.id);
    setEditSceneName(scene.name);
    setEditSceneDesc(scene.description);
    setEditSceneMapUrl(scene.mapUrl || '');
  };

  const handleSaveEditScene = (sceneId: string) => {
    setCampaigns((prev) =>
      prev.map((c) => {
        if (c.id === activeCampaignId) {
          return {
            ...c,
            scenes: c.scenes.map((s) =>
              s.id === sceneId
                ? {
                    ...s,
                    name: editSceneName,
                    description: editSceneDesc,
                    mapUrl: editSceneMapUrl,
                  }
                : s
            ),
          };
        }
        return c;
      })
    );
    setEditingSceneId(null);
    soundFX.playHopeChime();
  };

  // Chat Input State
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  // Search States
  const [ruleSearch, setRuleSearch] = useState('');
  const [advSearch, setAdvSearch] = useState('');
  const [itemSearch, setItemSearch] = useState('');
  const [itemCategoryFilter, setItemCategoryFilter] = useState<'All' | 'Weapon' | 'Loot' | 'Consumable' | 'Armor' | 'Gear' | 'Magic Item'>('All');
  const [weaponTierFilter, setWeaponTierFilter] = useState<number | 'All'>('All');
  
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
    <div className="relative h-full flex shrink-0 select-none z-20">
      {/* Collapse/Expand Toggle Tab */}
      <button
        onClick={() => {
          setIsCollapsed(!isCollapsed);
          soundFX.playClockTick();
        }}
        className="absolute top-1/2 -translate-y-1/2 -left-6 w-6 h-24 bg-slate-900 hover:bg-slate-850 border border-slate-800 border-r-0 rounded-l-xl flex flex-col items-center justify-center cursor-pointer text-slate-400 hover:text-amber-400 z-30 shadow-lg select-none group transition-all duration-200"
        title={isCollapsed ? "Expand Right Panel" : "Collapse Right Panel"}
      >
        <span className="text-[8px] font-extrabold uppercase transform rotate-90 tracking-widest whitespace-nowrap select-none group-hover:scale-105 transition">
          {isCollapsed ? '◀ CHAT' : '▶ HIDE'}
        </span>
      </button>

      {/* Left-edge Draggable Resizer Bar (Enlarge / Shrink Panel) */}
      {!isCollapsed && (
        <div
          onMouseDown={handleMouseDownResize}
          className={`absolute -left-1.5 top-0 bottom-0 w-3 cursor-col-resize hover:bg-amber-500/60 z-50 group flex items-center justify-center transition-colors ${
            isResizing ? 'bg-amber-500/80 ring-2 ring-amber-400' : ''
          }`}
          title="Click & drag left/right to enlarge or shrink sidebar"
        >
          <div className="w-1 h-12 bg-slate-700 group-hover:bg-amber-400 rounded-full transition-colors" />
        </div>
      )}

      {/* Main Sidebar Contents */}
      <div
        style={{
          width: isCollapsed ? '0px' : `${sidebarWidth}px`,
        }}
        className={`h-full bg-slate-900 border-l border-slate-800 flex flex-col relative transition-all duration-75 ease-out ${
          isCollapsed ? 'border-l-0 overflow-hidden' : ''
        }`}
      >
      {/* VTT Sidebar Header with Responsive Hamburger Menu */}
      <div className="relative bg-slate-950 border-b border-slate-800 px-2 py-1.5 flex items-center justify-between gap-2 z-40 select-none">
        {/* Hamburger Toggle Button & Active Section Title */}
        <div className="flex items-center space-x-2 flex-1 min-w-0">
          <button
            onClick={() => {
              setIsHamburgerOpen(!isHamburgerOpen);
              soundFX.playClockTick();
            }}
            className={`flex items-center justify-center min-h-[44px] min-w-[44px] px-2.5 rounded-lg border text-amber-400 transition ${
              isHamburgerOpen
                ? 'bg-amber-500/20 border-amber-500 text-amber-300 ring-1 ring-amber-400'
                : 'bg-slate-900 border-slate-800 hover:bg-slate-850 hover:border-amber-500/50'
            }`}
            title="Toggle Sidebar Navigation Menu"
            aria-label="Toggle Sidebar Navigation Menu"
          >
            {isHamburgerOpen ? <X className="w-5 h-5 text-amber-400" /> : <Menu className="w-5 h-5 text-amber-400" />}
          </button>

          {/* Active Section Indicator */}
          <button
            onClick={() => {
              setIsHamburgerOpen(!isHamburgerOpen);
              soundFX.playClockTick();
            }}
            className="flex items-center space-x-2 min-h-[44px] px-2 py-1 rounded-lg bg-slate-900/80 hover:bg-slate-900 border border-slate-800/80 hover:border-slate-700 transition flex-1 min-w-0 text-left"
          >
            {activeTab === 'chat' && <MessageSquare className="w-4 h-4 text-amber-400 shrink-0" />}
            {activeTab === 'combat' && <Swords className="w-4 h-4 text-amber-400 shrink-0" />}
            {activeTab === 'scenes' && <Map className="w-4 h-4 text-amber-400 shrink-0" />}
            {activeTab === 'journal' && <Book className="w-4 h-4 text-amber-400 shrink-0" />}
            {activeTab === 'compendium' && <BookOpen className="w-4 h-4 text-amber-400 shrink-0" />}
            {activeTab === 'settings' && <Settings className="w-4 h-4 text-amber-400 shrink-0" />}

            <div className="flex-1 min-w-0">
              <div className="font-serif font-bold text-xs text-amber-200 truncate leading-tight">
                {activeTab === 'chat' && 'Chat & Rolls'}
                {activeTab === 'combat' && 'Combat Runner'}
                {activeTab === 'scenes' && 'Scenes & Maps'}
                {activeTab === 'journal' && 'Journal & Clocks'}
                {activeTab === 'compendium' && 'Compendium'}
                {activeTab === 'settings' && 'Settings'}
              </div>
              <div className="text-[9px] text-slate-400 truncate">Tap to switch section</div>
            </div>

            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-200 ${isHamburgerOpen ? 'rotate-180 text-amber-400' : ''}`} />
          </button>
        </div>

        {/* Compact Quick Icon Strip & Width Control for Desktop & Tablet */}
        <div className="flex items-center space-x-1 shrink-0">
          <button
            onClick={() => { setActiveTab('chat'); setIsHamburgerOpen(false); soundFX.playClockTick(); }}
            className={`p-2 min-h-[38px] min-w-[38px] rounded flex items-center justify-center transition ${
              activeTab === 'chat' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
            title="Chat Log & Roll Feed"
          >
            <MessageSquare className="w-4 h-4" />
          </button>

          <button
            onClick={() => { setActiveTab('combat'); setIsHamburgerOpen(false); soundFX.playClockTick(); }}
            className={`p-2 min-h-[38px] min-w-[38px] rounded flex items-center justify-center relative transition ${
              activeTab === 'combat' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
            title="Active Combat Runner"
          >
            <Swords className="w-4 h-4" />
            {sessionState.combatParticipants.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-red-600 text-white rounded-full w-2 h-2" />
            )}
          </button>

          {/* Panel Size Controls */}
          <div className="flex items-center border border-slate-800 rounded bg-slate-950 p-0.5 text-slate-400 text-[10px] space-x-0.5">
            <button
              onClick={() => {
                const nextWidth = Math.max(280, sidebarWidth - 40);
                setSidebarWidth(nextWidth);
                localStorage.setItem('vtt_sidebar_width', nextWidth.toString());
                soundFX.playClockTick();
              }}
              className="px-1.5 py-1 hover:text-amber-300 hover:bg-slate-900 rounded font-mono font-bold"
              title="Shrink Sidebar Panel Width"
            >
              -
            </button>
            <button
              onClick={() => {
                // Cycle sizes: 320 -> 460 -> 620 -> 320
                let next = 320;
                if (sidebarWidth < 400) next = 460;
                else if (sidebarWidth < 550) next = 620;
                else next = 320;
                setSidebarWidth(next);
                localStorage.setItem('vtt_sidebar_width', next.toString());
                soundFX.playClockTick();
              }}
              className="px-1 py-0.5 text-amber-400 hover:text-amber-200 font-mono text-[9px] font-bold"
              title="Cycle Sidebar Preset Widths (Standard, Wide, Extra Wide)"
            >
              {sidebarWidth}p
            </button>
            <button
              onClick={() => {
                const nextWidth = Math.min(750, sidebarWidth + 40);
                setSidebarWidth(nextWidth);
                localStorage.setItem('vtt_sidebar_width', nextWidth.toString());
                soundFX.playClockTick();
              }}
              className="px-1.5 py-1 hover:text-amber-300 hover:bg-slate-900 rounded font-mono font-bold"
              title="Enlarge Sidebar Panel Width"
            >
              +
            </button>
          </div>
        </div>

        {/* Hamburger Overlay Dropdown Menu */}
        {isHamburgerOpen && (
          <div className="absolute top-full left-0 right-0 bg-slate-950/98 border-b-2 border-amber-500/60 shadow-2xl z-50 p-2 space-y-1.5 backdrop-blur-md">
            <div className="text-[10px] font-bold uppercase tracking-wider text-amber-500/80 px-2 py-1 border-b border-slate-800 flex justify-between items-center">
              <span>VTT Navigation Sections</span>
              <button
                onClick={() => setIsHamburgerOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Menu Items */}
            <div className="space-y-1">
              {[
                { id: 'chat', label: 'Chat Log & Duality Rolls', icon: MessageSquare, desc: 'View roll history, system alerts & party chat' },
                { id: 'combat', label: 'Active Combat Runner', icon: Swords, desc: 'Initiative order, adversary HP & stress tracking', badge: sessionState.combatParticipants.length },
                { id: 'scenes', label: 'Scenes & Environments', icon: Map, desc: 'Manage battleground maps & environmental hazards', badge: activeCampaign?.scenes.length },
                { id: 'journal', label: 'Journal & Session Clocks', icon: Book, desc: 'Track threat countdown clocks & GM session notes', badge: sessionState.clocks.length },
                { id: 'compendium', label: 'Data & Rules SRD', icon: BookOpen, desc: 'Browse adversaries, weapons, SRD loot, domain cards & rulebooks' },
                { id: 'settings', label: 'Campaign Settings & Export', icon: Settings, desc: 'Manage campaigns, JSON export/import & VTT setup' },
              ].map((sec) => {
                const IconComponent = sec.icon;
                const isCurrent = activeTab === sec.id;
                return (
                  <button
                    key={sec.id}
                    onClick={() => {
                      setActiveTab(sec.id as any);
                      setIsHamburgerOpen(false);
                      soundFX.playClockTick();
                    }}
                    className={`w-full min-h-[48px] px-3 py-2.5 rounded-lg flex items-center space-x-3 transition text-left group ${
                      isCurrent
                        ? 'bg-gradient-to-r from-amber-500/20 to-purple-900/20 border border-amber-500/50 text-amber-200 shadow-md'
                        : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800/80'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 ${
                      isCurrent ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300 group-hover:text-amber-400'
                    }`}>
                      <IconComponent className="w-4 h-4" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className={`font-serif font-bold text-xs ${isCurrent ? 'text-amber-300' : 'text-slate-200'}`}>
                          {sec.label}
                        </span>
                        {!!sec.badge && sec.badge > 0 && (
                          <span className="bg-red-900/90 text-red-200 border border-red-700 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                            {sec.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 truncate">{sec.desc}</p>
                    </div>

                    {isCurrent && (
                      <span className="w-2 h-2 rounded-full bg-amber-400 shadow-sm shadow-amber-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
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
                        {log.rollResult.isDuality !== false ? (
                          /* Gold / Purple duality die results */
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
                        ) : (
                          /* Polyhedral dice results */
                          <div className="flex flex-wrap gap-1 justify-center py-1 bg-slate-950/50 p-1.5 rounded-lg border border-slate-900">
                            {log.rollResult.individualRolls?.map((val, idx) => (
                              <div key={idx} className="bg-slate-900 border border-slate-750 rounded w-8 h-8 flex flex-col items-center justify-center font-mono">
                                <span className="text-[7px] text-slate-500 font-bold uppercase">{log.rollResult?.diceType || 'D'}</span>
                                <span className="font-extrabold text-amber-300 text-xs">{val}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Roll calculation */}
                        <div className="text-center">
                          <div className="text-[10px] text-slate-400">
                            {log.rollResult.isDuality !== false ? (
                              <>Dice ({log.rollResult.hopeValue} + {log.rollResult.fearValue}) + Mod ({log.rollResult.modifier >= 0 ? `+${log.rollResult.modifier}` : log.rollResult.modifier})</>
                            ) : (
                              <>Dice ({log.rollResult.individualRolls?.join(' + ')}) + Mod ({log.rollResult.modifier >= 0 ? `+${log.rollResult.modifier}` : log.rollResult.modifier})</>
                            )}
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
                              : log.rollResult.outcome.includes('Success') || log.rollResult.outcome === 'Success'
                              ? 'bg-emerald-900/10 text-emerald-300 border-emerald-900/30'
                              : log.rollResult.outcome.includes('Failure') || log.rollResult.outcome === 'Failure'
                              ? 'bg-red-950 text-red-300 border-red-900/30'
                              : 'bg-slate-800 text-slate-300 border-slate-750'
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

        {/* 3. Scenes / Campaigns Tab */}
        {activeTab === 'scenes' && (
          <div className="p-3 space-y-4">
            
            {/* Campaign Selector & Creation */}
            <div className="space-y-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-extrabold text-amber-400 uppercase tracking-wider block">Active Campaign</span>
                <button
                  onClick={() => setShowAddCampaign(!showAddCampaign)}
                  className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 text-[10px]"
                >
                  <FolderPlus className="w-3.5 h-3.5" />
                  <span>{showAddCampaign ? 'Cancel' : 'New Campaign'}</span>
                </button>
              </div>

              {showAddCampaign ? (
                <form onSubmit={handleCreateCampaign} className="space-y-2.5 pt-1.5 text-xs">
                  <div>
                    <label className="text-[9px] text-slate-400 block mb-1 uppercase">Campaign Name</label>
                    <input
                      type="text"
                      required
                      value={newCampaignName}
                      onChange={(e) => setNewCampaignName(e.target.value)}
                      placeholder="e.g. Citadel of Ashes"
                      className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] text-slate-400 block mb-1 uppercase">Description</label>
                    <textarea
                      value={newCampaignDesc}
                      onChange={(e) => setNewCampaignDesc(e.target.value)}
                      placeholder="e.g. A high magic story of dark sorcery..."
                      rows={2}
                      className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-slate-100 resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded shadow transition"
                  >
                    Create Campaign
                  </button>
                </form>
              ) : (
                <div className="flex items-center gap-2">
                  <select
                    value={activeCampaignId}
                    onChange={(e) => setActiveCampaignId(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-800 text-slate-200 rounded px-2.5 py-1.5 focus:outline-none focus:border-amber-500 text-xs font-semibold"
                  >
                    {campaigns.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => handleDeleteCampaign(activeCampaignId)}
                    disabled={campaigns.length <= 1}
                    className="p-1.5 rounded bg-slate-900 hover:bg-red-950/40 border border-slate-800 hover:border-red-500/30 text-slate-400 hover:text-red-400 disabled:opacity-30 disabled:cursor-not-allowed transition"
                    title="Delete current campaign"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {activeCampaign && !showAddCampaign && (
                <>
                  <p className="text-[10px] text-slate-400 mt-1 italic select-text leading-relaxed">
                    {activeCampaign.description || 'No description provided.'}
                  </p>
                  
                  {/* Campaign Export / Import Toolbar */}
                  <div className="flex items-center gap-1.5 pt-2 border-t border-slate-800/50 mt-2">
                    <button
                      onClick={handleExportCampaign}
                      className="flex-1 py-1 px-1.5 rounded bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 hover:border-amber-500/30 text-slate-300 hover:text-amber-400 transition text-[9px] font-bold flex items-center justify-center gap-1"
                      title="Download the currently active campaign configuration as a JSON file"
                    >
                      <Download className="w-2.5 h-2.5" />
                      <span>Export Active</span>
                    </button>
                    <button
                      onClick={handleExportAllCampaigns}
                      className="py-1 px-1.5 rounded bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 hover:border-amber-500/30 text-slate-400 hover:text-amber-400 transition text-[9px] font-bold flex items-center justify-center gap-1"
                      title="Download all of your campaigns as a single JSON backup file"
                    >
                      <Download className="w-2.5 h-2.5" />
                      <span>All</span>
                    </button>
                    <label
                      className="flex-1 py-1 px-1.5 rounded bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 hover:border-amber-500/30 text-slate-300 hover:text-amber-400 transition text-[9px] font-bold flex items-center justify-center gap-1 cursor-pointer text-center"
                      title="Upload and import single or multiple campaigns from a JSON file"
                    >
                      <Upload className="w-2.5 h-2.5" />
                      <span>Import JSON</span>
                      <input
                        type="file"
                        accept=".json"
                        onChange={handleImportCampaigns}
                        className="hidden"
                      />
                    </label>
                  </div>
                </>
              )}
            </div>

            {/* Scenes List & Creator */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Scenes Directory</span>
                <button
                  onClick={() => setShowAddScene(!showAddScene)}
                  className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 text-[10px]"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{showAddScene ? 'Cancel' : 'Add Scene'}</span>
                </button>
              </div>

              {showAddScene && (
                <form onSubmit={handleCreateScene} className="space-y-2.5 pt-1 bg-slate-950/40 p-3 rounded-xl border border-slate-800 text-xs">
                  <div>
                    <label className="text-[9px] text-slate-400 block mb-1 uppercase">Scene Name</label>
                    <input
                      type="text"
                      required
                      value={newSceneName}
                      onChange={(e) => setNewSceneName(e.target.value)}
                      placeholder="e.g. Cathedral Vaults"
                      className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] text-slate-400 block mb-1 uppercase">Description</label>
                    <input
                      type="text"
                      value={newSceneDesc}
                      onChange={(e) => setNewSceneDesc(e.target.value)}
                      placeholder="A short tagline or overview..."
                      className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] text-slate-400 block mb-1 uppercase">Map Background URL</label>
                    <input
                      type="url"
                      value={newSceneMapUrl}
                      onChange={(e) => setNewSceneMapUrl(e.target.value)}
                      placeholder="https://example.com/map.jpg"
                      className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-slate-100 font-mono text-[10px]"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] text-slate-400 block mb-1 uppercase">Default Map Theme</label>
                    <select
                      value={newSceneTheme}
                      onChange={(e) => setNewSceneTheme(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-slate-100"
                    >
                      <option value="wood">Deep Murkwood (Forest Green)</option>
                      <option value="stone">Dungeon Crypt (Slate Stone)</option>
                      <option value="parchment">Tactical Parchment (Fantasy Gold)</option>
                      <option value="custom">Custom Grid Canvas</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded shadow transition"
                  >
                    Create Scene
                  </button>
                </form>
              )}

              {activeCampaign && (
                <div className="space-y-2">
                  {activeCampaign.scenes.map((sc) => {
                    const isActivated = activeCampaign.activeSceneId === sc.id;
                    const isEditing = editingSceneId === sc.id;

                    return (
                      <div
                        key={sc.id}
                        className={`p-3 rounded-xl border transition-all ${
                          isActivated 
                            ? 'bg-gradient-to-r from-amber-950/10 to-slate-900 border-amber-500/50 shadow shadow-amber-950' 
                            : 'bg-slate-950/50 border-slate-850'
                        }`}
                      >
                        {isEditing ? (
                          <div className="space-y-2 text-xs">
                            <div>
                              <label className="text-[9px] text-slate-500 uppercase">Scene Name</label>
                              <input
                                type="text"
                                value={editSceneName}
                                onChange={(e) => setEditSceneName(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded p-1 text-slate-200"
                              />
                            </div>
                            <div>
                              <label className="text-[9px] text-slate-500 uppercase">Description</label>
                              <input
                                type="text"
                                value={editSceneDesc}
                                onChange={(e) => setEditSceneDesc(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded p-1 text-slate-200"
                              />
                            </div>
                            <div>
                              <label className="text-[9px] text-slate-500 uppercase">Map Image URL</label>
                              <input
                                type="text"
                                value={editSceneMapUrl}
                                onChange={(e) => setEditSceneMapUrl(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded p-1 text-slate-200 font-mono text-[9px]"
                              />
                            </div>
                            <div className="flex space-x-2 pt-1">
                              <button
                                onClick={() => handleSaveEditScene(sc.id)}
                                className="flex-1 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-bold"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditingSceneId(null)}
                                className="flex-1 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-bold"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="flex justify-between items-start">
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-1.5">
                                  {isActivated && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />}
                                  <span className="font-bold text-slate-100 text-[12px]">{sc.name}</span>
                                </div>
                                <span className="text-[9px] text-slate-500 font-mono uppercase">
                                  Theme: {sc.mapTheme} {sc.mapUrl ? '• Custom Image Background' : ''}
                                </span>
                              </div>

                              <div className="flex items-center space-x-1.5">
                                <button
                                  onClick={() => handleStartEditScene(sc)}
                                  className="p-1 hover:bg-slate-850 rounded text-slate-400 hover:text-amber-400 transition"
                                  title="Edit scene properties"
                                >
                                  <Pencil className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => handleDeleteScene(sc.id)}
                                  disabled={activeCampaign.scenes.length <= 1}
                                  className="p-1 hover:bg-slate-850 rounded text-slate-400 hover:text-red-400 disabled:opacity-30 disabled:hover:bg-transparent transition"
                                  title="Delete scene"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>

                            <p className="text-[10px] text-slate-400 leading-relaxed select-text">{sc.description}</p>

                            {sc.mapUrl && (
                              <div className="text-[9px] bg-slate-900 border border-slate-850 text-slate-500 rounded p-1 truncate select-all font-mono">
                                🔗 {sc.mapUrl}
                              </div>
                            )}

                            {!isActivated && (
                              <button
                                onClick={() => handleActivateScene(sc)}
                                className="w-full py-1 bg-slate-800 hover:bg-slate-705 text-slate-200 rounded text-[10px] font-extrabold border border-slate-700 transition"
                              >
                                ACTIVATE SCENE
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
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
            {/* GM Help & OG-DHSRD Quick SRD Banner */}
            <div className="bg-gradient-to-r from-amber-950/80 via-slate-900 to-slate-950 p-3 rounded-xl border border-amber-500/40 shadow-lg space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <span className="bg-amber-500 text-slate-950 text-[8px] font-black uppercase px-1.5 py-0.5 rounded font-mono">
                    Official Web SRD
                  </span>
                  <h4 className="font-serif font-bold text-xs text-amber-200 mt-1">
                    Open Gaming Daggerheart SRD (OG-DHSRD)
                  </h4>
                </div>
              </div>

              <p className="text-[10px] text-slate-300 leading-tight">
                GM rules, fear moves, difficulty DCs, countdown clocks, and campaign guides from <span className="text-amber-300 font-mono">https://callmepartario.github.io/og-dhsrd/</span>
              </p>

              <div className="flex gap-1.5 pt-1">
                <button
                  onClick={() => setIsSrdModalOpen(true)}
                  className="flex-1 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded text-[10px] transition flex items-center justify-center gap-1 shadow"
                >
                  <BookOpen className="w-3 h-3" />
                  <span>Open SRD Viewer</span>
                </button>

                <a
                  href="https://callmepartario.github.io/og-dhsrd/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 text-[10px] font-semibold rounded border border-slate-700 transition flex items-center gap-1"
                >
                  <span>New Tab</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* GM Reference & Quick Guides */}
            <div className="space-y-2 border-t border-slate-800 pt-2">
              <span className="text-[10px] font-bold text-amber-400 uppercase block">GM Help & Running Guidelines</span>
              <input
                type="text"
                value={gmHelpSearch}
                onChange={(e) => setGmHelpSearch(e.target.value)}
                placeholder="Search GM help (moves, fear, difficulty, budget)..."
                className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs focus:outline-none focus:border-amber-500 text-slate-200"
              />

              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {GM_HELP_DATA.filter((g) =>
                  !gmHelpSearch ||
                  g.title.toLowerCase().includes(gmHelpSearch.toLowerCase()) ||
                  g.summary.toLowerCase().includes(gmHelpSearch.toLowerCase()) ||
                  g.bulletPoints.some((b) => b.toLowerCase().includes(gmHelpSearch.toLowerCase()))
                ).map((guide) => (
                  <div
                    key={guide.id}
                    className="bg-slate-950/70 p-2 border border-slate-800/80 rounded space-y-1 hover:border-amber-500/40 transition"
                  >
                    <div className="flex justify-between items-center gap-1">
                      <span className="font-serif font-bold text-xs text-amber-200 truncate">{guide.title}</span>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => {
                            setActiveSrdUrl(guide.anchorUrl);
                            setIsSrdModalOpen(true);
                          }}
                          className="px-1 py-0.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 rounded text-[8px] font-mono border border-amber-500/30 transition flex items-center gap-0.5"
                          title="Open in embedded viewer"
                        >
                          <BookOpen className="w-2.5 h-2.5" />
                          <span>#{guide.anchorId}</span>
                        </button>
                        <a
                          href={guide.anchorUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-slate-400 hover:text-amber-300 transition"
                          title="Open in new tab"
                        >
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-300 leading-snug">{guide.summary}</p>
                    <ul className="text-[9px] text-slate-400 space-y-0.5 pt-0.5 border-t border-slate-900">
                      {guide.bulletPoints.slice(0, 3).map((bp, i) => (
                        <li key={i} className="truncate">• {bp}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

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

            {/* Daggerheart Items & Weapons SRD */}
            <div className="space-y-2 border-t border-slate-800 pt-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Foundryborne Weapons & Items SRD</span>
                <span className="text-[9px] font-mono text-slate-500">{ITEMS_DATA.length} Entries</span>
              </div>
              
              <input
                type="text"
                value={itemSearch}
                onChange={(e) => setItemSearch(e.target.value)}
                placeholder="Search weapons, features (e.g. Reliable, Bow, Tier 3)..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />

              {/* Category Quick Filter Chips */}
              <div className="flex flex-wrap gap-1 py-0.5">
                {(['All', 'Weapon', 'Loot', 'Consumable', 'Armor', 'Gear', 'Magic Item'] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setItemCategoryFilter(cat)}
                    className={`px-2 py-0.5 rounded text-[9px] font-bold transition uppercase ${
                      itemCategoryFilter === cat
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Tier Filter Chips when Weapons are selected */}
              {(itemCategoryFilter === 'All' || itemCategoryFilter === 'Weapon') && (
                <div className="flex items-center space-x-1 text-[9px] text-slate-400 font-mono py-0.5 border-t border-slate-900 pt-1">
                  <span className="text-[9px] text-slate-500 uppercase font-semibold">Tier:</span>
                  {(['All', 0, 1, 2, 3, 4] as const).map((t) => (
                    <button
                      key={String(t)}
                      onClick={() => setWeaponTierFilter(t)}
                      className={`px-1.5 py-0.2 rounded transition ${
                        weaponTierFilter === t
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                          : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      {t === 'All' ? 'All' : `T${t}`}
                    </button>
                  ))}
                </div>
              )}

              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {ITEMS_DATA.filter((item) => {
                  const s = itemSearch.toLowerCase().trim();
                  const matchSearch =
                    !s ||
                    item.name.toLowerCase().includes(s) ||
                    item.description.toLowerCase().includes(s) ||
                    (item.subCategory && item.subCategory.toLowerCase().includes(s)) ||
                    (item.traitRequirement && item.traitRequirement.toLowerCase().includes(s)) ||
                    (item.damage && item.damage.toLowerCase().includes(s)) ||
                    (item.features && item.features.some((f) => f.name.toLowerCase().includes(s) || f.description.toLowerCase().includes(s)));

                  let matchCategory = itemCategoryFilter === 'All' || item.category === itemCategoryFilter;
                  if (itemCategoryFilter === 'Loot') matchCategory = item.cost === 'Loot' || item.subCategory?.includes('Loot') || false;
                  else if (itemCategoryFilter === 'Consumable') matchCategory = item.cost === 'Consumable' || item.subCategory?.includes('Consumable') || false;
                  const matchTier =
                    weaponTierFilter === 'All' || item.tier === undefined || item.tier === weaponTierFilter;

                  return matchSearch && matchCategory && matchTier;
                }).map((item) => (
                  <div
                    key={item.id}
                    className="bg-slate-950/80 p-2.5 border border-slate-800/90 rounded-lg space-y-2 text-[11px] hover:border-amber-500/40 transition shadow-sm"
                  >
                    {/* Header */}
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-serif font-bold text-amber-200 text-xs flex items-center gap-1.5">
                          <span>{item.name}</span>
                          {item.tier !== undefined && (
                            <span className="text-[8px] bg-amber-950 text-amber-400 border border-amber-800/80 px-1 py-0.2 rounded font-mono">
                              Tier {item.tier}
                            </span>
                          )}
                        </div>
                        <div className="text-[9px] text-slate-400 uppercase font-mono tracking-wider flex items-center gap-1 mt-0.5">
                          <span>{item.subCategory || item.category}</span>
                          {item.hands && <span>• {item.hands}H</span>}
                          {item.isSecondary !== undefined && (
                            <span className={`px-1 rounded text-[8px] ${item.isSecondary ? 'bg-purple-900/60 text-purple-300 border border-purple-700/60' : 'bg-slate-800 text-slate-300'}`}>
                              {item.isSecondary ? 'Secondary' : 'Primary'}
                            </span>
                          )}
                        </div>
                      </div>

                      <span className="text-[9px] font-semibold text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                        {item.cost || 'Free'}
                      </span>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-1 bg-slate-900/60 p-1.5 rounded border border-slate-800/60 text-[9px] font-mono">
                      {item.damage && (
                        <div>
                          <span className="text-red-400 font-bold">DMG:</span> <span className="text-slate-200">{item.damage}</span>
                        </div>
                      )}
                      {item.range && (
                        <div>
                          <span className="text-blue-400 font-bold">RNG:</span> <span className="text-slate-200">{item.range}</span>
                        </div>
                      )}
                      {item.traitRequirement && (
                        <div>
                          <span className="text-purple-400 font-bold">Trait:</span> <span className="text-slate-200">{item.traitRequirement}</span>
                        </div>
                      )}
                      {item.armorRating !== undefined && (
                        <div>
                          <span className="text-amber-400 font-bold">Armor:</span> <span className="text-slate-200">+{item.armorRating}</span>
                        </div>
                      )}
                    </div>

                    {/* Features List */}
                    {item.features && item.features.length > 0 && (
                      <div className="space-y-1 border-t border-slate-800/60 pt-1.5">
                        <span className="text-[8px] font-bold uppercase tracking-wider text-amber-500/90 block">
                          {item.category === 'Weapon' ? 'Weapon Features:' : 'Special Features & Actions:'}
                        </span>
                        <div className="space-y-1">
                          {item.features.map((feat, idx) => (
                            <div key={idx} className="bg-slate-900/80 p-1.5 rounded border border-slate-800/60 text-[10px]">
                              <span className="font-bold text-amber-300">{feat.name}: </span>
                              <span className="text-slate-300 leading-snug">{feat.description}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Description */}
                    {item.description && (
                      <p className="text-[10px] text-slate-300 leading-relaxed italic border-t border-slate-900 pt-1">{item.description}</p>
                    )}
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

      {/* Interactive SRD Iframe Modal Viewer */}
      {isSrdModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6 select-text">
          <div className="bg-slate-900 border border-amber-500/60 rounded-2xl w-full max-w-6xl h-[88vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="bg-slate-950 p-4 border-b border-slate-800 flex justify-between items-center shrink-0">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="font-serif font-bold text-base text-amber-200">
                    Open Gaming Daggerheart SRD Guide (OG-DHSRD)
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    {activeSrdUrl}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <a
                  href={activeSrdUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-semibold rounded-lg border border-slate-700 transition flex items-center gap-1.5"
                >
                  <span>Open External</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <button
                  onClick={() => setIsSrdModalOpen(false)}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition"
                >
                  Close Viewer
                </button>
              </div>
            </div>

            <div className="flex-1 bg-slate-950 relative">
              <iframe
                src={activeSrdUrl}
                title="Open Gaming Daggerheart SRD"
                className="w-full h-full border-0"
                sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
