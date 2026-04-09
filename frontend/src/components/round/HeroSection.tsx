'use client';

import { useCurrentRound } from '@/hooks/useCurrentRound';
import { useTranslations } from 'next-intl';
import { formatEther } from 'viem';
import { RoundStatus } from '@/lib/abis/types';

const label: React.CSSProperties = {
  fontFamily: "'Barlow Condensed', Arial, sans-serif",
  fontWeight: 700,
  fontSize: '0.63rem',
  letterSpacing: '1px',
  textTransform: 'uppercase',
  lineHeight: 0.94,
  color: 'rgba(240, 240, 250, 0.6)',
};

export function HeroSection() {
  const { round, isLoading } = useCurrentRound();
  const t = useTranslations('hero');

  const poolAmount = round ? parseFloat(formatEther(round.totalPool)).toFixed(2) : '0.00';
  const isOpen = round?.status === RoundStatus.Open;

  return (
    <div className="text-center py-16 animate-fade-in-up">
      {/* Status label */}
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 18px',
          borderRadius: '32px',
          border: '1px solid rgba(240, 240, 250, 0.35)',
          background: 'rgba(240, 240, 250, 0.1)',
          marginBottom: '2rem',
          ...label,
        }}
      >
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: isOpen ? '#f0f0fa' : 'rgba(240, 240, 250, 0.35)',
            display: 'inline-block',
          }}
        />
        {isOpen ? t('roundInProgress') : t('waitingDraw')}
      </div>

      {/* Jackpot label */}
      <p
        style={{
          fontFamily: "'Barlow Condensed', Arial, sans-serif",
          fontWeight: 700,
          fontSize: '0.81rem',
          letterSpacing: '1.17px',
          textTransform: 'uppercase',
          color: 'rgba(240, 240, 250, 0.35)',
          marginBottom: '0.5rem',
          lineHeight: 0.94,
        }}
      >
        {t('jackpot')}
      </p>

      {/* Amount */}
      <div
        style={{
          fontFamily: "'Barlow Condensed', Arial, sans-serif",
          fontWeight: 700,
          fontSize: 'clamp(4rem, 12vw, 8rem)',
          lineHeight: 1,
          letterSpacing: '0.96px',
          textTransform: 'uppercase',
          color: '#f0f0fa',
          marginBottom: '0.5rem',
        }}
      >
        {isLoading ? '—' : poolAmount}
        <span
          style={{
            fontSize: 'clamp(1.5rem, 4vw, 3rem)',
            color: 'rgba(240, 240, 250, 0.6)',
            marginLeft: '0.5rem',
          }}
        >
          {t('meta')}
        </span>
      </div>

      {/* Round label */}
      <p
        style={{
          fontFamily: "'Barlow Condensed', Arial, sans-serif",
          fontWeight: 400,
          fontSize: '0.75rem',
          letterSpacing: '1px',
          textTransform: 'uppercase',
          color: 'rgba(240, 240, 250, 0.35)',
          lineHeight: 1,
        }}
      >
        {t('roundLabel', { roundId: round?.roundId?.toString() ?? '1' })}
      </p>
    </div>
  );
}
