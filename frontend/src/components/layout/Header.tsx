'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { WalletConnectButton } from '@/components/wallet/WalletConnectButton';
import { LocaleSwitcher } from '@/components/layout/LocaleSwitcher';
import { Sparkles } from 'lucide-react';

export function Header() {
  const t = useTranslations('nav');
  const locale = useLocale();

  return (
    <header className="sticky top-0 z-50 border-b" style={{ borderColor: 'rgba(255,255,255,0.1)', background: 'rgba(15,15,35,0.85)', backdropFilter: 'blur(20px)' }}>
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <Link href={`/${locale}`} className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #00D9FF 0%, #7C3AED 100%)' }}>
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-black text-xl tracking-tight">
            <span style={{ background: 'linear-gradient(135deg, #00D9FF 0%, #7C3AED 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>META</span>
            <span className="text-white">LOTTO</span>
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium" style={{ color: 'rgba(255,255,255,0.6)' }}>
          <Link href={`/${locale}`} className="hover:text-white transition-colors">{t('home')}</Link>
          <Link href={`/${locale}/history`} className="hover:text-white transition-colors">{t('history')}</Link>
        </nav>
        <div className="flex items-center gap-3">
          <LocaleSwitcher />
          <WalletConnectButton />
        </div>
      </div>
    </header>
  );
}
