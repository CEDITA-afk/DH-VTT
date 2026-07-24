import React, { useState } from 'react';
import { Dices, Sparkles, Skull, Plus, Minus } from 'lucide-react';
import { DualityRollResult } from '../types';
import { rollDualityDice } from '../utils/dualityDice';
import { soundFX } from '../utils/audioSynth';

interface DualityDiceRollerEmbedProps {
  onRollCompleted: (result: DualityRollResult) => void;
  initialRoller?: string;
  initialModifier?: number;
}

const POLYHEDRAL_DICE = [
  { id: 'd4', name: 'd4', color: 'from-red-600 to-red-800 border-red-500' },
  { id: 'd6', name: 'd6', color: 'from-orange-600 to-orange-800 border-orange-500' },
  { id: 'd8', name: 'd8', color: 'from-yellow-600 to-yellow-800 border-yellow-500' },
  { id: 'd10', name: 'd10', color: 'from-emerald-600 to-emerald-800 border-emerald-500' },
  { id: 'd12', name: 'd12', color: 'from-blue-600 to-blue-800 border-blue-500' },
  { id: 'd20', name: 'd20', color: 'from-indigo-600 to-indigo-800 border-indigo-500' },
  { id: 'd100', name: 'd100', color: 'from-pink-600 to-pink-800 border-pink-500' },
] as const;

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

  // Roll Mode selection
  const [rollMode, setRollMode] = useState<'duality' | 'polyhedral'>(
    initialRoller.toUpperCase() === 'GM' ? 'polyhedral' : 'duality'
  );
  const [selectedDie, setSelectedDie] = useState<'d4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20' | 'd100'>('d20');
  const [diceCount, setDiceCount] = useState<number>(1);

  const handleRoll = () => {
    setIsRolling(true);
    soundFX.playDiceRoll();

    setTimeout(() => {
      if (rollMode === 'duality') {
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
      } else {
        // Polyhedral Roll
        const sides = parseInt(selectedDie.replace('d', ''), 10);
        const rolls: number[] = [];
        for (let i = 0; i < diceCount; i++) {
          rolls.push(Math.floor(Math.random() * sides) + 1);
        }
        const sum = rolls.reduce((a, b) => a + b, 0);
        const total = sum + modifier;

        let isCritical = false;
        let outcome = `Rolled ${diceCount}${selectedDie}`;

        if (selectedDie === 'd20') {
          const natural = rolls[0];
          if (natural === 20) {
            isCritical = true;
            outcome = 'Critical Success!';
          } else if (natural === 1) {
            outcome = 'Critical Failure / Fumble!';
          } else if (useDc) {
            outcome = total >= targetDc ? 'Success' : 'Failure';
          }
        } else if (useDc) {
          outcome = total >= targetDc ? 'Success' : 'Failure';
        }

        const res: DualityRollResult = {
          id: 'roll-' + Date.now(),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          roller,
          hopeValue: 0,
          fearValue: 0,
          modifier,
          total,
          isCritical,
          outcome,
          targetDifficulty: useDc ? targetDc : undefined,
          isDuality: false,
          diceType: selectedDie,
          individualRolls: rolls,
        };

        setCurrentResult(res);
        setIsRolling(false);
        onRollCompleted(res);

        if (isCritical || (selectedDie === 'd20' && rolls[0] === 20)) {
          soundFX.playHopeChime();
        } else if (selectedDie === 'd20' && rolls[0] === 1) {
          soundFX.playFearBoom();
        } else {
          soundFX.playClockTick();
        }
      }
    }, 400);
  };

  return (
    <div className="space-y-4 text-xs select-none">
      {/* Roll Mode Selection Tabs */}
      <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
        <button
          onClick={() => setRollMode('duality')}
          className={`flex-1 py-1 text-center text-[10px] font-bold rounded transition uppercase ${
            rollMode === 'duality'
              ? 'bg-amber-500 text-slate-950 shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          2d12 Duality
        </button>
        <button
          onClick={() => setRollMode('polyhedral')}
          className={`flex-1 py-1 text-center text-[10px] font-bold rounded transition uppercase ${
            rollMode === 'polyhedral'
              ? 'bg-amber-500 text-slate-950 shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Polyhedral
        </button>
      </div>

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

      {/* Polyhedral Controls if chosen */}
      {rollMode === 'polyhedral' && (
        <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 space-y-2.5">
          <div>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Die Type</span>
            <div className="grid grid-cols-4 gap-1">
              {POLYHEDRAL_DICE.map((die) => (
                <button
                  key={die.id}
                  onClick={() => setSelectedDie(die.id)}
                  className={`py-1 rounded text-[10px] font-bold transition font-mono border ${
                    selectedDie === die.id
                      ? 'bg-amber-500 border-amber-400 text-slate-950 shadow-sm'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-750'
                  }`}
                >
                  {die.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-slate-900 pt-2 text-[10px]">
            <span className="font-bold text-slate-300">Quantity</span>
            <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 rounded p-0.5">
              <button
                onClick={() => setDiceCount((c) => Math.max(1, c - 1))}
                className="p-0.5 bg-slate-950 hover:bg-slate-850 rounded text-slate-400 hover:text-slate-200"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="font-mono font-bold text-amber-400 w-4 text-center">{diceCount}</span>
              <button
                onClick={() => setDiceCount((c) => Math.min(20, c + 1))}
                className="p-0.5 bg-slate-950 hover:bg-slate-850 rounded text-slate-400 hover:text-slate-200"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={handleRoll}
        disabled={isRolling}
        className="w-full py-2.5 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-extrabold rounded-xl shadow-md transition flex items-center justify-center space-x-1.5"
      >
        <Dices className={`w-4 h-4 ${isRolling ? 'animate-spin' : ''}`} />
        <span>
          {isRolling
            ? 'Rolling...'
            : rollMode === 'duality'
            ? 'ROLL DUALITY'
            : `ROLL ${diceCount}${selectedDie.toUpperCase()}`}
        </span>
      </button>

      {currentResult && (
        <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-3">
          {currentResult.isDuality !== false ? (
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
          ) : (
            <div className="space-y-1.5">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block text-center">Tray Output</span>
              <div className="flex flex-wrap gap-1 justify-center">
                {currentResult.individualRolls?.map((val, idx) => (
                  <div key={idx} className="bg-slate-900 border border-slate-750 rounded-lg w-7 h-7 flex flex-col items-center justify-center font-mono">
                    <span className="text-[6px] text-slate-500 uppercase font-bold">{currentResult.diceType}</span>
                    <span className="font-extrabold text-amber-400 text-[11px]">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

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
