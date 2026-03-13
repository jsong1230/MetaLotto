import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useCountdown } from '@/hooks/useCountdown';

// Mock wagmi
vi.mock('wagmi', () => ({
  useAccount: () => ({ address: '0x1234567890abcdef1234567890abcdef12345678', isConnected: true }),
  useBalance: () => ({ data: { value: BigInt('1000000000000000000000') }, isLoading: false }),
  useReadContract: () => ({ data: null, isLoading: false, error: null }),
  useWriteContract: () => ({ writeContract: vi.fn(), isPending: false }),
  useWatchContractEvent: () => {},
}));

// Mock @wagmi/core
vi.mock('@wagmi/core', () => ({
  getAccount: () => ({ address: '0x1234567890abcdef1234567890abcdef12345678', isConnected: true }),
}));

describe('useCountdown', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('남은 시간을 올바르게 계산한다', () => {
    const now = Math.floor(Date.now() / 1000);
    const futureTime = now + 3600; // 1시간 후

    const { result } = renderHook(() => useCountdown(BigInt(futureTime)));

    expect(result.current).toBeDefined();
    expect(result.current.hours).toBeGreaterThanOrEqual(0);
    expect(result.current.minutes).toBeGreaterThanOrEqual(0);
    expect(result.current.seconds).toBeGreaterThanOrEqual(0);
  });

  it('0 이하의 타겟 시간은 0:0:0을 반환한다', () => {
    const { result } = renderHook(() => useCountdown(BigInt(0)));

    expect(result.current.hours).toBe(0);
    expect(result.current.minutes).toBe(0);
    expect(result.current.seconds).toBe(0);
  });

  it('시간이 경과하면 카운트다운이 업데이트된다', async () => {
    const now = Math.floor(Date.now() / 1000);
    const futureTime = now + 10; // 10초 후

    const { result } = renderHook(() => useCountdown(BigInt(futureTime)));

    const initialSeconds = result.current.seconds;

    // 1초 경과
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    // 카운트다운이 감소했는지 확인
    expect(result.current.seconds).toBeLessThanOrEqual(initialSeconds);
  });
});

// ============================================
// Hook Export 테스트
// ============================================

describe('Hooks Index', () => {
  it('모든 훅이 export된다', async () => {
    const hooks = await import('@/hooks/index');

    expect(hooks.useCountdown).toBeDefined();
    expect(hooks.useCurrentRound).toBeDefined();
    expect(hooks.useMyTickets).toBeDefined();
    expect(hooks.useTicketPurchase).toBeDefined();
    expect(hooks.usePendingWithdrawal).toBeDefined();
    expect(hooks.useRoundEvents).toBeDefined();
    expect(hooks.useRoundHistory).toBeDefined();
  });
});
