'use client';

import { useState } from 'react';
import { useRoundHistory, maskAddress, formatTimestamp } from '@/hooks/useRoundHistory';
import { formatEther } from 'viem';
import { RoundStatus, Round } from '@/lib/abis/types';

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
          <div key={i} className="bg-white rounded-xl border border-zinc-200 p-4 dark:bg-zinc-900 dark:border-zinc-800">
            <div className="animate-pulse">
              <div className="h-6 bg-zinc-200 rounded w-1/4 mb-3 dark:bg-zinc-800" />
              <div className="h-4 bg-zinc-200 rounded w-1/2 mb-2 dark:bg-zinc-800" />
              <div className="h-4 bg-zinc-200 rounded w-1/3 dark:bg-zinc-800" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!rounds || rounds.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-zinc-200 p-8 text-center dark:bg-zinc-900 dark:border-zinc-800">
        <p className="text-zinc-600 dark:text-zinc-400">아직 히스토리가 없습니다.</p>
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
        <div className="flex items-center justify-between pt-4 border-t border-zinc-200 dark:border-zinc-800">
          <button
            onClick={handlePreviousPage}
            disabled={!hasPreviousPage}
            className="px-4 py-2 rounded-lg border border-zinc-300 text-zinc-700 text-sm font-medium hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            이전
          </button>
          <span className="text-sm text-zinc-600 dark:text-zinc-400">
            {page} / {totalPages}
          </span>
          <button
            onClick={handleNextPage}
            disabled={!hasNextPage}
            className="px-4 py-2 rounded-lg border border-zinc-300 text-zinc-700 text-sm font-medium hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
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
  const getStatusBadge = (status: RoundStatus) => {
    switch (status) {
      case RoundStatus.Completed:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
            완료
          </span>
        );
      case RoundStatus.Cancelled:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
            취소됨
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-zinc-200 p-4 hover:border-zinc-300 transition-colors dark:bg-zinc-900 dark:border-zinc-800 dark:hover:border-zinc-700">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* 라운드 ID와 상태 */}
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              라운드 #{round.roundId.toString()}
            </h3>
            {getStatusBadge(round.status)}
          </div>

          {/* 당첨자 정보 (완료된 경우) */}
          {round.status === RoundStatus.Completed && round.winner !== '0x0000000000000000000000000000000000000000' && (
            <div className="flex items-center gap-2 mb-3">
              <svg
                className="w-4 h-4 text-indigo-600 dark:text-indigo-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                />
              </svg>
              <span className="text-sm text-zinc-600 dark:text-zinc-400">
                당첨자: <span className="font-mono font-medium">{maskAddress(round.winner)}</span>
              </span>
            </div>
          )}

          {/* 상세 정보 그리드 */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* 당첨 금액 */}
            {round.status === RoundStatus.Completed && round.winnerPrize > 0n && (
              <div>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-1">당첨 금액</p>
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {parseFloat(formatEther(round.winnerPrize)).toFixed(2)} META
                </p>
              </div>
            )}

            {/* 티켓 수 */}
            <div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-1">참여 티켓</p>
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {round.ticketCount.toString()}장
              </p>
            </div>

            {/* 풀 규모 */}
            <div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-1">총 상금</p>
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {parseFloat(formatEther(round.totalPool)).toFixed(2)} META
              </p>
            </div>

            {/* 일시 */}
            <div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-1">일시</p>
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {formatTimestamp(round.endTimestamp)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
