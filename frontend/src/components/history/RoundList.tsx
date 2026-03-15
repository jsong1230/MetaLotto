'use client';

import { useState } from 'react';
import { useRoundHistory, maskAddress, formatTimestamp } from '@/hooks/useRoundHistory';
import { formatEther } from 'viem';
import { RoundStatus, Round } from '@/lib/abis/types';
import { DrawProofPanel } from '@/components/history/DrawProofPanel';

/**
 * 라운드 목록 컴포넌트
 */
export function RoundList() {
  const [page, setPage] = useState(1);
  const { rounds, isLoading, totalPages, hasNextPage, hasPreviousPage } = useRoundHistory(page) as {
    rounds: Round[] | undefined;
    isLoading: boolean;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };

  const handlePreviousPage = () => {
    if (hasPreviousPage) {
      setPage(page - 1);
    }
  };

  const handleNextPage = () => {
    if (hasNextPage) {
      setPage(page + 1);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="rounded-2xl p-4 animate-pulse" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="h-6 rounded-lg w-1/4 mb-3" style={{ background: 'rgba(255,255,255,0.1)' }} />
            <div className="h-4 rounded-lg w-1/2 mb-2" style={{ background: 'rgba(255,255,255,0.08)' }} />
            <div className="h-4 rounded-lg w-1/3" style={{ background: 'rgba(255,255,255,0.08)' }} />
          </div>
        ))}
      </div>
    );
  }

  if (!rounds || rounds.length === 0) {
    return (
      <div className="rounded-2xl p-8 text-center" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <p style={{ color: 'rgba(255,255,255,0.5)' }}>아직 히스토리가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 라운드 카드 목록 */}
      <div className="space-y-4">
        {rounds.map((round) => (
          <RoundCard key={round.roundId.toString()} round={round} />
        ))}
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
          <button
            onClick={handlePreviousPage}
            disabled={!hasPreviousPage}
            className="px-4 py-2 rounded-xl text-sm font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.8)' }}
          >
            이전
          </button>
          <span className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>
            {page} / {totalPages}
          </span>
          <button
            onClick={handleNextPage}
            disabled={!hasNextPage}
            className="px-4 py-2 rounded-xl text-sm font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.8)' }}
          >
            다음
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * 라운드 카드 컴포넌트
 */
function RoundCard({ round }: { round: Round }) {
  const [showProof, setShowProof] = useState(false);
  const isCompleted = round.status === RoundStatus.Completed;
  const getStatusBadge = (status: RoundStatus) => {
    switch (status) {
      case RoundStatus.Completed:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold" style={{ background: 'rgba(0,217,255,0.15)', border: '1px solid rgba(0,217,255,0.3)', color: '#00D9FF' }}>
            완료
          </span>
        );
      case RoundStatus.Cancelled:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold" style={{ background: 'rgba(255,107,107,0.15)', border: '1px solid rgba(255,107,107,0.3)', color: '#FF6B6B' }}>
            취소됨
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className="rounded-2xl p-5 transition-all duration-300 cursor-default"
      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      {/* 라운드 ID와 상태 */}
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-lg font-black text-white">라운드 #{round.roundId.toString()}</h3>
        {getStatusBadge(round.status)}
      </div>

      {/* 당첨자 정보 */}
      {round.status === RoundStatus.Completed && round.winner !== '0x0000000000000000000000000000000000000000' && (
        <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-xl" style={{ background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.2)' }}>
          <span>🏆</span>
          <span className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>
            당첨자: <span className="font-mono font-bold" style={{ color: '#EAB308' }}>{maskAddress(round.winner)}</span>
          </span>
        </div>
      )}

      {/* 상세 정보 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {round.status === RoundStatus.Completed && round.winnerPrize > 0n && (
          <div>
            <p className="text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>당첨 금액</p>
            <p className="text-sm font-black" style={{ color: '#EAB308' }}>{parseFloat(formatEther(round.winnerPrize)).toFixed(0)} META</p>
          </div>
        )}
        <div>
          <p className="text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>참여 티켓</p>
          <p className="text-sm font-black text-white">{round.ticketCount.toString()}장</p>
        </div>
        <div>
          <p className="text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>총 상금</p>
          <p className="text-sm font-black text-white">{parseFloat(formatEther(round.totalPool)).toFixed(0)} META</p>
        </div>
        <div>
          <p className="text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>종료 일시</p>
          <p className="text-sm font-bold" style={{ color: 'rgba(255,255,255,0.7)' }}>{formatTimestamp(round.endTimestamp)}</p>
        </div>
      </div>

      {/* 추첨 검증 토글 버튼 (완료된 라운드만) */}
      {isCompleted && (
        <div className="mt-4 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <button
            onClick={() => setShowProof(!showProof)}
            className="flex items-center gap-1.5 text-xs font-bold transition-all duration-200"
            style={{ color: showProof ? '#00D9FF' : 'rgba(0,217,255,0.6)' }}
          >
            <span
              className="transition-transform duration-200"
              style={{ display: 'inline-block', transform: showProof ? 'rotate(90deg)' : 'rotate(0deg)' }}
            >
              ▶
            </span>
            {showProof ? '접기' : '추첨 검증'}
          </button>

          {/* DrawProofPanel */}
          {showProof && (
            <DrawProofPanel round={round} winner={round.winner} />
          )}
        </div>
      )}
    </div>
  );
}
