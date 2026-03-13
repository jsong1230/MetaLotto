/**
 * 내 티켓 조회 훅
 *
 * MetaLotto 컨트랙트의 getMyTickets 함수를 호출하여
 * 특정 라운드의 내 티켓 수를 조회합니다.
 */

'use client';

import { useReadContract, useAccount, useChainId } from 'wagmi';
import { META_LOTTO_ABI } from '@/lib/abis';
import { getMetaLottoAddress } from '@/lib/abis';

/**
 * 현재 라운드의 내 티켓 수 조회 훅
 */
export function useMyTickets(roundId?: bigint) {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const contractAddress = getMetaLottoAddress(chainId);

  const { data, isLoading, error, refetch } = useReadContract({
    address: contractAddress,
    abi: META_LOTTO_ABI,
    functionName: 'getMyTickets',
    args: roundId ? [roundId] : undefined,
    query: {
      enabled: isConnected && !!contractAddress && !!roundId,
    },
  });

  const ticketCount = data as bigint | undefined;

  return {
    ticketCount,
    isLoading,
    error,
    refetch,
  };
}

/**
 * 미수령 상금 조회 훅
 */
export function usePendingWithdrawal() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const contractAddress = getMetaLottoAddress(chainId);

  const { data, isLoading, error, refetch } = useReadContract({
    address: contractAddress,
    abi: META_LOTTO_ABI,
    functionName: 'getPendingWithdrawal',
    args: address ? [address] : undefined,
    query: {
      enabled: isConnected && !!contractAddress && !!address,
    },
  });

  const amount = data as bigint | undefined;

  return {
    amount,
    isLoading,
    error,
    refetch,
  };
}
