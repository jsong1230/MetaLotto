'use client';

import { useCurrentRound } from '@/hooks/useCurrentRound';
import { formatEther } from 'viem';
import { RoundStatus } from '@/lib/abis/types';

/**
 * 당첨자 발표 섹션 컴포넌트
 * 라운드 완료 시 당첨자 정보를 표시
 */
export function WinnerAnnouncementSection() {
  const { round } = useCurrentRound();

  // 라운드가 완료되었고 당첨자가 있는 경우만 표시
  const shouldShow = round?.status === RoundStatus.Completed && round.winner !== '0x0000000000000000000000000000000000000000';

  if (!shouldShow) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">
            축하합니다! 당첨자가 발표되었습니다
          </h2>
          <p className="text-white/80 text-sm">
            라운드 #{round.roundId.toString()} 당첨자
          </p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold mb-1">
            {parseFloat(formatEther(round.winnerPrize)).toFixed(2)} META
          </p>
          <p className="text-white/80 text-sm">
            당첨 금액
          </p>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-white/20">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
            <svg
              className="w-6 h-6"
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
          </div>
          <div>
            <p className="text-xs text-white/60">당첨자 주소</p>
            <p className="font-mono text-sm">
              {`${round.winner.slice(0, 8)}...${round.winner.slice(-6)}`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
