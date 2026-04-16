'use client';

import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useState } from 'react';
import { useTranslations } from 'next-intl';

// 공통 스타일 상수
const microLabel: React.CSSProperties = {
  fontFamily: "'Barlow Condensed', Arial, sans-serif",
  fontWeight: 700,
  fontSize: '0.63rem',
  letterSpacing: '1px',
  textTransform: 'uppercase',
  color: 'rgba(240, 240, 250, 0.35)',
  lineHeight: 0.94,
};

const sectionTitle: React.CSSProperties = {
  fontFamily: "'Barlow Condensed', Arial, sans-serif",
  fontWeight: 700,
  fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
  letterSpacing: '0.96px',
  textTransform: 'uppercase',
  color: '#f0f0fa',
  lineHeight: 1,
  marginTop: '0.5rem',
};

const bodyText: React.CSSProperties = {
  fontFamily: "'Barlow Condensed', Arial, sans-serif",
  fontSize: '0.9rem',
  letterSpacing: '0.3px',
  color: 'rgba(240, 240, 250, 0.5)',
  lineHeight: 1.8,
};

const cardStyle: React.CSSProperties = {
  padding: '1.5rem',
  border: '1px solid rgba(240, 240, 250, 0.08)',
  marginTop: '1.25rem',
};

const stepNumStyle: React.CSSProperties = {
  fontFamily: "'Barlow Condensed', Arial, sans-serif",
  fontWeight: 700,
  fontSize: '0.75rem',
  letterSpacing: '1px',
  color: 'rgba(240, 240, 250, 0.25)',
  minWidth: '2rem',
  paddingTop: '2px',
};

const stepTitleStyle: React.CSSProperties = {
  fontFamily: "'Barlow Condensed', Arial, sans-serif",
  fontWeight: 700,
  fontSize: '0.9rem',
  letterSpacing: '1.17px',
  textTransform: 'uppercase',
  color: '#f0f0fa',
  marginBottom: '0.35rem',
};

const dividerStyle: React.CSSProperties = {
  borderTop: '1px solid rgba(240, 240, 250, 0.08)',
  marginTop: '4rem',
  paddingTop: '4rem',
};

// 티켓 시각화 컴포넌트 (100장 그리드)
function TicketVisualization({ t }: { t: ReturnType<typeof useTranslations> }) {
  const myTickets = new Set([7, 23, 45, 61, 82]);
  const winnerTicket = 45;

  return (
    <div style={cardStyle}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
        {Array.from({ length: 100 }, (_, i) => {
          const ticketNum = i + 1;
          const isWinner = ticketNum === winnerTicket;
          const isMine = myTickets.has(ticketNum);
          let bgColor = 'rgba(240, 240, 250, 0.05)';
          let borderColor = 'rgba(240, 240, 250, 0.08)';
          let color = 'rgba(240, 240, 250, 0.25)';
          let transform = 'none';
          if (isWinner) {
            bgColor = 'rgba(16, 185, 129, 0.2)';
            borderColor = 'rgba(16, 185, 129, 0.6)';
            color = '#10b981';
            transform = 'scale(1.15)';
          } else if (isMine) {
            bgColor = 'rgba(240, 240, 250, 0.12)';
            borderColor = 'rgba(240, 240, 250, 0.4)';
            color = '#f0f0fa';
          }
          return (
            <div
              key={ticketNum}
              style={{
                width: '20px',
                height: '20px',
                border: `1px solid ${borderColor}`,
                background: bgColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '6px',
                fontFamily: "'Barlow Condensed', Arial, sans-serif",
                fontWeight: 700,
                color,
                transform,
                transition: 'transform 0.2s',
              }}
            >
              {ticketNum}
            </div>
          );
        })}
      </div>
      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginTop: '1rem' }}>
        <span style={{ ...bodyText, fontSize: '0.75rem' }}>
          <span style={{ color: 'rgba(240, 240, 250, 0.25)' }}>■ </span>{t('vizNormal')}
        </span>
        <span style={{ ...bodyText, fontSize: '0.75rem' }}>
          <span style={{ color: '#f0f0fa' }}>■ </span>{t('vizMine')}
        </span>
        <span style={{ ...bodyText, fontSize: '0.75rem' }}>
          <span style={{ color: '#10b981' }}>■ </span>{t('vizWinner')}
        </span>
      </div>
    </div>
  );
}

// FAQ 아코디언 아이템
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ marginTop: '0.75rem' }}>
      <button
        onClick={() => setOpen(prev => !prev)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          padding: '1rem 1.25rem',
          border: '1px solid rgba(240, 240, 250, 0.08)',
          background: 'none',
          cursor: 'pointer',
          textAlign: 'left',
          transition: 'border-color 0.2s',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(240, 240, 250, 0.25)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(240, 240, 250, 0.08)'; }}
      >
        <span
          style={{
            fontFamily: "'Barlow Condensed', Arial, sans-serif",
            fontWeight: 700,
            fontSize: '0.63rem',
            letterSpacing: '1px',
            color: 'rgba(240, 240, 250, 0.35)',
            flexShrink: 0,
          }}
        >
          Q
        </span>
        <span
          style={{
            fontFamily: "'Barlow Condensed', Arial, sans-serif",
            fontWeight: 700,
            fontSize: '0.9rem',
            letterSpacing: '0.5px',
            color: '#f0f0fa',
            flex: 1,
          }}
        >
          {q}
        </span>
        <span
          style={{
            fontFamily: "'Barlow Condensed', Arial, sans-serif",
            fontWeight: 700,
            fontSize: '1rem',
            color: 'rgba(240, 240, 250, 0.35)',
            flexShrink: 0,
            transition: 'transform 0.2s',
            transform: open ? 'rotate(45deg)' : 'none',
            display: 'inline-block',
          }}
        >
          +
        </span>
      </button>
      {open && (
        <div
          style={{
            padding: '1rem 1.25rem 1rem 3.25rem',
            border: '1px solid rgba(240, 240, 250, 0.08)',
            borderTop: 'none',
            ...bodyText,
          }}
        >
          {a}
        </div>
      )}
    </div>
  );
}

export default function ManualPage() {
  const t = useTranslations('manual');

  const tocItems = [
    { num: '01', href: '#what', label: t('toc1') },
    { num: '02', href: '#start', label: t('toc2') },
    { num: '03', href: '#buy-meta', label: t('toc3') },
    { num: '04', href: '#how', label: t('toc4') },
    { num: '05', href: '#draw', label: t('toc5') },
    { num: '06', href: '#blockhash', label: t('toc6') },
    { num: '07', href: '#prize', label: t('toc7') },
    { num: '08', href: '#faq', label: t('toc8') },
  ];

  return (
    <div className="min-h-screen" style={{ background: '#000000' }}>
      <Header />

      <main className="container mx-auto px-4 sm:px-6 py-8">

        {/* 페이지 헤더 */}
        <div style={{ marginBottom: '3rem', paddingBottom: '3rem', borderBottom: '1px solid rgba(240, 240, 250, 0.08)' }}>
          <p style={microLabel}>{t('label')}</p>
          <h1
            style={{
              fontFamily: "'Barlow Condensed', Arial, sans-serif",
              fontWeight: 700,
              fontSize: 'clamp(2rem, 6vw, 3.5rem)',
              letterSpacing: '0.96px',
              textTransform: 'uppercase',
              color: '#f0f0fa',
              lineHeight: 1,
              marginTop: '0.5rem',
              marginBottom: '0.75rem',
            }}
          >
            {t('title')}
          </h1>
          <p style={{ ...bodyText, fontSize: '0.875rem' }}>
            {t('subtitle')}
          </p>
        </div>

        {/* TOC */}
        <nav style={{ marginBottom: '4rem' }}>
          <p style={microLabel}>{t('tocTitle')}</p>
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3"
            style={{ marginTop: '1rem' }}
          >
            {tocItems.map(item => (
              <a
                key={item.href}
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  border: '1px solid rgba(240, 240, 250, 0.08)',
                  textDecoration: 'none',
                  transition: 'border-color 0.2s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(240, 240, 250, 0.25)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(240, 240, 250, 0.08)'; }}
              >
                <span
                  style={{
                    fontFamily: "'Barlow Condensed', Arial, sans-serif",
                    fontWeight: 700,
                    fontSize: '0.63rem',
                    letterSpacing: '1px',
                    color: 'rgba(240, 240, 250, 0.25)',
                    flexShrink: 0,
                  }}
                >
                  {item.num}
                </span>
                <span
                  style={{
                    fontFamily: "'Barlow Condensed', Arial, sans-serif",
                    fontWeight: 700,
                    fontSize: '0.81rem',
                    letterSpacing: '0.5px',
                    color: 'rgba(240, 240, 250, 0.6)',
                  }}
                >
                  {item.label}
                </span>
              </a>
            ))}
          </div>
        </nav>

        {/* 1. MetaLotto란? */}
        <section id="what">
          <p style={microLabel}>{t('sec1Num')}</p>
          <h2 style={sectionTitle}>{t('sec1Title')}</h2>
          <p style={{ ...bodyText, marginTop: '1rem' }}>
            {t('sec1Desc')}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" style={{ marginTop: '1.5rem' }}>
            {[
              { num: '01', title: t('feat1Title'), desc: t('feat1Desc') },
              { num: '02', title: t('feat2Title'), desc: t('feat2Desc') },
              { num: '03', title: t('feat3Title'), desc: t('feat3Desc') },
            ].map(item => (
              <div
                key={item.num}
                style={{ ...cardStyle, marginTop: 0 }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(240, 240, 250, 0.25)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(240, 240, 250, 0.08)'; }}
              >
                <p style={{ ...microLabel, marginBottom: '0.75rem' }}>{item.num}</p>
                <h3
                  style={{
                    fontFamily: "'Barlow Condensed', Arial, sans-serif",
                    fontWeight: 700,
                    fontSize: '1rem',
                    letterSpacing: '1.17px',
                    textTransform: 'uppercase',
                    color: '#f0f0fa',
                    marginBottom: '0.5rem',
                  }}
                >
                  {item.title}
                </h3>
                <p style={{ ...bodyText, fontSize: '0.81rem' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 2. 시작하기 */}
        <section id="start" style={dividerStyle}>
          <p style={microLabel}>{t('sec2Num')}</p>
          <h2 style={sectionTitle}>{t('sec2Title')}</h2>
          <p style={{ ...bodyText, marginTop: '1rem' }}>
            {t('sec2Desc')}
          </p>

          <div style={{ display: 'grid', gap: '0.75rem', marginTop: '1.5rem' }}>
            {[
              { num: '01', title: t('setup1Title'), desc: t('setup1Desc') },
              { num: '02', title: t('setup2Title'), desc: t('setup2Desc') },
              { num: '03', title: t('setup3Title'), desc: t('setup3Desc') },
            ].map(step => (
              <div
                key={step.num}
                style={{
                  display: 'flex',
                  gap: '1.25rem',
                  padding: '1.25rem',
                  border: '1px solid rgba(240, 240, 250, 0.08)',
                }}
              >
                <span style={stepNumStyle}>{step.num}</span>
                <div>
                  <h4 style={stepTitleStyle}>{step.title}</h4>
                  <p style={{ ...bodyText, fontSize: '0.81rem' }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* 네트워크 설정 카드 */}
          <div style={cardStyle}>
            <h3
              style={{
                fontFamily: "'Barlow Condensed', Arial, sans-serif",
                fontWeight: 700,
                fontSize: '0.81rem',
                letterSpacing: '1.17px',
                textTransform: 'uppercase',
                color: '#f0f0fa',
                marginBottom: '1rem',
              }}
            >
              {t('networkTitle')}
            </h3>
            <div style={{ display: 'grid', gap: '0.5rem' }}>
              {[
                { label: 'Network Name', value: 'Metadium Mainnet', mono: false },
                { label: 'RPC URL', value: 'https://api.metadium.com/prod', mono: true },
                { label: 'Chain ID', value: '11', mono: false },
                { label: 'Symbol', value: 'META', mono: false },
                { label: 'Explorer', value: 'https://explorer.metadium.com', mono: true },
              ].map(row => (
                <div
                  key={row.label}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.6rem 0.875rem',
                    background: 'rgba(240, 240, 250, 0.03)',
                    gap: '1rem',
                  }}
                >
                  <span style={{ ...bodyText, fontSize: '0.75rem', flexShrink: 0 }}>{row.label}</span>
                  <span
                    style={{
                      fontFamily: row.mono ? "'Barlow Condensed', monospace, Arial" : "'Barlow Condensed', Arial, sans-serif",
                      fontWeight: 700,
                      fontSize: row.mono ? '0.75rem' : '0.81rem',
                      letterSpacing: row.mono ? '0' : '0.5px',
                      color: '#f0f0fa',
                      textAlign: 'right',
                      wordBreak: 'break-all',
                    }}
                  >
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 3. META 토큰 구매 */}
        <section id="buy-meta" style={dividerStyle}>
          <p style={microLabel}>{t('sec3Num')}</p>
          <h2 style={sectionTitle}>{t('sec3Title')}</h2>
          <p style={{ ...bodyText, marginTop: '1rem' }}>
            {t('sec3Desc')}
          </p>

          {/* 거래소 테이블 */}
          <div style={cardStyle}>
            <h3
              style={{
                fontFamily: "'Barlow Condensed', Arial, sans-serif",
                fontWeight: 700,
                fontSize: '0.81rem',
                letterSpacing: '1.17px',
                textTransform: 'uppercase',
                color: '#f0f0fa',
                marginBottom: '1rem',
              }}
            >
              {t('exchangeTitle')}
            </h3>
            <div style={{ display: 'grid', gap: '0.5rem' }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 2fr',
                  gap: '0.5rem',
                  padding: '0.5rem 0.875rem',
                  borderBottom: '1px solid rgba(240, 240, 250, 0.08)',
                }}
              >
                {[t('exThName'), t('exThPair'), t('exThNote')].map(h => (
                  <span key={h} style={{ ...microLabel, color: 'rgba(240, 240, 250, 0.25)' }}>{h}</span>
                ))}
              </div>
              {[
                { name: 'Coinone', pair: 'META/KRW', note: t('exCoinone') },
                { name: 'Gate.io', pair: 'META/USDT', note: t('exGate') },
                { name: 'MEXC', pair: 'META/USDT', note: t('exMexc') },
              ].map(row => (
                <div
                  key={row.name}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 2fr',
                    gap: '0.5rem',
                    padding: '0.6rem 0.875rem',
                    borderBottom: '1px solid rgba(240, 240, 250, 0.04)',
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'Barlow Condensed', Arial, sans-serif",
                      fontWeight: 700,
                      fontSize: '0.81rem',
                      color: '#f0f0fa',
                    }}
                  >
                    {row.name}
                  </span>
                  <span style={{ ...bodyText, fontSize: '0.81rem', color: 'rgba(240, 240, 250, 0.7)' }}>{row.pair}</span>
                  <span style={{ ...bodyText, fontSize: '0.75rem' }}>{row.note}</span>
                </div>
              ))}
            </div>
          </div>

          <h3
            style={{
              fontFamily: "'Barlow Condensed', Arial, sans-serif",
              fontWeight: 700,
              fontSize: '1rem',
              letterSpacing: '1.17px',
              textTransform: 'uppercase',
              color: '#f0f0fa',
              marginTop: '2rem',
              marginBottom: '1rem',
            }}
          >
            {t('buyStepsTitle')}
          </h3>

          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {[
              { num: '01', title: t('buy1Title'), desc: t('buy1Desc') },
              { num: '02', title: t('buy2Title'), desc: t('buy2Desc') },
              { num: '03', title: t('buy3Title'), desc: t('buy3Desc') },
              { num: '04', title: t('buy4Title'), desc: t('buy4Desc') },
            ].map(step => (
              <div
                key={step.num}
                style={{
                  display: 'flex',
                  gap: '1.25rem',
                  padding: '1.25rem',
                  border: '1px solid rgba(240, 240, 250, 0.08)',
                }}
              >
                <span style={stepNumStyle}>{step.num}</span>
                <div>
                  <h4 style={stepTitleStyle}>{step.title}</h4>
                  <p style={{ ...bodyText, fontSize: '0.81rem' }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* 경고 박스 */}
          <div
            style={{
              marginTop: '1.25rem',
              padding: '1.25rem',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              background: 'rgba(245, 158, 11, 0.04)',
            }}
          >
            <p
              style={{
                fontFamily: "'Barlow Condensed', Arial, sans-serif",
                fontWeight: 700,
                fontSize: '0.75rem',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                color: 'rgba(245, 158, 11, 0.9)',
                marginBottom: '0.5rem',
              }}
            >
              {t('warningTitle')}
            </p>
            <p style={{ ...bodyText, fontSize: '0.81rem' }}>
              {t('warningDesc')}
            </p>
          </div>
        </section>

        {/* 4. 참여 방법 */}
        <section id="how" style={dividerStyle}>
          <p style={microLabel}>{t('sec4Num')}</p>
          <h2 style={sectionTitle}>{t('sec4Title')}</h2>

          {/* 플로우 다이어그램 */}
          <div
            className="grid grid-cols-2 sm:grid-cols-4 gap-3"
            style={{ marginTop: '1.5rem' }}
          >
            {[
              { num: '01', title: t('flow1'), desc: t('flow1d') },
              { num: '02', title: t('flow2'), desc: t('flow2d') },
              { num: '03', title: t('flow3'), desc: t('flow3d') },
              { num: '04', title: t('flow4'), desc: t('flow4d') },
            ].map(node => (
              <div
                key={node.num}
                style={{
                  padding: '1.25rem',
                  border: '1px solid rgba(240, 240, 250, 0.08)',
                  textAlign: 'center',
                }}
              >
                <p style={{ ...microLabel, marginBottom: '0.5rem' }}>{node.num}</p>
                <h4
                  style={{
                    fontFamily: "'Barlow Condensed', Arial, sans-serif",
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    letterSpacing: '1.17px',
                    textTransform: 'uppercase',
                    color: '#f0f0fa',
                    marginBottom: '0.25rem',
                  }}
                >
                  {node.title}
                </h4>
                <p style={{ ...bodyText, fontSize: '0.75rem' }}>{node.desc}</p>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gap: '0.75rem', marginTop: '1.5rem' }}>
            {[
              { num: '01', title: t('how1Title'), desc: t('how1Desc') },
              { num: '02', title: t('how2Title'), desc: t('how2Desc') },
              { num: '03', title: t('how3Title'), desc: t('how3Desc') },
              { num: '04', title: t('how4Title'), desc: t('how4Desc') },
            ].map(step => (
              <div
                key={step.num}
                style={{
                  display: 'flex',
                  gap: '1.25rem',
                  padding: '1.25rem',
                  border: '1px solid rgba(240, 240, 250, 0.08)',
                }}
              >
                <span style={stepNumStyle}>{step.num}</span>
                <div>
                  <h4 style={stepTitleStyle}>{step.title}</h4>
                  <p style={{ ...bodyText, fontSize: '0.81rem' }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 5. 당첨 방식 */}
        <section id="draw" style={dividerStyle}>
          <p style={microLabel}>{t('sec5Num')}</p>
          <h2 style={sectionTitle}>{t('sec5Title')}</h2>
          <p style={{ ...bodyText, marginTop: '1rem' }}>
            {t('sec5Desc')}
          </p>

          {/* 핵심 원리 */}
          <div
            style={{
              marginTop: '1.25rem',
              padding: '1.25rem',
              border: '1px solid rgba(240, 240, 250, 0.12)',
              background: 'rgba(240, 240, 250, 0.02)',
            }}
          >
            <p
              style={{
                fontFamily: "'Barlow Condensed', Arial, sans-serif",
                fontWeight: 700,
                fontSize: '0.75rem',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                color: 'rgba(240, 240, 250, 0.6)',
                marginBottom: '0.5rem',
              }}
            >
              {t('keyPrincipleTitle')}
            </p>
            <p style={{ ...bodyText, fontSize: '0.81rem', fontFamily: "'Barlow Condensed', monospace, Arial" }}>
              {t('keyPrincipleDesc')}
            </p>
          </div>

          <h3
            style={{
              fontFamily: "'Barlow Condensed', Arial, sans-serif",
              fontWeight: 700,
              fontSize: '1rem',
              letterSpacing: '1.17px',
              textTransform: 'uppercase',
              color: '#f0f0fa',
              marginTop: '2rem',
              marginBottom: '0.5rem',
            }}
          >
            {t('exampleTitle')}
          </h3>
          <p style={{ ...bodyText, fontSize: '0.81rem' }}>
            {t('exampleDesc')}
          </p>
          <TicketVisualization t={t} />

          <div
            style={{
              marginTop: '1.25rem',
              padding: '1.25rem',
              border: '1px solid rgba(240, 240, 250, 0.08)',
            }}
          >
            <p
              style={{
                fontFamily: "'Barlow Condensed', Arial, sans-serif",
                fontWeight: 700,
                fontSize: '0.75rem',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                color: 'rgba(240, 240, 250, 0.6)',
                marginBottom: '0.5rem',
              }}
            >
              {t('whyOneTitle')}
            </p>
            <p style={{ ...bodyText, fontSize: '0.81rem' }}>
              {t('whyOneDesc')}
            </p>
          </div>
        </section>

        {/* 6. 블록해시 랜덤 */}
        <section id="blockhash" style={dividerStyle}>
          <p style={microLabel}>{t('sec6Num')}</p>
          <h2 style={sectionTitle}>{t('sec6Title')}</h2>

          <div style={{ display: 'grid', gap: '0.75rem', marginTop: '1.5rem' }}>
            {[
              { num: '01', title: t('bh1Title'), desc: t('bh1Desc') },
              { num: '02', title: t('bh2Title'), desc: t('bh2Desc') },
              { num: '03', title: t('bh3Title'), desc: t('bh3Desc') },
            ].map(step => (
              <div
                key={step.num}
                style={{
                  display: 'flex',
                  gap: '1.25rem',
                  padding: '1.25rem',
                  border: '1px solid rgba(240, 240, 250, 0.08)',
                }}
              >
                <span style={stepNumStyle}>{step.num}</span>
                <div>
                  <h4 style={stepTitleStyle}>{step.title}</h4>
                  <p style={{ ...bodyText, fontSize: '0.81rem' }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* 공식 카드 */}
          <div style={{ ...cardStyle, textAlign: 'center', padding: '2rem' }}>
            <p style={{ ...microLabel, marginBottom: '1rem' }}>{t('formulaTitle')}</p>
            <div
              style={{
                fontFamily: "'Barlow Condensed', monospace, Arial",
                fontWeight: 700,
                fontSize: '0.9rem',
                letterSpacing: '0.5px',
                color: 'rgba(240, 240, 250, 0.8)',
                padding: '1rem 1.5rem',
                background: 'rgba(240, 240, 250, 0.03)',
                border: '1px solid rgba(240, 240, 250, 0.08)',
                overflowX: 'auto',
                whiteSpace: 'nowrap',
              }}
            >
              finalSeed = seed XOR blockhash(N+1) XOR blockhash(N+2) XOR blockhash(N+3)
            </div>
            <div
              style={{
                fontFamily: "'Barlow Condensed', monospace, Arial",
                fontSize: '0.81rem',
                color: 'rgba(240, 240, 250, 0.5)',
                marginTop: '0.75rem',
              }}
            >
              winner = finalSeed % totalTicketCount
            </div>
          </div>
        </section>

        {/* 7. 상금 분배 */}
        <section id="prize" style={dividerStyle}>
          <p style={microLabel}>{t('sec7Num')}</p>
          <h2 style={sectionTitle}>{t('sec7Title')}</h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" style={{ marginTop: '1.5rem' }}>
            {[
              { pct: '90%', label: t('prize1'), borderColor: 'rgba(240, 240, 250, 0.2)', color: '#f0f0fa' },
              { pct: '5%', label: t('prize2'), borderColor: 'rgba(16, 185, 129, 0.3)', color: '#10b981' },
              { pct: '5%', label: t('prize3'), borderColor: 'rgba(245, 158, 11, 0.3)', color: 'rgba(245, 158, 11, 0.9)' },
            ].map(item => (
              <div
                key={item.pct + item.label}
                style={{
                  padding: '1.5rem',
                  border: `1px solid ${item.borderColor}`,
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    fontFamily: "'Barlow Condensed', Arial, sans-serif",
                    fontWeight: 700,
                    fontSize: 'clamp(2rem, 5vw, 2.5rem)',
                    color: item.color,
                    letterSpacing: '1px',
                    lineHeight: 1,
                    marginBottom: '0.5rem',
                  }}
                >
                  {item.pct}
                </div>
                <p style={{ ...bodyText, fontSize: '0.81rem' }}>{item.label}</p>
              </div>
            ))}
          </div>

          {/* 상금 계산 예시 */}
          <div style={cardStyle}>
            <h3
              style={{
                fontFamily: "'Barlow Condensed', Arial, sans-serif",
                fontWeight: 700,
                fontSize: '0.81rem',
                letterSpacing: '1.17px',
                textTransform: 'uppercase',
                color: '#f0f0fa',
                marginBottom: '1rem',
              }}
            >
              {t('prizeExTitle')}
            </h3>
            <div style={{ display: 'grid', gap: '0.5rem' }}>
              {[
                { left: t('prizeEx1L'), right: t('prizeEx1R') },
                { left: t('prizeEx2L'), right: t('prizeEx2R') },
                { left: t('prizeEx3L'), right: t('prizeEx3R') },
              ].map(row => (
                <div
                  key={row.left}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.6rem 0.875rem',
                    background: 'rgba(240, 240, 250, 0.03)',
                    gap: '1rem',
                  }}
                >
                  <span style={{ ...bodyText, fontSize: '0.81rem' }}>{row.left}</span>
                  <span
                    style={{
                      fontFamily: "'Barlow Condensed', Arial, sans-serif",
                      fontWeight: 700,
                      fontSize: '0.81rem',
                      color: '#f0f0fa',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    → {row.right}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 8. FAQ */}
        <section id="faq" style={dividerStyle}>
          <p style={microLabel}>{t('sec8Num')}</p>
          <h2 style={sectionTitle}>{t('sec8Title')}</h2>

          <div style={{ marginTop: '1.5rem' }}>
            {[
              { q: t('fq1Q'), a: t('fq1A') },
              { q: t('fq2Q'), a: t('fq2A') },
              { q: t('fq3Q'), a: t('fq3A') },
              { q: t('fq4Q'), a: t('fq4A') },
              { q: t('fq5Q'), a: t('fq5A') },
              { q: t('fq6Q'), a: t('fq6A') },
              { q: t('fq7Q'), a: t('fq7A') },
            ].map((item, i) => (
              <FaqItem key={i} q={item.q} a={item.a} />
            ))}
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
