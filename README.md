# Offline-First React Native App

A React Native app demonstrating offline-first architecture for delivery drivers. Actions are queued when offline and synced automatically when connectivity is restored. Small requests are prioritized over large ones.

## How to Run

### Prerequisites

- Node.js >= 22.11.0
- React Native development environment ([Set Up Your Environment](https://reactnative.dev/docs/set-up-your-environment))

### Install dependencies

```sh
npm install
```

### iOS

```sh
cd ios && bundle exec pod install && cd ..
npm run ios
```

### Android

```sh
npm run android
```

### Run tests

```sh
npm test 
```

## Testing Offline Behavior

1. Run the app on a device or simulator.
2. Tap **Small** or **Large** to queue simulated API requests.
3. Enable **Airplane Mode** on the device.
4. Queue several actions (both small and large) while offline.
5. Disable Airplane Mode.
6. The app will automatically sync: small requests first, then large ones.
7. Successfully synced actions appear in the log with type and timestamp.

## Architecture

```
┌─────────────┐
│     UI      │  ← Buttons + sync log
└──────┬──────┘
       │ enqueue(type)
┌──────▼──────┐
│ Zustand     │  ← queue + syncLog state
│ Store       │
└──────┬──────┘
       │ persist
┌──────▼──────┐
│  MMKV       │  ← survives app restarts
└──────┬──────┘
       │ drain
┌──────▼──────┐
│ SyncEngine  │  ← priority, retry, mutex
└──────┬──────┘
       │
┌──────▼──────┐
│ API Client  │  ← axios (httpbin.org)
└─────────────┘
```

### Offline handling and retries

1. **Queue**: Every action (small or large) is enqueued immediately. The UI shows success from the user's perspective.
2. **Persistence**: Queue and sync log are stored in MMKV. Data survives app restarts.
3. **Priority**: Small requests are processed before any large request. Within each type, FIFO order is preserved.
4. **Sync trigger**: `NetInfo` listens for connectivity. When the device comes online, the sync engine drains the queue.
5. **Retries**: Network errors (timeout, no connection) reset the action to pending and stop the drain until reconnect. Non-network errors (e.g. 5xx) increment a retry count; after 3 failures the action is dropped.
6. **Crash recovery**: On app start, any `in_flight` actions are reset to `pending` so they can be retried.

### Key files

- `src/core/queue-store.ts` — Zustand store with enqueue, state transitions, rehydrate
- `src/core/sync-engine.ts` — Drain logic with priority ordering and retry handling
- `src/core/storage.ts` — MMKV persistence and crash recovery
- `src/api/client.ts` — Simulated small/large API calls via axios (httpbin.org)
- `src/hooks/useNetworkSync.ts` — NetInfo listener that triggers sync on reconnect

## Performance Optimizations

This app implements several React Native performance optimizations for smooth scrolling and efficient rendering, especially important for long sync logs:

### List Rendering
- **Memoized list items**: `SyncLogItem` wrapped with `React.memo` to prevent unnecessary re-renders
- **Stable render function**: `useCallback` for `renderItem` to avoid FlatList recreating components on every render
- **Theme optimization**: `isDark` prop passed from parent instead of each row calling `useColorScheme()`

### FlatList Configuration
- **Memory optimization**: `removeClippedSubviews` to unmount off-screen items
- **Batched rendering**: `maxToRenderPerBatch={10}` and `updateCellsBatchingPeriod={50}` for smooth scrolling
- **Reduced initial render**: `initialNumToRender={10}` and `windowSize={7}` for faster initial load

### Data Structure
- **Newest-first storage**: Queue store prepends new entries to avoid array reversal on every render
- **Pre-formatted timestamps**: Timestamps formatted once during data creation instead of during render
- **Clean layout**: `ItemSeparatorComponent` instead of `marginBottom` for predictable item sizing

## Trade-offs and simplifications

- **Sequential processing**: One request at a time. Could add controlled concurrency for production.
- **No conflict resolution**: Assumes backend is idempotent or handles duplicates. Action IDs could be used as idempotency keys.
- **Simulated API**: Uses httpbin.org for real HTTP requests. No real backend; payloads are synthetic.
- **No optimistic rollback**: Actions always appear successful. If the backend rejects after sync, there is no UI rollback.
- **Large payload**: Large requests send ~100KB of data. Real image uploads would be larger and might need chunking.
