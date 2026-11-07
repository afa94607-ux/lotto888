import React from 'react';
import { ChannelLetter, SelectionMode } from '../types/lottery';
import { padNumber } from '../utils/formatters';
import { sound } from '../utils/audio';

interface NumberGridProps {
  selectionMode: SelectionMode;
  setSelectionMode: (mode: SelectionMode) => void;
  selectedChannels: ChannelLetter[];
  toggleChannel: (channel: ChannelLetter) => void;
  selectAllChannels: () => void;
  selectedNumbers: string[];
  toggleNumber: (num: string) => void;
  selectMultipleNumbers: (nums: string[]) => void;
  clearNumbers: () => void;
}

export const NumberGrid: React.FC<NumberGridProps> = ({
  selectionMode,
  setSelectionMode,
  selectedChannels,
  toggleChannel,
  selectAllChannels,
  selectedNumbers,
  toggleNumber,
  selectMultipleNumbers,
  clearNumbers,
}) => {
  const channels: ChannelLetter[] = ['A', 'B', 'C', 'D', 'E'];
  const allNumbers = Array.from({ length: 99 }, (_, i) => padNumber(i + 1));

  // Quick preset handlers
  const handleSelectOdd = () => {
    sound.playSelect();
    const odds = allNumbers.filter((_, idx) => (idx + 1) % 2 !== 0);
    selectMultipleNumbers(odds);
  };

  const handleSelectEven = () => {
    sound.playSelect();
    const evens = allNumbers.filter((_, idx) => (idx + 1) % 2 === 0);
    selectMultipleNumbers(evens);
  };

  const handleSelectSmall = () => {
    sound.playSelect();
    const smalls = allNumbers.filter((_, idx) => idx + 1 <= 49);
    selectMultipleNumbers(smalls);
  };

  const handleSelectBig = () => {
    sound.playSelect();
    const bigs = allNumbers.filter((_, idx) => idx + 1 >= 50);
    selectMultipleNumbers(bigs);
  };

  const handleSelectTwins = () => {
    sound.playSelect();
    const twins = ['11', '22', '33', '44', '55', '66', '77', '88', '99'];
    selectMultipleNumbers(twins);
  };

  const handleSelectDecade = (start: number, end: number) => {
    sound.playSelect();
    const range = allNumbers.slice(start - 1, end);
    selectMultipleNumbers(range);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-4 sm:p-5 flex flex-col gap-4">
      {/* Selection Mode Radios & Channels Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-slate-100">
        {/* Mode Selector matching screenshot: (o) លេខ  ( ) ចន្លោះ */}
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-800 text-sm sm:text-base">
            <input
              type="radio"
              name="selectionMode"
              checked={selectionMode === 'NUMBER'}
              onChange={() => {
                sound.playClick();
                setSelectionMode('NUMBER');
              }}
              className="w-4 h-4 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <span className={selectionMode === 'NUMBER' ? 'font-bold text-blue-700' : ''}>លេខ (Number)</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-800 text-sm sm:text-base">
            <input
              type="radio"
              name="selectionMode"
              checked={selectionMode === 'RANGE'}
              onChange={() => {
                sound.playClick();
                setSelectionMode('RANGE');
              }}
              className="w-4 h-4 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <span className={selectionMode === 'RANGE' ? 'font-bold text-blue-700' : ''}>ចន្លោះ (Range)</span>
          </label>
        </div>

        {/* Channel Pills: A, B, C, D, E */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="text-xs sm:text-sm font-semibold text-slate-500 mr-1">ប៉ុស្តិ៍:</span>
          {channels.map((ch) => {
            const isSelected = selectedChannels.includes(ch);
            return (
              <button
                key={ch}
                onClick={() => {
                  sound.playClick();
                  toggleChannel(ch);
                }}
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full font-black text-sm sm:text-base transition-all flex items-center justify-center border-2 ${
                  isSelected
                    ? 'bg-blue-600 border-blue-600 text-white shadow-md scale-105'
                    : 'bg-slate-50 border-blue-300 text-blue-600 hover:bg-blue-50'
                }`}
              >
                {ch}
              </button>
            );
          })}
          <button
            onClick={() => {
              sound.playClick();
              selectAllChannels();
            }}
            className="text-xs px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium ml-1 transition-colors"
          >
            {selectedChannels.length === 5 ? 'ដោះទាំងអស់' : 'គ្រប់ប៉ុស្តិ៍'}
          </button>
        </div>
      </div>

      {/* Quick Pick Toolbar for Range / Groups */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-slate-500 font-medium mr-1">ជ្រើសរើសរហ័ស:</span>
          <button
            onClick={handleSelectSmall}
            className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 font-medium transition-colors"
          >
            តូច (01-49)
          </button>
          <button
            onClick={handleSelectBig}
            className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 font-medium transition-colors"
          >
            ធំ (50-99)
          </button>
          <button
            onClick={handleSelectOdd}
            className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 font-medium transition-colors"
          >
            សេស (Odd)
          </button>
          <button
            onClick={handleSelectEven}
            className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 font-medium transition-colors"
          >
            គូ (Even)
          </button>
          <button
            onClick={handleSelectTwins}
            className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 font-medium transition-colors"
          >
            ភ្លោះ (11-99)
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-600 font-medium">
            ជ្រើសរើស: <strong className="text-blue-600 font-mono text-sm">{selectedNumbers.length}</strong> លេខ
          </span>
          {selectedNumbers.length > 0 && (
            <button
              onClick={() => {
                sound.playClick();
                clearNumbers();
              }}
              className="text-xs text-rose-600 hover:text-rose-700 underline font-medium"
            >
              សម្អាត
            </button>
          )}
        </div>
      </div>

      {/* Range Quick Decade Buttons (if Range mode is active) */}
      {selectionMode === 'RANGE' && (
        <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200/60 flex flex-wrap gap-1.5 items-center">
          <span className="text-xs font-semibold text-blue-900 mr-1">ចន្លោះលេខទូទៅ:</span>
          {[
            { label: '01-10', s: 1, e: 10 },
            { label: '11-20', s: 11, e: 20 },
            { label: '21-30', s: 21, e: 30 },
            { label: '31-40', s: 31, e: 40 },
            { label: '41-50', s: 41, e: 50 },
            { label: '51-60', s: 51, e: 60 },
            { label: '61-70', s: 61, e: 70 },
            { label: '71-80', s: 71, e: 80 },
            { label: '81-90', s: 81, e: 90 },
            { label: '91-99', s: 91, e: 99 },
          ].map((r) => (
            <button
              key={r.label}
              onClick={() => handleSelectDecade(r.s, r.e)}
              className="px-2.5 py-1 bg-white hover:bg-blue-600 hover:text-white text-slate-700 rounded-md font-mono text-xs font-medium border border-blue-200 shadow-2xs transition-colors"
            >
              {r.label}
            </button>
          ))}
        </div>
      )}

      {/* 01 to 99 Interactive Grid (Rows of 20 exactly matching the screenshot) */}
      <div className="w-full overflow-x-auto pb-1">
        <div className="min-w-[640px] grid grid-cols-20 gap-1 sm:gap-1.5">
          {allNumbers.map((num) => {
            const isSelected = selectedNumbers.includes(num);
            return (
              <button
                key={num}
                onClick={() => {
                  sound.playSelect();
                  toggleNumber(num);
                }}
                className={`h-7 sm:h-9 rounded-full font-mono font-medium text-xs sm:text-sm transition-all flex items-center justify-center border ${
                  isSelected
                    ? 'bg-blue-600 border-blue-700 text-white font-bold shadow-md scale-105 z-10 ring-2 ring-blue-300'
                    : 'bg-white border-slate-200 text-slate-800 hover:border-blue-400 hover:bg-blue-50/50'
                }`}
              >
                {num}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
