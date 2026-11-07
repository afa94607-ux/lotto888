import React from 'react';
import { ChannelLetter, RoundResult } from '../types/lottery';
import { formatKHR, formatNumberOnly, CHANNEL_COLORS, LOTTERY_PAYOUT_RATE } from '../utils/formatters';
import { sound } from '../utils/audio';

interface BettingPanelProps {
  stakePerUnit: number;
  setStakePerUnit: (amt: number) => void;
  selectedChannels: ChannelLetter[];
  selectedNumbers: string[];
  pastRounds: RoundResult[];
  onSubmitBet: () => void;
  onPrintSlip: () => void;
  onClearAll: () => void;
  onRepeatLastBet: () => void;
  canRepeat: boolean;
  userBalance: number;
  isDrawing?: boolean;
  currentDrawingRound?: {
    roundId: string;
    drawTime: string;
    numbers: Record<ChannelLetter, string>;
    revealed: Record<ChannelLetter, boolean>;
  } | null;
}

export const BettingPanel: React.FC<BettingPanelProps> = ({
  stakePerUnit,
  setStakePerUnit,
  selectedChannels,
  selectedNumbers,
  pastRounds,
  onSubmitBet,
  onPrintSlip,
  onClearAll,
  onRepeatLastBet,
  canRepeat,
  userBalance,
  isDrawing = false,
  currentDrawingRound = null,
}) => {
  const presetAmounts = [
    { label: '1រយ', value: 100 },
    { label: '5រយ', value: 500 },
    { label: '1ពាន់', value: 1000 },
    { label: '2ពាន់', value: 2000 },
    { label: '5ពាន់', value: 5000 },
    { label: '1ម៉ឺន', value: 10000 },
    { label: '2ម៉ឺន', value: 20000 },
    { label: '5ម៉ឺន', value: 50000 },
  ];

  const totalBetsCount = selectedChannels.length * selectedNumbers.length;
  const totalCost = totalBetsCount * stakePerUnit;
  const potentialWinPerHit = stakePerUnit * LOTTERY_PAYOUT_RATE;

  const handlePresetClick = (val: number) => {
    sound.playSelect();
    // If 0, set to val, else add val
    setStakePerUnit(stakePerUnit === 0 ? val : stakePerUnit + val);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    const num = parseInt(raw, 10);
    setStakePerUnit(isNaN(num) ? 0 : num);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-3 sm:p-4 flex flex-col gap-3.5 h-full">
      {/* Top Input: ទឹកប្រាក់ [ 0៛ ] [លុប] */}
      <div className="flex items-center gap-2">
        <label className="text-xs sm:text-sm font-semibold text-slate-700 whitespace-nowrap">
          ទឹកប្រាក់
        </label>
        <div className="relative flex-1">
          <input
            type="text"
            inputMode="numeric"
            value={stakePerUnit > 0 ? formatNumberOnly(stakePerUnit) : ''}
            onChange={handleAmountChange}
            placeholder="0"
            className="w-full text-right font-mono font-bold text-sm sm:text-base pr-7 pl-2 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
          />
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 font-mono font-semibold text-xs pointer-events-none">
            ៛
          </span>
        </div>
        <button
          onClick={() => {
            sound.playClick();
            setStakePerUnit(0);
          }}
          className="px-2.5 py-1.5 text-xs font-medium bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors whitespace-nowrap"
        >
          លុប
        </button>
      </div>

      {/* 8 Preset Amount Buttons (4 rows of 2 or 2 rows of 4) */}
      <div className="grid grid-cols-4 sm:grid-cols-4 gap-1.5">
        {presetAmounts.map((p) => (
          <button
            key={p.label}
            onClick={() => handlePresetClick(p.value)}
            className="py-1 px-1 text-center bg-white hover:bg-blue-50 active:scale-95 text-slate-700 hover:text-blue-700 border border-slate-300 hover:border-blue-400 rounded-full font-medium text-[11px] sm:text-xs transition-all shadow-2xs"
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Bet Summary Breakdown */}
      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 text-xs flex flex-col gap-1">
        <div className="flex justify-between items-center text-slate-600">
          <span>ប៉ុស្តិ៍ × លេខ:</span>
          <span className="font-mono font-semibold text-slate-900">
            {selectedChannels.length} ប៉ុស្តិ៍ × {selectedNumbers.length} លេខ = {totalBetsCount} ភ្នាល់
          </span>
        </div>
        <div className="flex justify-between items-center text-slate-600">
          <span>សរុបទឹកប្រាក់:</span>
          <span className={`font-mono font-bold ${totalCost > userBalance ? 'text-rose-600' : 'text-blue-700'}`}>
            {formatKHR(totalCost)}
          </span>
        </div>
        <div className="flex justify-between items-center text-slate-500 text-[11px]">
          <span>ឈ្នះក្នុង 1 ប៉ុស្តិ៍ (1:{LOTTERY_PAYOUT_RATE}):</span>
          <span className="font-mono text-emerald-600 font-semibold">{formatKHR(potentialWinPerHit)}</span>
        </div>
        {totalCost > userBalance && (
          <span className="text-rose-500 text-[10px] text-right font-medium">សមតុល្យមិនគ្រប់គ្រាន់</span>
        )}
      </div>

      {/* 4 Action Buttons matching screenshot exactly:
          [បញ្ជូន] (Submit)  [បោះពុម្ព] (Print)  [លុប] (Clear)  [រួចរាល់] (Repeat/Done) */}
      <div className="grid grid-cols-4 gap-1.5">
        {/* Submit */}
        <button
          onClick={onSubmitBet}
          disabled={totalBetsCount === 0 || stakePerUnit <= 0 || totalCost > userBalance}
          className="py-2 px-1 text-center bg-[#3b82f6] hover:bg-blue-600 disabled:opacity-50 text-white rounded-lg font-bold text-xs sm:text-sm shadow-sm transition-transform active:scale-95"
        >
          បញ្ជូន
        </button>

        {/* Print Slip */}
        <button
          onClick={onPrintSlip}
          disabled={totalBetsCount === 0 || stakePerUnit <= 0}
          className="py-2 px-1 text-center bg-[#22c55e] hover:bg-emerald-600 disabled:opacity-50 text-white rounded-lg font-bold text-xs sm:text-sm shadow-sm transition-transform active:scale-95"
        >
          បោះពុម្ព
        </button>

        {/* Clear */}
        <button
          onClick={onClearAll}
          className="py-2 px-1 text-center bg-[#94a3b8] hover:bg-slate-500 text-white rounded-lg font-bold text-xs sm:text-sm shadow-sm transition-transform active:scale-95"
        >
          លុប
        </button>

        {/* Repeat Last Bet */}
        <button
          onClick={onRepeatLastBet}
          disabled={!canRepeat}
          title="Repeat Previous Bet"
          className="py-2 px-1 text-center bg-[#10b981] hover:bg-emerald-600 disabled:opacity-50 text-white rounded-lg font-bold text-xs sm:text-sm shadow-sm transition-transform active:scale-95"
        >
          រួចរាល់
        </button>
      </div>

      {/* Section Divider */}
      <div className="border-t border-slate-200/80 my-1" />

      {/* Recent Results Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-extrabold text-sm sm:text-base text-slate-800">
          លទ្ធផលថ្មីៗ <span className="text-xs text-slate-500 font-normal">(Recent Draws)</span>
        </h3>
        <span className="text-[11px] text-blue-600 font-medium">វេនចុងក្រោយ</span>
      </div>

      {/* List of Past Rounds matching screenshot */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[360px]">
        {/* Live Drawing Round: Updates & reveals one by one from A to E */}
        {isDrawing && currentDrawingRound && (
          <div className="p-2 sm:p-2.5 rounded-xl border-2 border-amber-400 bg-amber-50/80 shadow-md">
            {/* Header: roundId & status */}
            <div className="flex items-center justify-between text-xs font-mono text-slate-800 pb-1.5 border-b border-amber-200">
              <span className="font-bold text-blue-700">{currentDrawingRound.roundId}</span>
              <span className="text-[10px] bg-amber-400 text-slate-900 font-bold px-2 py-0.5 rounded-full flex items-center gap-1.5 shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping" />
                កំពុងចេញលទ្ធផល A-E...
              </span>
            </div>

            {/* Channels & Drawn numbers one by one */}
            <div className="flex items-center justify-between pt-1.5">
              <span className="text-[11px] font-medium text-slate-600 mr-2">ប៉ុស្តិ៍</span>
              <div className="flex items-center gap-1.5 sm:gap-2 flex-1 justify-around">
                {(['A', 'B', 'C', 'D', 'E'] as ChannelLetter[]).map((ch) => {
                  const isRev = currentDrawingRound.revealed[ch];
                  const num = isRev ? currentDrawingRound.numbers[ch] : '??';
                  const col = CHANNEL_COLORS[ch];
                  return (
                    <div key={ch} className="flex flex-col items-center">
                      <span className="text-[10px] font-bold text-slate-700 mb-0.5">{ch}</span>
                      <div
                        className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center font-mono font-bold text-xs shadow-2xs transition-all duration-300 ${
                          isRev
                            ? `${col.badgeBg} scale-110 ring-2 ring-amber-400 shadow-md animate-bounce`
                            : 'bg-white text-slate-400 border border-dashed border-slate-300 animate-pulse'
                        }`}
                      >
                        {num}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {pastRounds.map((rnd) => (
          <div
            key={rnd.roundId}
            className="p-2 sm:p-2.5 rounded-xl border border-slate-100 hover:border-slate-300 bg-slate-50/70 hover:bg-slate-50 transition-colors"
          >
            {/* Header: roundId & time */}
            <div className="flex items-center justify-between text-xs font-mono text-slate-600 pb-1.5 border-b border-slate-200/50">
              <span className="font-bold text-slate-800">{rnd.roundId}</span>
              <span>{rnd.drawTime}</span>
            </div>

            {/* Channels & Drawn numbers */}
            <div className="flex items-center justify-between pt-1.5">
              <span className="text-[11px] font-medium text-slate-500 mr-2">ប៉ុស្តិ៍</span>
              <div className="flex items-center gap-1.5 sm:gap-2 flex-1 justify-around">
                {(['A', 'B', 'C', 'D', 'E'] as ChannelLetter[]).map((ch) => {
                  const num = rnd.numbers[ch] || '--';
                  const col = CHANNEL_COLORS[ch];
                  return (
                    <div key={ch} className="flex flex-col items-center">
                      <span className="text-[10px] font-bold text-slate-600 mb-0.5">{ch}</span>
                      <div
                        className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center font-mono font-bold text-xs ${col.badgeBg} shadow-2xs`}
                      >
                        {num}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
