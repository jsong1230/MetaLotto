'use client';

import { useTranslations } from 'next-intl';
import { Sparkles } from 'lucide-react';

export function Footer() {
  const t = useTranslations('footer');

  return (
    <footer className="mt-20 border-t" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
      <div className="container mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #00D9FF 0%, #7C3AED 100%)' }}>
            <Sparkles className="w-3 h-3 text-white" />
          </div>
          <span className="text-sm font-bold" style={{ color: 'rgba(255,255,255,0.4)' }}>MetaLotto</span>
        </div>
        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
          Powered by Metadium Blockchain • {t('description')}
        </p>
        <a
          href="https://testnetexplorer.metadium.com/address/0x004233764dDafAc81a1C965f3ABf7D0aB95cf7BF"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-medium transition-colors hover:text-white"
          style={{ color: '#00D9FF' }}
        >
          {t('viewOnExplorer')}
        </a>
      </div>
    </footer>
  );
}
