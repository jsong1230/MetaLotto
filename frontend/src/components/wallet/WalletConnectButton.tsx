'use client';

import { useAccount, useDisconnect, useBalance } from 'wagmi';
import { formatEther } from 'viem';

/**
 * 지갑 연결 버튼 컴포넌트
 */
export function WalletConnectButton() {
  const { address, isConnected, isConnecting } = useAccount();
  const { disconnect } = useDisconnect();
  const { data: balance } = useBalance({
    address,
  });

  if (isConnecting) {
    return (
      <button
        disabled
        className="px-4 py-2 rounded-lg bg-zinc-100 text-zinc-400 text-sm font-medium cursor-not-allowed dark:bg-zinc-800"
      >
        연결 중...
      </button>
    );
  }

  if (!isConnected || !address) {
    return (
      <button
        onClick={() => {}}
        className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
      >
        지갑 연결
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {/* META 잔액 */}
      {balance && (
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800">
          <span className="text-sm text-zinc-600 dark:text-zinc-400">META</span>
          <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            {parseFloat(formatEther(balance.value)).toFixed(2)}
          </span>
        </div>
      )}

      {/* 주소 표시 및 연결 해제 */}
      <div className="flex items-center gap-2">
        <span className="hidden sm:block text-sm text-zinc-600 dark:text-zinc-400">
          {`${address.slice(0, 6)}...${address.slice(-4)}`}
        </span>
        <button
          onClick={() => disconnect()}
          className="px-3 py-1.5 rounded-lg bg-zinc-200 text-zinc-700 text-xs font-medium hover:bg-zinc-300 transition-colors dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
        >
          연결 해제
        </button>
      </div>
    </div>
  );
}
