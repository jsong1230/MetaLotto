# F-02 Blockhash 난수 생성 — 테스트 명세

## 참조
- 설계서: docs/specs/F-02-randomness/design.md
- 인수조건: docs/project/features.md #F-02

## 단위 테스트

| 대상 | 시나리오 | 입력 | 예상 결과 |
|------|----------|------|-----------|
| _generateRandomness | 정상 생성 | 유효한 drawBlock, seed | 256비트 난수 반환 |
| _generateRandomness | blockhash 0 | drawBlock + 256 경과 | bytes32(0) 포함 → 여전히 난수 생성됨 |
| _selectWinner | 단일 티켓 | randomness = 123, ticketCount = 1 | winnerIndex = 0 |
| _selectWinner | 다수 티켓 | randomness = 123, ticketCount = 100 | winnerIndex = 123 % 100 = 23 |
| drawWinner | 정상 추첨 | Closing 상태, block.number > drawBlock | status = Completed, winner 설정됨 |
| drawWinner | Closing 상태 아님 | status = Open | revert `RoundNotClosing()` |
| drawWinner | 블록 미도달 | block.number <= drawBlock | revert `DrawBlockNotReached()` |
| drawWinner | 256블록 초과 | block.number > drawBlock + 256 | revert `DrawExpired()` |
| drawWinner | blockhash == 0 | blockhash(drawBlock) = bytes32(0) | revert `DrawExpired()` |
| forceCloseDraw | 정상 실행 | Closing, block.number > drawBlock + 256 | 새 drawBlock = block.number + drawDelay |
| forceCloseDraw | Closing 상태 아님 | status = Open | revert `RoundNotClosing()` |
| forceCloseDraw | 256블록 미경과 | block.number <= drawBlock + 256 | revert `DrawBlockNotReached()` |
| getDrawBlockRemaining | 대기 중 | block.number < drawBlock | 양수 반환 (남은 블록) |
| getDrawBlockRemaining | 추첨 가능 | drawBlock < block.number <= drawBlock + 256 | 음수 반환 (지연 블록) |
| getDrawBlockRemaining | 만료 | block.number > drawBlock + 256 | -256 반환 |
| getDrawBlockRemaining | Closing 상태 아님 | status = Open | -1 반환 |

## 통합 테스트

| 시나리오 | 단계 | 예상 결과 |
|----------|------|-----------|
| 전체 난수 생성 흐름 | 1. 티켓 구매 (seed 누적) → 2. closeRound → 3. 블록 진행 → 4. drawWinner | 유효한 당첨자 선정 |
| 3개 블록 해시 조합 | 동일한 seed, 다른 drawBlock | 서로 다른 난수 생성 |
| Seed 누적 효과 | 여러 사용자가 티켓 구매 | 각 구매마다 seed 변경됨 |
| forceCloseDraw 후 재추첨 | 1. closeRound → 2. 256블록 대기 → 3. forceCloseDraw → 4. 블록 진행 → 5. drawWinner | 정상 추첨 완료 |

## 경계 조건 / 에러 케이스

- **drawBlock == block.number**: `drawWinner()` 호출 → revert `DrawBlockNotReached()` (> 조건)
- **drawBlock + 1 == block.number**: `drawWinner()` 호출 → 성공 (block.number > drawBlock)
- **drawBlock + 256 == block.number**: `drawWinner()` 호출 → 성공 (<= 조건)
- **drawBlock + 257 == block.number**: `drawWinner()` 호출 → revert `DrawExpired()`
- **seed == 0**: 티켓 구매 없이 추첨 → 3개 blockhash만으로 난수 생성 (정상 동작)
- **단일 티켓**: ticketCount = 1 → winnerIndex = 0 (항상 첫 번째 구매자 당첨)

## Fuzz 테스트

| 대상 | 전략 | 검증 항목 |
|------|------|-----------|
| _selectWinner | randomness: 0 ~ type(uint256).max, ticketCount: 1 ~ 1000 | winnerIndex < ticketCount |
| _generateRandomness | 다양한 seed, drawBlock 조합 | 반환값이 0이 아님, 동일 입력 → 동일 출력 |

## 분포 테스트 (Fuzz)

| 대상 | 전략 | 검증 항목 |
|------|------|-----------|
| 당첨자 분포 | 1000회 추첨, 10명 참여자 | 각 참여자 당첨 확률 ~10% (±2%) |
| 티켓 구매 순서 영향 | 무작위 순서로 100회 구매, 1000회 추첨 | 구매 순서와 당첨 확률 무관 |

## Invariant 테스트

| Invariant | 설명 |
|-----------|------|
| `_selectWinner 결과 < ticketCount` | 항상 유효한 인덱스 반환 |
| `_generateRandomness != 0` (높은 확률) | 3개 blockhash + seed 조합으로 0 생성 확률 극히 낮음 |
| `drawWinner 후 winner != address(0)` | 당첨자는 항상 유효한 주소 |

## Foundry 테스트 코드 예시

```solidity
// test/MetaLottoRandomness.t.sol
function test_DrawWinner_Success() public {
    // Setup
    _startNewRound();
    _buyTickets(user1, 1);
    vm.warp(block.timestamp + ROUND_DURATION + 1);

    // Close round
    metalotto.closeRound();

    // Advance blocks past drawBlock
    vm.roll(block.number + DRAW_DELAY + 1);

    // Draw winner
    metalotto.drawWinner();

    // Assert
    (, RoundStatus status,,, , , , address winner, , ) = metalotto.getCurrentRound();
    assertEq(uint256(status), uint256(RoundStatus.Completed));
    assertEq(winner, user1);
}

function test_DrawWinner_Expired() public {
    // Setup
    _startNewRound();
    _buyTickets(user1, 1);
    vm.warp(block.timestamp + ROUND_DURATION + 1);
    metalotto.closeRound();

    // Advance 257 blocks past drawBlock
    vm.roll(block.number + DRAW_DELAY + 257);

    // Expect revert
    vm.expectRevert(abi.encodeWithSignature("DrawExpired()"));
    metalotto.drawWinner();
}

function testFuzz_SelectWinner(uint256 randomness, uint256 ticketCount) public {
    vm.assume(ticketCount > 0);
    vm.assume(ticketCount <= 1000);

    uint256 winnerIndex = randomness % ticketCount;

    assertLt(winnerIndex, ticketCount);
}
```
