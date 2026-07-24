import React, { useState, useRef, useEffect } from 'react';
import { Minus, Square, X } from 'lucide-react';

interface VttWindowProps {
  id: string;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  initialX?: number;
  initialY?: number;
  width?: string;
  height?: string;
  zIndex?: number;
  onFocus?: () => void;
}

export const VttWindow: React.FC<VttWindowProps> = ({
  id,
  title,
  onClose,
  children,
  initialX = 100,
  initialY = 100,
  width = 'w-96',
  height = 'max-h-[500px]',
  zIndex = 50,
  onFocus,
}) => {
  const [position, setPosition] = useState({ x: initialX, y: initialY });
  const [isMinimized, setIsMinimized] = useState(false);
  const windowRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (onFocus) onFocus();
    
    // Only drag with left click
    if (e.button !== 0) return;
    
    // Prevent dragging if clicking buttons
    const target = e.target as HTMLElement;
    if (target.closest('button')) return;

    const startX = e.clientX - position.x;
    const startY = e.clientY - position.y;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      // Constrain within window limits
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
    
    // Prevent dragging if clicking buttons
    const target = e.target as HTMLElement;
    if (target.closest('button')) return;

    const touch = e.touches[0];
    const startX = touch.clientX - position.x;
    const startY = touch.clientY - position.y;

    const handleTouchMove = (moveEvent: TouchEvent) => {
      if (moveEvent.touches.length === 0) return;
      const moveTouch = moveEvent.touches[0];

      // Constrain within window limits
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

  return (
    <div
      ref={windowRef}
      style={{
        position: 'absolute',
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: zIndex,
      }}
      onClick={onFocus}
      className={`fixed flex flex-col bg-slate-900/95 backdrop-blur border border-amber-500/30 rounded-lg shadow-2xl overflow-hidden ${width} ${
        isMinimized ? 'h-10' : height
      } border-t-2 border-t-amber-400 transition-all duration-150 ease-out select-none`}
    >
      {/* Title / Drag Bar */}
      <div
        ref={dragRef}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        className="flex items-center justify-between px-3 py-1.5 bg-gradient-to-r from-slate-950 to-slate-900 border-b border-slate-800 cursor-grab active:cursor-grabbing text-xs select-none"
      >
        <div className="flex items-center space-x-1.5 font-serif font-bold text-amber-200 tracking-wider text-[11px] uppercase">
          <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span>{title}</span>
        </div>
        
        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-0.5 rounded text-slate-400 hover:text-amber-300 hover:bg-slate-800 transition"
            title={isMinimized ? 'Restore Window' : 'Minimize Window'}
          >
            {isMinimized ? <Square className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
          </button>
          <button
            onClick={onClose}
            className="p-0.5 rounded text-slate-400 hover:text-red-400 hover:bg-slate-800 transition"
            title="Close Sheet"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Window Body */}
      {!isMinimized && (
        <div className="flex-1 overflow-y-auto p-4 text-slate-200 bg-slate-900/45 scrollbar-thin scrollbar-thumb-slate-800 text-xs select-text">
          {children}
        </div>
      )}
    </div>
  );
};
