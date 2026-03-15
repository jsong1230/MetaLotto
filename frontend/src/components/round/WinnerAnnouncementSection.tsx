'use client';

import { useCurrentRound } from '@/hooks/useCurrentRound';
import { useTranslations } from 'next-intl';
import { formatEther } from 'viem';
import { RoundStatus } from '@/lib/abis/types';
import { Trophy } from 'lucide-react';

export function WinnerAnnouncementSection() {
  const { round } = useCurrentRound();
  const t = useTranslations('winner');

  if (!round || round.status !== RoundStatus.Completed || round.winner === '0x0000000000000000000000000000000000000000') {
    return null;
  }

  const winnerShort = `${round.winner.slice(0, 6)}...${round.winner.slice(-4)}`;

  return (
    <div className="mb-6 rounded-3xl p-6 animate-fade-in-up" style={{ background: 'linear-gradient(135deg, rgba(234,179,8,0.15) 0%, rgba(0,217,255,0.1) 100%)', border: '1px solid rgba(234,179,8,0.3)' }}>
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 animate-pulse-glow" style={{ background: 'linear-gradient(135deg, #EAB308 0%, #00D9FF 100%)' }}>
          <Trophy className="w-7 h-7 text-white" />
        </div>
        <div>
          <p className="text-xs font-black uppercase tracking-widest mb-1" style={{ color: '#EAB308' }}>🎉 {t('title')}</p>
          <p className="font-mono text-lg font-bold text-white">{winnerShort}</p>
          <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.7)' }}>
            <span style={{ color: '#00D9FF' }}>{parseFloat(formatEther(round.winnerPrize)).toFixed(2)} META</span>{' '}
            {t('received')}
          </p>
        </div>
      </div>
    </div>
  );
}
