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
  const contractAddress = getMetaLottoAddress(chainId);

  const { data, isLoading, error, refetch } = useReadContract({
    address: contractAddress,
    abi: META_LOTTO_ABI,
    functionName: 'getCurrentRound',
    query: {
      enabled: !!contractAddress,
      refetchInterval: 30000, // 30초마다 자동 갱신
    },
  });

  const round = data as RoundInfo | undefined;

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
  const contractAddress = getMetaLottoAddress(chainId);

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
