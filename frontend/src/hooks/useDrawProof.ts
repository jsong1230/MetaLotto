'use client';

import { useState, useEffect } from 'react';
import { usePublicClient } from 'wagmi';
import { keccak256, encodePacked } from 'viem';
import { RoundStatus } from '@/lib/abis/types';

/**
 * 추첨 검증 데이터 타입
 */
export interface DrawProof {
  drawBlock: bigint;
  hash1: `0x${string}`;
  hash2: `0x${string}`;
  hash3: `0x${string}`;
  seed: bigint;
  totalPool: bigint;
  random: bigint;
  winnerIndex: bigint;
  ticketCount: bigint;
}

/**
 * 완료된 라운드의 추첨 과정을 온체인 블록 해시로 재현하는 훅
 * MetaLotto.sol의 drawWinner() 로직과 동일하게 계산
 */
export function useDrawProof(round: {
  status: number;
  drawBlock: bigint;
  seed: bigint;
  totalPool: bigint;
  ticketCount: bigint;
} | null) {
  const publicClient = usePublicClient();
  const [proof, setProof] = useState<DrawProof | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!round || round.status !== RoundStatus.Completed || !round.drawBlock || round.drawBlock === 0n) return;
    if (!publicClient) return;

    const fetchProof = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // drawBlock, drawBlock-1, drawBlock-2 세 블록을 병렬로 조회
        const [block1, block2, block3] = await Promise.all([
          publicClient.getBlock({ blockNumber: round.drawBlock }),
          publicClient.getBlock({ blockNumber: round.drawBlock - 1n }),
          publicClient.getBlock({ blockNumber: round.drawBlock - 2n }),
        ]);

        const hash1 = block1.hash ?? '0x0000000000000000000000000000000000000000000000000000000000000000';
        const hash2 = block2.hash ?? '0x0000000000000000000000000000000000000000000000000000000000000000';
        const hash3 = block3.hash ?? '0x0000000000000000000000000000000000000000000000000000000000000000';

        // 컨트랙트와 동일한 방식으로 random 계산
        const packed = encodePacked(
          ['bytes32', 'bytes32', 'bytes32', 'uint256', 'uint256'],
          [hash1 as `0x${string}`, hash2 as `0x${string}`, hash3 as `0x${string}`, round.seed, round.totalPool]
        );
        const randomHex = keccak256(packed);
        const random = BigInt(randomHex);
        const winnerIndex = random % round.ticketCount;

        setProof({
          drawBlock: round.drawBlock,
          hash1: hash1 as `0x${string}`,
          hash2: hash2 as `0x${string}`,
          hash3: hash3 as `0x${string}`,
          seed: round.seed,
          totalPool: round.totalPool,
          random,
          winnerIndex,
          ticketCount: round.ticketCount,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : '검증 데이터를 불러오지 못했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProof();
  }, [round?.drawBlock, round?.status, publicClient]);

  return { proof, isLoading, error };
}
