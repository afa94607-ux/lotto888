import React, { useState, useMemo } from 'react';
import {
  ShieldAlert,
  Coins,
  Settings,
  Users,
  Dices,
  RotateCcw,
  Play,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Percent,
  UserPlus,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  ExternalLink,
  ArrowLeft,
  Radio,
  Flame,
  Award,
  Wallet,
  AlertTriangle,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  LogOut,
} from 'lucide-react';
import { ChannelLetter, RoundResult, BetTicket, AppUser, UserRole, SystemConfig } from '../types/lottery';
import {
  formatKHR,
  CHANNEL_COLORS,
  padNumber,
  getRandomLotteryNumber,
} from '../utils/formatters';
import { sound } from '../utils/audio';

interface AdminPanelProps {
  currentRoundId: string;
  countdownSeconds: number;
  adminUser?: AppUser;
  onLogoutAdmin?: () => void;
  // Users & Masters
  users: AppUser[];
  onAddUser: (user: Omit<AppUser, 'createdAt'>) => void;
  onUpdateUserBalance: (userId: string, newBalance: number) => void;
  onUpdateUserPassword?: (userId: string, newPassword: string) => void;
  onToggleUserStatus: (userId: string) => void;
  onDeleteUser: (userId: string) => void;
  activeUserId: string;
  onSetActiveUser: (userId: string) => void;
  // Tickets & In-play
  userTickets: BetTicket[];
  onUpdateTicketStatus: (ticketId: string, status: 'WON' | 'LOST', wonAmount?: number) => void;
  onVoidTicket: (ticketId: string) => void;
  onClearUserTickets?: () => void;
  // System Config
  systemConfig: SystemConfig;
  onUpdateSystemConfig: (config: Partial<SystemConfig>) => void;
  // Results & Draws
  forcedNextNumbers: Record<ChannelLetter, string> | null;
  onSetForcedNextNumbers: (numbers: Record<ChannelLetter, string> | null) => void;
  onTriggerDraw: () => void;
  pastRounds: RoundResult[];
  onDeleteRound: (roundId: string) => void;
  onResetHistory: () => void;
  // Standalone tab actions
  onBackToGame?: () => void;
  onOpenGameInNewTab?: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  currentRoundId,
  countdownSeconds,
  adminUser,
  onLogoutAdmin,
  users,
  onAddUser,
  onUpdateUserBalance,
  onUpdateUserPassword,
  onToggleUserStatus,
  onDeleteUser,
  activeUserId,
  onSetActiveUser,
  userTickets,
  onUpdateTicketStatus,
  onVoidTicket,
  onClearUserTickets,
  systemConfig,
  onUpdateSystemConfig,
  forcedNextNumbers,
  onSetForcedNextNumbers,
  onTriggerDraw,
  pastRounds,
  onDeleteRound,
  onResetHistory,
  onBackToGame,
  onOpenGameInNewTab,
}) => {
  // Navigation tabs in Admin
  const [activeTab, setActiveTab] = useState<'users' | 'inplay' | 'draws' | 'system'>('inplay');

  // Search & Filter States
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<'ALL' | UserRole>('ALL');
  const [ticketSearch, setTicketSearch] = useState('');
  const [ticketFilter, setTicketFilter] = useState<'ALL' | 'PENDING' | 'WON' | 'LOST'>('PENDING');

  // Modal: Add User / Master
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [newUserId, setNewUserId] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('123456');
  const [newUserName, setNewUserName] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('MEMBER');
  const [newUserMasterId, setNewUserMasterId] = useState('');
  const [newUserBalance, setNewUserBalance] = useState('500000');
  const [newUserCredit, setNewUserCredit] = useState('2000000');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserCommission, setNewUserCommission] = useState('5');
  const [newUserNotes, setNewUserNotes] = useState('');

  // Modal: Edit User Balance
  const [balanceEditUser, setBalanceEditUser] = useState<AppUser | null>(null);
  const [balanceAdjustmentType, setBalanceAdjustmentType] = useState<'ADD' | 'SUBTRACT' | 'SET'>('ADD');
  const [balanceAdjustmentAmount, setBalanceAdjustmentAmount] = useState('100000');

  // Modal: Edit User Password
  const [passwordEditUser, setPasswordEditUser] = useState<AppUser | null>(null);
  const [passwordEditValue, setPasswordEditValue] = useState('123456');
  const [showPasswordMap, setShowPasswordMap] = useState<Record<string, boolean>>({});

  // Local state for forced draw numbers
  const [manualMode, setManualMode] = useState(forcedNextNumbers !== null);
  const [inputsA, setInputsA] = useState(forcedNextNumbers?.A || '48');
  const [inputsB, setInputsB] = useState(forcedNextNumbers?.B || '92');
  const [inputsC, setInputsC] = useState(forcedNextNumbers?.C || '83');
  const [inputsD, setInputsD] = useState(forcedNextNumbers?.D || '17');
  const [inputsE, setInputsE] = useState(forcedNextNumbers?.E || '28');

  // Financial Stats
  const activeRoundTickets = useMemo(() => {
    return userTickets.filter((t) => t.roundId === currentRoundId && t.status === 'PENDING');
  }, [userTickets, currentRoundId]);

  const totalInPlayAmount = useMemo(() => {
    return activeRoundTickets.reduce((sum, t) => sum + t.totalCost, 0);
  }, [activeRoundTickets]);

  const totalInPlayLiability = useMemo(() => {
    // Calculate potential payout based on stake and payout rate
    return activeRoundTickets.reduce((sum, t) => {
      // Potential max win per ticket
      const maxHit = t.stakePerUnit * systemConfig.payoutRate;
      return sum + maxHit;
    }, 0);
  }, [activeRoundTickets, systemConfig.payoutRate]);

  const totalStakedAllTime = useMemo(() => {
    return userTickets.reduce((acc, t) => acc + t.totalCost, 0);
  }, [userTickets]);

  const totalWonAllTime = useMemo(() => {
    return userTickets.reduce((acc, t) => acc + t.wonAmount, 0);
  }, [userTickets]);

  const houseGrossProfit = totalStakedAllTime - totalWonAllTime;

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchRole = userRoleFilter === 'ALL' || u.role === userRoleFilter;
      const matchQuery =
        userSearch.trim() === '' ||
        u.id.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
        (u.phone && u.phone.includes(userSearch));
      return matchRole && matchQuery;
    });
  }, [users, userRoleFilter, userSearch]);

  // Filtered Tickets
  const filteredTickets = useMemo(() => {
    return userTickets.filter((t) => {
      const matchStatus = ticketFilter === 'ALL' || t.status === ticketFilter;
      const matchQuery =
        ticketSearch.trim() === '' ||
        t.ticketId.toLowerCase().includes(ticketSearch.toLowerCase()) ||
        (t.userId && t.userId.toLowerCase().includes(ticketSearch.toLowerCase())) ||
        t.roundId.toLowerCase().includes(ticketSearch.toLowerCase()) ||
        t.numbers.some((n) => n.includes(ticketSearch));
      return matchStatus && matchQuery;
    });
  }, [userTickets, ticketFilter, ticketSearch]);

  // Top In-Play hot numbers
  const hotNumbers = useMemo(() => {
    const counts: Record<string, number> = {};
    activeRoundTickets.forEach((t) => {
      t.numbers.forEach((num) => {
        counts[num] = (counts[num] || 0) + t.stakePerUnit;
      });
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [activeRoundTickets]);

  // Handlers for Add User
  const handleOpenAddUser = (defaultRole: UserRole = 'MEMBER') => {
    sound.playSelect();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const prefix = defaultRole === 'MASTER' ? 'MST_' : defaultRole === 'AGENT' ? 'AGT_' : 'USR_';
    setNewUserId(`${prefix}${randomSuffix}`);
    setNewUserPassword('123456');
    setNewUserName(defaultRole === 'MASTER' ? `Master Agent ${randomSuffix}` : `Member ${randomSuffix}`);
    setNewUserRole(defaultRole);
    setNewUserMasterId(users.find((u) => u.role === 'MASTER')?.id || '');
    setNewUserBalance(defaultRole === 'MASTER' ? '5000000' : '500000');
    setNewUserCredit('5000000');
    setNewUserPhone('');
    setNewUserCommission(defaultRole === 'MASTER' ? '15' : defaultRole === 'AGENT' ? '10' : '0');
    setNewUserNotes('');
    setIsAddUserModalOpen(true);
  };

  const handleCreateUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserId.trim() || !newUserName.trim()) return;

    sound.playCash();
    const balanceNum = parseInt(newUserBalance.replace(/[^0-9]/g, ''), 10) || 0;
    const creditNum = parseInt(newUserCredit.replace(/[^0-9]/g, ''), 10) || 0;
    const commissionNum = parseFloat(newUserCommission) || 0;

    onAddUser({
      id: newUserId.trim().toUpperCase(),
      name: newUserName.trim(),
      password: newUserPassword.trim() || '123456',
      role: newUserRole,
      masterId: newUserRole !== 'MASTER' && newUserMasterId ? newUserMasterId : undefined,
      balance: balanceNum,
      creditLimit: creditNum,
      phone: newUserPhone.trim() || undefined,
      status: 'ACTIVE',
      commissionRate: commissionNum,
      notes: newUserNotes.trim() || undefined,
    });

    setIsAddUserModalOpen(false);
  };

  // Handlers for Edit Balance
  const handleSaveBalanceAdjustment = () => {
    if (!balanceEditUser) return;
    sound.playCash();
    const amount = parseInt(balanceAdjustmentAmount.replace(/[^0-9]/g, ''), 10) || 0;
    let newBal = balanceEditUser.balance;

    if (balanceAdjustmentType === 'ADD') {
      newBal += amount;
    } else if (balanceAdjustmentType === 'SUBTRACT') {
      newBal = Math.max(0, newBal - amount);
    } else {
      newBal = amount;
    }

    onUpdateUserBalance(balanceEditUser.id, newBal);
    setBalanceEditUser(null);
  };

  // Forced Numbers Save
  const handleSaveForcedNumbers = () => {
    sound.playSelect();
    if (!manualMode) {
      onSetForcedNextNumbers(null);
      return;
    }
    const clean = (val: string) => {
      const n = parseInt(val, 10);
      if (isNaN(n) || n < 1 || n > 99) return '01';
      return padNumber(n);
    };
    const nextConfig: Record<ChannelLetter, string> = {
      A: clean(inputsA),
      B: clean(inputsB),
      C: clean(inputsC),
      D: clean(inputsD),
      E: clean(inputsE),
    };
    onSetForcedNextNumbers(nextConfig);
  };

  const handleRandomizeForcedNumbers = () => {
    sound.playSelect();
    setManualMode(true);
    setInputsA(getRandomLotteryNumber());
    setInputsB(getRandomLotteryNumber());
    setInputsC(getRandomLotteryNumber());
    setInputsD(getRandomLotteryNumber());
    setInputsE(getRandomLotteryNumber());
  };

  const handleClearForcedNumbers = () => {
    sound.playClick();
    setManualMode(false);
    onSetForcedNextNumbers(null);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans -m-2 sm:-m-4">
      {/* =========================================================================
          TOP EXECUTIVE ADMIN & MASTER HEADER
          Dedicated Back-Office Portal bar (distinguishes Admin as its own platform)
         ========================================================================= */}
      <header className="bg-slate-950 border-b border-slate-800 sticky top-0 z-40 shadow-xl px-4 py-3">
        <div className="max-w-[1720px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Brand & Portal Badge */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-amber-300 p-0.5 flex items-center justify-center shadow-lg">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <ShieldAlert className="w-5 h-5 text-amber-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-100 to-amber-400">
                  ឆ្នោតសំណាង 1/99 — ផ្ទាំងគ្រប់គ្រង MASTER & ADMIN
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wider">
                  Back-Office
                </span>
              </div>
              <p className="text-xs text-slate-400">
                ផ្ទាំងគ្រប់គ្រងប្រព័ន្ធផ្ទាល់ខ្លួន: គ្រប់គ្រង Master, User, សមតុល្យ, ការភ្នាល់ In-Play និងលទ្ធផលឆ្នោត
              </p>
            </div>
          </div>

          {/* Quick Real-Time Status & Cross-Tab Navigation */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Live Round pill */}
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 shadow-inner">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <div className="text-xs">
                <span className="text-slate-400">ជុំបច្ចុប្បន្ន: </span>
                <span className="font-mono font-bold text-amber-300">{currentRoundId}</span>
              </div>
              <div className="border-l border-slate-700 pl-2 text-xs">
                <span className="text-slate-400">រាប់ថយ: </span>
                <span className="font-mono font-bold text-white">{countdownSeconds}s</span>
              </div>
            </div>

            {/* Instant Draw Action */}
            <button
              onClick={() => {
                sound.playClick();
                onTriggerDraw();
              }}
              className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black px-3.5 py-1.5 rounded-xl text-xs sm:text-sm shadow-md transition-all active:scale-95"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>ចេញរង្វាន់ភ្លាមៗ</span>
            </button>

            {/* Admin User Info */}
            {adminUser && (
              <div className="hidden lg:flex items-center gap-1.5 bg-slate-900 border border-amber-500/30 rounded-xl px-2.5 py-1 text-xs">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-mono font-bold text-amber-300">{adminUser.id}</span>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded font-bold">
                  {adminUser.role}
                </span>
              </div>
            )}

            {/* Launch Player Platform in New Tab */}
            <button
              onClick={() => {
                sound.playClick();
                if (onOpenGameInNewTab) {
                  onOpenGameInNewTab();
                } else {
                  window.open(window.location.origin + window.location.pathname, '_blank');
                }
              }}
              title="បើកផ្ទាំងអ្នកលេងក្នុងផ្ទាំងកម្មវិធីរុករកថ្មី (Open Player in New Browser Tab)"
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold px-3 py-1.5 rounded-xl text-xs sm:text-sm shadow-md border border-blue-400/30 transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>បើកផ្ទាំងអ្នកលេង (New Tab ↗)</span>
            </button>

            {/* Admin Logout */}
            {onLogoutAdmin && (
              <button
                onClick={() => {
                  sound.playClick();
                  if (window.confirm('តើអ្នកពិតជាចង់ចាកចេញពីផ្ទាំងគ្រប់គ្រង Admin មែនទេ?')) {
                    onLogoutAdmin();
                  }
                }}
                className="flex items-center gap-1 bg-rose-600/30 hover:bg-rose-600 text-rose-200 hover:text-white font-bold px-2.5 py-1.5 rounded-xl text-xs transition-colors border border-rose-500/30 shadow-sm"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>ចាកចេញ</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* =========================================================================
          KEY PLATFORM KPIS & STATS STRIP
         ========================================================================= */}
      <div className="bg-slate-950/60 border-b border-slate-800/80 px-4 py-3">
        <div className="max-w-[1720px] mx-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* In-Play Volume */}
          <div className="bg-slate-900/90 border border-amber-500/30 rounded-xl p-3 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/5 rounded-full blur-xl pointer-events-none"></div>
            <div className="flex items-center justify-between text-xs text-amber-400 font-semibold mb-1">
              <span className="flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                ភ្នាល់កំពុងដំណើរការ (In-Play)
              </span>
              <span className="text-[10px] bg-amber-500/20 px-1.5 py-0.5 rounded text-amber-300 font-mono">
                {activeRoundTickets.length} សំបុត្រ
              </span>
            </div>
            <div className="font-mono text-lg sm:text-xl font-black text-amber-300">
              {formatKHR(totalInPlayAmount)}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              សងអតិបរមា: <span className="font-mono text-rose-400">{formatKHR(totalInPlayLiability)}</span>
            </div>
          </div>

          {/* Total Users & Masters */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 shadow-sm">
            <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-1">
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-blue-400" />
                អ្នកប្រើ & Master
              </span>
              <span className="text-[10px] bg-blue-500/20 px-1.5 py-0.5 rounded text-blue-300 font-mono">
                {users.length} គណនី
              </span>
            </div>
            <div className="font-mono text-lg sm:text-xl font-black text-white">
              {users.filter((u) => u.role === 'MASTER').length}{' '}
              <span className="text-xs font-normal text-slate-400">Masters / </span>
              {users.filter((u) => u.role === 'MEMBER').length}{' '}
              <span className="text-xs font-normal text-slate-400">Users</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              សកម្ម: <span className="text-emerald-400 font-semibold">{users.filter((u) => u.status === 'ACTIVE').length}</span>
            </div>
          </div>

          {/* Active Player ID & Balance */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 shadow-sm">
            <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-1">
              <span className="flex items-center gap-1">
                <Wallet className="w-3.5 h-3.5 text-emerald-400" />
                អ្នកលេងបច្ចុប្បន្ន (Active ID)
              </span>
            </div>
            <div className="font-mono text-sm sm:text-base font-bold text-emerald-300 truncate">
              {activeUserId}
            </div>
            <div className="text-[11px] text-slate-300 font-mono mt-0.5 font-bold">
              {formatKHR(users.find((u) => u.id === activeUserId)?.balance || 0)}
            </div>
          </div>

          {/* Total Turnover */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 shadow-sm">
            <div className="text-xs text-slate-400 font-semibold mb-1 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-purple-400" />
              សរុបភ្នាល់ទាំងអស់
            </div>
            <div className="font-mono text-lg sm:text-xl font-black text-white">
              {formatKHR(totalStakedAllTime)}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              {userTickets.length} សំបុត្របានចាក់
            </div>
          </div>

          {/* Total Payouts */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 shadow-sm">
            <div className="text-xs text-slate-400 font-semibold mb-1 flex items-center gap-1">
              <Coins className="w-3.5 h-3.5 text-rose-400" />
              សរុបរង្វាន់បានសង
            </div>
            <div className="font-mono text-lg sm:text-xl font-black text-rose-400">
              {formatKHR(totalWonAllTime)}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              អត្រាសង: <span className="font-mono font-bold text-amber-300">1:{systemConfig.payoutRate}</span>
            </div>
          </div>

          {/* House Profit (GGR) */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 shadow-sm">
            <div className="text-xs text-slate-400 font-semibold mb-1 flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-emerald-400" />
              ចំណេញម្ចាស់ប្រព័ន្ធ (GGR)
            </div>
            <div
              className={`font-mono text-lg sm:text-xl font-black ${
                houseGrossProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {formatKHR(houseGrossProfit)}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              {houseGrossProfit >= 0 ? 'ចំណេញសុទ្ធ' : 'ខាត'}
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          MAIN ADMIN NAVIGATION BAR
         ========================================================================= */}
      <div className="bg-slate-950 px-4 border-b border-slate-800">
        <div className="max-w-[1720px] mx-auto flex flex-wrap items-center gap-2 py-2">
          <button
            onClick={() => setActiveTab('inplay')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
              activeTab === 'inplay'
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Flame className="w-4 h-4" />
            <span>ភ្នាល់កំពុងដំណើរការ (Active Bets In-Play)</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[11px] font-mono ${
                activeTab === 'inplay' ? 'bg-slate-950 text-amber-300' : 'bg-slate-800 text-slate-300'
              }`}
            >
              {activeRoundTickets.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
              activeTab === 'users'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>គ្រប់គ្រងអ្នកប្រើ & Master (Users & Masters)</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[11px] font-mono ${
                activeTab === 'users' ? 'bg-white text-blue-900' : 'bg-slate-800 text-slate-300'
              }`}
            >
              {users.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('draws')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
              activeTab === 'draws'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Dices className="w-4 h-4" />
            <span>កំណត់លទ្ធផលឆ្នោត (Result Control)</span>
            {forcedNextNumbers && (
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-rose-500 text-white font-bold animate-pulse">
                កំណត់រួច
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('system')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
              activeTab === 'system'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>ការកំណត់ប្រព័ន្ធ (System Config)</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          TAB 1: ACTIVE BETS (IN-PLAY / ភ្នាល់កំពុងដំណើរការ)
         ========================================================================= */}
      {activeTab === 'inplay' && (
        <div className="flex-1 max-w-[1720px] w-full mx-auto p-4 space-y-4">
          {/* Header Controls & Filter */}
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <Flame className="w-5 h-5" />
                </span>
                <h2 className="text-lg sm:text-xl font-black text-white">
                  ការភ្នាល់កំពុងដំណើរការ (Active Bets In-Play) — ជុំ {currentRoundId}
                </h2>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                តាមដានការចាក់ឆ្នោតជាក់ស្តែងរបស់អ្នកលេងទាំងអស់ក្នុងជុំបច្ចុប្បន្ន ពិនិត្យលេខចាក់ច្រើន និងគ្រប់គ្រងសំបុត្រ
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Search box */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="ស្វែងរក ID សំបុត្រ ឬ ID អ្នកលេង..."
                  value={ticketSearch}
                  onChange={(e) => setTicketSearch(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 w-48 sm:w-60"
                />
              </div>

              {/* Status filter */}
              <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-700 text-xs">
                {(['PENDING', 'ALL', 'WON', 'LOST'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setTicketFilter(st)}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                      ticketFilter === st
                        ? 'bg-amber-400 text-slate-950'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {st === 'PENDING' ? 'កំពុងលេង (In-Play)' : st === 'ALL' ? 'ទាំងអស់' : st === 'WON' ? 'ឈ្នះ' : 'ចាញ់'}
                  </button>
                ))}
              </div>

              {onClearUserTickets && (
                <button
                  onClick={() => {
                    if (window.confirm('តើអ្នកពិតជាចង់សម្អាតប្រវត្តិសំបុត្រទាំងអស់មែនទេ?')) {
                      onClearUserTickets();
                    }
                  }}
                  className="flex items-center gap-1 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 px-3 py-1.5 rounded-xl text-xs font-semibold"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>សម្អាតសំបុត្រ</span>
                </button>
              )}
            </div>
          </div>

          {/* Hot Numbers Bar (most wagered numbers in the current round) */}
          {hotNumbers.length > 0 && (
            <div className="bg-gradient-to-r from-amber-500/10 via-slate-800 to-slate-800 border border-amber-500/30 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded bg-amber-500 text-slate-950 font-black text-xs">HOT</span>
                <span className="text-xs font-bold text-amber-300">
                  លេខដែលមានការចាក់ច្រើនជាងគេក្នុងជុំនេះ (Top Wagered Numbers):
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {hotNumbers.map(([num, amt]) => (
                  <div
                    key={num}
                    className="flex items-center gap-1.5 bg-slate-900 border border-amber-400/40 rounded-xl px-2.5 py-1 text-xs shadow-sm"
                  >
                    <span className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 font-black flex items-center justify-center font-mono">
                      {num}
                    </span>
                    <span className="font-mono text-slate-300">{formatKHR(amt)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tickets Table */}
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-900/90 text-slate-400 text-xs font-semibold uppercase tracking-wider border-b border-slate-700">
                  <tr>
                    <th className="py-3 px-4">ID សំបុត្រ (Ticket ID)</th>
                    <th className="py-3 px-4">ID អ្នកលេង (User ID)</th>
                    <th className="py-3 px-4">ជុំ (Round)</th>
                    <th className="py-3 px-4">ប៉ុស្តិ៍ (Channels)</th>
                    <th className="py-3 px-4">លេខបានចាក់ (Numbers)</th>
                    <th className="py-3 px-4 text-right">តម្លៃភ្នាល់ (Total Stake)</th>
                    <th className="py-3 px-4 text-right">សងអតិបរមា (Max Payout)</th>
                    <th className="py-3 px-4 text-center">ស្ថានភាព (Status)</th>
                    <th className="py-3 px-4 text-center">សកម្មភាព (Actions)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/60">
                  {filteredTickets.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-slate-400">
                        <Flame className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                        <div className="font-semibold">មិនមានការភ្នាល់ត្រូវនឹងលក្ខខណ្ឌនេះទេ</div>
                        <div className="text-xs text-slate-500 mt-1">
                          សំបុត្រដែលចាក់ពីផ្ទាំងអ្នកលេងនឹងបង្ហាញនៅទីនេះដោយស្វ័យប្រវត្តិតាមពេលវេលាជាក់ស្តែង
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredTickets.map((ticket) => {
                      const user = users.find((u) => u.id === (ticket.userId || 'AADPDPP001'));
                      const maxPotentialWin = ticket.stakePerUnit * systemConfig.payoutRate;

                      return (
                        <tr
                          key={ticket.ticketId}
                          className="hover:bg-slate-700/40 transition-colors"
                        >
                          {/* Ticket ID */}
                          <td className="py-3 px-4 font-mono font-bold text-amber-300">
                            {ticket.ticketId}
                            <div className="text-[10px] text-slate-500 font-normal">
                              {ticket.createdAt}
                            </div>
                          </td>

                          {/* User ID */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono font-bold text-blue-300">
                                {ticket.userId || 'AADPDPP001'}
                              </span>
                              {user?.role === 'MASTER' && (
                                <span className="text-[10px] bg-purple-500/20 text-purple-300 px-1.5 py-0.2 rounded font-bold">
                                  MASTER
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400 truncate max-w-[120px]">
                              {user?.name || 'Sokha Player VIP'}
                            </div>
                          </td>

                          {/* Round ID */}
                          <td className="py-3 px-4 font-mono text-slate-300 font-semibold">
                            {ticket.roundId}
                          </td>

                          {/* Channels */}
                          <td className="py-3 px-4">
                            <div className="flex flex-wrap gap-1">
                              {ticket.channels.map((ch) => (
                                <span
                                  key={ch}
                                  className={`w-5 h-5 rounded flex items-center justify-center font-bold text-[11px] text-white ${CHANNEL_COLORS[ch].bg}`}
                                >
                                  {ch}
                                </span>
                              ))}
                            </div>
                          </td>

                          {/* Numbers */}
                          <td className="py-3 px-4">
                            <div className="flex flex-wrap gap-1 max-w-[200px]">
                              {ticket.numbers.map((n) => (
                                <span
                                  key={n}
                                  className="w-6 h-6 rounded-full bg-slate-700 border border-slate-600 text-amber-300 font-mono font-bold text-xs flex items-center justify-center shadow-xs"
                                >
                                  {n}
                                </span>
                              ))}
                            </div>
                            <div className="text-[10px] text-slate-400 mt-1">
                              {ticket.totalBetsCount} គ្រាប់ × {formatKHR(ticket.stakePerUnit)}
                            </div>
                          </td>

                          {/* Total Cost */}
                          <td className="py-3 px-4 text-right font-mono font-bold text-white">
                            {formatKHR(ticket.totalCost)}
                          </td>

                          {/* Potential Payout */}
                          <td className="py-3 px-4 text-right font-mono font-bold text-amber-300">
                            {formatKHR(maxPotentialWin)}
                          </td>

                          {/* Status */}
                          <td className="py-3 px-4 text-center">
                            {ticket.status === 'PENDING' && (
                              <span className="inline-flex items-center gap-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full text-xs font-semibold">
                                <Clock className="w-3 h-3 animate-spin" />
                                <span>កំពុងលេង (In-Play)</span>
                              </span>
                            )}
                            {ticket.status === 'WON' && (
                              <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full text-xs font-bold">
                                <CheckCircle className="w-3 h-3" />
                                <span>ឈ្នះ +{formatKHR(ticket.wonAmount)}</span>
                              </span>
                            )}
                            {ticket.status === 'LOST' && (
                              <span className="inline-flex items-center gap-1 bg-slate-700 text-slate-400 px-2 py-0.5 rounded-full text-xs">
                                <XCircle className="w-3 h-3" />
                                <span>ចាញ់</span>
                              </span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-4 text-center">
                            {ticket.status === 'PENDING' ? (
                              <button
                                onClick={() => {
                                  if (window.confirm(`តើអ្នកពិតជាចង់លុបចោល (Void/Refund) សំបុត្រ ${ticket.ticketId} មែនទេ?`)) {
                                    onVoidTicket(ticket.ticketId);
                                  }
                                }}
                                className="bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 border border-rose-500/30 px-2 py-1 rounded-lg text-xs font-semibold transition-colors"
                                title="លុបចោលសំបុត្រ និងសងប្រាក់ត្រឡប់ទៅអ្នកលេង"
                              >
                                លុបចោល (Void)
                              </button>
                            ) : (
                              <span className="text-xs text-slate-500">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: USER & MASTER MANAGEMENT (គ្រប់គ្រងអ្នកប្រើ & MASTER)
         ========================================================================= */}
      {activeTab === 'users' && (
        <div className="flex-1 max-w-[1720px] w-full mx-auto p-4 space-y-4">
          {/* Top Bar with Add User / Master Buttons */}
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  <Users className="w-5 h-5" />
                </span>
                <h2 className="text-lg sm:text-xl font-black text-white">
                  គ្រប់គ្រងអ្នកប្រើប្រាស់ & Master (User & Master Management)
                </h2>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                បង្កើត Master ថ្មី, បន្ថែម User, កែសម្រួលសមតុល្យគណនី (Account Balance) និងតាមដានឥណទាន
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => handleOpenAddUser('MASTER')}
                className="flex items-center gap-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold px-3.5 py-2 rounded-xl text-xs sm:text-sm shadow-md transition-all active:scale-95"
              >
                <UserPlus className="w-4 h-4" />
                <span>+ បន្ថែម Master ថ្មី</span>
              </button>

              <button
                onClick={() => handleOpenAddUser('MEMBER')}
                className="flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold px-3.5 py-2 rounded-xl text-xs sm:text-sm shadow-md transition-all active:scale-95"
              >
                <UserPlus className="w-4 h-4" />
                <span>+ បន្ថែម User / អ្នកលេង</span>
              </button>
            </div>
          </div>

          {/* Search & Role Filter */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="ស្វែងរកតាម ID, ឈ្មោះ, ឬលេខទូរស័ព្ទ..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-400"
              />
            </div>

            {/* Role Filter Tabs */}
            <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs">
              {(['ALL', 'MASTER', 'AGENT', 'MEMBER'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setUserRoleFilter(r)}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                    userRoleFilter === r
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {r === 'ALL'
                    ? 'ទាំងអស់'
                    : r === 'MASTER'
                    ? 'Master (មេធំ)'
                    : r === 'AGENT'
                    ? 'Agent (ភ្នាក់ងារ)'
                    : 'Member (អ្នកលេង)'}
                </button>
              ))}
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-900/90 text-slate-400 text-xs font-semibold uppercase tracking-wider border-b border-slate-700">
                  <tr>
                    <th className="py-3 px-4">ID គណនី (User ID)</th>
                    <th className="py-3 px-4">ពាក្យសម្ងាត់ (Password)</th>
                    <th className="py-3 px-4">តួនាទី (Role)</th>
                    <th className="py-3 px-4">ឈ្មោះ (Display Name)</th>
                    <th className="py-3 px-4">មេគ្រប់គ្រង (Master)</th>
                    <th className="py-3 px-4 text-right">សមតុល្យ (Account Balance)</th>
                    <th className="py-3 px-4 text-right">កម្រិតឥណទាន (Credit)</th>
                    <th className="py-3 px-4 text-center">ស្ថានភាព (Status)</th>
                    <th className="py-3 px-4 text-center">សកម្មភាព (Actions)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/60">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-slate-400">
                        <Users className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                        <div>រកមិនឃើញគណនីដែលត្រូវគ្នានឹងការស្វែងរក</div>
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => {
                      const isActiveLogin = user.id === activeUserId;
                      return (
                        <tr
                          key={user.id}
                          className={`hover:bg-slate-700/40 transition-colors ${
                            isActiveLogin ? 'bg-blue-950/30 border-l-4 border-blue-500' : ''
                          }`}
                        >
                          {/* User ID */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1.5 font-mono font-bold text-amber-300">
                              <span>{user.id}</span>
                              {isActiveLogin && (
                                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] px-1.5 py-0.2 rounded font-sans font-bold">
                                  កំពុងប្រើប្រាស់
                                </span>
                              )}
                            </div>
                            {user.phone && (
                              <div className="text-[10px] text-slate-400 mt-0.5">
                                📞 {user.phone}
                              </div>
                            )}
                          </td>

                          {/* Password */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1.5 font-mono text-xs">
                              <span className="text-slate-300 font-semibold">
                                {showPasswordMap[user.id] ? (user.password || '123456') : '••••••'}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  setShowPasswordMap((prev) => ({ ...prev, [user.id]: !prev[user.id] }))
                                }
                                className="p-1 text-slate-400 hover:text-white transition-colors"
                                title={showPasswordMap[user.id] ? 'លាក់ពាក្យសម្ងាត់' : 'បង្ហាញពាក្យសម្ងាត់'}
                              >
                                {showPasswordMap[user.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  sound.playClick();
                                  setPasswordEditUser(user);
                                  setPasswordEditValue(user.password || '123456');
                                }}
                                className="px-1.5 py-0.5 rounded bg-slate-700 hover:bg-slate-600 text-amber-300 text-[10px] font-bold transition-colors flex items-center gap-1"
                                title="កែប្រែពាក្យសម្ងាត់ (Edit Password)"
                              >
                                <KeyRound className="w-3 h-3" />
                                <span>ប្តូរ</span>
                              </button>
                            </div>
                          </td>

                          {/* Role Badge */}
                          <td className="py-3 px-4">
                            {user.role === 'MASTER' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-xs">
                                👑 MASTER (មេធំ)
                              </span>
                            )}
                            {user.role === 'AGENT' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                                🛡️ AGENT (ភ្នាក់ងារ)
                              </span>
                            )}
                            {user.role === 'MEMBER' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-700 text-slate-300 border border-slate-600">
                                👤 MEMBER (អ្នកលេង)
                              </span>
                            )}
                          </td>

                          {/* Name */}
                          <td className="py-3 px-4">
                            <div className="font-semibold text-white">{user.name}</div>
                            {user.commissionRate > 0 && (
                              <div className="text-[10px] text-amber-400 font-mono">
                                កម្រៃជើងសារ: {user.commissionRate}%
                              </div>
                            )}
                          </td>

                          {/* Parent Master */}
                          <td className="py-3 px-4 text-xs font-mono text-slate-400">
                            {user.masterId ? user.masterId : '— (Super Admin)'}
                          </td>

                          {/* Account Balance with direct edit button */}
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <span className="font-mono font-bold text-base text-emerald-400">
                                {formatKHR(user.balance)}
                              </span>
                              <button
                                onClick={() => {
                                  sound.playClick();
                                  setBalanceEditUser(user);
                                  setBalanceAdjustmentType('ADD');
                                  setBalanceAdjustmentAmount('100000');
                                }}
                                className="p-1 rounded bg-slate-700 hover:bg-slate-600 text-amber-300 hover:text-amber-200 transition-colors"
                                title="កែប្រែសមតុល្យគណនី (Edit Balance)"
                              >
                                <Coins className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>

                          {/* Credit Limit */}
                          <td className="py-3 px-4 text-right font-mono text-slate-400 text-xs">
                            {formatKHR(user.creditLimit)}
                          </td>

                          {/* Status */}
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => {
                                sound.playClick();
                                onToggleUserStatus(user.id);
                              }}
                              className={`px-2 py-0.5 rounded-full text-xs font-bold transition-all ${
                                user.status === 'ACTIVE'
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              }`}
                            >
                              {user.status === 'ACTIVE' ? '✓ សកម្ម (Active)' : '✗ ផ្អាក (Suspended)'}
                            </button>
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              {/* Switch Active User */}
                              {!isActiveLogin && (
                                <button
                                  onClick={() => {
                                    sound.playClick();
                                    onSetActiveUser(user.id);
                                  }}
                                  className="px-2 py-1 rounded bg-blue-600/30 hover:bg-blue-600 text-blue-200 hover:text-white text-xs font-bold transition-all"
                                  title="ប្តូរទៅប្រើប្រាស់គណនីនេះក្នុងផ្ទាំងហ្គេម"
                                >
                                  ចូលប្រើ
                                </button>
                              )}

                              {/* Delete */}
                              <button
                                onClick={() => {
                                  if (window.confirm(`តើអ្នកពិតជាចង់លុបគណនី ${user.id} (${user.name}) មែនទេ?`)) {
                                    onDeleteUser(user.id);
                                  }
                                }}
                                className="p-1 rounded bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-300 transition-colors"
                                title="លុបគណនី"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: RESULT & DRAW CONTROL (កំណត់លទ្ធផលឆ្នោត)
         ========================================================================= */}
      {activeTab === 'draws' && (
        <div className="flex-1 max-w-[1720px] w-full mx-auto p-4 space-y-6">
          {/* Main Preset Control Board */}
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 shadow-xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-700">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-purple-600 text-white">
                    <Dices className="w-5 h-5" />
                  </span>
                  <h2 className="text-xl font-black text-white">
                    ផ្ទាំងកំណត់លទ្ធផលឆ្នោត (Draw Outcome Control) — ជុំ {currentRoundId}
                  </h2>
                </div>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  អ្នកគ្រប់គ្រងអាចកំណត់លេខឈ្នះជាមុន (Preset) សម្រាប់ប៉ុស្តិ៍នីមួយៗ A, B, C, D, E ឬចុចចេញរង្វាន់ភ្លាមៗ
                </p>
              </div>

              {/* Instant Draw Button */}
              <button
                onClick={() => {
                  sound.playClick();
                  onTriggerDraw();
                }}
                className="flex items-center gap-2 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-slate-950 font-black px-5 py-2.5 rounded-xl text-sm shadow-lg hover:shadow-amber-500/20 active:scale-95 transition-all"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>ចាប់រង្វាន់ភ្លាមៗ (Draw Now)</span>
              </button>
            </div>

            {/* Mode selection: Random or Force/Manual */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setManualMode(false);
                    onSetForcedNextNumbers(null);
                  }}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold border transition-all ${
                    !manualMode
                      ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                      : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white'
                  }`}
                >
                  🎲 ចេញដោយចៃដន្យធម្មតា (Random Auto Draw)
                </button>

                <button
                  onClick={() => {
                    setManualMode(true);
                  }}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold border transition-all ${
                    manualMode
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                      : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white'
                  }`}
                >
                  ⚡ កំណត់លេខឈ្នះជាមុន (Force Result Preset)
                </button>
              </div>

              {manualMode && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleRandomizeForcedNumbers}
                    className="flex items-center gap-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold px-3 py-1.5 rounded-lg text-xs"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>ចៃដន្យលេខថ្មី</span>
                  </button>
                  <button
                    onClick={handleClearForcedNumbers}
                    className="flex items-center gap-1 bg-rose-900/40 hover:bg-rose-800 text-rose-300 font-semibold px-3 py-1.5 rounded-lg text-xs border border-rose-500/40"
                  >
                    <span>លុបការកំណត់</span>
                  </button>
                </div>
              )}
            </div>

            {/* Forced Numbers Input Grid */}
            {manualMode && (
              <div className="bg-slate-950/80 border border-amber-500/30 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-300">
                    បញ្ចូលលេខឈ្នះ (01 - 99) សម្រាប់ប៉ុស្តិ៍នីមួយៗក្នុងជុំ {currentRoundId}:
                  </span>
                  <span className="text-xs text-slate-400">
                    ប្រព័ន្ធនឹងចេញលេខនេះពិតប្រាកដនៅពេលរង្វាន់វិលចប់!
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {[
                    { ch: 'A' as ChannelLetter, val: inputsA, set: setInputsA },
                    { ch: 'B' as ChannelLetter, val: inputsB, set: setInputsB },
                    { ch: 'C' as ChannelLetter, val: inputsC, set: setInputsC },
                    { ch: 'D' as ChannelLetter, val: inputsD, set: setInputsD },
                    { ch: 'E' as ChannelLetter, val: inputsE, set: setInputsE },
                  ].map(({ ch, val, set }) => (
                    <div
                      key={ch}
                      className="bg-slate-900 border border-slate-700 rounded-xl p-3 flex flex-col items-center gap-2"
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm text-white ${CHANNEL_COLORS[ch].bg}`}
                      >
                        {ch}
                      </div>
                      <input
                        type="number"
                        min="1"
                        max="99"
                        value={val}
                        onChange={(e) => set(e.target.value)}
                        className="w-16 h-12 text-center text-2xl font-black font-mono bg-slate-950 border-2 border-amber-400/50 rounded-lg text-amber-300 focus:outline-none focus:border-amber-400"
                      />
                      <span className="text-[10px] text-slate-400">ប៉ុស្តិ៍ {ch}</span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleSaveForcedNumbers}
                    className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black px-6 py-2.5 rounded-xl text-sm shadow-md transition-all active:scale-95"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>រក្សាទុកលេខឈ្នះនេះ (Lock in Preset)</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Past Rounds History Table */}
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl overflow-hidden shadow-lg">
            <div className="p-4 bg-slate-900/90 border-b border-slate-700 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-white text-base">ប្រវត្តិនៃការចេញលទ្ធផលកន្លងមក (Past Rounds)</h3>
                <p className="text-xs text-slate-400">មើលនិងលុបជុំចាស់ៗ ឬកែសម្រួលលទ្ធផល</p>
              </div>
              <button
                onClick={() => {
                  if (window.confirm('តើអ្នកពិតជាចង់កំណត់ប្រវត្តិលទ្ធផលឡើងវិញ (Reset History) មែនទេ?')) {
                    onResetHistory();
                  }
                }}
                className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-700"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>កំណត់ប្រវត្តិដើមឡើងវិញ</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-950 text-slate-400 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">ជុំ (Round ID)</th>
                    <th className="py-3 px-4">ម៉ោងចេញ (Time)</th>
                    <th className="py-3 px-4">កាលបរិច្ឆេទ (Date)</th>
                    <th className="py-3 px-4 text-center">A</th>
                    <th className="py-3 px-4 text-center">B</th>
                    <th className="py-3 px-4 text-center">C</th>
                    <th className="py-3 px-4 text-center">D</th>
                    <th className="py-3 px-4 text-center">E</th>
                    <th className="py-3 px-4 text-center">សកម្មភាព (Actions)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/60">
                  {pastRounds.map((round) => (
                    <tr key={round.roundId} className="hover:bg-slate-700/40">
                      <td className="py-3 px-4 font-mono font-bold text-blue-300">{round.roundId}</td>
                      <td className="py-3 px-4 font-mono text-slate-300">{round.drawTime}</td>
                      <td className="py-3 px-4 text-slate-400">{round.date}</td>
                      {(['A', 'B', 'C', 'D', 'E'] as ChannelLetter[]).map((ch) => (
                        <td key={ch} className="py-3 px-4 text-center">
                          <span
                            className={`inline-flex items-center justify-center w-7 h-7 rounded-full font-mono font-black text-xs text-white ${CHANNEL_COLORS[ch].bg}`}
                          >
                            {round.numbers[ch]}
                          </span>
                        </td>
                      ))}
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => {
                            if (window.confirm(`តើអ្នកពិតជាចង់លុបជុំ ${round.roundId} មែនទេ?`)) {
                              onDeleteRound(round.roundId);
                            }
                          }}
                          className="p-1 rounded bg-slate-800 hover:bg-rose-900/50 text-slate-400 hover:text-rose-300 transition-colors"
                          title="លុបជុំនេះ"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: SYSTEM CONFIGURATION (ការកំណត់ប្រព័ន្ធ)
         ========================================================================= */}
      {activeTab === 'system' && (
        <div className="flex-1 max-w-[1720px] w-full mx-auto p-4 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* System Parameter Card */}
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 shadow-xl space-y-5">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-700">
                <span className="p-1.5 rounded-lg bg-emerald-600 text-white">
                  <Settings className="w-5 h-5" />
                </span>
                <h2 className="text-lg font-black text-white">ការកំណត់ប្រព័ន្ធទូទៅ (System Parameters)</h2>
              </div>

              {/* Payout rate */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300">
                  អត្រាសងរង្វាន់ឆ្នោត 1/99 (Payout Multiplier):
                </label>
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">1:</span>
                    <input
                      type="number"
                      value={systemConfig.payoutRate}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        if (!isNaN(val) && val > 0) {
                          onUpdateSystemConfig({ payoutRate: val });
                        }
                      }}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-8 pr-3 py-2 font-mono font-bold text-amber-300 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <span className="text-xs text-slate-400">
                    ចាក់ 1,000៛ ឈ្នះ {formatKHR(1000 * systemConfig.payoutRate)}
                  </span>
                </div>
              </div>

              {/* Draw interval */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300">
                  រយៈពេលគម្លាតនៃការចេញរង្វាន់ (Draw Countdown Interval):
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {[
                    { label: '15s (Turbo)', sec: 15 },
                    { label: '30s', sec: 30 },
                    { label: '1 នាទី', sec: 60 },
                    { label: '2 នាទី', sec: 120 },
                    { label: '3 នាទី', sec: 180 },
                  ].map(({ label, sec }) => (
                    <button
                      key={sec}
                      onClick={() => {
                        sound.playClick();
                        onUpdateSystemConfig({ drawIntervalSeconds: sec });
                      }}
                      className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                        systemConfig.drawIntervalSeconds === sec
                          ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-xs'
                          : 'bg-slate-900 text-slate-300 border-slate-700 hover:text-white'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Min & Max bet */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">ភ្នាល់អប្បបរមា (Min Bet):</label>
                  <input
                    type="number"
                    value={systemConfig.minBetAmount}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (!isNaN(val)) onUpdateSystemConfig({ minBetAmount: val });
                    }}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 font-mono text-sm text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">ភ្នាល់អតិបរមា (Max Bet):</label>
                  <input
                    type="number"
                    value={systemConfig.maxBetAmount}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (!isNaN(val)) onUpdateSystemConfig({ maxBetAmount: val });
                    }}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 font-mono text-sm text-white"
                  />
                </div>
              </div>

              {/* System Open / Maintenance */}
              <div className="pt-3 border-t border-slate-700 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">ស្ថានភាពប្រព័ន្ធឆ្នោត (Platform Status)</div>
                  <div className="text-[11px] text-slate-400">
                    {systemConfig.isSystemOpen ? 'បើកដំណើរការធម្មតា (ទទួលការចាក់)' : 'ផ្អាកជាបណ្ដោះអាសន្ន'}
                  </div>
                </div>
                <button
                  onClick={() => {
                    sound.playClick();
                    onUpdateSystemConfig({ isSystemOpen: !systemConfig.isSystemOpen });
                  }}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    systemConfig.isSystemOpen
                      ? 'bg-emerald-600 text-white'
                      : 'bg-rose-600 text-white'
                  }`}
                >
                  {systemConfig.isSystemOpen ? 'បើកដំណើរការ (OPEN)' : 'ផ្អាក (LOCKED)'}
                </button>
              </div>
            </div>

            {/* Financial Overview & Master Summary */}
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-700">
                <span className="p-1.5 rounded-lg bg-amber-600 text-white">
                  <Coins className="w-5 h-5" />
                </span>
                <h2 className="text-lg font-black text-white">របាយការណ៍ហិរញ្ញវត្ថុប្រព័ន្ធ (Financial Summary)</h2>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-xs text-slate-400">សរុបប្រាក់ភ្នាល់ទាំងអស់ (Turnover):</span>
                  <span className="font-mono font-bold text-base text-white">{formatKHR(totalStakedAllTime)}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-xs text-slate-400">សរុបប្រាក់រង្វាន់បានបើក (Payouts):</span>
                  <span className="font-mono font-bold text-base text-rose-400">{formatKHR(totalWonAllTime)}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-emerald-500/30">
                  <span className="text-xs font-bold text-emerald-400">ប្រាក់ចំណេញសុទ្ធម្ចាស់ប្រព័ន្ធ (GGR):</span>
                  <span className="font-mono font-black text-lg text-emerald-400">{formatKHR(houseGrossProfit)}</span>
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-400 space-y-2">
                <div className="font-bold text-amber-300">💡 របៀបដំណើរការផ្ទាំងពីរស្របគ្នា (Multi-Tab Workflow):</div>
                <div>1. បើកផ្ទាំងទីមួយជាទំព័រអ្នកលេងចាក់ឆ្នោតធម្មតា</div>
                <div>2. បើកផ្ទាំងទីពីរជាផ្ទាំង Admin នេះ (ចុចប៊ូតុង "បើកផ្ទាំងអ្នកលេង New Tab ↗")</div>
                <div>3. រាល់ការចាក់ឆ្នោត ការកំណត់លទ្ធផល ឬការកែប្រែសមតុល្យ នឹងធ្វើសមកាលកម្មគ្នាភ្លាមៗដោយស្វ័យប្រវត្តិតាម localStorage & storage event!</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: ADD NEW USER / MASTER
         ========================================================================= */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-amber-400" />
                <h3 className="font-black text-white text-base">
                  {newUserRole === 'MASTER' ? 'បង្កើត Master ថ្មី' : 'បង្កើត User / អ្នកលេងថ្មី'}
                </h3>
              </div>
              <button
                onClick={() => setIsAddUserModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateUserSubmit} className="space-y-3 text-xs">
              {/* Role selector */}
              <div>
                <label className="block font-bold text-slate-300 mb-1">តួនាទី (Account Role):</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['MASTER', 'AGENT', 'MEMBER'] as const).map((r) => (
                    <button
                      type="button"
                      key={r}
                      onClick={() => setNewUserRole(r)}
                      className={`py-1.5 rounded-lg font-bold border transition-all ${
                        newUserRole === r
                          ? 'bg-blue-600 text-white border-blue-400'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {r === 'MASTER' ? '👑 Master' : r === 'AGENT' ? '🛡️ Agent' : '👤 Member'}
                    </button>
                  ))}
                </div>
              </div>

              {/* User ID */}
              <div>
                <label className="block font-bold text-slate-300 mb-1">ID អ្នកប្រើប្រាស់ (User ID):</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={newUserId}
                    onChange={(e) => setNewUserId(e.target.value.toUpperCase())}
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 font-mono font-bold text-amber-300 focus:outline-none focus:border-amber-400 uppercase"
                    placeholder="ឧទាហរណ៍: MST_002 ឬ USR_889"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const prefix = newUserRole === 'MASTER' ? 'MST_' : newUserRole === 'AGENT' ? 'AGT_' : 'USR_';
                      setNewUserId(`${prefix}${Math.floor(1000 + Math.random() * 9000)}`);
                    }}
                    className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                  >
                    🎲
                  </button>
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block font-bold text-slate-300 mb-1">ពាក្យសម្ងាត់ (Password - Admin កំណត់):</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 font-mono text-white focus:outline-none focus:border-amber-400"
                    placeholder="123456"
                  />
                  <button
                    type="button"
                    onClick={() => setNewUserPassword(String(Math.floor(100000 + Math.random() * 900000)))}
                    className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs"
                    title="បង្កើតពាក្យសម្ងាត់ចៃដន្យ"
                  >
                    🎲 ចៃដន្យ
                  </button>
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block font-bold text-slate-300 mb-1">ឈ្មោះបង្ហាញ (Full Name / Label):</label>
                <input
                  type="text"
                  required
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  placeholder="ឈ្មោះអ្នកប្រើ ឬ សាខា"
                />
              </div>

              {/* Initial Balance */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">សមតុល្យដំបូង (Initial Balance):</label>
                  <input
                    type="number"
                    value={newUserBalance}
                    onChange={(e) => setNewUserBalance(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 font-mono text-emerald-400 font-bold focus:outline-none focus:border-amber-400"
                    placeholder="500000"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">កម្រិតឥណទាន (Credit Limit):</label>
                  <input
                    type="number"
                    value={newUserCredit}
                    onChange={(e) => setNewUserCredit(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 font-mono text-white focus:outline-none focus:border-amber-400"
                    placeholder="2000000"
                  />
                </div>
              </div>

              {/* Phone & Commission */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">លេខទូរស័ព្ទ (Phone):</label>
                  <input
                    type="text"
                    value={newUserPhone}
                    onChange={(e) => setNewUserPhone(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
                    placeholder="012 345 678"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">កម្រៃជើងសារ % (Commission):</label>
                  <input
                    type="number"
                    value={newUserCommission}
                    onChange={(e) => setNewUserCommission(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 font-mono text-amber-300 focus:outline-none"
                    placeholder="5"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black shadow-md"
                >
                  + បង្កើតគណនី
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: EDIT USER BALANCE
         ========================================================================= */}
      {balanceEditUser && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-sm w-full shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-amber-400" />
                <h3 className="font-black text-white text-base">កែប្រែសមតុល្យគណនី</h3>
              </div>
              <button
                onClick={() => setBalanceEditUser(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="text-xs space-y-3">
              <div className="bg-slate-800 p-3 rounded-xl border border-slate-700">
                <div className="text-slate-400">ID អ្នកប្រើ: <span className="font-mono font-bold text-amber-300">{balanceEditUser.id}</span></div>
                <div className="text-white font-semibold">{balanceEditUser.name}</div>
                <div className="text-slate-400 mt-1">
                  សមតុល្យបច្ចុប្បន្ន: <span className="font-mono font-black text-emerald-400">{formatKHR(balanceEditUser.balance)}</span>
                </div>
              </div>

              {/* Adjustment type */}
              <div>
                <label className="block font-bold text-slate-300 mb-1">ប្រភេទប្រតិបត្តិការ:</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setBalanceAdjustmentType('ADD')}
                    className={`py-1.5 rounded-lg font-bold border transition-all ${
                      balanceAdjustmentType === 'ADD'
                        ? 'bg-emerald-600 text-white border-emerald-400'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    + ដាក់ប្រាក់
                  </button>
                  <button
                    type="button"
                    onClick={() => setBalanceAdjustmentType('SUBTRACT')}
                    className={`py-1.5 rounded-lg font-bold border transition-all ${
                      balanceAdjustmentType === 'SUBTRACT'
                        ? 'bg-rose-600 text-white border-rose-400'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    - ដកប្រាក់
                  </button>
                  <button
                    type="button"
                    onClick={() => setBalanceAdjustmentType('SET')}
                    className={`py-1.5 rounded-lg font-bold border transition-all ${
                      balanceAdjustmentType === 'SET'
                        ? 'bg-amber-500 text-slate-950 border-amber-300'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    = កំណត់ផ្ទាល់
                  </button>
                </div>
              </div>

              {/* Amount input */}
              <div>
                <label className="block font-bold text-slate-300 mb-1">ចំនួនទឹកប្រាក់ (KHR):</label>
                <input
                  type="number"
                  value={balanceAdjustmentAmount}
                  onChange={(e) => setBalanceAdjustmentAmount(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 font-mono font-black text-base text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {['50000', '100000', '500000', '1000000'].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setBalanceAdjustmentAmount(amt)}
                    className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-mono text-[11px]"
                  >
                    +{parseInt(amt, 10).toLocaleString()}៛
                  </button>
                ))}
              </div>

              {/* Action buttons */}
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setBalanceEditUser(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  បោះបង់
                </button>
                <button
                  type="button"
                  onClick={handleSaveBalanceAdjustment}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-black shadow-md"
                >
                  បញ្ជាក់ការកែប្រែ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: EDIT USER PASSWORD
         ========================================================================= */}
      {passwordEditUser && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-sm w-full shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-amber-400" />
                <h3 className="font-black text-white text-base">កែប្រែពាក្យសម្ងាត់ (Password Control)</h3>
              </div>
              <button
                onClick={() => setPasswordEditUser(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="text-xs space-y-3">
              <div className="bg-slate-800 p-3 rounded-xl border border-slate-700">
                <div className="text-slate-400">ID អ្នកប្រើ: <span className="font-mono font-bold text-amber-300">{passwordEditUser.id}</span></div>
                <div className="text-white font-semibold">{passwordEditUser.name}</div>
                <div className="text-slate-400 mt-1">
                  ពាក្យសម្ងាត់បច្ចុប្បន្ន: <span className="font-mono font-bold text-slate-300">{passwordEditUser.password || '123456'}</span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">ពាក្យសម្ងាត់ថ្មី (New Password):</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={passwordEditValue}
                    onChange={(e) => setPasswordEditValue(e.target.value)}
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 font-mono text-white focus:outline-none focus:border-amber-400 text-sm"
                    placeholder="បញ្ចូលពាក្យសម្ងាត់ថ្មី"
                  />
                  <button
                    type="button"
                    onClick={() => setPasswordEditValue(String(Math.floor(100000 + Math.random() * 900000)))}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 text-xs"
                    title="បង្កើតពាក្យសម្ងាត់ចៃដន្យ"
                  >
                    🎲 ចៃដន្យ
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setPasswordEditUser(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  បោះបង់
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (onUpdateUserPassword && passwordEditValue.trim()) {
                      sound.playClick();
                      onUpdateUserPassword(passwordEditUser.id, passwordEditValue.trim());
                    }
                    setPasswordEditUser(null);
                  }}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black shadow-md"
                >
                  រក្សាទុកពាក្យសម្ងាត់
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
