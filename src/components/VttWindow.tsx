import React, { useState, useRef } from 'react';
import { Minus, Square, X, Maximize2, Minimize2 } from 'lucide-react';

interface VttWindowProps {
  id: string;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  initialX?: number;
  initialY?: number;
  width?: string | number;
  height?: string | number;
  zIndex?: number;
  onFocus?: () => void;
}

function parseInitialWidth(val: string | number | undefined): number {
  if (typeof val === 'number') return val;
  if (!val) return 480;
  const match = val.match(/w-\[(\d+)px\]/);
  if (match) return parseInt(match[1], 10);
  if (val.includes('w-96')) return 384;
  if (val.includes('w-80')) return 320;
  if (val.includes('w-72')) return 288;
  return 480;
}

function parseInitialHeight(val: string | number | undefined): number {
  if (typeof val === 'number') return val;
  if (!val) return 500;
  const match = val.match(/h-\[(\d+)px\]/) || val.match(/max-h-\[(\d+)px\]/);
  if (match) return parseInt(match[1], 10);
  return 500;
}

export const VttWindow: React.FC<VttWindowProps> = ({
  id,
  title,
  onClose,
  children,
  initialX = 100,
  initialY = 100,
  width,
  height,
  zIndex = 50,
  onFocus,
}) => {
  const [position, setPosition] = useState({ x: initialX, y: initialY });
  const [size, setSize] = useState(() => ({
    width: parseInitialWidth(width),
    height: parseInitialHeight(height),
  }));

  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [restoredState, setRestoredState] = useState<{
    position: { x: number; y: number };
    size: { width: number; height: number };
  } | null>(null);

  const windowRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<HTMLDivElement>(null);

  // Drag Window Header Handler
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (onFocus) onFocus();
    
    // Only drag with left click
    if (e.button !== 0 || isMaximized) return;
    
    // Prevent dragging if clicking buttons or resizers
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('.resizer')) return;

    const startX = e.clientX - position.x;
    const startY = e.clientY - position.y;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const nextX = Math.max(10, Math.min(window.innerWidth - 100, moveEvent.clientX - startX));
      const nextY = Math.max(10, Math.min(window.innerHeight - 80, moveEvent.clientY - startY));
      setPosition({ x: nextX, y: nextY });
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (onFocus) onFocus();
    if (isMaximized) return;
    
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('.resizer')) return;

    const touch = e.touches[0];
    const startX = touch.clientX - position.x;
    const startY = touch.clientY - position.y;

    const handleTouchMove = (moveEvent: TouchEvent) => {
      if (moveEvent.touches.length === 0) return;
      const moveTouch = moveEvent.touches[0];

      const nextX = Math.max(10, Math.min(window.innerWidth - 100, moveTouch.clientX - startX));
      const nextY = Math.max(10, Math.min(window.innerHeight - 80, moveTouch.clientY - startY));
      setPosition({ x: nextX, y: nextY });
    };

    const handleTouchEnd = () => {
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };

    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
  };

  // Generic Resize Handler (Edge & Corner)
  const startResize = (
    e: React.MouseEvent | React.TouchEvent,
    directions: { east?: boolean; south?: boolean; west?: boolean; north?: boolean }
  ) => {
    e.stopPropagation();
    e.preventDefault();
    if (onFocus) onFocus();
    if (isMaximized || isMinimized) return;

    setIsResizing(true);

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const startX = clientX;
    const startY = clientY;
    const startWidth = size.width;
    const startHeight = size.height;
    const startPosX = position.x;
    const startPosY = position.y;

    const handleMove = (moveX: number, moveY: number) => {
      const deltaX = moveX - startX;
      const deltaY = moveY - startY;

      let newWidth = startWidth;
      let newHeight = startHeight;
      let newPosX = startPosX;
      let newPosY = startPosY;

      if (directions.east) {
        newWidth = Math.max(260, Math.min(window.innerWidth - startPosX - 20, startWidth + deltaX));
      }

      if (directions.south) {
        newHeight = Math.max(180, Math.min(window.innerHeight - startPosY - 20, startHeight + deltaY));
      }

      if (directions.west) {
        const potentialWidth = startWidth - deltaX;
        if (potentialWidth >= 260 && startPosX + deltaX >= 10) {
          newWidth = potentialWidth;
          newPosX = startPosX + deltaX;
        }
      }

      if (directions.north) {
        const potentialHeight = startHeight - deltaY;
        if (potentialHeight >= 180 && startPosY + deltaY >= 10) {
          newHeight = potentialHeight;
          newPosY = startPosY + deltaY;
        }
      }

      setSize({ width: newWidth, height: newHeight });
      if (directions.west || directions.north) {
        setPosition({ x: newPosX, y: newPosY });
      }
    };

    const onMouseMove = (moveEvent: MouseEvent) => {
      handleMove(moveEvent.clientX, moveEvent.clientY);
    };

    const onTouchMove = (moveEvent: TouchEvent) => {
      if (moveEvent.touches.length > 0) {
        handleMove(moveEvent.touches[0].clientX, moveEvent.touches[0].clientY);
      }
    };

    const onEnd = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onEnd);
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onEnd);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onEnd);
    document.addEventListener('touchmove', onTouchMove, { passive: false });
    document.addEventListener('touchend', onEnd);
  };

  // Toggle Maximize / Restore
  const toggleMaximize = () => {
    if (isMaximized) {
      if (restoredState) {
        setPosition(restoredState.position);
        setSize(restoredState.size);
      }
      setIsMaximized(false);
    } else {
      setRestoredState({ position, size });
      setPosition({ x: 20, y: 50 });
      setSize({
        width: Math.max(320, window.innerWidth - 40),
        height: Math.max(240, window.innerHeight - 80),
      });
      setIsMaximized(true);
      setIsMinimized(false);
    }
  };

  // Set Preset Size
  const applyPresetSize = (w: number, h: number) => {
    if (isMaximized) setIsMaximized(false);
    setSize({
      width: Math.min(w, window.innerWidth - 40),
      height: Math.min(h, window.innerHeight - 60),
    });
  };

  const currentWidth = isMaximized ? window.innerWidth - 40 : size.width;
  const currentHeight = isMaximized ? window.innerHeight - 80 : size.height;

  return (
    <div
      ref={windowRef}
      style={{
        position: 'fixed',
        left: isMaximized ? '20px' : `${position.x}px`,
        top: isMaximized ? '50px' : `${position.y}px`,
        width: `${currentWidth}px`,
        height: isMinimized ? '40px' : `${currentHeight}px`,
        zIndex: zIndex,
      }}
      onClick={onFocus}
      className={`flex flex-col bg-slate-900/95 backdrop-blur border border-amber-500/40 rounded-xl shadow-2xl overflow-hidden border-t-2 border-t-amber-400 ${
        isResizing ? 'select-none ring-2 ring-amber-400/50' : ''
      } transition-shadow duration-150`}
    >
      {/* Title / Drag Bar */}
      <div
        ref={dragRef}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        className="flex items-center justify-between px-3 py-2 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800 cursor-grab active:cursor-grabbing text-xs select-none shrink-0"
      >
        <div className="flex items-center space-x-2 font-serif font-bold text-amber-200 tracking-wider text-[11px] uppercase min-w-0 pr-2">
          <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
          <span className="truncate">{title}</span>
          <span className="text-[9px] font-mono text-slate-500 font-normal hidden sm:inline-block">
            ({Math.round(currentWidth)}×{Math.round(currentHeight)}px)
          </span>
        </div>

        {/* Header Quick Controls */}
        <div className="flex items-center space-x-1 shrink-0">
          {/* Preset Size Shortcuts */}
          {!isMinimized && !isMaximized && (
            <div className="hidden md:flex items-center border border-slate-800 rounded bg-slate-950 px-1 py-0.5 space-x-0.5 text-[9px] font-mono text-slate-400 mr-1">
              <button
                onClick={() => applyPresetSize(380, 420)}
                className="px-1 py-0.2 hover:text-amber-300 hover:bg-slate-800 rounded transition"
                title="Small Window Preset (380x420)"
              >
                S
              </button>
              <button
                onClick={() => applyPresetSize(540, 520)}
                className="px-1 py-0.2 hover:text-amber-300 hover:bg-slate-800 rounded transition"
                title="Medium Window Preset (540x520)"
              >
                M
              </button>
              <button
                onClick={() => applyPresetSize(740, 620)}
                className="px-1 py-0.2 hover:text-amber-300 hover:bg-slate-800 rounded transition"
                title="Large Window Preset (740x620)"
              >
                L
              </button>
            </div>
          )}

          {/* Maximize / Restore Toggle */}
          <button
            onClick={toggleMaximize}
            className="p-1 rounded text-slate-400 hover:text-amber-300 hover:bg-slate-800 transition"
            title={isMaximized ? 'Restore Window Size' : 'Maximize Window'}
          >
            {isMaximized ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>

          {/* Minimize / Restore Toggle */}
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 rounded text-slate-400 hover:text-amber-300 hover:bg-slate-800 transition"
            title={isMinimized ? 'Expand Window' : 'Minimize Window'}
          >
            {isMinimized ? <Square className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />}
          </button>

          {/* Close Window Button */}
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-red-400 hover:bg-slate-800 transition"
            title="Close Sheet"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Window Body Container */}
      {!isMinimized && (
        <div className="flex-1 overflow-y-auto p-4 text-slate-200 bg-slate-900/45 scrollbar-thin scrollbar-thumb-slate-800 text-xs select-text relative flex flex-col min-h-0">
          {children}
        </div>
      )}

      {/* Interactive Resizer Handles (Only visible when not minimized / maximized) */}
      {!isMinimized && !isMaximized && (
        <>
          {/* East Edge Resizer */}
          <div
            onMouseDown={(e) => startResize(e, { east: true })}
            onTouchStart={(e) => startResize(e, { east: true })}
            className="resizer absolute top-8 right-0 bottom-4 w-2 cursor-e-resize hover:bg-amber-400/50 z-40 transition-colors"
            title="Drag right edge to change width"
          />

          {/* South Edge Resizer */}
          <div
            onMouseDown={(e) => startResize(e, { south: true })}
            onTouchStart={(e) => startResize(e, { south: true })}
            className="resizer absolute bottom-0 left-4 right-5 h-2 cursor-s-resize hover:bg-amber-400/50 z-40 transition-colors"
            title="Drag bottom edge to change height"
          />

          {/* West Edge Resizer */}
          <div
            onMouseDown={(e) => startResize(e, { west: true })}
            onTouchStart={(e) => startResize(e, { west: true })}
            className="resizer absolute top-8 left-0 bottom-4 w-2 cursor-w-resize hover:bg-amber-400/50 z-40 transition-colors"
            title="Drag left edge to change width"
          />

          {/* North Edge Resizer */}
          <div
            onMouseDown={(e) => startResize(e, { north: true })}
            onTouchStart={(e) => startResize(e, { north: true })}
            className="resizer absolute top-0 left-4 right-20 h-2 cursor-n-resize hover:bg-amber-400/50 z-40 transition-colors"
            title="Drag top edge to change height"
          />

          {/* South-East (Bottom-Right) Corner Resizer */}
          <div
            onMouseDown={(e) => startResize(e, { east: true, south: true })}
            onTouchStart={(e) => startResize(e, { east: true, south: true })}
            className="resizer absolute bottom-0 right-0 w-5 h-5 cursor-se-resize flex items-center justify-center text-amber-500/60 hover:text-amber-300 hover:bg-amber-500/20 rounded-tl z-50 transition-colors"
            title="Drag corner to resize width and height"
          >
            <svg className="w-3.5 h-3.5 transform rotate-45" viewBox="0 0 10 10">
              <line x1="2" y1="8" x2="8" y2="2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="5" y1="8" x2="8" y2="5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>

          {/* South-West (Bottom-Left) Corner Resizer */}
          <div
            onMouseDown={(e) => startResize(e, { west: true, south: true })}
            onTouchStart={(e) => startResize(e, { west: true, south: true })}
            className="resizer absolute bottom-0 left-0 w-4 h-4 cursor-sw-resize hover:bg-amber-400/30 z-40 transition-colors"
            title="Drag corner to resize width and height"
          />
        </>
      )}
    </div>
  );
};
