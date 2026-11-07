import React from 'react';
import { Printer, X, CheckCircle2 } from 'lucide-react';
import { BetTicket } from '../types/lottery';
import { formatKHR, LOTTERY_PAYOUT_RATE } from '../utils/formatters';

interface PrintReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: BetTicket | null;
}

export const PrintReceiptModal: React.FC<PrintReceiptModalProps> = ({
  isOpen,
  onClose,
  ticket,
}) => {
  if (!isOpen || !ticket) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-[#3b6cb7] text-white px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Printer className="w-4 h-4 text-amber-300" />
            <span className="font-bold text-sm">វិក្កយបត្រឆ្នោត (Bet Receipt)</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-white/10 text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Receipt Paper Area */}
        <div id="printable-receipt" className="p-6 bg-[#fffdf9] font-mono text-slate-800 text-xs">
          {/* Header */}
          <div className="text-center pb-3 border-b-2 border-dashed border-slate-300">
            <h2 className="text-base font-black tracking-wider text-slate-900 font-sans">ឆ្នោតសំណាង 1/99</h2>
            <p className="text-[11px] text-slate-500 font-sans">វិក្កយបត្រផ្លូវការ / OFFICIAL LOTTERY RECEIPT</p>
            <p className="text-[10px] text-slate-400 mt-1">កាលបរិច្ឆេទ: {ticket.createdAt}</p>
          </div>

          {/* Ticket Metadata */}
          <div className="py-3 border-b border-dashed border-slate-300 space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">លេខកូដសំបុត្រ:</span>
              <span className="font-bold">{ticket.ticketId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">វេនចាប់រង្វាន់:</span>
              <span className="font-bold text-blue-700">{ticket.roundId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">ប៉ុស្តិ៍ភ្នាល់:</span>
              <span className="font-bold">{ticket.channels.join(', ')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">ចំនួនលេខ:</span>
              <span>{ticket.numbers.length} លេខ</span>
            </div>
          </div>

          {/* Numbers list */}
          <div className="py-3 border-b border-dashed border-slate-300">
            <span className="text-slate-500 block mb-1.5 font-sans">បញ្ជីលេខដែលបានចាក់:</span>
            <div className="flex flex-wrap gap-1.5">
              {ticket.numbers.map((n) => (
                <span
                  key={n}
                  className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 font-bold text-slate-900 text-xs"
                >
                  {n}
                </span>
              ))}
            </div>
          </div>

          {/* Pricing & Stake Calculation */}
          <div className="py-3 border-b-2 border-dashed border-slate-300 space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-500">តម្លៃក្នុង 1 លេខ:</span>
              <span>{formatKHR(ticket.stakePerUnit)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">សរុបភ្នាល់:</span>
              <span>{ticket.totalBetsCount} ភ្នាល់</span>
            </div>
            <div className="flex justify-between text-sm font-bold pt-1 border-t border-slate-200">
              <span>សរុបទឹកប្រាក់:</span>
              <span className="text-blue-700">{formatKHR(ticket.totalCost)}</span>
            </div>
            <div className="flex justify-between text-[11px] text-emerald-700 font-medium">
              <span>រង្វាន់ឈ្នះក្នុង 1 ប៉ុស្តិ៍ (1:{LOTTERY_PAYOUT_RATE}):</span>
              <span>{formatKHR(ticket.stakePerUnit * LOTTERY_PAYOUT_RATE)}</span>
            </div>
          </div>

          {/* Status badge if already drawn */}
          {ticket.status !== 'PENDING' && (
            <div className="py-2.5 text-center border-b border-dashed border-slate-300">
              {ticket.status === 'WON' ? (
                <div className="text-emerald-700 font-bold flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>បានឈ្នះ: {formatKHR(ticket.wonAmount)}</span>
                </div>
              ) : (
                <div className="text-slate-500 font-semibold">មិនត្រូវរង្វាន់</div>
              )}
            </div>
          )}

          {/* Barcode Mock */}
          <div className="pt-4 flex flex-col items-center">
            <div className="h-10 w-44 flex items-center justify-between overflow-hidden bg-white p-1 border border-slate-200">
              {Array.from({ length: 34 }).map((_, i) => (
                <div
                  key={i}
                  className={`h-full ${i % 3 === 0 ? 'w-1 bg-black' : i % 2 === 0 ? 'w-0.5 bg-black' : 'w-1.5 bg-slate-800'}`}
                />
              ))}
            </div>
            <span className="text-[10px] text-slate-500 mt-1 tracking-widest">{ticket.ticketId}*199</span>
            <p className="text-[10px] text-slate-400 mt-2 font-sans text-center">
              សូមរក្សាទុកសំបុត្រនេះដើម្បីបើករង្វាន់។ អរគុណ និងសំណាងល្អ!
            </p>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="bg-slate-50 px-4 py-3 flex items-center justify-end gap-2 border-t border-slate-200">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
          >
            បិទ (Close)
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold bg-[#22c55e] hover:bg-emerald-600 text-white shadow-sm transition-transform active:scale-95"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>បោះពុម្ពឥឡូវ (Print)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
