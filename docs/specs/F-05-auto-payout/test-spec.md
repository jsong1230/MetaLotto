# F-05 자동 상금 지급 — 테스트 명세

## 참조
- 설계서: docs/specs/F-05-auto-payout/design.md
- 인수조건: docs/project/features.md #F-05

## 단위 테스트

| 대상 | 시나리오 | 입력 | 예상 결과 |
|------|----------|------|-----------|
| _sendPrize | 송금 성공 | 정상적인 EOA 주소 | PrizeTransferSuccess 이벤트, 잔액 증가 |
| _sendPrize | 송금 실패 (컨트랙트) | receive() 없는 컨트랙트 | pendingWithdrawals 증가, PrizeTransferFailed 이벤트 |
| withdrawPending | 정상 인출 | pendingWithdrawals = 100 META | 0으로 초기화, 100 META 수신, WithdrawalClaimed 이벤트 |
| withdrawPending | 인출할 금액 없음 | pendingWithdrawals = 0 | revert `NoPendingWithdrawal()` |
| withdrawPending | 송금 실패 | 실패하는 주소 | revert `TransferFailed()` |
| getPendingWithdrawal | 금액 있음 | user = 0x123 | pendingWithdrawals[user] 반환 |
| getPendingWithdrawal | 금액 없음 | user = 0x456 | 0 반환 |

## 통합 테스트

| 시나리오 | 단계 | 예상 결과 |
|----------|------|-----------|
| 정상 자동 지급 | 1. 티켓 구매 → 2. closeRound → 3. drawWinner | 당첨자에게 직접 송금 성공 |
| 실패 후 인출 | 1. 컨트랙트를 당첨자로 설정 → 2. drawWinner → 3. withdrawPending | pendingWithdrawals에 저장 후 인출 성공 |
| 누적 인출 | 1. 라운드1 실패 → 2. 라운드2 실패 → 3. withdrawPending | 두 금액 합쳐서 한 번에 인출 |

## 경계 조건 / 에러 케이스

- **당첨자가 컨트랙트**: receive() 함수 없음 → pendingWithdrawals에 저장
- **당첨자가 컨트랙트**: receive() 함수 있음 → 정상 송금
- **pendingWithdrawals = 0**: withdrawPending() 호출 → revert `NoPendingWithdrawal()`
- **withdrawPending 중 송금 실패**: revert `TransferFailed()`, 상태 복원 여부 확인

## Fuzz 테스트

| 대상 | 전략 | 검증 항목 |
|------|------|-----------|
| _sendPrize | amount: 1 wei ~ 1e30 | 성공/실패와 무관하게 금액 보존 |
| withdrawPending | amount: 1 wei ~ 1e30 | 인출 후 잔액 정확 |

## Invariant 테스트

| Invariant | 설명 |
|-----------|------|
| `당첨자가 받은 금액 + pendingWithdrawals == winnerPrize` | 금액 손실 없음 |
| `sum(pendingWithdrawals) <= address(this).balance` | 미수령금이 컨트랙트 잔액 이하 |

## Foundry 테스트 코드 예시

```solidity
// test/MetaLottoPayout.t.sol
function test_SendPrize_Success() public {
    _startNewRound();
    _buyTickets(user1, 1);

    vm.warp(block.timestamp + ROUND_DURATION + 1);
    metalotto.closeRound();

    vm.roll(block.number + DRAW_DELAY + 1);

    uint256 balanceBefore = user1.balance;

    metalotto.drawWinner();

    // 당첨자가 직접 수령
    assertGt(user1.balance, balanceBefore);
    assertEq(metalotto.getPendingWithdrawal(user1), 0);
}

function test_SendPrize_Failed_Then_Withdraw() public {
    // 받을 수 없는 컨트랙트 배포
    NoReceiveContract noReceive = new NoReceiveContract();

    _startNewRound();

    // 컨트랙트가 티켓 구매
    vm.deal(address(noReceive), 1000 ether);
    vm.prank(address(noReceive));
    metalotto.buyTickets{value: 100 ether}(1);

    vm.warp(block.timestamp + ROUND_DURATION + 1);
    metalotto.closeRound();

    vm.roll(block.number + DRAW_DELAY + 1);

    // drawWinner: 송금 실패 → pendingWithdrawals에 저장
    metalotto.drawWinner();

    uint256 pending = metalotto.getPendingWithdrawal(address(noReceive));
    assertGt(pending, 0);

    // withdrawPending: 인출
    uint256 contractBalanceBefore = address(noReceive).balance;
    vm.prank(address(noReceive));
    metalotto.withdrawPending();

    assertEq(metalotto.getPendingWithdrawal(address(noReceive)), 0);
    assertEq(address(noReceive).balance, contractBalanceBefore + pending);
}

function test_WithdrawPending_NoAmount() public {
    vm.prank(user1);
    vm.expectRevert(abi.encodeWithSignature("NoPendingWithdrawal()"));
    metalotto.withdrawPending();
}

// 받을 수 없는 컨트랙트
contract NoReceiveContract {
    // receive() 함수 없음 → ETH 수신 불가
}
```

## E2E 시나리오

| 시나리오 | 단계 | 검증 항목 |
|----------|------|-----------|
| 당첨자 자동 지급 전체 흐름 | 1. 지갑 연결 → 2. 티켓 구매 → 3. 라운드 종료 → 4. 당첨 확인 | 당첨 시 즉시 잔액 증가 |
| 미수령금 인출 흐름 | 1. 당첨 (송금 실패) → 2. "미수령금 인출" 버튼 클릭 → 3. 트랜잭션 완료 | 인출 후 잔액 증가 |
