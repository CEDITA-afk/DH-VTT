/**
 * Real-time BroadcastChannel & LocalStorage sync service for Dual-Screen / Player View
 */

export interface SyncMessage<T = unknown> {
  type: 'SESSION_STATE_UPDATE' | 'PLAYER_UPDATE' | 'DICE_ROLL' | 'ACTION_TOKEN_CHANGE' | 'PING';
  payload: T;
  timestamp: number;
}

type SyncCallback<T = unknown> = (msg: SyncMessage<T>) => void;

class SyncService {
  private channel: BroadcastChannel | null = null;
  private listeners: Set<SyncCallback> = new Set();

  constructor() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      this.channel = new BroadcastChannel('daggerheart_gm_screen_sync');
      this.channel.onmessage = (event) => {
        const msg = event.data as SyncMessage;
        this.notifyListeners(msg);
      };
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (event) => {
        if (event.key === 'dh_sync_event' && event.newValue) {
          try {
            const msg = JSON.parse(event.newValue) as SyncMessage;
            this.notifyListeners(msg);
          } catch {
            // ignore
          }
        }
      });
    }
  }

  broadcast<T>(type: SyncMessage<T>['type'], payload: T) {
    const msg: SyncMessage<T> = {
      type,
      payload,
      timestamp: Date.now(),
    };

    if (this.channel) {
      this.channel.postMessage(msg);
    }

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('dh_sync_event', JSON.stringify(msg));
    }
  }

  subscribe(callback: SyncCallback): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  private notifyListeners(msg: SyncMessage) {
    this.listeners.forEach((cb) => cb(msg));
  }
}

export const syncService = new SyncService();
