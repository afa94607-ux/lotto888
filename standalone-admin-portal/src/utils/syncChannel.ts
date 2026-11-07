import { ChannelLetter, RoundResult, BetTicket } from '../types/lottery';

export type SyncMessage =
  | { type: 'UPDATE_BALANCE'; balance: number }
  | { type: 'SET_FORCED_NUMBERS'; numbers: Record<ChannelLetter, string> | null }
  | { type: 'TRIGGER_DRAW' }
  | { type: 'UPDATE_PAYOUT_RATE'; payoutRate: number }
  | { type: 'UPDATE_DRAW_INTERVAL'; interval: number }
  | { type: 'UPDATE_ROUNDS'; rounds: RoundResult[] }
  | { type: 'UPDATE_TICKET'; ticketId: string; status: 'WON' | 'LOST'; wonAmount: number };

class LotterySyncManager {
  private channel: BroadcastChannel | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.channel = new BroadcastChannel('thai_samnang_cross_tab_sync');
      } catch {
        this.channel = null;
      }
    }
  }

  public send(msg: SyncMessage) {
    try {
      this.channel?.postMessage(msg);
    } catch {
      // ignore
    }
  }

  public subscribe(handler: (msg: SyncMessage) => void): () => void {
    if (!this.channel) return () => {};

    const listener = (event: MessageEvent<SyncMessage>) => {
      if (event && event.data) {
        handler(event.data);
      }
    };

    this.channel.addEventListener('message', listener);
    return () => {
      this.channel?.removeEventListener('message', listener);
    };
  }
}

export const syncManager = new LotterySyncManager();
