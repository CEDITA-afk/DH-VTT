import React, { useState, useRef, useEffect } from 'react';
import { MousePointer, Compass, HelpCircle, Eye, Shield, Heart, Skull, Trash2, Plus, Move } from 'lucide-react';
import { PlayerCharacter, CombatParticipant, VttScene } from '../types';
import { soundFX } from '../utils/audioSynth';
import { ADVERSARIES_DATA } from '../data/adversaries';

interface MapToken {
  id: string;
  name: string;
  type: 'player' | 'adversary';
  refId: string; // references PlayerCharacter.id or CombatParticipant.id
  x: number; // 0 - 11
  y: number; // 0 - 9
}

interface VttMapCanvasProps {
  players: PlayerCharacter[];
  combatParticipants: CombatParticipant[];
  setPlayers: React.Dispatch<React.SetStateAction<PlayerCharacter[]>>;
  setCombatParticipants: (updater: (prev: CombatParticipant[]) => CombatParticipant[]) => void;
  onDoubleSelectToken: (type: 'player' | 'adversary', id: string) => void;
  activeScene: VttScene | null;
  onUpdateActiveScene?: (scene: VttScene) => void;
}

const MAP_THEMES = [
  { id: 'wood', name: 'Deep Murkwood (Forest Green)', bg: 'bg-emerald-950/20 border-emerald-900/40' },
  { id: 'stone', name: 'Dungeon Crypt (Slate Stone)', bg: 'bg-slate-900/30 border-slate-800' },
  { id: 'parchment', name: 'Tactical Parchment (Fantasy Gold)', bg: 'bg-amber-950/10 border-amber-900/30' },
  { id: 'custom', name: 'Custom Background Layout', bg: 'bg-slate-950 border-slate-900' },
];

export const VttMapCanvas: React.FC<VttMapCanvasProps> = ({
  players,
  combatParticipants,
  setPlayers,
  setCombatParticipants,
  onDoubleSelectToken,
  activeScene,
  onUpdateActiveScene,
}) => {
  const [mapTheme, setMapTheme] = useState(activeScene?.mapTheme || 'wood');
  const [tokens, setTokens] = useState<MapToken[]>([]);
  const [selectedTokenId, setSelectedTokenId] = useState<string | null>(null);
  const [isRulerMode, setIsRulerMode] = useState<boolean>(false);
  const [isGridVisible, setIsGridVisible] = useState<boolean>(activeScene?.gridVisible !== false);
  const [scale, setScale] = useState<number>(1.0);
  const [tokenScale, setTokenScale] = useState<number>(1.0);

  // GM Foe Spawner Menu & Targeting state
  const [isSpawnMenuOpen, setIsSpawnMenuOpen] = useState(false);
  const [spawnTab, setSpawnTab] = useState<'preset' | 'custom'>('preset');
  
  // Preset selector state
  const [selectedPresetId, setSelectedPresetId] = useState(ADVERSARIES_DATA[0]?.id || '');
  const [presetSearch, setPresetSearch] = useState('');

  // Custom Foe input state
  const [customName, setCustomName] = useState('Goblin Raider');
  const [customHP, setCustomHP] = useState(6);
  const [customEvasion, setCustomEvasion] = useState(11);
  const [customArmor, setCustomArmor] = useState(1);
  const [customDifficulty, setCustomDifficulty] = useState(11);
  const [customTier, setCustomTier] = useState<0 | 1 | 2 | 3 | 4>(1);
  const [customType, setCustomType] = useState<'Minion' | 'Skirmisher' | 'Bruiser' | 'Leader' | 'Solo'>('Bruiser');

  // Targeting state for precise map placement
  const [targetingMode, setTargetingMode] = useState<'spawn' | null>(null);
  const [targetingTemplate, setTargetingTemplate] = useState<any>(null);

  // Track coordinates for newly spawned participants
  const pendingSpawns = useRef<Record<string, { x: number; y: number }>>({});

  const executeSpawn = (template: any, targetCoords?: { x: number; y: number }) => {
    const participantId = 'adv-' + Date.now();
    
    const newParticipant: CombatParticipant = {
      id: participantId,
      adversaryId: template.id || 'custom',
      name: template.name,
      tier: template.tier,
      type: template.type,
      difficulty: template.difficulty,
      evasion: template.evasion,
      armor: template.armor,
      maxHp: template.hp,
      currentHp: template.hp,
      maxStress: template.stress || 2,
      currentStress: 0,
      thresholds: template.thresholds || { 
        minor: Math.max(1, Math.floor(template.hp * 0.4)), 
        major: Math.max(2, Math.floor(template.hp * 0.8)), 
        severe: Math.max(3, Math.floor(template.hp * 1.2)) 
      },
      attacks: template.attacks || [
        { name: 'Basic Attack', modifier: 2, range: 'Melee', damage: '1d8 Physical' }
      ],
      features: template.features || [],
      conditions: [],
    };

    if (targetCoords) {
      pendingSpawns.current[`token-adv-${participantId}`] = targetCoords;
      pendingSpawns.current[participantId] = targetCoords;
    }

    setCombatParticipants((prev) => [...prev, newParticipant]);
    soundFX.playFearBoom();

    // Clean up spawn wizard states
    setTargetingMode(null);
    setTargetingTemplate(null);
    setIsSpawnMenuOpen(false);

    // Auto focus the newly spawned token
    setSelectedTokenId(`token-adv-${participantId}`);
  };

  useEffect(() => {
    if (activeScene) {
      setMapTheme(activeScene.mapTheme || 'wood');
      setIsGridVisible(activeScene.gridVisible !== false);
    }
  }, [activeScene]);

  const handleSetTheme = (theme: string) => {
    const t = theme as 'wood' | 'stone' | 'parchment' | 'custom';
    setMapTheme(t);
    if (activeScene && onUpdateActiveScene) {
      onUpdateActiveScene({
        ...activeScene,
        mapTheme: t,
      });
    }
  };

  const handleSetGridVisible = (visible: boolean) => {
    setIsGridVisible(visible);
    if (activeScene && onUpdateActiveScene) {
      onUpdateActiveScene({
        ...activeScene,
        gridVisible: visible,
      });
    }
  };
  
  // Ruler measurement state
  const [ruler, setRuler] = useState<{
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
    isActive: boolean;
  } | null>(null);

  const gridRef = useRef<HTMLDivElement>(null);
  const [draggingToken, setDraggingToken] = useState<string | null>(null);

  const COLS = 12;
  const ROWS = 9;

  // Sync token pool with active characters & combatants
  useEffect(() => {
    setTokens((prev) => {
      const updated: MapToken[] = [];
      
      // Keep existing token positions if still valid
      const findExisting = (type: 'player' | 'adversary', refId: string) => {
        return prev.find((t) => t.type === type && t.refId === refId);
      };

      // 1. Setup Player Tokens
      players.forEach((p, idx) => {
        const exist = findExisting('player', p.id);
        if (exist) {
          updated.push(exist);
        } else {
          // Spawn in left-side area (col 1, distributed vertically)
          updated.push({
            id: `token-pc-${p.id}`,
            name: p.name,
            type: 'player',
            refId: p.id,
            x: 1,
            y: Math.min(ROWS - 1, idx + 2),
          });
        }
      });

      // 2. Setup Adversary Combat Tokens
      combatParticipants.forEach((adv, idx) => {
        const exist = findExisting('adversary', adv.id);
        if (exist) {
          updated.push(exist);
        } else {
          // Check if custom spawning coordinates are registered
          const tokenKey = `token-adv-${adv.id}`;
          const pending = pendingSpawns.current[tokenKey] || pendingSpawns.current[adv.id];
          
          const defaultX = 9;
          const defaultY = Math.min(ROWS - 1, idx + 2);

          updated.push({
            id: tokenKey,
            name: adv.name,
            type: 'adversary',
            refId: adv.id,
            x: pending ? pending.x : defaultX,
            y: pending ? pending.y : defaultY,
          });

          // Clean up pending spawn coordinates once consumed
          if (pending) {
            delete pendingSpawns.current[tokenKey];
            delete pendingSpawns.current[adv.id];
          }
        }
      });

      return updated;
    });
  }, [players, combatParticipants]);

  // Handle Token selection
  const handleSelectToken = (id: string, e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    setSelectedTokenId(id);
    soundFX.playClockTick();
  };

  const handleDoubleSelectToken = (token: MapToken, e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    onDoubleSelectToken(token.type, token.refId);
  };

  // Handle Drag Start
  const handleTokenDragStart = (id: string, e: React.MouseEvent) => {
    if (isRulerMode) return;
    e.preventDefault();
    setDraggingToken(id);
    setSelectedTokenId(id);
  };

  const handleTokenTouchStart = (id: string, e: React.TouchEvent) => {
    if (isRulerMode) return;
    if (e.cancelable) {
      e.preventDefault();
    }
    setDraggingToken(id);
    setSelectedTokenId(id);
  };

  // Drag Motion & Drop
  useEffect(() => {
    const handleMove = (clientX: number, clientY: number) => {
      if (!draggingToken || !gridRef.current) return;

      const rect = gridRef.current.getBoundingClientRect();
      const cellWidth = rect.width / COLS;
      const cellHeight = rect.height / ROWS;

      const mouseX = clientX - rect.left;
      const mouseY = clientY - rect.top;

      const gridX = Math.max(0, Math.min(COLS - 1, Math.floor(mouseX / cellWidth)));
      const gridY = Math.max(0, Math.min(ROWS - 1, Math.floor(mouseY / cellHeight)));

      setTokens((prev) =>
        prev.map((t) => (t.id === draggingToken ? { ...t, x: gridX, y: gridY } : t))
      );
    };

    const handleGlobalMouseMove = (e: MouseEvent) => {
      handleMove(e.clientX, e.clientY);
    };

    const handleGlobalTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        handleMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const handleGlobalMouseUp = () => {
      if (draggingToken) {
        setDraggingToken(null);
        soundFX.playClockTick();
      }
    };

    if (draggingToken) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
      document.addEventListener('touchmove', handleGlobalTouchMove, { passive: false });
      document.addEventListener('touchend', handleGlobalMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.removeEventListener('touchmove', handleGlobalTouchMove);
      document.removeEventListener('touchend', handleGlobalMouseUp);
    };
  }, [draggingToken]);

  // Ruler measuring & Spawn placement events
  const handleGridMouseDown = (e: React.MouseEvent) => {
    if (!gridRef.current) return;

    const rect = gridRef.current.getBoundingClientRect();
    const cellWidth = rect.width / COLS;
    const cellHeight = rect.height / ROWS;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const cellX = Math.max(0, Math.min(COLS - 1, Math.floor(mouseX / cellWidth)));
    const cellY = Math.max(0, Math.min(ROWS - 1, Math.floor(mouseY / cellHeight)));

    // If in precise spawning/placement mode
    if (targetingMode === 'spawn' && targetingTemplate) {
      e.preventDefault();
      executeSpawn(targetingTemplate, { x: cellX, y: cellY });
      return;
    }

    if (!isRulerMode) return;
    e.preventDefault();

    setRuler({
      startX: cellX,
      startY: cellY,
      currentX: cellX,
      currentY: cellY,
      isActive: true,
    });
    soundFX.playClockTick();
  };

  const handleGridTouchStart = (e: React.TouchEvent) => {
    if (!gridRef.current) return;
    const target = e.target as HTMLElement;
    if (target.closest('.cursor-grab')) return; // let token drag handle it

    const rect = gridRef.current.getBoundingClientRect();
    const cellWidth = rect.width / COLS;
    const cellHeight = rect.height / ROWS;

    const touch = e.touches[0];
    const mouseX = touch.clientX - rect.left;
    const mouseY = touch.clientY - rect.top;

    const cellX = Math.max(0, Math.min(COLS - 1, Math.floor(mouseX / cellWidth)));
    const cellY = Math.max(0, Math.min(ROWS - 1, Math.floor(mouseY / cellHeight)));

    // If in precise spawning/placement mode
    if (targetingMode === 'spawn' && targetingTemplate) {
      if (e.cancelable) {
        e.preventDefault();
      }
      executeSpawn(targetingTemplate, { x: cellX, y: cellY });
      return;
    }

    if (!isRulerMode) return;
    if (e.cancelable) {
      e.preventDefault();
    }

    setRuler({
      startX: cellX,
      startY: cellY,
      currentX: cellX,
      currentY: cellY,
      isActive: true,
    });
    soundFX.playClockTick();
  };

  useEffect(() => {
    const handleMove = (clientX: number, clientY: number) => {
      if (!ruler || !ruler.isActive || !gridRef.current) return;

      const rect = gridRef.current.getBoundingClientRect();
      const cellWidth = rect.width / COLS;
      const cellHeight = rect.height / ROWS;

      const mouseX = clientX - rect.left;
      const mouseY = clientY - rect.top;

      const cellX = Math.max(0, Math.min(COLS - 1, Math.floor(mouseX / cellWidth)));
      const cellY = Math.max(0, Math.min(ROWS - 1, Math.floor(mouseY / cellHeight)));

      setRuler((prev) => (prev ? { ...prev, currentX: cellX, currentY: cellY } : null));
    };

    const handleGlobalRulerMove = (e: MouseEvent) => {
      handleMove(e.clientX, e.clientY);
    };

    const handleGlobalRulerTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        handleMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const handleGlobalRulerUp = () => {
      if (ruler && ruler.isActive) {
        setRuler((prev) => (prev ? { ...prev, isActive: false } : null));
      }
    };

    if (ruler?.isActive) {
      document.addEventListener('mousemove', handleGlobalRulerMove);
      document.addEventListener('mouseup', handleGlobalRulerUp);
      document.addEventListener('touchmove', handleGlobalRulerTouchMove, { passive: false });
      document.addEventListener('touchend', handleGlobalRulerUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalRulerMove);
      document.removeEventListener('mouseup', handleGlobalRulerUp);
      document.removeEventListener('touchmove', handleGlobalRulerTouchMove);
      document.removeEventListener('touchend', handleGlobalRulerUp);
    };
  }, [ruler]);

  // Helper: Calculate Daggerheart Ranges
  const getDaggerheartRangeText = (dx: number, dy: number) => {
    const dist = Math.sqrt(dx * dx + dy * dy);
    const cells = Math.round(dist);
    let range = 'Melee Range';
    let labelColor = 'text-amber-400';
    
    if (cells <= 1.5) {
      range = 'Melee (Within 5 ft)';
      labelColor = 'text-red-400';
    } else if (cells <= 3) {
      range = 'Very Close (10 ft)';
      labelColor = 'text-orange-400';
    } else if (cells <= 5) {
      range = 'Close (15-30 ft)';
      labelColor = 'text-amber-400';
    } else if (cells <= 8) {
      range = 'Near (30-60 ft)';
      labelColor = 'text-emerald-400';
    } else {
      range = 'Far / Very Far (60+ ft)';
      labelColor = 'text-cyan-400';
    }

    return { text: `${cells} cells (${range})`, color: labelColor };
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden relative">
      {/* Map Control Header */}
      <div className="bg-slate-950 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-3">
          <Compass className="w-4 h-4 text-amber-400" />
          <span className="font-serif font-bold text-amber-200 uppercase tracking-wider">Tactical VTT Battle Map</span>
        </div>

        <div className="flex items-center space-x-2">
          {/* Tool Selector */}
          <button
            onClick={() => {
              setIsRulerMode(false);
              setRuler(null);
            }}
            className={`px-2 py-1 rounded transition flex items-center space-x-1.5 font-bold border ${
              !isRulerMode
                ? 'bg-amber-500 text-slate-950 border-amber-400'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            <MousePointer className="w-3.5 h-3.5" />
            <span>Select/Move</span>
          </button>

          <button
            onClick={() => setIsRulerMode(true)}
            className={`px-2 py-1 rounded transition flex items-center space-x-1.5 font-bold border ${
              isRulerMode
                ? 'bg-amber-500 text-slate-950 border-amber-400'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Ruler</span>
          </button>

          {/* Grid toggler */}
          <button
            onClick={() => handleSetGridVisible(!isGridVisible)}
            className={`px-2 py-1 rounded border hover:text-slate-200 transition ${
              isGridVisible ? 'bg-slate-900 text-amber-300 border-amber-900/40' : 'bg-slate-950 text-slate-500 border-slate-800'
            }`}
            title="Toggle hex grid overlay"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>

          {/* Zoom Controls */}
          <div className="flex items-center space-x-1.5 bg-slate-900 border border-slate-800 rounded px-2 py-0.5 text-[10px]" title="Map Zoom Level">
            <span className="text-slate-400 font-bold mr-0.5 select-none">Map:</span>
            <button
              onClick={() => setScale(prev => Math.max(0.6, prev - 0.1))}
              className="text-slate-400 hover:text-amber-400 font-extrabold w-3 text-center transition"
            >
              -
            </button>
            <span className="font-mono text-amber-400 min-w-[32px] text-center font-bold">
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={() => setScale(prev => Math.min(2.0, prev + 0.1))}
              className="text-slate-400 hover:text-amber-400 font-extrabold w-3 text-center transition"
            >
              +
            </button>
          </div>

          {/* Token Size Controls */}
          <div className="flex items-center space-x-1.5 bg-slate-900 border border-slate-800 rounded px-2 py-0.5 text-[10px]" title="Token Scale Size">
            <span className="text-slate-400 font-bold mr-0.5 select-none">Tokens:</span>
            <button
              onClick={() => setTokenScale(prev => Math.max(0.4, prev - 0.1))}
              className="text-slate-400 hover:text-amber-400 font-extrabold w-3 text-center transition"
            >
              -
            </button>
            <span className="font-mono text-amber-400 min-w-[32px] text-center font-bold">
              {Math.round(tokenScale * 100)}%
            </span>
            <button
              onClick={() => setTokenScale(prev => Math.min(2.5, prev + 0.1))}
              className="text-slate-400 hover:text-amber-400 font-extrabold w-3 text-center transition"
            >
              +
            </button>
          </div>

          {/* Theme Selector */}
          <select
            value={mapTheme}
            onChange={(e) => handleSetTheme(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-slate-200 rounded px-1.5 py-0.5"
          >
            {MAP_THEMES.map((theme) => (
              <option key={theme.id} value={theme.id}>
                {theme.name}
              </option>
            ))}
          </select>

          {/* Introduce Foe Toggle Button */}
          <button
            onClick={() => {
              setIsSpawnMenuOpen(!isSpawnMenuOpen);
              // abort any existing targeting mode
              setTargetingMode(null);
              setTargetingTemplate(null);
            }}
            className={`px-2 py-0.5 rounded border text-[10px] font-bold transition flex items-center space-x-1 ${
              isSpawnMenuOpen
                ? 'bg-red-500 text-slate-950 border-red-400'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:text-red-400 hover:border-red-900/60'
            }`}
            title="Introduce a new adversary token onto the map"
          >
            <Skull className="w-3 h-3 text-red-500" />
            <span>+ Introduce Foe</span>
          </button>
        </div>
      </div>

      {/* Main Map Grid Container */}
      <div className="flex-1 relative overflow-auto flex items-center justify-center p-3 select-none bg-slate-950">
        <div
          ref={gridRef}
          onMouseDown={handleGridMouseDown}
          onTouchStart={handleGridTouchStart}
          className={`relative w-full max-w-4xl aspect-[4/3] rounded-lg border shadow-inner transition-all overflow-hidden ${
            targetingMode === 'spawn' ? 'cursor-crosshair ring-2 ring-red-500 animate-pulse' : ''
          } ${
            mapTheme === 'wood'
              ? 'bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-950/20 via-slate-950 to-slate-950 border-emerald-900/40'
              : mapTheme === 'parchment'
              ? 'bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-950/10 via-slate-950 to-slate-950 border-amber-900/40'
              : mapTheme === 'stone'
              ? 'bg-slate-900/30 border-slate-800'
              : 'bg-slate-950 border-slate-900'
          }`}
          style={{
            transform: `scale(${scale})`,
            transformOrigin: 'center center',
            transition: draggingToken ? 'none' : 'transform 0.15s ease-out',
            backgroundImage: isGridVisible
              ? `linear-gradient(to right, rgba(245, 158, 11, 0.04) 1px, transparent 1px),
                 linear-gradient(to bottom, rgba(245, 158, 11, 0.04) 1px, transparent 1px)`
              : 'none',
            backgroundSize: `${100 / COLS}% ${100 / ROWS}%`,
          }}
        >
          {/* Custom map URL image if defined */}
          {activeScene?.mapUrl && (
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat pointer-events-none"
              style={{ backgroundImage: `url(${activeScene.mapUrl})` }}
            />
          )}

          {/* Subtle Fantasy Canvas Elements */}
          <div className={`absolute inset-0 pointer-events-none bg-[url('https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=2070')] bg-cover mix-blend-overlay ${
            activeScene?.mapUrl ? 'opacity-10' : 'opacity-20'
          }`} />

          {/* Ruler Line Render */}
          {ruler && (
            <svg className="absolute inset-0 pointer-events-none w-full h-full z-10 overflow-visible">
              <defs>
                <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#f59e0b" />
                </marker>
              </defs>
              {(() => {
                const width = gridRef.current?.clientWidth || 0;
                const height = gridRef.current?.clientHeight || 0;
                if (!width || !height) return null;
                const cellWidth = width / COLS;
                const cellHeight = height / ROWS;

                const startPxX = ruler.startX * cellWidth + cellWidth / 2;
                const startPxY = ruler.startY * cellHeight + cellHeight / 2;
                const currentPxX = ruler.currentX * cellWidth + cellWidth / 2;
                const currentPxY = ruler.currentY * cellHeight + cellHeight / 2;

                const dx = ruler.currentX - ruler.startX;
                const dy = ruler.currentY - ruler.startY;
                const rangeData = getDaggerheartRangeText(dx, dy);

                return (
                  <>
                    {/* Measurement Line */}
                    <line
                      x1={startPxX}
                      y1={startPxY}
                      x2={currentPxX}
                      y2={currentPxY}
                      stroke="#f59e0b"
                      strokeWidth="2.5"
                      strokeDasharray="4"
                      markerEnd="url(#arrow)"
                    />
                    {/* Measurement Start circle */}
                    <circle cx={startPxX} cy={startPxY} r="4" fill="#f59e0b" />
                    
                    {/* Distance Badge */}
                    <foreignObject
                      x={Math.min(startPxX, currentPxX) + Math.abs(startPxX - currentPxX) / 2 - 80}
                      y={Math.min(startPxY, currentPxY) + Math.abs(startPxY - currentPxY) / 2 - 25}
                      width="160"
                      height="30"
                      className="overflow-visible"
                    >
                      <div className="flex justify-center">
                        <span className="bg-slate-950/95 border border-amber-500/50 px-2 py-0.5 rounded text-[9px] font-mono font-bold tracking-tight shadow-md whitespace-nowrap text-amber-200">
                          {rangeData.text}
                        </span>
                      </div>
                    </foreignObject>
                  </>
                );
              })()}
            </svg>
          )}

          {/* Tokens Placement */}
          {tokens.map((token) => {
            const isSelected = selectedTokenId === token.id;
            const isDragging = draggingToken === token.id;

            // Fetch actual HP / Status from parents
            let currentHp = 0;
            let maxHp = 1;
            let label = token.name.charAt(0);
            let colorClass = 'from-amber-600 to-amber-800';
            let condCount = 0;

            if (token.type === 'player') {
              const pc = players.find((p) => p.id === token.refId);
              if (pc) {
                currentHp = pc.currentHp;
                maxHp = pc.maxHp;
                label = pc.name.substring(0, 2);
                colorClass = pc.avatarColor || 'from-amber-600 to-amber-800';
                condCount = pc.conditions.length;
              }
            } else {
              const adv = combatParticipants.find((a) => a.id === token.refId);
              if (adv) {
                currentHp = adv.currentHp;
                maxHp = adv.maxHp;
                label = adv.name.substring(0, 2);
                colorClass = 'from-purple-900 to-purple-950 border-purple-600';
                condCount = adv.conditions.length;
              }
            }

            const hpPercent = Math.max(0, Math.min(100, (currentHp / maxHp) * 100));

            return (
              <div
                key={token.id}
                onMouseDown={(e) => handleTokenDragStart(token.id, e)}
                onTouchStart={(e) => handleTokenTouchStart(token.id, e)}
                onClick={(e) => handleSelectToken(token.id, e)}
                onDoubleClick={(e) => handleDoubleSelectToken(token, e)}
                className={`absolute rounded-full aspect-square shadow-xl flex items-center justify-center transition-all cursor-grab active:cursor-grabbing border-2 ${
                  isSelected
                    ? 'border-amber-400 ring-4 ring-amber-500/40 z-30'
                    : token.type === 'player'
                    ? 'border-amber-600 hover:border-amber-300'
                    : 'border-red-600 hover:border-red-400'
                } ${isDragging ? 'opacity-70 z-30' : ''}`}
                style={{
                  width: `${100 / COLS}%`,
                  height: `${100 / ROWS}%`,
                  left: `${(token.x * 100) / COLS}%`,
                  top: `${(token.y * 100) / ROWS}%`,
                  transform: `scale(${(1 / scale) * tokenScale * (isDragging ? 1.12 : isSelected ? 1.06 : 1)})`,
                }}
              >
                {/* Visual Avatar */}
                <div className={`w-full h-full rounded-full bg-gradient-to-br ${colorClass} flex flex-col items-center justify-center text-[10px] font-extrabold uppercase relative overflow-hidden text-slate-100 border border-slate-950/45`}>
                  {/* Avatar Letter */}
                  <span className="drop-shadow-md text-[11px] font-serif">{label}</span>

                  {/* Conditions indicator */}
                  {condCount > 0 && (
                    <div className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-3.5 h-3.5 flex items-center justify-center text-[8px] font-bold border border-slate-950 shadow">
                      !
                    </div>
                  )}

                  {/* Health Bar overlay */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-950/80">
                    <div
                      className={`h-full ${
                        hpPercent > 50 ? 'bg-emerald-500' : hpPercent > 20 ? 'bg-amber-500' : 'bg-red-600 animate-pulse'
                      }`}
                      style={{ width: `${hpPercent}%` }}
                    />
                  </div>
                </div>

                {/* Hover/Selection Floating Tag Info */}
                {isSelected && (
                  <div className="absolute -top-8 bg-slate-950 border border-amber-500/50 px-2 py-1 rounded-lg text-[9px] font-serif font-bold whitespace-nowrap text-amber-300 shadow-xl z-50 flex items-center space-x-2">
                    <span>{token.name} ({currentHp}/{maxHp} HP)</span>
                    {token.type === 'adversary' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // Remove the adversary participant from state
                          setCombatParticipants((prev) => prev.filter((p) => p.id !== token.refId));
                          setSelectedTokenId(null);
                          soundFX.playFearBoom();
                        }}
                        className="p-0.5 bg-red-950 hover:bg-red-900 text-red-400 hover:text-white rounded border border-red-900/50 transition"
                        title="Remove this adversary from map & combat"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Grid Quick Legend / Help */}
      <div className="bg-slate-950/80 border-t border-slate-800 px-4 py-1.5 flex flex-wrap items-center justify-between text-[10px] text-slate-500">
        <div className="flex items-center space-x-3">
          <span>🎯 Double-click token to view details</span>
          <span>•</span>
          <span>🖱️ Click & Drag to move characters</span>
        </div>
        <div className="hidden sm:flex items-center space-x-1">
          <HelpCircle className="w-3 h-3 text-slate-600" />
          <span>Daggerheart ranges: Melee &lt;= 1 cell • Very Close &lt;= 3 cells • Close &lt;= 5 cells • Near &lt;= 8 cells</span>
        </div>
      </div>

      {/* Spawning targeting banner overlay */}
      {targetingMode === 'spawn' && targetingTemplate && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-slate-950/95 border-2 border-red-500 text-red-200 px-4 py-2.5 rounded-xl shadow-2xl z-50 flex items-center space-x-4 text-xs font-bold animate-pulse backdrop-blur-md">
          <Skull className="w-4 h-4 text-red-400" />
          <span>Click any grid square on the map to place: <strong className="text-white">{targetingTemplate.name}</strong></span>
          <button
            onClick={() => {
              setTargetingMode(null);
              setTargetingTemplate(null);
              setIsSpawnMenuOpen(true);
            }}
            className="px-2 py-1 bg-red-900 hover:bg-red-800 text-white rounded font-sans font-bold text-[10px] uppercase tracking-wide shadow"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Floating Introduce Foe Dialog panel */}
      {isSpawnMenuOpen && (
        <div className="absolute right-4 top-16 w-80 bg-slate-950/95 border border-slate-800 rounded-xl shadow-2xl p-4 z-40 space-y-4 max-h-[75%] overflow-y-auto backdrop-blur-md select-text text-left">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center space-x-2">
              <Skull className="w-4 h-4 text-red-500 animate-pulse" />
              <span className="font-serif font-bold text-slate-200">Introduce Adversary</span>
            </div>
            <button 
              onClick={() => setIsSpawnMenuOpen(false)}
              className="text-slate-400 hover:text-slate-200 font-bold hover:bg-slate-900 px-1.5 py-0.5 rounded transition"
            >
              ✕
            </button>
          </div>

          {/* Tab Selection */}
          <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setSpawnTab('preset')}
              className={`flex-1 py-1 rounded-md font-bold transition ${
                spawnTab === 'preset' ? 'bg-red-950 text-red-400 border border-red-900/35 shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Preset Foe
            </button>
            <button
              onClick={() => setSpawnTab('custom')}
              className={`flex-1 py-1 rounded-md font-bold transition ${
                spawnTab === 'custom' ? 'bg-red-950 text-red-400 border border-red-900/35 shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Custom Foe
            </button>
          </div>

          {/* Spawn Presets Tab */}
          {spawnTab === 'preset' ? (
            <div className="space-y-3">
              <div>
                <input
                  type="text"
                  value={presetSearch}
                  onChange={(e) => setPresetSearch(e.target.value)}
                  placeholder="Search compendium (e.g., Skeleton, Wolf)..."
                  className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-xs text-slate-200 focus:outline-none focus:border-red-500"
                />
              </div>

              {/* Scrolling List */}
              <div className="space-y-1 max-h-36 overflow-y-auto border border-slate-900 p-1 rounded bg-slate-950/80">
                {ADVERSARIES_DATA.filter(adv => 
                  adv.name.toLowerCase().includes(presetSearch.toLowerCase())
                ).map(adv => {
                  const isSelected = selectedPresetId === adv.id;
                  return (
                    <div
                      key={adv.id}
                      onClick={() => setSelectedPresetId(adv.id)}
                      className={`p-1.5 rounded text-xs cursor-pointer flex justify-between items-center transition ${
                        isSelected ? 'bg-red-950/60 text-red-400 font-bold border border-red-900/40' : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                      }`}
                    >
                      <span>{adv.name}</span>
                      <span className="text-[10px] text-slate-500">Tier {adv.tier} • {adv.type}</span>
                    </div>
                  );
                })}
              </div>

              {/* Selected Preset Preview Details */}
              {(() => {
                const adv = ADVERSARIES_DATA.find(a => a.id === selectedPresetId);
                if (!adv) return null;
                return (
                  <div className="bg-slate-900/50 p-2 border border-slate-800 rounded-lg text-[10px] space-y-1 leading-relaxed">
                    <div className="flex justify-between text-slate-300 font-bold">
                      <span className="text-red-400">{adv.name}</span>
                      <span>{adv.hp} HP</span>
                    </div>
                    <div className="text-slate-400">
                      Evasion: <strong className="text-slate-200">{adv.evasion}</strong> | Armor: <strong className="text-slate-200">{adv.armor}</strong> | DC: <strong className="text-slate-200">{adv.difficulty}</strong>
                    </div>
                    <p className="text-slate-400 italic line-clamp-2 mt-1">{adv.description}</p>
                  </div>
                );
              })()}
            </div>
          ) : (
            <div className="space-y-2 text-[11px]">
              {/* Custom Foe Inputs */}
              <div>
                <label className="text-[9px] uppercase text-slate-500 font-bold block mb-1">Foe Name</label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded p-1 text-slate-200 focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[9px] uppercase text-slate-500 font-bold block mb-1">Max HP</label>
                  <input
                    type="number"
                    value={customHP}
                    onChange={(e) => setCustomHP(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full bg-slate-900 border border-slate-800 rounded p-1 text-slate-200 focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="text-[9px] uppercase text-slate-500 font-bold block mb-1">Evasion</label>
                  <input
                    type="number"
                    value={customEvasion}
                    onChange={(e) => setCustomEvasion(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full bg-slate-900 border border-slate-800 rounded p-1 text-slate-200 focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[9px] uppercase text-slate-500 font-bold block mb-1">Armor</label>
                  <input
                    type="number"
                    value={customArmor}
                    onChange={(e) => setCustomArmor(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full bg-slate-900 border border-slate-800 rounded p-1 text-slate-200 focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="text-[9px] uppercase text-slate-500 font-bold block mb-1">Diff DC</label>
                  <input
                    type="number"
                    value={customDifficulty}
                    onChange={(e) => setCustomDifficulty(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full bg-slate-900 border border-slate-800 rounded p-1 text-slate-200 focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="text-[9px] uppercase text-slate-500 font-bold block mb-1">Tier</label>
                  <select
                    value={customTier}
                    onChange={(e) => setCustomTier(parseInt(e.target.value) as any)}
                    className="w-full bg-slate-900 border border-slate-800 rounded p-1 text-slate-200 focus:outline-none focus:border-red-500"
                  >
                    {[0, 1, 2, 3, 4].map(t => (
                      <option key={t} value={t}>Tier {t}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[9px] uppercase text-slate-500 font-bold block mb-1">Combatant Archetype</label>
                <select
                  value={customType}
                  onChange={(e) => setCustomType(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-800 rounded p-1 text-slate-200 focus:outline-none focus:border-red-500"
                >
                  {['Minion', 'Skirmisher', 'Bruiser', 'Leader', 'Solo'].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Spawner Buttons */}
          <div className="border-t border-slate-800 pt-3 space-y-2">
            <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wide">Spawner Mode</span>
            
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  let template: any;
                  if (spawnTab === 'preset') {
                    template = ADVERSARIES_DATA.find(a => a.id === selectedPresetId);
                  } else {
                    template = {
                      name: customName,
                      tier: customTier,
                      type: customType,
                      difficulty: customDifficulty,
                      evasion: customEvasion,
                      armor: customArmor,
                      hp: customHP,
                    };
                  }
                  if (template) {
                    executeSpawn(template);
                  }
                }}
                className="py-2 px-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-200 rounded-lg font-bold transition flex flex-col items-center justify-center text-center leading-normal"
              >
                <span className="text-[10px] text-amber-400">⚡ Auto Spawn</span>
                <span className="text-[8px] text-slate-500 font-normal mt-0.5">Spawns on side</span>
              </button>

              <button
                onClick={() => {
                  let template: any;
                  if (spawnTab === 'preset') {
                    template = ADVERSARIES_DATA.find(a => a.id === selectedPresetId);
                  } else {
                    template = {
                      name: customName,
                      tier: customTier,
                      type: customType,
                      difficulty: customDifficulty,
                      evasion: customEvasion,
                      armor: customArmor,
                      hp: customHP,
                    };
                  }
                  if (template) {
                    setTargetingTemplate(template);
                    setTargetingMode('spawn');
                    setIsSpawnMenuOpen(false);
                    soundFX.playClockTick();
                  }
                }}
                className="py-2 px-1.5 bg-red-950/60 hover:bg-red-900/60 border border-red-900/50 text-red-300 rounded-lg font-bold transition flex flex-col items-center justify-center text-center leading-normal"
              >
                <span className="text-[10px] text-red-400">📍 Pick Coordinate</span>
                <span className="text-[8px] text-red-500 font-normal mt-0.5">Click cell on map</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
