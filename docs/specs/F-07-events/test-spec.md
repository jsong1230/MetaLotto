# F-07 이벤트 로그 — 테스트 명세

## 참조
- 설계서: docs/specs/F-07-events/design.md
- 인수조건: docs/project/features.md #F-07

## 단위 테스트

| 대상 | 시나리오 | 예상 이벤트 |
|------|----------|-------------|
| _startNewRound | 새 라운드 시작 | RoundStarted(roundId, startBlock, endTimestamp, ticketPrice) |
| buyTickets | 1장 구매 | TicketPurchased(roundId, buyer, 1, ticketPrice) |
| buyTickets | 10장 구매 | TicketPurchased(roundId, buyer, 10, ticketPrice * 10) |
| closeRound | 정상 종료 | RoundClosing(roundId, drawBlock, totalPool, totalTickets) |
| closeRound | 최소 티켓 미달 | RoundCancelled(roundId, totalPool, ticketCount) |
| drawWinner | 당첨자 선정 + 송금 성공 | WinnerDrawn, PrizeDistributed, PrizeTransferSuccess |
| drawWinner | 당첨자 선정 + 송금 실패 | WinnerDrawn, PrizeDistributed, PrizeTransferFailed |
| forceCloseDraw | drawBlock 재설정 | ConfigUpdated("drawBlock", oldBlock, newBlock) |
| claimRefund | 환불 | RefundClaimed(roundId, buyer, amount) |
| withdrawPending | 인출 | WithdrawalClaimed(user, amount) |
| setTicketPrice | 가격 변경 | ConfigUpdated("ticketPrice", oldPrice, newPrice) |
| setRoundDuration | 기간 변경 | ConfigUpdated("roundDuration", oldDuration, newDuration) |
| setDrawDelay | 지연 블록 변경 | ConfigUpdated("drawDelay", oldDelay, newDelay) |
| setMinTickets | 최소 티켓 변경 | ConfigUpdated("minTickets", oldMin, newMin) |
| setCommunityFund | 펀드 주소 변경 | FundAddressUpdated("communityFund", oldAddr, newAddr) |
| setOperationFund | 펀드 주소 변경 | FundAddressUpdated("operationFund", oldAddr, newAddr) |
| pause | 일시 정지 | Paused(account) |
| unpause | 재개 | Unpaused(account) |

## 이벤트 파라미터 검증

| 이벤트 | 파라미터 | 검증 항목 |
|--------|----------|-----------|
| RoundStarted | roundId | currentRoundId와 일치 |
| RoundStarted | startBlock | block.number와 일치 |
| RoundStarted | endTimestamp | block.timestamp + roundDuration과 일치 |
| RoundStarted | ticketPrice | ticketPrice 상태 변수와 일치 |
| TicketPurchased | roundId | 현재 라운드 ID |
| TicketPurchased | buyer | msg.sender |
| TicketPurchased | ticketCount | 구매한 티켓 수 |
| TicketPurchased | totalCost | ticketPrice * ticketCount |
| RoundClosing | roundId | 현재 라운드 ID |
| RoundClosing | drawBlock | block.number + drawDelay |
| RoundClosing | totalPool | round.totalPool |
| RoundClosing | totalTickets | round.ticketCount |
| WinnerDrawn | roundId | 현재 라운드 ID |
| WinnerDrawn | winner | round.winner |
| WinnerDrawn | winnerPrize | round.winnerPrize |
| WinnerDrawn | communityAmount | (totalPool * 500) / 10000 |
| WinnerDrawn | operationAmount | totalPool - winnerPrize - communityAmount |

## indexed 필드 필터링 테스트

| 이벤트 | 필터 조건 | 예상 결과 |
|--------|----------|-----------|
| TicketPurchased | roundId = 1 | 라운드 1의 모든 구매 이벤트 |
| TicketPurchased | buyer = 0xUser1 | User1의 모든 구매 이벤트 |
| TicketPurchased | roundId = 1, buyer = 0xUser1 | 라운드 1에서 User1의 구매 이벤트 |
| WinnerDrawn | roundId = 1 | 라운드 1의 당첨자 이벤트 |
| WinnerDrawn | winner = 0xUser1 | User1의 당첨 이벤트 |

## 통합 테스트

| 시나리오 | 단계 | 예상 이벤트 순서 |
|----------|------|-----------------|
| 전체 라운드 라이프사이클 | 배포 → 구매 → 종료 → 추첨 | RoundStarted → TicketPurchased → RoundClosing → WinnerDrawn → PrizeDistributed → PrizeTransferSuccess → RoundStarted(새 라운드) |
| 취소된 라운드 | 배포 → 구매(1장) → 종료 | RoundStarted → TicketPurchased → RoundCancelled → RoundStarted(새 라운드) |
| 환불 흐름 | 취소된 라운드 → 환불 | RoundCancelled → RefundClaimed |
| 미수령금 인출 | 송금 실패 → 인출 | PrizeTransferFailed → WithdrawalClaimed |

## Foundry 테스트 코드 예시

```solidity
// test/MetaLottoEvents.t.sol
function test_Event_RoundStarted() public {
    vm.expectEmit(true, false, false, true);
    emit RoundStarted(1, block.number, block.timestamp + ROUND_DURATION, TICKET_PRICE);

    _startNewRound();
}

function test_Event_TicketPurchased() public {
    _startNewRound();

    vm.deal(user1, 1000 ether);

    vm.expectEmit(true, true, false, true);
    emit TicketPurchased(1, user1, 1, TICKET_PRICE);

    vm.prank(user1);
    metalotto.buyTickets{value: TICKET_PRICE}(1);
}

function test_Event_RoundClosing() public {
    _startNewRound();
    _buyTickets(user1, 2);

    vm.warp(block.timestamp + ROUND_DURATION + 1);

    uint256 expectedDrawBlock = block.number + DRAW_DELAY;

    vm.expectEmit(true, false, false, true);
    emit RoundClosing(1, expectedDrawBlock, TICKET_PRICE * 2, 2);

    metalotto.closeRound();
}

function test_Event_WinnerDrawn() public {
    _startNewRound();
    _buyTickets(user1, 1);

    vm.warp(block.timestamp + ROUND_DURATION + 1);
    metalotto.closeRound();

    vm.roll(block.number + DRAW_DELAY + 1);

    vm.expectEmit(true, true, false, true);
    emit WinnerDrawn(1, user1, 90 ether, 5 ether, 5 ether);

    metalotto.drawWinner();
}

function test_Event_MultipleTickets() public {
    _startNewRound();

    vm.deal(user1, 1000 ether);

    vm.expectEmit(true, true, false, true);
    emit TicketPurchased(1, user1, 10, TICKET_PRICE * 10);

    vm.prank(user1);
    metalotto.buyTickets{value: TICKET_PRICE * 10}(10);
}
```

## 이벤트 순서 검증

```solidity
function test_EventSequence_FullRound() public {
    // 1. RoundStarted
    vm.expectEmit(true, false, false, true);
    emit RoundStarted(1, block.number, block.timestamp + ROUND_DURATION, TICKET_PRICE);
    _startNewRound();

    // 2. TicketPurchased
    vm.deal(user1, 1000 ether);
    vm.expectEmit(true, true, false, true);
    emit TicketPurchased(1, user1, 1, TICKET_PRICE);
    vm.prank(user1);
    metalotto.buyTickets{value: TICKET_PRICE}(1);

    // 3. RoundClosing
    vm.warp(block.timestamp + ROUND_DURATION + 1);
    vm.expectEmit(true, false, false, true);
    emit RoundClosing(1, block.number + DRAW_DELAY, TICKET_PRICE, 1);
    metalotto.closeRound();

    // 4. WinnerDrawn + PrizeDistributed + PrizeTransferSuccess
    vm.roll(block.number + DRAW_DELAY + 1);

    vm.expectEmit(true, true, false, true);
    emit PrizeDistributed(1, user1, 90 ether, 5 ether, 5 ether);

    vm.expectEmit(true, false, false, true);
    emit PrizeTransferSuccess(user1, 90 ether);

    vm.expectEmit(true, true, false, true);
    emit WinnerDrawn(1, user1, 90 ether, 5 ether, 5 ether);

    metalotto.drawWinner();

    // 5. RoundStarted (새 라운드)
    vm.expectEmit(true, false, false, true);
    emit RoundStarted(2, block.number, block.timestamp + ROUND_DURATION, TICKET_PRICE);
    // drawWinner 내부에서 _startNewRound 호출됨
}
```
