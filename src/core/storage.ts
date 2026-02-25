import { createMMKV } from 'react-native-mmkv';
import type { LogEntry } from './types';

const STORAGE_ID = 'offline-queue';
const LOG_KEY = 'syncLog';

export const storage = createMMKV({ id: STORAGE_ID });

export function persistLog(entries: LogEntry[]): void {
  storage.set(LOG_KEY, JSON.stringify(entries));
}

export function loadLog(): LogEntry[] {
  const raw = storage.getString(LOG_KEY);
  if (!raw) return [];

  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}
