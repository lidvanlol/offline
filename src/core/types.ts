export type ActionType = 'small' | 'large';

export type ActionStatus =
  | 'pending'
  | 'in_flight'
  | 'completed'
  | 'failed';

export interface QueuedAction {
  id: string;
  type: ActionType;
  payload: unknown;
  createdAt: number;
  retryCount: number;
  status: ActionStatus;
}

export interface LogEntry {
  id: string;
  type: ActionType;
  syncedAt: number;
  displayTime?: string;
}
