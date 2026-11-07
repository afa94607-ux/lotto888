/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Header } from './components/Header';
import { LiveDrawBillboard } from './components/LiveDrawBillboard';
import { NumberGrid } from './components/NumberGrid';
import { BettingPanel } from './components/BettingPanel';
import { UserSidebar } from './components/UserSidebar';
import { PrintReceiptModal } from './components/PrintReceiptModal';
import { WinLossView } from './components/WinLossView';
import { ResultsArchiveView } from './components/ResultsArchiveView';
import { DepositModal } from './components/DepositModal';
import { PlayerLogin } from './components/PlayerLogin';
import {
  ChannelLetter,
  RoundResult,
  BetTicket,
  SelectionMode,
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
import { announceKhmerDraw } from './utils/khmerVoice';

const STORAGE_KEY_BALANCE = 'thai_samnang_balance_v1';
const STORAGE_KEY_TICKETS = 'thai_samnang_tickets_v1';
const STORAGE_KEY_ROUNDS = 'thai_samnang_rounds_v2';
const STORAGE_KEY_USERS = 'thai_samnang_users_v2';
const STORAGE_KEY_ACTIVE_USER = 'thai_samnang_active_user_v1';
const STORAGE_KEY_SYSTEM_CONFIG = 'thai_samnang_system_config_v2';
const STORAGE_KEY_FORCED_NUMBERS = 'thai_samnang_forced_numbers_v2';
const STORAGE_KEY_DRAW_TRIGGER = 'thai_samnang_draw_trigger_v2';
const STORAGE_KEY_PLAYER_SESSION = 'thai_samnang_player_session_v3';

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
  // Client Platform Navigation (when viewing the player game platform)
  const [currentTab, setCurrentTab] = useState<'home' | 'winloss' | 'results'>('home');

  // Audio & Turbo
  const [isMuted, setIsMuted] = useState(false);
  const [isTurbo, setIsTurbo] = useState(false);

  // Users & Master Accounts
  const [users, setUsers] = useState<AppUser[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_USERS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {
        // fallback
      }
    }
    return INITIAL_USERS;
  });

  // Player Session: Authenticated player on the game platform (null = show PlayerLogin)
  const [playerSession, setPlayerSession] = useState<AppUser | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PLAYER_SESSION);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return null;
  });

  // Active User ID
  const [activeUserId, setActiveUserId] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_ACTIVE_USER);
    return saved || 'AADPDPP001';
  });

  const currentDate = '2026-10-19';

  // Balance (tied to active user)
  const [balance, setBalance] = useState<number>(() => {
    const savedUsers = localStorage.getItem(STORAGE_KEY_USERS);
    const active = localStorage.getItem(STORAGE_KEY_ACTIVE_USER) || 'AADPDPP001';
    if (savedUsers) {
      try {
        const parsed: AppUser[] = JSON.parse(savedUsers);
        const u = parsed.find((usr) => usr.id === active);
        if (u) return u.balance;
      } catch {
        // fallback
      }
    }
    const savedBal = localStorage.getItem(STORAGE_KEY_BALANCE);
    return savedBal ? parseInt(savedBal, 10) : 321500;
  });

  // Player Login & Logout Handlers
  const handlePlayerLogin = (user: AppUser) => {
    setPlayerSession(user);
    setActiveUserId(user.id);
    setBalance(user.balance);
    localStorage.setItem(STORAGE_KEY_PLAYER_SESSION, JSON.stringify(user));
    localStorage.setItem(STORAGE_KEY_ACTIVE_USER, user.id);
  };

  const handlePlayerLogout = () => {
    sound.playClick();
    setPlayerSession(null);
    localStorage.removeItem(STORAGE_KEY_PLAYER_SESSION);
    setCurrentTab('home');
  };

  // Keep playerSession synchronized if admin edits their balance, status, or password
  useEffect(() => {
    if (playerSession) {
      const latest = users.find((u) => u.id === playerSession.id);
      if (latest) {
        if (latest.status === 'SUSPENDED') {
          handlePlayerLogout();
        } else {
          setPlayerSession(latest);
          setBalance(latest.balance);
        }
      }
    }
  }, [users]);

  // System Configuration (Odds, Timer, Limits)
  const [systemConfig, setSystemConfig] = useState<SystemConfig>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_SYSTEM_CONFIG);
    if (saved) {
      try {
        return { ...DEFAULT_SYSTEM_CONFIG, ...JSON.parse(saved) };
      } catch {
        // fallback
      }
    }
    return DEFAULT_SYSTEM_CONFIG;
  });

  // Forced / Preset Next Numbers
  const [forcedNextNumbers, setForcedNextNumbers] = useState<Record<ChannelLetter, string> | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_FORCED_NUMBERS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
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
      } catch {
        // fallback
      }
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
      } catch {
        // fallback
      }
    }
    return parseNextRoundNumber(INITIAL_PAST_ROUNDS);
  });

  const currentRoundId = `26292#${currentRoundNumber}`;
  const [countdownSeconds, setCountdownSeconds] = useState(136);

  // Draw Machine State
  const [isDrawing, setIsDrawing] = useState(false);
  const [rollingNumbers, setRollingNumbers] = useState<Record<ChannelLetter, string>>(() => {
    return pastRounds[0]?.numbers || INITIAL_PAST_ROUNDS[0].numbers;
  });
  const [revealedChannels, setRevealedChannels] = useState<Record<ChannelLetter, boolean>>({
    A: true,
    B: true,
    C: true,
    D: true,
    E: true,
  });

  // Betting Board Selections
  const [selectionMode, setSelectionMode] = useState<SelectionMode>('NUMBER');
  const [selectedChannels, setSelectedChannels] = useState<ChannelLetter[]>(['A', 'B', 'C', 'D', 'E']);
  const [selectedNumbers, setSelectedNumbers] = useState<string[]>(['42']);
  const [stakePerUnit, setStakePerUnit] = useState<number>(1000);
  const [lastSubmittedBet, setLastSubmittedBet] = useState<{
    channels: ChannelLetter[];
    numbers: string[];
    stake: number;
  } | null>(null);

  // Modals & Feedback
  const [activeReceiptTicket, setActiveReceiptTicket] = useState<BetTicket | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [winNotification, setWinNotification] = useState<string | null>(null);
  const [liveAnnouncement, setLiveAnnouncement] = useState<string | null>(null);

  // Persist State to LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_ACTIVE_USER, activeUserId);
  }, [activeUserId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_BALANCE, balance.toString());
  }, [balance]);

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

  // Keep balance in sync with active user in users list
  const updateBalanceForActiveUser = (newBal: number) => {
    setBalance(newBal);
    setUsers((prev) =>
      prev.map((u) => (u.id === activeUserId ? { ...u, balance: newBal } : u))
    );
  };

  // Cross-Tab Synchronization (Broadcast real-time actions between Game Tab and Admin Tab)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (!e.key) return;

      if (e.key === STORAGE_KEY_DRAW_TRIGGER && e.newValue) {
        // Admin clicked "Draw Now" in the admin tab -> trigger draw in game tab!
        if (!isDrawing) {
          triggerDraw();
        }
      } else if (e.key === STORAGE_KEY_USERS && e.newValue) {
        try {
          const updatedUsers: AppUser[] = JSON.parse(e.newValue);
          setUsers(updatedUsers);
          const active = updatedUsers.find((u) => u.id === activeUserId);
          if (active) setBalance(active.balance);
        } catch {
          // ignore
        }
      } else if (e.key === STORAGE_KEY_TICKETS && e.newValue) {
        try {
          setUserTickets(JSON.parse(e.newValue));
        } catch {
          // ignore
        }
      } else if (e.key === STORAGE_KEY_ROUNDS && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          setPastRounds(parsed);
          setCurrentRoundNumber(parseNextRoundNumber(parsed));
        } catch {
          // ignore
        }
      } else if (e.key === STORAGE_KEY_SYSTEM_CONFIG && e.newValue) {
        try {
          setSystemConfig(JSON.parse(e.newValue));
        } catch {
          // ignore
        }
      } else if (e.key === STORAGE_KEY_FORCED_NUMBERS) {
        if (e.newValue) {
          try {
            setForcedNextNumbers(JSON.parse(e.newValue));
          } catch {
            // ignore
          }
        } else {
          setForcedNextNumbers(null);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [isDrawing, activeUserId]);



  // Sound mute toggle
  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    sound.setMuted(next);
  };

  // Turbo toggle
  const toggleTurbo = () => {
    const next = !isTurbo;
    setIsTurbo(next);
    if (next && countdownSeconds > 15) {
      setCountdownSeconds(15);
    }
  };

  // In-play wagers calculation (tickets pending for current round)
  const inPlayBet = userTickets
    .filter((t) => t.roundId === currentRoundId && t.status === 'PENDING')
    .reduce((acc, t) => acc + t.totalCost, 0);

  // Countdown Timer Hook
  useEffect(() => {
    if (isDrawing) return;

    const timer = setInterval(() => {
      setCountdownSeconds((prev) => {
        if (prev <= 1) {
          triggerDraw();
          return isTurbo ? 15 : systemConfig.drawIntervalSeconds;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isDrawing, isTurbo, currentRoundId, systemConfig.drawIntervalSeconds]);

  // Execute Draw Sequence
  const triggerDraw = () => {
    if (isDrawing) return;
    setIsDrawing(true);
    setWinNotification(null);
    setLiveAnnouncement('ចាប់ផ្តើមចេញលទ្ធផល...');
    sound.playResultIncoming();

    // Notify other tabs via storage trigger
    localStorage.setItem(STORAGE_KEY_DRAW_TRIGGER, Date.now().toString());

    // Initial shuffle states
    setRevealedChannels({
      A: false,
      B: false,
      C: false,
      D: false,
      E: false,
    });

    // Pick final outcome numbers (uses forced numbers if preset by admin)
    const targetNumbers: Record<ChannelLetter, string> = forcedNextNumbers || {
      A: getRandomLotteryNumber(),
      B: getRandomLotteryNumber(),
      C: getRandomLotteryNumber(),
      D: getRandomLotteryNumber(),
      E: getRandomLotteryNumber(),
    };

    const revealedMap: Record<ChannelLetter, boolean> = {
      A: false,
      B: false,
      C: false,
      D: false,
      E: false,
    };

    // Slot reel spinning interval
    const rollInterval = setInterval(() => {
      sound.playReelTick();
      setRollingNumbers({
        A: revealedMap.A ? targetNumbers.A : padNumber(Math.floor(Math.random() * 99) + 1),
        B: revealedMap.B ? targetNumbers.B : padNumber(Math.floor(Math.random() * 99) + 1),
        C: revealedMap.C ? targetNumbers.C : padNumber(Math.floor(Math.random() * 99) + 1),
        D: revealedMap.D ? targetNumbers.D : padNumber(Math.floor(Math.random() * 99) + 1),
        E: revealedMap.E ? targetNumbers.E : padNumber(Math.floor(Math.random() * 99) + 1),
      });
    }, 80);

    const channels: ChannelLetter[] = ['A', 'B', 'C', 'D', 'E'];
    const channelKhmerNames: Record<ChannelLetter, string> = {
      A: 'ប៉ុស្តិ៍ អេ (A)',
      B: 'ប៉ុស្តិ៍ ប៊ី (B)',
      C: 'ប៉ុស្តិ៍ ស៊ី (C)',
      D: 'ប៉ុស្តិ៍ ឌី (D)',
      E: 'ប៉ុស្តិ៍ អ៊ី (E)',
    };

    channels.forEach((ch, idx) => {
      setTimeout(() => {
        revealedMap[ch] = true;
        setRevealedChannels((prev) => ({ ...prev, [ch]: true }));
        setRollingNumbers((prev) => ({ ...prev, [ch]: targetNumbers[ch] }));
        sound.playChannelReveal(ch);
        setLiveAnnouncement(`${channelKhmerNames[ch]} លេខ ${targetNumbers[ch]}`);
        announceKhmerDraw(ch, targetNumbers[ch], isMuted);

        // When all 5 channels finish:
        if (idx === channels.length - 1) {
          clearInterval(rollInterval);
          finalizeDraw(targetNumbers);
        }
      }, 1000 + idx * 1100);
    });
  };

  // Finalize Draw Outcomes & Resolve Wagers
  const finalizeDraw = (winningNumbers: Record<ChannelLetter, string>) => {
    setIsDrawing(false);
    setLiveAnnouncement(null);

    // Clear one-time forced numbers if any
    setForcedNextNumbers(null);
    localStorage.removeItem(STORAGE_KEY_FORCED_NUMBERS);

    // Create New Completed Round Record
    const now = new Date();
    const drawTime = `${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}`;
    const newRound: RoundResult = {
      roundId: currentRoundId,
      drawTime,
      date: currentDate,
      numbers: winningNumbers,
      timestamp: Date.now(),
    };

    const nextRounds = [newRound, ...pastRounds];
    setPastRounds(nextRounds);
    localStorage.setItem(STORAGE_KEY_ROUNDS, JSON.stringify(nextRounds));

    // Next round setup
    const nextRoundNum = currentRoundNumber + 1;
    setCurrentRoundNumber(nextRoundNum);
    setCountdownSeconds(isTurbo ? 15 : systemConfig.drawIntervalSeconds);

    // Resolve Player Bets
    let totalWonThisRound = 0;
    const updatedTickets = userTickets.map((ticket) => {
      if (ticket.roundId === currentRoundId && ticket.status === 'PENDING') {
        const hits: Array<{ channel: ChannelLetter; number: string; winAmount: number }> = [];

        ticket.channels.forEach((channel) => {
          const outcomeNum = winningNumbers[channel];
          if (ticket.numbers.includes(outcomeNum)) {
            const winAmt = ticket.stakePerUnit * systemConfig.payoutRate;
            hits.push({
              channel,
              number: outcomeNum,
              winAmount: winAmt,
            });
          }
        });

        const totalWonTicket = hits.reduce((sum, h) => sum + h.winAmount, 0);
        if (totalWonTicket > 0) {
          totalWonThisRound += totalWonTicket;
          return {
            ...ticket,
            status: 'WON' as const,
            wonAmount: totalWonTicket,
            winningHits: hits,
          };
        } else {
          return {
            ...ticket,
            status: 'LOST' as const,
            wonAmount: 0,
            winningHits: [],
          };
        }
      }
      return ticket;
    });

    setUserTickets(updatedTickets);
    localStorage.setItem(STORAGE_KEY_TICKETS, JSON.stringify(updatedTickets));

    // Credit Winnings
    if (totalWonThisRound > 0) {
      sound.playWin();
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });
      setWinNotification(`អបអរសាទរ! អ្នកបានឈ្នះរង្វាន់ចំនួន +${totalWonThisRound.toLocaleString()}៛`);
      setBalance((b) => {
        const nextBal = b + totalWonThisRound;
        setUsers((prev) =>
          prev.map((u) => (u.id === activeUserId ? { ...u, balance: nextBal } : u))
        );
        return nextBal;
      });
    }
  };

  // Delete a specific round from history
  const handleDeleteRound = (roundId: string) => {
    sound.playClick();
    const filtered = pastRounds.filter((r) => r.roundId !== roundId);
    setPastRounds(filtered);
    localStorage.setItem(STORAGE_KEY_ROUNDS, JSON.stringify(filtered));
  };

  // Reset round history to default
  const handleResetHistory = () => {
    setPastRounds(INITIAL_PAST_ROUNDS);
    setCurrentRoundNumber(parseNextRoundNumber(INITIAL_PAST_ROUNDS));
    setRollingNumbers(INITIAL_PAST_ROUNDS[0].numbers);
    localStorage.setItem(STORAGE_KEY_ROUNDS, JSON.stringify(INITIAL_PAST_ROUNDS));
  };

  // Void a ticket from Admin and refund stake
  const handleVoidTicket = (ticketId: string) => {
    const ticket = userTickets.find((t) => t.ticketId === ticketId);
    if (!ticket) return;

    sound.playCash();
    const refundUser = ticket.userId || activeUserId;
    const cost = ticket.totalCost;

    setUsers((prev) =>
      prev.map((u) => (u.id === refundUser ? { ...u, balance: u.balance + cost } : u))
    );

    if (refundUser === activeUserId) {
      setBalance((b) => b + cost);
    }

    setUserTickets((prev) => prev.filter((t) => t.ticketId !== ticketId));
  };

  // Update Ticket Status manually from Admin
  const handleUpdateTicketStatus = (
    ticketId: string,
    status: 'WON' | 'LOST',
    wonAmount: number = 0
  ) => {
    sound.playClick();
    setUserTickets((prev) =>
      prev.map((t) => {
        if (t.ticketId !== ticketId) return t;
        const diff = wonAmount - t.wonAmount;
        if (diff !== 0) {
          const owner = t.userId || activeUserId;
          setUsers((uPrev) =>
            uPrev.map((u) => (u.id === owner ? { ...u, balance: Math.max(0, u.balance + diff) } : u))
          );
          if (owner === activeUserId) {
            setBalance((b) => Math.max(0, b + diff));
          }
        }
        return {
          ...t,
          status,
          wonAmount,
        };
      })
    );
  };

  // Clear user tickets
  const handleClearUserTickets = () => {
    setUserTickets([]);
    localStorage.removeItem(STORAGE_KEY_TICKETS);
  };

  // User Management Handlers
  const handleAddUser = (newUserData: Omit<AppUser, 'createdAt'>) => {
    const now = new Date();
    const newUser: AppUser = {
      ...newUserData,
      createdAt: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
        now.getDate()
      ).padStart(2, '0')}`,
    };
    setUsers((prev) => [newUser, ...prev]);
  };

  const handleUpdateUserBalance = (userId: string, newBal: number) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, balance: newBal } : u))
    );
    if (userId === activeUserId) {
      setBalance(newBal);
    }
  };

  const handleUpdateUserPassword = (userId: string, newPass: string) => {
    sound.playClick();
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, password: newPass } : u))
    );
    if (playerSession && playerSession.id === userId) {
      setPlayerSession((prev) => (prev ? { ...prev, password: newPass } : null));
    }
  };

  const handleToggleUserStatus = (userId: string) => {
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
    if (activeUserId === userId) {
      const remaining = users.filter((u) => u.id !== userId);
      if (remaining.length > 0) {
        setActiveUserId(remaining[0].id);
        setBalance(remaining[0].balance);
      }
    }
  };

  const handleSetActiveUser = (userId: string) => {
    setActiveUserId(userId);
    const u = users.find((usr) => usr.id === userId);
    if (u) {
      setBalance(u.balance);
    }
  };

  // Channel toggling
  const toggleChannel = (channel: ChannelLetter) => {
    setSelectedChannels((prev) =>
      prev.includes(channel) ? prev.filter((c) => c !== channel) : [...prev, channel]
    );
  };

  const selectAllChannels = () => {
    if (selectedChannels.length === 5) {
      setSelectedChannels([]);
    } else {
      setSelectedChannels(['A', 'B', 'C', 'D', 'E']);
    }
  };

  // Number selection
  const toggleNumber = (num: string) => {
    setSelectedNumbers((prev) =>
      prev.includes(num) ? prev.filter((n) => n !== num) : [...prev, num]
    );
  };

  const selectMultipleNumbers = (nums: string[]) => {
    setSelectedNumbers(nums);
  };

  const clearNumbers = () => {
    setSelectedNumbers([]);
  };

  // Submit Bet Handler (places wager as activeUserId)
  const handleSubmitBet = () => {
    if (!systemConfig.isSystemOpen) {
      alert('ប្រព័ន្ធឆ្នោតកំពុងត្រូវបានផ្អាកជាបណ្ដោះអាសន្ន!');
      return;
    }

    const totalBets = selectedChannels.length * selectedNumbers.length;
    const totalCost = totalBets * stakePerUnit;

    if (totalBets === 0 || stakePerUnit <= 0) return;
    if (totalCost > balance) return;

    sound.playCash();

    // Deduct balance for active user
    updateBalanceForActiveUser(balance - totalCost);

    // Create Ticket tagged with activeUserId
    const ticketId = `TK-${Math.floor(10000 + Math.random() * 90000)}`;
    const now = new Date();
    const createdAt = `${currentDate} ${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}`;

    const newTicket: BetTicket = {
      ticketId,
      userId: activeUserId,
      roundId: currentRoundId,
      createdAt,
      timestamp: Date.now(),
      channels: [...selectedChannels],
      numbers: [...selectedNumbers],
      stakePerUnit,
      totalBetsCount: totalBets,
      totalCost,
      status: 'PENDING',
      wonAmount: 0,
      winningHits: [],
    };

    setUserTickets((prev) => [newTicket, ...prev]);

    // Save for repeat
    setLastSubmittedBet({
      channels: [...selectedChannels],
      numbers: [...selectedNumbers],
      stake: stakePerUnit,
    });
  };

  // Repeat previous bet
  const handleRepeatLastBet = () => {
    if (!lastSubmittedBet) return;
    sound.playSelect();
    setSelectedChannels(lastSubmittedBet.channels);
    setSelectedNumbers(lastSubmittedBet.numbers);
    setStakePerUnit(lastSubmittedBet.stake);
  };

  // Clear selections
  const handleClearAll = () => {
    sound.playClick();
    setSelectedNumbers([]);
    setStakePerUnit(0);
  };

  // View ticket slip modal
  const handleViewTicket = (ticket: BetTicket) => {
    sound.playClick();
    setActiveReceiptTicket(ticket);
    setIsPrintModalOpen(true);
  };

  // Print current active selection preview
  const handlePrintSlipPreview = () => {
    const totalBets = selectedChannels.length * selectedNumbers.length;
    const totalCost = totalBets * stakePerUnit;
    const dummyTicket: BetTicket = {
      ticketId: `TK-${Math.floor(10000 + Math.random() * 90000)}`,
      userId: activeUserId,
      roundId: currentRoundId,
      createdAt: `${currentDate} ${String(new Date().getHours()).padStart(2, '0')}:${String(
        new Date().getMinutes()
      ).padStart(2, '0')}`,
      timestamp: Date.now(),
      channels: [...selectedChannels],
      numbers: [...selectedNumbers],
      stakePerUnit,
      totalBetsCount: totalBets,
      totalCost,
      status: 'PENDING',
      wonAmount: 0,
      winningHits: [],
    };
    setActiveReceiptTicket(dummyTicket);
    setIsPrintModalOpen(true);
  };

  // Top up / deposit
  const handleDeposit = (amount: number) => {
    updateBalanceForActiveUser(balance + amount);
  };

  const handleResetBalance = () => {
    updateBalanceForActiveUser(321500);
  };

  // Previous round record
  const latestFinishedRound = pastRounds[0] || INITIAL_PAST_ROUNDS[0];

  return (
    <div className="min-h-screen flex flex-col bg-[#eef2f7]">
      {/* PURE LOTTERY GAMING PLATFORM (PLAYER VIEW) FOR https://lottery888.win/ */}
      {!playerSession ? (
        <PlayerLogin
          users={users}
          onLogin={handlePlayerLogin}
        />
      ) : (
        <div className="flex-1 flex flex-col animate-fadeIn">
          {/* Top Header Navigation - Strictly Player Lottery Experience */}
          <Header
            currentTab={currentTab}
            setCurrentTab={setCurrentTab}
            balance={balance}
            currentUserId={playerSession.id}
            currentUserName={playerSession.name}
            isMuted={isMuted}
            toggleMute={toggleMute}
            isTurbo={isTurbo}
            toggleTurbo={toggleTurbo}
            onOpenDeposit={() => setIsDepositModalOpen(true)}
            onLogout={handlePlayerLogout}
          />

            {/* Main View Area */}
            <main className="flex-1 w-full max-w-[1720px] mx-auto p-2 sm:p-4">
              {currentTab === 'home' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 items-start">
                  {/* Left Column: User Profile & Recent 3 Round Bets (Width: 2.5/12) */}
                  <aside className="lg:col-span-3 xl:col-span-2 order-2 lg:order-1">
                    <UserSidebar
                      currentDate={currentDate}
                      userId={playerSession.id}
                      balance={balance}
                      inPlayBet={inPlayBet}
                      recentTickets={userTickets}
                      onRefresh={() => {
                        sound.playClick();
                        // Re-sync balance from current active user
                        const u = users.find((usr) => usr.id === playerSession.id);
                        if (u) setBalance(u.balance);
                      }}
                      onViewTicket={handleViewTicket}
                      onLogout={handlePlayerLogout}
                    />
                  </aside>

                  {/* Middle Column: Live Game Billboard & 01-99 Number Grid (Width: 6/12) */}
                  <section className="lg:col-span-6 xl:col-span-7 flex flex-col gap-3.5 order-1 lg:order-2">
                    {/* Purple Stage Billboard with Golden Slot Machine */}
                    <LiveDrawBillboard
                      currentRoundId={currentRoundId}
                      previousRound={latestFinishedRound}
                      countdownSeconds={countdownSeconds}
                      isDrawing={isDrawing}
                      rollingNumbers={rollingNumbers}
                      revealedChannels={revealedChannels}
                      onTriggerDraw={triggerDraw}
                      winNotification={winNotification}
                      liveAnnouncement={liveAnnouncement}
                    />

                    {/* 01 to 99 Number Grid & Channel Selectors */}
                    <NumberGrid
                      selectionMode={selectionMode}
                      setSelectionMode={setSelectionMode}
                      selectedChannels={selectedChannels}
                      toggleChannel={toggleChannel}
                      selectAllChannels={selectAllChannels}
                      selectedNumbers={selectedNumbers}
                      toggleNumber={toggleNumber}
                      selectMultipleNumbers={selectMultipleNumbers}
                      clearNumbers={clearNumbers}
                    />
                  </section>

                  {/* Right Column: Bet Input, 8 Presets, 4 Buttons, Recent Results (Width: 3.5/12) */}
                  <aside className="lg:col-span-3 xl:col-span-3 order-3">
                    <BettingPanel
                      stakePerUnit={stakePerUnit}
                      setStakePerUnit={setStakePerUnit}
                      selectedChannels={selectedChannels}
                      selectedNumbers={selectedNumbers}
                      pastRounds={pastRounds}
                      onSubmitBet={handleSubmitBet}
                      onPrintSlip={handlePrintSlipPreview}
                      onClearAll={handleClearAll}
                      onRepeatLastBet={handleRepeatLastBet}
                      canRepeat={lastSubmittedBet !== null}
                      userBalance={balance}
                      isDrawing={isDrawing}
                      currentDrawingRound={
                        isDrawing
                          ? {
                              roundId: currentRoundId,
                              drawTime: `${String(new Date().getHours()).padStart(2, '0')}:${String(
                                new Date().getMinutes()
                              ).padStart(2, '0')}`,
                              numbers: rollingNumbers,
                              revealed: revealedChannels,
                            }
                          : null
                      }
                    />
                  </aside>
                </div>
              )}

              {/* Win/Loss Statement Tab */}
              {currentTab === 'winloss' && (
                <WinLossView tickets={userTickets} onViewTicket={handleViewTicket} />
              )}

              {/* Results Archive Tab */}
              {currentTab === 'results' && (
                <ResultsArchiveView
                  pastRounds={pastRounds}
                  onResetHistory={handleResetHistory}
                />
              )}
            </main>
          </div>
      )}

      {/* Printable Receipt Modal */}
      <PrintReceiptModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        ticket={activeReceiptTicket}
      />

      {/* Wallet Deposit Modal */}
      <DepositModal
        isOpen={isDepositModalOpen}
        onClose={() => setIsDepositModalOpen(false)}
        currentBalance={balance}
        onDeposit={handleDeposit}
        onReset={handleResetBalance}
      />
    </div>
  );
}
