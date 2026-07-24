import React, { useState } from 'react';
import { Dices, Sparkles, Skull, CheckCircle, AlertTriangle, History, X, Plus, Minus } from 'lucide-react';
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

const POLYHEDRAL_DICE = [
  { id: 'd4', name: 'd4', color: 'from-red-600 to-red-800 border-red-500' },
  { id: 'd6', name: 'd6', color: 'from-orange-600 to-orange-800 border-orange-500' },
  { id: 'd8', name: 'd8', color: 'from-yellow-600 to-yellow-800 border-yellow-500' },
  { id: 'd10', name: 'd10', color: 'from-emerald-600 to-emerald-800 border-emerald-500' },
  { id: 'd12', name: 'd12', color: 'from-blue-600 to-blue-800 border-blue-500' },
  { id: 'd20', name: 'd20', color: 'from-indigo-600 to-indigo-800 border-indigo-500' },
  { id: 'd100', name: 'd100', color: 'from-pink-600 to-pink-800 border-pink-500' },
] as const;

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

  // Roll Mode State
  const [rollMode, setRollMode] = useState<'duality' | 'polyhedral'>(
    initialRoller.toUpperCase() === 'GM' ? 'polyhedral' : 'duality'
  );
  const [selectedDie, setSelectedDie] = useState<'d4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20' | 'd100'>('d20');
  const [diceCount, setDiceCount] = useState<number>(1);

  if (!isOpen) return null;

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
        setRollLog((prev) => [res, ...prev.slice(0, 9)]);
        setIsRolling(false);
        onRollCompleted(res);

        if (res.isCritical || res.outcome.includes('Hope')) {
          soundFX.playHopeChime();
        } else if (res.outcome.includes('Fear')) {
          soundFX.playFearBoom();
        }
      } else {
        // Polyhedral Roll Execution
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
        setRollLog((prev) => [res, ...prev.slice(0, 9)]);
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
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-amber-900/40 rounded-3xl max-w-xl w-full p-6 shadow-2xl relative space-y-4 animate-in fade-in zoom-in duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-100 p-1.5 rounded-lg bg-slate-850"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 p-0.5 shadow-lg flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Dices className="w-5 h-5 text-amber-400" />
              </div>
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-amber-200">
                Universal Dice Roller
              </h3>
              <p className="text-[11px] text-slate-400">
                Choose between standard Duality (2d12) or polyhedral dice pools.
              </p>
            </div>
          </div>
        </div>

        {/* Roller System Mode Selector tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 p-1 rounded-xl">
          <button
            onClick={() => setRollMode('duality')}
            className={`flex-1 py-2 text-center text-xs font-bold rounded-lg transition uppercase ${
              rollMode === 'duality'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Duality Dice (2d12)
          </button>
          <button
            onClick={() => setRollMode('polyhedral')}
            className={`flex-1 py-2 text-center text-xs font-bold rounded-lg transition uppercase ${
              rollMode === 'polyhedral'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            GM Polyhedral Dice
          </button>
        </div>

        {/* Controls Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-950 p-3.5 rounded-2xl border border-slate-800 text-xs">
          <div>
            <label className="text-slate-400 block mb-1 font-semibold">Roller Character</label>
            <input
              type="text"
              value={roller}
              onChange={(e) => setRoller(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1 font-semibold">Flat Modifier</label>
            <input
              type="number"
              value={modifier}
              onChange={(e) => setModifier(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200 font-mono font-bold focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-slate-400 font-semibold">Target Difficulty (DC)</label>
              <input
                type="checkbox"
                checked={useDc}
                onChange={(e) => setUseDc(e.target.checked)}
                className="rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-0"
              />
            </div>
            <input
              type="number"
              disabled={!useDc}
              value={targetDc}
              onChange={(e) => setTargetDc(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200 font-mono font-bold disabled:opacity-40 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Custom Polyhedral Dice Selector Grid */}
        {rollMode === 'polyhedral' && (
          <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800 space-y-3.5">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Select Die Type</span>
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
                {POLYHEDRAL_DICE.map((die) => (
                  <button
                    key={die.id}
                    onClick={() => setSelectedDie(die.id)}
                    className={`p-2 rounded-xl border text-xs font-bold transition flex flex-col items-center gap-1 ${
                      selectedDie === die.id
                        ? 'bg-amber-500 border-amber-400 text-slate-950 shadow-md'
                        : 'bg-slate-900 border-slate-850 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <span className="font-mono">{die.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-800 pt-3">
              <span className="text-xs font-bold text-slate-300">Quantity of {selectedDie.toUpperCase()}</span>
              <div className="flex items-center space-x-3 bg-slate-900 border border-slate-800 rounded-lg p-1">
                <button
                  onClick={() => setDiceCount((c) => Math.max(1, c - 1))}
                  className="p-1 bg-slate-950 hover:bg-slate-850 rounded text-slate-400 hover:text-slate-200"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="font-mono text-sm font-extrabold text-amber-400 w-6 text-center">{diceCount}</span>
                <button
                  onClick={() => setDiceCount((c) => Math.min(20, c + 1))}
                  className="p-1 bg-slate-950 hover:bg-slate-850 rounded text-slate-400 hover:text-slate-200"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Big Roll Action Button */}
        <button
          onClick={handleRoll}
          disabled={isRolling}
          className="w-full py-3 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-extrabold text-sm rounded-2xl shadow-lg transition flex items-center justify-center space-x-2 disabled:opacity-50"
        >
          <Dices className={`w-4 h-4 ${isRolling ? 'animate-spin' : ''}`} />
          <span>
            {isRolling
              ? 'Rolling...'
              : rollMode === 'duality'
              ? 'ROLL 2d12 DUALITY'
              : `ROLL ${diceCount}${selectedDie.toUpperCase()} + ${modifier}`}
          </span>
        </button>

        {/* Roll Display Box */}
        {currentResult && (
          <div className="bg-slate-950 p-4.5 rounded-2xl border border-slate-800 space-y-3 animate-in fade-in duration-300">
            {/* If Duality mode output */}
            {currentResult.isDuality !== false ? (
              <div className="grid grid-cols-2 gap-4">
                {/* Hope Die (Gold) */}
                <div className="bg-gradient-to-br from-amber-950/60 to-slate-900 p-3.5 rounded-xl border border-amber-500/30 text-center space-y-1">
                  <div className="flex items-center justify-center space-x-1 text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Hope Die</span>
                  </div>
                  <div className="font-mono text-3xl font-extrabold text-amber-300">
                    {currentResult.hopeValue}
                  </div>
                </div>

                {/* Fear Die (Purple) */}
                <div className="bg-gradient-to-br from-purple-950/60 to-slate-900 p-3.5 rounded-xl border border-purple-500/30 text-center space-y-1">
                  <div className="flex items-center justify-center space-x-1 text-[10px] font-bold text-purple-400 uppercase tracking-wider">
                    <Skull className="w-3.5 h-3.5" />
                    <span>Fear Die</span>
                  </div>
                  <div className="font-mono text-3xl font-extrabold text-purple-300">
                    {currentResult.fearValue}
                  </div>
                </div>
              </div>
            ) : (
              /* Polyhedral outputs */
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block text-center">Dice Tray Results</span>
                <div className="flex flex-wrap gap-2 justify-center">
                  {currentResult.individualRolls?.map((roll, idx) => {
                    const dieObj = POLYHEDRAL_DICE.find((d) => d.id === currentResult.diceType) || POLYHEDRAL_DICE[5];
                    return (
                      <div
                        key={idx}
                        className={`bg-gradient-to-br ${dieObj.color} w-11 h-11 rounded-xl border shadow-md flex flex-col items-center justify-center font-mono`}
                      >
                        <span className="text-[8px] text-white/50 uppercase font-bold tracking-tighter">{currentResult.diceType}</span>
                        <span className="font-extrabold text-white text-sm">{roll}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Total Score & Calculation */}
            <div className="text-center pt-2 border-t border-slate-850">
              <div className="text-[10px] text-slate-500 font-medium">
                {currentResult.isDuality !== false ? (
                  <>Hope ({currentResult.hopeValue}) + Fear ({currentResult.fearValue}) + Mod ({currentResult.modifier >= 0 ? `+${currentResult.modifier}` : currentResult.modifier})</>
                ) : (
                  <>Pool Sum ({currentResult.individualRolls?.reduce((a, b) => a + b, 0)}) + Mod ({currentResult.modifier >= 0 ? `+${currentResult.modifier}` : currentResult.modifier})</>
                )}
              </div>
              <div className="font-mono text-2xl font-extrabold text-slate-100 my-1">
                Total: {currentResult.total}{' '}
                {currentResult.targetDifficulty && (
                  <span className="text-xs font-normal text-slate-500">
                    vs DC {currentResult.targetDifficulty}
                  </span>
                )}
              </div>

              {/* Outcome Badge */}
              <div
                className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide border shadow ${
                  currentResult.isCritical
                    ? 'bg-amber-400 text-slate-950 border-amber-300'
                    : currentResult.outcome.includes('Success') || currentResult.outcome === 'Success'
                    ? 'bg-emerald-900/40 text-emerald-300 border-emerald-700/50'
                    : currentResult.outcome.includes('Failure') || currentResult.outcome === 'Failure'
                    ? 'bg-red-950 text-red-300 border-red-800/60'
                    : 'bg-slate-800 text-slate-200 border-slate-700'
                }`}
              >
                <span>{currentResult.outcome}</span>
              </div>
            </div>
          </div>
        )}

        {/* History Log */}
        {rollLog.length > 0 && (
          <div className="space-y-1.5 pt-2 border-t border-slate-800 text-xs">
            <span className="font-bold text-slate-400 flex items-center gap-1">
              <History className="w-3.5 h-3.5 text-amber-400" />
              <span>Recent Roll History:</span>
            </span>
            <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
              {rollLog.map((log) => (
                <div
                  key={log.id}
                  className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-850 flex items-center justify-between"
                >
                  <span className="text-slate-300 font-medium">
                    {log.roller}: <span className="font-mono font-bold text-amber-300">{log.total}</span>
                    <span className="text-[10px] text-slate-500 font-mono ml-1">
                      {log.isDuality !== false ? '(2d12)' : `(${log.individualRolls?.length}${log.diceType})`}
                    </span>
                  </span>
                  <span className="text-[9px] font-extrabold text-amber-400/85 uppercase">
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
