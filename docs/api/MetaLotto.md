# MetaLotto 스마트 컨트랙트 API 스펙

## 1. 개요

MetaLotto는 메타디움 블록체인 기반 투명한 복권 DApp으로, META 토큰으로 티켓 구매, 온체인 추첨, 자동 상금 지급을 지원합니다.

- **컨트랙트 주소**: 배포 시 결정
- **네트워크**: Metadium Mainnet (EVM Compatible)
- **Solidity 버전**: ^0.8.24

---

## 2. 타입 정의

### 2.1 RoundStatus (열거형)

```solidity
enum RoundStatus {
    Open,       // 0: 티켓 판매 중
    Closing,    // 1: 판매 종료, 미래 블록 대기 중
    Completed,  // 2: 상금 분배 완료
    Cancelled   // 3: 라운드 취소 (최소 인원 미달)
}
```

### 2.2 Round (구조체)

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
    address winner;            // 당첨자 주소
    uint256 winnerPrize;       // 당첨 금액 (wei)
    uint256 seed;              // 누적 엔트로피 시드
}
```

### 2.3 Ticket (구조체)

```solidity
struct Ticket {
    uint256 roundId;
    address buyer;
    uint256 purchaseBlock;
}
```

---

## 3. 함수 스펙

### 3.1 buyTickets() - 티켓 구매

**설명**: 현재 라운드에 티켓을 구매합니다.

**시그니처**:
```solidity
function buyTickets(uint256 _count) external payable whenNotPaused nonReentrant
```

**매개변수**:
| 이름 | 타입 | 설명 |
|------|------|------|
| `_count` | `uint256` | 구매할 티켓 수 (1~100) |

**반환값**: 없음

**오류**:
| 오류 | 설명 |
|------|------|
| `InvalidTicketCount()` | `_count`가 0이거나 100 초과 |
| `InsufficientPayment()` | `msg.value`가 티켓 가격 부족 |
| `RoundNotOpen()` | 현재 라운드가 Open 상태가 아님 |
| `TransferFailed()` | 초과금 환불 실패 |

**이벤트**:
```solidity
event TicketPurchased(
    uint256 indexed roundId,
    address indexed buyer,
    uint256 ticketCount,
    uint256 totalCost
);
```

**가스 비용**: ~80,000 gas (티켓 1장)

---

### 3.2 drawWinner() - 당첨자 추첨

**설명**: Closing 상태의 라운드에서 당첨자를 추첨하고 상금을 분배합니다.

**시그니처**:
```solidity
function drawWinner() external whenNotPaused nonReentrant
```

**매개변수**: 없음

**반환값**: 없음

**오류**:
| 오류 | 설명 |
|------|------|
| `RoundNotClosing()` | 현재 라운드가 Closing 상태가 아님 |
| `DrawBlockNotReached()` | `block.number <= drawBlock` |
| `DrawExpired()` | `block.number > drawBlock + 256` 또는 `blockhash(drawBlock) == 0` |

**이벤트**:
```solidity
event WinnerDrawn(
    uint256 indexed roundId,
    address indexed winner,
    uint256 winnerPrize,
    uint256 communityAmount,
    uint256 operationAmount
);

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

**가스 비용**: ~150,000 gas

---

### 3.3 closeRound() - 라운드 종료

**설명**: 현재 라운드를 종료하고 Closing 상태로 전환합니다.

**시그니처**:
```solidity
function closeRound() external whenNotPaused
```

**매개변수**: 없음

**반환값**: 없음

**오류**:
| 오류 | 설명 |
|------|------|
| `RoundNotOpen()` | 현재 라운드가 Open 상태가 아님 |
| `SaleNotEnded()` | `block.timestamp < endTimestamp` |

**이벤트**:
```solidity
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
```

**가스 비용**: ~50,000 gas

---

### 3.4 claimRefund() - 환불 청구

**설명**: 취소된 라운드의 티켓 환불을 청구합니다.

**시그니처**:
```solidity
function claimRefund(uint256 _roundId) external nonReentrant
```

**매개변수**:
| 이름 | 타입 | 설명 |
|------|------|------|
| `_roundId` | `uint256` | 라운드 ID |

**반환값**: 없음

**오류**:
| 오류 | 설명 |
|------|------|
| `RoundNotCancelled()` | 라운드가 Cancelled 상태가 아님 |
| `NoTicketsToRefund()` | 환불할 티켓이 없음 |
| `TransferFailed()` | 환불 전송 실패 |

**이벤트**:
```solidity
event RefundClaimed(
    uint256 indexed roundId,
    address indexed buyer,
    uint256 amount
);
```

**가스 비용**: ~40,000 gas

---

### 3.5 withdrawPending() - 미수령 상금 인출

**설명**: 송금 실패로 미수령된 상금을 인출합니다.

**시그니처**:
```solidity
function withdrawPending() external nonReentrant
```

**매개변수**: 없음

**반환값**: 없음

**오류**:
| 오류 | 설명 |
|------|------|
| `NoTicketsToRefund()` | 인출할 금액이 없음 |
| `TransferFailed()` | 전송 실패 |

**이벤트**:
```solidity
event WithdrawalClaimed(
    address indexed user,
    uint256 amount
);
```

**가스 비용**: ~30,000 gas

---

### 3.6 forceCloseDraw() - drawBlock 재설정

**설명**: 256블록 초과로 난수 생성 불가 시 drawBlock을 재설정합니다. (Owner 전용)

**시그니처**:
```solidity
function forceCloseDraw() external onlyOwner
```

**매개변수**: 없음

**반환값**: 없음

**오류**:
| 오류 | 설명 |
|------|------|
| `RoundNotClosing()` | 현재 라운드가 Closing 상태가 아님 |
| `DrawBlockNotReached()` | `block.number <= drawBlock + 256` |

**이벤트**:
```solidity
event ConfigUpdated(
    string parameter,
    uint256 oldValue,
    uint256 newValue
);
```

**가스 비용**: ~20,000 gas

---

## 4. View 함수

### 4.1 getCurrentRound()

```solidity
function getCurrentRound() external view returns (Round memory)
```
현재 라운드 정보를 반환합니다.

### 4.2 getRound(uint256 _roundId)

```solidity
function getRound(uint256 _roundId) external view returns (Round memory)
```
특정 라운드 정보를 반환합니다.

### 4.3 getMyTickets(uint256 _roundId)

```solidity
function getMyTickets(uint256 _roundId) external view returns (uint256)
```
호출자의 특정 라운드 티켓 수를 반환합니다.

### 4.4 getRoundTicketCount(uint256 _roundId)

```solidity
function getRoundTicketCount(uint256 _roundId) external view returns (uint256)
```
특정 라운드의 전체 티켓 수를 반환합니다.

### 4.5 getTicketBuyer(uint256 _roundId, uint256 _index)

```solidity
function getTicketBuyer(uint256 _roundId, uint256 _index) external view returns (address)
```
특정 티켓의 구매자를 반환합니다.

### 4.6 getTimeRemaining()

```solidity
function getTimeRemaining() external view returns (uint256)
```
현재 라운드의 남은 시간(초)을 반환합니다.

### 4.7 getDrawBlockRemaining()

```solidity
function getDrawBlockRemaining() external view returns (uint256)
```
추첨까지 남은 블록 수를 반환합니다.

### 4.8 getPendingWithdrawal(address _user)

```solidity
function getPendingWithdrawal(address _user) external view returns (uint256)
```
사용자의 미수령 상금을 반환합니다.

### 4.9 isPaused()

```solidity
function isPaused() external view returns (bool)
```
컨트랙트 일시정지 상태를 반환합니다.

---

## 5. Admin 함수

### 5.1 setTicketPrice(uint256 _newPrice)

**설명**: 티켓 가격을 변경합니다. (Owner 전용)

**시그니처**:
```solidity
function setTicketPrice(uint256 _newPrice) external onlyOwner
```

### 5.2 setRoundDuration(uint256 _newDuration)

**설명**: 라운드 지속 시간을 변경합니다. (Owner 전용)

**시그니처**:
```solidity
function setRoundDuration(uint256 _newDuration) external onlyOwner
```

### 5.3 setDrawDelay(uint256 _newDelay)

**설명**: 추첨 지연 블록 수를 변경합니다. (Owner 전용)

**시그니처**:
```solidity
function setDrawDelay(uint256 _newDelay) external onlyOwner
```

### 5.4 setMinTickets(uint256 _newMin)

**설명**: 최소 티켓 수를 변경합니다. (Owner 전용)

**시그니처**:
```solidity
function setMinTickets(uint256 _newMin) external onlyOwner
```

### 5.5 setCommunityFund(address _newAddress)

**설명**: 커뮤니티 펀드 주소를 변경합니다. (Owner 전용)

**시그니처**:
```solidity
function setCommunityFund(address _newAddress) external onlyOwner
```

### 5.6 setOperationFund(address _newAddress)

**설명**: 운영 지갑 주소를 변경합니다. (Owner 전용)

**시그니처**:
```solidity
function setOperationFund(address _newAddress) external onlyOwner
```

### 5.6 pause()

**설명**: 컨트랙트를 일시정지합니다. (Owner 전용)

**시그니처**:
```solidity
function pause() external onlyOwner
```

### 5.7 unpause()

**설명**: 일시정지된 컨트랙트를 재개합니다. (Owner 전용)

**시그니처**:
```solidity
function unpause() external onlyOwner
```

---

## 6. 상수

| 상수 | 값 | 설명 |
|------|-----|------|
| `WINNER_SHARE` | 9000 | 당첨자 분배율 (90%) |
| `COMMUNITY_SHARE` | 500 | 커뮤니티 분배율 (5%) |
| `OPERATION_SHARE` | 500 | 운영 분배율 (5%) |
| `BASIS_POINTS` | 10000 | 기준 포인트 (100%) |
| `MAX_TICKETS_PER_PURCHASE` | 100 | 1회 최대 구매 티켓 수 |

---

## 7. 보안 메커니즘

### 7.1 접근 제어
- `onlyOwner`: 컨트랙트 소유자만 호출 가능
- `whenNotPaused`: 일시정지 상태에서 호출 불가
- `nonReentrant`: ReentrancyGuard 적용

### 7.2 난수 생성
- 3개 블록 해시 조합: `blockhash(drawBlock)`, `blockhash(drawBlock + 1)`, `blockhash(drawBlock + 2)`
- 누적 시드: 티켓 구매 시마다 업데이트
- 256블록 제한 처리: `forceCloseDraw()`로 재설정 가능

### 7.3 CEI 패턴
- 상태 변경 후 외부 호출 (Checks-Effects-Interactions)
- 초과금 즉시 환불 (저장하지 않음)

---

## 8. 가스 최적화

| 작업 | 예상 가스 |
|------|-----------|
| 티켓 1장 구매 | ~80,000 gas |
| 티켓 10장 구매 | ~250,000 gas |
| 티켓 100장 구매 | ~2,000,000 gas |
| drawWinner 호출 | ~150,000 gas |
| closeRound 호출 | ~50,000 gas |
| claimRefund 호출 | ~40,000 gas |
| withdrawPending 호출 | ~30,000 gas |

---

## 9. 이벤트 요약

| 이벤트 | 설명 |
|--------|------|
| `RoundStarted` | 새 라운드 시작 |
| `TicketPurchased` | 티켓 구매 완료 |
| `RoundClosing` | 라운드 정상 종료 |
| `RoundCancelled` | 라운드 취소 (최소 티켓 미달) |
| `WinnerDrawn` | 당첨자 발표 |
| `RefundClaimed` | 환불 완료 |
| `ConfigUpdated` | 설정 변경 |
| `FundAddressUpdated` | 펀드 주소 변경 |
| `PrizeDistributed` | 상금 분배 상세 |
| `PrizeTransferSuccess` | 당첨금 송금 성공 |
| `PrizeTransferFailed` | 당첨금 송금 실패 |
| `WithdrawalClaimed` | 미수령 상금 인출 완료 |

---

## 10. 프론트엔드 통합 예시

### 10.1 wagmi/viem로 티켓 구매

```typescript
import { useWriteContract } from 'wagmi';
import { parseEther } from 'viem';

const { writeContract } = useWriteContract();

const buyTickets = async (count: number) => {
  writeContract({
    address: '0x...', // 컨트랙트 주소
    abi: MetaLottoABI,
    functionName: 'buyTickets',
    args: [BigInt(count)],
    value: parseEther((count * 100).toString()), // 100 META/티켓
  });
};
```

### 10.2 이벤트 구독

```typescript
import { useWatchContractEvent } from 'wagmi';

// 티켓 구매 이벤트 구독
useWatchContractEvent({
  address: '0x...',
  abi: MetaLottoABI,
  eventName: 'TicketPurchased',
  onLogs: (logs) => {
    logs.forEach((log) => {
      console.log('Ticket purchased:', log.args);
    });
  },
});

// 당첨자 발표 이벤트 구독
useWatchContractEvent({
  address: '0x...',
  abi: MetaLottoABI,
  eventName: 'WinnerDrawn',
  onLogs: (logs) => {
    logs.forEach((log) => {
      console.log('Winner drawn:', log.args);
    });
  },
});
```

---

## 변경 이력

| 날짜 | 변경 내용 |
|------|----------|
| 2026-03-13 | 초기 작성 (F-02, F-03, F-07 구현 완료) |
