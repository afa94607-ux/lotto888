import React from 'react';
import { X, Wallet, RotateCcw, PlusCircle } from 'lucide-react';
import { formatKHR } from '../utils/formatters';
import { sound } from '../utils/audio';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBalance: number;
  onDeposit: (amount: number) => void;
  onReset: () => void;
}

export const DepositModal: React.FC<DepositModalProps> = ({
  isOpen,
  onClose,
  currentBalance,
  onDeposit,
  onReset,
}) => {
  if (!isOpen) return null;

  const depositPresets = [
    { label: '+50,000៛', value: 50000 },
    { label: '+100,000៛', value: 100000 },
    { label: '+200,000៛', value: 200000 },
    { label: '+500,000៛', value: 500000 },
    { label: '+1,000,000៛', value: 1000000 },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-[#3b6cb7] text-white px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-amber-300" />
            <span className="font-bold text-sm">បញ្ចូលទឹកប្រាក់សាកល្បង (Wallet Top-Up)</span>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-white/10 text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
            <span className="text-xs text-slate-500 font-medium">សមតុល្យបច្ចុប្បន្ន</span>
            <div className="font-mono text-xl font-black text-emerald-600 mt-0.5">
              {formatKHR(currentBalance)}
            </div>
          </div>

          <div>
            <span className="text-xs font-bold text-slate-700 block mb-2">ជ្រើសរើសចំនួនបញ្ចូល:</span>
            <div className="grid grid-cols-2 gap-2">
              {depositPresets.map((p) => (
                <button
                  key={p.label}
                  onClick={() => {
                    sound.playCash();
                    onDeposit(p.value);
                    onClose();
                  }}
                  className="py-2 px-3 rounded-xl border border-blue-200 bg-blue-50/50 hover:bg-blue-600 hover:text-white text-blue-700 font-mono font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>{p.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={() => {
                sound.playClick();
                onReset();
                onClose();
              }}
              className="w-full py-2 px-3 rounded-xl border border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>កំណត់សមតុល្យដើមឡើងវិញ (321,500៛)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
