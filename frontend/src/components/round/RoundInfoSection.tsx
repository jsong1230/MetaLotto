'use client';

import { useCurrentRound } from '@/hooks/useCurrentRound';
import { useCountdown } from '@/hooks/useCountdown';
import { formatEther } from 'viem';
import { RoundStatus } from '@/lib/abis/types';

/**
 * 라운드 정보 섹션 컴포넌트
 * 현재 라운드의 상태, 남은 시간, 풀 규모, 티켓 수를 표시
 */
export function RoundInfoSection() {
  const { round, isLoading } = useCurrentRound();

  if (isLoading || !round) {
    return (
      <div className="bg-white rounded-2xl border border-zinc-200 p-6 dark:bg-zinc-900 dark:border-zinc-800">
        <div className="animate-pulse">
          <div className="h-6 bg-zinc-200 rounded w-1/3 mb-4 dark:bg-zinc-800" />
          <div className="h-12 bg-zinc-200 rounded w-1/2 mb-4 dark:bg-zinc-800" />
          <div className="h-8 bg-zinc-200 rounded w-1/4 dark:bg-zinc-800" />
        </div>
      </div>
    );
  }

  const { formatted: countdown, isExpired } = useCountdown(round.endTimestamp);

  // 상태 배지 스타일
  const getStatusBadge = (status: RoundStatus) => {
    switch (status) {
      case RoundStatus.Open:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
            진행 중
          </span>
        );
      case RoundStatus.Closing:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
            종료 예정
          </span>
        );
      case RoundStatus.Completed:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400">
            완료
          </span>
        );
      case RoundStatus.Cancelled:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
            취소됨
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-zinc-200 p-6 dark:bg-zinc-900 dark:border-zinc-800">
      {/* 라운드 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            라운드 #{round.roundId.toString()}
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
            현재 진행 중인 복권 라운드
          </p>
        </div>
        {getStatusBadge(round.status)}
      </div>

      {/* 정보 그리드 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 남은 시간 */}
        <div className="bg-zinc-50 rounded-xl p-4 dark:bg-zinc-800">
          <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
            남은 시간
          </p>
          <p className={`text-2xl font-bold ${isExpired ? 'text-zinc-400' : 'text-indigo-600 dark:text-indigo-400'}`}>
            {isExpired ? '종료' : countdown}
          </p>
        </div>

        {/* 풀 규모 */}
        <div className="bg-zinc-50 rounded-xl p-4 dark:bg-zinc-800">
          <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
            누적 상금
          </p>
          <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            {parseFloat(formatEther(round.totalPool)).toFixed(2)}{' '}
            <span className="text-sm font-normal text-zinc-600 dark:text-zinc-400">META</span>
          </p>
        </div>

        {/* 티켓 수 */}
        <div className="bg-zinc-50 rounded-xl p-4 dark:bg-zinc-800">
          <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
            참여 티켓
          </p>
          <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            {round.ticketCount.toString()}{' '}
            <span className="text-sm font-normal text-zinc-600 dark:text-zinc-400">장</span>
          </p>
        </div>

        {/* 티켓 가격 */}
        <div className="bg-zinc-50 rounded-xl p-4 dark:bg-zinc-800">
          <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
            티켓 가격
          </p>
          <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            {parseFloat(formatEther(round.ticketPrice)).toFixed(2)}{' '}
            <span className="text-sm font-normal text-zinc-600 dark:text-zinc-400">META</span>
          </p>
        </div>
      </div>
    </div>
  );
}
