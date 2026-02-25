/**
 * @format
 */

import { useQueueStore } from '../core/queue-store';
import type { LogEntry } from '../core/types';

const mockStorage = {
  _log: [] as LogEntry[],
  persistLog: (entries: LogEntry[]) => {
    mockStorage._log = JSON.parse(JSON.stringify(entries));
  },
  loadLog: () => JSON.parse(JSON.stringify(mockStorage._log)),
};

jest.mock('../core/storage', () => ({
  persistLog: (entries: LogEntry[]) => mockStorage.persistLog(entries),
  loadLog: () => mockStorage.loadLog(),
}));

describe('queue-store', () => {
  beforeEach(() => {
    mockStorage._log = [];
    useQueueStore.setState({ syncLog: [] });
  });

  it('addLogEntry appends to syncLog and persists', () => {
    useQueueStore.getState().addLogEntry({
      type: 'small',
      syncedAt: 12345,
    });

    const syncLog = useQueueStore.getState().syncLog;
    expect(syncLog).toHaveLength(1);
    expect(syncLog[0].type).toBe('small');
    expect(syncLog[0].syncedAt).toBe(12345);
    expect(mockStorage._log).toHaveLength(1);
  });

  it('rehydrates syncLog from storage', () => {
    mockStorage._log = [
      { id: '1', type: 'large', syncedAt: 99999 },
    ];
    useQueueStore.setState({ syncLog: [] });
    useQueueStore.getState().rehydrate();

    const syncLog = useQueueStore.getState().syncLog;
    expect(syncLog).toHaveLength(1);
    expect(syncLog[0].type).toBe('large');
    expect(syncLog[0].syncedAt).toBe(99999);
  });
});
