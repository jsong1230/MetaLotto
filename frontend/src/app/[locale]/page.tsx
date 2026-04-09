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

const microLabel: React.CSSProperties = {
  fontFamily: "'Barlow Condensed', Arial, sans-serif",
  fontWeight: 700,
  fontSize: '0.63rem',
  letterSpacing: '1px',
  textTransform: 'uppercase',
  color: 'rgba(240, 240, 250, 0.35)',
  lineHeight: 0.94,
};

export default function HomePage() {
  useRoundEvents();

  return (
    <div className="min-h-screen" style={{ background: '#000000' }}>
      <Header />

      <main className="container mx-auto px-4 sm:px-6 py-8">
        <WinnerAnnouncementSection />
        <HeroSection />

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mt-6">
          <div className="lg:col-span-3">
            <RoundInfoSection />
          </div>
          <div className="lg:col-span-2">
            <TicketPurchaseSection />
          </div>
        </div>

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
    <div style={{ marginTop: '5rem' }}>
      {/* 섹션 헤더 */}
      <div style={{ marginBottom: '2rem' }}>
        <p style={microLabel}>{t('label')}</p>
        <h2
          style={{
            fontFamily: "'Barlow Condensed', Arial, sans-serif",
            fontWeight: 700,
            fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
            letterSpacing: '0.96px',
            textTransform: 'uppercase',
            color: '#f0f0fa',
            lineHeight: 1,
            marginTop: '0.5rem',
          }}
        >
          {t('title')}
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {steps.map((step, i) => (
          <div
            key={i}
            style={{
              padding: '1.5rem',
              border: '1px solid rgba(240, 240, 250, 0.08)',
              transition: 'border-color 0.2s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(240, 240, 250, 0.25)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(240, 240, 250, 0.08)'; }}
          >
            <div
              style={{
                fontFamily: "'Barlow Condensed', Arial, sans-serif",
                fontWeight: 700,
                fontSize: '0.63rem',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                color: 'rgba(240, 240, 250, 0.25)',
                marginBottom: '1rem',
              }}
            >
              {String(i + 1).padStart(2, '0')}
            </div>
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
              {step.title}
            </h3>
            <p
              style={{
                fontFamily: "'Barlow Condensed', Arial, sans-serif",
                fontSize: '0.81rem',
                letterSpacing: '0.5px',
                color: 'rgba(240, 240, 250, 0.5)',
                flex: 1,
              }}
            >
              {step.desc}
            </p>
            {step.detail && (
              <button
                onClick={() => setShowModal(true)}
                style={{
                  marginTop: '1rem',
                  fontFamily: "'Barlow Condensed', Arial, sans-serif",
                  fontWeight: 700,
                  fontSize: '0.63rem',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  color: 'rgba(240, 240, 250, 0.6)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  transition: 'color 0.2s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#f0f0fa'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(240, 240, 250, 0.6)'; }}
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
