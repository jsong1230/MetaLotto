'use client';

import { useCurrentRound } from '@/hooks/useCurrentRound';
import { useCountdown } from '@/hooks/useCountdown';
import { useTranslations } from 'next-intl';
import { formatEther } from 'viem';
import { RoundStatus } from '@/lib/abis/types';

const sectionStyle: React.CSSProperties = {
  border: '1px solid rgba(240, 240, 250, 0.1)',
  padding: '1.5rem',
};

const microLabel: React.CSSProperties = {
  fontFamily: "'Barlow Condensed', Arial, sans-serif",
  fontWeight: 700,
  fontSize: '0.63rem',
  letterSpacing: '1px',
  textTransform: 'uppercase',
  color: 'rgba(240, 240, 250, 0.35)',
  lineHeight: 0.94,
};

const valueStyle: React.CSSProperties = {
  fontFamily: "'Barlow Condensed', Arial, sans-serif",
  fontWeight: 700,
  fontSize: '1.75rem',
  letterSpacing: '0.96px',
  textTransform: 'uppercase',
  color: '#f0f0fa',
  lineHeight: 1,
};

const sectionTitle: React.CSSProperties = {
  fontFamily: "'Barlow Condensed', Arial, sans-serif",
  fontWeight: 700,
  fontSize: '0.81rem',
  letterSpacing: '1.17px',
  textTransform: 'uppercase',
  color: '#f0f0fa',
  lineHeight: 0.94,
};

export function RoundInfoSection() {
  const { round, isLoading } = useCurrentRound();
  const { formatted: countdown, isExpired } = useCountdown(round?.endTimestamp ?? 0n);
  const t = useTranslations('roundInfo');

  if (isLoading || !round) {
    return (
      <div style={sectionStyle}>
        <div className="animate-pulse space-y-4">
          <div className="h-4 w-1/3" style={{ background: 'rgba(240, 240, 250, 0.08)' }} />
          <div className="grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20" style={{ background: 'rgba(240, 240, 250, 0.05)' }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const statusLabels: Record<RoundStatus, string> = {
    [RoundStatus.Open]: t('inProgress'),
    [RoundStatus.Closing]: t('waitingDraw'),
    [RoundStatus.Completed]: t('completed'),
    [RoundStatus.Cancelled]: t('cancelled'),
  };

  const isActive = round.status === RoundStatus.Open;
  const statusLabel = statusLabels[round.status] ?? statusLabels[RoundStatus.Open];
  const ticketDisplay = `${round.ticketCount.toString()}${t('tickets') ? ` ${t('tickets')}` : ''}`;

  const stats = [
    { label: t('timeLeft'), value: isExpired ? t('expired') : countdown },
    { label: t('ticketsIssued'), value: ticketDisplay },
    { label: t('ticketPrice'), value: `${parseFloat(formatEther(round.ticketPrice)).toFixed(0)} ${t('metaUnit')}` },
    { label: t('round'), value: `#${round.roundId.toString()}` },
  ];

  return (
    <div style={sectionStyle}>
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <span style={sectionTitle}>{t('title')}</span>
        <span
          style={{
            ...microLabel,
            padding: '6px 14px',
            border: '1px solid rgba(240, 240, 250, 0.35)',
            background: 'rgba(240, 240, 250, 0.1)',
            borderRadius: '32px',
            color: isActive ? '#f0f0fa' : 'rgba(240, 240, 250, 0.35)',
          }}
        >
          {statusLabel}
        </span>
      </div>

      {/* 스탯 그리드 */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {stats.map((stat, i) => (
          <div
            key={i}
            style={{
              padding: '1rem',
              border: '1px solid rgba(240, 240, 250, 0.08)',
            }}
          >
            <p style={microLabel}>{stat.label}</p>
            <p style={{ ...valueStyle, marginTop: '0.5rem' }}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* 상금 풀 */}
      {round.totalPool > 0n && (
        <div
          style={{
            padding: '1rem',
            border: '1px solid rgba(240, 240, 250, 0.15)',
          }}
        >
          <div className="flex items-center justify-between mb-1">
            <span style={microLabel}>{t('totalPool')}</span>
            <span style={{ ...microLabel, color: 'rgba(240, 240, 250, 0.35)' }}>{t('prizeToWinner')}</span>
          </div>
          <p
            style={{
              fontFamily: "'Barlow Condensed', Arial, sans-serif",
              fontWeight: 700,
              fontSize: '2.5rem',
              letterSpacing: '0.96px',
              color: '#f0f0fa',
              lineHeight: 1,
            }}
          >
            {parseFloat(formatEther(round.totalPool)).toFixed(2)}
            <span style={{ fontSize: '1rem', color: 'rgba(240, 240, 250, 0.6)', marginLeft: '0.4rem' }}>
              {t('metaUnit')}
            </span>
          </p>
        </div>
      )}
    </div>
  );
}
