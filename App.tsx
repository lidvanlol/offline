/**
 * Offline-First React Native App
 *
 * @format
 */

import { useEffect } from 'react';
import { StatusBar, StyleSheet, useColorScheme, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { queryClient } from './src/core/query-client';
import { mmkvPersister } from './src/core/query-persister';
import { useQueueStore } from './src/core/queue-store';
import { HomeScreen } from './src/screens/HomeScreen';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  useEffect(() => {
    useQueueStore.getState().rehydrate();
  }, []);

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister: mmkvPersister }}
    >
      <SafeAreaProvider>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        <View style={styles.container}>
          <HomeScreen />
        </View>
      </SafeAreaProvider>
    </PersistQueryClientProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
