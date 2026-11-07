export type ChannelLetter = 'A' | 'B' | 'C' | 'D' | 'E';

export interface RoundResult {
  roundId: string; // e.g. "26292#143"
  drawTime: string; // e.g. "12:08"
  date: string; // e.g. "19-10-2026"
  numbers: Record<ChannelLetter, string>; // e.g. { A: "42", B: "38", C: "82", D: "31", E: "49" }
  timestamp: number;
}

export interface SingleBet {
  channel: ChannelLetter;
  number: string; // "01" - "99"
  amount: number; // in KHR, e.g. 1000
}

export interface BetTicket {
  ticketId: string; // e.g. "TK-94812"
  userId?: string; // e.g. "AADPDPP001"
  roundId: string;
  createdAt: string;
  timestamp: number;
  channels: ChannelLetter[];
  numbers: string[];
  stakePerUnit: number;
  totalBetsCount: number;
  totalCost: number;
  status: 'PENDING' | 'WON' | 'LOST';
  wonAmount: number;
  winningHits: Array<{ channel: ChannelLetter; number: string; winAmount: number }>;
}

export type UserRole = 'MASTER' | 'AGENT' | 'MEMBER' | 'ADMIN';

export interface AppUser {
  id: string; // e.g. "AADPDPP001", "MASTER_01"
  name: string;
  role: UserRole;
  password?: string;
  masterId?: string;
  balance: number;
  creditLimit: number;
  phone?: string;
  status: 'ACTIVE' | 'SUSPENDED';
  commissionRate: number; // e.g. 10
  createdAt: string;
  notes?: string;
}

export interface SystemConfig {
  payoutRate: number;
  drawIntervalSeconds: number;
  minBetAmount: number;
  maxBetAmount: number;
  isSystemOpen: boolean;
  autoDrawEnabled: boolean;
}

export interface AccountState {
  userId: string;
  currency: string;
  balance: number;
  inPlayBet: number;
}

export type SelectionMode = 'NUMBER' | 'RANGE';

export interface RangeFilter {
  label: string;
  numbers: string[];
}

