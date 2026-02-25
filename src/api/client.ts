import axios from 'axios';
import type { QueuedAction } from '../core/types';

const SMALL_TIMEOUT = 2000;
const LARGE_TIMEOUT = 5000;

// httpbin.org/post echoes back the request - works when online
const SMALL_ENDPOINT = 'https://httpbin.org/post';
const LARGE_ENDPOINT = 'https://httpbin.org/post';

function createLargePayload(): string {
  // ~100KB base64 string to simulate image upload
  const chunk = 'a'.repeat(1024);
  return chunk.repeat(100);
}

export async function sendSmallRequest(
  action: QueuedAction,
  signal?: AbortSignal
): Promise<void> {
  await axios.post(
    SMALL_ENDPOINT,
    {
      type: action.type,
      id: action.id,
      payload: action.payload,
      createdAt: action.createdAt,
    },
    {
      timeout: SMALL_TIMEOUT,
      headers: { 'Content-Type': 'application/json' },
      signal,
    }
  );
}

export async function sendLargeRequest(
  action: QueuedAction,
  signal?: AbortSignal
): Promise<void> {
  await axios.post(
    LARGE_ENDPOINT,
    {
      type: action.type,
      id: action.id,
      payload: action.payload,
      createdAt: action.createdAt,
      largeData: createLargePayload(),
    },
    {
      timeout: LARGE_TIMEOUT,
      headers: { 'Content-Type': 'application/json' },
      signal,
    }
  );
}
