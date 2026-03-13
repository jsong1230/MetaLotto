'use client';

import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { RoundInfoSection } from '@/components/round/RoundInfoSection';
import { TicketPurchaseSection } from '@/components/round/TicketPurchaseSection';
import { WinnerAnnouncementSection } from '@/components/round/WinnerAnnouncementSection';

/**
 * 홈 페이지
 * 현재 라운드 정보, 티켓 구매, 당첨자 발표를 표시
 */
export default function HomePage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* 페이지 타이틀 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
            MetaLotto
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            투명한 블록체인 복권에 참여하세요
          </p>
        </div>

        {/* 메인 콘텐츠 */}
        <div className="space-y-6">
          {/* 당첨자 발표 (완료된 경우) */}
          <WinnerAnnouncementSection />

          {/* 라운드 정보 */}
          <RoundInfoSection />

          {/* 티켓 구매 */}
          <TicketPurchaseSection />

          {/* 안내 섹션 */}
          <div className="bg-white rounded-2xl border border-zinc-200 p-6 dark:bg-zinc-900 dark:border-zinc-800">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">
              이용 안내
            </h2>
            <ul className="space-y-3 text-sm text-zinc-600 dark:text-zinc-400">
              <li className="flex items-start gap-2">
                <svg
                  className="w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>
                  <strong className="text-zinc-900 dark:text-zinc-100">투명한 추첨:</strong> 모든 추첨 과정은 블록체인에 기록되어 위변조가 불가능합니다.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <svg
                  className="w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>
                  <strong className="text-zinc-900 dark:text-zinc-100">즉시 지급:</strong> 당첨자는 즉시 상금을 수령하며 별도의 절차가 필요하지 않습니다.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <svg
                  className="w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
                <span>
                  <strong className="text-zinc-900 dark:text-zinc-100">보안:</strong> 스마트 컨트랙트로 안전하게 상금이 관리됩니다.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
