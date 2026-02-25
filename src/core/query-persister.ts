import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { storage } from './storage';

export const mmkvPersister = createAsyncStoragePersister({
  storage: {
    getItem: (key) => Promise.resolve(storage.getString(key) ?? null),
    setItem: (key, value) => Promise.resolve(storage.set(key, value)),
    removeItem: (key) => {
      storage.remove(key);
      return Promise.resolve();
    },
  },
});
