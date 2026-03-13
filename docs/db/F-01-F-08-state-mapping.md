# MetaLotto 상태 매핑 (State Mapping)

## 개요
스마트 컨트랙트 상태를 온체인에서 조회하는 방법과 데이터 구조 정의

---

## 1. 상태 변수 매핑

### 1.1 Core State Variables

| Solidity Variable | Type | Description | 예시 |
|-------------------|------|-------------|------|
| `currentRoundId` | `uint256` | 현재 활성 라운드 ID | 42 |
| `communityFund` | `address` | 커뮤니티 펀드 주소 | 0x1234... |
| `operationFund` | `address` | 운영 지갑 주소 | 0x5678... |
| `ticketPrice` | `uint256` | 티켓 가격 (wei) | 100000000000000000000 |
| `roundDuration` | `uint256` | 라운드 기간 (초) | 21600 |
| `drawDelay` | `uint256` | 추첨 지연 블록 수 | 10 |
| `minTicketsPerRound` | `uint256` | 최소 티켓 수 | 2 |

### 1.2 Mapping Variables

| Variable | Key Type | Value Type | Description |
|----------|----------|------------|-------------|
| `rounds` | `uint256` (roundId) | `Round` struct | 라운드 정보 |
| `roundTickets` | `uint256` (roundId) | `Ticket[]` | 티켓 배열 |
| `userTicketIndices` | `uint256` (roundId) | `mapping(address => uint256[])` | 사용자별 티켓 인덱스 |
| `pendingWithdrawals` | `address` | `uint256` | 미수령 상금 |

---

## 2. Struct 정의

### 2.1 Round Struct

```solidity
struct Round {
    uint256 roundId;           // 라운드 고유 ID
    RoundStatus status;        // 현재 상태 (0:Open, 1:Closing, 2:Completed, 3:Cancelled)
    uint256 startBlock;        // 라운드 시작 블록
    uint256 endTimestamp;      // 티켓 판매 마감 시각 (Unix timestamp)
    uint256 drawBlock;         // 난수 생성에 사용할 미래 블록 번호
    uint256 ticketPrice;       // 티켓 가격 (wei)
    uint256 totalPool;         // 누적 풀 금액 (wei)
    uint256 ticketCount;       // 발행된 총 티켓 수
    address winner;            // 당첨자 주소
    uint256 winnerPrize;       // 당첨 금액 (wei)
    uint256 seed;              // 누적 엔트로피 시드
}
```

**Frontend Type Definition (TypeScript):**
```typescript
export type RoundStatus = 0 | 1 | 2 | 3

export const RoundStatus = {
  Open: 0,
  Closing: 1,
  Completed: 2,
  Cancelled: 3,
} as const

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
```

---

### 2.2 Ticket Struct

```solidity
struct Ticket {
    uint256 roundId;
    address buyer;
    uint256 purchaseBlock;
}
```

**Frontend Type Definition (TypeScript):**
```typescript
export interface Ticket {
  roundId: bigint
  buyer: `0x${string}`
  purchaseBlock: bigint
}
```

---

## 3. 상태 머신 (State Machine)

### 3.1 RoundStatus Enum

```solidity
enum RoundStatus {
    Open,       // 0: 티켓 판매 중
    Closing,    // 1: 판매 종료, 미래 블록 대기 중
    Completed,  // 2: 상금 분배 완료
    Cancelled   // 3: 라운드 취소
}
```

### 3.2 상태 전이

```
DEPLOY (constructor)
    ↓
[Open] ── closeRound() (endTimestamp 도달) ──┐
    │                                      │
    │                                      ├── ticketCount < minTickets → [Cancelled]
    │                                      │
    │                                      └── ticketCount >= minTickets → [Closing]
    │
[Closing] ── drawWinner() (block.number > drawBlock) ──→ [Completed]
    │
    └── forceCloseDraw() (256블록 초과) ──→ [Closing] (drawBlock 재설정)

[Completed] ── _startNewRound() ──→ [Open]
[Cancelled] ── claimRefund() ──→ [Cancelled] (환불 처리, 상태 유지)
```

---

## 4. 조회 패턴

### 4.1 현재 라운드 조회

```solidity
function getCurrentRound() external view returns (Round memory) {
    return rounds[currentRoundId];
}
```

**Frontend:**
```typescript
const { data: currentRound } = useContractRead({
  address: CONTRACT_ADDRESS,
  abi: MetaLottoABI,
  functionName: 'getCurrentRound',
})

// 상태 텍스트 변환
const getStatusText = (status: number) => {
  const texts = ['Open', 'Closing', 'Completed', 'Cancelled']
  return texts[status] || 'Unknown'
}
```

---

### 4.2 특정 라운드 조회

```solidity
function getRound(uint256 _roundId) external view returns (Round memory) {
    return rounds[_roundId];
}
```

**Frontend:**
```typescript
const { data: round } = useContractRead({
  address: CONTRACT_ADDRESS,
  abi: MetaLottoABI,
  functionName: 'getRound',
  args: [1n], // roundId = 1
})
```

---

### 4.3 사용자 티켓 조회

```solidity
function getMyTickets(uint256 _roundId) external view returns (uint256) {
    return userTicketIndices[_roundId][msg.sender].length;
}
```

**Frontend:**
```typescript
const { data: myTicketCount } = useContractRead({
  address: CONTRACT_ADDRESS,
  abi: MetaLottoABI,
  functionName: 'getMyTickets',
  args: [currentRoundId],
})
```

---

### 4.4 라운드 전체 티켓 수 조회

```solidity
function getRoundTicketCount(uint256 _roundId) external view returns (uint256) {
    return rounds[_roundId].ticketCount;
}
```

---

## 5. 계산된 필드 (Computed Fields)

### 5.1 상금 분배 계산

```solidity
uint256 winnerPrize = (totalPool * WINNER_SHARE) / BASIS_POINTS;
uint256 communityAmount = (totalPool * COMMUNITY_SHARE) / BASIS_POINTS;
uint256 operationAmount = (totalPool * OPERATION_SHARE) / BASIS_POINTS;
```

| 비율 | 상수 | 예시 (totalPool = 1000 META) |
|------|------|----------------------------|
| 당첨자 | 90% | 900 META |
| 커뮤니티 펀드 | 5% | 50 META |
| 운영 펀드 | 5% | 50 META |

---

### 5.2 남은 시간 계산

```solidity
function getTimeRemaining() external view returns (uint256) {
    Round storage round = rounds[currentRoundId];
    if (round.status != RoundStatus.Open) {
        return 0;
    }
    uint256 remaining = round.endTimestamp > block.timestamp
        ? round.endTimestamp - block.timestamp
        : 0;
    return remaining;
}
```

**Frontend 포맷:**
```typescript
const formatTime = (seconds: bigint) => {
  const secs = Number(seconds)
  const hours = Math.floor(secs / 3600)
  const minutes = Math.floor((secs % 3600) / 60)
  const seconds = secs % 60
  return `${hours}h ${minutes}m ${seconds}s`
}
```

---

### 5.3 추첨 가능 여부 판단

```solidity
bool canDraw =
    round.status == RoundStatus.Closing &&
    block.number > round.drawBlock &&
    block.number <= round.drawBlock + 256;
```

---

## 6. 난수 생성 로직

### 6.1 시드 업데이트 (티켓 구매 시)

```solidity
round.seed = uint256(keccak256(
    abi.encodePacked(
        round.seed,        // 이전 시드
        msg.sender,        // 구매자 주소
        block.number,      // 구매 시점 블록
        _count             // 구매 티켓 수
    )
));
```

---

### 6.2 난수 생성 (추첨 시)

```solidity
uint256 randomness = uint256(keccak256(
    abi.encodePacked(
        blockhash(drawBlock),          // 미래 블록 해시 1
        blockhash(drawBlock + 1),      // 미래 블록 해시 2
        blockhash(drawBlock + 2),      // 미래 블록 해시 3
        round.seed                     // 누적 엔트로피
    )
));

uint256 winnerIndex = randomness % ticketCount;
address winner = roundTickets[roundId][winnerIndex].buyer;
```

---

## 7. 인덱싱 전략

### 7.1 이벤트 기반 인덱싱

| Event | Indexed Parameter | 조회 용도 |
|-------|------------------|-----------|
| `RoundStarted` | `roundId` | 라운드 생성 이력 |
| `TicketPurchased` | `roundId`, `buyer` | 사용자별 구매 내역 |
| `RoundClosing` | `roundId` | 라운드 종료 이력 |
| `WinnerDrawn` | `roundId`, `winner` | 당첨자 이력 |
| `RoundCancelled` | `roundId` | 취소 라운드 이력 |
| `RefundClaimed` | `roundId`, `buyer` | 환불 이력 |

---

### 7.2 Frontend 이벤트 구독 예시

```typescript
// 티켓 구매 이벤트 구독
useWatchContractEvent({
  address: CONTRACT_ADDRESS,
  abi: MetaLottoABI,
  eventName: 'TicketPurchased',
  onLogs: (logs) => {
    logs.forEach(log => {
      console.log('Ticket purchased:', {
        roundId: log.args.roundId,
        buyer: log.args.buyer,
        ticketCount: log.args.ticketCount,
        totalCost: log.args.totalCost,
      })
      // UI 업데이트
      queryClient.invalidateQueries({ queryKey: ['currentRound'] })
      queryClient.invalidateQueries({ queryKey: ['myTickets'] })
    })
  },
})

// 당첨자 이벤트 구독
useWatchContractEvent({
  address: CONTRACT_ADDRESS,
  abi: MetaLottoABI,
  eventName: 'WinnerDrawn',
  onLogs: (logs) => {
    logs.forEach(log => {
      console.log('Winner drawn:', {
        roundId: log.args.roundId,
        winner: log.args.winner,
        winnerPrize: log.args.winnerPrize,
      })
      // 당첨 알림 표시
      showNotification(
        `Round ${log.args.roundId} Winner!`,
        `${log.args.winner} won ${formatEther(log.args.winnerPrize)} META`
      )
    })
  },
})
```

---

## 8. 상태 일관성 보장

### 8.1 불변성 (Immutability)

| 변수 | 불변성 | 설명 |
|------|--------|------|
| `roundId` | O | 생성 후 변경 불가 |
| `startBlock` | O | 생성 후 변경 불가 |
| `ticketPrice` (Round 내) | O | 라운드 내 일정 |
| `endTimestamp` | O | 생성 후 변경 불가 |

---

### 8.2 재진입 방지 (ReentrancyGuard)

```solidity
function buyTickets(uint256 _count)
    external
    payable
    whenNotPaused
    nonReentrant  // 재진입 방지
{
    // ...
}
```

---

### 8.3 CEI 패턴 (Checks-Effects-Interactions)

```solidity
function claimRefund(uint256 _roundId) external nonReentrant {
    // 1. Checks
    Round storage round = rounds[_roundId];
    require(round.status == RoundStatus.Cancelled, RoundNotCancelled());

    uint256[] storage userTickets = userTicketIndices[_roundId][msg.sender];
    require(userTickets.length > 0, NoTicketsToRefund());

    uint256 refundAmount = userTickets.length * round.ticketPrice;

    // 2. Effects (상태 변경 먼저)
    userTicketIndices[_roundId][msg.sender] = new uint256[](0);

    // 3. Interactions (외부 호출 마지막)
    (bool success, ) = msg.sender.call{value: refundAmount}("");
    require(success, TransferFailed());

    emit RefundClaimed(_roundId, msg.sender, refundAmount);
}
```

---

## 9. 에러 처리

### 9.1 Custom Errors Mapping

| Solidity Error | Frontend Message | Action |
|----------------|------------------|--------|
| `RoundNotOpen()` | "티켓 구매가 가능한 라운드가 아닙니다." | 대기 |
| `RoundNotClosing()` | "추첨 준비가 완료되지 않았습니다." | 대기 |
| `SaleNotEnded()` | "티켓 판매 기간이 아직 종료되지 않았습니다." | 대기 |
| `DrawBlockNotReached()` | "추첨 블록에 도달하지 않았습니다." | 대기 |
| `DrawExpired()` | "추첨 유효 기간이 만료되었습니다." | 관리자에게 문의 |
| `InvalidTicketCount()` | "1~100장 범위 내에서 구매해주세요." | 재입력 |
| `InsufficientPayment()` | "결제 금액이 부족합니다." | 재입력 |
| `NoTicketsToRefund()` | "환불할 티켓이 없습니다." | 확인 |
| `RoundNotCancelled()` | "취소된 라운드가 아닙니다." | 확인 |
| `TransferFailed()` | "전송 실패. 다시 시도해주세요." | 재시도 |
| `InvalidAddress()` | "유효하지 않은 주소입니다." | 확인 |
| `InvalidParameter()` | "유효하지 않은 파라미터입니다." | 확인 |

---

### 9.2 OpenZeppelin Errors

| Error | Description |
|-------|-------------|
| `Pausable: paused` | 컨트랙트 일시정지 상태 |
| `Pausable: not paused` | 이미 활성 상태 |
| `Ownable: caller is not the owner` | Owner가 아님 |

---

## 10. 트랜잭션 추적

### 10.1 티켓 구매 흐름

```
1. 사용자: buyTickets(5) + value
   ↓
2. 검증: 티켓 수(1~100), 결제 금액, 라운드 상태(Open)
   ↓
3. 상태 변경:
   - roundTickets[roundId].push(Ticket)
   - userTicketIndices[roundId][buyer].push(index)
   - round.totalPool += msg.value
   - round.ticketCount += 5
   - round.seed = keccak256(...)
   ↓
4. 이벤트: TicketPurchased(roundId, buyer, 5, totalCost)
   ↓
5. 완료
```

---

### 10.2 라운드 종료 흐름

```
1. 호출자: closeRound()
   ↓
2. 검증: 라운드 상태(Open), endTimestamp 도달
   ↓
3. 분기:
   ├─ ticketCount < minTickets → Cancelled
   │   ├─ round.status = Cancelled
   │   ├─ emit RoundCancelled()
   │   └─ _startNewRound()
   │
   └─ ticketCount >= minTickets → Closing
       ├─ round.status = Closing
       ├─ round.drawBlock = block.number + drawDelay
       └─ emit RoundClosing()
   ↓
4. 완료
```

---

## 11. 프론트엔드 상태 관리 예시

### 11.1 Zustand Store

```typescript
// src/stores/roundStore.ts
import { create } from 'zustand'
import { Round, RoundStatus } from '@/types/round'

interface RoundStore {
  currentRound: Round | null
  isLoading: boolean
  error: string | null
  setCurrentRound: (round: Round) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  refreshRound: () => Promise<void>
}

export const useRoundStore = create<RoundStore>((set, get) => ({
  currentRound: null,
  isLoading: true,
  error: null,

  setCurrentRound: (round) => set({ currentRound: round }),

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error }),

  refreshRound: async () => {
    set({ isLoading: true, error: null })
    try {
      const round = await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: MetaLottoABI,
        functionName: 'getCurrentRound',
      })
      set({ currentRound: round as Round, isLoading: false })
    } catch (error) {
      set({ error: 'Failed to fetch round', isLoading: false })
    }
  },
}))
```

---

## 변경 이력
| 날짜 | 버전 | 변경 내용 |
|------|------|----------|
| 2026-03-13 | 1.0.0 | 초기 문서 (F-01, F-08) |
