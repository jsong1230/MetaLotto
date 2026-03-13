# F-06 웹 프론트엔드 DApp — 기술 설계서

## 1. 참조
- 인수조건: docs/project/features.md #F-06
- 시스템 설계: docs/system/system-design.md
- 컨트랙트 API: docs/api/MetaLotto.md

## 2. 아키텍처 결정

### 결정 1: wagmi v3 + viem v2 조합
- **선택지**: A) wagmi v3 + viem v2 / B) ethers.js + web3-react / C) wagmi v2 (TanStack Query 내장)
- **결정**: A) wagmi v3 + viem v2
- **근거**:
  - 이미 package.json에 설치된 버전 사용
  - viem의 타입 안전성과 성능 이점
  - React 19 호환성 (wagmi v3는 React 18+ 지원)

### 결정 2: 클라이언트 상태 관리 없음
- **선택지**: A) Zustand 도입 / B) React Query + useState만 사용
- **결정**: B) React Query + useState만 사용
- **근거**:
  - DApp 특성상 대부분의 상태가 온체인 데이터 (서버 상태)
  - wagmi의 useContractRead가 React Query 기반
  - 단순한 UI 상태는 useState로 충분
  - 불필요한 의존성 최소화

### 결정 3: App Router + Server Components
- **선택지**: A) Pages Router / B) App Router + RSC
- **결정**: B) App Router + RSC
- **근거**:
  - Next.js 15 권장 패턴
  - SEO 최적화 (메타데이터, OG 태그)
  - 초기 로딩 성능 향상
  - Web3 훅은 "use client" 지시어가 있는 클라이언트 컴포넌트에서만 사용

### 결정 4: Tailwind CSS v4
- **선택지**: A) CSS Modules / B) Tailwind CSS / C) styled-components
- **결정**: B) Tailwind CSS
- **근거**:
  - 이미 프로젝트에 설정됨
  - 빠른 UI 개발
  - 작은 번들 사이즈
  - 다크 모드 지원 용이

---

## 3. 페이지 구성

### 3.1 라우팅 구조

```
/                    → 홈 (현재 라운드)
/history             → 히스토리 (과거 라운드)
/my-tickets          → 내 티켓 (환불/미수령 상금)
```

### 3.2 홈 페이지 (/)

**목적**: 현재 라운드 정보 표시 및 티켓 구매

**컴포넌트 계층**:
```
HomePage (Server Component)
├── Header (Client Component)
│   ├── Logo
│   ├── Navigation
│   └── WalletConnectButton
├── RoundInfoSection (Client Component)
│   ├── RoundStatusBadge
│   ├── CountdownTimer
│   ├── PoolSizeDisplay
│   └── TicketCountDisplay
├── TicketPurchaseSection (Client Component)
│   ├── TicketQuantitySelector
│   ├── TotalPriceDisplay
│   └── BuyButton
├── WinnerAnnouncementSection (Client Component)
│   └── WinnerInfo (조건부 렌더링)
└── Footer
```

### 3.3 히스토리 페이지 (/history)

**목적**: 과거 라운드 결과 및 당첨자 목록 표시

**컴포넌트 계층**:
```
HistoryPage (Server Component)
├── Header
├── RoundList (Client Component)
│   └── RoundCard (여러 개)
│       ├── RoundId
│       ├── WinnerAddress (마스킹)
│       ├── PrizeAmount
│       └── Timestamp
└── Footer
```

### 3.4 내 티켓 페이지 (/my-tickets)

**목적**: 내 참여 내역, 환불, 미수령 상금 조회

**컴포넌트 계층**:
```
MyTicketsPage (Server Component)
├── Header
├── WalletRequired (비연결 시)
├── MyTicketsSection (Client Component)
│   ├── CurrentRoundTickets
│   ├── PastRoundTickets
│   └── PendingWithdrawals
└── Footer
```

---

## 4. 컴포넌트 상세 설계

### 4.1 WalletConnectButton

**파일**: `frontend/src/components/wallet/WalletConnectButton.tsx`

**Props**:
```typescript
interface WalletConnectButtonProps {
  onConnect?: () => void;
  onDisconnect?: () => void;
}
```

**상태**:
- 연결 상태: `useAccount()`에서 `isConnected`, `address`
- 잔액: `useBalance()`에서 META 잔액

**UI**:
- 미연결: "지갑 연결" 버튼
- 연결됨: 주소(축약) + META 잔액 표시

### 4.2 RoundInfoSection

**파일**: `frontend/src/components/round/RoundInfoSection.tsx`

**Props**: 없음 (wagmi 훅 직접 사용)

**데이터 소스**:
- `useCurrentRound()`: 현재 라운드 정보
- `useTimeRemaining()`: 남은 시간

**UI 요소**:
| 요소 | 데이터 | 포맷 |
|------|--------|------|
| 라운드 ID | `roundId` | `#${roundId}` |
| 상태 배지 | `status` | Open(녹색), Closing(노랑), Completed(회색) |
| 남은 시간 | `timeRemaining` | `HH:MM:SS` (카운트다운) |
| 풀 규모 | `totalPool` | `${formatEther(totalPool)} META` |
| 참여 티켓 | `ticketCount` | `${ticketCount}장` |

### 4.3 TicketPurchaseSection

**파일**: `frontend/src/components/round/TicketPurchaseSection.tsx`

**Props**: 없음

**상태**:
```typescript
const [quantity, setQuantity] = useState(1); // 1~100
const [isPending, setIsPending] = useState(false);
```

**로직**:
```typescript
// 1. 수량 선택 (1~100)
// 2. 총 가격 계산: quantity * ticketPrice
// 3. 구매 버튼 클릭
// 4. writeContract 호출
// 5. 트랜잭션 대기 (waitForTransactionReceipt)
// 6. 성공/실패 토스트
```

**에러 처리**:
| 에러 | 메시지 |
|------|--------|
| RoundNotOpen | "현재 라운드가 종료되었습니다" |
| InsufficientPayment | "잔액이 부족합니다" |
| InvalidTicketCount | "1~100장까지 구매 가능합니다" |
| UserRejected | "트랜잭션이 취소되었습니다" |

### 4.4 WinnerAnnouncementSection

**파일**: `frontend/src/components/round/WinnerAnnouncementSection.tsx`

**표시 조건**: `round.status === RoundStatus.Completed`

**UI 요소**:
- 당첨자 주소 (마스킹): `0x1234...5678`
- 당첨 금액: `900 META`
- 축하 메시지

### 4.5 RoundList (히스토리)

**파일**: `frontend/src/components/history/RoundList.tsx`

**데이터 소스**:
- 페이지네이션: `getRound(roundId)` 역순 조회
- 기본: 최근 10개 라운드

**각 RoundCard**:
| 필드 | 포맷 |
|------|------|
| 라운드 ID | `#123` |
| 당첨자 | `0x1234...5678` (마스킹) |
| 당첨 금액 | `900 META` |
| 일시 | `2024-03-13 12:00` |

---

## 5. wagmi/viem 설정

### 5.1 체인 설정

**파일**: `frontend/src/lib/chains.ts`

```typescript
import { defineChain } from 'viem';

export const metadium = defineChain({
  id: 11,
  name: 'Metadium Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'META',
    symbol: 'META',
  },
  rpcUrls: {
    default: {
      http: ['https://api.metadium.com/prod'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Metadium Explorer',
      url: 'https://explorer.metadium.com',
    },
  },
});

export const metadiumTestnet = defineChain({
  id: 12,
  name: 'Metadium Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'META',
    symbol: 'META',
  },
  rpcUrls: {
    default: {
      http: ['https://api.metadium.com/dev'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Metadium Testnet Explorer',
      url: 'https://testnetexplorer.metadium.com',
    },
  },
});
```

### 5.2 wagmi Config

**파일**: `frontend/src/lib/wagmi.ts`

```typescript
import { createConfig, http } from 'wagmi';
import { injected, metaMask } from 'wagmi/connectors';
import { metadium, metadiumTestnet } from './chains';

const chainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID) || 11;

export const config = createConfig({
  chains: chainId === 11 ? [metadium] : [metadiumTestnet],
  connectors: [
    injected(),
    metaMask(),
  ],
  transports: {
    [metadium.id]: http(process.env.NEXT_PUBLIC_RPC_URL || 'https://api.metadium.com/prod'),
    [metadiumTestnet.id]: http('https://api.metadium.com/dev'),
  },
});

declare module 'wagmi' {
  export interface Register {
    config: typeof config;
  }
}
```

### 5.3 Providers 설정

**파일**: `frontend/src/components/providers/WagmiProvider.tsx`

```typescript
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { config } from '@/lib/wagmi';

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
```

---

## 6. 컨트랙트 훅 설계

### 6.1 훅 파일 구조

```
frontend/src/hooks/
├── useMetaLotto.ts        # 통합 훅 (read + write)
├── useCurrentRound.ts     # 현재 라운드 조회
├── useTicketPurchase.ts   # 티켓 구매
├── useRefund.ts           # 환불 처리
├── useWithdraw.ts         # 미수령 상금 인출
└── useRoundEvents.ts      # 이벤트 구독
```

### 6.2 useCurrentRound

**파일**: `frontend/src/hooks/useCurrentRound.ts`

```typescript
import { useReadContract } from 'wagmi';
import { MetaLottoABI } from '@/abis/MetaLotto';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_METALOTTO_ADDRESS as `0x${string}`;

export interface RoundInfo {
  roundId: bigint;
  status: number; // 0: Open, 1: Closing, 2: Completed, 3: Cancelled
  startBlock: bigint;
  endTimestamp: bigint;
  drawBlock: bigint;
  ticketPrice: bigint;
  totalPool: bigint;
  ticketCount: bigint;
  winner: `0x${string}`;
  winnerPrize: bigint;
  seed: bigint;
}

export function useCurrentRound() {
  const { data, isLoading, error, refetch } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: MetaLottoABI,
    functionName: 'getCurrentRound',
  });

  return {
    round: data as RoundInfo | undefined,
    isLoading,
    error,
    refetch,
  };
}
```

### 6.3 useTicketPurchase

**파일**: `frontend/src/hooks/useTicketPurchase.ts`

```typescript
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { MetaLottoABI } from '@/abis/MetaLotto';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_METALOTTO_ADDRESS as `0x${string}`;

export function useTicketPurchase() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const buyTickets = async (count: number, ticketPrice: bigint) => {
    const totalValue = ticketPrice * BigInt(count);

    writeContract({
      address: CONTRACT_ADDRESS,
      abi: MetaLottoABI,
      functionName: 'buyTickets',
      args: [BigInt(count)],
      value: totalValue,
    });
  };

  return {
    buyTickets,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}
```

### 6.4 useRoundEvents

**파일**: `frontend/src/hooks/useRoundEvents.ts`

```typescript
import { useWatchContractEvent } from 'wagmi';
import { useQueryClient } from '@tanstack/react-query';
import { MetaLottoABI } from '@/abis/MetaLotto';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_METALOTTO_ADDRESS as `0x${string}`;

export function useRoundEvents() {
  const queryClient = useQueryClient();

  // 티켓 구매 이벤트 → 라운드 정보 갱신
  useWatchContractEvent({
    address: CONTRACT_ADDRESS,
    abi: MetaLottoABI,
    eventName: 'TicketPurchased',
    onLogs: () => {
      queryClient.invalidateQueries({ queryKey: ['currentRound'] });
      queryClient.invalidateQueries({ queryKey: ['myTickets'] });
    },
  });

  // 당첨자 발표 이벤트 → 전체 갱신
  useWatchContractEvent({
    address: CONTRACT_ADDRESS,
    abi: MetaLottoABI,
    eventName: 'WinnerDrawn',
    onLogs: () => {
      queryClient.invalidateQueries({ queryKey: ['currentRound'] });
      queryClient.invalidateQueries({ queryKey: ['history'] });
    },
  });

  // 라운드 시작 이벤트
  useWatchContractEvent({
    address: CONTRACT_ADDRESS,
    abi: MetaLottoABI,
    eventName: 'RoundStarted',
    onLogs: () => {
      queryClient.invalidateQueries({ queryKey: ['currentRound'] });
    },
  });
}
```

### 6.5 훅 반환값 계약

| 훅 | 반환값 | 계약 설명 |
|----|--------|-----------|
| `useCurrentRound` | `{ round: RoundInfo \| undefined, isLoading: boolean, error: Error \| null, refetch: () => void }` | `round`: 라운드 데이터, `undefined`: 아직 로드되지 않음 |
| `useTicketPurchase` | `{ buyTickets: (count, price) => void, hash: \`0x${string}\` \| undefined, isPending: boolean, isConfirming: boolean, isSuccess: boolean, error: Error \| null }` | `isPending`: 서명 대기, `isConfirming`: 컨펌 대기 |
| `useMyTickets` | `{ ticketCount: bigint, isLoading: boolean }` | `ticketCount`: 현재 라운드의 내 티켓 수 |
| `usePendingWithdrawal` | `{ amount: bigint, withdraw: () => void }` | `amount`: 인출 가능한 META (wei) |
| `useRefund` | `{ claimRefund: (roundId) => void, isPending: boolean }` | 취소된 라운드 환불 |

---

## 7. 상태 관리

### 7.1 React Query 캐시 키

```typescript
// 쿼리 키 컨벤션
const queryKeys = {
  currentRound: ['currentRound'] as const,
  round: (id: number) => ['round', id] as const,
  myTickets: (roundId: number) => ['myTickets', roundId] as const,
  pendingWithdrawal: ['pendingWithdrawal'] as const,
  history: (page: number) => ['history', page] as const,
};
```

### 7.2 로컬 상태 (useState)

| 컴포넌트 | 상태 | 타입 |
|----------|------|------|
| TicketPurchaseSection | quantity | `number` (1~100) |
| RoundList | currentPage | `number` |
| WalletConnectButton | isDropdownOpen | `boolean` |

### 7.3 URL 상태

| 페이지 | URL 파라미터 | 용도 |
|--------|-------------|------|
| /history | `?page=1` | 히스토리 페이지네이션 |
| /my-tickets | `?tab=current` | 탭 전환 |

---

## 8. 에러 처리

### 8.1 컨트랙트 에러 매핑

| Solidity Error | viem Error Name | 사용자 메시지 |
|----------------|-----------------|---------------|
| `RoundNotOpen()` | `ContractFunctionExecutionError` | "현재 라운드가 종료되었습니다" |
| `InsufficientPayment()` | `ContractFunctionExecutionError` | "잔액이 부족합니다" |
| `InvalidTicketCount()` | `ContractFunctionExecutionError` | "1~100장까지 구매 가능합니다" |
| `TransferFailed()` | `ContractFunctionExecutionError` | "전송에 실패했습니다. 다시 시도해 주세요." |
| `DrawExpired()` | `ContractFunctionExecutionError` | "추첨 블록이 만료되었습니다. 관리자가 처리 중입니다." |

### 8.2 지갑 에러 처리

```typescript
// useAccount 훅에서 연결 상태 확인
const { isConnected, isConnecting } = useAccount();

// 연결 실패 시
if (!isConnected && !isConnecting) {
  // 지갑 연결 유도 UI
}
```

### 8.3 트랜잭션 에러 처리

```typescript
try {
  await buyTickets(quantity, ticketPrice);
} catch (error) {
  if (error.name === 'UserRejectedRequestError') {
    toast.error('트랜잭션이 취소되었습니다');
  } else if (error.name === 'ContractFunctionExecutionError') {
    // 컨트랙트 revert 분기 처리
    const revertReason = error.message;
    // 사용자 친화적 메시지 변환
  } else {
    toast.error('알 수 없는 오류가 발생했습니다');
  }
}
```

---

## 9. 실시간 업데이트 전략

### 9.1 이벤트 기반 갱신

```
TicketPurchased 이벤트
    │
    └──> queryClient.invalidateQueries(['currentRound'])
         └──> 풀 규모, 티켓 수 업데이트

WinnerDrawn 이벤트
    │
    ├──> queryClient.invalidateQueries(['currentRound'])
    │    └──> 당첨자 정보 표시
    │
    └──> toast.success("당첨자가 발표되었습니다!")
```

### 9.2 폴링 (백업)

```typescript
// 이벤트 구독 실패 시 폴링으로 대체
useEffect(() => {
  const interval = setInterval(() => {
    refetchCurrentRound();
  }, 30000); // 30초마다

  return () => clearInterval(interval);
}, []);
```

### 9.3 카운트다운 타이머

```typescript
// 남은 시간 실시간 업데이트
export function useCountdown(endTimestamp: bigint) {
  const [remaining, setRemaining] = useState(0n);

  useEffect(() => {
    const updateRemaining = () => {
      const now = BigInt(Math.floor(Date.now() / 1000));
      const diff = endTimestamp - now;
      setRemaining(diff > 0n ? diff : 0n);
    };

    updateRemaining();
    const interval = setInterval(updateRemaining, 1000);
    return () => clearInterval(interval);
  }, [endTimestamp]);

  return remaining;
}
```

---

## 10. UI/UX 설계

### 10.1 디자인 토큰

```css
/* 색상 */
--color-primary: #6366f1;    /* 인디고 - 브랜드 컬러 */
--color-success: #22c55e;    /* 녹색 - Open 상태 */
--color-warning: #f59e0b;    /* 노랑 - Closing 상태 */
--color-neutral: #6b7280;    /* 회색 - Completed 상태 */
--color-error: #ef4444;      /* 빨강 - 에러 */

/* 타이포그래피 */
--font-display: var(--font-geist-sans);
--font-mono: var(--font-geist-mono);
```

### 10.2 레이아웃

```
┌─────────────────────────────────────────┐
│  Header (Logo, Nav, Wallet Button)      │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  Round Status Card              │   │
│  │  - Status Badge                 │   │
│  │  - Countdown Timer              │   │
│  │  - Pool Size                    │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  Ticket Purchase Card           │   │
│  │  - Quantity Selector            │   │
│  │  - Total Price                  │   │
│  │  - Buy Button                   │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  Winner Announcement            │   │
│  │  (Completed 상태일 때만 표시)     │   │
│  └─────────────────────────────────┘   │
│                                         │
├─────────────────────────────────────────┤
│  Footer (Links, Copyright)              │
└─────────────────────────────────────────┘
```

### 10.3 반응형 브레이크포인트

| 브레이크포인트 | 최대 너비 | 레이아웃 |
|---------------|-----------|----------|
| Mobile | 640px | 싱글 컬럼, 풀 너비 |
| Tablet | 768px | 싱글 컬럼, 패딩 증가 |
| Desktop | 1024px+ | 중앙 정렬, max-width: 768px |

---

## 11. 환경 변수

```bash
# .env.local
NEXT_PUBLIC_METALOTTO_ADDRESS=0x...     # 배포된 컨트랙트 주소
NEXT_PUBLIC_CHAIN_ID=11                  # 11: Mainnet, 12: Testnet
NEXT_PUBLIC_RPC_URL=https://api.metadium.com/prod
```

---

## 12. 파일 구조

```
frontend/src/
├── app/
│   ├── layout.tsx              # 루트 레이아웃 (Providers 포함)
│   ├── page.tsx                # 홈 (/)
│   ├── history/
│   │   └── page.tsx            # 히스토리 (/history)
│   ├── my-tickets/
│   │   └── page.tsx            # 내 티켓 (/my-tickets)
│   └── globals.css             # 전역 스타일
├── components/
│   ├── layout/
│   │   ├── Header.tsx
│   │   └── Footer.tsx
│   ├── wallet/
│   │   └── WalletConnectButton.tsx
│   ├── round/
│   │   ├── RoundInfoSection.tsx
│   │   ├── CountdownTimer.tsx
│   │   ├── TicketPurchaseSection.tsx
│   │   └── WinnerAnnouncementSection.tsx
│   ├── history/
│   │   ├── RoundList.tsx
│   │   └── RoundCard.tsx
│   ├── my-tickets/
│   │   ├── MyTicketsSection.tsx
│   │   └── PendingWithdrawal.tsx
│   ├── providers/
│   │   └── WagmiProvider.tsx
│   └── ui/
│       ├── Button.tsx
│       ├── Badge.tsx
│       └── Toast.tsx
├── hooks/
│   ├── useCurrentRound.ts
│   ├── useTicketPurchase.ts
│   ├── useMyTickets.ts
│   ├── useRefund.ts
│   ├── useWithdraw.ts
│   ├── useRoundEvents.ts
│   └── useCountdown.ts
├── lib/
│   ├── wagmi.ts
│   ├── chains.ts
│   └── utils.ts
├── abis/
│   └── MetaLotto.ts            # ABI export
└── types/
    └── index.ts                # 타입 정의
```

---

## 13. 성능 고려사항

### 13.1 번들 사이즈 최적화
- wagmi/viem은 Tree-shaking 가능
- 사용하지 않는 connector 제외
- ABI는 필요한 함수만 포함

### 13.2 초기 로딩 최적화
- RSC로 정적 부분 서버 렌더링
- 클라이언트 컴포넌트 지연 로딩
- 이미지 최적화 (Next.js Image 컴포넌트)

### 13.3 RPC 요청 최적화
- React Query 캐싱 (staleTime: 10s)
- 배치 요청 (Multicall) 고려
- 이벤트 구독으로 불필요한 폴링 제거

---

## 14. 보안 고려사항

### 14.1 프론트엔드 검증
- 티켓 수량: 1~100 범위 체크 (컨트랙트에서도 검증)
- 잔액 확인: 구매 전 클라이언트에서 사전 체크
- 라운드 상태 확인: Open 상태일 때만 구매 버튼 활성화

### 14.2 XSS 방지
- React 기본 이스케이프
- 사용자 입력 직접 렌더링 금지
- 외부 URL은 `rel="noopener noreferrer"`

### 14.3 환경 변수 보안
- `NEXT_PUBLIC_*`만 클라이언트 노출
- Private Key는 프론트엔드에 절대 저장하지 않음

---

## 15. 접근성 (A11y)

- 키보드 네비게이션 지원
- ARIA 속성 사용
- 색상 대비 WCAG AA 준수
- 스크린 리더 지원

---

## 16. 영향 범위

### 신규 생성 파일
| 파일 | 설명 |
|------|------|
| `frontend/src/app/history/page.tsx` | 히스토리 페이지 |
| `frontend/src/app/my-tickets/page.tsx` | 내 티켓 페이지 |
| `frontend/src/components/**/*.tsx` | 약 15개 컴포넌트 |
| `frontend/src/hooks/*.ts` | 7개 커스텀 훅 |
| `frontend/src/lib/wagmi.ts` | wagmi 설정 |
| `frontend/src/lib/chains.ts` | 체인 정의 |
| `frontend/src/abis/MetaLotto.ts` | ABI export |

### 수정 필요 파일
| 파일 | 변경 내용 |
|------|-----------|
| `frontend/src/app/layout.tsx` | WagmiProvider 추가, 메타데이터 수정 |
| `frontend/src/app/page.tsx` | 홈 페이지 리팩토링 |
| `frontend/src/app/globals.css` | 디자인 토큰 추가 |

---

## 변경 이력

| 날짜 | 변경 내용 | 이유 |
|------|----------|------|
| 2026-03-13 | 초기 작성 | F-06 설계 |
