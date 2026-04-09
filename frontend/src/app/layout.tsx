import type { Metadata } from 'next';
import { Barlow_Condensed } from 'next/font/google';
import './globals.css';

const barlowCondensed = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-barlow',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'MetaLotto — 블록체인 복권',
  description: '투명하고 공정한 온체인 복권. META 토큰으로 참여하세요.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html className={barlowCondensed.variable} suppressHydrationWarning>
      <body
        style={{ background: '#000000', fontFamily: "'Barlow Condensed', Arial, Verdana, sans-serif" }}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
