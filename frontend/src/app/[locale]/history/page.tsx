'use client';

import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { RoundList } from '@/components/history/RoundList';
import { useTranslations } from 'next-intl';

export default function HistoryPage() {
  const t = useTranslations('history');

  return (
    <div className="min-h-screen relative" style={{ background: '#0F0F23' }}>
      {/* 배경 장식 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-15" style={{ background: 'radial-gradient(circle, #7C3AED, transparent 70%)', filter: 'blur(60px)' }} />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #00D9FF, transparent 70%)', filter: 'blur(80px)' }} />
      </div>

      <Header />

      <main className="relative container mx-auto px-4 sm:px-6 py-8">
        {/* 페이지 타이틀 */}
        <div className="mb-8">
          <p className="text-xs font-black tracking-widest uppercase mb-2" style={{ color: '#00D9FF' }}>HISTORY</p>
          <h1 className="text-3xl font-black text-white mb-1">{t('title')}</h1>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>{t('subtitle')}</p>
        </div>

        {/* 라운드 목록 */}
        <RoundList />

        {/* 안내 섹션 */}
        <div className="mt-8 rounded-2xl p-6" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <h2 className="text-base font-black text-white mb-4">{t('infoTitle')}</h2>
          <ul className="space-y-3">
            {[t('info1'), t('info2'), t('info3')].map((info, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="text-sm mt-0.5" style={{ color: '#00D9FF' }}>✓</span>
                <span className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>{info}</span>
              </li>
            ))}
          </ul>
        </div>
      </main>

      <Footer />
    </div>
  );
}
