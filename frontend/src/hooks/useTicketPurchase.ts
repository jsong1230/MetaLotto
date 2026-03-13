/**
 * 티켓 구매 훅
 *
 * MetaLotto 컨트랙트의 buyTickets 함수를 호출하여
 * 티켓을 구매합니다.
 */

'use client';

import { useWriteContract, useWaitForTransactionReceipt, useChainId } from 'wagmi';
import { META_LOTTO_ABI } from '@/lib/abis';
import { getMetaLottoAddress } from '@/lib/abis';
import { parseEther, formatEther } from 'viem';

const MAX_TICKETS_PER_PURCHASE = 100;

/**
 * 티켓 구매 훅
 */
export function useTicketPurchase() {
  const chainId = useChainId();
  const contractAddress = getMetaLottoAddress(chainId);

  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  /**
   * 티켓 구매 함수
   * @param count 구매할 티켓 수량 (1~100)
   * @param ticketPrice 티켓 가격 (wei)
   */
  const buyTickets = async (count: number, ticketPrice: bigint) => {
    // 유효성 검증
    if (count < 1 || count > MAX_TICKETS_PER_PURCHASE) {
      throw new Error(`티켓 수량은 1~${MAX_TICKETS_PER_PURCHASE}장 사이여야 합니다.`);
    }

    if (ticketPrice <= 0n) {
      throw new Error('티켓 가격이 유효하지 않습니다.');
    }

    const totalValue = ticketPrice * BigInt(count);

    writeContract({
      address: contractAddress,
      abi: META_LOTTO_ABI,
      functionName: 'buyTickets',
      args: [BigInt(count)],
      value: totalValue,
    });
  };

  /**
   * 총 가격 계산 함수
   * @param count 티켓 수량
   * @param ticketPrice 티켓 가격 (wei)
   */
  const calculateTotalPrice = (count: number, ticketPrice: bigint): string => {
    const totalValue = ticketPrice * BigInt(count);
    return formatEther(totalValue);
  };

  return {
    buyTickets,
    calculateTotalPrice,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}
