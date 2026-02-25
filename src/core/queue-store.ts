import { create } from 'zustand';
import type { LogEntry } from './types';
import { loadLog, persistLog } from './storage';

function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

interface SyncLogState {
  syncLog: LogEntry[];
  addLogEntry: (entry: Omit<LogEntry, 'id'>) => void;
  rehydrate: () => void;
}

export const useQueueStore = create<SyncLogState>((set) => ({
  syncLog: [],

  addLogEntry: (entry: Omit<LogEntry, 'id'>) => {
    const logEntry: LogEntry = {
      ...entry,
      id: generateId(),
      displayTime: new Date(entry.syncedAt).toLocaleString(),
    };
    set((state) => {
      const syncLog = [logEntry, ...state.syncLog];
      persistLog(syncLog);
      return { syncLog };
    });
  },

  rehydrate: () => {
    const syncLog = loadLog();
    set({ syncLog });
  },
}));
