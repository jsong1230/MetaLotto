'use client';

import { useState } from 'react';
import { useRoundHistory, maskAddress, formatTimestamp } from '@/hooks/useRoundHistory';
import { formatEther } from 'viem';
import { RoundStatus, Round } from '@/lib/abis/types';
import { DrawProofPanel } from '@/components/history/DrawProofPanel';

const micro: React.CSSProperties = {
  fontFamily: "'Barlow Condensed', Arial, sans-serif",
  fontWeight: 700,
  fontSize: '0.63rem',
  letterSpacing: '1px',
  textTransform: 'uppercase',
  color: 'rgba(240, 240, 250, 0.35)',
  lineHeight: 0.94,
};

const ghostBtn: React.CSSProperties = {
  border: '1px solid rgba(240, 240, 250, 0.35)',
  background: 'rgba(240, 240, 250, 0.1)',
  color: '#f0f0fa',
  borderRadius: '32px',
  fontFamily: "'Barlow Condensed', Arial, sans-serif",
  fontWeight: 700,
  fontSize: '0.75rem',
  letterSpacing: '1.17px',
  textTransform: 'uppercase' as const,
  padding: '8px 18px',
  cursor: 'pointer',
  transition: 'background 0.2s',
};

export function RoundList() {
  const [page, setPage] = useState(1);
  const { rounds, isLoading, totalPages, hasNextPage, hasPreviousPage } = useRoundHistory(page) as {
    rounds: Round[] | undefined;
    isLoading: boolean;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse p-5" style={{ border: '1px solid rgba(240, 240, 250, 0.08)' }}>
            <div className="h-4 w-1/4 mb-3" style={{ background: 'rgba(240, 240, 250, 0.08)' }} />
            <div className="h-3 w-1/2" style={{ background: 'rgba(240, 240, 250, 0.05)' }} />
          </div>
        ))}
      </div>
    );
  }

  if (!rounds || rounds.length === 0) {
    return (
      <div className="p-8 text-center" style={{ border: '1px solid rgba(240, 240, 250, 0.08)' }}>
        <p style={micro}>아직 히스토리가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {rounds.map((round) => (
          <RoundCard key={round.roundId.toString()} round={round} />
        ))}
      </div>

      {totalPages > 1 && (
        <div
          className="flex items-center justify-between pt-4"
          style={{ borderTop: '1px solid rgba(240, 240, 250, 0.08)' }}
        >
          <button
            onClick={() => hasPreviousPage && setPage(page - 1)}
            disabled={!hasPreviousPage}
            style={{ ...ghostBtn, opacity: hasPreviousPage ? 1 : 0.3, cursor: hasPreviousPage ? 'pointer' : 'not-allowed' }}
          >
            이전
          </button>
          <span style={micro}>{page} / {totalPages}</span>
          <button
            onClick={() => hasNextPage && setPage(page + 1)}
            disabled={!hasNextPage}
            style={{ ...ghostBtn, opacity: hasNextPage ? 1 : 0.3, cursor: hasNextPage ? 'pointer' : 'not-allowed' }}
          >
            다음
          </button>
        </div>
      )}
    </div>
  );
}

function RoundCard({ round }: { round: Round }) {
  const [showProof, setShowProof] = useState(false);
  const isCompleted = round.status === RoundStatus.Completed;

  const statusLabel =
    round.status === RoundStatus.Completed ? '완료' :
    round.status === RoundStatus.Cancelled ? '취소됨' :
    round.status === RoundStatus.Closing ? '마감 중' : '진행 중';

  const isActive = round.status === RoundStatus.Open;

  return (
    <div
      style={{
        padding: '1.25rem',
        border: '1px solid rgba(240, 240, 250, 0.08)',
        transition: 'border-color 0.2s',
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(240, 240, 250, 0.2)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(240, 240, 250, 0.08)'; }}
    >
      {/* 헤더 */}
      <div className="flex items-center gap-3 mb-4">
        <h3
          style={{
            fontFamily: "'Barlow Condensed', Arial, sans-serif",
            fontWeight: 700,
            fontSize: '1.1rem',
            letterSpacing: '0.96px',
            textTransform: 'uppercase',
            color: '#f0f0fa',
          }}
        >
          라운드 #{round.roundId.toString()}
        </h3>
        <span
          style={{
            ...micro,
            padding: '3px 10px',
            border: '1px solid rgba(240, 240, 250, 0.35)',
            background: 'rgba(240, 240, 250, 0.1)',
            borderRadius: '32px',
            color: isActive ? '#f0f0fa' : 'rgba(240, 240, 250, 0.35)',
          }}
        >
          {statusLabel}
        </span>
      </div>

      {/* 당첨자 */}
      {round.status === RoundStatus.Completed && round.winner !== '0x0000000000000000000000000000000000000000' && (
        <div style={{ marginBottom: '1rem', padding: '0.5rem 0.75rem', border: '1px solid rgba(240, 240, 250, 0.15)' }}>
          <span style={{ ...micro, color: 'rgba(240, 240, 250, 0.5)' }}>
            당첨자: <span style={{ color: '#f0f0fa', fontFamily: 'monospace' }}>{maskAddress(round.winner)}</span>
          </span>
        </div>
      )}

      {/* 상세 정보 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {round.status === RoundStatus.Completed && round.winnerPrize > 0n && (
          <div>
            <p style={micro}>당첨 금액</p>
            <p
              style={{
                fontFamily: "'Barlow Condensed', Arial, sans-serif",
                fontWeight: 700,
                fontSize: '1rem',
                letterSpacing: '0.96px',
                color: '#f0f0fa',
                marginTop: '4px',
              }}
            >
              {parseFloat(formatEther(round.winnerPrize)).toFixed(0)} META
            </p>
          </div>
        )}
        <div>
          <p style={micro}>참여 티켓</p>
          <p style={{ fontFamily: "'Barlow Condensed', Arial, sans-serif", fontWeight: 700, fontSize: '1rem', letterSpacing: '0.96px', color: '#f0f0fa', marginTop: '4px' }}>
            {round.ticketCount.toString()}장
          </p>
        </div>
        <div>
          <p style={micro}>총 상금</p>
          <p style={{ fontFamily: "'Barlow Condensed', Arial, sans-serif", fontWeight: 700, fontSize: '1rem', letterSpacing: '0.96px', color: '#f0f0fa', marginTop: '4px' }}>
            {parseFloat(formatEther(round.totalPool)).toFixed(0)} META
          </p>
        </div>
        <div>
          <p style={micro}>종료 일시</p>
          <p style={{ fontFamily: "'Barlow Condensed', Arial, sans-serif", fontSize: '0.875rem', color: 'rgba(240, 240, 250, 0.6)', marginTop: '4px' }}>
            {formatTimestamp(round.endTimestamp)}
          </p>
        </div>
      </div>

      {/* 추첨 검증 */}
      {isCompleted && (
        <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(240, 240, 250, 0.06)' }}>
          <button
            onClick={() => setShowProof(!showProof)}
            style={{
              ...micro,
              color: 'rgba(240, 240, 250, 0.6)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'color 0.2s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#f0f0fa'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(240, 240, 250, 0.6)'; }}
          >
            <span style={{ display: 'inline-block', transform: showProof ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }}>▶</span>
            {showProof ? '접기' : '추첨 검증'}
          </button>

          {showProof && <DrawProofPanel round={round} winner={round.winner} />}
        </div>
      )}
    </div>
  );
}
