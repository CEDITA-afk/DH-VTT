import React, { useState } from 'react';
import { Dices, Sparkles, Skull, History } from 'lucide-react';
import { DualityRollResult } from '../types';
import { rollDualityDice } from '../utils/dualityDice';
import { soundFX } from '../utils/audioSynth';

interface DualityDiceRollerEmbedProps {
  onRollCompleted: (result: DualityRollResult) => void;
  initialRoller?: string;
  initialModifier?: number;
}

export const DualityDiceRollerEmbed: React.FC<DualityDiceRollerEmbedProps> = ({
  onRollCompleted,
  initialRoller = 'GM',
  initialModifier = 2,
}) => {
  const [roller, setRoller] = useState<string>(initialRoller);
  const [modifier, setModifier] = useState<number>(initialModifier);
  const [targetDc, setTargetDc] = useState<number>(13);
  const [useDc, setUseDc] = useState<boolean>(true);
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [currentResult, setCurrentResult] = useState<DualityRollResult | null>(null);

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
    <div className="space-y-4 text-xs select-none">
      <div className="grid grid-cols-1 gap-2.5 bg-slate-950 p-3 rounded-xl border border-slate-800">
        <div>
          <label className="text-slate-400 block mb-1">Character Name</label>
          <input
            type="text"
            value={roller}
            onChange={(e) => setRoller(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-slate-200"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-slate-400 block mb-1">Modifier</label>
            <input
              type="number"
              value={modifier}
              onChange={(e) => setModifier(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-slate-200 font-mono font-bold"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-slate-400">Target DC</label>
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
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-slate-200 font-mono font-bold disabled:opacity-40"
            />
          </div>
        </div>
      </div>

      <button
        onClick={handleRoll}
        disabled={isRolling}
        className="w-full py-2.5 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-extrabold rounded-xl shadow-md transition flex items-center justify-center space-x-1.5"
      >
        <Dices className={`w-4 h-4 ${isRolling ? 'animate-spin' : ''}`} />
        <span>{isRolling ? 'Rolling...' : 'ROLL DUALITY'}</span>
      </button>

      {currentResult && (
        <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-3">
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="bg-amber-950/20 border border-amber-500/20 rounded-lg py-1.5">
              <span className="text-[9px] uppercase font-bold text-amber-400 block">Hope Die</span>
              <span className="font-mono text-xl font-bold text-amber-300">{currentResult.hopeValue}</span>
            </div>
            <div className="bg-purple-950/20 border border-purple-500/20 rounded-lg py-1.5">
              <span className="text-[9px] uppercase font-bold text-purple-400 block">Fear Die</span>
              <span className="font-mono text-xl font-bold text-purple-300">{currentResult.fearValue}</span>
            </div>
          </div>

          <div className="text-center">
            <div className="font-mono font-bold text-slate-100">
              Result: {currentResult.total}{' '}
              {currentResult.targetDifficulty && (
                <span className="text-[10px] font-normal text-slate-400">vs DC {currentResult.targetDifficulty}</span>
              )}
            </div>
            <div className="text-[10px] text-amber-400 font-extrabold uppercase mt-1">{currentResult.outcome}</div>
          </div>
        </div>
      )}
    </div>
  );
};
