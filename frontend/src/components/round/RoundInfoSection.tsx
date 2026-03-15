'use client';

import { useCurrentRound } from '@/hooks/useCurrentRound';
import { useCountdown } from '@/hooks/useCountdown';
import { useTranslations } from 'next-intl';
import { formatEther } from 'viem';
import { RoundStatus } from '@/lib/abis/types';
import { Clock, Ticket, Users, Zap } from 'lucide-react';

export function RoundInfoSection() {
  const { round, isLoading } = useCurrentRound();
  const { formatted: countdown, isExpired } = useCountdown(round?.endTimestamp ?? 0n);
  const t = useTranslations('roundInfo');

  const cardStyle = {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
  };

  const accentCardStyle = (color: string) => ({
    background: `rgba(${color}, 0.08)`,
    border: `1px solid rgba(${color}, 0.2)`,
  });

  if (isLoading || !round) {
    return (
      <div className="rounded-3xl p-6" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 rounded-lg w-1/3" style={{ background: 'rgba(255,255,255,0.1)' }} />
          <div className="grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => <div key={i} className="h-24 rounded-2xl" style={{ background: 'rgba(255,255,255,0.1)' }} />)}
          </div>
        </div>
      </div>
    );
  }

  const statusConfig: Record<RoundStatus, { label: string; color: string; rgb: string }> = {
    [RoundStatus.Open]: { label: t('inProgress'), color: '#22C55E', rgb: '34,197,94' },
    [RoundStatus.Closing]: { label: t('waitingDraw'), color: '#EAB308', rgb: '234,179,8' },
    [RoundStatus.Completed]: { label: t('completed'), color: '#00D9FF', rgb: '0,217,255' },
    [RoundStatus.Cancelled]: { label: t('cancelled'), color: '#FF6B6B', rgb: '255,107,107' },
  };
  const status = statusConfig[round.status] ?? statusConfig[RoundStatus.Open];

  // 티켓 수량 표시: 한국어/중국어/일본어는 단위 후치, 영어는 prefix 없음
  const ticketDisplay = `${round.ticketCount.toString()}${t('tickets') ? ` ${t('tickets')}` : ''}`;

  const stats = [
    {
      icon: <Clock className="w-5 h-5" style={{ color: '#00D9FF' }} />,
      label: t('timeLeft'),
      value: isExpired ? t('expired') : countdown,
      valueColor: isExpired ? 'rgba(255,255,255,0.4)' : '#00D9FF',
      accentRgb: '0, 217, 255',
    },
    {
      icon: <Ticket className="w-5 h-5" style={{ color: '#EAB308' }} />,
      label: t('ticketsIssued'),
      value: ticketDisplay,
      valueColor: '#EAB308',
      accentRgb: '234, 179, 8',
    },
    {
      icon: <Zap className="w-5 h-5" style={{ color: '#7C3AED' }} />,
      label: t('ticketPrice'),
      value: `${parseFloat(formatEther(round.ticketPrice)).toFixed(0)} ${t('metaUnit')}`,
      valueColor: '#7C3AED',
      accentRgb: '124, 58, 237',
    },
    {
      icon: <Users className="w-5 h-5" style={{ color: '#FF6B6B' }} />,
      label: t('round'),
      value: `#${round.roundId.toString()}`,
      valueColor: '#FF6B6B',
      accentRgb: '255, 107, 107',
    },
  ];

  return (
    <div className="rounded-3xl p-6" style={cardStyle}>
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-black text-white">{t('title')}</h2>
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold"
          style={{ background: `rgba(${status.rgb}, 0.15)`, border: `1px solid ${status.color}40`, color: status.color }}
        >
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: status.color }} />
          {status.label}
        </div>
      </div>

      {/* 스탯 그리드 */}
      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="p-4 rounded-2xl transition-all duration-300"
            style={accentCardStyle(stat.accentRgb)}
            onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
          >
            <div className="flex items-center gap-2 mb-2">
              {stat.icon}
              <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.6)' }}>{stat.label}</span>
            </div>
            <p className="text-2xl font-black" style={{ color: stat.valueColor }}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* 상금 풀 바 */}
      {round.totalPool > 0n && (
        <div className="mt-4 p-4 rounded-2xl" style={{ background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.2)' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.6)' }}>{t('totalPool')}</span>
            <span className="text-sm font-black" style={{ color: '#EAB308' }}>{t('prizeToWinner')}</span>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-black" style={{ color: '#EAB308' }}>{parseFloat(formatEther(round.totalPool)).toFixed(2)}</span>
            <span className="text-sm font-bold mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>{t('metaUnit')}</span>
          </div>
        </div>
      )}
    </div>
  );
}
