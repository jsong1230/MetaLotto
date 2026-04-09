'use client';

import { useCurrentRound } from '@/hooks/useCurrentRound';
import { useTranslations } from 'next-intl';
import { formatEther } from 'viem';
import { RoundStatus } from '@/lib/abis/types';

export function WinnerAnnouncementSection() {
  const { round } = useCurrentRound();
  const t = useTranslations('winner');

  if (!round || round.status !== RoundStatus.Completed || round.winner === '0x0000000000000000000000000000000000000000') {
    return null;
  }

  const winnerShort = `${round.winner.slice(0, 6)}...${round.winner.slice(-4)}`;

  return (
    <div
      className="mb-6 animate-fade-in-up"
      style={{
        border: '1px solid rgba(240, 240, 250, 0.35)',
        background: 'rgba(240, 240, 250, 0.05)',
        padding: '1.5rem',
      }}
    >
      <p
        style={{
          fontFamily: "'Barlow Condensed', Arial, sans-serif",
          fontWeight: 700,
          fontSize: '0.63rem',
          letterSpacing: '1px',
          textTransform: 'uppercase',
          color: 'rgba(240, 240, 250, 0.35)',
          lineHeight: 0.94,
          marginBottom: '0.75rem',
        }}
      >
        {t('title')}
      </p>
      <p
        style={{
          fontFamily: "'Barlow Condensed', Arial, sans-serif",
          fontWeight: 700,
          fontSize: '1.5rem',
          letterSpacing: '0.96px',
          textTransform: 'uppercase',
          color: '#f0f0fa',
          marginBottom: '0.25rem',
        }}
      >
        {winnerShort}
      </p>
      <p
        style={{
          fontFamily: "'Barlow Condensed', Arial, sans-serif",
          fontSize: '0.81rem',
          letterSpacing: '1.17px',
          textTransform: 'uppercase',
          color: 'rgba(240, 240, 250, 0.6)',
        }}
      >
        {parseFloat(formatEther(round.winnerPrize)).toFixed(2)} META — {t('received')}
      </p>
    </div>
  );
}
