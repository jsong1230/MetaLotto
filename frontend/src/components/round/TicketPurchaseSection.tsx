'use client';

import { useState } from 'react';
import { useTicketPurchase } from '@/hooks/useTicketPurchase';
import { useCurrentRound } from '@/hooks/useCurrentRound';
import { useMyTickets } from '@/hooks/useMyTickets';
import { useAccount } from 'wagmi';
import { formatEther } from 'viem';
import { RoundStatus } from '@/lib/abis/types';

/**
 * 티켓 구매 섹션 컴포넌트
 */
export function TicketPurchaseSection() {
  const { address, isConnected } = useAccount();
  const { round } = useCurrentRound();
  const { ticketCount: myTickets } = useMyTickets(round?.roundId);
  const { buyTickets, calculateTotalPrice, isPending, isConfirming, isSuccess } = useTicketPurchase();

  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const isOpen = round?.status === RoundStatus.Open;
  const ticketPrice = round?.ticketPrice || 0n;
  const totalPrice = calculateTotalPrice(quantity, ticketPrice);

  const handleQuantityChange = (value: number) => {
    const newValue = Math.max(1, Math.min(100, value));
    setQuantity(newValue);
    setError(null);
  };

  const handlePurchase = async () => {
    if (!isConnected) {
      setError('지갑을 연결해 주세요.');
      return;
    }

    if (!isOpen) {
      setError('현재 라운드가 종료되었습니다.');
      return;
    }

    try {
      setError(null);
      await buyTickets(quantity, ticketPrice);
    } catch (err) {
      const message = err instanceof Error ? err.message : '구매에 실패했습니다.';
      setError(message);
    }
  };

  // 트랜잭션 성공 후 수량 초기화
  if (isSuccess) {
    setTimeout(() => {
      setQuantity(1);
      setError(null);
    }, 2000);
  }

  return (
    <div className="bg-white rounded-2xl border border-zinc-200 p-6 dark:bg-zinc-900 dark:border-zinc-800">
      <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-6">
        티켓 구매
      </h2>

      {!isConnected ? (
        <div className="text-center py-8">
          <p className="text-zinc-600 dark:text-zinc-400 mb-4">
            지갑을 연결하여 티켓을 구매하세요
          </p>
        </div>
      ) : !isOpen ? (
        <div className="text-center py-8">
          <p className="text-zinc-600 dark:text-zinc-400">
            현재 라운드가 종료되었습니다
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* 수량 선택 */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              수량 선택
            </label>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => handleQuantityChange(quantity - 1)}
                disabled={quantity <= 1}
                className="w-10 h-10 rounded-lg border border-zinc-300 flex items-center justify-center text-zinc-600 hover:bg-zinc-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
              >
                -
              </button>
              <div className="flex-1 text-center">
                <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                  {quantity}
                </span>
                <span className="text-sm text-zinc-600 dark:text-zinc-400 ml-1">장</span>
              </div>
              <button
                type="button"
                onClick={() => handleQuantityChange(quantity + 1)}
                disabled={quantity >= 100}
                className="w-10 h-10 rounded-lg border border-zinc-300 flex items-center justify-center text-zinc-600 hover:bg-zinc-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
              >
                +
              </button>
            </div>
            <div className="flex justify-between mt-2">
              {[1, 5, 10, 20].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handleQuantityChange(preset)}
                  className={`text-xs px-2 py-1 rounded ${
                    quantity === preset
                      ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
                      : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700'
                  }`}
                >
                  {preset}장
                </button>
              ))}
            </div>
          </div>

          {/* 총 가격 */}
          <div className="bg-zinc-50 rounded-xl p-4 dark:bg-zinc-800">
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-600 dark:text-zinc-400">총 가격</span>
              <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                {totalPrice} <span className="text-sm font-normal text-zinc-600 dark:text-zinc-400">META</span>
              </span>
            </div>
          </div>

          {/* 내 티켓 수 */}
          {myTickets !== undefined && myTickets > 0n && (
            <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              현재 {myTickets.toString()}장 보유 중
            </div>
          )}

          {/* 에러 메시지 */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
              {error}
            </div>
          )}

          {/* 구매 버튼 */}
          <button
            type="button"
            onClick={handlePurchase}
            disabled={isPending || isConfirming}
            className="w-full py-4 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isConfirming
              ? '처리 중...'
              : isPending
              ? '서명 대기 중...'
              : isSuccess
              ? '구매 완료!'
              : `${totalPrice} META 구매`}
          </button>

          {/* 안내 메시지 */}
          <p className="text-xs text-zinc-500 dark:text-zinc-500 text-center">
            티켓 구매는 1회 최대 100장까지 가능합니다
          </p>
        </div>
      )}
    </div>
  );
}
