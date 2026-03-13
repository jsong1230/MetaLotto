# F-01 라운드 관리 — 기술 설계서

## 1. 참조
- 인수조건: docs/project/features.md #F-01
- 시스템 설계: docs/system/system-design.md

## 2. 아키텍처 결정

### 결정 1: 라운드 상태 관리 방식
- **선택지**: A) Enum 기반 상태 머신 / B) uint8 상태 코드
- **결정**: A) Enum 기반 상태 머신
- **근거**: 가독성, 타입 안전성, Solidity 0.8.x에서 Enum 최적화

### 결정 2: 라운드 전환 트리거
- **선택지**: A) Keeper 자동화 / B) 누구나 호출 가능한 퍼블릭 함수
- **결정**: B) 누구나 호출 가능한 퍼블릭 함수
- **근거**: Metadium 블록체인에 Keeper 인프라 없음, 인센티브 없이도 사용자가 호출할 동기 존재 (다음 라운드 참여)

### 결정 3: 라운드 ID 관리
- **선택지**: A) 증분형 uint256 / B) 타임스탬프 기반
- **결정**: A) 증분형 uint256
- **근거**: 단순성, 조회 효율성, 히스토리 관리 용이

## 3. 상태 변수 설계

### 3.1 Enum 정의

```solidity
enum RoundStatus {
    Open,       // 0: 티켓 판매 중
    Closing,    // 1: 판매 종료, 미래 블록 대기 중
    Drawing,    // 2: 당첨자 선정 가능 (미래 블록 도달) — 사용되지 않음 (Closing에서 바로 Completed)
    Completed,  // 3: 상금 분배 완료
    Cancelled   // 4: 라운드 취소 (참여자 < 최소인원)
}
```

### 3.2 Struct 정의

```solidity
struct Round {
    uint256 roundId;           // 라운드 고유 ID
    RoundStatus status;        // 현재 상태
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

### 3.3 상태 변수

| 변수 | 타입 | Visibility | 설명 |
|------|------|------------|------|
| `currentRoundId` | `uint256` | `public` | 현재 활성 라운드 ID |
| `rounds` | `mapping(uint256 => Round)` | `public` | 라운드 ID → 라운드 정보 |
| `roundDuration` | `uint256` | `public` | 라운드 지속 시간 (초) |
| `drawDelay` | `uint256` | `public` | 추첨용 블록 지연 수 |
| `minTicketsPerRound` | `uint256` | `public` | 라운드 최소 티켓 수 |

### 3.4 기본값

| 변수 | 기본값 | 비고 |
|------|--------|------|
| `roundDuration` | `21600` | 6시간 (초) |
| `drawDelay` | `10` | 10블록 |
| `minTicketsPerRound` | `2` | 최소 2장 |

## 4. 함수 설계

### 4.1 constructor

```solidity
constructor(
    address _communityFund,
    address _operationFund,
    uint256 _ticketPrice,
    uint256 _roundDuration,
    uint256 _drawDelay,
    uint256 _minTickets
) Ownable(msg.sender) {
    // 검증
    require(_communityFund != address(0), InvalidAddress());
    require(_operationFund != address(0), InvalidAddress());
    require(_ticketPrice > 0, InvalidParameter());
    require(_roundDuration >= 3600, InvalidParameter());  // 최소 1시간
    require(_drawDelay >= 1, InvalidParameter());
    require(_minTickets >= 1, InvalidParameter());

    // 설정 저장
    communityFund = _communityFund;
    operationFund = _operationFund;
    ticketPrice = _ticketPrice;
    roundDuration = _roundDuration;
    drawDelay = _drawDelay;
    minTicketsPerRound = _minTickets;

    // 첫 라운드 자동 시작
    _startNewRound();
}
```

### 4.2 _startNewRound() — internal

```solidity
function _startNewRound() internal {
    currentRoundId++;

    Round storage newRound = rounds[currentRoundId];
    newRound.roundId = currentRoundId;
    newRound.status = RoundStatus.Open;
    newRound.startBlock = block.number;
    newRound.endTimestamp = block.timestamp + roundDuration;
    newRound.ticketPrice = ticketPrice;
    newRound.totalPool = 0;
    newRound.ticketCount = 0;
    newRound.winner = address(0);
    newRound.winnerPrize = 0;
    newRound.seed = 0;

    emit RoundStarted(
        currentRoundId,
        newRound.startBlock,
        newRound.endTimestamp,
        newRound.ticketPrice
    );
}
```

### 4.3 closeRound() — external

```solidity
function closeRound() external whenNotPaused {
    Round storage round = rounds[currentRoundId];

    // 검증
    require(round.status == RoundStatus.Open, RoundNotOpen());
    require(block.timestamp >= round.endTimestamp, SaleNotEnded());

    // 최소 티켓 수 확인
    if (round.ticketCount < minTicketsPerRound) {
        // 라운드 취소
        round.status = RoundStatus.Cancelled;

        emit RoundCancelled(
            currentRoundId,
            round.totalPool,
            round.ticketCount
        );

        // 새 라운드 시작
        _startNewRound();
        return;
    }

    // 정상 종료: Closing 상태로 전이
    round.status = RoundStatus.Closing;
    round.drawBlock = block.number + drawDelay;

    emit RoundClosing(
        currentRoundId,
        round.drawBlock,
        round.totalPool,
        round.ticketCount
    );
}
```

### 4.4 forceCloseDraw() — external onlyOwner

```solidity
function forceCloseDraw() external onlyOwner {
    Round storage round = rounds[currentRoundId];

    // 검증
    require(round.status == RoundStatus.Closing, RoundNotClosing());
    require(block.number > round.drawBlock + 256, DrawBlockNotReached());

    // 새로운 drawBlock 설정
    uint256 oldDrawBlock = round.drawBlock;
    round.drawBlock = block.number + drawDelay;

    emit ConfigUpdated("drawBlock", oldDrawBlock, round.drawBlock);
}
```

## 5. 상태 전이 로직

### 5.1 상태 전이 다이어그램

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

### 5.2 상태 전이 조건

| 현재 상태 | 트리거 | 다음 상태 | 전제 조건 |
|-----------|--------|-----------|-----------|
| (배포) | constructor | Open | 컨트랙트 배포 시 자동 |
| Open | closeRound() | Closing | `block.timestamp >= endTimestamp` && `ticketCount >= minTickets` |
| Open | closeRound() | Cancelled | `block.timestamp >= endTimestamp` && `ticketCount < minTickets` |
| Closing | drawWinner() | Completed | `block.number > drawBlock` (F-02에서 구현) |
| Completed | _startNewRound() | Open | 상금 분배 완료 후 자동 |

## 6. 에러 케이스

| Error | 시나리오 | 대응 |
|-------|----------|------|
| `RoundNotOpen()` | Open 상태가 아닐 때 closeRound() 호출 | revert |
| `SaleNotEnded()` | endTimestamp 전에 closeRound() 호출 | revert |
| `RoundNotClosing()` | Closing 상태가 아닐 때 forceCloseDraw() 호출 | revert |
| `DrawBlockNotReached()` | drawBlock + 256 전에 forceCloseDraw() 호출 | revert |
| `InvalidAddress()` | 펀드 주소가 0x0 | constructor revert |
| `InvalidParameter()` | 설정값이 0 또는 범위 초과 | constructor/setter revert |

## 7. View 함수

### 7.1 getCurrentRound()

```solidity
function getCurrentRound() external view returns (Round memory) {
    return rounds[currentRoundId];
}
```

### 7.2 getRound(uint256 _roundId)

```solidity
function getRound(uint256 _roundId) external view returns (Round memory) {
    return rounds[_roundId];
}
```

### 7.3 getTimeRemaining()

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

## 8. 이벤트

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

event ConfigUpdated(
    string parameter,
    uint256 oldValue,
    uint256 newValue
);
```

## 9. 영향 범위

### 수정 필요 파일
- `contracts/src/MetaLotto.sol` (신규)

### 신규 생성 파일
- `contracts/test/MetaLottoRound.t.sol` (라운드 관리 테스트)

## 10. 성능 고려사항

### 가스 최적화
- `rounds` 매핑 사용: O(1) 조회
- `Round` struct는 storage에 직접 저장
- 상태 변수는 필요한 만큼만 packing 고려

### 이벤트 인덱싱
- `roundId`: indexed — 라운드별 필터링
- `startBlock`, `endTimestamp`: 일반 — 전체 조회용

## 변경 이력
| 날짜 | 변경 내용 | 이유 |
|------|----------|------|
| 2026-03-13 | 초기 작성 | M1 마일스톤 시작 |
