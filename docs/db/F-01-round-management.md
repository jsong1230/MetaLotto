# F-01 라운드 관리 — DB 스키마 확정본

## 개요
- **기능**: F-01 라운드 관리
- **컨트랙트**: MetaLotto.sol
- **버전**: v1.0 (최종 확정)
- **날짜**: 2026-03-13

## 상태 변수

### 라운드 관련 변수

| 변수명 | 타입 | Visibility | 설명 |
|---------|-------|------------|-------|
| `currentRoundId` | `uint256` | `public` | 현재 활성 라운드 ID |
| `rounds` | `mapping(uint256 => Round)` | `public` | 라운드 ID → 라운드 정보 |
| `roundDuration` | `uint256` | `public` | 라운드 지속 시간 (초), 기본값: 21600 (6시간) |
| `drawDelay` | `uint256` | `public` | 추첨 지연 블록 수, 기본값: 10 |
| `minTicketsPerRound` | `uint256` | `public` | 라운드 최소 티켓 수, 기본값: 2 |
| `ticketPrice` | `uint256` | `public` | 티켓 가격 (wei), 기본값: 100 * 1e18 |

### 펀드 관련 변수

| 변수명 | 타입 | Visibility | 설명 |
|---------|-------|------------|-------|
| `communityFund` | `address` | `public` | 커뮤니티 펀드 주소 (5% 상금) |
| `operationFund` | `address` | `public` | 운영 지갑 주소 (5% 상금) |

### 티켓 관련 변수

| 변수명 | 타입 | Visibility | 설명 |
|---------|-------|------------|-------|
| `roundTickets` | `mapping(uint256 => Ticket[])` | `public` | 라운드 ID → 티켓 배열 |
| `userTicketIndices` | `mapping(uint256 => mapping(address => uint256[]))` | `public` | 라운드 ID → 구매자 → 티켓 인덱스 배열 |
| `pendingWithdrawals` | `mapping(address => uint256)` | `public` | 주소 → 미수령 상금 |

## 데이터 구조

### Round 구조체

```solidity
struct Round {
    uint256 roundId;           // 라운드 고유 ID
    RoundStatus status;        // 현재 상태 (0: Open, 1: Closing, 2: Drawing, 3: Completed, 4: Cancelled)
    uint256 startBlock;        // 라운드 시작 블록
    uint256 endTimestamp;      // 티켓 판매 마감 시각 (Unix timestamp)
    uint256 drawBlock;         // 난수 생성에 사용할 미래 블록 번호
    uint256 ticketPrice;       // 티켓 가격 (wei)
    uint256 totalPool;         // 누적 풀 금액 (wei)
    uint256 ticketCount;       // 발행된 총 티켓 수
    address winner;            // 당첨자 주소 (추첨 후 설정)
    uint256 winnerPrize;       // 당첨 금액 (wei)
    uint256 seed;              // 누적 엔트로피 시드
}
```

### Ticket 구조체

```solidity
struct Ticket {
    uint256 roundId;           // 라운드 ID
    address buyer;            // 구매자 주소
    uint256 purchaseBlock;      // 구매 블록
}
```

### RoundStatus 열거형

```solidity
enum RoundStatus {
    Open,       // 0: 티켓 판매 중
    Closing,    // 1: 판매 종료, 미래 블록 대기 중
    Drawing,    // 2: 당첨자 선정 가능 (사용 안 함, Closing에서 바로 Completed로 전이)
    Completed,  // 3: 상금 분배 완료
    Cancelled   // 4: 라운드 취소 (참여자 < 최소인원)
}
```

## 상수

| 상수명 | 값 | 설명 |
|---------|-----|-------|
| `WINNER_SHARE` | 9000 | 당첨자 지분율 (90%) |
| `COMMUNITY_SHARE` | 500 | 커뮤니티 펀드 지분율 (5%) |
| `OPERATION_SHARE` | 500 | 운영 펀드 지분율 (5%) |
| `BASIS_POINTS` | 10000 | 기준점 (100%) |
| `MAX_TICKETS_PER_PURCHASE` | 100 | 구매 가능 최대 티켓 수 |

## 상태 전이

### 상태 전이 다이어그램

```
    DEPLOY
       |
       v
    [Open] <-------------------------------+
       |                                   |
       | closeRound()                      |
       | (endTimestamp 도달)               |
       v                                   |
    +--+--+                                |
    |     |                                |
    |     +--- ticketCount < minTickets -->[Cancelled]
    |     |
    |     +--- ticketCount >= minTickets
    v
 [Closing]
    |
    | drawWinner()
    | (block.number > drawBlock)
    v
[Completed] ---------> [Open] (새 라운드 자동 시작)
```

### 상태 전이 조건

| 현재 상태 | 트리거 | 다음 상태 | 전제 조건 |
|-----------|--------|-----------|-----------|
| (배포) | constructor | Open | 컨트랙트 배포 시 자동 |
| Open | closeRound() | Closing | `block.timestamp >= endTimestamp` && `ticketCount >= minTickets` |
| Open | closeRound() | Cancelled | `block.timestamp >= endTimestamp` && `ticketCount < minTickets` |
| Closing | drawWinner() | Completed | `block.number > drawBlock` && `block.number <= drawBlock + 256` |
| Completed | _startNewRound() | Open | 상금 분배 완료 후 자동 |

## 인덱스 설계

### 주요 쿼리 패턴

1. **라운드 조회**:
   - `rounds[roundId]`: O(1) 직접 접근

2. **티켓 조회**:
   - `roundTickets[roundId]`: O(n) 티켓 배열 순회 (n = 티켓 수)
   - `userTicketIndices[roundId][address]`: O(n) 사용자 티켓 조회

3. **상금 조회**:
   - `pendingWithdrawals[address]`: O(1) 직접 접근

### 성능 최적화 고려사항

- **N+1 쿼리 방지**: `rounds` 매핑 사용으로 O(1) 조회
- **필드 선택**: `getRound()`에서 전체 struct 반환 (Foundry에서 자동 최적화)
- **페이지네이션**: 현재 구현 없음 (모든 티켓 조회 시 gas 소모 주의)

## 이벤트 로그

### 이벤트 목록

| 이벤트명 | 인덱스 | 파라미터 | 설명 |
|----------|--------|---------|-------|
| `RoundStarted` | `roundId` | `roundId, startBlock, endTimestamp, ticketPrice` | 라운드 시작 |
| `RoundClosing` | `roundId` | `roundId, drawBlock, totalPool, totalTickets` | 라운드 종료 |
| `RoundCancelled` | `roundId` | `roundId, refundableAmount, ticketCount` | 라운드 취소 |
| `ConfigUpdated` | 없음 | `parameter, oldValue, newValue` | 설정 변경 |
| `TicketPurchased` | `roundId, buyer` | `roundId, buyer, ticketCount, totalCost` | 티켓 구매 |
| `WinnerDrawn` | `roundId, winner` | `roundId, winner, winnerPrize, communityAmount, operationAmount` | 당첨자 선정 |
| `PrizeDistributed` | `roundId, winner` | `roundId, winner, winnerAmount, communityAmount, operationAmount` | 상금 분배 |
| `PrizeTransferSuccess` | `winner` | `winner, amount` | 상금 전송 성공 |
| `PrizeTransferFailed` | `winner` | `winner, amount` | 상금 전송 실패 (pendingWithdrawals에 저장) |
| `RefundClaimed` | `roundId, buyer` | `roundId, buyer, amount` | 환불 청구 |
| `WithdrawalClaimed` | `user` | `user, amount` | 인출 청구 |
| `FundAddressUpdated` | 없음 | `fundType, oldAddress, newAddress` | 펀드 주소 변경 |

## 에러 코드

| 에러 | 설명 | 발생 조건 |
|------|------|-----------|
| `InvalidAddress()` | 유효하지 않은 주소 | 펀드 주소가 `address(0)` |
| `InvalidParameter()` | 유효하지 않은 파라미터 | 설정값이 0 또는 범위 초과 |
| `RoundNotOpen()` | 라운드가 열리지 않음 | Open 상태가 아닐 때 closeRound() 호출 |
| `SaleNotEnded()` | 판매가 종료되지 않음 | endTimestamp 전에 closeRound() 호출 |
| `RoundNotClosing()` | 라운드가 종료 상태가 아님 | Closing 상태가 아닐 때 forceCloseDraw() 호출 |
| `DrawBlockNotReached()` | drawBlock 도달하지 않음 | forceCloseDraw()에서 `block.number <= drawBlock + 256` |
| `DrawExpired()` | 추첨 유효기간 만료 | drawWinner()에서 `block.number > drawBlock + 256` |
| `InvalidTicketCount()` | 유효하지 않은 티켓 수 | buyTickets()에서 `_count == 0 || _count > MAX_TICKETS_PER_PURCHASE` |
| `InsufficientPayment()` | 지불 금액 부족 | buyTickets()에서 `msg.value < ticketPrice * _count` |
| `NoTicketsToRefund()` | 환불할 티켓 없음 | claimRefund()에서 사용자 티켓 없음 |
| `RoundNotCancelled()` | 라운드가 취소되지 않음 | claimRefund()에서 상태가 Cancelled 아님 |
| `AlreadyRefunded()` | 이미 환불됨 | claimRefund()에서 이미 환불됨 |
| `TransferFailed()` | 전송 실패 | ETH/Token 전송 실패 |

## 변경 이력

| 날짜 | 변경 내용 | 이유 |
|------|----------|------|
| 2026-03-13 | 최종 확정본 작성 | F-01 라운드 관리 GREEN 달성 |
