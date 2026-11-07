export const LOTTERY_PAYOUT_RATE = 91;

export const formatKHR = (amount: number): string => {
  return new Intl.NumberFormat('en-US').format(Math.max(0, Math.round(amount))) + '៛';
};

export const formatNumberOnly = (amount: number): string => {
  return new Intl.NumberFormat('en-US').format(Math.max(0, Math.round(amount)));
};

export const formatTimer = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `00:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

export const padNumber = (num: number): string => {
  return String(num).padStart(2, '0');
};

export const getRandomLotteryNumber = (): string => {
  const n = Math.floor(Math.random() * 99) + 1; // 1 to 99
  return padNumber(n);
};

export const CHANNEL_COLORS = {
  A: {
    text: 'text-[#00e5ff]',
    bg: 'bg-cyan-500',
    border: 'border-cyan-400',
    glow: 'shadow-[0_0_12px_rgba(6,182,212,0.6)]',
    slotBg: 'bg-gradient-to-b from-white to-slate-100',
    headerBg: 'bg-gradient-to-b from-[#e52d27] to-[#b31217]',
    badgeBg: 'bg-cyan-500 text-white',
  },
  B: {
    text: 'text-[#ff1744]',
    bg: 'bg-rose-500',
    border: 'border-rose-400',
    glow: 'shadow-[0_0_12px_rgba(244,63,94,0.6)]',
    slotBg: 'bg-gradient-to-b from-white to-slate-100',
    headerBg: 'bg-gradient-to-b from-[#e52d27] to-[#b31217]',
    badgeBg: 'bg-rose-500 text-white',
  },
  C: {
    text: 'text-[#2979ff]',
    bg: 'bg-blue-600',
    border: 'border-blue-400',
    glow: 'shadow-[0_0_12px_rgba(37,99,235,0.6)]',
    slotBg: 'bg-gradient-to-b from-white to-slate-100',
    headerBg: 'bg-gradient-to-b from-[#e52d27] to-[#b31217]',
    badgeBg: 'bg-blue-600 text-white',
  },
  D: {
    text: 'text-[#ff9100]',
    bg: 'bg-amber-500',
    border: 'border-amber-400',
    glow: 'shadow-[0_0_12px_rgba(245,158,11,0.6)]',
    slotBg: 'bg-gradient-to-b from-white to-slate-100',
    headerBg: 'bg-gradient-to-b from-[#e52d27] to-[#b31217]',
    badgeBg: 'bg-amber-500 text-white',
  },
  E: {
    text: 'text-[#00e676]',
    bg: 'bg-emerald-500',
    border: 'border-emerald-400',
    glow: 'shadow-[0_0_12px_rgba(16,185,129,0.6)]',
    slotBg: 'bg-gradient-to-b from-white to-slate-100',
    headerBg: 'bg-gradient-to-b from-[#e52d27] to-[#b31217]',
    badgeBg: 'bg-emerald-500 text-white',
  },
} as const;

export const INITIAL_PAST_ROUNDS = [
  {
    roundId: '26292#148',
    drawTime: '12:58',
    date: '19-10-2026',
    numbers: { A: '48', B: '92', C: '83', D: '17', E: '28' },
    timestamp: Date.now() - 30000,
  },
  {
    roundId: '26292#147',
    drawTime: '12:58',
    date: '19-10-2026',
    numbers: { A: '89', B: '85', C: '94', D: '80', E: '97' },
    timestamp: Date.now() - 90000,
  },
  {
    roundId: '26292#146',
    drawTime: '12:58',
    date: '19-10-2026',
    numbers: { A: '20', B: '75', C: '07', D: '20', E: '57' },
    timestamp: Date.now() - 150000,
  },
  {
    roundId: '26292#145',
    drawTime: '12:57',
    date: '19-10-2026',
    numbers: { A: '10', B: '44', C: '33', D: '82', E: '61' },
    timestamp: Date.now() - 210000,
  },
  {
    roundId: '26292#144',
    drawTime: '12:52',
    date: '19-10-2026',
    numbers: { A: '42', B: '38', C: '82', D: '31', E: '49' },
    timestamp: Date.now() - 510000,
  },
  {
    roundId: '26292#143',
    drawTime: '12:47',
    date: '19-10-2026',
    numbers: { A: '10', B: '21', C: '17', D: '01', E: '58' },
    timestamp: Date.now() - 810000,
  },
  {
    roundId: '26292#142',
    drawTime: '12:42',
    date: '19-10-2026',
    numbers: { A: '02', B: '61', C: '34', D: '85', E: '47' },
    timestamp: Date.now() - 1110000,
  },
];

export const INITIAL_USERS: import('../types/lottery').AppUser[] = [
  {
    id: 'admin',
    name: 'Super Admin HQ',
    role: 'ADMIN',
    password: 'admin888',
    balance: 99999999,
    creditLimit: 99999999,
    phone: '012 999 888',
    status: 'ACTIVE',
    commissionRate: 20,
    createdAt: '2026-08-01',
    notes: 'Central Headquarters Administrator',
  },
  {
    id: 'AADPDPP001',
    name: 'Sokha Player VIP',
    role: 'MEMBER',
    password: '123456',
    masterId: 'MST_SAMNANG01',
    balance: 321500,
    creditLimit: 2000000,
    phone: '012 889 900',
    status: 'ACTIVE',
    commissionRate: 5,
    createdAt: '2026-10-15',
    notes: 'Main VIP lottery player',
  },
  {
    id: 'MST_SAMNANG01',
    name: 'Samnang Big Master',
    role: 'MASTER',
    password: 'master888',
    balance: 15000000,
    creditLimit: 50000000,
    phone: '077 777 888',
    status: 'ACTIVE',
    commissionRate: 15,
    createdAt: '2026-09-01',
    notes: 'Phnom Penh Central Master Agent',
  },
  {
    id: 'AGT_VICHET',
    name: 'Vichet Agent Kandal',
    role: 'AGENT',
    password: '123456',
    masterId: 'MST_SAMNANG01',
    balance: 2450000,
    creditLimit: 10000000,
    phone: '098 123 456',
    status: 'ACTIVE',
    commissionRate: 10,
    createdAt: '2026-10-01',
    notes: 'Kandal provincial branch agent',
  },
  {
    id: 'USR_DARA88',
    name: 'Dara Lucky Member',
    role: 'MEMBER',
    password: '123456',
    masterId: 'AGT_VICHET',
    balance: 180000,
    creditLimit: 500000,
    phone: '085 456 789',
    status: 'ACTIVE',
    commissionRate: 0,
    createdAt: '2026-10-18',
    notes: 'Regular daily lottery customer',
  },
  {
    id: 'USR_BOBBY99',
    name: 'Bobby Smart Bettor',
    role: 'MEMBER',
    password: '123456',
    masterId: 'MST_SAMNANG01',
    balance: 85000,
    creditLimit: 500000,
    phone: '096 999 881',
    status: 'ACTIVE',
    commissionRate: 0,
    createdAt: '2026-10-19',
    notes: 'High frequency 1/99 player',
  },
];

export const DEFAULT_SYSTEM_CONFIG = {
  payoutRate: 91,
  drawIntervalSeconds: 180,
  minBetAmount: 100,
  maxBetAmount: 5000000,
  isSystemOpen: true,
  autoDrawEnabled: true,
};

