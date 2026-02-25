jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: jest.fn(() => jest.fn()),
  fetch: jest.fn(() => Promise.resolve({ isConnected: true })),
}));

jest.mock('react-native-mmkv', () => ({
  createMMKV: () => ({
    set: jest.fn(),
    getString: jest.fn(() => null),
  }),
}));

jest.mock('./src/api/client', () => ({
  sendSmallRequest: jest.fn(() => Promise.resolve()),
  sendLargeRequest: jest.fn(() => Promise.resolve()),
}));
