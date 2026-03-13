# F-03 티켓 구매 — 기술 설계서

## 1. 참조
- 인수조건: docs/project/features.md #F-03
- 시스템 설계: docs/system/system-design.md

## 2. 아키텍처 결정

### 결정 1: 결제 방식
- **선택지**: A) META 토큰 (ERC-20) / B) Native META (msg.value)
- **결정**: B) Native META (msg.value)
- **근거**: Metadium 체인에서 META는 native currency, 추가 컨트랙트 호출 없이 가스 절약

### 결정 2: 티켓 수량 제한
- **선택지**: A) 무제한 / B) 1회 100장 / C) 라운드당 100장
- **결정**: B) 1회 100장
- **근거**: DOS 방지 (가스 폭발), 공정성 보장

### 결정 3: 티켓 데이터 구조
- **선택지**: A) 배열에 직접 저장 / B) 매핑 + 카운터
- **결정**: A) 배열에 직접 저장
- **근거**: 당첨자 추첨 시 O(1) 인덱싱, 순서 보존

## 3. 상태 변수 설계

### 3.1 Struct 정의

```solidity
struct Ticket {
    uint256 roundId;       // 소속 라운드 ID
    address buyer;         // 구매자 주소
    uint256 purchaseBlock; // 구매 시점 블록 번호
}
```

### 3.2 상태 변수

| 변수 | 타입 | Visibility | 설명 |
|------|------|------------|------|
| `roundTickets` | `mapping(uint256 => Ticket[])` | `internal` | 라운드 ID → 티켓 배열 |
| `userTicketIndices` | `mapping(uint256 => mapping(address => uint256[]))` | `internal` | 라운드 ID → 사용자 → 티켓 인덱스 배열 |
| `ticketPrice` | `uint256` | `public` | 티켓 가격 (wei) |

### 3.3 기본값

| 변수 | 기본값 | 비고 |
|------|--------|------|
| `ticketPrice` | `100 * 1e18` | 100 META |

### 3.4 상수

```solidity
uint256 public constant MAX_TICKETS_PER_PURCHASE = 100;  // 1회 최대 구매 수
```

## 4. 함수 설계

### 4.1 buyTickets() — external payable

```solidity
function buyTickets(uint256 _count)
    external
    payable
    whenNotPaused
    nonReentrant
{
    // 1. Checks
    Round storage round = rounds[currentRoundId];

    require(round.status == RoundStatus.Open, RoundNotOpen());
    require(_count >= 1 && _count <= MAX_TICKETS_PER_PURCHASE, InvalidTicketCount());

    uint256 totalCost = ticketPrice * _count;
    require(msg.value >= totalCost, InsufficientPayment());

    // 2. Effects (상태 변경)
    // 2-1. 풀 금액 업데이트
    round.totalPool += totalCost;

    // 2-2. 티켓 발급
    uint256 startTicketIndex = round.ticketCount;
    for (uint256 i = 0; i < _count; i++) {
        roundTickets[currentRoundId].push(Ticket({
            roundId: currentRoundId,
            buyer: msg.sender,
            purchaseBlock: block.number
        }));
        userTicketIndices[currentRoundId][msg.sender].push(startTicketIndex + i);
    }
    round.ticketCount += _count;

    // 2-3. 엔트로피 누적 (F-02)
    round.seed = uint256(keccak256(
        abi.encodePacked(
            round.seed,
            msg.sender,
            block.number,
            _count,
            msg.value
        )
    ));

    // 3. Interactions (초과금 환불)
    if (msg.value > totalCost) {
        (bool refundSuccess, ) = msg.sender.call{value: msg.value - totalCost}("");
        require(refundSuccess, TransferFailed());
    }

    // 4. 이벤트
    emit TicketPurchased(currentRoundId, msg.sender, _count, totalCost);
}
```

### 4.2 _updateSeed() — internal (헬퍼)

```solidity
function _updateSeed(uint256 _count) internal {
    Round storage round = rounds[currentRoundId];
    round.seed = uint256(keccak256(
        abi.encodePacked(
            round.seed,
            msg.sender,
            block.number,
            _count,
            msg.value
        )
    ));
}
```

## 5. View 함수

### 5.1 getRoundTicketCount(uint256 _roundId)

```solidity
function getRoundTicketCount(uint256 _roundId) external view returns (uint256) {
    return roundTickets[_roundId].length;
}
```

### 5.2 getMyTickets(uint256 _roundId)

```solidity
function getMyTickets(uint256 _roundId) external view returns (uint256) {
    return userTicketIndices[_roundId][msg.sender].length;
}
```

### 5.3 getTicketBuyer(uint256 _roundId, uint256 _ticketIndex)

```solidity
function getTicketBuyer(uint256 _roundId, uint256 _ticketIndex)
    external
    view
    returns (address)
{
    require(_ticketIndex < roundTickets[_roundId].length, InvalidTicketCount());
    return roundTickets[_roundId][_ticketIndex].buyer;
}
```

### 5.4 getUserTickets(uint256 _roundId, address _user)

```solidity
function getUserTickets(uint256 _roundId, address _user)
    external
    view
    returns (Ticket[] memory)
{
    uint256[] storage indices = userTicketIndices[_roundId][_user];
    Ticket[] memory tickets = new Ticket[](indices.length);

    for (uint256 i = 0; i < indices.length; i++) {
        tickets[i] = roundTickets[_roundId][indices[i]];
    }

    return tickets;
}
```

## 6. 가스 최적화 고려사항

### 6.1 메모리 vs Storage
- `roundTickets` 배열 push: SSTORE (20,000 gas for new slot)
- `userTicketIndices` 배열 push: SSTORE
- 루프 내 storage 접근 최소화

### 6.2 최적화 기법

```solidity
// 최적화 전: 매번 storage 읽기
for (uint256 i = 0; i < _count; i++) {
    roundTickets[currentRoundId].push(...);
}

// 최적화 후: storage 포인터 사용
Ticket[] storage tickets = roundTickets[currentRoundId];
for (uint256 i = 0; i < _count; i++) {
    tickets.push(Ticket({
        roundId: currentRoundId,
        buyer: msg.sender,
        purchaseBlock: block.number
    }));
}
```

### 6.3 가스 비용 추정

| 작업 | 예상 가스 |
|------|-----------|
| 티켓 1장 구매 | ~80,000 gas |
| 티켓 10장 구매 | ~250,000 gas |
| 티켓 100장 구매 | ~2,000,000 gas |

## 7. 에러 케이스

| Error | 시나리오 | 대응 |
|-------|----------|------|
| `RoundNotOpen()` | Open 상태가 아닐 때 구매 시도 | revert |
| `InvalidTicketCount()` | _count = 0 또는 _count > 100 | revert |
| `InsufficientPayment()` | msg.value < ticketPrice * _count | revert |
| `TransferFailed()` | 초과금 환불 실패 | revert |

## 8. 보안 고려사항

### 8.1 ReentrancyGuard
- `buyTickets`는 `nonReentrant` modifier 적용
- 초과금 환불 시 CEI 패턴 준수

### 8.2 Integer Overflow
- Solidity 0.8.x 기본 체크
- `_count` 범위 제한 (1~100)

### 8.3 DOS 방지
- 100장 제한으로 가스 폭발 방지
- 블록 가스 한도 내에서 안전

## 9. 이벤트

```solidity
event TicketPurchased(
    uint256 indexed roundId,
    address indexed buyer,
    uint256 ticketCount,
    uint256 totalCost
);
```

### 9.1 인덱싱 전략
- `roundId`: indexed — 라운드별 필터링
- `buyer`: indexed — 사용자별 필터링
- `ticketCount`, `totalCost`: 일반 — 통계용

## 10. Admin 함수

### 10.1 setTicketPrice(uint256 _newPrice)

```solidity
function setTicketPrice(uint256 _newPrice) external onlyOwner {
    require(_newPrice > 0, InvalidParameter());

    uint256 oldPrice = ticketPrice;
    ticketPrice = _newPrice;

    emit ConfigUpdated("ticketPrice", oldPrice, _newPrice);
}
```

## 11. 영향 범위

### 수정 필요 파일
- `contracts/src/MetaLotto.sol`

### 신규 생성 파일
- `contracts/test/MetaLottoTicket.t.sol` (티켓 구매 테스트)

## 12. META 토큰 처리

### 12.1 msg.value 검증
```solidity
uint256 totalCost = ticketPrice * _count;
require(msg.value >= totalCost, InsufficientPayment());
```

### 12.2 초과금 환불
```solidity
if (msg.value > totalCost) {
    (bool refundSuccess, ) = msg.sender.call{value: msg.value - totalCost}("");
    require(refundSuccess, TransferFailed());
}
```

### 12.3 컨트랙트 잔액 관리
- 티켓 판매금은 컨트랙트에 자동 축적
- `round.totalPool`로 추적 (실제 잔액과 일치해야 함)
- 상금 분배 시 `call{value: ...}`로 송금

## 변경 이력
| 날짜 | 변경 내용 | 이유 |
|------|----------|------|
| 2026-03-13 | 초기 작성 | M1 마일스톤 시작 |
