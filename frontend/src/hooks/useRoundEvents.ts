/**
 * 라운드 이벤트 구독 훅
 *
 * MetaLotto 컨트랙트의 이벤트를 구독하여
 * 실시간으로 데이터를 업데이트합니다.
 *
 * @remarks
 * - TicketPurchased: 티켓 구매 시 라운드 정보 갱신
 * - WinnerDrawn: 당첨자 발표 시 전체 데이터 갱신
 * - RoundStarted: 새 라운드 시작 시 라운드 정보 갱신
 */

'use client';

import { useWatchContractEvent, useChainId } from 'wagmi';
import { useQueryClient, type Query } from '@tanstack/react-query';
import { getMetalottoContract } from '@/lib/abis/config';

/**
 * wagmi useReadContract 쿼리를 functionName으로 매칭하는 헬퍼
 */
function byFunctionNames(...names: string[]) {
  return {
    predicate: (query: Query) => {
      const key = query.queryKey[0];
      return (
        typeof key === 'object' &&
        key !== null &&
        'functionName' in key &&
        names.includes((key as { functionName: string }).functionName)
      );
    },
  };
}

/**
 * 라운드 이벤트 구독 훅
 *
 * @remarks
 * 이 훅을 사용하면 컨트랙트 이벤트 발생 시
 * 자동으로 관련 쿼리를 무효화(invalidate)합니다.
 *
 * @example
 * ```typescript
 * // App 또는 루트 컴포넌트에서 한 번만 호출
 * useRoundEvents();
 *
 * return <App />;
 * ```
 */
export function useRoundEvents() {
  const queryClient = useQueryClient();
  const chainId = useChainId();
  let contract: { address: `0x${string}`; abi: typeof import('@/lib/abis/types').META_LOTTO_ABI };
  try { contract = getMetalottoContract(chainId); } catch { contract = getMetalottoContract(11); }

  // 티켓 구매 이벤트 → 라운드 정보, 내 티켓 갱신
  useWatchContractEvent({
    ...contract,
    eventName: 'TicketPurchased',
    onLogs: () => {
      queryClient.invalidateQueries(byFunctionNames('getCurrentRound', 'ticketPrice', 'getMyTickets'));
    },
  });

  // 당첨자 발표 이벤트 → 전체 갱신
  useWatchContractEvent({
    ...contract,
    eventName: 'WinnerDrawn',
    onLogs: () => {
      queryClient.invalidateQueries(byFunctionNames('getCurrentRound', 'getRound', 'getPendingWithdrawals'));
    },
  });

  // 라운드 시작 이벤트 → 라운드 정보 갱신
  useWatchContractEvent({
    ...contract,
    eventName: 'RoundStarted',
    onLogs: () => {
      queryClient.invalidateQueries(byFunctionNames('getCurrentRound', 'ticketPrice'));
    },
  });

  // 환불 청구 이벤트 → 미수령 상금 갱신
  useWatchContractEvent({
    ...contract,
    eventName: 'RefundClaimed',
    onLogs: () => {
      queryClient.invalidateQueries(byFunctionNames('getPendingWithdrawals'));
    },
  });

  // 상금 인출 이벤트 → 미수령 상금 갱신
  useWatchContractEvent({
    ...contract,
    eventName: 'WithdrawalClaimed',
    onLogs: () => {
      queryClient.invalidateQueries(byFunctionNames('getPendingWithdrawals'));
    },
  });
}
