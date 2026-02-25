import { QueryClient, onlineManager } from '@tanstack/react-query';
import NetInfo from '@react-native-community/netinfo';

onlineManager.setEventListener((setOnline) => {
  return NetInfo.addEventListener((state) => {
    setOnline(!!state.isConnected);
  });
});

export const queryClient = new QueryClient({
  defaultOptions: {
    mutations: {
      retry: 3,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000),
      networkMode: 'offlineFirst',
    },
  },
});
