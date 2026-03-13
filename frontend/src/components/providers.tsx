'use client';

/**
 * Providers 컴포넌트
 *
 * Next.js App Router용 Provider 래퍼입니다.
 * WagmiProvider와 React Query의 QueryClientProvider를 포함합니다.
 *
 * @remarks
 * 이 컴포넌트는 'use client' 지시어를 사용하여 클라이언트 컴포넌트로 마크되어 있습니다.
 * layout.tsx의 최상위에서 이 컴포넌트로 앱 전체를 감싸야 합니다.
 *
 * @example
 * ```typescript
 * import { Providers } from '@/components/providers';
 *
 * export default function RootLayout({ children }: { children: React.ReactNode }) {
 *   return (
 *     <html lang="en">
 *       <body>
 *         <Providers>{children}</Providers>
 *       </body>
 *     </html>
 *   );
 * }
 * ```
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { config } from '@/lib/wagmi';
import { useState } from 'react';

/**
 * React Query Client 설정
 *
 * @remarks
 * 클라이언트 컴포넌트에서 QueryClient를 생성하면 SSR 시 hydration 에러가 발생할 수 있으므로
 * state를 사용하여 클라이언트 사이드에서 한 번만 생성하도록 합니다.
 */
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // 데이터 신선성: 10초 후 스테일로 간주
        staleTime: 10 * 1000,
        // 캐시 수명: 5분
        gcTime: 5 * 60 * 1000,
        // 실패 시 재시도: 2회
        retry: 2,
        // 페이지 백그라운드에서는 리패치 안 함
        refetchOnWindowFocus: false,
      },
      mutations: {
        // 실패 시 재시도: 1회
        retry: 1,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

/**
 * QueryClient 싱글톤 생성 (클라이언트 사이드 전용)
 *
 * @remarks
 * SSR 환경과 CSR 환경에서 QueryClient를 공유하지 않도록 별도로 생성합니다.
 */
function getQueryClient() {
  if (typeof window === 'undefined') {
    // SSR: 매번 새로운 QueryClient 생성
    return makeQueryClient();
  } else {
    // CSR: 기존 클라이언트 재사용
    if (!browserQueryClient) {
      browserQueryClient = makeQueryClient();
    }
    return browserQueryClient;
  }
}

/**
 * Providers 컴포넌트
 *
 * @param children - Provider로 감쌀 자식 컴포넌트
 */
export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => getQueryClient());

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
