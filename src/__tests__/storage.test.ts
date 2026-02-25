/**
 * @format
 */

import { loadLog, persistLog } from '../core/storage';
import type { LogEntry } from '../core/types';

// Mock MMKV with in-memory storage
const mockData: Record<string, string> = {};
jest.mock('react-native-mmkv', () => ({
  createMMKV: () => ({
    set: (key: string, value: string) => {
      mockData[key] = value;
    },
    getString: (key: string) => mockData[key] ?? null,
    delete: (key: string) => {
      delete mockData[key];
    },
  }),
}));

describe('storage', () => {
  beforeEach(() => {
    Object.keys(mockData).forEach((key) => delete mockData[key]);
  });

  describe('loadLog', () => {
    it('returns empty array when nothing persisted', () => {
      expect(loadLog()).toEqual([]);
    });

    it('returns persisted log', () => {
      const entries: LogEntry[] = [
        { id: '1', type: 'small', syncedAt: Date.now() },
      ];
      persistLog(entries);
      expect(loadLog()).toEqual(entries);
    });
  });
});
