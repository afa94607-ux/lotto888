import React, { useState, useEffect } from 'react';
import { AdminPanel } from './components/AdminPanel';
import { AdminLogin } from './components/AdminLogin';
import {
  ChannelLetter,
  RoundResult,
  BetTicket,
  AppUser,
  SystemConfig,
} from './types/lottery';
import {
  INITIAL_PAST_ROUNDS,
  INITIAL_USERS,
  DEFAULT_SYSTEM_CONFIG,
  getRandomLotteryNumber,
  padNumber,
} from './utils/formatters';
import { sound } from './utils/audio';

const STORAGE_KEY_BALANCE = 'thai_samnang_balance_v1';
const STORAGE_KEY_TICKETS = 'thai_samnang_tickets_v1';
const STORAGE_KEY_ROUNDS = 'thai_samnang_rounds_v2';
const STORAGE_KEY_USERS = 'thai_samnang_users_v2';
const STORAGE_KEY_ACTIVE_USER = 'thai_samnang_active_user_v1';
const STORAGE_KEY_SYSTEM_CONFIG = 'thai_samnang_system_config_v2';
const STORAGE_KEY_FORCED_NUMBERS = 'thai_samnang_forced_numbers_v2';
const STORAGE_KEY_DRAW_TRIGGER = 'thai_samnang_draw_trigger_v2';
const STORAGE_KEY_ADMIN_SESSION = 'thai_samnang_admin_session_v3';

const parseNextRoundNumber = (rounds: RoundResult[]): number => {
  if (!rounds || rounds.length === 0) return 149;
  const top = rounds[0].roundId;
  const m = top.match(/#(\d+)/);
  if (m) {
    return parseInt(m[1], 10) + 1;
  }
  return 149;
};

export default function App() {
  // Admin Session
  const [adminSession, setAdminSession] = useState<AppUser | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_ADMIN_SESSION);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return null;
  });

  // Users & Master Accounts
  const [users, setUsers] = useState<AppUser[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_USERS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {}
    }
    return INITIAL_USERS;
  });

  // Active User ID selected in admin
  const [activeUserId, setActiveUserId] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_ACTIVE_USER);
    return saved || 'AADPDPP001';
  });

  // System Configuration (Odds, Timer, Limits)
  const [systemConfig, setSystemConfig] = useState<SystemConfig>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_SYSTEM_CONFIG);
    if (saved) {
      try {
        return { ...DEFAULT_SYSTEM_CONFIG, ...JSON.parse(saved) };
      } catch {}
    }
    return DEFAULT_SYSTEM_CONFIG;
  });

  // Forced / Preset Next Numbers
  const [forcedNextNumbers, setForcedNextNumbers] = useState<Record<ChannelLetter, string> | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_FORCED_NUMBERS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return null;
  });

  // History & Rounds
  const [pastRounds, setPastRounds] = useState<RoundResult[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_ROUNDS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch {}
    }
    return INITIAL_PAST_ROUNDS;
  });

  // User Tickets
  const [userTickets, setUserTickets] = useState<BetTicket[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_TICKETS);
    return saved ? JSON.parse(saved) : [];
  });

  // Current Round & Countdown
  const [currentRoundNumber, setCurrentRoundNumber] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_ROUNDS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parseNextRoundNumber(parsed);
      } catch {}
    }
    return parseNextRoundNumber(INITIAL_PAST_ROUNDS);
  });

  const currentRoundId = `26292#${currentRoundNumber}`;
  const [countdownSeconds, setCountdownSeconds] = useState(136);

  // Sync state to LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_ACTIVE_USER, activeUserId);
  }, [activeUserId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_TICKETS, JSON.stringify(userTickets));
  }, [userTickets]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_ROUNDS, JSON.stringify(pastRounds));
  }, [pastRounds]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SYSTEM_CONFIG, JSON.stringify(systemConfig));
  }, [systemConfig]);

  useEffect(() => {
    if (forcedNextNumbers) {
      localStorage.setItem(STORAGE_KEY_FORCED_NUMBERS, JSON.stringify(forcedNextNumbers));
    } else {
      localStorage.removeItem(STORAGE_KEY_FORCED_NUMBERS);
    }
  }, [forcedNextNumbers]);

  // Cross-Tab Synchronization
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (!e.key) return;
      if (e.key === STORAGE_KEY_USERS && e.newValue) {
        try {
          setUsers(JSON.parse(e.newValue));
        } catch {}
      } else if (e.key === STORAGE_KEY_TICKETS && e.newValue) {
        try {
          setUserTickets(JSON.parse(e.newValue));
        } catch {}
      } else if (e.key === STORAGE_KEY_ROUNDS && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          setPastRounds(parsed);
          setCurrentRoundNumber(parseNextRoundNumber(parsed));
        } catch {}
      } else if (e.key === STORAGE_KEY_SYSTEM_CONFIG && e.newValue) {
        try {
          setSystemConfig(JSON.parse(e.newValue));
        } catch {}
      } else if (e.key === STORAGE_KEY_FORCED_NUMBERS) {
        try {
          setForcedNextNumbers(e.newValue ? JSON.parse(e.newValue) : null);
        } catch {}
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Countdown timer in admin
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdownSeconds((prev) => {
        if (prev <= 1) {
          triggerDraw();
          return systemConfig.drawIntervalSeconds;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [systemConfig.drawIntervalSeconds]);

  // Trigger draw action
  const triggerDraw = () => {
    sound.playResultIncoming();
    const winningNumbers: Record<ChannelLetter, string> = {
      A: forcedNextNumbers?.A || getRandomLotteryNumber(),
      B: forcedNextNumbers?.B || getRandomLotteryNumber(),
      C: forcedNextNumbers?.C || getRandomLotteryNumber(),
      D: forcedNextNumbers?.D || getRandomLotteryNumber(),
      E: forcedNextNumbers?.E || getRandomLotteryNumber(),
    };

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const dateStr = `${String(now.getDate()).padStart(2, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()}`;

    const newResult: RoundResult = {
      roundId: currentRoundId,
      drawTime: timeStr,
      date: dateStr,
      numbers: winningNumbers,
      timestamp: Date.now(),
    };

    // Calculate payouts for all pending tickets
    let totalWonSum = 0;
    const updatedTickets = userTickets.map((t) => {
      if (t.roundId !== currentRoundId || t.status !== 'PENDING') return t;
      const hits: Array<{ channel: ChannelLetter; number: string; winAmount: number }> = [];
      let wonSum = 0;
      t.channels.forEach((ch) => {
        const drawnNum = winningNumbers[ch];
        if (t.numbers.includes(drawnNum)) {
          const winPrize = t.stakePerUnit * systemConfig.payoutRate;
          hits.push({ channel: ch, number: drawnNum, winAmount: winPrize });
          wonSum += winPrize;
        }
      });

      if (hits.length > 0) {
        totalWonSum += wonSum;
        return {
          ...t,
          status: 'WON' as const,
          wonAmount: wonSum,
          winningHits: hits,
        };
      } else {
        return {
          ...t,
          status: 'LOST' as const,
          wonAmount: 0,
          winningHits: [],
        };
      }
    });

    setUserTickets(updatedTickets);
    setPastRounds((prev) => [newResult, ...prev]);
    setCurrentRoundNumber((prev) => prev + 1);
    setForcedNextNumbers(null);
    localStorage.removeItem(STORAGE_KEY_FORCED_NUMBERS);
    localStorage.setItem(STORAGE_KEY_DRAW_TRIGGER, Date.now().toString());
  };

  // Admin Login/Logout
  const handleAdminLogin = (user: AppUser) => {
    setAdminSession(user);
    localStorage.setItem(STORAGE_KEY_ADMIN_SESSION, JSON.stringify(user));
  };

  const handleAdminLogout = () => {
    setAdminSession(null);
    localStorage.removeItem(STORAGE_KEY_ADMIN_SESSION);
  };

  // User management
  const handleAddUser = (userData: Omit<AppUser, 'createdAt'>) => {
    sound.playCash();
    const newUser: AppUser = {
      ...userData,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setUsers((prev) => [newUser, ...prev]);
  };

  const handleUpdateUserBalance = (userId: string, newBalance: number) => {
    sound.playCash();
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, balance: Math.max(0, newBalance) } : u))
    );
  };

  const handleUpdateUserPassword = (userId: string, newPass: string) => {
    sound.playClick();
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, password: newPass } : u))
    );
  };

  const handleToggleUserStatus = (userId: string) => {
    sound.playClick();
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? { ...u, status: u.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE' }
          : u
      )
    );
  };

  const handleDeleteUser = (userId: string) => {
    sound.playClick();
    setUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  const handleUpdateTicketStatus = (ticketId: string, status: 'WON' | 'LOST', wonAmount?: number) => {
    sound.playClick();
    setUserTickets((prev) =>
      prev.map((t) =>
        t.ticketId === ticketId
          ? {
              ...t,
              status,
              wonAmount: wonAmount !== undefined ? wonAmount : status === 'WON' ? t.wonAmount || 91000 : 0,
            }
          : t
      )
    );
  };

  const handleVoidTicket = (ticketId: string) => {
    sound.playClick();
    const ticket = userTickets.find((t) => t.ticketId === ticketId);
    if (!ticket) return;

    if (ticket.userId) {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === ticket.userId ? { ...u, balance: u.balance + ticket.totalCost } : u
        )
      );
    }
    setUserTickets((prev) => prev.filter((t) => t.ticketId !== ticketId));
  };

  const handleClearUserTickets = () => {
    sound.playClick();
    setUserTickets([]);
  };

  const handleDeleteRound = (roundId: string) => {
    sound.playClick();
    setPastRounds((prev) => prev.filter((r) => r.roundId !== roundId));
  };

  const handleResetHistory = () => {
    sound.playClick();
    setPastRounds(INITIAL_PAST_ROUNDS);
    setCurrentRoundNumber(parseNextRoundNumber(INITIAL_PAST_ROUNDS));
  };

  // Open Game in external window
  const handleOpenGame = () => {
    sound.playClick();
    window.open('https://lottery888.win/', '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-amber-500 selection:text-slate-950">
      {!adminSession ? (
        <AdminLogin
          users={users}
          onLogin={handleAdminLogin}
          onOpenPlayerPortal={handleOpenGame}
        />
      ) : (
        <AdminPanel
          currentRoundId={currentRoundId}
          countdownSeconds={countdownSeconds}
          adminUser={adminSession}
          onLogoutAdmin={handleAdminLogout}
          users={users}
          onAddUser={handleAddUser}
          onUpdateUserBalance={handleUpdateUserBalance}
          onUpdateUserPassword={handleUpdateUserPassword}
          onToggleUserStatus={handleToggleUserStatus}
          onDeleteUser={handleDeleteUser}
          activeUserId={activeUserId}
          onSetActiveUser={setActiveUserId}
          userTickets={userTickets}
          onUpdateTicketStatus={handleUpdateTicketStatus}
          onVoidTicket={handleVoidTicket}
          onClearUserTickets={handleClearUserTickets}
          systemConfig={systemConfig}
          onUpdateSystemConfig={(cfg) => setSystemConfig((prev) => ({ ...prev, ...cfg }))}
          forcedNextNumbers={forcedNextNumbers}
          onSetForcedNextNumbers={setForcedNextNumbers}
          onTriggerDraw={triggerDraw}
          pastRounds={pastRounds}
          onDeleteRound={handleDeleteRound}
          onResetHistory={handleResetHistory}
          onOpenGameInNewTab={handleOpenGame}
        />
      )}
    </div>
  );
}
