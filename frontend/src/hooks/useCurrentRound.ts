/**
 * 현재 라운드 정보 조회 훅
 *
 * MetaLotto 컨트랙트의 getCurrentRound 함수를 호출하여
 * 현재 진행 중인 라운드 정보를 가져옵니다.
 */

'use client';

import { useReadContract, useChainId } from 'wagmi';
import { META_LOTTO_ABI } from '@/lib/abis';
import { getMetaLottoAddress } from '@/lib/abis';
import { Round, RoundStatus } from '@/lib/abis/types';

export interface RoundInfo extends Round {
  status: RoundStatus;
}

/**
 * 현재 라운드 정보를 조회하는 훅
 */
export function useCurrentRound() {
  const chainId = useChainId();
  let contractAddress: `0x${string}` | undefined;
  try { contractAddress = getMetaLottoAddress(chainId); } catch { contractAddress = undefined; }

  const { data, isLoading, error, refetch } = useReadContract({
    address: contractAddress,
    abi: META_LOTTO_ABI,
    functionName: 'getCurrentRound',
    query: {
      enabled: !!contractAddress,
      refetchInterval: 30000,
    },
  });

  const { data: ticketPriceData } = useReadContract({
    address: contractAddress,
    abi: META_LOTTO_ABI,
    functionName: 'ticketPrice',
    query: {
      enabled: !!contractAddress,
      refetchInterval: 60000,
    },
  });

  const rawRound = data as (Omit<RoundInfo, 'roundId'> & { id: bigint }) | undefined;
  // 컨트랙트는 'id' 필드를 사용하지만 편의상 roundId로도 접근 가능하게 통일
  const round = rawRound
    ? { ...rawRound, roundId: rawRound.id, ticketPrice: (ticketPriceData as bigint) ?? 0n }
    : undefined;

  return {
    round,
    isLoading,
    error,
    refetch,
  };
}

/**
 * 특정 라운드 정보를 조회하는 훅
 */
export function useRound(roundId: bigint) {
  const chainId = useChainId();
  let contractAddress: `0x${string}` | undefined;
  try { contractAddress = getMetaLottoAddress(chainId); } catch { contractAddress = undefined; }

  const { data, isLoading, error } = useReadContract({
    address: contractAddress,
    abi: META_LOTTO_ABI,
    functionName: 'getRound',
    args: [roundId],
    query: {
      enabled: !!contractAddress && roundId > 0n,
    },
  });

  const round = data as RoundInfo | undefined;

  return {
    round,
    isLoading,
    error,
  };
}
