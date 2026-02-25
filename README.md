# Offline-First React Native App

A React Native app demonstrating offline-first architecture for delivery drivers. Actions are queued when offline and synced automatically when connectivity is restored. Small requests are prioritized over large ones.

## How to Run

### Prerequisites

- Node.js >= 22.11.0
- React Native development environment ([Set Up Your Environment](https://reactnative.dev/docs/set-up-your-environment))
- TypeScript knowledge (project uses TypeScript for type safety)

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

### Lint code

```sh
npm run lint
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
       │ mutate(type)
┌──────▼──────┐
│ React Query │  ← mutations, persistence, retry
│             │  ← offline-first network mode
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
       │
┌──────▼──────┐
│ API Client  │  ← axios (httpbin.org)
└─────────────┘
```

### React Query Integration

React Query (TanStack Query) provides the foundation for offline-first mutations and persistence:

1. **Mutations**: API calls are wrapped in `useMutation` with built-in retry logic and exponential backoff
2. **Offline-first**: Mutations use `networkMode: 'offlineFirst'` to work seamlessly offline
3. **Online detection**: React Query's `onlineManager` integrates with NetInfo for connectivity awareness
4. **Persistence**: Mutation state is persisted to MMKV, surviving app restarts and maintaining retry state
5. **UI state**: `useMutationState` provides real-time tracking of pending mutations for queue display
6. **Optimistic updates**: Failed mutations remain retryable across app sessions

### Offline handling and retries

1. **Optimistic UI**: Every action appears successful immediately. The UI shows success from the user's perspective.
2. **React Query mutations**: API calls are wrapped in mutations with built-in retry logic and exponential backoff.
3. **Offline-first mode**: Mutations use `networkMode: 'offlineFirst'` to work seamlessly when offline.
4. **Persistence**: React Query state is persisted to MMKV, surviving app restarts and maintaining retry state.
5. **Connectivity awareness**: `NetInfo` integrates with React Query's `onlineManager` to trigger retries when coming online.
6. **Automatic retries**: Failed mutations retry up to 3 times with exponential backoff (1s, 2s, 4s delays).
7. **Crash recovery**: On app start, persisted mutations resume their retry cycles from where they left off.

### Key files

- `src/core/query-client.ts` — React Query client with offline-first configuration and NetInfo integration
- `src/core/query-persister.ts` — MMKV-based persistence for React Query cache
- `src/hooks/useSyncMutation.ts` — React Query mutation hook for API calls with retry logic
- `src/core/queue-store.ts` — Zustand store with enqueue, state transitions, rehydrate
- `src/core/storage.ts` — MMKV persistence and crash recovery
- `src/api/client.ts` — Simulated small/large API calls via axios (httpbin.org)
- `src/hooks/useNetworkStatus.ts` — NetInfo connectivity monitoring

### Technologies Used

- **React Query (TanStack Query)**: Manages server state, mutations, caching, and offline-first behavior
- **Zustand**: Lightweight state management for queue and sync log
- **MMKV**: High-performance, encrypted storage for persistence
- **Axios**: HTTP client for API requests
- **NetInfo**: Network connectivity detection and monitoring
- **TypeScript**: Type-safe development with full type checking
- **Jest**: Testing framework for unit tests
- **ESLint**: Code linting and style enforcement

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

- **React Query complexity**: Using mutations for offline-first behavior adds complexity but provides robust retry and persistence.
- **Single mutation type**: All actions use the same mutation key. Could use separate keys for different action types.
- **No conflict resolution**: Assumes backend is idempotent or handles duplicates. Action IDs could be used as idempotency keys.
- **Simulated API**: Uses httpbin.org for real HTTP requests. No real backend; payloads are synthetic.
- **No optimistic rollback**: Actions always appear successful. If the backend rejects after sync, there is no UI rollback.
- **Large payload**: Large requests send ~100KB of data. Real image uploads would be larger and might need chunking.
- **No request deduplication**: Multiple identical requests could be queued. Production apps might need deduplication logic.
