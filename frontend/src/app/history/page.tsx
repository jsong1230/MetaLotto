'use client';

import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { RoundList } from '@/components/history/RoundList';

/**
 * 히스토리 페이지
 * 과거 라운드의 결과를 표시
 */
export default function HistoryPage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* 페이지 타이틀 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
            히스토리
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            과거 라운드의 결과를 확인하세요
          </p>
        </div>

        {/* 라운드 목록 */}
        <RoundList />

        {/* 안내 섹션 */}
        <div className="mt-8 bg-white rounded-2xl border border-zinc-200 p-6 dark:bg-zinc-900 dark:border-zinc-800">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">
            히스토리 조회 안내
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
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>
                모든 라운드의 결과는 블록체인에 영구적으로 기록됩니다.
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
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>
                당첨자의 개인정보는 보호를 위해 주소가 마스킹되어 표시됩니다.
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
                  d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                />
              </svg>
              <span>
                블록체인 탐색기를 통해 모든 거래 내역을 직접 확인할 수 있습니다.
              </span>
            </li>
          </ul>
        </div>
      </main>

      <Footer />
    </div>
  );
}
