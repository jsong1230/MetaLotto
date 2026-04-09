import type { Metadata } from 'next';
import { Providers } from '@/components/providers';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { notFound } from 'next/navigation';

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

const metaByLocale: Record<string, { title: string; description: string }> = {
  ko: { title: 'MetaLotto — 블록체인 복권', description: '투명하고 공정한 온체인 복권. META 토큰으로 참여하세요.' },
  en: { title: 'MetaLotto — Blockchain Lottery', description: 'Transparent on-chain lottery. Join with META tokens.' },
  zh: { title: 'MetaLotto — 区块链彩票', description: '透明公正的链上彩票，使用 META 代币参与。' },
  ja: { title: 'MetaLotto — ブロックチェーン宝くじ', description: '透明で公正なオンチェーン宝くじ。METAトークンで参加。' },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return metaByLocale[locale] ?? metaByLocale.en;
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as 'ko' | 'en' | 'zh' | 'ja')) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <Providers>{children}</Providers>
    </NextIntlClientProvider>
  );
}
