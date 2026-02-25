import NetInfo from '@react-native-community/netinfo';
import { useEffect, useState } from 'react';

export function useNetworkStatus(): boolean {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected ?? false);
    });

    NetInfo.fetch().then((state) => {
      setIsConnected(state.isConnected ?? false);
    });

    return () => unsubscribe();
  }, []);

  return isConnected ?? false;
}