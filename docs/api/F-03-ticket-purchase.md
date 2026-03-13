# F-03 티켓 구매 — API 스펙 확정본

## 1. 개요

### 1.1 기능 설명
사용자가 META 토큰으로 복권 티켓을 구매하는 기능입니다. 티켓 구매는 현재 Open 상태인 라운드에 대해서만 가능하며, 1회 최대 100장까지 구매할 수 있습니다.

### 1.2 컨트랙트 주소
- **Mainnet**: TBD (배포 후 업데이트)
- **Testnet**: TBD (배포 후 업데이트)

### 1.3 ABI
컨트랙트 ABI는 `frontend/src/abis/MetaLotto.json`에 저장됩니다.

---

## 2. Core Functions

### 2.1 buyTickets()

티켓을 구매합니다.

#### 함수 시그니처
```solidity
function buyTickets(uint256 _count)
    external
    payable
    whenNotPaused
    nonReentrant
```

#### 파라미터

| 파라미터 | 타입 | 설명 | 제한 |
|----------|------|------|------|
| `_count` | `uint256` | 구매할 티켓 수 | 1 ~ 100 |

#### 결제

| 항목 | 설명 |
|------|------|
| 결제 방식 | `msg.value` (Native META) |
| 단일 티켓 가격 | `ticketPrice` (wei) |
| 총 비용 | `ticketPrice * _count` |
| 초과금 | 자동 환불 |

#### 에러 케이스

| 에러 | 설명 |
|------|------|
| `RoundNotOpen()` | 현재 라운드가 Open 상태가 아님 |
| `InvalidTicketCount()` | `_count`가 1~100 범위를 벗어남 |
| `InsufficientPayment()` | `msg.value`가 총 비용보다 부족함 |
| `TransferFailed()` | 초과금 환불 실패 (receive() 함수가 없는 컨트랙트) |
| - | `Pausable`: 컨트랙트가 일시정지 상태임 |
| - | `ReentrancyGuard`: 재진입 시도 차단 |

#### 이벤트

```solidity
event TicketPurchased(
    uint256 indexed roundId,
    address indexed buyer,
    uint256 ticketCount,
    uint256 totalCost
);
```

#### 프론트엔드 호출 예시

```typescript
import { useContractWrite } from 'wagmi'
import MetaLottoABI from '@/abis/MetaLotto.json'

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_METALOTTO_ADDRESS as `0x${string}`
const TICKET_PRICE = BigInt(100 * 1e18) // 100 META

function useBuyTickets() {
  return useContractWrite({
    address: CONTRACT_ADDRESS,
    abi: MetaLottoABI,
    functionName: 'buyTickets',
  })
}

// 사용 예시
const { write, isLoading } = useBuyTickets()

function handlePurchase(count: number) {
  write({
    value: BigInt(count) * TICKET_PRICE,
    args: [BigInt(count)],
  })
}
```

---

## 3. View Functions

### 3.1 getCurrentRound()

현재 라운드 정보를 조회합니다.

#### 함수 시그니처
```solidity
function getCurrentRound() external view returns (Round memory round)
```

#### 리턴 값

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

#### 프론트엔드 호출 예시

```typescript
import { useContractRead } from 'wagmi'

function useCurrentRound() {
  return useContractRead({
    address: CONTRACT_ADDRESS,
    abi: MetaLottoABI,
    functionName: 'getCurrentRound',
  })
}

// 사용 예시
const { data: currentRound } = useCurrentRound()
```

---

### 3.2 getRoundTicketCount()

특정 라운드의 전체 티켓 수를 조회합니다.

#### 함수 시그니처
```solidity
function getRoundTicketCount(uint256 _roundId) external view returns (uint256)
```

#### 파라미터

| 파라미터 | 타입 | 설명 |
|----------|------|------|
| `_roundId` | `uint256` | 라운드 ID |

#### 리턴 값

| 값 | 타입 | 설명 |
|----|------|------|
| - | `uint256` | 라운드 티켓 수 |

#### 프론트엔드 호출 예시

```typescript
function useRoundTicketCount(roundId: number) {
  return useContractRead({
    address: CONTRACT_ADDRESS,
    abi: MetaLottoABI,
    functionName: 'getRoundTicketCount',
    args: [BigInt(roundId)],
  })
}
```

---

### 3.3 getMyTickets()

현재 사용자가 특정 라운드에서 구매한 티켓 수를 조회합니다.

#### 함수 시그니처
```solidity
function getMyTickets(uint256 _roundId) external view returns (uint256)
```

#### 파라미터

| 파라미터 | 타입 | 설명 |
|----------|------|------|
| `_roundId` | `uint256` | 라운드 ID |

#### 리턴 값

| 값 | 타입 | 설명 |
|----|------|------|
| - | `uint256` | 내 티켓 수 |

#### 프론트엔드 호출 예시

```typescript
function useMyTickets(roundId: number) {
  return useContractRead({
    address: CONTRACT_ADDRESS,
    abi: MetaLottoABI,
    functionName: 'getMyTickets',
    args: [BigInt(roundId)],
  })
}
```

---

### 3.4 getTicketBuyer()

특정 티켓의 구매자를 조회합니다.

#### 함수 시그니처
```solidity
function getTicketBuyer(uint256 _roundId, uint256 _ticketIndex)
    external
    view
    returns (address)
```

#### 파라미터

| 파라미터 | 타입 | 설명 |
|----------|------|------|
| `_roundId` | `uint256` | 라운드 ID |
| `_ticketIndex` | `uint256` | 티켓 인덱스 |

#### 리턴 값

| 값 | 타입 | 설명 |
|----|------|------|
| - | `address` | 티켓 구매자 주소 |

#### 에러 케이스

| 에러 | 설명 |
|------|------|
| `InvalidTicketCount()` | `_ticketIndex`가 유효하지 않음 |

#### 프론트엔드 호출 예시

```typescript
function useTicketBuyer(roundId: number, ticketIndex: number) {
  return useContractRead({
    address: CONTRACT_ADDRESS,
    abi: MetaLottoABI,
    functionName: 'getTicketBuyer',
    args: [BigInt(roundId), BigInt(ticketIndex)],
  })
}
```

---

### 3.5 getUserTickets()

특정 사용자가 특정 라운드에서 구매한 모든 티켓을 조회합니다.

#### 함수 시그니처
```solidity
function getUserTickets(uint256 _roundId, address _user)
    external
    view
    returns (Ticket[] memory)
```

#### 파라미터

| 파라미터 | 타입 | 설명 |
|----------|------|------|
| `_roundId` | `uint256` | 라운드 ID |
| `_user` | `address` | 사용자 주소 |

#### 리턴 값

```solidity
struct Ticket {
    uint256 roundId;
    address buyer;
    uint256 purchaseBlock;
}
```

#### 프론트엔드 호출 예시

```typescript
function useUserTickets(roundId: number, userAddress: `0x${string}`) {
  return useContractRead({
    address: CONTRACT_ADDRESS,
    abi: MetaLottoABI,
    functionName: 'getUserTickets',
    args: [BigInt(roundId), userAddress],
  })
}
```

---

### 3.6 getTimeRemaining()

현재 라운드의 남은 시간(초)을 조회합니다.

#### 함수 시그니처
```solidity
function getTimeRemaining() external view returns (uint256)
```

#### 리턴 값

| 값 | 타입 | 설명 |
|----|------|------|
| - | `uint256` | 남은 시간(초), 0이면 판매 종료 |

---

### 3.7 getDrawBlockRemaining()

추첨까지 남은 블록 수를 조회합니다.

#### 함수 시그니처
```solidity
function getDrawBlockRemaining() external view returns (uint256)
```

#### 리턴 값

| 값 | 타입 | 설명 |
|----|------|------|
| - | `uint256` | 남은 블록 수, 0이면 Open 상태 또는 추첨 가능 |

---

## 4. Admin Functions

### 4.1 setTicketPrice()

티켓 가격을 변경합니다. Owner만 호출 가능합니다.

#### 함수 시그니처
```solidity
function setTicketPrice(uint256 _newPrice) external onlyOwner
```

#### 파라미터

| 파라미터 | 타입 | 설명 |
|----------|------|------|
| `_newPrice` | `uint256` | 새 티켓 가격 (wei) |

#### 에러 케이스

| 에러 | 설명 |
|------|------|
| `InvalidParameter()` | `_newPrice`가 0 |

---

## 5. 상수

### 5.1 ticketPrice

현재 티켓 가격 (wei)

#### 읽기
```solidity
uint256 public ticketPrice;
```

---

### 5.2 MAX_TICKETS_PER_PURCHASE

1회 최대 구매 수 (100)

#### 읽기
```solidity
uint256 public constant MAX_TICKETS_PER_PURCHASE = 100;
```

---

## 6. Custom Errors

```solidity
error RoundNotOpen();
error InvalidTicketCount();
error InsufficientPayment();
error TransferFailed();
error InvalidParameter();
```

---

## 7. Gas Usage

| 작업 | 예상 가스 |
|------|-----------|
| 티켓 1장 구매 | ~240,000 gas |
| 티켓 10장 구매 | ~1,050,000 gas |
| 티켓 100장 구매 | ~9,150,000 gas |

---

## 8. Event Subscription

### TicketPurchased 이벤트 구독

```typescript
import { useWatchContractEvent } from 'wagmi'

function useTicketPurchasedEvent() {
  const queryClient = useQueryClient()

  useWatchContractEvent({
    address: CONTRACT_ADDRESS,
    abi: MetaLottoABI,
    eventName: 'TicketPurchased',
    onLogs: () => {
      queryClient.invalidateQueries({ queryKey: ['currentRound'] })
      queryClient.invalidateQueries({ queryKey: ['myTickets'] })
    },
  })
}
```

---

## 9. 참조

- [시스템 설계서](/docs/system/system-design.md)
- [F-03 기술 설계서](/docs/specs/F-03-ticket-purchase/design.md)
- [F-03 테스트 명세](/docs/specs/F-03-ticket-purchase/test-spec.md)
