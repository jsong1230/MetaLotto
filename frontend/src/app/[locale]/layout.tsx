import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../globals.css';
import { Providers } from '@/components/providers';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { notFound } from 'next/navigation';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'MetaLotto — 블록체인 복권',
  description: '투명하고 공정한 온체인 복권. META 토큰으로 참여하세요.',
};

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  // 지원하지 않는 locale이면 404
  if (!routing.locales.includes(locale as 'ko' | 'en' | 'zh' | 'ja')) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale} className={inter.variable}>
      <body style={{ background: '#0F0F23' }}>
        <NextIntlClientProvider messages={messages}>
          <Providers>{children}</Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
