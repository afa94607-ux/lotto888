import React, { useState } from 'react';
import { BetTicket } from '../types/lottery';
import { formatKHR } from '../utils/formatters';
import { TrendingUp, TrendingDown, DollarSign, Ticket, Eye, Filter } from 'lucide-react';
import { sound } from '../utils/audio';

interface WinLossViewProps {
  tickets: BetTicket[];
  onViewTicket: (ticket: BetTicket) => void;
}

export const WinLossView: React.FC<WinLossViewProps> = ({ tickets, onViewTicket }) => {
  const [filter, setFilter] = useState<'ALL' | 'WON' | 'LOST' | 'PENDING'>('ALL');

  const totalStaked = tickets.reduce((acc, t) => acc + t.totalCost, 0);
  const totalWon = tickets.reduce((acc, t) => acc + t.wonAmount, 0);
  const netProfit = totalWon - totalStaked;

  const filteredTickets = tickets.filter((t) => {
    if (filter === 'ALL') return true;
    return t.status === filter;
  });

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">របាយការណ៍ឈ្នះចាញ់ (Win/Loss Statement)</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            ស្ថិតិលម្អិតនៃការភ្នាល់ និងប្រាក់រង្វាន់ទាំងអស់របស់អ្នក
          </p>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Staked */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col gap-1">
          <span className="text-xs font-semibold text-slate-500">សរុបប្រាក់ភ្នាល់ (Total Stake)</span>
          <div className="flex items-center gap-1.5 font-mono text-lg sm:text-xl font-bold text-slate-900">
            <DollarSign className="w-5 h-5 text-blue-600" />
            <span>{formatKHR(totalStaked)}</span>
          </div>
        </div>

        {/* Total Won */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col gap-1">
          <span className="text-xs font-semibold text-slate-500">សរុបប្រាក់ឈ្នះ (Total Won)</span>
          <div className="flex items-center gap-1.5 font-mono text-lg sm:text-xl font-bold text-emerald-600">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            <span>{formatKHR(totalWon)}</span>
          </div>
        </div>

        {/* Net Win/Loss */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col gap-1">
          <span className="text-xs font-semibold text-slate-500">ចំណេញ / ខាតសុទ្ធ (Net P/L)</span>
          <div
            className={`flex items-center gap-1.5 font-mono text-lg sm:text-xl font-black ${
              netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            {netProfit >= 0 ? (
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            ) : (
              <TrendingDown className="w-5 h-5 text-rose-600" />
            )}
            <span>{formatKHR(netProfit)}</span>
          </div>
        </div>

        {/* Tickets Count */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col gap-1">
          <span className="text-xs font-semibold text-slate-500">សរុបសំបុត្រ (Total Slips)</span>
          <div className="flex items-center gap-1.5 font-mono text-lg sm:text-xl font-bold text-purple-600">
            <Ticket className="w-5 h-5 text-purple-600" />
            <span>{tickets.length} សំបុត្រ</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 p-1 bg-slate-200/70 rounded-xl w-fit">
        {(['ALL', 'WON', 'LOST', 'PENDING'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => {
              sound.playClick();
              setFilter(tab);
            }}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              filter === tab
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab === 'ALL' && 'ទាំងអស់ (All)'}
            {tab === 'WON' && 'បានឈ្នះ (Won)'}
            {tab === 'LOST' && 'មិនត្រូវ (Lost)'}
            {tab === 'PENDING' && 'រង់ចាំ (Pending)'}
          </button>
        ))}
      </div>

      {/* Tickets Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredTickets.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Ticket className="w-12 h-12 mx-auto stroke-1 text-slate-300 mb-2" />
            <p className="text-sm font-medium">គ្មានទិន្នន័យភ្នាល់ក្នុងជម្រើសនេះទេ</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">កូដសំបុត្រ</th>
                  <th className="py-3 px-4">វេនចាប់ឆ្នោត</th>
                  <th className="py-3 px-4">ប៉ុស្តិ៍</th>
                  <th className="py-3 px-4">លេខចាក់</th>
                  <th className="py-3 px-4 text-right">ទឹកប្រាក់ចាក់</th>
                  <th className="py-3 px-4 text-center">ស្ថានភាព</th>
                  <th className="py-3 px-4 text-right">ប្រាក់ឈ្នះ</th>
                  <th className="py-3 px-4 text-center">វិក្កយបត្រ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {filteredTickets.map((t) => (
                  <tr key={t.ticketId} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-900">{t.ticketId}</td>
                    <td className="py-3 px-4 text-blue-700 font-bold">{t.roundId}</td>
                    <td className="py-3 px-4 font-sans font-medium text-slate-700">
                      {t.channels.join(', ')}
                    </td>
                    <td className="py-3 px-4 font-sans text-slate-800">
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {t.numbers.map((n) => (
                          <span key={n} className="px-1.5 py-0.2 bg-slate-100 rounded text-[11px] font-bold">
                            {n}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-800">
                      {formatKHR(t.totalCost)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-sans font-bold ${
                          t.status === 'WON'
                            ? 'bg-emerald-100 text-emerald-800'
                            : t.status === 'PENDING'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {t.status === 'WON' ? 'ឈ្នះ' : t.status === 'PENDING' ? 'រង់ចាំ' : 'មិនត្រូវ'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-emerald-600">
                      {t.wonAmount > 0 ? formatKHR(t.wonAmount) : '0៛'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => onViewTicket(t)}
                        className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                        title="View Receipt"
                      >
                        <Eye className="w-4 h-4 mx-auto" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
