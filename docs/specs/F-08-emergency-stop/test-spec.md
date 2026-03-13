# F-08 비상 정지 — 테스트 명세

## 참조
- 설계서: docs/specs/F-08-emergency-stop/design.md
- 인수조건: docs/project/features.md #F-08

## 단위 테스트

| 대상 | 시나리오 | 입력 | 예상 결과 |
|------|----------|------|-----------|
| pause | Owner 호출 | - | _paused = true, Paused 이벤트 |
| pause | non-owner 호출 | user1 호출 | revert (Ownable) |
| pause | 이미 Pause 상태 | pause() 2회 연속 | revert "Pausable: not paused" |
| unpause | Owner 호출 | - | _paused = false, Unpaused 이벤트 |
| unpause | non-owner 호출 | user1 호출 | revert (Ownable) |
| unpause | Unpause 상태 | unpause() 2회 연속 | revert "Pausable: paused" |
| isPaused | Pause 상태 | pause() 후 호출 | true 반환 |
| isPaused | Unpause 상태 | unpause() 후 호출 | false 반환 |
| paused | View 함수 | - | OpenZeppelin 제공 함수 |

## whenNotPaused 함수 테스트

| 함수 | Pause 상태에서 호출 | 예상 결과 |
|------|---------------------|-----------|
| buyTickets() | O | revert "Pausable: paused" |
| closeRound() | O | revert "Pausable: paused" |
| drawWinner() | O | revert "Pausable: paused" |

## Pause 영향 없는 함수 테스트

| 함수 | Pause 상태에서 호출 | 예상 결과 |
|------|---------------------|-----------|
| claimRefund() | O | 정상 실행 (환불 완료) |
| withdrawPending() | O | 정상 실행 (인출 완료) |
| forceCloseDraw() | O | 정상 실행 (drawBlock 재설정) |
| getCurrentRound() | O | 정상 조회 |
| getRound() | O | 정상 조회 |
| getMyTickets() | O | 정상 조회 |
| getRoundTicketCount() | O | 정상 조회 |
| getTimeRemaining() | O | 정상 조회 |
| getPendingWithdrawal() | O | 정상 조회 |

## 통합 테스트

| 시나리오 | 단계 | 예상 결과 |
|----------|------|-----------|
| Pause → Unpause → 정상 동작 | 1. pause → 2. unpause → 3. buyTickets | 정상 구매 |
| Pause 중 환불 | 1. 취소된 라운드 → 2. pause → 3. claimRefund | 환불 성공 |
| Pause 중 인출 | 1. 미수령금 발생 → 2. pause → 3. withdrawPending | 인출 성공 |
| Pause 중 라운드 조회 | 1. pause → 2. getCurrentRound | 정상 조회 |
| 긴급 상황 시뮬레이션 | 1. 구매 진행 → 2. 이상 감지 → 3. pause → 4. 조치 → 5. unpause | 서비스 재개 |

## 경계 조건 / 에러 케이스

- **이미 Pause 상태에서 pause()**: revert "Pausable: not paused"
- **Unpause 상태에서 unpause()**: revert "Pausable: paused"
- **non-owner가 pause()**: revert (Ownable: caller is not the owner)
- **non-owner가 unpause()**: revert (Ownable: caller is not the owner)

## 이벤트 검증

| 이벤트 | 파라미터 | 검증 항목 |
|--------|----------|-----------|
| Paused | account | msg.sender (owner) |
| Unpaused | account | msg.sender (owner) |

## Foundry 테스트 코드 예시

```solidity
// test/MetaLottoPause.t.sol
function test_Pause_Success() public {
    vm.expectEmit(true, false, false, true);
    emit Paused(owner);

    vm.prank(owner);
    metalotto.pause();

    assertTrue(metalotto.paused());
}

function test_Pause_NonOwner() public {
    vm.prank(user1);
    vm.expectRevert(abi.encodeWithSignature("OwnableUnauthorizedAccount(address)", user1));
    metalotto.pause();
}

function test_Pause_AlreadyPaused() public {
    vm.prank(owner);
    metalotto.pause();

    vm.prank(owner);
    vm.expectRevert("Pausable: not paused");
    metalotto.pause();
}

function test_Unpause_Success() public {
    vm.prank(owner);
    metalotto.pause();

    vm.expectEmit(true, false, false, true);
    emit Unpaused(owner);

    vm.prank(owner);
    metalotto.unpause();

    assertFalse(metalotto.paused());
}

function test_BuyTickets_WhenPaused() public {
    _startNewRound();

    vm.prank(owner);
    metalotto.pause();

    vm.deal(user1, 1000 ether);
    vm.prank(user1);
    vm.expectRevert("Pausable: paused");
    metalotto.buyTickets{value: 100 ether}(1);
}

function test_ClaimRefund_WhenPaused() public {
    _startNewRound();
    _buyTickets(user1, 1);

    // 라운드 취소
    vm.warp(block.timestamp + ROUND_DURATION + 1);
    metalotto.closeRound();  // 최소 티켓 미달로 취소

    // Pause
    vm.prank(owner);
    metalotto.pause();

    // 환불 (Pause 상태에서도 가능)
    vm.prank(user1);
    metalotto.claimRefund(1);

    assertEq(user1.balance, 100 ether);
}

function test_WithdrawPending_WhenPaused() public {
    // 미수령금 발생 시나리오
    _setupPendingWithdrawal(user1, 90 ether);

    // Pause
    vm.prank(owner);
    metalotto.pause();

    // 인출 (Pause 상태에서도 가능)
    uint256 balanceBefore = user1.balance;
    vm.prank(user1);
    metalotto.withdrawPending();

    assertEq(user1.balance, balanceBefore + 90 ether);
}

function test_GetCurrentRound_WhenPaused() public {
    _startNewRound();

    vm.prank(owner);
    metalotto.pause();

    // View 함수는 정상 동작
    (uint256 roundId,,,,,,,) = metalotto.getCurrentRound();
    assertEq(roundId, 1);
}

function test_FullPauseCycle() public {
    // 1. 라운드 시작
    _startNewRound();

    // 2. 티켓 구매
    _buyTickets(user1, 1);

    // 3. Pause
    vm.prank(owner);
    metalotto.pause();

    // 4. 구매 시도 → 실패
    vm.deal(user2, 1000 ether);
    vm.prank(user2);
    vm.expectRevert("Pausable: paused");
    metalotto.buyTickets{value: 100 ether}(1);

    // 5. Unpause
    vm.prank(owner);
    metalotto.unpause();

    // 6. 구매 시도 → 성공
    vm.prank(user2);
    metalotto.buyTickets{value: 100 ether}(1);

    assertEq(metalotto.getRoundTicketCount(1), 2);
}
```

## 권한 테스트

```solidity
function test_OnlyOwner_CanPause() public {
    address[] memory nonOwners = new address[](3);
    nonOwners[0] = user1;
    nonOwners[1] = user2;
    nonOwners[2] = address(0x123);

    for (uint256 i = 0; i < nonOwners.length; i++) {
        vm.prank(nonOwners[i]);
        vm.expectRevert();
        metalotto.pause();
    }

    vm.prank(owner);
    metalotto.pause();
    assertTrue(metalotto.paused());
}
```
