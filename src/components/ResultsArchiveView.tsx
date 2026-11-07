import React, { useState } from 'react';
import { RoundResult, ChannelLetter } from '../types/lottery';
import { CHANNEL_COLORS, LOTTERY_PAYOUT_RATE, formatKHR } from '../utils/formatters';
import { Search, Flame, Snowflake, HelpCircle } from 'lucide-react';

interface ResultsArchiveViewProps {
  pastRounds: RoundResult[];
  onResetHistory?: () => void;
}

export const ResultsArchiveView: React.FC<ResultsArchiveViewProps> = ({
  pastRounds,
  onResetHistory,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Calculate hot & cold numbers from past rounds
  const numberCounts: Record<string, number> = {};
  pastRounds.forEach((rnd) => {
    Object.values(rnd.numbers).forEach((num) => {
      numberCounts[num] = (numberCounts[num] || 0) + 1;
    });
  });

  const sortedNumbers = Object.entries(numberCounts).sort((a, b) => b[1] - a[1]);
  const hotNumbers = sortedNumbers.slice(0, 6);
  const coldNumbers = sortedNumbers.slice(-6).reverse();

  const filteredRounds = pastRounds.filter(
    (r) =>
      r.roundId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.date.includes(searchTerm) ||
      Object.values(r.numbers).some((n) => n.includes(searchTerm))
  );

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 space-y-6">
      {/* Title & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">លទ្ធផលឆ្នោតប្រវត្តិសាស្ត្រ (Draw Results Archive)</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            ពិនិត្យមើលលទ្ធផលចាប់ឆ្នោតគ្រប់វេន និងស្ថិតិលេខចេញញឹកញាប់
          </p>
        </div>

        {/* Right Tools: Search & Reset */}
        <div className="flex items-center gap-2">
          {/* Search Input */}
          <div className="relative w-full sm:w-60">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ស្វែងរកវេន ឬលេខ..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />
          </div>

          {onResetHistory && (
            <button
              onClick={onResetHistory}
              title="Reset history to standard initial draws"
              className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 whitespace-nowrap transition-colors"
            >
              កំណត់ប្រវត្តិឡើងវិញ
            </button>
          )}
        </div>
      </div>

      {/* Analytics: Hot Numbers, Cold Numbers & Game Rules */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Hot Numbers */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col gap-2">
          <div className="flex items-center gap-1.5 text-rose-600 font-bold text-xs uppercase">
            <Flame className="w-4 h-4" />
            <span>លេខចេញញឹកញាប់ (Hot Numbers)</span>
          </div>
          <div className="flex flex-wrap gap-2 mt-1">
            {hotNumbers.length > 0 ? (
              hotNumbers.map(([num, count]) => (
                <div
                  key={num}
                  className="flex items-center gap-1 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-lg"
                >
                  <span className="font-mono font-black text-rose-700 text-sm">{num}</span>
                  <span className="text-[10px] text-rose-500 font-semibold font-sans">({count}ដង)</span>
                </div>
              ))
            ) : (
              <span className="text-xs text-slate-400">កំពុងគណនា...</span>
            )}
          </div>
        </div>

        {/* Cold Numbers */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col gap-2">
          <div className="flex items-center gap-1.5 text-blue-600 font-bold text-xs uppercase">
            <Snowflake className="w-4 h-4" />
            <span>លេខចេញតិច (Cold Numbers)</span>
          </div>
          <div className="flex flex-wrap gap-2 mt-1">
            {coldNumbers.length > 0 ? (
              coldNumbers.map(([num, count]) => (
                <div
                  key={num}
                  className="flex items-center gap-1 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-lg"
                >
                  <span className="font-mono font-black text-blue-700 text-sm">{num}</span>
                  <span className="text-[10px] text-blue-500 font-semibold font-sans">({count}ដង)</span>
                </div>
              ))
            ) : (
              <span className="text-xs text-slate-400">កំពុងគណនា...</span>
            )}
          </div>
        </div>

        {/* Payout Rule Guide */}
        <div className="bg-gradient-to-br from-amber-50 to-yellow-50 p-4 rounded-xl border border-amber-200 shadow-xs flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5 text-amber-800 font-bold text-xs uppercase">
            <HelpCircle className="w-4 h-4 text-amber-600" />
            <span>អត្រាសងរង្វាន់ (1:{LOTTERY_PAYOUT_RATE} Odds)</span>
          </div>
          <p className="text-xs text-slate-700">
            ឆ្នោត 1/99 ប៉ុស្តិ៍ A, B, C, D, E ផ្តល់ជូនអត្រាសង <strong>1:{LOTTERY_PAYOUT_RATE}</strong>។
          </p>
          <p className="text-[11px] text-slate-600 font-mono">
            ឧទាហរណ៍៖ ចាក់ 1,000៛ ត្រូវ 1 ប៉ុស្តិ៍ ទទួលបាន <strong>{formatKHR(1000 * LOTTERY_PAYOUT_RATE)}</strong>។
          </p>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                <th className="py-3 px-4">វេនចាប់ឆ្នោត</th>
                <th className="py-3 px-4">កាលបរិច្ឆេទ & ម៉ោង</th>
                <th className="py-3 px-4 text-center">ប៉ុស្តិ៍ A</th>
                <th className="py-3 px-4 text-center">ប៉ុស្តិ៍ B</th>
                <th className="py-3 px-4 text-center">ប៉ុស្តិ៍ C</th>
                <th className="py-3 px-4 text-center">ប៉ុស្តិ៍ D</th>
                <th className="py-3 px-4 text-center">ប៉ុស្តិ៍ E</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {filteredRounds.map((rnd) => (
                <tr key={rnd.roundId} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-bold text-blue-700">{rnd.roundId}</td>
                  <td className="py-3 px-4 text-slate-600">
                    {rnd.date} · {rnd.drawTime}
                  </td>
                  {(['A', 'B', 'C', 'D', 'E'] as ChannelLetter[]).map((ch) => {
                    const col = CHANNEL_COLORS[ch];
                    return (
                      <td key={ch} className="py-2.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-black text-sm ${col.badgeBg} shadow-2xs`}
                        >
                          {rnd.numbers[ch]}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
