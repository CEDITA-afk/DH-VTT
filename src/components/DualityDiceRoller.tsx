import React, { useState } from 'react';
import { Dices, Sparkles, Skull, CheckCircle, AlertTriangle, History, X } from 'lucide-react';
import { DualityRollResult } from '../types';
import { rollDualityDice } from '../utils/dualityDice';
import { soundFX } from '../utils/audioSynth';

interface DualityDiceRollerProps {
  isOpen: boolean;
  onClose: () => void;
  onRollCompleted: (result: DualityRollResult) => void;
  initialRoller?: string;
  initialModifier?: number;
}

export const DualityDiceRoller: React.FC<DualityDiceRollerProps> = ({
  isOpen,
  onClose,
  onRollCompleted,
  initialRoller = 'Player',
  initialModifier = 2,
}) => {
  const [roller, setRoller] = useState<string>(initialRoller);
  const [modifier, setModifier] = useState<number>(initialModifier);
  const [targetDc, setTargetDc] = useState<number>(13);
  const [useDc, setUseDc] = useState<boolean>(true);
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [currentResult, setCurrentResult] = useState<DualityRollResult | null>(null);
  const [rollLog, setRollLog] = useState<DualityRollResult[]>([]);

  if (!isOpen) return null;

  const handleRoll = () => {
    setIsRolling(true);
    soundFX.playDiceRoll();

    setTimeout(() => {
      const res = rollDualityDice({
        roller,
        modifier,
        targetDifficulty: useDc ? targetDc : undefined,
      });

      setCurrentResult(res);
      setRollLog((prev) => [res, ...prev.slice(0, 9)]);
      setIsRolling(false);
      onRollCompleted(res);

      if (res.isCritical || res.outcome.includes('Hope')) {
        soundFX.playHopeChime();
      } else if (res.outcome.includes('Fear')) {
        soundFX.playFearBoom();
      }
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-amber-900/40 rounded-3xl max-w-xl w-full p-6 shadow-2xl relative space-y-5 animate-in fade-in zoom-in duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-100 p-1 rounded-lg bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 border-b border-slate-800 pb-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 p-0.5 shadow-lg flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Dices className="w-5 h-5 text-amber-400" />
            </div>
          </div>
          <div>
            <h3 className="font-serif font-bold text-xl text-amber-200">
              Duality Dice Roller (2d12)
            </h3>
            <p className="text-xs text-slate-400">
              Roll Hope Die (Gold d12) and Fear Die (Purple d12) + Trait Modifier.
            </p>
          </div>
        </div>

        {/* Controls Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-950 p-3.5 rounded-2xl border border-slate-800 text-xs">
          <div>
            <label className="text-slate-400 block mb-1 font-semibold">Roller Character</label>
            <input
              type="text"
              value={roller}
              onChange={(e) => setRoller(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1 font-semibold">Trait Modifier</label>
            <input
              type="number"
              value={modifier}
              onChange={(e) => setModifier(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200 font-mono font-bold"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-slate-400 font-semibold">Target DC</label>
              <input
                type="checkbox"
                checked={useDc}
                onChange={(e) => setUseDc(e.target.checked)}
                className="rounded border-slate-700 bg-slate-900 text-amber-500"
              />
            </div>
            <input
              type="number"
              disabled={!useDc}
              value={targetDc}
              onChange={(e) => setTargetDc(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200 font-mono font-bold disabled:opacity-40"
            />
          </div>
        </div>

        {/* Big Roll Action Button */}
        <button
          onClick={handleRoll}
          disabled={isRolling}
          className="w-full py-3.5 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-extrabold text-base rounded-2xl shadow-lg shadow-amber-900/30 transition flex items-center justify-center space-x-2 disabled:opacity-50"
        >
          <Dices className={`w-5 h-5 ${isRolling ? 'animate-spin' : ''}`} />
          <span>{isRolling ? 'Rolling 2d12 Duality Dice...' : 'ROLL DUALITY DICE'}</span>
        </button>

        {/* Roll Display Box */}
        {currentResult && (
          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4 animate-in fade-in duration-300">
            <div className="grid grid-cols-2 gap-4">
              {/* Hope Die (Gold) */}
              <div className="bg-gradient-to-br from-amber-950/60 to-slate-900 p-4 rounded-xl border border-amber-500/40 text-center space-y-1">
                <div className="flex items-center justify-center space-x-1 text-xs font-bold text-amber-400 uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Hope Die</span>
                </div>
                <div className="font-mono text-4xl font-extrabold text-amber-300">
                  {currentResult.hopeValue}
                </div>
              </div>

              {/* Fear Die (Purple) */}
              <div className="bg-gradient-to-br from-purple-950/60 to-slate-900 p-4 rounded-xl border border-purple-500/40 text-center space-y-1">
                <div className="flex items-center justify-center space-x-1 text-xs font-bold text-purple-400 uppercase tracking-wider">
                  <Skull className="w-3.5 h-3.5" />
                  <span>Fear Die</span>
                </div>
                <div className="font-mono text-4xl font-extrabold text-purple-300">
                  {currentResult.fearValue}
                </div>
              </div>
            </div>

            {/* Total Score & Calculation */}
            <div className="text-center pt-1 border-t border-slate-800">
              <div className="text-xs text-slate-400">
                Hope ({currentResult.hopeValue}) + Fear ({currentResult.fearValue}) + Mod ({currentResult.modifier})
              </div>
              <div className="font-mono text-3xl font-extrabold text-slate-100 my-1">
                Total: {currentResult.total}{' '}
                {currentResult.targetDifficulty && (
                  <span className="text-sm font-normal text-slate-400">
                    vs DC {currentResult.targetDifficulty}
                  </span>
                )}
              </div>

              {/* Outcome Badge */}
              <div
                className={`inline-flex items-center space-x-1.5 px-4 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wide border shadow ${
                  currentResult.isCritical
                    ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-amber-500/50 animate-bounce'
                    : currentResult.outcome.includes('Hope')
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                    : 'bg-purple-950 text-purple-200 border-purple-700'
                }`}
              >
                <span>{currentResult.outcome}</span>
              </div>
            </div>
          </div>
        )}

        {/* History Log */}
        {rollLog.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-slate-800 text-xs">
            <span className="font-bold text-slate-400 flex items-center gap-1">
              <History className="w-3.5 h-3.5 text-amber-400" />
              <span>Recent Roll History:</span>
            </span>
            <div className="space-y-1 max-h-28 overflow-y-auto pr-1">
              {rollLog.map((log) => (
                <div
                  key={log.id}
                  className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 flex items-center justify-between"
                >
                  <span className="text-slate-300 font-medium">
                    {log.roller}: <span className="font-mono font-bold text-amber-300">{log.total}</span>
                  </span>
                  <span className="text-[10px] font-bold text-purple-400 uppercase">
                    {log.outcome}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
