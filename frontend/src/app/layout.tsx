import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MetaLotto - 투명한 블록체인 복권",
  description: "메타디움 블록체인 기반 투명한 복권 DApp — META 토큰으로 티켓 구매, 온체인 추첨, 자동 상금 지급",
  keywords: ["MetaLotto", "복권", "블록체인", "Metadium", "META", "DApp"],
  authors: [{ name: "MetaLotto Team" }],
  openGraph: {
    title: "MetaLotto - 투명한 블록체인 복권",
    description: "메타디움 블록체인 기반 투명한 복권 DApp",
    type: "website",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
