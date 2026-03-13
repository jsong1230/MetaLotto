import { test as base } from '@playwright/test';

// Mock 컨트랙트 데이터 타입 (문자열로 변환하여 BigInt 문제 해결)
interface MockRoundData {
  roundId: string;
  status: number; // 0: Open, 1: Closing, 2: Completed, 3: Cancelled
  ticketPrice: string;
  totalPool: string;
  ticketCount: string;
  closingTime: string;
  drawTime: string;
  winner?: string;
  winnerPrize?: string;
}

// Mock 지갑 데이터 타입 (문자열로 변환하여 BigInt 문제 해결)
interface MockWalletData {
  address: string;
  balance: string;
  isConnected: boolean;
}

export interface MockContractFixture {
  mockGetCurrentRound: (data: Partial<MockRoundData>) => void;
  mockGetRoundHistory: (rounds: MockRoundData[]) => void;
  mockGetUserTickets: (tickets: { roundId: bigint; count: bigint }[]) => void;
  mockGetPendingWithdrawal: (amount: bigint) => void;
  simulateNetworkError: () => void;
  clearMocks: () => void;
}

export interface MockWalletFixture {
  mockConnect: (data: MockWalletData) => void;
  mockDisconnect: () => void;
  mockInsufficientBalance: () => void;
  mockTransactionRejected: () => void;
  mockNetworkMismatch: () => void;
}

export const test = base.extend<{
  mockContract: MockContractFixture;
  mockWallet: MockWalletFixture;
}>({
  // 컨트랙트 Mock Fixture
  mockContract: async ({ page }, use) => {
    const fixture: MockContractFixture = {
      // 현재 라운드 정보 Mock
      mockGetCurrentRound: (data) => {
        const defaultData: MockRoundData = {
          roundId: '1',
          status: 0, // Open
          ticketPrice: '100000000000000000000', // 100 META
          totalPool: '1000000000000000000000', // 1000 META
          ticketCount: '10',
          closingTime: String(Math.floor(Date.now() / 1000) + 3600), // 1시간 후
          drawTime: String(Math.floor(Date.now() / 1000) + 7200), // 2시간 후
          ...data,
        };

        page.addInitScript((mockData) => {
          window.__MOCK_CONTRACT_DATA__ = {
            ...window.__MOCK_CONTRACT_DATA__,
            currentRound: mockData,
          };
        }, defaultData);
      },

      // 라운드 히스토리 Mock
      mockGetRoundHistory: (rounds) => {
        page.addInitScript((mockRounds) => {
          window.__MOCK_CONTRACT_DATA__ = {
            ...window.__MOCK_CONTRACT_DATA__,
            history: mockRounds,
          };
        }, rounds);
      },

      // 사용자 티켓 Mock
      mockGetUserTickets: (tickets) => {
        page.addInitScript((mockTickets) => {
          window.__MOCK_CONTRACT_DATA__ = {
            ...window.__MOCK_CONTRACT_DATA__,
            userTickets: mockTickets,
          };
        }, tickets);
      },

      // 미수령 상금 Mock
      mockGetPendingWithdrawal: (amount) => {
        page.addInitScript((mockAmount) => {
          window.__MOCK_CONTRACT_DATA__ = {
            ...window.__MOCK_CONTRACT_DATA__,
            pendingWithdrawal: mockAmount,
          };
        }, String(amount));
      },

      // 네트워크 에러 시뮬레이션
      simulateNetworkError: () => {
        page.addInitScript(() => {
          window.__MOCK_NETWORK_ERROR__ = true;
        });
      },

      // Mock 초기화
      clearMocks: () => {
        page.addInitScript(() => {
          window.__MOCK_CONTRACT_DATA__ = undefined;
          window.__MOCK_NETWORK_ERROR__ = false;
        });
      },
    };

    await use(fixture);
  },

  // 지갑 Mock Fixture
  mockWallet: async ({ page }, use) => {
    const fixture: MockWalletFixture = {
      // 지갑 연결 Mock
      mockConnect: (data) => {
        const defaultData: MockWalletData = {
          address: '0x1234567890abcdef1234567890abcdef12345678',
          balance: '1000000000000000000000', // 1000 META
          isConnected: true,
          ...data,
        };

        page.addInitScript((mockData) => {
          window.__MOCK_WALLET_DATA__ = mockData;
          window.dispatchEvent(new CustomEvent('wallet-connected', { detail: mockData }));
        }, defaultData);
      },

      // 지갑 연결 해제 Mock
      mockDisconnect: () => {
        page.addInitScript(() => {
          window.__MOCK_WALLET_DATA__ = { isConnected: false, address: '', balance: 0n };
          window.dispatchEvent(new CustomEvent('wallet-disconnected'));
        });
      },

      // 잔액 부족 Mock
      mockInsufficientBalance: () => {
        page.addInitScript(() => {
          if (window.__MOCK_WALLET_DATA__) {
            window.__MOCK_WALLET_DATA__.balance = '50000000000000000000'; // 50 META
          }
        });
      },

      // 트랜잭션 거부 Mock
      mockTransactionRejected: () => {
        page.addInitScript(() => {
          window.__MOCK_TRANSACTION_REJECTED__ = true;
        });
      },

      // 네트워크 불일치 Mock
      mockNetworkMismatch: () => {
        page.addInitScript(() => {
          window.__MOCK_NETWORK_MISMATCH__ = true;
        });
      },
    };

    await use(fixture);
  },
});

// 전역 타입 선언 (window.__MOCK_*)
declare global {
  interface Window {
    __MOCK_CONTRACT_DATA__?: {
      currentRound?: any;
      history?: any[];
      userTickets?: any[];
      pendingWithdrawal?: string;
    };
    __MOCK_WALLET_DATA__?: {
      isConnected: boolean;
      address: string;
      balance: string;
    };
    __MOCK_NETWORK_ERROR__?: boolean;
    __MOCK_TRANSACTION_REJECTED__?: boolean;
    __MOCK_NETWORK_MISMATCH__?: boolean;
  }
}
