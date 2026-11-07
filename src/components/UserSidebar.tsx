import React from 'react';
import { RotateCw, CheckSquare, Square, Ticket, Eye, LogOut } from 'lucide-react';
import { BetTicket } from '../types/lottery';
import { formatKHR } from '../utils/formatters';
import { sound } from '../utils/audio';

interface UserSidebarProps {
  currentDate: string;
  userId?: string;
  balance: number;
  inPlayBet: number;
  recentTickets: BetTicket[];
  onRefresh: () => void;
  onViewTicket: (ticket: BetTicket) => void;
  onLogout?: () => void;
}

export const UserSidebar: React.FC<UserSidebarProps> = ({
  currentDate,
  balance,
  inPlayBet,
  recentTickets,
  onRefresh,
  onViewTicket,
  onLogout,
}) => {
  const [autoRefresh, setAutoRefresh] = React.useState(true);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-4 flex flex-col gap-4 h-full">
      {/* Date & Account ID */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <div className="text-xs font-mono font-medium text-slate-500">{currentDate}</div>
          <div className="text-xs font-semibold text-slate-400">(KHR)</div>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              sound.playClick();
              onRefresh();
            }}
            title="Refresh Account"
            className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
          {onLogout && (
            <button
              onClick={() => {
                sound.playClick();
                onLogout();
              }}
              title="ចាកចេញពីគណនី (Logout)"
              className="p-1 rounded text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Balance & In-Play Wager */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-600">សមតុល្យទឹកប្រាក់</span>
          <span className="font-mono font-black text-base text-emerald-600 tracking-tight">
            {formatKHR(balance)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-600">លុយកំពុងភ្នាល់</span>
          <span className="font-mono font-bold text-sm text-slate-800">
            {formatKHR(inPlayBet)}
          </span>
        </div>
      </div>

      {/* Recent Bets 3 Rounds Header */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
          <span>ទើបភ្នាល់</span>
          <span className="text-blue-600 font-mono">3</span>
          <span>វេនចុងក្រោយ</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className="flex items-center gap-1 text-[11px] text-slate-600 hover:text-slate-900 cursor-pointer"
          >
            {autoRefresh ? (
              <CheckSquare className="w-3.5 h-3.5 text-blue-600" />
            ) : (
              <Square className="w-3.5 h-3.5 text-slate-400" />
            )}
            <span>ទំព័រថ្មី</span>
          </button>
          <button
            onClick={() => {
              sound.playClick();
              onRefresh();
            }}
            className="text-slate-400 hover:text-slate-600"
          >
            <RotateCw className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Content Area: Either Illustration when empty or Recent Bet Slips */}
      <div className="flex-1 flex flex-col justify-center items-center min-h-[220px] overflow-hidden">
        {recentTickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-2 text-center">
            <div className="w-full max-w-[220px] rounded-xl overflow-hidden shadow-2xs border border-slate-100 mb-2">
              <img
                src="/src/assets/images/lottery_empty_illustration_1792387005619.jpg"
                alt="Empty state"
                referrerPolicy="no-referrer"
                className="w-full h-auto object-contain"
              />
            </div>
            <p className="text-xs text-slate-400 font-medium">មិនទាន់មានការភ្នាល់នៅឡើយ</p>
            <p className="text-[11px] text-slate-400">សូមជ្រើសរើសប៉ុស្តិ៍ និងលេខដើម្បីចាក់</p>
          </div>
        ) : (
          <div className="w-full flex-1 overflow-y-auto space-y-2 pr-1 max-h-[360px]">
            {recentTickets.slice(0, 10).map((ticket) => (
              <div
                key={ticket.ticketId}
                className="p-2.5 rounded-xl border border-slate-200/80 bg-slate-50/70 hover:bg-slate-50 transition-colors flex flex-col gap-1.5 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-blue-700">{ticket.roundId}</span>
                  <span
                    className={`font-semibold px-1.5 py-0.5 rounded text-[10px] ${
                      ticket.status === 'PENDING'
                        ? 'bg-amber-100 text-amber-800'
                        : ticket.status === 'WON'
                        ? 'bg-emerald-100 text-emerald-800 animate-pulse font-bold'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {ticket.status === 'PENDING' ? 'រង់ចាំ' : ticket.status === 'WON' ? `ឈ្នះ ${formatKHR(ticket.wonAmount)}` : 'មិនត្រូវ'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-slate-600 text-[11px]">
                  <span>ប៉ុស្តិ៍: {ticket.channels.join(', ')}</span>
                  <span>{ticket.numbers.length} លេខ ({ticket.numbers.slice(0, 3).join(', ')}{ticket.numbers.length > 3 ? '...' : ''})</span>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-200/50">
                  <span className="font-mono text-slate-500 text-[10px]">{ticket.ticketId}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-slate-900">{formatKHR(ticket.totalCost)}</span>
                    <button
                      onClick={() => onViewTicket(ticket)}
                      title="View Slip"
                      className="p-0.5 text-blue-600 hover:text-blue-800"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
