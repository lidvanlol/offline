import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { LogEntry } from '../core/types';

const styles = StyleSheet.create({
  logItem: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderColor: '#ccc',
    borderRadius: 5,
    borderWidth: 1,
    height: 64,
    justifyContent: 'center',
  },
  logItemDark: {},
  logType: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111',
  },
  logTimestamp: {
    fontSize: 12,
    marginTop: 2,
    color: '#666',
  },
  textDark: {
    color: '#e5e5e5',
  },
  textMutedDark: {
    color: '#a3a3a3',
  },
});

export const SyncLogItem = React.memo(function SyncLogItem({
  item,
  isDark,
}: {
  item: LogEntry;
  isDark: boolean;
}) {
  return (
    <View style={[styles.logItem, isDark && styles.logItemDark]}>
      <Text style={[styles.logType, isDark && styles.textDark]}>
        {item.type[0].toUpperCase() + item.type.slice(1)}
      </Text>
      <Text style={[styles.logTimestamp, isDark && styles.textMutedDark]}>
        {item.displayTime ?? new Date(item.syncedAt).toLocaleString()}
      </Text>
    </View>
  );
});
