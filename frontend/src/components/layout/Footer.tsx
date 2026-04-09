'use client';

import { useTranslations } from 'next-intl';

const micro: React.CSSProperties = {
  fontFamily: "'Barlow Condensed', Arial, sans-serif",
  fontWeight: 400,
  fontSize: '0.63rem',
  letterSpacing: '1px',
  textTransform: 'uppercase',
  color: 'rgba(240, 240, 250, 0.35)',
  lineHeight: 0.94,
};

export function Footer() {
  const t = useTranslations('footer');

  return (
    <footer
      style={{
        marginTop: '5rem',
        borderTop: '1px solid rgba(240, 240, 250, 0.08)',
      }}
    >
      <div className="container mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <span
          style={{
            fontFamily: "'Barlow Condensed', Arial, sans-serif",
            fontWeight: 700,
            fontSize: '0.81rem',
            letterSpacing: '1.17px',
            textTransform: 'uppercase',
            color: 'rgba(240, 240, 250, 0.35)',
          }}
        >
          METALOTTO
        </span>

        <p style={micro}>Powered by Metadium Blockchain — {t('description')}</p>

        <a
          href="https://testnetexplorer.metadium.com/address/0x004233764dDafAc81a1C965f3ABf7D0aB95cf7BF"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            ...micro,
            color: 'rgba(240, 240, 250, 0.6)',
            transition: 'color 0.2s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#f0f0fa'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(240, 240, 250, 0.6)'; }}
        >
          {t('viewOnExplorer')}
        </a>
      </div>
    </footer>
  );
}
