'use client';

import { useDrawProof } from '@/hooks/useDrawProof';
import { RoundStatus, Round } from '@/lib/abis/types';
import { formatEther } from 'viem';

/**
 * 긴 해시값을 앞 10자리...뒤 8자리로 줄여서 표시
 */
function truncateHash(hash: string): string {
  if (hash.length <= 20) return hash;
  return `${hash.slice(0, 10)}...${hash.slice(-8)}`;
}

/**
 * bigint를 hex 문자열로 표시 (앞 18자리...로 truncate)
 */
function truncateRandomHex(random: bigint): string {
  const hex = `0x${random.toString(16)}`;
  if (hex.length <= 20) return hex;
  return `0x${random.toString(16).slice(0, 16)}...`;
}

interface DrawProofPanelProps {
  round: Round;
  /** 당첨자 주소 (RoundCard에서 전달) */
  winner: `0x${string}`;
}

/**
 * 추첨 검증 패널 컴포넌트
 *
 * 완료된 라운드의 당첨자 결정 과정을 블록 해시와 keccak256 계산으로 재현합니다.
 * MetaLotto.sol drawWinner() 로직을 프론트엔드에서 동일하게 검증합니다.
 */
export function DrawProofPanel({ round, winner }: DrawProofPanelProps) {
  const { proof, isLoading, error } = useDrawProof(
    round.status === RoundStatus.Completed
      ? {
          status: round.status,
          drawBlock: round.drawBlock,
          seed: round.seed,
          totalPool: round.totalPool,
          ticketCount: round.ticketCount,
        }
      : null
  );

  return (
    <div
      className="rounded-xl mt-3 p-4 space-y-4"
      style={{
        background: 'rgba(0,217,255,0.05)',
        border: '1px solid rgba(0,217,255,0.15)',
      }}
    >
      {/* 패널 헤더 */}
      <div className="flex items-center gap-2 pb-3" style={{ borderBottom: '1px solid rgba(0,217,255,0.1)' }}>
        <span className="text-sm">🔍</span>
        <div>
          <p className="text-sm font-black text-white">추첨 검증 <span className="font-normal text-xs" style={{ color: 'rgba(0,217,255,0.7)' }}>Draw Proof</span></p>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>당첨자 결정 과정을 직접 확인하세요</p>
        </div>
      </div>

      {/* 로딩 상태 */}
      {isLoading && (
        <div className="flex items-center gap-2 py-4">
          <div
            className="w-4 h-4 rounded-full animate-spin"
            style={{ border: '2px solid rgba(0,217,255,0.2)', borderTopColor: '#00D9FF' }}
          />
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>블록 데이터 불러오는 중...</p>
        </div>
      )}

      {/* 에러 상태 */}
      {error && !isLoading && (
        <div className="py-3 px-3 rounded-lg" style={{ background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.2)' }}>
          <p className="text-xs" style={{ color: '#FF6B6B' }}>검증 데이터를 불러오지 못했습니다.</p>
          <p className="text-xs mt-1" style={{ color: 'rgba(255,107,107,0.6)' }}>{error}</p>
        </div>
      )}

      {/* 검증 데이터 */}
      {proof && !isLoading && (
        <div className="space-y-4">
          {/* 추첨 블록 */}
          <div className="flex items-baseline justify-between">
            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>추첨 블록</span>
            <span className="font-mono text-xs font-bold" style={{ color: '#00D9FF' }}>
              #{proof.drawBlock.toString()}
            </span>
          </div>

          {/* 블록 해시 입력값 */}
          <div>
            <p className="text-xs font-bold mb-2" style={{ color: 'rgba(255,255,255,0.7)' }}>블록 해시 입력값</p>
            <div className="space-y-1.5 pl-2" style={{ borderLeft: '2px solid rgba(0,217,255,0.4)' }}>
              {[
                { label: 'hash1', hash: proof.hash1, blockLabel: `블록 #${proof.drawBlock.toString()}` },
                { label: 'hash2', hash: proof.hash2, blockLabel: `블록 #${(proof.drawBlock - 1n).toString()}` },
                { label: 'hash3', hash: proof.hash3, blockLabel: `블록 #${(proof.drawBlock - 2n).toString()}` },
              ].map(({ label, hash, blockLabel }) => (
                <div key={label} className="flex items-center gap-2">
                  <span className="text-xs w-12 shrink-0 font-bold" style={{ color: 'rgba(255,255,255,0.6)' }}>{label}</span>
                  <span className="font-mono text-xs" style={{ color: '#00D9FF' }}>{truncateHash(hash)}</span>
                  <span className="text-xs shrink-0" style={{ color: 'rgba(255,255,255,0.5)' }}>({blockLabel})</span>
                </div>
              ))}
            </div>
          </div>

          {/* 시드 & 풀 */}
          <div className="space-y-1.5">
            <div className="flex items-baseline justify-between">
              <span className="text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>누적 시드</span>
              <span className="font-mono text-xs" style={{ color: '#00D9FF' }}>
                {truncateRandomHex(proof.seed)}
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>총 상금 풀</span>
              <span className="font-mono text-xs font-bold text-white">
                {parseFloat(formatEther(proof.totalPool)).toLocaleString()} META
              </span>
            </div>
          </div>

          {/* 계산식 */}
          <div
            className="rounded-lg px-3 py-2.5 space-y-1.5"
            style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.15)' }}
          >
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>
              keccak256(hash1 + hash2 + hash3 + seed + pool)
            </p>
            <p className="font-mono text-xs break-all" style={{ color: '#00D9FF' }}>
              → {truncateRandomHex(proof.random)}
            </p>
          </div>

          {/* 당첨 인덱스 */}
          <div
            className="rounded-lg px-3 py-2.5"
            style={{ background: 'rgba(234,179,8,0.06)', border: '1px solid rgba(234,179,8,0.15)' }}
          >
            <div className="flex items-baseline justify-between mb-1.5">
              <span className="text-xs font-bold text-white">당첨 인덱스</span>
              <span className="font-mono text-xs font-black" style={{ color: '#EAB308' }}>
                {proof.winnerIndex.toString()}
              </span>
            </div>
            <p className="font-mono text-xs mb-2" style={{ color: 'rgba(255,255,255,0.65)' }}>
              {truncateRandomHex(proof.random)} % {proof.ticketCount.toString()} = {proof.winnerIndex.toString()}
            </p>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold" style={{ color: 'rgba(255,255,255,0.75)' }}>
                티켓 #{proof.winnerIndex.toString()} 보유자
              </span>
              <span className="font-mono text-xs font-bold" style={{ color: '#EAB308' }}>
                → {winner !== '0x0000000000000000000000000000000000000000'
                  ? `${winner.slice(0, 6)}...${winner.slice(-6)}`
                  : '-'
                }
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
