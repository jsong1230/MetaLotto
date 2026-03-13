# F-01 라운드 관리 — API 스펙 확정본

## 개요
- **기능**: F-01 라운드 관리
- **컨트랙트**: MetaLotto.sol
- **버전**: v1.0 (최종 확정)
- **날짜**: 2026-03-13
- **기본 URL**: `/MetaLotto.sol` (스마트 컨트랙트 호출)

## 응답 포맷

### 성공 응답
```json
{
  "success": true,
  "data": <함수별 데이터>
}
```

### 실패 응답 (스마트 컨트랙트 Revert)
```json
{
  "success": false,
  "error": "<에러 메시지>"
}
```

## API 엔드포인트

### 1. 라운드 관리 함수

#### 1.1 closeRound() — 라운드 종료

**설명**: 티켓 판매 마감 후 라운드를 종료하고 추첨 준비

**메서드**: `closeRound()`

** modifiers**: `whenNotPaused`

**파라미터**: 없음

**반환값**: 없음

**사전 조건**:
- 현재 라운드 상태가 `Open`이어야 함
- `block.timestamp >= currentRound.endTimestamp`이어야 함

**동작**:
1. `ticketCount < minTicketsPerRound`인 경우:
   - 상태를 `Cancelled`로 변경
   - `RoundCancelled` 이벤트 발생
   - 새 라운드 자동 시작 (`_startNewRound()`)
2. `ticketCount >= minTicketsPerRound`인 경우:
   - 상태를 `Closing`으로 변경
   - `drawBlock = block.number + drawDelay`로 설정
   - `RoundClosing` 이벤트 발생

**에러**:
| 에러 | 설명 |
|------|------|
| `RoundNotOpen()` | 현재 라운드가 Open 상태가 아님 |
| `SaleNotEnded()` | 티켓 판매 마감 시각 도달 전 |

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

**사용 예시** (Solidity):
```solidity
// Frontend에서 호출
lotto.closeRound();
```

**가스 비용**: ~50,000 gas (티켓 수에 따라 변동)

---

#### 1.2 forceCloseDraw() — drawBlock 재설정

**설명**: 256블록 초과 시 drawBlock 재설정 (Owner만 가능)

**메서드**: `forceCloseDraw()`

**modifiers**: `onlyOwner`

**파라미터**: 없음

**반환값**: 없음

**사전 조건**:
- 현재 라운드 상태가 `Closing`이어야 함
- `block.number > round.drawBlock + 256`이어야 함

**동작**:
1. `round.drawBlock = block.number + drawDelay`로 재설정
2. `ConfigUpdated` 이벤트 발생

**에러**:
| 에러 | 설명 |
|------|------|
| `RoundNotClosing()` | 현재 라운드가 Closing 상태가 아님 |
| `DrawBlockNotReached()` | `block.number <= round.drawBlock + 256` |
| `Unauthorized()` (Ownable) | Owner만 호출 가능 |

**이벤트**:
```solidity
event ConfigUpdated(
    string parameter,
    uint256 oldValue,
    uint256 newValue
);
```

**사용 예시** (Solidity):
```solidity
// Owner만 호출
lotto.forceCloseDraw();
```

**가스 비용**: ~1,500 gas

---

### 2. View 함수

#### 2.1 getCurrentRound() — 현재 라운드 조회

**설명**: 현재 활성 라운드 정보 조회

**메서드**: `getCurrentRound()`

**modifiers**: `view`

**파라미터**: 없음

**반환값**:
```solidity
struct Round {
    uint256 roundId;           // 라운드 고유 ID
    RoundStatus status;        // 현재 상태
    uint256 startBlock;        // 라운드 시작 블록
    uint256 endTimestamp;      // 티켓 판매 마감 시각
    uint256 drawBlock;         // 난수 생성에 사용할 미래 블록
    uint256 ticketPrice;       // 티켓 가격
    uint256 totalPool;         // 누적 풀 금액
    uint256 ticketCount;       // 발행된 총 티켓 수
    address winner;            // 당첨자 주소
    uint256 winnerPrize;       // 당첨 금액
    uint256 seed;              // 누적 엔트로피 시드
}
```

**사용 예시**:
```javascript
const round = await lotto.getCurrentRound();
console.log(round.roundId, round.status, round.ticketCount);
```

**가스 비용**: ~2,500 gas

---

#### 2.2 getRound(uint256 _roundId) — 특정 라운드 조회

**설명**: 특정 라운드 ID로 라운드 정보 조회

**메서드**: `getRound(uint256 _roundId)`

**modifiers**: `view`

**파라미터**:
| 파라미터 | 타입 | 설명 |
|----------|-------|------|
| `_roundId` | `uint256` | 조회할 라운드 ID |

**반환값**: `Round` 구조체 (존재하지 않으면 기본값 반환)

**사용 예시**:
```javascript
const round = await lotto.getRound(1);
if (round.roundId === 0) {
  console.log("라운드가 존재하지 않습니다");
}
```

**가스 비용**: ~2,500 gas

---

#### 2.3 getTimeRemaining() — 남은 시간 조회

**설명**: 현재 라운드 남은 시간 (초) 조회

**메서드**: `getTimeRemaining()`

**modifiers**: `view`

**파라미터**: 없음

**반환값**:
- `uint256`: 남은 시간 (초), 0 = 종료되거나 Open 상태 아님

**동작**:
- `round.status != Open`인 경우: 0 반환
- `round.endTimestamp > block.timestamp`인 경우: `endTimestamp - block.timestamp`
- 그 외: 0 반환

**사용 예시**:
```javascript
const timeRemaining = await lotto.getTimeRemaining();
console.log(`남은 시간: ${timeRemaining}초`);
```

**가스 비용**: ~1,000 gas

---

### 3. 상태 변수 (Public Getter)

#### 3.1 currentRoundId — 현재 라운드 ID

**타입**: `uint256`

**설명**: 현재 활성 라운드 ID

**사용 예시**:
```javascript
const currentRoundId = await lotto.currentRoundId();
```

---

#### 3.2 roundDuration — 라운드 지속 시간

**타입**: `uint256`

**설명**: 라운드 지속 시간 (초), 기본값: 21600 (6시간)

**사용 예시**:
```javascript
const duration = await lotto.roundDuration();
console.log(`라운드 기간: ${duration}초`);
```

---

#### 3.3 drawDelay — 추첨 지연 블록

**타입**: `uint256`

**설명**: 추첨 지연 블록 수, 기본값: 10

**사용 예시**:
```javascript
const delay = await lotto.drawDelay();
console.log(`추첨 지연: ${delay}블록`);
```

---

#### 3.4 minTicketsPerRound — 최소 티켓 수

**타입**: `uint256`

**설명**: 라운드 최소 티켓 수, 기본값: 2

**사용 예시**:
```javascript
const minTickets = await lotto.minTicketsPerRound();
console.log(`최소 티켓: ${minTickets}장`);
```

---

#### 3.5 ticketPrice — 티켓 가격

**타입**: `uint256`

**설명**: 티켓 가격 (wei), 기본값: 100 * 1e18

**사용 예시**:
```javascript
const price = await lotto.ticketPrice();
console.log(`티켓 가격: ${ethers.formatEther(price)} META`);
```

---

#### 3.6 communityFund — 커뮤니티 펀드

**타입**: `address`

**설명**: 커뮤니티 펀드 주소 (5% 상금)

**사용 예시**:
```javascript
const fund = await lotto.communityFund();
console.log(`커뮤니티 펀드: ${fund}`);
```

---

#### 3.7 operationFund — 운영 펀드

**타입**: `address`

**설명**: 운영 지갑 주소 (5% 상금)

**사용 예시**:
```javascript
const fund = await lotto.operationFund();
console.log(`운영 펀드: ${fund}`);
```

---

## RoundStatus 열거형

| 값 | 이름 | 설명 |
|----|------|------|
| 0 | Open | 티켓 판매 중 |
| 1 | Closing | 판매 종료, 미래 블록 대기 중 |
| 2 | Drawing | 당첨자 선정 가능 (사용 안 함) |
| 3 | Completed | 상금 분배 완료 |
| 4 | Cancelled | 라운드 취소 (참여자 < 최소인원) |

## 에러 처리

### Custom Error 목록

| Error Selector | 설명 | 해결 방법 |
|---------------|------|-----------|
| `InvalidAddress()` | 펀드 주소가 0x0 | 유효한 주소 사용 |
| `InvalidParameter()` | 설정값이 0 또는 범위 초과 | 올바른 파라미터 사용 |
| `RoundNotOpen()` | 라운드가 Open 상태 아님 | 라운드 시작 대기 |
| `SaleNotEnded()` | 판매 마감 시각 도달 전 | 시간 경과 후 호출 |
| `RoundNotClosing()` | 라운드가 Closing 상태 아님 | closeRound() 먼저 호출 |
| `DrawBlockNotReached()` | drawBlock 도달하지 않음 | 블록 추가 대기 |
| `DrawExpired()` | 추첨 유효기간 만료 | Owner에게 forceCloseDraw() 요청 |

### Frontend 에러 처리 예시

```javascript
try {
  await lotto.closeRound();
  console.log("라운드 종료 성공");
} catch (error) {
  if (error.name === 'ContractExecutionError') {
    // Smart Contract revert
    const errorData = error.data;
    if (errorData.includes('RoundNotOpen()')) {
      console.error("라운드가 열리지 않았습니다");
    } else if (errorData.includes('SaleNotEnded()')) {
      console.error("판매 마감 시각이 도달하지 않았습니다");
    }
  } else {
    console.error("알 수 없는 에러:", error);
  }
}
```

## 인증

| 함수 | 인증 |
|------|------|
| `closeRound()` | `whenNotPaused` (일시정지 아닐 때만 호출) |
| `forceCloseDraw()` | `onlyOwner` (Owner만 호출) |

## 가스 비용 요약

| 함수 | 예상 가스 | 비고 |
|------|-----------|------|
| `closeRound()` | ~50,000 | 티켓 수에 따라 변동 |
| `forceCloseDraw()` | ~1,500 | Owner만 호출 |
| `getCurrentRound()` | ~2,500 | View 함수 |
| `getRound(uint256)` | ~2,500 | View 함수 |
| `getTimeRemaining()` | ~1,000 | View 함수 |

## 사용 예시 (Frontend + Ethers.js)

### 예시 1: 현재 라운드 정보 조회

```javascript
import { ethers } from 'ethers';

// 컨트랙트 연결
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const lotto = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);

// 현재 라운드 조회
const currentRound = await lotto.getCurrentRound();
console.log('현재 라운드:', currentRound);

// 남은 시간 조회
const timeRemaining = await lotto.getTimeRemaining();
const hours = Math.floor(timeRemaining / 3600);
const minutes = Math.floor((timeRemaining % 3600) / 60);
console.log(`남은 시간: ${hours}시간 ${minutes}분`);
```

### 예시 2: 라운드 종료

```javascript
async function closeCurrentRound() {
  try {
    const tx = await lotto.closeRound();
    await tx.wait();

    const round = await lotto.getRound(await lotto.currentRoundId());
    console.log('라운드 종료 완료:', round.status);

    // 새 라운드 시작 확인
    const newRoundId = await lotto.currentRoundId();
    console.log('새 라운드 ID:', newRoundId);
  } catch (error) {
    console.error('라운드 종료 실패:', error);
  }
}
```

### 예시 3: Owner만 drawBlock 재설정

```javascript
async function forceResetDrawBlock() {
  if (wallet.address !== await lotto.owner()) {
    console.error('Owner만 호출할 수 있습니다');
    return;
  }

  try {
    const tx = await lotto.forceCloseDraw();
    await tx.wait();

    const round = await lotto.getCurrentRound();
    console.log('새 drawBlock:', round.drawBlock);
  } catch (error) {
    if (error.message.includes('DrawBlockNotReached()')) {
      console.error('256블록이 경과하지 않았습니다');
    } else {
      console.error('오류:', error);
    }
  }
}
```

## 변경 이력

| 날짜 | 변경 내용 | 이유 |
|------|----------|------|
| 2026-03-13 | 최종 확정본 작성 | F-01 라운드 관리 GREEN 달성 |
