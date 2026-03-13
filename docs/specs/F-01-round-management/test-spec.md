# F-01 라운드 관리 — 테스트 명세

## 참조
- 설계서: docs/specs/F-01-round-management/design.md
- 인수조건: docs/project/features.md #F-01

## 단위 테스트

| 대상 | 시나리오 | 입력 | 예상 결과 |
|------|----------|------|-----------|
| constructor | 정상 배포 | 유효한 파라미터 | 첫 라운드가 Open 상태로 생성됨, currentRoundId == 1 |
| constructor | 0x0 펀드 주소 | communityFund = address(0) | revert `InvalidAddress()` |
| constructor | 0 티켓 가격 | ticketPrice = 0 | revert `InvalidParameter()` |
| constructor | 0 라운드 기간 | roundDuration = 0 | revert `InvalidParameter()` |
| _startNewRound | 새 라운드 시작 | currentRoundId = 1 | roundId = 2, status = Open, startBlock 설정 |
| _startNewRound | endTimestamp 계산 | roundDuration = 21600 | endTimestamp = block.timestamp + 21600 |
| closeRound | 정상 종료 | Open 상태, endTimestamp 도달, ticketCount >= minTickets | status = Closing, drawBlock 설정 |
| closeRound | 판매 종료 전 | block.timestamp < endTimestamp | revert `SaleNotEnded()` |
| closeRound | Open 상태 아님 | status = Closing | revert `RoundNotOpen()` |
| closeRound | 최소 티켓 미달 | ticketCount = 1, minTickets = 2 | status = Cancelled, RoundCancelled 이벤트 emit |
| closeRound | 최소 티켓 충족 | ticketCount = 2, minTickets = 2 | status = Closing |
| forceCloseDraw | 정상 실행 | Closing 상태, block.number > drawBlock + 256 | 새 drawBlock = block.number + drawDelay |
| forceCloseDraw | Closing 상태 아님 | status = Open | revert `RoundNotClosing()` |
| forceCloseDraw | 256블록 미경과 | block.number <= drawBlock + 256 | revert `DrawBlockNotReached()` |
| forceCloseDraw | Owner만 호출 | non-owner 호출 | revert (Ownable) |
| getTimeRemaining | 진행 중 | endTimestamp 미도달 | endTimestamp - block.timestamp 반환 |
| getTimeRemaining | 종료됨 | endTimestamp 도달 | 0 반환 |
| getTimeRemaining | Open 상태 아님 | status = Closing | 0 반환 |
| getCurrentRound | 정상 조회 | currentRoundId = 1 | Round struct 반환 |
| getRound | 존재하는 라운드 | roundId = 1 | Round struct 반환 |
| getRound | 존재하지 않는 라운드 | roundId = 999 | 빈 Round struct 반환 (모든 필드 기본값) |

## 통합 테스트

| 시나리오 | 단계 | 예상 결과 |
|----------|------|-----------|
| 전체 라운드 라이프사이클 | 1. 배포 → 2. 티켓 구매 → 3. closeRound → 4. drawWinner | Completed → 새 Open 라운드 자동 시작 |
| 최소 티켓 미달 취소 | 1. 배포 → 2. 티켓 1장 구매 → 3. closeRound | status = Cancelled, 새 Open 라운드 시작 |
| 256블록 초과 복구 | 1. closeRound → 2. 256블록 대기 → 3. forceCloseDraw | 새 drawBlock 설정됨 |

## 경계 조건 / 에러 케이스

- **endTimestamp 경계**: `block.timestamp == endTimestamp`일 때 closeRound() 호출 → 성공 (>= 조건)
- **drawDelay 경계**: `drawDelay = 1`일 때 drawBlock = block.number + 1
- **minTickets 경계**: `minTickets = 1`, `ticketCount = 1`일 때 → Closing 상태로 전이 (취소되지 않음)
- **라운드 ID 오버플로우**: `currentRoundId = type(uint256).max`일 때 `_startNewRound()` → overflow revert (Solidity 0.8.x)

## Fuzz 테스트

| 대상 | 전략 | 검증 항목 |
|------|------|-----------|
| _startNewRound | roundDuration: 1 ~ 7 days | endTimestamp = block.timestamp + roundDuration |
| closeRound | ticketCount: 0 ~ 1000, minTickets: 1 ~ 10 | ticketCount < minTickets → Cancelled, otherwise → Closing |

## Invariant 테스트

| Invariant | 설명 |
|-----------|------|
| `currentRoundId > 0` | 항상 활성 라운드 존재 |
| `rounds[currentRoundId].status != Completed` | 현재 라운드는 완료 상태가 아님 |
| `rounds[currentRoundId].roundId == currentRoundId` | 라운드 ID 일관성 |
