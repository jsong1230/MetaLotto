# MetaLotto — Smart Contract Technical Specification

**Version**: 1.0
**Date**: 2026-03-12
**PRD Reference**: MetaLotto_PRD v1.1
**Solidity**: ^0.8.24
**Target Chain**: Metadium Mainnet (EVM Compatible)
**Token**: META (Native Token — msg.value로 처리, ERC-20 아님)

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────┐
│                  MetaLotto.sol                   │
│         (단일 컨트랙트, 모듈별 구분)               │
├─────────────────────────────────────────────────┤
│  Round Management    │  Ticket Management       │
│  - createRound()     │  - buyTickets()           │
│  - closeRound()      │  - getTickets()           │
│  - drawWinner()      │  - getMyTickets()         │
├──────────────────────┼──────────────────────────┤
│  Randomness          │  Prize Distribution       │
│  - requestDraw()     │  - distributePrize()      │
│  - fulfillDraw()     │  - claimRefund()          │
├──────────────────────┼──────────────────────────┤
│  Admin / Config      │  Views / Getters          │
│  - pause/unpause     │  - getRoundInfo()         │
│  - setTicketPrice()  │  - getCurrentRound()      │
│  - setDuration()     │  - getWinnerHistory()     │
└─────────────────────────────────────────────────┘
         inherits: Ownable, Pausable, ReentrancyGuard
```

**설계 결정: 단일 컨트랙트 vs 분리**

v1에서는 단일 컨트랙트(`MetaLotto.sol`)로 구현한다. 이유:
- 컨트랙트 간 호출 가스비 절약
- 배포 및 업그레이드 단순화
- 상태 공유가 많아 분리 시 복잡도만 증가
- `IRandomnessProvider` 인터페이스만 분리하여 v2 VRF 교체 경로 확보

---

## 2. Dependencies

```
OpenZeppelin Contracts v5.x
├── @openzeppelin/contracts/access/Ownable.sol
├── @openzeppelin/contracts/utils/Pausable.sol
└── @openzeppelin/contracts/utils/ReentrancyGuard.sol
```

**개발 환경**: Hardhat 또는 Foundry (Foundry 권장 — 테스트 속도 및 Solidity 네이티브 테스트)

---

## 3. Enums

```solidity
enum RoundStatus {
    Open,       // 0: 티켓 판매 중
    Closing,    // 1: 판매 종료, 미래 블록 대기 중
    Drawing,    // 2: 당첨자 선정 가능 (미래 블록 도달)
    Completed,  // 3: 상금 분배 완료
    Cancelled   // 4: 라운드 취소 (참여자 < 최소인원 등)
}
```

---

## 4. Structs

```solidity
struct Round {
    uint256 roundId;
    RoundStatus status;
    uint256 startBlock;          // 라운드 시작 블록
    uint256 endTimestamp;        // 티켓 판매 마감 시각 (block.timestamp 기준)
    uint256 drawBlock;           // 난수 생성에 사용할 미래 블록 번호
    uint256 ticketPrice;         // 티켓 가격 (wei 단위, META native)
    uint256 totalPool;           // 누적 풀 금액
    uint256 ticketCount;         // 발행된 티켓 수
    address winner;              // 당첨자 주소 (추첨 전: address(0))
    uint256 winnerPrize;         // 당첨 금액
    uint256 seed;                // 누적 엔트로피 시드 (구매자 해시 믹싱)
}

struct Ticket {
    uint256 roundId;
    address buyer;
    uint256 purchaseBlock;       // 구매 시점 블록 (엔트로피 기여)
}
```

---

## 5. State Variables

```solidity
// ── 라운드 관리 ──
uint256 public currentRoundId;
mapping(uint256 => Round) public rounds;                    // roundId => Round
mapping(uint256 => Ticket[]) public roundTickets;           // roundId => Ticket[]
mapping(uint256 => mapping(address => uint256[])) public userTicketIndices;
                                                            // roundId => user => ticket indices

// ── 설정값 (Owner 변경 가능) ──
uint256 public ticketPrice;          // 기본값: 100 META (100 * 1e18 wei)
uint256 public roundDuration;        // 기본값: 21600 (6시간, 초 단위 — 하루 4라운드)
uint256 public drawDelay;            // 기본값: 10 (미래 블록 수)
uint256 public minTicketsPerRound;   // 기본값: 2 (최소 참여 티켓)

// ── 분배 비율 (basis points, 10000 = 100%) ──
uint256 public constant WINNER_SHARE = 9000;     // 90%
uint256 public constant COMMUNITY_SHARE = 500;   // 5%
uint256 public constant OPERATION_SHARE = 500;   // 5%
uint256 public constant BASIS_POINTS = 10000;

// ── 수혜 주소 ──
address public communityFund;        // 커뮤니티 펀드 (멀티시그)
address public operationFund;        // 운영 지갑

// ── 통계 ──
uint256 public totalDistributed;     // 누적 분배 금액
uint256 public totalRoundsCompleted; // 완료된 라운드 수
```

---

## 6. Events

```solidity
event RoundStarted(
    uint256 indexed roundId,
    uint256 startBlock,
    uint256 endTimestamp,
    uint256 ticketPrice
);

event TicketPurchased(
    uint256 indexed roundId,
    address indexed buyer,
    uint256 ticketCount,
    uint256 totalCost
);

event RoundClosing(
    uint256 indexed roundId,
    uint256 drawBlock,
    uint256 totalPool,
    uint256 totalTickets
);

event WinnerDrawn(
    uint256 indexed roundId,
    address indexed winner,
    uint256 winnerPrize,
    uint256 communityAmount,
    uint256 operationAmount
);

event RoundCancelled(
    uint256 indexed roundId,
    uint256 refundableAmount,
    uint256 ticketCount
);

event RefundClaimed(
    uint256 indexed roundId,
    address indexed buyer,
    uint256 amount
);

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

---

## 7. Functions

### 7.1 Round Lifecycle

#### `startNewRound()`
```
Visibility: internal
Modifier: -
Trigger: 컨트랙트 초기화 시, 또는 이전 라운드 완료/취소 후 자동 호출
```
- `currentRoundId` 증가
- `Round` 생성: `status = Open`, `endTimestamp = block.timestamp + roundDuration`
- `seed` 초기값: `keccak256(abi.encodePacked(block.number, block.timestamp, currentRoundId))`
- Emit `RoundStarted`

#### `buyTickets(uint256 _count)`
```
Visibility: external payable
Modifier: whenNotPaused, nonReentrant
```
- **Require**: `_count >= 1 && _count <= 100` (가스 리밋 방지)
- **Require**: `msg.value == ticketPrice * _count`
- **Require**: `rounds[currentRoundId].status == Open`
- **Require**: `block.timestamp < rounds[currentRoundId].endTimestamp`
- 각 티켓에 대해 `Ticket` 생성, `roundTickets[currentRoundId]`에 push
- `userTicketIndices` 업데이트
- `totalPool += msg.value`
- `ticketCount += _count`
- **엔트로피 믹싱**: `seed = keccak256(abi.encodePacked(seed, msg.sender, block.number, _count))`
- Emit `TicketPurchased`

#### `closeRound()`
```
Visibility: external
Modifier: whenNotPaused
Caller: Anyone (permissionless — 시간 조건 충족 시 누구나 호출 가능)
```
- **Require**: `rounds[currentRoundId].status == Open`
- **Require**: `block.timestamp >= rounds[currentRoundId].endTimestamp`
- **If** `ticketCount < minTicketsPerRound`:
  - `status = Cancelled` → 환불 활성화
  - Emit `RoundCancelled`
  - `startNewRound()` 호출
  - return
- `status = Closing`
- `drawBlock = block.number + drawDelay`
- Emit `RoundClosing`

#### `drawWinner()`
```
Visibility: external
Modifier: whenNotPaused, nonReentrant
Caller: Anyone (permissionless — 블록 조건 충족 시 누구나 호출 가능)
```
- **Require**: `rounds[currentRoundId].status == Closing`
- **Require**: `block.number > rounds[currentRoundId].drawBlock`
- **Require**: `block.number <= rounds[currentRoundId].drawBlock + 256` (blockhash 유효 범위)
- **난수 생성**:
  ```solidity
  bytes32 blockHash1 = blockhash(drawBlock);
  bytes32 blockHash2 = blockhash(drawBlock + 1);
  bytes32 blockHash3 = blockhash(drawBlock + 2);

  // blockhash가 0이면 (256블록 초과) revert
  require(blockHash1 != bytes32(0), "Draw expired, restart required");

  uint256 randomness = uint256(keccak256(abi.encodePacked(
      blockHash1,
      blockHash2,
      blockHash3,
      rounds[currentRoundId].seed
  )));

  uint256 winnerIndex = randomness % rounds[currentRoundId].ticketCount;
  ```
- `winner = roundTickets[currentRoundId][winnerIndex].buyer`
- **상금 분배**:
  ```solidity
  uint256 pool = rounds[currentRoundId].totalPool;
  uint256 winnerPrize = (pool * WINNER_SHARE) / BASIS_POINTS;
  uint256 communityAmount = (pool * COMMUNITY_SHARE) / BASIS_POINTS;
  uint256 operationAmount = pool - winnerPrize - communityAmount; // 잔여분 처리 (반올림 오차 방지)
  ```
- `winner.call{value: winnerPrize}` → 실패 시 클레임 매핑에 저장 (pull pattern)
- `communityFund.call{value: communityAmount}`
- `operationFund.call{value: operationAmount}`
- `status = Completed`
- 통계 업데이트
- Emit `WinnerDrawn`
- `startNewRound()` 호출

#### `forceCloseDraw()`
```
Visibility: external
Modifier: onlyOwner
```
- 256블록 이내에 `drawWinner()`가 호출되지 못한 경우를 위한 복구 함수
- 새로운 `drawBlock`을 재설정하여 다시 추첨 시도 가능
- **Require**: `status == Closing`
- **Require**: `block.number > drawBlock + 256`
- `drawBlock = block.number + drawDelay`

### 7.2 Refund (취소 라운드)

#### `claimRefund(uint256 _roundId)`
```
Visibility: external
Modifier: nonReentrant
```
- **Require**: `rounds[_roundId].status == Cancelled`
- **Require**: `userTicketIndices[_roundId][msg.sender].length > 0`
- 환불 금액 = `userTicketIndices[_roundId][msg.sender].length * rounds[_roundId].ticketPrice`
- `userTicketIndices[_roundId][msg.sender]` 삭제 (재진입 방지)
- `msg.sender.call{value: refundAmount}`
- Emit `RefundClaimed`

### 7.3 Admin Functions

```solidity
function setTicketPrice(uint256 _newPrice) external onlyOwner
// Require: _newPrice >= 100 ether (최소 100 META)
// 다음 라운드부터 적용

function setRoundDuration(uint256 _newDuration) external onlyOwner
// Require: _newDuration >= 3600 (최소 1시간)
// 다음 라운드부터 적용

function setDrawDelay(uint256 _newDelay) external onlyOwner
// Require: _newDelay >= 5 && _newDelay <= 200
// 다음 라운드부터 적용

function setMinTickets(uint256 _newMin) external onlyOwner
// Require: _newMin >= 2

function setCommunityFund(address _newFund) external onlyOwner
// Require: _newFund != address(0)

function setOperationFund(address _newFund) external onlyOwner
// Require: _newFund != address(0)

function pause() external onlyOwner
function unpause() external onlyOwner
```

모든 setter는 `ConfigUpdated` 또는 `FundAddressUpdated` 이벤트를 emit한다.

### 7.4 View Functions

```solidity
function getCurrentRound() external view returns (Round memory)
// 현재 라운드 전체 정보 반환

function getRound(uint256 _roundId) external view returns (Round memory)
// 특정 라운드 정보 반환

function getMyTickets(uint256 _roundId) external view returns (uint256 count)
// msg.sender의 해당 라운드 티켓 수

function getRoundTicketCount(uint256 _roundId) external view returns (uint256)
// 라운드 전체 티켓 수

function getTicketBuyer(uint256 _roundId, uint256 _ticketIndex) external view returns (address)
// 특정 티켓의 구매자 주소

function getWinnerHistory(uint256 _fromRound, uint256 _toRound)
    external view returns (address[] memory winners, uint256[] memory prizes)
// 범위 내 당첨자 목록

function getTimeRemaining() external view returns (uint256)
// 현재 라운드 남은 시간 (초)

function getDrawBlockRemaining() external view returns (uint256)
// 추첨까지 남은 블록 수 (Closing 상태일 때)
```

---

## 8. State Machine

```
                    ┌──────────────┐
         deploy()   │              │
        ──────────→ │    Open      │ ← startNewRound()
                    │              │
                    └──────┬───────┘
                           │ closeRound()
                           │ (endTimestamp 도달)
                           │
               ┌───────────┼───────────┐
               │                       │
               ▼                       ▼
    ┌──────────────┐        ┌──────────────┐
    │   Closing    │        │  Cancelled   │
    │ (drawBlock   │        │ (tickets <   │
    │  대기 중)     │        │  minTickets) │
    └──────┬───────┘        └──────────────┘
           │ drawWinner()          │
           │ (drawBlock 도달)       │ claimRefund()
           ▼                       ▼
    ┌──────────────┐        [유저별 환불 처리]
    │  Completed   │
    │ (상금 분배)   │
    └──────┬───────┘
           │
           ▼
    [startNewRound() → Open]
```

---

## 9. Randomness Mechanism (Detail)

### 난수 생성 흐름

```
1. 티켓 구매 시마다 seed 누적:
   seed = keccak256(seed, msg.sender, block.number, ticketCount)

2. closeRound() 호출:
   drawBlock = block.number + drawDelay (기본 10블록)

3. drawWinner() 호출 (drawBlock 이후):
   randomness = keccak256(
       blockhash(drawBlock),
       blockhash(drawBlock + 1),
       blockhash(drawBlock + 2),
       seed                          // 참여자 누적 엔트로피
   )
   winnerIndex = randomness % ticketCount
```

### 보안 분석

| Attack Vector | Mitigation |
|---------------|------------|
| Validator가 drawBlock 해시 조작 | 3개 블록 해시 조합 + 누적 seed → 3개 연속 블록 모두 조작해야 함 |
| 마지막 구매자가 seed 조작 | seed는 누적 XOR이므로 이전 참여자 데이터도 포함 |
| drawWinner() 호출 타이밍 조작 | drawBlock이 고정되어 있어 호출 시점 무관 |
| 256블록 초과로 blockhash 소실 | forceCloseDraw()로 drawBlock 재설정 |

### blockhash 유효 범위 주의사항

Solidity의 `blockhash()`는 최근 256블록만 반환한다. 그 이상이면 `bytes32(0)`을 반환하므로:
- `drawWinner()`에서 `blockhash != bytes32(0)` 체크 필수
- 호출 인센티브: 첫 drawWinner() 호출자에게 소량의 보상을 줄 수 있음 (P1)

---

## 10. Error Handling

```solidity
// Custom Errors (가스 효율)
error RoundNotOpen();
error RoundNotClosing();
error SaleNotEnded();
error DrawBlockNotReached();
error DrawExpired();
error InvalidTicketCount();
error InsufficientPayment();
error NoTicketsToRefund();
error RoundNotCancelled();
error AlreadyRefunded();
error TransferFailed();
error InvalidAddress();
error InvalidParameter();
```

---

## 11. Gas Optimization Notes

- `Ticket` struct에 buyer만 저장 (purchaseBlock은 seed에 이미 믹싱되므로 생략 가능 → 가스 절약)
- 대안: `address[]`로 단순화하여 티켓 배열을 주소 배열로 관리
  ```solidity
  mapping(uint256 => address[]) public roundTickets; // roundId => buyer addresses
  ```
  이 경우 1티켓 = 1 address push, struct보다 가스 효율적
- `buyTickets()`에서 복수 구매 시 loop 대신 단일 push 반복 (100장 제한으로 가스 안전)
- 상금 전송 실패 시 pull pattern으로 전환 (pendingWithdrawals mapping)

---

## 12. Pull Pattern (송금 실패 대비)

```solidity
mapping(address => uint256) public pendingWithdrawals;

function withdrawPending() external nonReentrant {
    uint256 amount = pendingWithdrawals[msg.sender];
    require(amount > 0, "No pending withdrawal");
    pendingWithdrawals[msg.sender] = 0;
    (bool success, ) = msg.sender.call{value: amount}("");
    require(success, "Transfer failed");
}
```

`drawWinner()`에서 `winner.call{value: winnerPrize}`가 실패하면:
```solidity
(bool sent, ) = winner.call{value: winnerPrize}("");
if (!sent) {
    pendingWithdrawals[winner] += winnerPrize;
}
```

---

## 13. Constructor

```solidity
constructor(
    address _communityFund,
    address _operationFund,
    uint256 _ticketPrice,      // 기본값: 100e18 (100 META)
    uint256 _roundDuration,    // 기본값: 21600 (6시간)
    uint256 _drawDelay,        // 기본값: 10 (블록)
    uint256 _minTickets        // 기본값: 2
) Ownable(msg.sender) {
    require(_communityFund != address(0), InvalidAddress());
    require(_operationFund != address(0), InvalidAddress());
    require(_ticketPrice >= 100 ether, InvalidParameter());
    require(_roundDuration >= 3600, InvalidParameter());
    require(_drawDelay >= 5 && _drawDelay <= 200, InvalidParameter());
    require(_minTickets >= 2, InvalidParameter());

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

---

## 14. Deployment Configuration

### Metadium Testnet

```
Chain ID: 12 (Metadium Testnet)
RPC: https://api.metadium.com/dev
Explorer: https://testnetexplorer.metadium.com
```

### Metadium Mainnet

```
Chain ID: 11 (Metadium Mainnet)
RPC: https://api.metadium.com/prod
Explorer: https://explorer.metadium.com
```

### 배포 파라미터 (Testnet)

```
ticketPrice:    100000000000000000000  (100 META)
roundDuration:  3600                  (1시간 — 테스트 빠르게)
drawDelay:      5                     (5블록)
minTickets:     2
communityFund:  [멀티시그 주소 TBD]
operationFund:  [운영 지갑 주소 TBD]
```

### 배포 파라미터 (Mainnet)

```
ticketPrice:    100000000000000000000  (100 META)
roundDuration:  21600                 (6시간 — 하루 4라운드)
drawDelay:      10                    (10블록)
minTickets:     2
communityFund:  [멀티시그 주소 TBD]
operationFund:  [운영 지갑 주소 TBD]
```

---

## 15. Test Scenarios

### Unit Tests

| # | Test | Expected |
|---|------|----------|
| T1 | 티켓 가격보다 적은 META로 buyTickets() | Revert: InsufficientPayment |
| T2 | 라운드 종료 후 buyTickets() | Revert: RoundNotOpen |
| T3 | endTimestamp 전에 closeRound() | Revert: SaleNotEnded |
| T4 | drawBlock 도달 전 drawWinner() | Revert: DrawBlockNotReached |
| T5 | 256블록 경과 후 drawWinner() | Revert: DrawExpired |
| T6 | 101장 이상 buyTickets() | Revert: InvalidTicketCount |
| T7 | 취소된 라운드 환불 요청 | 성공: 정확한 금액 환불 |
| T8 | 이미 환불받은 유저 재환불 | Revert: AlreadyRefunded |
| T9 | minTickets 미달 시 closeRound() | 라운드 취소 + 새 라운드 시작 |
| T10 | Pause 상태에서 buyTickets() | Revert |

### Integration Tests

| # | Test | Expected |
|---|------|----------|
| T11 | 전체 라운드 흐름 (Open → Closing → Completed → 새 라운드) | 상금 정확 분배, 새 라운드 Open |
| T12 | 상금 분배 비율 검증 (90/5/5) | wei 단위 정확한 분배 |
| T13 | 여러 라운드 연속 실행 | 각 라운드 독립 동작, 상태 초기화 |
| T14 | 다수 유저 동시 구매 시뮬레이션 | 모든 티켓 정상 기록 |
| T15 | winner.call 실패 시 pendingWithdrawals 작동 | pull pattern으로 전환 |

### Randomness Tests

| # | Test | Expected |
|---|------|----------|
| T16 | 동일 조건에서 다른 참여자 → 다른 결과 | seed 차이로 결과 상이 |
| T17 | 3개 블록 해시 중 하나가 0 | drawBlock+1, +2 중 유효한 것만 사용 또는 revert |
| T18 | 당첨자 분포 (1000회 시뮬레이션) | 통계적으로 균등 분포 |

---

## 16. Security Checklist

- [ ] Reentrancy: ReentrancyGuard 적용 (buyTickets, drawWinner, claimRefund, withdrawPending)
- [ ] Integer Overflow: Solidity 0.8.x 기본 체크
- [ ] Pull over Push: 상금 전송 실패 시 pendingWithdrawals로 전환
- [ ] Access Control: Admin 함수 onlyOwner
- [ ] Pausable: 긴급 중단 기능
- [ ] blockhash 유효 범위: 256블록 체크 + forceCloseDraw 복구
- [ ] Front-running: drawBlock 고정으로 호출 시점 무관
- [ ] DOS: 100티켓 제한으로 가스 폭발 방지
- [ ] 잔액 불일치: 모든 자금은 round.totalPool에서 관리, 외부 입금 불가

---

## 17. Frontend Integration Notes (ABI 핵심)

프론트엔드에서 주로 호출할 함수와 구독할 이벤트:

### 읽기 (View)
```
getCurrentRound() → 현재 라운드 표시
getMyTickets(roundId) → 내 티켓 수 표시
getTimeRemaining() → 카운트다운
getWinnerHistory(from, to) → 결과 히스토리
```

### 쓰기 (Transaction)
```
buyTickets(count) {value: ticketPrice * count} → 티켓 구매
closeRound() → 라운드 마감 트리거 (누구나 가능)
drawWinner() → 추첨 트리거 (누구나 가능)
claimRefund(roundId) → 환불 (취소 라운드)
withdrawPending() → 미수령 상금 인출
```

### 이벤트 구독
```
RoundStarted → 새 라운드 시작 알림
TicketPurchased → 실시간 참여 현황
WinnerDrawn → 당첨 결과
RoundCancelled → 라운드 취소 + 환불 안내
```

---

## 18. IRandomnessProvider Interface (v2 준비)

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IRandomnessProvider {
    /// @notice 난수 요청
    /// @param roundId 라운드 ID
    /// @return requestId 요청 식별자
    function requestRandomness(uint256 roundId) external returns (uint256 requestId);

    /// @notice 난수 사용 가능 여부
    /// @param roundId 라운드 ID
    /// @return ready 사용 가능 여부
    function isRandomnessReady(uint256 roundId) external view returns (bool ready);

    /// @notice 난수 조회
    /// @param roundId 라운드 ID
    /// @return randomness 난수 값
    function getRandomness(uint256 roundId) external view returns (uint256 randomness);
}
```

v1에서는 이 인터페이스를 구현하는 `BlockhashRandomness` 내부 로직을 사용하고, v2에서 `ChainlinkVRFRandomness` 등으로 교체 가능하도록 설계한다.

---

*이 스펙을 기반으로 Claude Code에서 스마트 컨트랙트를 구현할 수 있습니다.*
