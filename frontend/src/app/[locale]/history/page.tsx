'use client';

import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { RoundList } from '@/components/history/RoundList';
import { useTranslations } from 'next-intl';

const micro: React.CSSProperties = {
  fontFamily: "'Barlow Condensed', Arial, sans-serif",
  fontWeight: 700,
  fontSize: '0.63rem',
  letterSpacing: '1px',
  textTransform: 'uppercase',
  color: 'rgba(240, 240, 250, 0.35)',
  lineHeight: 0.94,
};

export default function HistoryPage() {
  const t = useTranslations('history');

  return (
    <div className="min-h-screen" style={{ background: '#000000' }}>
      <Header />

      <main className="container mx-auto px-4 sm:px-6 py-8">
        {/* 페이지 타이틀 */}
        <div style={{ marginBottom: '2.5rem' }}>
          <p style={micro}>HISTORY</p>
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
              marginBottom: '0.5rem',
            }}
          >
            {t('title')}
          </h1>
          <p style={{ ...micro, color: 'rgba(240, 240, 250, 0.5)', fontSize: '0.81rem' }}>{t('subtitle')}</p>
        </div>

        <RoundList />

        {/* 안내 섹션 */}
        <div style={{ marginTop: '2rem', padding: '1.5rem', border: '1px solid rgba(240, 240, 250, 0.08)' }}>
          <h2
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
            {t('infoTitle')}
          </h2>
          <ul className="space-y-3">
            {[t('info1'), t('info2'), t('info3')].map((info, i) => (
              <li key={i} className="flex items-start gap-3">
                <span style={{ ...micro, color: 'rgba(240, 240, 250, 0.6)', marginTop: '2px' }}>—</span>
                <span style={{ ...micro, color: 'rgba(240, 240, 250, 0.5)', fontSize: '0.81rem' }}>{info}</span>
              </li>
            ))}
          </ul>
        </div>
      </main>

      <Footer />
    </div>
  );
}
