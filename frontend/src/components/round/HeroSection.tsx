'use client';

import { useCurrentRound } from '@/hooks/useCurrentRound';
import { useTranslations } from 'next-intl';
import { formatEther } from 'viem';
import { RoundStatus } from '@/lib/abis/types';

export function HeroSection() {
  const { round, isLoading } = useCurrentRound();
  const t = useTranslations('hero');

  const poolAmount = round ? parseFloat(formatEther(round.totalPool)).toFixed(2) : '0.00';
  const isOpen = round?.status === RoundStatus.Open;

  return (
    <div className="text-center py-12 animate-fade-in-up">
      <div
        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6 text-xs font-black uppercase tracking-widest"
        style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.8)' }}
      >
        <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: isOpen ? '#22C55E' : '#EAB308' }} />
        {isOpen ? t('roundInProgress') : t('waitingDraw')}
      </div>

      <h1
        className="text-5xl sm:text-7xl font-black mb-2 leading-none tracking-tight"
        style={{ color: 'rgba(255,255,255,0.5)', letterSpacing: '-0.03em' }}
      >
        {t('jackpot')}
      </h1>

      <div
        className="text-6xl sm:text-8xl font-black leading-none mb-4"
        style={{ background: 'linear-gradient(135deg, #EAB308 0%, #00D9FF 50%, #7C3AED 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.03em' }}
      >
        {isLoading ? '...' : poolAmount}
        <span
          className="text-3xl sm:text-5xl ml-2"
          style={{ background: 'linear-gradient(135deg, #EAB308 0%, #00D9FF 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
        >
          {t('meta')}
        </span>
      </div>

      <p className="text-base sm:text-lg" style={{ color: 'rgba(255,255,255,0.5)' }}>
        {t('roundLabel', { roundId: round?.roundId?.toString() ?? '1' })}
      </p>
    </div>
  );
}
