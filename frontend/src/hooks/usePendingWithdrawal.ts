/**
 * 미수령 상금 조회 훅
 *
 * MetaLotto 컨트랙트의 getPendingWithdrawal 함수를 호출하여
 * 사용자가 인출할 수 있는 상금을 조회합니다.
 */

'use client';

import { useReadContract } from 'wagmi';
import { metalottoContract } from '@/lib/abis/config';

/**
 * 미수령 상금 조회 훅
 *
 * @param address - 조회할 지갑 주소
 * @returns 미수령 상금 정보
 *
 * @example
 * ```typescript
 * const { amount, isLoading, error, refetch } = usePendingWithdrawal(address);
 *
 * if (isLoading) return <LoadingSpinner />;
 *
 * const formattedAmount = formatEther(amount || 0n);
 *
 * return (
 *   <div>
 *     <p>미수령 상금: {formattedAmount} META</p>
 *   </div>
 * );
 * ```
 */
export function usePendingWithdrawal(address: `0x${string}` | undefined) {
  const { data, isLoading, error, refetch } = useReadContract({
    ...metalottoContract,
    functionName: 'getPendingWithdrawal',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address, // 주소가 있을 때만 쿼리 실행
      staleTime: 10_000, // 10초 동안 캐시 유지
    },
  });

  return {
    amount: data as bigint | undefined,
    isLoading,
    error,
    refetch,
  };
}
