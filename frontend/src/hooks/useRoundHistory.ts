/**
 * 라운드 히스토리 조회 훅
 *
 * MetaLotto 컨트랙트의 getRound 함수를 호출하여
 * 과거 라운드의 정보를 조회합니다.
 */

'use client';

import { useMemo } from 'react';
import { useReadContract, useReadContracts, useChainId } from 'wagmi';
import { META_LOTTO_ABI } from '@/lib/abis';
import { getMetaLottoAddress } from '@/lib/abis';
import { Round, RoundStatus } from '@/lib/abis/types';

const ITEMS_PER_PAGE = 10;

/**
 * 라운드 히스토리 조회 훅
 */
export function useRoundHistory(page: number = 1) {
  const chainId = useChainId();
  let contractAddress: `0x${string}` | undefined;
  try { contractAddress = getMetaLottoAddress(chainId); } catch { contractAddress = undefined; }

  // 현재 라운드 ID 조회
  const { data: currentRoundId, isLoading: isLoadingCurrentRound } = useReadContract({
    address: contractAddress,
    abi: META_LOTTO_ABI,
    functionName: 'currentRoundId',
    query: {
      enabled: !!contractAddress,
    },
  });

  // 페이지네이션 계산
  const { roundIds, totalPages } = useMemo(() => {
    const currentId = currentRoundId ? Number(currentRoundId) : 0;
    const startIndex = Math.max(0, currentId - page * ITEMS_PER_PAGE);
    const endIndex = Math.max(0, currentId - (page - 1) * ITEMS_PER_PAGE);

    const ids: bigint[] = [];
    for (let i = endIndex - 1; i >= startIndex; i--) {
      ids.push(BigInt(i));
    }

    return {
      roundIds: ids,
      totalPages: Math.ceil(currentId / ITEMS_PER_PAGE),
    };
  }, [currentRoundId, page]);

  // 라운드 정보 병렬 조회
  const roundsQueries = useReadContracts({
    contracts: roundIds.map((roundId) => ({
      address: contractAddress,
      abi: META_LOTTO_ABI,
      functionName: 'getRound' as const,
      args: [roundId] as const,
    })),
    query: {
      enabled: !!contractAddress && roundIds.length > 0,
    },
  });

  const rounds = useMemo(() => {
    return roundsQueries.data
      ?.filter((result) => result.status === 'success' && result.result !== null)
      .map(({ result }) => {
        const raw = result as (Omit<Round, 'roundId'> & { id: bigint });
        return { ...raw, roundId: raw.id } as Round;
      })
      .filter((round) => round.status === RoundStatus.Completed || round.status === RoundStatus.Cancelled);
  }, [roundsQueries.data]);

  const isLoading = isLoadingCurrentRound || roundsQueries.isLoading;

  return {
    rounds,
    roundIds,
    isLoading,
    currentPage: page,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
}

/**
 * 주소 마스킹 헬퍼 함수
 */
export function maskAddress(address: `0x${string}`): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * 타임스탬프 포맷팅
 */
export function formatTimestamp(timestamp: bigint): string {
  const date = new Date(Number(timestamp) * 1000);
  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}
