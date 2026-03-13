# F-05 자동 상금 지급 — 기술 설계서

## 1. 참조
- 인수조건: docs/project/features.md #F-05
- 시스템 설계: docs/system/system-design.md

## 2. 아키텍처 결정

### 결정 1: 송금 방식
- **선택지**: A) Push Pattern (직접 송금) / B) Pull Pattern (인출 패턴)
- **결정**: A + B 하이브리드
- **근거**: 기본적으로 Push Pattern으로 자동 송금 시도, 실패 시 Pull Pattern으로 대체

### 결정 2: 실패 시 저장 방식
- **선택지**: A) 라운드별 매핑 / B) 사용자별 누적 매핑
- **결정**: B) 사용자별 누적 매핑
- **근거**: 여러 라운드에서 실패한 금액을 한 번에 인출 가능, 가스 절약

## 3. 상태 변수 설계

### 3.1 상태 변수

| 변수 | 타입 | Visibility | 설명 |
|------|------|------------|------|
| `pendingWithdrawals` | `mapping(address => uint256)` | `public` | 사용자별 미수령 상금 |

### 3.2 구조

```solidity
// 예시
pendingWithdrawals[0xUser1] = 900 ether;  // 라운드 1에서 실패한 상금
pendingWithdrawals[0xUser2] = 450 ether;  // 라운드 2에서 실패한 상금
```

## 4. 함수 설계

### 4.1 _sendPrize() — internal

```solidity
function _sendPrize(address _winner, uint256 _amount) internal {
    (bool sent, ) = _winner.call{value: _amount}("");

    if (!sent) {
        // Pull Pattern: 실패 시 pendingWithdrawals에 저장
        pendingWithdrawals[_winner] += _amount;
        emit PrizeTransferFailed(_winner, _amount);
    } else {
        emit PrizeTransferSuccess(_winner, _amount);
    }
}
```

### 4.2 withdrawPending() — external

```solidity
function withdrawPending() external nonReentrant {
    uint256 amount = pendingWithdrawals[msg.sender];

    require(amount > 0, NoPendingWithdrawal());

    // CEI 패턴: 상태 변경 먼저
    pendingWithdrawals[msg.sender] = 0;

    // 외부 호출
    (bool success, ) = msg.sender.call{value: amount}("");
    require(success, TransferFailed());

    emit WithdrawalClaimed(msg.sender, amount);
}
```

### 4.3 getPendingWithdrawal(address _user) — external view

```solidity
function getPendingWithdrawal(address _user) external view returns (uint256) {
    return pendingWithdrawals[_user];
}
```

## 5. Pull Pattern 상세

### 5.1 작동 원리

```
1. drawWinner() 호출
   ↓
2. _distributePrize() 호출
   ↓
3. _sendPrize(winner, winnerPrize) 호출
   ↓
4. winner.call{value: amount}("") 시도
   ├─ 성공: PrizeTransferSuccess 이벤트
   └─ 실패: pendingWithdrawals[winner] += amount
             PrizeTransferFailed 이벤트
   ↓
5. 당첨자가 withdrawPending() 호출
   ↓
6. pendingWithdrawals[msg.sender] = 0
   msg.sender.call{value: amount}("")
   ↓
7. WithdrawalClaimed 이벤트
```

### 5.2 실패 시나리오

| 실패 원인 | 설명 | 대응 |
|-----------|------|------|
| 컨트랙트 수신 불가 | receive() 함수 없음 | pendingWithdrawals에 저장 |
| 가스 부족 | 당첨자 지갑 가스 부족 | pendingWithdrawals에 저장 |
| Revert | 당첨자 컨트랙트가 revert | pendingWithdrawals에 저장 |
| Out of gas | call 시 가스 소진 | pendingWithdrawals에 저장 |

### 5.3 CEI 패턴 준수

```solidity
function withdrawPending() external nonReentrant {
    uint256 amount = pendingWithdrawals[msg.sender];
    require(amount > 0, NoPendingWithdrawal());

    // 1. Effects (상태 변경 먼저)
    pendingWithdrawals[msg.sender] = 0;

    // 2. Interactions (외부 호출 마지막)
    (bool success, ) = msg.sender.call{value: amount}("");
    require(success, TransferFailed());

    emit WithdrawalClaimed(msg.sender, amount);
}
```

## 6. 에러 케이스

| Error | 시나리오 | 대응 |
|-------|----------|------|
| `NoPendingWithdrawal()` | pendingWithdrawals[msg.sender] == 0 | revert |
| `TransferFailed()` | withdrawPending()에서 송금 실패 | revert (상태는 이미 0으로 변경됨, 재시도 불가) |

### 6.1 TransferFailed 대응
`withdrawPending()`에서 송금이 실패하면 `pendingWithdrawals`가 이미 0이 되어 금액이 소실됩니다. 이를 방지하기 위해 다음과 같이 수정할 수 있습니다.

```solidity
// 대안: 실패 시 상태 롤백
function withdrawPending() external nonReentrant {
    uint256 amount = pendingWithdrawals[msg.sender];
    require(amount > 0, NoPendingWithdrawal());

    // 상태 변경
    pendingWithdrawals[msg.sender] = 0;

    (bool success, ) = msg.sender.call{value: amount}("");
    if (!success) {
        // 실패 시 상태 복원
        pendingWithdrawals[msg.sender] = amount;
        revert TransferFailed();
    }

    emit WithdrawalClaimed(msg.sender, amount);
}
```

## 7. 이벤트

```solidity
event PrizeTransferSuccess(
    address indexed winner,
    uint256 amount
);

event PrizeTransferFailed(
    address indexed winner,
    uint256 amount
);

event WithdrawalClaimed(
    address indexed user,
    uint256 amount
);
```

## 8. 영향 범위

### 수정 필요 파일
- `contracts/src/MetaLotto.sol`

### 신규 생성 파일
- `contracts/test/MetaLottoPayout.t.sol` (자동 지급 테스트)

## 9. 가스 최적화

### 9.1 단일 매핑 vs 복합 매핑
- 현재: `mapping(address => uint256)` — O(1) 접근
- 대안: `mapping(uint256 => mapping(address => uint256))` — 라운드별 추적 가능하지만 가스 증가

### 9.2 누적 방식의 장점
- 여러 라운드에서 실패한 금액을 한 번에 인출 가능
- 가스 절약 (여러 번 호출 vs 1번 호출)

## 10. 보안 고려사항

### 10.1 ReentrancyGuard
- `withdrawPending()`은 `nonReentrant` modifier 적용
- CEI 패턴 준수

### 10.2 Integer Overflow
- `pendingWithdrawals[_winner] += _amount` — Solidity 0.8.x 기본 체크

### 10.3 DOS 방지
- 당첨자 송금 실패해도 drawWinner()는 완료됨
- 커뮤니티/운영 펀드는 require로 실패 시 전체 revert

## 변경 이력
| 날짜 | 변경 내용 | 이유 |
|------|----------|------|
| 2026-03-13 | 초기 작성 | M1 마일스톤 시작 |
