'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';

interface DrawMechanismModalProps {
  onClose: () => void;
}

const micro: React.CSSProperties = {
  fontFamily: "'Barlow Condensed', Arial, sans-serif",
  fontWeight: 700,
  fontSize: '0.63rem',
  letterSpacing: '1px',
  textTransform: 'uppercase',
  color: 'rgba(240, 240, 250, 0.35)',
  lineHeight: 0.94,
};

export function DrawMechanismModal({ onClose }: DrawMechanismModalProps) {
  const t = useTranslations('drawMechanism');

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(8px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        style={{
          background: '#000000',
          border: '1px solid rgba(240, 240, 250, 0.35)',
          padding: '2rem',
        }}
      >
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.5rem',
            right: '1.5rem',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid rgba(240, 240, 250, 0.35)',
            background: 'rgba(240, 240, 250, 0.1)',
            color: '#f0f0fa',
            cursor: 'pointer',
            fontFamily: "'Barlow Condensed', Arial, sans-serif",
            fontSize: '1rem',
            borderRadius: '32px',
            transition: 'background 0.2s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(240, 240, 250, 0.2)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(240, 240, 250, 0.1)'; }}
        >
          ✕
        </button>

        {/* 헤더 */}
        <div style={{ marginBottom: '1.5rem' }}>
          <p style={micro}>ON-CHAIN RANDOMNESS</p>
          <h2
            style={{
              fontFamily: "'Barlow Condensed', Arial, sans-serif",
              fontWeight: 700,
              fontSize: '1.75rem',
              letterSpacing: '0.96px',
              textTransform: 'uppercase',
              color: '#f0f0fa',
              lineHeight: 1,
              marginTop: '0.5rem',
            }}
          >
            {t('title')}
          </h2>
          <p style={{ ...micro, color: 'rgba(240, 240, 250, 0.5)', marginTop: '0.5rem' }}>{t('subtitle')}</p>
        </div>

        {/* 전체 흐름 */}
        <div style={{ marginBottom: '1.5rem', padding: '1rem', border: '1px solid rgba(240, 240, 250, 0.1)' }}>
          <p style={{ ...micro, marginBottom: '0.75rem' }}>{t('flowLabel')}</p>
          <div className="flex flex-col gap-2">
            {[t('flow1'), t('flow2'), t('flow3'), t('flow4'), t('flow5')].map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <span
                  style={{
                    fontFamily: "'Barlow Condensed', Arial, sans-serif",
                    fontWeight: 700,
                    fontSize: '0.63rem',
                    letterSpacing: '1px',
                    color: 'rgba(240, 240, 250, 0.35)',
                    minWidth: '1.5rem',
                    marginTop: '2px',
                  }}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span
                  style={{
                    fontFamily: "'Barlow Condensed', Arial, sans-serif",
                    fontSize: '0.875rem',
                    color: 'rgba(240, 240, 250, 0.7)',
                    letterSpacing: '0.5px',
                  }}
                >
                  {step}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* seed */}
        <Section title={t('seedTitle')} badge="SEED">
          <p style={{ ...micro, color: 'rgba(240, 240, 250, 0.6)', fontSize: '0.81rem', marginBottom: '0.75rem' }}>
            {t('seedDesc')}
          </p>
          <CodeBlock>
            {`round.seed = keccak256(\n  round.seed,      // 이전 시드\n  msg.sender,      // 구매자 주소\n  block.number,    // 구매 블록 번호\n  block.timestamp  // 구매 타임스탬프\n)`}
          </CodeBlock>
          <p style={{ ...micro, marginTop: '0.75rem' }}>{t('seedNote')}</p>
        </Section>

        {/* totalPool */}
        <Section title={t('poolTitle')} badge="TOTAL POOL">
          <p style={{ ...micro, color: 'rgba(240, 240, 250, 0.6)', fontSize: '0.81rem', marginBottom: '0.75rem' }}>
            {t('poolDesc')}
          </p>
          <CodeBlock>{`예) 12장 × 100 META = 1,200 META\n    → 1200000000000000000000 (wei)`}</CodeBlock>
          <p style={{ ...micro, marginTop: '0.75rem' }}>{t('poolNote')}</p>
        </Section>

        {/* blockhash */}
        <Section title={t('blockTitle')} badge="BLOCKHASH × 3">
          <p style={{ ...micro, color: 'rgba(240, 240, 250, 0.6)', fontSize: '0.81rem', marginBottom: '0.75rem' }}>
            {t('blockDesc')}
          </p>
          <CodeBlock>
            {`// 라운드 종료 → drawBlock = block.number + 10\nbytes32 hash1 = blockhash(drawBlock);\nbytes32 hash2 = blockhash(drawBlock - 1);\nbytes32 hash3 = blockhash(drawBlock - 2);`}
          </CodeBlock>
          <p style={{ ...micro, marginTop: '0.75rem' }}>{t('blockNote')}</p>
        </Section>

        {/* 최종 계산 */}
        <div style={{ marginTop: '1rem', padding: '1rem', border: '1px solid rgba(240, 240, 250, 0.25)' }}>
          <p style={{ ...micro, marginBottom: '0.75rem' }}>{t('finalLabel')}</p>
          <CodeBlock>
            {`uint256 random = uint256(\n  keccak256(hash1 + hash2 + hash3 + seed + pool)\n);\n\nwinnerIndex = random % ticketCount;\nwinner = tickets[winnerIndex].buyer;`}
          </CodeBlock>
          <p
            style={{
              fontFamily: "'Barlow Condensed', Arial, sans-serif",
              fontSize: '0.875rem',
              color: '#f0f0fa',
              marginTop: '0.75rem',
              letterSpacing: '0.5px',
            }}
          >
            {t('finalNote')}
          </p>
        </div>
      </div>
    </div>
  );
}

function Section({ title, badge, children }: {
  title: string;
  badge: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginTop: '1rem', padding: '1rem', border: '1px solid rgba(240, 240, 250, 0.08)' }}>
      <div className="flex items-center gap-3 mb-3">
        <span
          style={{
            fontFamily: "'Barlow Condensed', Arial, sans-serif",
            fontWeight: 700,
            fontSize: '0.875rem',
            letterSpacing: '0.96px',
            textTransform: 'uppercase',
            color: '#f0f0fa',
          }}
        >
          {title}
        </span>
        <span
          style={{
            fontFamily: "'Barlow Condensed', Arial, sans-serif",
            fontWeight: 700,
            fontSize: '0.63rem',
            letterSpacing: '1px',
            textTransform: 'uppercase',
            color: 'rgba(240, 240, 250, 0.35)',
            border: '1px solid rgba(240, 240, 250, 0.2)',
            padding: '2px 8px',
            borderRadius: '32px',
          }}
        >
          {badge}
        </span>
      </div>
      {children}
    </div>
  );
}

function CodeBlock({ children }: { children: string }) {
  return (
    <pre
      style={{
        fontSize: '0.75rem',
        padding: '0.75rem',
        overflowX: 'auto',
        lineHeight: 1.6,
        background: 'rgba(240, 240, 250, 0.04)',
        border: '1px solid rgba(240, 240, 250, 0.08)',
        color: 'rgba(240, 240, 250, 0.7)',
        fontFamily: 'monospace',
      }}
    >
      {children}
    </pre>
  );
}
