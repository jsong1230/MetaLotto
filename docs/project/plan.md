# MetaLotto — 구현 계획서

## 참조
- 설계서: docs/specs/*/design.md
- 인수조건: docs/project/features.md
- 시스템 설계: docs/system/system-design.md
- 로드맵: docs/project/roadmap.md

## PM 추천: 다음 기능
- 모드: 병렬
- 추천 기능: F-01 라운드 관리, F-08 비상 정지
- 근거: 두 기능 모두 의존성이 없으며 상호 의존성이 없음. F-01은 M1의 핵심 기능으로 다른 기능들의 기반이 되고, F-08은 보안 기능으로 별도 개발 가능.
- 마일스톤: M1 (0/7 완료)
- 마일스톤 완료 여부: No

---

## Phase 1: F-01 라운드 관리 구현

### Phase 1.1: 스마트 컨트랙트 기본 구조

- [ ] [contract] MetaLotto.sol 기본 구조 생성
  - [ ] OpenZeppelin 상속 설정 (Ownable, Pausable, ReentrancyGuard)
  - [ ] RoundStatus enum 정의
  - [ ] Round struct 정의
  - [ ] 상태 변수 초기 설정 (currentRoundId, rounds 매핑, roundDuration, drawDelay, minTicketsPerRound)

- [ ] [contract] constructor 구현
  - [ ] 펀드 주소 검증 (communityFund, operationFund)
  - [ ] 설정값 검증 (ticketPrice, roundDuration, drawDelay, minTickets)
  - [ ] 기본값 설정 및 저장
  - [ ] 첫 라운드 자동 시작 (_startNewRound 호출)

### Phase 1.2: 라운드 관리 함수 구현

- [ ] [contract] _startNewRound() internal 함수 구현
  - [ ] currentRoundId 증분
  - [ ] 새 라운드 초기화 (status=Open, startBlock, endTimestamp 설정)
  - [ ] RoundStarted 이벤트 emit

- [ ] [contract] closeRound() external 함수 구현
  - [ ] 라운드 상태 검증 (Open)
  - [ ] 시간 검증 (endTimestamp 도달)
  - [ ] 최소 티켓 수 확인 및 분기 처리
  - [ ] [최소 티켓 미달] Cancelled 상태 전이 + RoundCancelled 이벤트 + 새 라운드 시작
  - [ ] [정상 종료] Closing 상태 전이 + drawBlock 설정 + RoundClosing 이벤트

- [ ] [contract] forceCloseDraw() external onlyOwner 함수 구현
  - [ ] 상태 검증 (Closing)
  - [ ] drawBlock + 256블록 경과 확인
  - [ ] 새로운 drawBlock 설정
  - [ ] ConfigUpdated 이벤트 emit

### Phase 1.3: View 함수 구현

- [ ] [contract] getCurrentRound() external view 함수 구현
- [ ] [contract] getRound(uint256 _roundId) external view 함수 구현
- [ ] [contract] getTimeRemaining() external view 함수 구현

### Phase 1.4: 에러 정의

- [ ] [contract] Custom Error 정의
  - [ ] RoundNotOpen
  - [ ] SaleNotEnded
  - [ ] RoundNotClosing
  - [ ] DrawBlockNotReached
  - [ ] InvalidAddress
  - [ ] InvalidParameter

### Phase 1.5: 이벤트 정의

- [ ] [contract] 이벤트 정의
  - [ ] RoundStarted
  - [ ] RoundClosing
  - [ ] RoundCancelled
  - [ ] ConfigUpdated

### Phase 1.6: 테스트 작성

- [ ] [test] MetaLottoRound.t.sol 테스트 파일 생성
- [ ] [test] constructor 테스트 (정상 배포, 0x0 펀드 주소, 0 티켓 가격, 0 라운드 기간)
- [ ] [test] _startNewRound 테스트 (새 라운드 시작, endTimestamp 계산)
- [ ] [test] closeRound 테스트 (정상 종료, 판매 종료 전, Open 상태 아님, 최소 티켓 미달, 최소 티켓 충족)
- [ ] [test] forceCloseDraw 테스트 (정상 실행, Closing 상태 아님, 256블록 미경과, Owner만 호출)
- [ ] [test] View 함수 테스트 (getTimeRemaining, getCurrentRound, getRound)
- [ ] [test] 통합 테스트 (전체 라운드 라이프사이클, 최소 티켓 미달 취소, 256블록 초과 복구)
- [ ] [test] Fuzz 테스트 (_startNewRound roundDuration, closeRound ticketCount)
- [ ] [test] Invariant 테스트 (currentRoundId > 0, status != Completed, 라운드 ID 일관성)

---

## Phase 2: F-08 비상 정지 구현

### Phase 2.1: Pausable 상속 및 기본 함수 구현

- [ ] [contract] OpenZeppelin Pausable 상속 확인 (MetaLotto.sol)
- [ ] [contract] pause() external onlyOwner 함수 구현
  - [ ] _pause() 호출
- [ ] [contract] unpause() external onlyOwner 함수 구현
  - [ ] _unpause() 호출
- [ ] [contract] isPaused() external view 함수 구현
  - [ ] paused() 반환

### Phase 2.2: whenNotPaused modifier 적용

- [ ] [contract] buyTickets()에 whenNotPaused modifier 추가
- [ ] [contract] closeRound()에 whenNotPaused modifier 추가
- [ ] [contract] drawWinner()에 whenNotPaused modifier 추가

### Phase 2.3: Pause 적용 범위 검증

- [ ] [contract] claimRefund()에 whenNotPaused 미적용 확인 (환불은 pause 중 가능)
- [ ] [contract] withdrawPending()에 whenNotPaused 미적용 확인 (인출은 pause 중 가능)
- [ ] [contract] forceCloseDraw()에 whenNotPaused 미적용 확인 (복구 작업은 pause 중 가능)
- [ ] [contract] 모든 View 함수에 whenNotPaused 미적용 확인 (조회는 항상 가능)

### Phase 2.4: 테스트 작성

- [ ] [test] MetaLottoPause.t.sol 테스트 파일 생성
- [ ] [test] pause 테스트 (Owner 호출, non-owner 호출, 이미 Pause 상태)
- [ ] [test] unpause 테스트 (Owner 호출, non-owner 호출, Unpause 상태)
- [ ] [test] isPaused 테스트 (Pause 상태, Unpause 상태)
- [ ] [test] whenNotPaused 함수 테스트 (buyTickets, closeRound, drawWinner가 Pause 상태에서 revert)
- [ ] [test] Pause 영향 없는 함수 테스트 (claimRefund, withdrawPending, forceCloseDraw, View 함수)
- [ ] [test] 통합 테스트 (Pause → Unpause → 정상 동작, Pause 중 환불, Pause 중 인출, Pause 중 라운드 조회, 긴급 상황 시뮬레이션)
- [ ] [test] 이벤트 검증 (Paused, Unpaused)
- [ ] [test] 권한 테스트 (OnlyOwner_CanPause)

---

## Phase 3: 통합 및 검증

### Phase 3.1: 이벤트 로그 통합 (F-07 부분)

- [ ] [contract] 이벤트 정의 확인 (F-07 참조)
  - [ ] RoundStarted, RoundClosing, RoundCancelled (F-01)
  - [ ] Paused, Unpaused (F-08)

### Phase 3.2: OpenZeppelin 의존성 설정

- [ ] [dependencies] foundry.toml에 OpenZeppelin v5.x 추가
  ```toml
  [dependencies]
  openzeppelin = "5.0.0"
  ```

- [ ] [dependencies] forge install OpenZeppelin/openzeppelin-contracts --no-commit 실행

### Phase 3.3: 통합 테스트

- [ ] [test] F-01과 F-08 통합 테스트
  - [ ] Pause 상태에서 라운드 관리 동작 확인
  - [ ] Unpause 후 라운드 정상 동작 확인

### Phase 3.4: 가스 최적화 검증

- [ ] [optimize] Round struct 패킹 검토 (가스 비용 절감)
- [ ] [optimize] 루프 내 storage 접근 최소화 확인

### Phase 3.5: Quality Gate 검증

- [ ] [security] ReentrancyGuard 적용 확인 (buyTickets, claimRefund)
- [ ] [security] Ownable 권한 검증 (pause, unpause, forceCloseDraw)
- [ ] [security] 상태 전이 로직 검증 (Open → Closing/Cancelled → Completed)
- [ ] [performance] 가스 비용 측정 및 최적화
- [ ] [code-review] Solidity 0.8.x 타입 안전성 확인
- [ ] [code-review] CEI 패턴 (Checks-Effects-Interactions) 준수 확인
- [ ] [documentation] NatSpec 주석 작성 확인

---

## 태스크 의존성

```
Phase 1 (F-01) ─────────────────────────┐
  ├─ Phase 1.1 (기본 구조)              │
  ├─ Phase 1.2 (라운드 관리 함수)       │
  ├─ Phase 1.3 (View 함수)             │
  ├─ Phase 1.4 (에러 정의)             │
  ├─ Phase 1.5 (이벤트 정의)           │
  └─ Phase 1.6 (테스트)                │
                                     │
Phase 2 (F-08) ─────────────────────────┤
  ├─ Phase 2.1 (Pausable 상속)         │
  ├─ Phase 2.2 (modifier 적용)         │
  ├─ Phase 2.3 (적용 범위 검증)        │
  └─ Phase 2.4 (테스트)              │
                                     │
Phase 3 (통합 및 검증) ◄────────────────┘
  ├─ Phase 3.1 (이벤트 로그 통합)
  ├─ Phase 3.2 (의존성 설정)
  ├─ Phase 3.3 (통합 테스트)
  ├─ Phase 3.4 (가스 최적화)
  └─ Phase 3.5 (Quality Gate)
```

## 병렬 실행 판단

- **Agent Team 권장**: Yes
- **근거**:
  1. **상호 의존성 없음**: F-01과 F-08은 서로 다른 기능 영역 (라운드 관리 vs 비상 정지)
  2. **충돌 영역 미겹침**:
     - F-01: Round struct, 라운드 상태 머신, closeRound/forceCloseDraw
     - F-08: OpenZeppelin Pausable 상속, pause/unpause 함수, whenNotPaused modifier
  3. **코드 수정 영역 분리**:
     - F-01: 라운드 관련 함수, View 함수
     - F-08: 보안 관련 함수, modifier 적용
  4. **같은 마일스톤 (M1)**, 최대 3개 기능 규칙 준수 (현재 2개)
  5. **병렬 개발 가능**: backend-dev 에이전트가 두 기능을 동시에 구현 가능

---

## 다음 단계

Phase 1과 Phase 2가 완료되면, 다음 기능들을 순차적으로 구현합니다:
- F-03 티켓 구매 (F-01 의존)
- F-02 Blockhash 난수 생성 (F-01 의존)
- F-04 상금 분배 (F-02 의존)
- F-05 자동 상금 지급 (F-04 의존)
- F-07 이벤트 로그 (F-01 의존)
- F-06 웹 프론트엔드 (F-01~F-05 의존)
