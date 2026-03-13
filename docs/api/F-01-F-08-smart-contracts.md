# MetaLotto 스마트 컨트랙트 API 스펙

## 개요
MetaLotto 스마트 컨트랙트의 공개 함수 목록과 사용법

## 컨트랙트 주소
- Mainnet: TBD (배포 후 업데이트)
- Testnet: TBD (배포 후 업데이트)

## 상태 (State)
- **Chain**: Metadium Mainnet (Chain ID: 11)
- **Native Token**: META (18 decimals)
- **Contract**: MetaLotto.sol

---

## 1. 라운드 관리 (F-01)

### 1.1 getCurrentRound()
현재 라운드 정보를 조회합니다.

```solidity
function getCurrentRound() external view returns (Round memory)
```

**Returns:**
```solidity
struct Round {
    uint256 roundId;           // 라운드 ID
    RoundStatus status;        // 상태 (0:Open, 1:Closing, 2:Completed, 3:Cancelled)
    uint256 startBlock;        // 시작 블록
    uint256 endTimestamp;      // 마감 시각 (Unix timestamp)
    uint256 drawBlock;         // 추첨 블록
    uint256 ticketPrice;       // 티켓 가격 (wei)
    uint256 totalPool;         // 총 풀 금액 (wei)
    uint256 ticketCount;      // 총 티켓 수
    address winner;            // 당첨자 주소
    uint256 winnerPrize;       // 당첨 금액 (wei)
    uint256 seed;             // 엔트로피 시드
}
```

**예시:**
```typescript
const currentRound = await contract.read.getCurrentRound()
console.log('Round ID:', currentRound.roundId)
console.log('Status:', ['Open', 'Closing', 'Completed', 'Cancelled'][currentRound.status])
console.log('Total Pool:', currentRound.totalPool / 1e18, 'META')
```

---

### 1.2 getRound(uint256 _roundId)
특정 라운드 정보를 조회합니다.

```solidity
function getRound(uint256 _roundId) external view returns (Round memory)
```

**Parameters:**
- `_roundId`: 라운드 ID

**예시:**
```typescript
const round = await contract.read.getRound([1])
```

---

### 1.3 getTimeRemaining()
현재 라운드 남은 시간을 조회합니다 (초 단위).

```solidity
function getTimeRemaining() external view returns (uint256)
```

**Returns:**
- 남은 시간 (초). Open 상태가 아니면 0 반환.

**예시:**
```typescript
const remaining = await contract.read.getTimeRemaining()
console.log('Remaining time:', remaining / 3600, 'hours')
```

---

### 1.4 getDrawBlockRemaining()
추첨까지 남은 블록 수를 조회합니다.

```solidity
function getDrawBlockRemaining() external view returns (uint256)
```

**Returns:**
- 남은 블록 수. Closing 상태가 아니면 0 반환.

---

## 2. 티켓 구매 (F-02)

### 2.1 buyTickets(uint256 _count)
티켓을 구매합니다.

```solidity
function buyTickets(uint256 _count) external payable whenNotPaused nonReentrant
```

**Parameters:**
- `_count`: 구매할 티켓 수 (1~100)

**Value:**
- `_count * ticketPrice` wei의 META 전송 필요

**Errors:**
- `InvalidTicketCount()`: _count가 0 또는 100 초과
- `InsufficientPayment()`: 전송 금액 부족
- `RoundNotOpen()`: Open 상태가 아님
- `Pausable: paused`: 컨트랙트 일시정지 상태

**Event Emitted:**
```solidity
event TicketPurchased(
    uint256 indexed roundId,
    address indexed buyer,
    uint256 ticketCount,
    uint256 totalCost
)
```

**예시:**
```typescript
const { request } = await contract.write.buyTickets(
  [5], // 5장 구매
  { value: parseEther('500') } // 5 * 100 META = 500 META
)
await wallet.writeContract(request)
```

---

### 2.2 getMyTickets(uint256 _roundId)
내 티켓 수를 조회합니다.

```solidity
function getMyTickets(uint256 _roundId) external view returns (uint256)
```

**Parameters:**
- `_roundId`: 라운드 ID

**Returns:**
- 내 티켓 수

**예시:**
```typescript
const myTickets = await contract.read.getMyTickets([currentRoundId])
console.log('My tickets:', myTickets)
```

---

### 2.3 getRoundTicketCount(uint256 _roundId)
라운드 전체 티켓 수를 조회합니다.

```solidity
function getRoundTicketCount(uint256 _roundId) external view returns (uint256)
```

**예시:**
```typescript
const totalTickets = await contract.read.getRoundTicketCount([currentRoundId])
```

---

### 2.4 getTicketBuyer(uint256 _roundId, uint256 _index)
특정 티켓의 구매자를 조회합니다.

```solidity
function getTicketBuyer(uint256 _roundId, uint256 _index) external view returns (address)
```

**예시:**
```typescript
const buyer = await contract.read.getTicketBuyer([currentRoundId, 0])
```

---

## 3. 당첨자 추첨 (F-02)

### 3.1 drawWinner()
당첨자를 추첨하고 상금을 분배합니다.

```solidity
function drawWinner() external whenNotPaused nonReentrant
```

**Conditions:**
- 라운드 상태: Closing
- `block.number > drawBlock` (drawBlock 도달)
- `block.number <= drawBlock + 256` (blockhash 유효)

**Errors:**
- `RoundNotClosing()`: Closing 상태가 아님
- `DrawBlockNotReached()`: drawBlock 미도달
- `DrawExpired()`: drawBlock + 256 초과

**Event Emitted:**
```solidity
event WinnerDrawn(
    uint256 indexed roundId,
    address indexed winner,
    uint256 winnerPrize,
    uint256 communityAmount,
    uint256 operationAmount
)
```

**예시:**
```typescript
const { request } = await contract.write.drawWinner()
await wallet.writeContract(request)
```

---

## 4. 라운드 종료 (F-01)

### 4.1 closeRound()
라운드를 종료합니다.

```solidity
function closeRound() external whenNotPaused
```

**Conditions:**
- 라운드 상태: Open
- `block.timestamp >= endTimestamp`

**Behavior:**
- 티켓 수 < 최소 티켓: 라운드 취소 → 새 라운드 시작
- 티켓 수 >= 최소 티켓: Closing 상태 → drawBlock 설정

**Errors:**
- `RoundNotOpen()`: Open 상태가 아님
- `SaleNotEnded()`: endTimestamp 미도달
- `Pausable: paused`: 일시정지 상태

**Events:**
```solidity
// 정상 종료 시
event RoundClosing(
    uint256 indexed roundId,
    uint256 drawBlock,
    uint256 totalPool,
    uint256 totalTickets
)

// 취소 시
event RoundCancelled(
    uint256 indexed roundId,
    uint256 refundableAmount,
    uint256 ticketCount
)
```

---

### 4.2 forceCloseDraw()
256블록 초과 시 drawBlock을 재설정합니다 (Owner만).

```solidity
function forceCloseDraw() external onlyOwner
```

**Conditions:**
- 라운드 상태: Closing
- `block.number > drawBlock + 256`

**Errors:**
- `RoundNotClosing()`: Closing 상태가 아님
- `DrawBlockNotReached()`: 256블록 미도달

---

## 5. 환불 (F-02)

### 5.1 claimRefund(uint256 _roundId)
취소된 라운드의 티켓 환불을 청구합니다.

```solidity
function claimRefund(uint256 _roundId) external nonReentrant
```

**Parameters:**
- `_roundId`: 취소된 라운드 ID

**Conditions:**
- 라운드 상태: Cancelled
- 호출자가 티켓 소유

**Errors:**
- `RoundNotCancelled()`: Cancelled 상태가 아님
- `NoTicketsToRefund()`: 환불할 티켓 없음
- `TransferFailed()`: 환불 전송 실패

**Event Emitted:**
```solidity
event RefundClaimed(
    uint256 indexed roundId,
    address indexed buyer,
    uint256 amount
)
```

---

### 5.2 withdrawPending()
미수령 상금을 인출합니다.

```solidity
function withdrawPending() external nonReentrant
```

**Conditions:**
- `pendingWithdrawals[msg.sender] > 0`

**Errors:**
- `NoTicketsToRefund()`: 인출할 금액 없음
- `TransferFailed()`: 전송 실패

**예시:**
```typescript
const { request } = await contract.write.withdrawPending()
await wallet.writeContract(request)
```

---

### 5.3 getPendingWithdrawal(address _user)
미수령 상금을 조회합니다.

```solidity
function getPendingWithdrawal(address _user) external view returns (uint256)
```

---

## 6. 비상 정지 (F-08)

### 6.1 pause()
컨트랙트를 일시정지합니다 (Owner만).

```solidity
function pause() external onlyOwner
```

**Effects:**
- `_paused = true`
- `whenNotPaused` modifier가 있는 함수 모두 차단

**Event Emitted:**
```solidity
event Paused(address account) // OpenZeppelin Pausable
```

**Blocked Functions:**
- `buyTickets()`
- `closeRound()`
- `drawWinner()`

**Allowed Functions:**
- `claimRefund()`
- `withdrawPending()`
- `forceCloseDraw()`
- 모든 view 함수

---

### 6.2 unpause()
컨트랙트를 재개합니다 (Owner만).

```solidity
function unpause() external onlyOwner
```

**Effects:**
- `_paused = false`
- 모든 함수 정상 동작

**Event Emitted:**
```solidity
event Unpaused(address account) // OpenZeppelin Pausable
```

---

### 6.3 isPaused()
일시정지 상태를 조회합니다.

```solidity
function isPaused() external view returns (bool)
```

**예시:**
```typescript
const isPaused = await contract.read.isPaused()
if (isPaused) {
  console.log('Contract is paused')
}
```

---

## 7. 관리자 함수 (Admin)

### 7.1 setTicketPrice(uint256 _newPrice)
티켓 가격을 변경합니다 (Owner만).

```solidity
function setTicketPrice(uint256 _newPrice) external onlyOwner
```

**Event:**
```solidity
event ConfigUpdated(string parameter, uint256 oldValue, uint256 newValue)
```

---

### 7.2 setRoundDuration(uint256 _newDuration)
라운드 기간을 변경합니다 (Owner만).

```solidity
function setRoundDuration(uint256 _newDuration) external onlyOwner
```

**Constraints:**
- 최소 3600초 (1시간)

---

### 7.3 setDrawDelay(uint256 _newDelay)
추첨 지연 블록 수를 변경합니다 (Owner만).

```solidity
function setDrawDelay(uint256 _newDelay) external onlyOwner
```

**Constraints:**
- 최소 1블록

---

### 7.4 setMinTickets(uint256 _newMin)
최소 티켓 수를 변경합니다 (Owner만).

```solidity
function setMinTickets(uint256 _newMin) external onlyOwner
```

**Constraints:**
- 최소 1티켓

---

### 7.5 setCommunityFund(address _newAddress)
커뮤니티 펀드 주소를 변경합니다 (Owner만).

```solidity
function setCommunityFund(address _newAddress) external onlyOwner
```

**Event:**
```solidity
event FundAddressUpdated(string fundType, address oldAddress, address newAddress)
```

---

### 7.6 setOperationFund(address _newAddress)
운영 지갑 주소를 변경합니다 (Owner만).

```solidity
function setOperationFund(address _newAddress) external onlyOwner
```

---

## 8. Constants

```solidity
uint256 public constant WINNER_SHARE = 9000;     // 90%
uint256 public constant COMMUNITY_SHARE = 500;   // 5%
uint256 public constant OPERATION_SHARE = 500;   // 5%
uint256 public constant BASIS_POINTS = 10000;    // 100%
uint256 public constant MAX_TICKETS_PER_PURCHASE = 100;
```

---

## 9. Custom Errors

| Error | Description |
|-------|-------------|
| `RoundNotOpen()` | 라운드가 Open 상태가 아님 |
| `RoundNotClosing()` | 라운드가 Closing 상태가 아님 |
| `SaleNotEnded()` | 판매 종료 시간 미도달 |
| `DrawBlockNotReached()` | drawBlock 미도달 |
| `DrawExpired()` | drawBlock + 256 초과 (blockhash 소실) |
| `InvalidTicketCount()` | 유효하지 않은 티켓 수 (0 또는 100 초과) |
| `InsufficientPayment()` | 결제 금액 부족 |
| `NoTicketsToRefund()` | 환불할 티켓 없음 |
| `RoundNotCancelled()` | 라운드가 Cancelled 상태가 아님 |
| `AlreadyRefunded()` | 이미 환불됨 |
| `TransferFailed()` | 전송 실패 |
| `InvalidAddress()` | 유효하지 않은 주소 (0x0) |
| `InvalidParameter()` | 유효하지 않은 파라미터 |

---

## 10. 이벤트 요약

| 이벤트 | 설명 |
|------|------|
| `RoundStarted` | 새 라운드 시작 |
| `TicketPurchased` | 티켓 구매 |
| `RoundClosing` | 라운드 종료 (정상) |
| `RoundCancelled` | 라운드 취소 |
| `WinnerDrawn` | 당첨자 선정 및 상금 분배 |
| `RefundClaimed` | 환불 청구 |
| `ConfigUpdated` | 설정값 변경 |
| `FundAddressUpdated` | 펀드 주소 변경 |
| `Paused` | 컨트랙트 일시정지 |
| `Unpaused` | 컨트랙트 재개 |

---

## 11. Gas 예상치

| 함수 | 예상 Gas |
|------|----------|
| `buyTickets(1)` | ~80,000 |
| `buyTickets(10)` | ~150,000 |
| `closeRound()` | ~50,000 |
| `drawWinner()` | ~100,000 |
| `claimRefund()` | ~60,000 |
| `withdrawPending()` | ~30,000 |
| `pause()` | ~10,000 |
| `unpause()` | ~10,000 |

---

## 12. Frontend Integration 예시

### Wagmi + Viem

```typescript
// src/hooks/useMetaLotto.ts
import { useContractRead, useContractWrite } from 'wagmi'
import { parseEther } from 'viem'

const CONTRACT_ADDRESS = '0x...' as const

// ABI 필요한 함수만 선택
const ABI = [
  {
    "name": "getCurrentRound",
    "type": "function",
    "stateMutability": "view",
    "inputs": [],
    "outputs": [{"name": "", "type": "tuple"}]
  },
  {
    "name": "buyTickets",
    "type": "function",
    "stateMutability": "payable",
    "inputs": [{"name": "_count", "type": "uint256"}],
    "outputs": []
  },
  {
    "name": "drawWinner",
    "type": "function",
    "stateMutability": "nonpayable",
    "inputs": [],
    "outputs": []
  }
] as const

// 현재 라운드 조회
export function useCurrentRound() {
  return useContractRead({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: 'getCurrentRound',
  })
}

// 티켓 구매
export function useBuyTickets() {
  const { data: currentRound } = useCurrentRound()

  return useContractWrite({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: 'buyTickets',
    value: currentRound ? BigInt(currentRound.ticketPrice) * 5n : 0n,
    args: [5], // 5장 구매
  })
}

// 당첨자 추첨
export function useDrawWinner() {
  return useContractWrite({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: 'drawWinner',
  })
}
```

---

## 변경 이력
| 날짜 | 버전 | 변경 내용 |
|------|------|----------|
| 2026-03-13 | 1.0.0 | 초기 스펙 (F-01, F-08) |
