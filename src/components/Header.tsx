import React from 'react';
import { Volume2, VolumeX, Zap, Wallet, User, LogOut } from 'lucide-react';
import { formatKHR } from '../utils/formatters';
import { sound } from '../utils/audio';

interface HeaderProps {
  currentTab: 'home' | 'winloss' | 'results';
  setCurrentTab: (tab: 'home' | 'winloss' | 'results') => void;
  balance: number;
  currentUserId?: string;
  currentUserName?: string;
  isMuted: boolean;
  toggleMute: () => void;
  isTurbo: boolean;
  toggleTurbo: () => void;
  onOpenDeposit: () => void;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  balance,
  currentUserId = 'AADPDPP001',
  currentUserName,
  isMuted,
  toggleMute,
  isTurbo,
  toggleTurbo,
  onOpenDeposit,
  onLogout,
}) => {
  const handleLogoutClick = () => {
    sound.playClick();
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <header className="bg-[#3b6cb7] text-white shadow-md select-none sticky top-0 z-30">
      <div className="max-w-[1720px] mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
        {/* Navigation Tabs - Dedicated strictly to Player gaming platform */}
        <div className="flex items-center gap-1 sm:gap-2">
          <div className="flex items-center gap-2 mr-2 sm:mr-3 font-bold text-lg tracking-wide text-amber-300">
            <span>ឆ្នោតសំណាង 1/99</span>
          </div>

          <button
            onClick={() => setCurrentTab('home')}
            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
              currentTab === 'home'
                ? 'bg-white/20 text-white font-bold shadow-sm'
                : 'text-blue-100 hover:bg-white/10 hover:text-white'
            }`}
          >
            ត្នោត (ទំព័រដើម)
          </button>
          <button
            onClick={() => setCurrentTab('winloss')}
            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
              currentTab === 'winloss'
                ? 'bg-white/20 text-white font-bold shadow-sm'
                : 'text-blue-100 hover:bg-white/10 hover:text-white'
            }`}
          >
            ឈ្នះចាញ់
          </button>
          <button
            onClick={() => setCurrentTab('results')}
            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
              currentTab === 'results'
                ? 'bg-white/20 text-white font-bold shadow-sm'
                : 'text-blue-100 hover:bg-white/10 hover:text-white'
            }`}
          >
            លទ្ធផល
          </button>
        </div>

        {/* Right Tools, User Profile & Balance */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Turbo Draw Toggle */}
          <button
            onClick={toggleTurbo}
            title={isTurbo ? 'Turbo mode ON (15s draws)' : 'Standard mode (3m draws)'}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold transition-all border ${
              isTurbo
                ? 'bg-amber-400 text-slate-900 border-amber-300 shadow-[0_0_8px_rgba(251,191,36,0.6)]'
                : 'bg-blue-800/60 text-blue-200 border-blue-600/40 hover:bg-blue-800'
            }`}
          >
            <Zap className={`w-3.5 h-3.5 ${isTurbo ? 'fill-current' : ''}`} />
            <span className="hidden sm:inline">{isTurbo ? 'ដំណើរការលឿន 15s' : 'ធម្មតា 3m'}</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={toggleMute}
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            className="p-1.5 rounded text-blue-100 hover:bg-white/10 transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-300" /> : <Volume2 className="w-4 h-4 text-emerald-300" />}
          </button>

          {/* Current User ID indicator */}
          <div className="hidden md:flex items-center bg-blue-950/50 border border-blue-400/20 rounded-lg px-2.5 py-1 text-xs">
            <User className="w-3.5 h-3.5 text-blue-300 mr-1.5" />
            <span className="font-mono font-bold text-blue-200">{currentUserId}</span>
            {currentUserName && (
              <span className="text-blue-300/80 ml-1.5 font-normal max-w-[100px] truncate hidden lg:inline">
                ({currentUserName})
              </span>
            )}
          </div>

          {/* Balance Pill with quick deposit */}
          <div className="flex items-center bg-blue-900/80 border border-blue-400/40 rounded-lg px-2.5 py-1 text-xs sm:text-sm shadow-sm">
            <Wallet className="w-3.5 h-3.5 text-amber-300 mr-1.5" />
            <span className="font-mono font-bold text-amber-300 mr-2">{formatKHR(balance)}</span>
            <button
              onClick={onOpenDeposit}
              title="Deposit or Reset Balance"
              className="bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold px-1.5 py-0.5 rounded text-[11px] transition-colors"
            >
              + បញ្ចូល
            </button>
          </div>

          {/* Player Logout Button */}
          {onLogout && (
            <button
              onClick={handleLogoutClick}
              title="ចាកចេញពីគណនី (Logout)"
              className="flex items-center gap-1 bg-red-600/80 hover:bg-red-600 text-white font-bold px-2.5 py-1 rounded-lg text-xs transition-colors shadow-sm ml-1"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">ចាកចេញ</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
