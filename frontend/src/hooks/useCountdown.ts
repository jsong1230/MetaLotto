/**
 * 카운트다운 타이머 훅
 *
 * 남은 시간을 실시간으로 계산하여 표시합니다.
 */

import { useState, useEffect } from 'react';
import { formatEther } from 'viem';

interface CountdownResult {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
  formatted: string;
}

/**
 * 카운트다운 훅
 * @param endTimestamp 종료 타임스탬프 (Unix timestamp in seconds)
 */
export function useCountdown(endTimestamp: bigint) {
  const [remaining, setRemaining] = useState<bigint>(0n);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const updateRemaining = () => {
      const now = BigInt(Math.floor(Date.now() / 1000));
      const diff = endTimestamp - now;
      const newRemaining = diff > 0n ? diff : 0n;
      setRemaining(newRemaining);
      setIsExpired(diff <= 0n);
    };

    updateRemaining();
    const interval = setInterval(updateRemaining, 1000);

    return () => clearInterval(interval);
  }, [endTimestamp]);

  // 초 단위 값을 시간, 분, 초로 변환
  const days = Number(remaining / 86400n);
  const hours = Number((remaining % 86400n) / 3600n);
  const minutes = Number((remaining % 3600n) / 60n);
  const seconds = Number(remaining % 60n);

  // 포맷된 문자열 생성
  const formatted = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  const fullFormatted = days > 0
    ? `${days}일 ${formatted}`
    : formatted;

  return {
    days,
    hours,
    minutes,
    seconds,
    isExpired,
    formatted: fullFormatted,
  };
}

/**
 * 라운드 상태에 따른 카운트다운 메시지
 */
export function getCountdownMessage(
  endTimestamp: bigint,
  status: number,
): string {
  const { formatted, isExpired } = useCountdown(endTimestamp);

  if (isExpired) {
    return '종료됨';
  }

  return formatted;
}
