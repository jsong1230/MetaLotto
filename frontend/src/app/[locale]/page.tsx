'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { RoundInfoSection } from '@/components/round/RoundInfoSection';
import { TicketPurchaseSection } from '@/components/round/TicketPurchaseSection';
import { WinnerAnnouncementSection } from '@/components/round/WinnerAnnouncementSection';
import { HeroSection } from '@/components/round/HeroSection';
import { DrawMechanismModal } from '@/components/round/DrawMechanismModal';
import { useTranslations } from 'next-intl';
import { useRoundEvents } from '@/hooks/useRoundEvents';

export default function HomePage() {
  useRoundEvents();

  return (
    <div className="min-h-screen relative" style={{ background: '#0F0F23' }}>
      {/* 배경 장식 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #00D9FF, transparent 70%)', filter: 'blur(60px)' }} />
        <div className="absolute top-1/3 -right-40 w-96 h-96 rounded-full opacity-15" style={{ background: 'radial-gradient(circle, #7C3AED, transparent 70%)', filter: 'blur(60px)' }} />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #EAB308, transparent 70%)', filter: 'blur(80px)' }} />
      </div>

      <Header />

      <main className="relative container mx-auto px-4 sm:px-6 py-8">
        {/* 당첨자 발표 */}
        <WinnerAnnouncementSection />

        {/* Hero - 잭팟 금액 */}
        <HeroSection />

        {/* 2열 레이아웃: 라운드 정보 + 티켓 구매 */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mt-6">
          <div className="lg:col-span-3">
            <RoundInfoSection />
          </div>
          <div className="lg:col-span-2">
            <TicketPurchaseSection />
          </div>
        </div>

        {/* 이용 안내 */}
        <HowItWorksSection />
      </main>

      <Footer />
    </div>
  );
}

function HowItWorksSection() {
  const t = useTranslations('howItWorks');
  const [showModal, setShowModal] = useState(false);

  const steps = [
    { icon: t('step1Icon'), title: t('step1Title'), desc: t('step1Desc'), detail: null },
    { icon: t('step2Icon'), title: t('step2Title'), desc: t('step2Desc'), detail: null },
    { icon: t('step3Icon'), title: t('step3Title'), desc: t('step3Desc'), detail: t('step3Detail') },
    { icon: t('step4Icon'), title: t('step4Title'), desc: t('step4Desc'), detail: null },
  ];

  return (
    <div className="mt-12">
      <div className="text-center mb-8">
        <p className="text-xs font-black tracking-widest uppercase mb-2" style={{ color: '#00D9FF' }}>{t('label')}</p>
        <h2 className="text-2xl sm:text-3xl font-black text-white">{t('title')}</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {steps.map((step, i) => (
          <div
            key={i}
            className="p-6 rounded-3xl transition-all duration-300 flex flex-col"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', cursor: step.detail ? 'pointer' : 'default' }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
              e.currentTarget.style.transform = 'translateY(-4px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div className="text-3xl mb-3">{step.icon}</div>
            <h3 className="font-bold text-white mb-1">{step.title}</h3>
            <p className="text-sm flex-1" style={{ color: 'rgba(255,255,255,0.6)' }}>{step.desc}</p>
            {step.detail && (
              <button
                onClick={() => setShowModal(true)}
                className="mt-3 text-xs font-bold self-start transition-all"
                style={{ color: '#00D9FF' }}
                onMouseEnter={e => { e.currentTarget.style.color = '#7C3AED'; }}
                onMouseLeave={e => { e.currentTarget.style.color = '#00D9FF'; }}
              >
                {step.detail} →
              </button>
            )}
          </div>
        ))}
      </div>

      {showModal && <DrawMechanismModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
