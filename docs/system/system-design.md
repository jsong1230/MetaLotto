# MetaLotto 시스템 설계서

## 1. 시스템 개요

- **아키텍처 패턴**: 단일 스마트 컨트랙트 + DApp 프론트엔드 (2-Tier)
- **배포 전략**: Metadium Mainnet 단일 체인 배포
- **목적**: 메타디움 블록체인 기반 투명한 복권 DApp — META 토큰으로 티켓 구매, 온체인 추첨, 자동 상금 지급

### 핵심 가치
- 온체인 추첨으로 100% 투명성 보장
- META 토큰 실사용 처 증대
- 커뮤니티 펀드를 통한 자생적 생태계 투자 재원 확보
- 낮은 진입 장벽 (기존 지갑 사용, 낮은 가스비)

---

## 2. 시스템 아키텍처 다이어그램

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              USER LAYER                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │   Browser   │  │   Browser   │  │   Browser   │  │   Browser   │    │
│  │  (Desktop)  │  │  (Mobile)   │  │  (Desktop)  │  │  (Mobile)   │    │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘    │
└─────────┼────────────────┼────────────────┼────────────────┼───────────┘
          │                │                │                │
          └────────────────┴────────────────┴────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           FRONTEND LAYER                                 │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                    Next.js 15 (App Router)                         │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌──────────┐  │  │
│  │  │   Pages     │  │ Components  │  │   Hooks     │  │  Stores  │  │  │
│  │  │  /app/*     │  │  /comp/*    │  │  /hooks/*   │  │ Zustand  │  │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └──────────┘  │  │
│  │  ┌─────────────────────────────────────────────────────────────┐  │  │
│  │  │              wagmi + viem (Web3 Client)                      │  │  │
│  │  │  - Wallet Connection (MetaMask, WalletConnect)               │  │  │
│  │  │  - Contract Read/Write                                       │  │  │
│  │  │  - Event Subscriptions                                       │  │  │
│  │  └─────────────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ JSON-RPC (HTTPS/WSS)
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         BLOCKCHAIN LAYER                                 │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                     Metadium Mainnet                               │  │
│  │                      Chain ID: 11                                  │  │
│  │  ┌─────────────────────────────────────────────────────────────┐  │  │
│  │  │                    MetaLotto.sol                              │  │  │
│  │  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │  │  │
│  │  │  │    Round     │  │    Ticket    │  │   Randomness │       │  │  │
│  │  │  │  Management  │  │  Management  │  │   Provider   │       │  │  │
│  │  │  └──────────────┘  └──────────────┘  └──────────────┘       │  │  │
│  │  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │  │  │
│  │  │  │    Prize     │  │    Admin     │  │    Views     │       │  │  │
│  │  │  │ Distribution │  │   /Config    │  │   /Getters   │       │  │  │
│  │  │  └──────────────┘  └──────────────┘  └──────────────┘       │  │  │
│  │  └─────────────────────────────────────────────────────────────┘  │  │
│  │  inherits: Ownable, Pausable, ReentrancyGuard                      │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                       META Token (Native)                          │  │
│  │              msg.value로 티켓 구매 및 상금 지급                      │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

### 데이터 흐름

```
[Ticket Purchase Flow]
┌────────┐    1. connect()    ┌─────────┐    2. sign tx     ┌──────────┐
│  User  │ ─────────────────→ │ DApp UI │ ────────────────→ │ MetaMask │
└────────┘                    └─────────┘                   └────┬─────┘
                                                                  │
                                    3. buyTickets(count) {value}  │
                                                                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           MetaLotto.sol                                  │
│  4. Validate (status, payment, count)                                    │
│  5. Store tickets, update pool, mix seed                                 │
│  6. Emit TicketPurchased event                                           │
└──────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ 7. Event emitted
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         Blockchain Network                               │
│  8. Transaction confirmed                                                │
│  9. State updated on-chain                                               │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 3. 컴포넌트 구성

### 3.1 Smart Contract (contracts/)

| 컴포넌트 | 설명 | 주요 함수 |
|----------|------|-----------|
| Round Management | 라운드 생성/종료/상태 관리 | `startNewRound()`, `closeRound()`, `forceCloseDraw()` |
| Ticket Management | 티켓 발행/조회 | `buyTickets()`, `getMyTickets()`, `getRoundTicketCount()` |
| Randomness | 난수 생성 (blockhash 기반) | `drawWinner()` 내부 로직 |
| Prize Distribution | 상금 분배 (90/5/5) | `distributePrize()` (내부), `withdrawPending()` |
| Admin/Config | 설정값 변경, 일시정지 | `setTicketPrice()`, `pause()`, `unpause()` |
| Views/Getters | 상태 조회 | `getCurrentRound()`, `getWinnerHistory()`, `getTimeRemaining()` |

### 3.2 Frontend (frontend/)

| 컴포넌트 | 설명 | 기술 |
|----------|------|------|
| Wallet Provider | 지갑 연결 관리 | wagmi + viem |
| Contract Hooks | 컨트랙트 읽기/쓰기 | wagmi hooks (useContractRead, useContractWrite) |
| Event Subscriptions | 실시간 이벤트 구독 | viem watchContractEvent |
| State Management | 클라이언트 상태 | Zustand |
| UI Components | 티켓 구매, 라운드 현황 등 | React + Tailwind CSS |

---

## 4. 컨트랙트 구조

### 4.1 Enums

```solidity
enum RoundStatus {
    Open,       // 0: 티켓 판매 중
    Closing,    // 1: 판매 종료, 미래 블록 대기 중
    Drawing,    // 2: 당첨자 선정 가능 (미래 블록 도달)
    Completed,  // 3: 상금 분배 완료
    Cancelled   // 4: 라운드 취소 (참여자 < 최소인원 등)
}
```

### 4.2 Structs

```solidity
struct Round {
    uint256 roundId;
    RoundStatus status;
    uint256 startBlock;          // 라운드 시작 블록
    uint256 endTimestamp;        // 티켓 판매 마감 시각
    uint256 drawBlock;           // 난수 생성에 사용할 미래 블록
    uint256 ticketPrice;         // 티켓 가격 (wei)
    uint256 totalPool;           // 누적 풀 금액
    uint256 ticketCount;         // 발행된 티켓 수
    address winner;              // 당첨자 주소
    uint256 winnerPrize;         // 당첨 금액
    uint256 seed;                // 누적 엔트로피 시드
}

struct Ticket {
    uint256 roundId;
    address buyer;
    uint256 purchaseBlock;       // 구매 시점 블록
}
```

### 4.3 State Variables

| 변수 | 타입 | 설명 | 기본값 |
|------|------|------|--------|
| `currentRoundId` | `uint256` | 현재 라운드 ID | 자동 증가 |
| `rounds` | `mapping(uint256 => Round)` | 라운드 정보 | - |
| `roundTickets` | `mapping(uint256 => Ticket[])` | 라운드별 티켓 배열 | - |
| `userTicketIndices` | `mapping(uint256 => mapping(address => uint256[]))` | 사용자별 티켓 인덱스 | - |
| `ticketPrice` | `uint256` | 티켓 가격 (wei) | 100 * 1e18 |
| `roundDuration` | `uint256` | 라운드 기간 (초) | 21600 (6시간) |
| `drawDelay` | `uint256` | 추첨 지연 블록 수 | 10 |
| `minTicketsPerRound` | `uint256` | 최소 티켓 수 | 2 |
| `communityFund` | `address` | 커뮤니티 펀드 주소 | TBD |
| `operationFund` | `address` | 운영 지갑 주소 | TBD |
| `pendingWithdrawals` | `mapping(address => uint256)` | 미수령 상금 | - |

### 4.4 Constants (분배 비율)

```solidity
uint256 public constant WINNER_SHARE = 9000;     // 90%
uint256 public constant COMMUNITY_SHARE = 500;   // 5%
uint256 public constant OPERATION_SHARE = 500;   // 5%
uint256 public constant BASIS_POINTS = 10000;    // 100%
```

### 4.5 Functions

#### Core Functions (External/Public)

| 함수 | Visibility | Modifier | 설명 |
|------|------------|----------|------|
| `buyTickets(uint256 _count)` | `external payable` | `whenNotPaused, nonReentrant` | 티켓 구매 (1~100장) |
| `closeRound()` | `external` | `whenNotPaused` | 라운드 마감 트리거 |
| `drawWinner()` | `external` | `whenNotPaused, nonReentrant` | 당첨자 추첨 및 상금 분배 |
| `forceCloseDraw()` | `external` | `onlyOwner` | 256블록 초과 시 복구 |
| `claimRefund(uint256 _roundId)` | `external` | `nonReentrant` | 취소 라운드 환불 |
| `withdrawPending()` | `external` | `nonReentrant` | 미수령 상금 인출 |

#### Admin Functions

| 함수 | 설명 |
|------|------|
| `setTicketPrice(uint256)` | 티켓 가격 변경 |
| `setRoundDuration(uint256)` | 라운드 기간 변경 |
| `setDrawDelay(uint256)` | 추첨 지연 블록 수 변경 |
| `setMinTickets(uint256)` | 최소 티켓 수 변경 |
| `setCommunityFund(address)` | 커뮤니티 펀드 주소 변경 |
| `setOperationFund(address)` | 운영 지갑 주소 변경 |
| `pause()` | 컨트랙트 일시 정지 |
| `unpause()` | 컨트랙트 재개 |

#### View Functions

| 함수 | Returns | 설명 |
|------|---------|------|
| `getCurrentRound()` | `Round` | 현재 라운드 정보 |
| `getRound(uint256)` | `Round` | 특정 라운드 정보 |
| `getMyTickets(uint256)` | `uint256` | 내 티켓 수 |
| `getRoundTicketCount(uint256)` | `uint256` | 라운드 전체 티켓 수 |
| `getTicketBuyer(uint256, uint256)` | `address` | 특정 티켓 구매자 |
| `getWinnerHistory(uint256, uint256)` | `(address[], uint256[])` | 당첨자 목록 |
| `getTimeRemaining()` | `uint256` | 남은 시간 (초) |
| `getDrawBlockRemaining()` | `uint256` | 추첨까지 남은 블록 수 |

### 4.6 Events

```solidity
event RoundStarted(uint256 indexed roundId, uint256 startBlock, uint256 endTimestamp, uint256 ticketPrice);
event TicketPurchased(uint256 indexed roundId, address indexed buyer, uint256 ticketCount, uint256 totalCost);
event RoundClosing(uint256 indexed roundId, uint256 drawBlock, uint256 totalPool, uint256 totalTickets);
event WinnerDrawn(uint256 indexed roundId, address indexed winner, uint256 winnerPrize, uint256 communityAmount, uint256 operationAmount);
event RoundCancelled(uint256 indexed roundId, uint256 refundableAmount, uint256 ticketCount);
event RefundClaimed(uint256 indexed roundId, address indexed buyer, uint256 amount);
event ConfigUpdated(string parameter, uint256 oldValue, uint256 newValue);
event FundAddressUpdated(string fundType, address oldAddress, address newAddress);
```

### 4.7 Custom Errors

```solidity
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

## 5. 라운드 상태 머신 흐름

### 5.1 State Diagram

```
                    ┌─────────────────────────────────────────┐
                    │              DEPLOY                      │
                    │         (constructor 실행)               │
                    └──────────────────┬──────────────────────┘
                                       │
                                       │ _startNewRound()
                                       ▼
                    ┌─────────────────────────────────────────┐
                    │                                          │
       ┌───────────►│                 OPEN                     │◄───────────┐
       │            │    (티켓 판매 중, endTimestamp 대기)      │            │
       │            │                                          │            │
       │            │  buyTickets() ✓                          │            │
       │            │  closeRound() ✗ (endTimestamp 전)         │            │
       │            │                                          │            │
       │            └──────────────────┬──────────────────────┘            │
       │                               │                                   │
       │                               │ closeRound()                      │
       │                               │ (endTimestamp 도달)               │
       │                               │                                   │
       │            ┌──────────────────┴──────────────────┐                │
       │            │                                     │                │
       │            │ ticketCount >= minTickets           │ ticketCount < minTickets
       │            ▼                                     ▼                │
       │   ┌────────────────┐                  ┌────────────────┐          │
       │   │    CLOSING     │                  │   CANCELLED    │          │
       │   │ (drawBlock     │                  │ (환불 활성화)   │          │
       │   │  대기 중)       │                  │                │          │
       │   └────────┬───────┘                  └────────┬───────┘          │
       │            │                                   │                  │
       │            │ drawWinner()                      │ claimRefund()    │
       │            │ (block.number > drawBlock)        │ (개별 환불)       │
       │            │                                   │                  │
       │            ▼                                   └────────┬─────────┘
       │   ┌────────────────┐                                    │
       │   │   COMPLETED    │◄───────────────────────────────────┘
       │   │ (상금 분배 완료) │
       │   │                │
       │   │ winner 선정     │
       │   │ 90/5/5 분배    │
       │   └────────┬───────┘
       │            │
       │            │ _startNewRound() 자동 호출
       │            │
       └────────────┘

       ┌───────────────────────────────────────────────────────────────┐
       │                    EXCEPTION PATH                              │
       │                                                                │
       │  CLOSING ──(256블록 초과)──► forceCloseDraw() ──► CLOSING      │
       │           (blockhash 소실)      (drawBlock 재설정)              │
       │                                                                │
       └───────────────────────────────────────────────────────────────┘
```

### 5.2 State Transitions

| 현재 상태 | 트리거 | 다음 상태 | 조건 |
|-----------|--------|-----------|------|
| - | deploy | Open | 컨트랙트 배포 시 첫 라운드 자동 시작 |
| Open | closeRound() | Closing | `block.timestamp >= endTimestamp` && `ticketCount >= minTickets` |
| Open | closeRound() | Cancelled | `block.timestamp >= endTimestamp` && `ticketCount < minTickets` |
| Closing | drawWinner() | Completed | `block.number > drawBlock` && `block.number <= drawBlock + 256` |
| Closing | forceCloseDraw() | Closing | `block.number > drawBlock + 256` (Owner만) |
| Completed | - | Open | 자동으로 다음 라운드 시작 |
| Cancelled | claimRefund() | Cancelled | 환불 처리 (상태 유지) |

---

## 6. Blockhash 난수 생성 알고리즘

### 6.1 알고리즘 개요

```
1. 티켓 구매 시마다 seed 누적 (엔트로피 수집):
   ┌─────────────────────────────────────────────────────────────────┐
   │  seed = keccak256(                                              │
   │      seed,                    // 이전까지의 누적 엔트로피          │
   │      msg.sender,              // 구매자 주소                     │
   │      block.number,            // 구매 시점 블록                   │
   │      _count                   // 구매 티켓 수                    │
   │  )                                                              │
   └─────────────────────────────────────────────────────────────────┘

2. closeRound() 호출 시 미래 블록 지정:
   ┌─────────────────────────────────────────────────────────────────┐
   │  drawBlock = block.number + drawDelay  // 기본: 현재 + 10블록   │
   └─────────────────────────────────────────────────────────────────┘

3. drawWinner() 호출 시 난수 생성:
   ┌─────────────────────────────────────────────────────────────────┐
   │  randomness = uint256(keccak256(                                │
   │      blockhash(drawBlock),      // 미래 블록 해시 1              │
   │      blockhash(drawBlock + 1),  // 미래 블록 해시 2              │
   │      blockhash(drawBlock + 2),  // 미래 블록 해시 3              │
   │      seed                       // 참여자 누적 엔트로피           │
   │  ))                                                             │
   │                                                                 │
   │  winnerIndex = randomness % ticketCount                         │
   │  winner = roundTickets[roundId][winnerIndex].buyer              │
   └─────────────────────────────────────────────────────────────────┘
```

### 6.2 보안 분석

| 공격 벡터 | 완화 방안 |
|-----------|-----------|
| Validator가 drawBlock 해시 조작 | 3개 블록 해시 조합 + 누적 seed → 3개 연속 블록 모두 조작해야 함 |
| 마지막 구매자가 seed 조작 | seed는 누적 방식이므로 이전 참여자 데이터도 포함됨 |
| drawWinner() 호출 타이밍 조작 | drawBlock이 고정되어 있어 호출 시점 무관 |
| 256블록 초과로 blockhash 소실 | forceCloseDraw()로 drawBlock 재설정 가능 |
| Front-running (당첨 예측 후 구매) | drawBlock은 closeRound() 이후에 확정되므로 구매 시점엔 알 수 없음 |

### 6.3 blockhash 유효 범위 처리

```solidity
// Solidity blockhash() 제약: 최근 256블록만 조회 가능
// 초과 시 bytes32(0) 반환

function drawWinner() external {
    Round storage round = rounds[currentRoundId];

    // 유효성 검사
    require(round.status == RoundStatus.Closing, RoundNotClosing());
    require(block.number > round.drawBlock, DrawBlockNotReached());
    require(block.number <= round.drawBlock + 256, DrawExpired());

    bytes32 blockHash1 = blockhash(round.drawBlock);
    require(blockHash1 != bytes32(0), DrawExpired());

    // 난수 생성...
}
```

### 6.4 복구 메커니즘 (forceCloseDraw)

```solidity
function forceCloseDraw() external onlyOwner {
    Round storage round = rounds[currentRoundId];

    require(round.status == RoundStatus.Closing, RoundNotClosing());
    require(block.number > round.drawBlock + 256, DrawBlockNotReached());

    // 새로운 drawBlock 설정
    round.drawBlock = block.number + drawDelay;

    emit ConfigUpdated("drawBlock", round.drawBlock - drawDelay, round.drawBlock);
}
```

---

## 7. 보안 설계

### 7.1 ReentrancyGuard

```solidity
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract MetaLotto is Ownable, Pausable, ReentrancyGuard {

    // external payable 함수에 적용
    function buyTickets(uint256 _count)
        external
        payable
        whenNotPaused
        nonReentrant  // ← 재진입 방지
    {
        // ...
    }

    function drawWinner()
        external
        whenNotPaused
        nonReentrant  // ← 재진입 방지
    {
        // ...
    }

    function claimRefund(uint256 _roundId)
        external
        nonReentrant  // ← 재진입 방지
    {
        // ...
    }
}
```

### 7.2 Pull Pattern (송금 실패 대비)

```solidity
// 미수령 상금 매핑
mapping(address => uint256) public pendingWithdrawals;

function drawWinner() external nonReentrant {
    // ... 당첨자 선정 로직 ...

    uint256 winnerPrize = (pool * WINNER_SHARE) / BASIS_POINTS;

    // Pull Pattern: 전송 실패 시 pendingWithdrawals에 저장
    (bool sent, ) = winner.call{value: winnerPrize}("");
    if (!sent) {
        pendingWithdrawals[winner] += winnerPrize;
    }

    // 커뮤니티/운영 펀드는 신뢰할 수 있는 주소이므로 직접 전송
    (bool communitySent, ) = communityFund.call{value: communityAmount}("");
    require(communitySent, TransferFailed());

    (bool operationSent, ) = operationFund.call{value: operationAmount}("");
    require(operationSent, TransferFailed());
}

// 사용자가 직접 호출하여 미수령 상금 인출
function withdrawPending() external nonReentrant {
    uint256 amount = pendingWithdrawals[msg.sender];
    require(amount > 0, NoTicketsToRefund());

    pendingWithdrawals[msg.sender] = 0;  // CEI 패턴: 상태 변경 먼저

    (bool success, ) = msg.sender.call{value: amount}("");
    require(success, TransferFailed());
}
```

### 7.3 Pausable

```solidity
import "@openzeppelin/contracts/utils/Pausable.sol";

contract MetaLotto is Ownable, Pausable, ReentrancyGuard {

    // 긴급 상황 시 Owner가 호출
    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    // whenNotPaused modifier 적용
    function buyTickets(uint256 _count)
        external
        payable
        whenNotPaused  // ← 일시정지 시 revert
        nonReentrant
    {
        // ...
    }

    function closeRound() external whenNotPaused {
        // ...
    }

    function drawWinner() external whenNotPaused nonReentrant {
        // ...
    }

    // View 함수는 pause 상태에서도 호출 가능
    function getCurrentRound() external view returns (Round memory) {
        // ...
    }
}
```

### 7.4 Checks-Effects-Interactions (CEI) 패턴

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

### 7.5 Security Checklist

| 항목 | 적용 여부 | 설명 |
|------|-----------|------|
| ReentrancyGuard | 적용 | buyTickets, drawWinner, claimRefund, withdrawPending |
| Integer Overflow | N/A | Solidity 0.8.x 기본 체크 |
| Pull Pattern | 적용 | 상금 전송 실패 시 pendingWithdrawals |
| Access Control | 적용 | Admin 함수 onlyOwner |
| Pausable | 적용 | 긴급 중단 기능 |
| blockhash 유효 범위 | 적용 | 256블록 체크 + forceCloseDraw 복구 |
| Front-running 방지 | 적용 | drawBlock 고정으로 호출 시점 무관 |
| DOS 방지 | 적용 | 100티켓 제한으로 가스 폭발 방지 |
| 잔액 불일치 방지 | 적용 | 모든 자금은 round.totalPool에서 관리 |

---

## 8. 프론트엔드 아키텍처

### 8.1 기술 스택

| 기술 | 버전 | 용도 |
|------|------|------|
| Next.js | 15.x | React 프레임워크 (App Router) |
| TypeScript | 5.x | 타입 안전성 |
| Tailwind CSS | 3.x | 스타일링 |
| wagmi | 2.x | React Hooks for Ethereum |
| viem | 2.x | TypeScript Ethereum library |
| Zustand | 4.x | 클라이언트 상태 관리 |

### 8.2 wagmi/viem 설정

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

### 8.3 Contract Hooks

```typescript
// frontend/src/hooks/useMetaLotto.ts
import { useContractRead, useContractWrite, useWatchContractEvent } from 'wagmi'
import MetaLottoABI from '@/abis/MetaLotto.json'

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_METALOTTO_ADDRESS as `0x${string}`

// 현재 라운드 정보 조회
export function useCurrentRound() {
  return useContractRead({
    address: CONTRACT_ADDRESS,
    abi: MetaLottoABI,
    functionName: 'getCurrentRound',
  })
}

// 티켓 구매
export function useBuyTickets() {
  return useContractWrite({
    address: CONTRACT_ADDRESS,
    abi: MetaLottoABI,
    functionName: 'buyTickets',
  })
}

// 이벤트 구독
export function useTicketPurchasedEvent(onEvent: (logs: any) => void) {
  useWatchContractEvent({
    address: CONTRACT_ADDRESS,
    abi: MetaLottoABI,
    eventName: 'TicketPurchased',
    onLogs: onEvent,
  })
}
```

### 8.4 주요 화면 구성

| 화면 | 경로 | 설명 |
|------|------|------|
| 홈 (현재 라운드) | `/` | 라운드 현황, 티켓 구매, 카운트다운 |
| 히스토리 | `/history` | 과거 라운드 결과, 당첨자 목록 |
| 내 티켓 | `/my-tickets` | 내 참여 내역, 환불/미수령 상금 |

### 8.5 실시간 업데이트

```typescript
// 이벤트 기반 실시간 UI 업데이트
export function useRoundEvents() {
  const queryClient = useQueryClient()

  // 티켓 구매 이벤트
  useWatchContractEvent({
    address: CONTRACT_ADDRESS,
    abi: MetaLottoABI,
    eventName: 'TicketPurchased',
    onLogs: () => {
      queryClient.invalidateQueries({ queryKey: ['currentRound'] })
      queryClient.invalidateQueries({ queryKey: ['myTickets'] })
    },
  })

  // 당첨자 발표 이벤트
  useWatchContractEvent({
    address: CONTRACT_ADDRESS,
    abi: MetaLottoABI,
    eventName: 'WinnerDrawn',
    onLogs: (logs) => {
      queryClient.invalidateQueries({ queryKey: ['currentRound'] })
      // 당첨 알림 표시
    },
  })
}
```

---

## 9. 디렉토리 구조

```
MetaLotto/
├── contracts/                      # Foundry 스마트 컨트랙트
│   ├── src/
│   │   ├── MetaLotto.sol          # 메인 컨트랙트
│   │   └── interfaces/
│   │       └── IRandomnessProvider.sol  # v2 VRF 준비
│   ├── test/
│   │   ├── MetaLotto.t.sol        # 단위 테스트
│   │   └── MetaLotto.fuzz.t.sol   # 퍼즈 테스트
│   ├── script/
│   │   ├── Deploy.s.sol           # 배포 스크립트
│   │   └── DeployTestnet.s.sol    # 테스트넷 배포
│   ├── foundry.toml
│   └── remappings.txt
│
├── frontend/                       # Next.js DApp
│   ├── src/
│   │   ├── app/                   # App Router 페이지
│   │   │   ├── page.tsx           # 홈 (현재 라운드)
│   │   │   ├── history/
│   │   │   │   └── page.tsx       # 히스토리
│   │   │   └── my-tickets/
│   │   │       └── page.tsx       # 내 티켓
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Header.tsx
│   │   │   │   └── Footer.tsx
│   │   │   ├── round/
│   │   │   │   ├── RoundInfo.tsx
│   │   │   │   ├── Countdown.tsx
│   │   │   │   └── TicketPurchase.tsx
│   │   │   ├── history/
│   │   │   │   └── WinnerList.tsx
│   │   │   └── wallet/
│   │   │       └── ConnectButton.tsx
│   │   ├── hooks/
│   │   │   ├── useMetaLotto.ts
│   │   │   └── useRoundEvents.ts
│   │   ├── lib/
│   │   │   ├── wagmi.ts
│   │   │   ├── chains.ts
│   │   │   └── utils.ts
│   │   ├── stores/
│   │   │   └── uiStore.ts
│   │   └── abis/
│   │       └── MetaLotto.json
│   ├── public/
│   ├── next.config.js
│   ├── tailwind.config.ts
│   └── package.json
│
├── docs/                           # 프로젝트 문서
│   ├── project/
│   │   ├── prd.md
│   │   ├── features.md
│   │   └── roadmap.md
│   ├── system/
│   │   └── system-design.md       # 이 문서
│   ├── specs/
│   ├── api/
│   └── tests/
│
├── .worktrees/                     # Agent Team 병렬 작업
├── .claude/                        # Claude Code 설정
│   ├── agents/
│   ├── skills/
│   └── settings.json
├── CLAUDE.md
├── Makefile
└── .gitignore
```

---

## 10. 배포 구성

### 10.1 Metadium 네트워크 정보

| 네트워크 | Chain ID | RPC URL | Explorer |
|----------|----------|---------|----------|
| Mainnet | 11 | `https://api.metadium.com/prod` | `https://explorer.metadium.com` |
| Testnet | 12 | `https://api.metadium.com/dev` | `https://testnetexplorer.metadium.com` |

### 10.2 배포 파라미터

#### Testnet

```solidity
ticketPrice:     100000000000000000000  // 100 META (100 * 1e18 wei)
roundDuration:   3600                   // 1시간 (테스트 가속)
drawDelay:       5                      // 5블록
minTickets:      2
communityFund:   [테스트용 멀티시그]
operationFund:   [테스트용 운영 지갑]
```

#### Mainnet

```solidity
ticketPrice:     100000000000000000000  // 100 META
roundDuration:   21600                  // 6시간 (하루 4라운드)
drawDelay:       10                     // 10블록
minTickets:      2
communityFund:   [멀티시그 주소]
operationFund:   [운영 지갑 주소]
```

### 10.3 배포 스크립트 (Foundry)

```solidity
// contracts/script/Deploy.s.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/MetaLotto.sol";

contract DeployMetaLotto is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        address communityFund = vm.envAddress("COMMUNITY_FUND");
        address operationFund = vm.envAddress("OPERATION_FUND");

        uint256 ticketPrice = 100 ether;      // 100 META
        uint256 roundDuration = 21600;        // 6시간
        uint256 drawDelay = 10;               // 10블록
        uint256 minTickets = 2;

        vm.startBroadcast(deployerPrivateKey);

        MetaLotto lotto = new MetaLotto(
            communityFund,
            operationFund,
            ticketPrice,
            roundDuration,
            drawDelay,
            minTickets
        );

        vm.stopBroadcast();

        console.log("MetaLotto deployed at:", address(lotto));
    }
}
```

### 10.4 배포 명령어

```bash
# Testnet 배포
make deploy-testnet

# Mainnet 배포
make deploy-mainnet
```

### 10.5 배포 후 검증

- [ ] 컨트랙트가 정상적으로 배포되었는지 확인
- [ ] 첫 라운드가 Open 상태로 시작되었는지 확인
- [ ] 모든 설정값이 올바른지 확인
- [ ] Owner 권한이 올바른지 확인
- [ ] communityFund, operationFund 주소가 올바른지 확인

---

## 11. 개발 환경 구성

### 11.1 필수 환경변수

```bash
# .env ( contracts/)
PRIVATE_KEY=                      # 배포자 개인키
COMMUNITY_FUND=0x...              # 커뮤니티 펀드 주소
OPERATION_FUND=0x...              # 운영 지갑 주소
RPC_URL=https://api.metadium.com/prod

# .env.local (frontend/)
NEXT_PUBLIC_METALOTTO_ADDRESS=0x...  # 배포된 컨트랙트 주소
NEXT_PUBLIC_CHAIN_ID=11              # Metadium Mainnet
NEXT_PUBLIC_RPC_URL=https://api.metadium.com/prod
```

### 11.2 실행 명령어

```bash
# 개발 환경 실행
make dev

# 테스트 실행
make test

# 빌드
make build

# 컨트랙트 배포
make deploy-testnet
make deploy-mainnet
```

### 11.3 테스트 전략

| 테스트 유형 | 도구 | 설명 |
|-------------|------|------|
| 단위 테스트 | Foundry | 각 함수별 정상/예외 케이스 |
| 퍼즈 테스트 | Foundry | 난수 생성 분포 검증 |
| 인티그레이션 테스트 | Foundry | 전체 라운드 흐름 검증 |
| E2E 테스트 | Playwright | 프론트엔드 사용자 시나리오 |

---

## 12. 확장성 고려사항

### 12.1 v2 VRF 업그레이드 경로

```solidity
// IRandomnessProvider 인터페이스 준비
interface IRandomnessProvider {
    function requestRandomness(uint256 roundId) external returns (uint256 requestId);
    function isRandomnessReady(uint256 roundId) external view returns (bool);
    function getRandomness(uint256 roundId) external view returns (uint256);
}

// v1: BlockhashRandomness (내부 구현)
// v2: ChainlinkVRFRandomness (외부 프로바이더)
```

### 12.2 설정값 변경 가능 항목

- `ticketPrice`: 티켓 가격
- `roundDuration`: 라운드 기간
- `drawDelay`: 추첨 지연 블록 수
- `minTicketsPerRound`: 최소 티켓 수
- `communityFund`: 커뮤니티 펀드 주소
- `operationFund`: 운영 지갑 주소

---

## 13. 참조 문서

- [MetaLotto PRD](/docs/project/prd.md)
- [기능 백로그](/docs/project/features.md)
- [로드맵](/docs/project/roadmap.md)
- [MetaLotto Technical Spec](/MetaLotto_TechnicalSpec.md)
