# MetaLotto 스마트 컨트랙트 상태 변수 스키마

## 1. 개요

MetaLotto 컨트랙트의 상태 변수(Storage) 구조를 정의합니다.

---

## 2. 상태 변수

### 2.1 라운드 관련

| 변수 | 타입 | Visibility | 설명 |
|------|------|------------|------|
| `currentRoundId` | `uint256` | `public` | 현재 라운드 ID (0에서 시작, 컨트랙트 생성 시 1로 초기화) |
| `rounds` | `mapping(uint256 => Round)` | `public` | 라운드 ID → 라운드 정보 매핑 |

### 2.2 티켓 관련

| 변수 | 타입 | Visibility | 설명 |
|------|------|------------|------|
| `roundTickets` | `mapping(uint256 => Ticket[])` | `public` | 라운드 ID → 티켓 배열 매핑 |
| `userTicketIndices` | `mapping(uint256 => mapping(address => uint256[]))` | `public` | 라운드 ID → 구매자 → 티켓 인덱스 배열 매핑 |

### 2.3 상금 관련

| 변수 | 타입 | Visibility | 설명 |
|------|------|------------|------|
| `pendingWithdrawals` | `mapping(address => uint256)` | `public` | 주소 → 미수령 상금 매핑 |

### 2.4 펀드 주소

| 변수 | 타입 | Visibility | 설명 |
|------|------|------------|------|
| `communityFund` | `address` | `public` | 커뮤니티 펀드 주소 |
| `operationFund` | `address` | `public` | 운영 지갑 주소 |

### 2.5 설정 변수

| 변수 | 타입 | Visibility | 설명 | 기본값 |
|------|------|------------|------|--------|
| `ticketPrice` | `uint256` | `public` | 티켓 가격 (wei) | 100 * 1e18 |
| `roundDuration` | `uint256` | `public` | 라운드 지속 시간 (초) | 7 * 24 * 3600 (7일) |
| `drawDelay` | `uint256` | `public` | 추첨 지연 블록 수 | 10 |
| `minTicketsPerRound` | `uint256` | `public` | 최소 티켓 수 | 10 |

---

## 3. 구조체

### 3.1 Round

```solidity
struct Round {
    uint256 roundId;           // 라운드 고유 ID
    RoundStatus status;        // 현재 상태 (Open/Closing/Completed/Cancelled)
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

**필드 설명**:
- `roundId`: 라운드 고유 ID. 1부터 시작하며 라운드마다 1씩 증가
- `status`: 현재 라운드 상태. Open → Closing → Completed 또는 Cancelled
- `startBlock`: 라운드 시작 블록 번호. `_startNewRound()` 호출 시 설정
- `endTimestamp`: 티켓 판매 마감 시각 (Unix timestamp). `startTimestamp + roundDuration`
- `drawBlock`: 난수 생성에 사용할 미래 블록 번호. `closeRound()` 호출 시 `block.number + drawDelay`로 설정
- `ticketPrice`: 티켓 가격. 현재 설정된 `ticketPrice`로 고정
- `totalPool`: 누적 풀 금액. `ticketPrice * ticketCount` (초과금 포함하지 않음)
- `ticketCount`: 발행된 총 티켓 수. `buyTickets()` 호출 시 증가
- `winner`: 당첨자 주소. `drawWinner()` 호출 시 설정
- `winnerPrize`: 당첨 금액. `totalPool * 90 / 100`
- `seed`: 누적 엔트로피 시드. 티켓 구매 시마다 `keccak256(seed, msg.sender, block.number, _count, msg.value)`로 업데이트

**Storage Layout**:
```
Slot 0: roundId, status (packed)
Slot 1: startBlock
Slot 2: endTimestamp
Slot 3: drawBlock
Slot 4: ticketPrice
Slot 5: totalPool
Slot 6: ticketCount
Slot 7: winner
Slot 8: winnerPrize
Slot 9: seed
```

### 3.2 Ticket

```solidity
struct Ticket {
    uint256 roundId;           // 소속 라운드 ID
    address buyer;             // 구매자 주소
    uint256 purchaseBlock;     // 구매 시점 블록 번호
}
```

**필드 설명**:
- `roundId`: 소속 라운드 ID
- `buyer`: 구매자 주소
- `purchaseBlock`: 구매 시점 블록 번호 (난수 생성 엔트로피로 사용)

**Storage Layout**:
```
Slot 0: roundId
Slot 1: buyer
Slot 2: purchaseBlock
```

---

## 4. 열거형

### 4.1 RoundStatus

```solidity
enum RoundStatus {
    Open,       // 0: 티켓 판매 중
    Closing,    // 1: 판매 종료, 미래 블록 대기 중
    Completed,  // 2: 상금 분배 완료
    Cancelled   // 3: 라운드 취소 (최소 인원 미달)
}
```

**상태 전이**:
```
Open → Closing → Completed (정상 종료)
Open → Cancelled (최소 티켓 미달)
```

---

## 5. 상수

| 상수 | 값 | 타입 | 설명 |
|------|-----|------|------|
| `WINNER_SHARE` | 9000 | `uint256` | 당첨자 분배율 (90%) |
| `COMMUNITY_SHARE` | 500 | `uint256` | 커뮤니티 분배율 (5%) |
| `OPERATION_SHARE` | 500 | `uint256` | 운영 분배율 (5%) |
| `BASIS_POINTS` | 10000 | `uint256` | 기준 포인트 (100%) |
| `MAX_TICKETS_PER_PURCHASE` | 100 | `uint256` | 1회 최대 구매 티켓 수 |

---

## 6. 데이터 인덱싱 전략

### 6.1 라운드 조회
- `rounds[roundId]`: 라운드 ID로 O(1) 조회

### 6.2 티켓 조회
- `roundTickets[roundId][index]`: 라운드 내 티켓 인덱스로 O(1) 조회
- `userTicketIndices[roundId][user]`: 사용자별 티켓 인덱스 배열

### 6.3 당첨자 선정
- `randomness % round.ticketCount`: O(1) 상수 시간

---

## 7. 가스 비용

### 7.1 Storage Operations

| 작업 | 가스 |
|------|------|
| SSTORE (새 슬롯) | 20,000 gas |
| SSTORE (기존 슬롯) | 5,000 gas |
| SLOAD | 2,100 gas |

### 7.2 구조체 크기

| 구조체 | 슬롯 수 | 예상 가스 |
|--------|---------|----------|
| `Round` | 10 | ~210,000 gas (초기화) |
| `Ticket` | 3 | ~63,000 gas (초기화) |

---

## 8. 보안 고려사항

### 8.1 Reentrancy 방지
- `nonReentrant` modifier 적용
- CEI 패턴 준수

### 8.2 Integer Overflow
- Solidity 0.8.x 기본 체크
- `_count` 범위 제한 (1~100)

### 8.3 Storage 액세스 제어
- `public` 상태 변수: getter 함수 자동 생성
- `internal` 상태 변수: 컨트랙트 내부에서만 접근

---

## 9. 데이터 일관성

### 9.1 라운드 상태 일관성
- `rounds[roundId].ticketCount`와 `roundTickets[roundId].length`는 동일해야 함
- `rounds[roundId].totalPool`와 `ticketPrice * ticketCount`는 동일해야 함

### 9.2 티켓 인덱스 일관성
- `roundTickets[roundId][i]`의 `buyer`와 `userTicketIndices[roundId][buyer]`에 포함된 인덱스가 일치해야 함

### 9.3 상금 일관성
- `winnerPrize + communityAmount + operationAmount = totalPool`
- `winnerPrize = totalPool * 9000 / 10000`
- `communityAmount = totalPool * 500 / 10000`
- `operationAmount = totalPool * 500 / 10000`

---

## 10. 온체인 데이터 예시

### 10.1 Round 예시

```solidity
Round({
    roundId: 1,
    status: RoundStatus.Completed,
    startBlock: 12345678,
    endTimestamp: 1710326400,  // 2024-03-13 00:00:00 UTC
    drawBlock: 12345688,
    ticketPrice: 100000000000000000000,  // 100 META
    totalPool: 10000000000000000000000,  // 10,000 META
    ticketCount: 100,
    winner: 0x1234...5678,
    winnerPrize: 9000000000000000000000,  // 9,000 META
    seed: 0x9a8b7c6d5e4f3a2b...
})
```

### 10.2 Ticket 예시

```solidity
Ticket({
    roundId: 1,
    buyer: 0x1234...5678,
    purchaseBlock: 12345679
})
```

---

## 변경 이력

| 날짜 | 변경 내용 |
|------|----------|
| 2026-03-13 | 초기 작성 (F-02, F-03, F-07 구현 완료) |
