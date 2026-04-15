'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { WalletConnectButton } from '@/components/wallet/WalletConnectButton';
import { LocaleSwitcher } from '@/components/layout/LocaleSwitcher';

export function Header() {
  const t = useTranslations('nav');
  const locale = useLocale();

  return (
    <header
      className="sticky top-0 z-50"
      style={{
        background: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(240, 240, 250, 0.1)',
      }}
    >
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <Link href={`/${locale}`} className="flex items-center gap-3">
          <span
            style={{
              fontFamily: "'Barlow Condensed', Arial, sans-serif",
              fontWeight: 700,
              fontSize: '1.5rem',
              letterSpacing: '0.15em',
              color: '#f0f0fa',
              textTransform: 'uppercase',
            }}
          >
            METALOTTO
          </span>
        </Link>

        <nav
          className="hidden md:flex items-center gap-8"
          style={{ color: 'rgba(240, 240, 250, 0.6)' }}
        >
          <Link
            href={`/${locale}`}
            style={{
              fontFamily: "'Barlow Condensed', Arial, sans-serif",
              fontWeight: 700,
              fontSize: '0.81rem',
              letterSpacing: '1.17px',
              textTransform: 'uppercase',
              color: 'rgba(240, 240, 250, 0.6)',
              transition: 'color 0.2s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#f0f0fa'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(240, 240, 250, 0.6)'; }}
          >
            {t('home')}
          </Link>
          <Link
            href={`/${locale}/history`}
            style={{
              fontFamily: "'Barlow Condensed', Arial, sans-serif",
              fontWeight: 700,
              fontSize: '0.81rem',
              letterSpacing: '1.17px',
              textTransform: 'uppercase',
              color: 'rgba(240, 240, 250, 0.6)',
              transition: 'color 0.2s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#f0f0fa'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(240, 240, 250, 0.6)'; }}
          >
            {t('history')}
          </Link>
          <Link
            href={`/${locale}/manual`}
            style={{
              fontFamily: "'Barlow Condensed', Arial, sans-serif",
              fontWeight: 700,
              fontSize: '0.81rem',
              letterSpacing: '1.17px',
              textTransform: 'uppercase',
              color: 'rgba(240, 240, 250, 0.6)',
              transition: 'color 0.2s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#f0f0fa'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(240, 240, 250, 0.6)'; }}
          >
            Manual
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <LocaleSwitcher />
          <WalletConnectButton />
        </div>
      </div>
    </header>
  );
}
