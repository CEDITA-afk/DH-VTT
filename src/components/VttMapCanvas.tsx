import React, { useState, useRef, useEffect } from 'react';
import { MousePointer, Compass, HelpCircle, Eye, Shield, Heart, Skull, Trash2, Plus, Move } from 'lucide-react';
import { PlayerCharacter, CombatParticipant } from '../types';
import { soundFX } from '../utils/audioSynth';

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
}

const MAP_THEMES = [
  { id: 'wood', name: 'Deep Murkwood (Forest Green)', bg: 'bg-emerald-950/20 border-emerald-900/40' },
  { id: 'stone', name: 'Dungeon Crypt (Slate Stone)', bg: 'bg-slate-900/30 border-slate-800' },
  { id: 'parchment', name: 'Tactical Parchment (Fantasy Gold)', bg: 'bg-amber-950/10 border-amber-900/30' },
];

export const VttMapCanvas: React.FC<VttMapCanvasProps> = ({
  players,
  combatParticipants,
  setPlayers,
  setCombatParticipants,
  onDoubleSelectToken,
}) => {
  const [mapTheme, setMapTheme] = useState('wood');
  const [tokens, setTokens] = useState<MapToken[]>([]);
  const [selectedTokenId, setSelectedTokenId] = useState<string | null>(null);
  const [isRulerMode, setIsRulerMode] = useState<boolean>(false);
  const [isGridVisible, setIsGridVisible] = useState<boolean>(true);
  
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
          // Spawn in right-side area (col 9, distributed vertically)
          updated.push({
            id: `token-adv-${adv.id}`,
            name: adv.name,
            type: 'adversary',
            refId: adv.id,
            x: 9,
            y: Math.min(ROWS - 1, idx + 2),
          });
        }
      });

      return updated;
    });
  }, [players, combatParticipants]);

  // Handle Token selection
  const handleSelectToken = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedTokenId(id);
    soundFX.playClockTick();
  };

  const handleDoubleSelectToken = (token: MapToken, e: React.MouseEvent) => {
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

  // Drag Motion & Drop
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!draggingToken || !gridRef.current) return;

      const rect = gridRef.current.getBoundingClientRect();
      const cellWidth = rect.width / COLS;
      const cellHeight = rect.height / ROWS;

      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const gridX = Math.max(0, Math.min(COLS - 1, Math.floor(mouseX / cellWidth)));
      const gridY = Math.max(0, Math.min(ROWS - 1, Math.floor(mouseY / cellHeight)));

      setTokens((prev) =>
        prev.map((t) => (t.id === draggingToken ? { ...t, x: gridX, y: gridY } : t))
      );
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
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [draggingToken]);

  // Ruler measuring events
  const handleGridMouseDown = (e: React.MouseEvent) => {
    if (!isRulerMode || !gridRef.current) return;
    e.preventDefault();

    const rect = gridRef.current.getBoundingClientRect();
    const cellWidth = rect.width / COLS;
    const cellHeight = rect.height / ROWS;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const cellX = Math.floor(mouseX / cellWidth);
    const cellY = Math.floor(mouseY / cellHeight);

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
    const handleGlobalRulerMove = (e: MouseEvent) => {
      if (!ruler || !ruler.isActive || !gridRef.current) return;

      const rect = gridRef.current.getBoundingClientRect();
      const cellWidth = rect.width / COLS;
      const cellHeight = rect.height / ROWS;

      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const cellX = Math.max(0, Math.min(COLS - 1, Math.floor(mouseX / cellWidth)));
      const cellY = Math.max(0, Math.min(ROWS - 1, Math.floor(mouseY / cellHeight)));

      setRuler((prev) => (prev ? { ...prev, currentX: cellX, currentY: cellY } : null));
    };

    const handleGlobalRulerUp = () => {
      if (ruler && ruler.isActive) {
        setRuler((prev) => (prev ? { ...prev, isActive: false } : null));
      }
    };

    if (ruler?.isActive) {
      document.addEventListener('mousemove', handleGlobalRulerMove);
      document.addEventListener('mouseup', handleGlobalRulerUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalRulerMove);
      document.removeEventListener('mouseup', handleGlobalRulerUp);
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
            onClick={() => setIsGridVisible(!isGridVisible)}
            className={`px-2 py-1 rounded border hover:text-slate-200 transition ${
              isGridVisible ? 'bg-slate-900 text-amber-300 border-amber-900/40' : 'bg-slate-950 text-slate-500 border-slate-800'
            }`}
            title="Toggle hex grid overlay"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>

          {/* Theme Selector */}
          <select
            value={mapTheme}
            onChange={(e) => setMapTheme(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-slate-200 rounded px-1.5 py-0.5"
          >
            {MAP_THEMES.map((theme) => (
              <option key={theme.id} value={theme.id}>
                {theme.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Map Grid Container */}
      <div className="flex-1 relative overflow-hidden flex items-center justify-center p-3 select-none">
        <div
          ref={gridRef}
          onMouseDown={handleGridMouseDown}
          className={`relative w-full max-w-4xl aspect-[4/3] rounded-lg border shadow-inner transition-all overflow-hidden ${
            mapTheme === 'wood'
              ? 'bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-950/20 via-slate-950 to-slate-950 border-emerald-900/40'
              : mapTheme === 'parchment'
              ? 'bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-950/10 via-slate-950 to-slate-950 border-amber-900/40'
              : 'bg-slate-950 border-slate-900'
          }`}
          style={{
            backgroundImage: isGridVisible
              ? `linear-gradient(to right, rgba(245, 158, 11, 0.04) 1px, transparent 1px),
                 linear-gradient(to bottom, rgba(245, 158, 11, 0.04) 1px, transparent 1px)`
              : 'none',
            backgroundSize: `${100 / COLS}% ${100 / ROWS}%`,
          }}
        >
          {/* Subtle Fantasy Canvas Elements */}
          <div className="absolute inset-0 pointer-events-none opacity-20 bg-[url('https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=2070')] bg-cover mix-blend-overlay" />

          {/* Ruler Line Render */}
          {ruler && (
            <svg className="absolute inset-0 pointer-events-none w-full h-full z-10 overflow-visible">
              <defs>
                <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#f59e0b" />
                </marker>
              </defs>
              {(() => {
                const rect = gridRef.current?.getBoundingClientRect();
                if (!rect) return null;
                const cellWidth = rect.width / COLS;
                const cellHeight = rect.height / ROWS;

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
                onClick={(e) => handleSelectToken(token.id, e)}
                onDoubleClick={(e) => handleDoubleSelectToken(token, e)}
                className={`absolute rounded-full aspect-square shadow-xl flex items-center justify-center transition-all cursor-grab active:cursor-grabbing border-2 ${
                  isSelected
                    ? 'border-amber-400 ring-4 ring-amber-500/40 z-30 scale-105'
                    : token.type === 'player'
                    ? 'border-amber-600 hover:border-amber-300'
                    : 'border-red-600 hover:border-red-400'
                } ${isDragging ? 'opacity-70 scale-110 z-30' : ''}`}
                style={{
                  width: `${100 / COLS}%`,
                  height: `${100 / ROWS}%`,
                  left: `${(token.x * 100) / COLS}%`,
                  top: `${(token.y * 100) / ROWS}%`,
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
                  <div className="absolute -top-7 bg-slate-950 border border-amber-500/50 px-2 py-0.5 rounded text-[9px] font-serif font-bold whitespace-nowrap text-amber-300 shadow-xl z-50">
                    {token.name} ({currentHp}/{maxHp} HP)
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
    </div>
  );
};
