# F-08 비상 정지 — 기술 설계서

## 1. 참조
- 인수조건: docs/project/features.md #F-08
- 시스템 설계: docs/system/system-design.md

## 2. 아키텍처 결정

### 결정 1: Pausable 구현 방식
- **선택지**: A) 직접 구현 / B) OpenZeppelin Pausable
- **결정**: B) OpenZeppelin Pausable
- **근거**: 검증된 구현, 표준 패턴, 보안 감사 완료

### 결정 2: Pause 적용 범위
- **선택지**: A) 모든 함수 / B) 상태 변경 함수만 / C) 선택적 적용
- **결정**: C) 선택적 적용
- **근거**: View 함수는 pause 상태에서도 조회 가능해야 함

### 결정 3: Pause 권한
- **선택지**: A) Owner만 / B) 다중 서명 / C) 특정 주소 리스트
- **결정**: A) Owner만
- **근거**: 단순성, v2에서 다중 서명으로 업그레이드 가능

## 3. OpenZeppelin Pausable 개요

### 3.1 상속 구조

```solidity
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MetaLotto is Ownable, Pausable, ReentrancyGuard {
    // ...
}
```

### 3.2 Pausable 제공 기능

```solidity
// 상태 변수
bool private _paused;

// Modifier
modifier whenNotPaused() {
    require(!paused(), "Pausable: paused");
    _;
}

modifier whenPaused() {
    require(paused(), "Pausable: not paused");
    _;
}

// View 함수
function paused() public view returns (bool);

// 내부 함수
function _pause() internal whenNotPaused;
function _unpause() internal whenPaused;

// 이벤트
event Paused(address account);
event Unpaused(address account);
```

## 4. Pause 적용 범위

### 4.1 whenNotPaused 적용 함수

| 함수 | 적용 여부 | 이유 |
|------|-----------|------|
| `buyTickets()` | O | 티켓 구매 중단 |
| `closeRound()` | O | 라운드 종료 중단 |
| `drawWinner()` | O | 당첨자 추첨 중단 |
| `claimRefund()` | X | 환불은 pause 중에도 가능 |
| `withdrawPending()` | X | 인출은 pause 중에도 가능 |
| `forceCloseDraw()` | X | 복구 작업은 pause 중에도 필요 |

### 4.2 View 함수 (pause 영향 없음)

| 함수 | 설명 |
|------|------|
| `getCurrentRound()` | 현재 라운드 조회 |
| `getRound()` | 특정 라운드 조회 |
| `getMyTickets()` | 내 티켓 조회 |
| `getRoundTicketCount()` | 티켓 수 조회 |
| `getTimeRemaining()` | 남은 시간 조회 |
| `getPendingWithdrawal()` | 미수령금 조회 |
| `paused()` | pause 상태 조회 |

## 5. 함수 설계

### 5.1 pause() — external onlyOwner

```solidity
function pause() external onlyOwner {
    _pause();
}
```

### 5.2 unpause() — external onlyOwner

```solidity
function unpause() external onlyOwner {
    _unpause();
}
```

### 5.3 isPaused() — external view

```solidity
function isPaused() external view returns (bool) {
    return paused();
}
```

## 6. Pause 시나리오

### 6.1 정상 Pause 흐름

```
1. Owner가 pause() 호출
   ↓
2. _paused = true
   ↓
3. Paused(owner) 이벤트 emit
   ↓
4. 이후 모든 whenNotPaused 함수 revert
```

### 6.2 Unpause 흐름

```
1. Owner가 unpause() 호출
   ↓
2. _paused = false
   ↓
3. Unpaused(owner) 이벤트 emit
   ↓
4. 모든 함수 정상 동작
```

### 6.3 Pause 중 사용자 행동

| 사용자 행동 | 가능 여부 | 설명 |
|-------------|-----------|------|
| 티켓 구매 | X | revert "Pausable: paused" |
| 라운드 종료 | X | revert "Pausable: paused" |
| 당첨자 추첨 | X | revert "Pausable: paused" |
| 환불 청구 | O | claimRefund는 whenNotPaused 미적용 |
| 미수령금 인출 | O | withdrawPending은 whenNotPaused 미적용 |
| 라운드 조회 | O | View 함수 |
| 당첨 내역 조회 | O | View 함수 |

## 7. 에러 케이스

| Error | 시나리오 | 대응 |
|-------|----------|------|
| "Pausable: paused" | Pause 상태에서 whenNotPaused 함수 호출 | revert |
| "Pausable: not paused" | Unpause 상태에서 unpause() 호출 | revert |
| Ownable: caller is not the owner | non-owner가 pause/unpause 호출 | revert |

## 8. 이벤트

```solidity
// OpenZeppelin Pausable에서 제공
event Paused(address account);
event Unpaused(address account);
```

## 9. 보안 고려사항

### 9.1 Owner 권한 관리
- Owner 개인키 탈취 시 전체 서비스 중단 가능
- 권장: 운영용 지갑은 HSM 또는 멀티시그 사용

### 9.2 Pause 남용 방지
- Pause는 긴급 상황에만 사용
- 커뮤니티에 사전/사후 공지 권장

### 9.3 v2 업그레이드 경로
- TimelockController + Multisig로 권한 분산
- 예: 24시간 지연 + 3/5 멀티시그

```solidity
// v2 예시
contract MetaLottoV2 is AccessControl, Pausable {
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }
}
```

## 10. 테스트 시나리오

### 10.1 기본 동작
- pause() 호출 시 _paused = true
- unpause() 호출 시 _paused = false
- Paused, Unpaused 이벤트 emit

### 10.2 함수 차단
- Pause 상태에서 buyTickets() → revert
- Pause 상태에서 closeRound() → revert
- Pause 상태에서 drawWinner() → revert

### 10.3 함수 허용
- Pause 상태에서 claimRefund() → 성공
- Pause 상태에서 withdrawPending() → 성공
- Pause 상태에서 getCurrentRound() → 성공

### 10.4 권한
- non-owner가 pause() → revert
- non-owner가 unpause() → revert

## 11. 영향 범위

### 수정 필요 파일
- `contracts/src/MetaLotto.sol`

### 신규 생성 파일
- `contracts/test/MetaLottoPause.t.sol` (비상 정지 테스트)

## 12. OpenZeppelin 버전

```toml
# foundry.toml
[dependencies]
openzeppelin = "5.0.0"
```

```solidity
// OpenZeppelin v5.x
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
```

## 변경 이력
| 날짜 | 변경 내용 | 이유 |
|------|----------|------|
| 2026-03-13 | 초기 작성 | M1 마일스톤 시작 |
