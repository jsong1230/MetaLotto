# MetaLotto API 컨벤션 — 스마트 컨트랙트 인터페이스 규격

## 1. 개요

MetaLotto는 블록체인 DApp으로, 전통적인 REST API 대신 스마트 컨트랙트 함수를 통해 모든 상호작용이 이루어집니다. 이 문서는 컨트랙트 함수 인터페이스, 이벤트, 에러 코드를 정의합니다.

### 1.1 참조 문서
- 시스템 설계: [docs/system/system-design.md](./system-design.md)
- 기능 백로그: [docs/project/features.md](../project/features.md)

### 1.2 기능 커버리지

| 기능 ID | 기능명 | 관련 함수 |
|---------|--------|-----------|
| F-01 | 라운드 관리 | `closeRound()`, `forceCloseDraw()`, View 함수 |
| F-02 | Blockhash 난수 생성 | `drawWinner()` |
| F-03 | 티켓 구매 | `buyTickets()` |
| F-04 | 상금 분배 | `_distributePrize()` (internal), `getDistribution()` |
| F-05 | 자동 상금 지급 | `withdrawPending()`, `getPendingWithdrawal()` |
| F-06 | 웹 프론트엔드 | 모든 View 함수 + Event 구독 |
| F-07 | 이벤트 로그 | 모든 Events |
| F-08 | 비상 정지 | `pause()`, `unpause()`, `isPaused()` |

---

## 2. 컨트랙트 인터페이스

### 2.1 컨트랙트 정보

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract MetaLotto is Ownable, Pausable, ReentrancyGuard {
    // ...
}
```

### 2.2 상수

| 이름 | 타입 | 값 | 설명 |
|------|------|-----|------|
| `WINNER_SHARE` | `uint256` | 9000 | 당첨자 분배 비율 (90%, basis points) |
| `COMMUNITY_SHARE` | `uint256` | 500 | 커뮤니티 펀드 분배 비율 (5%) |
| `OPERATION_SHARE` | `uint256` | 500 | 운영비 분배 비율 (5%) |
| `BASIS_POINTS` | `uint256` | 10000 | 분배 비율 기준 (100%) |
| `MAX_TICKETS_PER_PURCHASE` | `uint256` | 100 | 1회 최대 구매 티켓 수 |

---

## 3. External/Public 함수

### 3.1 티켓 구매

#### `buyTickets(uint256 _count)` — external payable

**목적**: META 토큰으로 티켓 구매

| 항목 | 내용 |
|------|------|
| **Modifier** | `whenNotPaused`, `nonReentrant` |
| **파라미터** | `_count`: 구매할 티켓 수 (1~100) |
| **msg.value** | `ticketPrice * _count` 이상 |
| **반환값** | 없음 (이벤트로 확인) |
| **이벤트** | `TicketPurchased(roundId, buyer, ticketCount, totalCost)` |

**호출 조건**:
- 라운드 상태가 `Open`이어야 함
- `msg.value >= ticketPrice * _count`
- `_count`는 1 이상 100 이하

**에러**:
| Error | 조건 |
|-------|------|
| `RoundNotOpen()` | 라운드 상태가 Open이 아님 |
| `InvalidTicketCount()` | `_count`가 0 또는 100 초과 |
| `InsufficientPayment()` | `msg.value < ticketPrice * _count` |
| `TransferFailed()` | 초과금 환불 실패 |
| `Pausable: paused` | 컨트랙트가 일시 정지 상태 |

**프론트엔드 연동**:
```typescript
import { useContractWrite } from 'wagmi'

const { write, isLoading } = useContractWrite({
  address: CONTRACT_ADDRESS,
  abi: MetaLottoABI,
  functionName: 'buyTickets',
})

// 호출
write({
  args: [10n], // 10장 구매
  value: parseEther('1000'), // 1000 META (100 META * 10장)
})
```

---

### 3.2 라운드 관리

#### `closeRound()` — external

**목적**: 현재 라운드 종료 및 추첨 대기 상태로 전이

| 항목 | 내용 |
|------|------|
| **Modifier** | `whenNotPaused` |
| **파라미터** | 없음 |
| **반환값** | 없음 |
| **이벤트** | `RoundClosing` 또는 `RoundCancelled` |

**호출 조건**:
- 라운드 상태가 `Open`이어야 함
- `block.timestamp >= endTimestamp`

**동작 분기**:
| 조건 | 결과 |
|------|------|
| `ticketCount >= minTicketsPerRound` | 상태 → `Closing`, `drawBlock` 설정 |
| `ticketCount < minTicketsPerRound` | 상태 → `Cancelled`, 새 라운드 시작 |

**에러**:
| Error | 조건 |
|-------|------|
| `RoundNotOpen()` | 라운드 상태가 Open이 아님 |
| `SaleNotEnded()` | 아직 `endTimestamp` 도달 전 |

---

#### `drawWinner()` — external

**목적**: 당첨자 추첨 및 상금 분배

| 항목 | 내용 |
|------|------|
| **Modifier** | `whenNotPaused`, `nonReentrant` |
| **파라미터** | 없음 |
| **반환값** | 없음 |
| **이벤트** | `WinnerDrawn`, `PrizeDistributed`, `PrizeTransferSuccess/Failed` |

**호출 조건**:
- 라운드 상태가 `Closing`이어야 함
- `block.number > drawBlock`
- `block.number <= drawBlock + 256`

**난수 생성 알고리즘**:
```
randomness = keccak256(
    blockhash(drawBlock),
    blockhash(drawBlock + 1),
    blockhash(drawBlock + 2),
    seed
)
winnerIndex = randomness % ticketCount
```

**에러**:
| Error | 조건 |
|-------|------|
| `RoundNotClosing()` | 라운드 상태가 Closing이 아님 |
| `DrawBlockNotReached()` | `block.number <= drawBlock` |
| `DrawExpired()` | `block.number > drawBlock + 256` 또는 `blockhash == 0` |
| `TransferFailed()` | 커뮤니티/운영 펀드 송금 실패 |

---

#### `forceCloseDraw()` — external onlyOwner

**목적**: 256블록 초과 시 drawBlock 재설정

| 항목 | 내용 |
|------|------|
| **Modifier** | `onlyOwner` |
| **파라미터** | 없음 |
| **반환값** | 없음 |
| **이벤트** | `ConfigUpdated("drawBlock", oldValue, newValue)` |

**호출 조건**:
- 라운드 상태가 `Closing`이어야 함
- `block.number > drawBlock + 256`

**에러**:
| Error | 조건 |
|-------|------|
| `RoundNotClosing()` | 라운드 상태가 Closing이 아님 |
| `DrawBlockNotReached()` | 아직 256블록 미경과 |

---

### 3.3 환불 및 인출

#### `claimRefund(uint256 _roundId)` — external

**목적**: 취소된 라운드에서 환불 청구

| 항목 | 내용 |
|------|------|
| **Modifier** | `nonReentrant` |
| **파라미터** | `_roundId`: 환불할 라운드 ID |
| **반환값** | 없음 |
| **이벤트** | `RefundClaimed(roundId, buyer, amount)` |

**호출 조건**:
- 라운드 상태가 `Cancelled`이어야 함
- 호출자가 해당 라운드에서 티켓을 구매했어야 함

**에러**:
| Error | 조건 |
|-------|------|
| `RoundNotCancelled()` | 라운드 상태가 Cancelled이 아님 |
| `NoTicketsToRefund()` | 호출자가 구매한 티켓 없음 |

---

#### `withdrawPending()` — external

**목적**: 미수령 상금 인출 (Pull Pattern)

| 항목 | 내용 |
|------|------|
| **Modifier** | `nonReentrant` |
| **파라미터** | 없음 |
| **반환값** | 없음 |
| **이벤트** | `WithdrawalClaimed(user, amount)` |

**호출 조건**:
- `pendingWithdrawals[msg.sender] > 0`

**에러**:
| Error | 조건 |
|-------|------|
| `NoPendingWithdrawal()` | 인출 가능한 금액 없음 |
| `TransferFailed()` | 송금 실패 |

---

### 3.4 비상 정지

#### `pause()` — external onlyOwner

**목적**: 컨트랙트 일시 정지

| 항목 | 내용 |
|------|------|
| **Modifier** | `onlyOwner` |
| **파라미터** | 없음 |
| **반환값** | 없음 |
| **이벤트** | `Paused(account)` |

---

#### `unpause()` — external onlyOwner

**목적**: 컨트랙트 재개

| 항목 | 내용 |
|------|------|
| **Modifier** | `onlyOwner` |
| **파라미터** | 없음 |
| **반환값** | 없음 |
| **이벤트** | `Unpaused(account)` |

---

## 4. View 함수

### 4.1 라운드 정보

#### `getCurrentRound()` — external view

| 항목 | 내용 |
|------|------|
| **반환값** | `Round` struct |

```solidity
struct Round {
    uint256 roundId;
    RoundStatus status;
    uint256 startBlock;
    uint256 endTimestamp;
    uint256 drawBlock;
    uint256 ticketPrice;
    uint256 totalPool;
    uint256 ticketCount;
    address winner;
    uint256 winnerPrize;
    uint256 seed;
}
```

---

#### `getRound(uint256 _roundId)` — external view

| 항목 | 내용 |
|------|------|
| **파라미터** | `_roundId`: 조회할 라운드 ID |
| **반환값** | `Round` struct |

---

#### `getTimeRemaining()` — external view

| 항목 | 내용 |
|------|------|
| **반환값** | `uint256` — 남은 시간 (초), Open 상태가 아니면 0 |

---

#### `getDrawBlockRemaining()` — external view

| 항목 | 내용 |
|------|------|
| **반환값** | `int256` |
| - | 양수: 아직 drawBlock 도달 전 (대기 블록 수) |
| - | 음수: 추첨 가능 (`-N` = N블록 경과) |
| - | -256: 만료됨, `forceCloseDraw` 필요 |
| - | -1: Closing 상태가 아님 |

---

### 4.2 티켓 정보

#### `getRoundTicketCount(uint256 _roundId)` — external view

| 항목 | 내용 |
|------|------|
| **파라미터** | `_roundId`: 라운드 ID |
| **반환값** | `uint256` — 해당 라운드의 전체 티켓 수 |

---

#### `getMyTickets(uint256 _roundId)` — external view

| 항목 | 내용 |
|------|------|
| **파라미터** | `_roundId`: 라운드 ID |
| **반환값** | `uint256` — 호출자의 티켓 수 |

---

#### `getUserTickets(uint256 _roundId, address _user)` — external view

| 항목 | 내용 |
|------|------|
| **파라미터** | `_roundId`, `_user` |
| **반환값** | `Ticket[]` — 사용자의 티켓 배열 |

```solidity
struct Ticket {
    uint256 roundId;
    address buyer;
    uint256 purchaseBlock;
}
```

---

#### `getTicketBuyer(uint256 _roundId, uint256 _ticketIndex)` — external view

| 항목 | 내용 |
|------|------|
| **파라미터** | `_roundId`, `_ticketIndex` |
| **반환값** | `address` — 티켓 구매자 주소 |

---

### 4.3 상금 및 인출 정보

#### `getDistribution(uint256 _totalPool)` — external pure

| 항목 | 내용 |
|------|------|
| **파라미터** | `_totalPool`: 풀 금액 |
| **반환값** | `(winnerAmount, communityAmount, operationAmount)` |

**프론트엔드 연동 (시뮬레이션)**:
```typescript
// 1000 META 풀일 때 분배 예상액 조회
const { data } = useContractRead({
  address: CONTRACT_ADDRESS,
  abi: MetaLottoABI,
  functionName: 'getDistribution',
  args: [parseEther('1000')],
})
// data: [900n, 50n, 50n] (wei)
```

---

#### `getPendingWithdrawal(address _user)` — external view

| 항목 | 내용 |
|------|------|
| **파라미터** | `_user`: 사용자 주소 |
| **반환값** | `uint256` — 미수령 상금 (wei) |

---

#### `getWinnerHistory(uint256 _fromRoundId, uint256 _count)` — external view

| 항목 | 내용 |
|------|------|
| **파라미터** | `_fromRoundId`: 시작 라운드 ID, `_count`: 조회 개수 |
| **반환값** | `(address[] winners, uint256[] prizes)` |

---

### 4.4 설정값 조회

| 함수 | 반환 타입 | 설명 |
|------|-----------|------|
| `ticketPrice()` | `uint256` | 티켓 가격 (wei) |
| `roundDuration()` | `uint256` | 라운드 기간 (초) |
| `drawDelay()` | `uint256` | 추첨 지연 블록 수 |
| `minTicketsPerRound()` | `uint256` | 최소 티켓 수 |
| `communityFund()` | `address` | 커뮤니티 펀드 주소 |
| `operationFund()` | `address` | 운영 지갑 주소 |
| `currentRoundId()` | `uint256` | 현재 라운드 ID |
| `paused()` | `bool` | 일시 정지 여부 |

---

## 5. Admin 함수 (onlyOwner)

### 5.1 설정값 변경

| 함수 | 파라미터 | 이벤트 |
|------|----------|--------|
| `setTicketPrice(uint256 _newPrice)` | `_newPrice` | `ConfigUpdated("ticketPrice", old, new)` |
| `setRoundDuration(uint256 _newDuration)` | `_newDuration` | `ConfigUpdated("roundDuration", old, new)` |
| `setDrawDelay(uint256 _newDelay)` | `_newDelay` | `ConfigUpdated("drawDelay", old, new)` |
| `setMinTickets(uint256 _newMin)` | `_newMin` | `ConfigUpdated("minTicketsPerRound", old, new)` |

**에러**:
| Error | 조건 |
|-------|------|
| `InvalidParameter()` | 값이 0 또는 범위 초과 |
| `Ownable: caller is not the owner` | Owner가 아닌 주소에서 호출 |

---

### 5.2 펀드 주소 변경

| 함수 | 파라미터 | 이벤트 |
|------|----------|--------|
| `setCommunityFund(address _newFund)` | `_newFund` | `FundAddressUpdated("communityFund", old, new)` |
| `setOperationFund(address _newFund)` | `_newFund` | `FundAddressUpdated("operationFund", old, new)` |

**에러**:
| Error | 조건 |
|-------|------|
| `InvalidAddress()` | `address(0)` 전달 |

---

## 6. 이벤트

### 6.1 이벤트 목록

#### 라운드 관련

```solidity
event RoundStarted(
    uint256 indexed roundId,
    uint256 startBlock,
    uint256 endTimestamp,
    uint256 ticketPrice
);

event RoundClosing(
    uint256 indexed roundId,
    uint256 drawBlock,
    uint256 totalPool,
    uint256 totalTickets
);

event RoundCancelled(
    uint256 indexed roundId,
    uint256 refundableAmount,
    uint256 ticketCount
);

event WinnerDrawn(
    uint256 indexed roundId,
    address indexed winner,
    uint256 winnerPrize,
    uint256 communityAmount,
    uint256 operationAmount
);
```

#### 티켓 관련

```solidity
event TicketPurchased(
    uint256 indexed roundId,
    address indexed buyer,
    uint256 ticketCount,
    uint256 totalCost
);
```

#### 환불/인출 관련

```solidity
event RefundClaimed(
    uint256 indexed roundId,
    address indexed buyer,
    uint256 amount
);

event WithdrawalClaimed(
    address indexed user,
    uint256 amount
);
```

#### 상금 지급 관련

```solidity
event PrizeDistributed(
    uint256 indexed roundId,
    address indexed winner,
    uint256 winnerAmount,
    uint256 communityAmount,
    uint256 operationAmount
);

event PrizeTransferSuccess(
    address indexed winner,
    uint256 amount
);

event PrizeTransferFailed(
    address indexed winner,
    uint256 amount
);
```

#### 설정 변경 관련

```solidity
event ConfigUpdated(
    string parameter,
    uint256 oldValue,
    uint256 newValue
);

event FundAddressUpdated(
    string fundType,
    address oldAddress,
    address newAddress
);
```

#### 비상 정지 관련 (OpenZeppelin 제공)

```solidity
event Paused(address account);
event Unpaused(address account);
```

### 6.2 인덱싱 전략

| 이벤트 | indexed 필드 | 용도 |
|--------|-------------|------|
| RoundStarted | `roundId` | 라운드별 필터링 |
| RoundClosing | `roundId` | 라운드별 필터링 |
| RoundCancelled | `roundId` | 라운드별 필터링 |
| WinnerDrawn | `roundId`, `winner` | 라운드별/당첨자별 필터링 |
| TicketPurchased | `roundId`, `buyer` | 라운드별/구매자별 필터링 |
| RefundClaimed | `roundId`, `buyer` | 라운드별/환불자별 필터링 |
| WithdrawalClaimed | `user` | 사용자별 필터링 |
| PrizeTransferSuccess | `winner` | 당첨자별 필터링 |
| PrizeTransferFailed | `winner` | 당첨자별 필터링 |

---

## 7. Custom Errors

### 7.1 전체 에러 목록

```solidity
error RoundNotOpen();           // 라운드 상태가 Open이 아님
error RoundNotClosing();        // 라운드 상태가 Closing이 아님
error SaleNotEnded();           // 아직 판매 마감 시각 도달 전
error DrawBlockNotReached();    // 아직 drawBlock 도달 전
error DrawExpired();            // blockhash 조회 불가 (256블록 초과)
error InvalidTicketCount();     // 티켓 수량 오류 (0 또는 100 초과)
error InsufficientPayment();    // 지불 금액 부족
error NoTicketsToRefund();      // 환불할 티켓 없음
error RoundNotCancelled();      // 라운드 상태가 Cancelled이 아님
error AlreadyRefunded();        // 이미 환불 완료
error TransferFailed();         // META 송금 실패
error InvalidAddress();         // 유효하지 않은 주소 (0x0)
error InvalidParameter();       // 유효하지 않은 파라미터
error NoPendingWithdrawal();    // 인출 가능한 금액 없음
```

### 7.2 에러 발생 시나리오

| Error | 함수 | 조건 |
|-------|------|------|
| `RoundNotOpen()` | `buyTickets`, `closeRound` | 라운드 상태 != Open |
| `RoundNotClosing()` | `drawWinner`, `forceCloseDraw` | 라운드 상태 != Closing |
| `SaleNotEnded()` | `closeRound` | `block.timestamp < endTimestamp` |
| `DrawBlockNotReached()` | `drawWinner` | `block.number <= drawBlock` |
| `DrawExpired()` | `drawWinner` | `block.number > drawBlock + 256` |
| `InvalidTicketCount()` | `buyTickets` | `_count == 0` 또는 `_count > 100` |
| `InsufficientPayment()` | `buyTickets` | `msg.value < ticketPrice * _count` |
| `NoTicketsToRefund()` | `claimRefund` | 구매한 티켓 없음 |
| `RoundNotCancelled()` | `claimRefund` | 라운드 상태 != Cancelled |
| `TransferFailed()` | `buyTickets`, `drawWinner`, `withdrawPending` | META 송금 실패 |
| `InvalidAddress()` | constructor, `setCommunityFund`, `setOperationFund` | `address(0)` 전달 |
| `InvalidParameter()` | constructor, `setTicketPrice`, etc. | 값이 0 또는 범위 초과 |
| `NoPendingWithdrawal()` | `withdrawPending` | `pendingWithdrawals[msg.sender] == 0` |

---

## 8. 프론트엔드 연동 가이드

### 8.1 wagmi/viem 설정

```typescript
// frontend/src/lib/wagmi.ts
import { createConfig, http } from 'wagmi'
import { metaMuseum } from './chains'

export const config = createConfig({
  chains: [metaMuseum],
  transports: {
    [metaMuseum.id]: http('https://api.metadium.com/prod'),
  },
})

// frontend/src/lib/chains.ts
import { Chain } from 'viem'

export const metaMuseum = {
  id: 11,
  name: 'Metadium Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'META',
    symbol: 'META',
  },
  rpcUrls: {
    default: { http: ['https://api.metadium.com/prod'] },
  },
  blockExplorers: {
    default: { name: 'Metadium Explorer', url: 'https://explorer.metadium.com' },
  },
} as const satisfies Chain
```

### 8.2 컨트랙트 읽기 (useContractRead)

```typescript
// 현재 라운드 정보 조회
import { useContractRead } from 'wagmi'

export function useCurrentRound() {
  return useContractRead({
    address: CONTRACT_ADDRESS,
    abi: MetaLottoABI,
    functionName: 'getCurrentRound',
    watch: true, // 실시간 갱신
  })
}

// 내 티켓 수 조회
export function useMyTickets(roundId: bigint) {
  return useContractRead({
    address: CONTRACT_ADDRESS,
    abi: MetaLottoABI,
    functionName: 'getMyTickets',
    args: [roundId],
  })
}
```

### 8.3 컨트랙트 쓰기 (useContractWrite)

```typescript
// 티켓 구매
import { useContractWrite, usePrepareContractWrite } from 'wagmi'

export function useBuyTickets(count: bigint, value: bigint) {
  const { config } = usePrepareContractWrite({
    address: CONTRACT_ADDRESS,
    abi: MetaLottoABI,
    functionName: 'buyTickets',
    args: [count],
    value: value,
    enabled: count > 0n,
  })

  return useContractWrite(config)
}

// 사용 예시
function TicketPurchaseButton() {
  const ticketCount = 10n
  const ticketPrice = 100n * 10n ** 18n // 100 META
  const totalValue = ticketPrice * ticketCount

  const { write, isLoading, isSuccess } = useBuyTickets(ticketCount, totalValue)

  return (
    <button
      onClick={() => write?.()}
      disabled={isLoading}
    >
      {isLoading ? '처리 중...' : `${ticketCount}장 구매`}
    </button>
  )
}
```

### 8.4 이벤트 구독 (useWatchContractEvent)

```typescript
import { useWatchContractEvent, useAccount } from 'wagmi'
import { useQueryClient } from '@tanstack/react-query'

export function useRoundEvents(currentRoundId: bigint) {
  const queryClient = useQueryClient()
  const { address } = useAccount()

  // 티켓 구매 이벤트
  useWatchContractEvent({
    address: CONTRACT_ADDRESS,
    abi: MetaLottoABI,
    eventName: 'TicketPurchased',
    args: { roundId: currentRoundId },
    onLogs: (logs) => {
      // UI 갱신
      queryClient.invalidateQueries({ queryKey: ['currentRound'] })
      queryClient.invalidateQueries({ queryKey: ['myTickets'] })

      // 구매 알림
      const log = logs[0]
      console.log(`티켓 ${log.args.ticketCount}장 구매 완료`)
    },
  })

  // 당첨자 발표 이벤트
  useWatchContractEvent({
    address: CONTRACT_ADDRESS,
    abi: MetaLottoABI,
    eventName: 'WinnerDrawn',
    onLogs: (logs) => {
      const log = logs[0]
      queryClient.invalidateQueries({ queryKey: ['currentRound'] })

      // 내가 당첨되었는지 확인
      if (log.args.winner === address) {
        alert(`축하합니다! ${formatEther(log.args.winnerPrize)} META 당첨!`)
      }
    },
  })

  // 라운드 시작 이벤트
  useWatchContractEvent({
    address: CONTRACT_ADDRESS,
    abi: MetaLottoABI,
    eventName: 'RoundStarted',
    onLogs: () => {
      queryClient.invalidateQueries({ queryKey: ['currentRound'] })
    },
  })
}
```

### 8.5 트랜잭션 상태 추적

```typescript
import { useWaitForTransaction } from 'wagmi'

function TicketPurchaseWithStatus() {
  const { data, write, isLoading } = useContractWrite({
    address: CONTRACT_ADDRESS,
    abi: MetaLottoABI,
    functionName: 'buyTickets',
  })

  const { isLoading: isConfirming, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
  })

  return (
    <div>
      <button onClick={() => write?.({ args: [5n], value: parseEther('500') })}>
        5장 구매
      </button>

      {isLoading && <p>트랜잭션 전송 중...</p>}
      {isConfirming && <p>트랜잭션 확인 대기 중...</p>}
      {isSuccess && <p>구매 완료!</p>}
    </div>
  )
}
```

### 8.6 에러 핸들링

```typescript
import { useContractWrite } from 'wagmi'

function useBuyTicketsWithErrorHandling() {
  const { write, error } = useContractWrite({
    address: CONTRACT_ADDRESS,
    abi: MetaLottoABI,
    functionName: 'buyTickets',
    onError: (error) => {
      // Custom Error 파싱
      if (error.message.includes('RoundNotOpen')) {
        alert('현재 라운드에서는 티켓을 구매할 수 없습니다.')
      } else if (error.message.includes('InsufficientPayment')) {
        alert('META 잔액이 부족합니다.')
      } else if (error.message.includes('InvalidTicketCount')) {
        alert('티켓 수량은 1~100장 사이여야 합니다.')
      } else {
        alert(`오류 발생: ${error.message}`)
      }
    },
  })

  return { write }
}
```

---

## 9. Enum 정의

### 9.1 RoundStatus

```solidity
enum RoundStatus {
    Open,       // 0: 티켓 판매 중
    Closing,    // 1: 판매 종료, 미래 블록 대기 중
    Drawing,    // 2: 당첨자 선정 가능 (미래 블록 도달) — 현재 미사용
    Completed,  // 3: 상금 분배 완료
    Cancelled   // 4: 라운드 취소 (참여자 < 최소인원)
}
```

### 9.2 프론트엔드 타입 정의

```typescript
// frontend/src/types/contract.ts
export enum RoundStatus {
  Open = 0,
  Closing = 1,
  Drawing = 2,
  Completed = 3,
  Cancelled = 4,
}

export const RoundStatusLabels: Record<RoundStatus, string> = {
  [RoundStatus.Open]: '진행 중',
  [RoundStatus.Closing]: '추첨 대기',
  [RoundStatus.Drawing]: '추첨 중',
  [RoundStatus.Completed]: '완료',
  [RoundStatus.Cancelled]: '취소됨',
}

export interface Round {
  roundId: bigint
  status: RoundStatus
  startBlock: bigint
  endTimestamp: bigint
  drawBlock: bigint
  ticketPrice: bigint
  totalPool: bigint
  ticketCount: bigint
  winner: `0x${string}`
  winnerPrize: bigint
  seed: bigint
}

export interface Ticket {
  roundId: bigint
  buyer: `0x${string}`
  purchaseBlock: bigint
}
```

---

## 10. 가스 추정

### 10.1 주요 함수별 가스 비용

| 함수 | 예상 가스 | 비고 |
|------|-----------|------|
| `buyTickets(1)` | ~80,000 | 티켓 1장 |
| `buyTickets(10)` | ~250,000 | 티켓 10장 |
| `buyTickets(100)` | ~2,000,000 | 티켓 100장 (최대) |
| `closeRound()` | ~50,000 | 라운드 종료 |
| `drawWinner()` | ~150,000 | 당첨자 추첨 + 분배 |
| `claimRefund()` | ~60,000 | 환불 |
| `withdrawPending()` | ~40,000 | 미수령금 인출 |

### 10.2 Metadium 가스 가격

- Metadium Mainnet: 가스 가격이 낮음 (일반적으로 < 1 Gwei)
- 트랜잭션 비용은 대부분 가스 한도 설정에 의해 결정

---

## 11. 변경 이력

| 날짜 | 변경 내용 | 이유 |
|------|----------|------|
| 2026-03-13 | 초기 작성 | /design 스킬 산출물 |
