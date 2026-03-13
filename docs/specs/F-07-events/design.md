# F-07 이벤트 로그 — 기술 설계서

## 1. 참조
- 인수조건: docs/project/features.md #F-07
- 시스템 설계: docs/system/system-design.md

## 2. 아키텍처 결정

### 결정 1: 이벤트 인덱싱 전략
- **선택지**: A) 모든 필드 indexed / B) 조회 키만 indexed
- **결정**: B) 조회 키만 indexed
- **근거**: indexed 필드는 3개 제한, 과도한 인덱싱은 로그 크기 증가

### 결정 2: 이벤트 방출 시점
- **선택지**: A) 상태 변경 전 / B) 상태 변경 후
- **결정**: B) 상태 변경 후
- **근거**: 이벤트 핸들러에서 최신 상태 조회 가능

## 3. 전체 이벤트 정의

### 3.1 라운드 관련 이벤트

#### RoundStarted
```solidity
event RoundStarted(
    uint256 indexed roundId,      // 필터링용
    uint256 startBlock,           // 정보용
    uint256 endTimestamp,         // 정보용
    uint256 ticketPrice           // 정보용
);
```
- **발생 시점**: `_startNewRound()` 호출 시
- **용도**: 새 라운드 시작 알림, 프론트엔드 갱신

#### RoundClosing
```solidity
event RoundClosing(
    uint256 indexed roundId,
    uint256 drawBlock,
    uint256 totalPool,
    uint256 totalTickets
);
```
- **발생 시점**: `closeRound()` 호출 시 (정상 종료)
- **용도**: 라운드 종료 알림, 추첨 대기 시작

#### RoundCancelled
```solidity
event RoundCancelled(
    uint256 indexed roundId,
    uint256 refundableAmount,
    uint256 ticketCount
);
```
- **발생 시점**: `closeRound()` 호출 시 (최소 티켓 미달)
- **용도**: 라운드 취소 알림, 환불 가능 알림

#### WinnerDrawn
```solidity
event WinnerDrawn(
    uint256 indexed roundId,
    address indexed winner,       // 필터링용
    uint256 winnerPrize,
    uint256 communityAmount,
    uint256 operationAmount
);
```
- **발생 시점**: `drawWinner()` 호출 시
- **용도**: 당첨자 발표, 상금 분배 완료

### 3.2 티켓 관련 이벤트

#### TicketPurchased
```solidity
event TicketPurchased(
    uint256 indexed roundId,      // 필터링용
    address indexed buyer,        // 필터링용
    uint256 ticketCount,
    uint256 totalCost
);
```
- **발생 시점**: `buyTickets()` 호출 시
- **용도**: 티켓 구매 알림, 실시간 참여 현황

### 3.3 환불 관련 이벤트

#### RefundClaimed
```solidity
event RefundClaimed(
    uint256 indexed roundId,
    address indexed buyer,
    uint256 amount
);
```
- **발생 시점**: `claimRefund()` 호출 시
- **용도**: 환불 완료 알림

### 3.4 지급 관련 이벤트

#### PrizeTransferSuccess
```solidity
event PrizeTransferSuccess(
    address indexed winner,
    uint256 amount
);
```
- **발생 시점**: `_sendPrize()` 성공 시
- **용도**: 당첨금 송금 성공 로그

#### PrizeTransferFailed
```solidity
event PrizeTransferFailed(
    address indexed winner,
    uint256 amount
);
```
- **발생 시점**: `_sendPrize()` 실패 시
- **용도**: 미수령금 발생 알림

#### WithdrawalClaimed
```solidity
event WithdrawalClaimed(
    address indexed user,
    uint256 amount
);
```
- **발생 시점**: `withdrawPending()` 호출 시
- **용도**: 미수령금 인출 완료

### 3.5 설정 변경 이벤트

#### ConfigUpdated
```solidity
event ConfigUpdated(
    string parameter,             // 파라미터 이름
    uint256 oldValue,
    uint256 newValue
);
```
- **발생 시점**: `setTicketPrice()`, `setRoundDuration()`, `setDrawDelay()`, `setMinTickets()`, `forceCloseDraw()`
- **용도**: 설정 변경 로그

#### FundAddressUpdated
```solidity
event FundAddressUpdated(
    string fundType,              // "communityFund" 또는 "operationFund"
    address oldAddress,
    address newAddress
);
```
- **발생 시점**: `setCommunityFund()`, `setOperationFund()`
- **용도**: 펀드 주소 변경 로그

#### Paused
```solidity
event Paused(address account);   // OpenZeppelin Pausable 제공
```
- **발생 시점**: `pause()` 호출 시
- **용도**: 컨트랙트 일시 정지 알림

#### Unpaused
```solidity
event Unpaused(address account); // OpenZeppelin Pausable 제공
```
- **발생 시점**: `unpause()` 호출 시
- **용도**: 컨트랙트 재개 알림

### 3.6 분배 관련 이벤트

#### PrizeDistributed
```solidity
event PrizeDistributed(
    uint256 indexed roundId,
    address indexed winner,
    uint256 winnerAmount,
    uint256 communityAmount,
    uint256 operationAmount
);
```
- **발생 시점**: `_distributePrize()` 호출 시
- **용도**: 상금 분배 상세 로그

## 4. 인덱싱 전략 상세

### 4.1 indexed 필드 선택 기준

| 기준 | 설명 |
|------|------|
| 필터링 빈도 | 자주 조회되는 필드 |
| 최대 3개 | Solidity 제약 |
| 타입 | 값 타입 (uint256, address, bytes32) |

### 4.2 각 이벤트의 indexed 필드

| 이벤트 | indexed 필드 | 이유 |
|--------|-------------|------|
| RoundStarted | roundId | 라운드별 조회 |
| RoundClosing | roundId | 라운드별 조회 |
| RoundCancelled | roundId | 라운드별 조회 |
| WinnerDrawn | roundId, winner | 라운드별, 당첨자별 조회 |
| TicketPurchased | roundId, buyer | 라운드별, 구매자별 조회 |
| RefundClaimed | roundId, buyer | 라운드별, 환불자별 조회 |
| PrizeTransferSuccess | winner | 당첨자별 조회 |
| PrizeTransferFailed | winner | 당첨자별 조회 |
| WithdrawalClaimed | user | 사용자별 조회 |
| PrizeDistributed | roundId, winner | 라운드별, 당첨자별 조회 |

## 5. 이벤트 방출 위치

### 5.1 함수별 이벤트 매핑

| 함수 | emit 이벤트 |
|------|-------------|
| constructor | - |
| _startNewRound | RoundStarted |
| buyTickets | TicketPurchased |
| closeRound | RoundClosing OR RoundCancelled |
| drawWinner | WinnerDrawn, PrizeDistributed, PrizeTransferSuccess/Failed |
| forceCloseDraw | ConfigUpdated |
| claimRefund | RefundClaimed |
| withdrawPending | WithdrawalClaimed |
| setTicketPrice | ConfigUpdated |
| setRoundDuration | ConfigUpdated |
| setDrawDelay | ConfigUpdated |
| setMinTickets | ConfigUpdated |
| setCommunityFund | FundAddressUpdated |
| setOperationFund | FundAddressUpdated |
| pause | Paused |
| unpause | Unpaused |

## 6. 프론트엔드 이벤트 구독

### 6.1 wagmi/viem 예시

```typescript
// 현재 라운드 티켓 구매 이벤트
useWatchContractEvent({
  address: CONTRACT_ADDRESS,
  abi: MetaLottoABI,
  eventName: 'TicketPurchased',
  args: { roundId: currentRoundId },
  onLogs: (logs) => {
    // UI 갱신
    queryClient.invalidateQueries({ queryKey: ['currentRound'] });
  },
});

// 당첨자 발표 이벤트
useWatchContractEvent({
  address: CONTRACT_ADDRESS,
  abi: MetaLottoABI,
  eventName: 'WinnerDrawn',
  onLogs: (logs) => {
    // 당첨 알림 표시
    const { winner, winnerPrize } = logs[0].args;
    if (winner === userAddress) {
      showWinNotification(winnerPrize);
    }
  },
});
```

### 6.2 The Graph 인덱싱 (선택)

```graphql
type TicketPurchased @entity {
  id: ID!
  roundId: BigInt!
  buyer: Bytes!
  ticketCount: BigInt!
  totalCost: BigInt!
  timestamp: BigInt!
}

type WinnerDrawn @entity {
  id: ID!
  roundId: BigInt!
  winner: Bytes!
  winnerPrize: BigInt!
  communityAmount: BigInt!
  operationAmount: BigInt!
  timestamp: BigInt!
}
```

## 7. 영향 범위

### 수정 필요 파일
- `contracts/src/MetaLotto.sol`

### 신규 생성 파일
- `contracts/test/MetaLottoEvents.t.sol` (이벤트 테스트)

## 8. 이벤트 로그 크기

### 8.1 가스 비용

| 항목 | 가스 |
|------|------|
| 기본 로그 비용 | 375 |
| indexed 필드당 | 375 |
| 데이터 바이트당 | 8 |

### 8.2 예시

```solidity
event TicketPurchased(
    uint256 indexed roundId,      // +375 gas
    address indexed buyer,        // +375 gas
    uint256 ticketCount,          // +8 * 32 = 256 gas
    uint256 totalCost             // +8 * 32 = 256 gas
);
// 총 약 1,262 gas (데이터 크기에 따라 변동)
```

## 변경 이력
| 날짜 | 변경 내용 | 이유 |
|------|----------|------|
| 2026-03-13 | 초기 작성 | M1 마일스톤 시작 |
