import { useCallback } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMutationState } from '@tanstack/react-query';
import { SyncLogItem } from '../components/SyncLogItem';
import { useQueueStore } from '../core/queue-store';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { useSyncMutation } from '../hooks/useSyncMutation';
import type { ActionType, LogEntry } from '../core/types';

export function HomeScreen() {
  const insets = useSafeAreaInsets();
  const isConnected = useNetworkStatus();
  const syncLog = useQueueStore(s => s.syncLog);
  const { mutate } = useSyncMutation();
  const isDark = useColorScheme() === 'dark';

  const pendingVariables = useMutationState({
    filters: { status: 'pending', mutationKey: ['sync'] },
    select: mutation => mutation.state.variables as ActionType,
  });
  const inQueue = pendingVariables.length;
  const smallCount = pendingVariables.filter(v => v === 'small').length;
  const largeCount = pendingVariables.filter(v => v === 'large').length;

  const renderItem = useCallback(
    ({ item }: { item: LogEntry }) => (
      <SyncLogItem item={item} isDark={isDark} />
    ),
    [isDark],
  );

  const handlePress = (type: ActionType) => {
    mutate(type);
  };

  const containerStyle = [
    styles.container,
    isDark && styles.containerDark,
    { paddingTop: insets.top },
  ];
  const statusDotStyle = [
    styles.statusDot,
    isConnected ? styles.statusOnline : styles.statusOffline,
  ];

  return (
    <View style={containerStyle}>
      <View style={styles.statusRow}>
        <View style={statusDotStyle} />
        <Text style={[styles.statusText, isDark && styles.textDark]}>
          {isConnected ? 'Online' : 'Offline'}
        </Text>
      </View>

      <Text style={[styles.pendingText, isDark && styles.textDark]}>
        {inQueue} in queue: {smallCount} small, {largeCount} large
      </Text>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.button, styles.buttonSmall]}
          onPress={() => handlePress('small')}
          activeOpacity={0.7}
        >
          <Text style={styles.buttonText}>Small</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.buttonLarge]}
          onPress={() => handlePress('large')}
          activeOpacity={0.7}
        >
          <Text style={styles.buttonText}>Large</Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.logTitle, isDark && styles.textDark]}>
        Synced actions
      </Text>
      <FlatList
        data={syncLog}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        removeClippedSubviews
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        windowSize={7}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={ItemSeparator}
        style={styles.logList}
        contentContainerStyle={syncLog.length === 0 && styles.logListEmpty}
        ListEmptyComponent={
          <Text style={[styles.emptyText, isDark && styles.textDark]}>
            No synced actions yet
          </Text>
        }
      />
    </View>
  );
}

function ItemSeparator() {
  return <View style={styles.itemSeparator} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  containerDark: {
    backgroundColor: '#1a1a1a',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  statusOnline: {
    backgroundColor: '#22c55e',
  },
  statusOffline: {
    backgroundColor: '#ef4444',
  },
  statusText: {
    fontSize: 16,
    color: '#111',
  },
  textDark: {
    color: '#e5e5e5',
  },
  textMutedDark: {
    color: '#a3a3a3',
  },
  pendingText: {
    fontSize: 14,
    marginBottom: 24,
    color: '#444',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonSmall: {
    backgroundColor: '#3b82f6',
  },
  buttonLarge: {
    backgroundColor: '#f97316',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  logTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#111',
  },
  itemSeparator: {
    height: 5,
  },
  logList: {
    flex: 1,
  },
  logListEmpty: {
    flexGrow: 1,
  },
  emptyText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginTop: 24,
  },
});
