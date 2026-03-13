# MetaLotto 컨트랙트 ABI 문서

## 개요

이 문서는 MetaLotto 스마트 컨트랙트의 TypeScript 타입 정의와 wagmi/viem 설정을 설명합니다.

## 파일 구조

```
frontend/src/lib/abis/
├── MetaLotto.json    # 컨트랙트 ABI JSON
├── types.ts          # TypeScript 타입 정의
├── addresses.ts      # 네트워크별 컨트랙트 주소
├── config.ts         # wagmi/viem 설정
└── index.ts          # 통합 exports
```

## 사용 방법

### 1. 기본 Import

```typescript
import {
  metalottoContract,
  RoundStatus,
  Round,
  Ticket,
} from '@/lib/abis';
```

### 2. Read Contract (viem/wagmi)

```typescript
import { useReadContract } from 'wagmi';
import { metalottoContract } from '@/lib/abis';

// 현재 라운드 조회
const { data: currentRound, isLoading } = useReadContract({
  ...metalottoContract,
  functionName: 'getCurrentRound',
});

// 티켓 가격 조회
const { data: ticketPrice } = useReadContract({
  ...metalottoContract,
  functionName: 'ticketPrice',
});

// 남은 시간 조회
const { data: timeRemaining } = useReadContract({
  ...metalottoContract,
  functionName: 'getTimeRemaining',
});
```

### 3. Write Contract (viem/wagmi)

```typescript
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { metalottoContract } from '@/lib/abis';

// 티켓 구매
const { data: hash, writeContract } = useWriteContract();

const buyTickets = (count: number, price: bigint) => {
  writeContract({
    ...metalottoContract,
    functionName: 'buyTickets',
    args: [BigInt(count)],
    value: BigInt(count) * price,
  });
};

// 트랜잭션 상태 확인
const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
  hash,
});
```

### 4. 이벤트 리스닝

```typescript
import { useContractEvent } from 'wagmi';
import { metalottoContract } from '@/lib/abis';

// TicketPurchased 이벤트 리스닝
useContractEvent({
  ...metalottoContract,
  eventName: 'TicketPurchased',
  listener: (logs) => {
    logs.forEach((log) => {
      console.log('Ticket purchased:', log.args);
    });
  },
});

// WinnerDrawn 이벤트 리스닝
useContractEvent({
  ...metalottoContract,
  eventName: 'WinnerDrawn',
  listener: (logs) => {
    logs.forEach((log) => {
      console.log('Winner drawn:', log.args.winner, log.args.winnerPrize);
    });
  },
});
```

### 5. 네트워크별 컨트랙트 주소 사용

```typescript
import { getMetalottoContract } from '@/lib/abis/config';

// 체인 ID로 컨트랙트 설정 가져오기
const chainId = 11; // Metadium Mainnet
const contractConfig = getMetalottoContract(chainId);

const { data } = useReadContract({
  ...contractConfig,
  functionName: 'getCurrentRound',
});
```

## 주요 함수

### Read Functions (상태 조회)

| 함수명 | 설명 | 반환값 |
|--------|------|--------|
| `getCurrentRound()` | 현재 라운드 정보 | `Round` |
| `getRound(roundId)` | 특정 라운드 정보 | `Round` |
| `getMyTickets(roundId)` | 내 티켓 수 | `bigint` |
| `getRoundTicketCount(roundId)` | 라운드 전체 티켓 수 | `bigint` |
| `getTicketBuyer(roundId, index)` | 특정 티켓 구매자 | `address` |
| `getTimeRemaining()` | 남은 시간 (초) | `bigint` |
| `getDrawBlockRemaining()` | 추첨까지 남은 블록 수 | `bigint` |
| `getPendingWithdrawal(user)` | 미수령 상금 | `bigint` |
| `isPaused()` | 일시정지 상태 | `boolean` |

### Write Functions (트랜잭션)

| 함수명 | 설명 | 권한 |
|--------|------|------|
| `buyTickets(count)` | 티켓 구매 | Anyone |
| `closeRound()` | 라운드 종료 | Anyone |
| `drawWinner()` | 당첨자 추첨 | Anyone |
| `claimRefund(roundId)` | 환불 청구 | Anyone |
| `withdrawPending()` | 미수령 상금 인출 | Anyone |
| `setTicketPrice(price)` | 티켓 가격 변경 | Owner |
| `setRoundDuration(duration)` | 라운드 기간 변경 | Owner |
| `setDrawDelay(delay)` | 추첨 지연 변경 | Owner |
| `setMinTickets(min)` | 최소 티켓 수 변경 | Owner |
| `setCommunityFund(address)` | 커뮤니티 펀드 변경 | Owner |
| `setOperationFund(address)` | 운영 펀드 변경 | Owner |
| `forceCloseDraw()` | drawBlock 재설정 | Owner |
| `pause()` | 컨트랙트 일시정지 | Owner |
| `unpause()` | 컨트랙트 재개 | Owner |

## 이벤트

| 이벤트명 | 설명 |
|----------|------|
| `RoundStarted` | 새 라운드 시작 |
| `TicketPurchased` | 티켓 구매 |
| `RoundClosing` | 라운드 종료 |
| `WinnerDrawn` | 당첨자 추첨 |
| `RoundCancelled` | 라운드 취소 |
| `RefundClaimed` | 환불 청구 |
| `ConfigUpdated` | 설정 업데이트 |
| `FundAddressUpdated` | 펀드 주소 업데이트 |
| `PrizeDistributed` | 상금 분배 |
| `PrizeTransferSuccess` | 상금 전송 성공 |
| `PrizeTransferFailed` | 상금 전송 실패 |
| `WithdrawalClaimed` | 인출 청구 |

## 타입 정의

### Round (라운드 정보)

```typescript
interface Round {
  roundId: bigint;
  status: RoundStatus;
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
```

### RoundStatus (라운드 상태)

```typescript
enum RoundStatus {
  Open = 0,       // 티켓 판매 중
  Closing = 1,    // 판매 종료, 미래 블록 대기 중
  Completed = 2,  // 상금 분배 완료
  Cancelled = 3,  // 라운드 취소
}
```

### Ticket (티켓 정보)

```typescript
interface Ticket {
  roundId: bigint;
  buyer: `0x${string}`;
  purchaseBlock: bigint;
}
```

## 네트워크 주소

### 메타디움 메인넷 (Chain ID: 11)

```
MetaLotto: 0x0000000000000000000000000000000000000000 (배포 후 업데이트 필요)
```

### 메타디움 테스트넷

```
MetaLotto: 0x0000000000000000000000000000000000000000 (배포 후 업데이트 필요)
```

## 배포 후 작업

컨트랙트를 배포한 후 다음 파일의 주소를 업데이트해야 합니다:

1. `frontend/src/lib/abis/addresses.ts` - `ADDRESSES` 객체의 주소
2. 배포 스크립트에서 출력된 실제 컨트랙트 주소로 변경

```typescript
export const ADDRESSES = {
  metadium: {
    MetaLotto: '0x<실제_컨트랙트_주소>' as const,
  },
  metadium_testnet: {
    MetaLotto: '0x<실제_컨트랙트_주소>' as const,
  },
} as const;
```

## 참고 사항

- 모든 `uint256` 타입은 TypeScript에서 `bigint`로 매핑됩니다
- 모든 `address` 타입은 TypeScript에서 `` `0x${string}` ``로 매핑됩니다
- wagmi/viem의 최신 버전을 사용하는 것을 권장합니다
- 트랜잭션 전송 전에는 항상 사용자의 충분한 잔액을 확인하세요
