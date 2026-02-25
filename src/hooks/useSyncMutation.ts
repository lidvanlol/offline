import { useMutation } from '@tanstack/react-query';
import { sendLargeRequest, sendSmallRequest } from '../api/client';
import { useQueueStore } from '../core/queue-store';
import type { ActionType } from '../core/types';

function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

export function useSyncMutation() {
  const addLogEntry = useQueueStore((s) => s.addLogEntry);

  return useMutation({
    mutationKey: ['sync'],
    mutationFn: async (type: ActionType) => {
      const action = {
        id: generateId(),
        type,
        payload: { simulated: true, timestamp: Date.now() },
        createdAt: Date.now(),
        retryCount: 0,
        status: 'pending' as const,
      };
      if (type === 'small') {
        await sendSmallRequest(action);
      } else {
        await sendLargeRequest(action);
      }
      return { type };
    },
    onSuccess: (data) => {
      addLogEntry({ type: data.type, syncedAt: Date.now() });
    },
  });
}
