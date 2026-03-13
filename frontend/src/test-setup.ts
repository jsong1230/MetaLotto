import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Clean up after each test
afterEach(() => {
  cleanup();
});

// Mock Web3 environment
vi.mock('wagmi', async () => {
  const actual = await vi.importActual('wagmi');
  return {
    ...actual,
    useAccount: () => ({
      address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
      isConnected: true,
      chain: { id: 11 },
    }),
    useReadContract: () => ({ data: null, isLoading: false }),
    useWriteContract: () => ({
      writeContract: vi.fn(),
      isPending: false,
    }),
    useWaitForTransactionReceipt: () => ({
      isLoading: false,
    }),
    useChainId: () => 11,
  };
});

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});
