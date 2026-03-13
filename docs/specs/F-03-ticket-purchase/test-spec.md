# F-03 티켓 구매 — 테스트 명세

## 참조
- 설계서: docs/specs/F-03-ticket-purchase/design.md
- 인수조건: docs/project/features.md #F-03

## 단위 테스트

| 대상 | 시나리오 | 입력 | 예상 결과 |
|------|----------|------|-----------|
| buyTickets | 1장 구매 (정확한 금액) | _count=1, msg.value=100 META | 티켓 발급, totalPool += 100 META |
| buyTickets | 1장 구매 (초과금 있음) | _count=1, msg.value=150 META | 티켓 발급, 50 META 환불 |
| buyTickets | N장 구매 | _count=10, msg.value=1000 META | 티켓 10장 발급 |
| buyTickets | 100장 구매 | _count=100, msg.value=10000 META | 티켓 100장 발급 |
| buyTickets | 0장 구매 | _count=0 | revert `InvalidTicketCount()` |
| buyTickets | 101장 구매 | _count=101 | revert `InvalidTicketCount()` |
| buyTickets | 금액 부족 | _count=1, msg.value=50 META | revert `InsufficientPayment()` |
| buyTickets | 금액 정확히 부족 | _count=2, msg.value=100 META (1장 가격) | revert `InsufficientPayment()` |
| buyTickets | Open 상태 아님 | status = Closing | revert `RoundNotOpen()` |
| buyTickets | Pause 상태 | paused = true | revert (Pausable) |
| buyTickets | 환불 실패 | receive()이 없는 컨트랙트, 초과금 있음 | revert `TransferFailed()` |
| getRoundTicketCount | 티켓 있음 | roundId = 1, ticketCount = 5 | 5 반환 |
| getRoundTicketCount | 티켓 없음 | roundId = 999 | 0 반환 |
| getMyTickets | 내 티켓 조회 | user가 3장 구매 | 3 반환 |
| getMyTickets | 티켓 없음 | user가 구매하지 않음 | 0 반환 |
| getTicketBuyer | 유효한 인덱스 | ticketIndex = 0 | 구매자 주소 반환 |
| getTicketBuyer | 유효하지 않은 인덱스 | ticketIndex = 999 | revert `InvalidTicketCount()` |
| getUserTickets | 내 티켓 상세 조회 | user가 3장 구매 | Ticket[3] 반환 |
| setTicketPrice | 가격 변경 | newPrice = 200 META | ticketPrice = 200 META, ConfigUpdated 이벤트 |
| setTicketPrice | 0 가격 설정 | newPrice = 0 | revert `InvalidParameter()` |
| setTicketPrice | Owner만 호출 | non-owner 호출 | revert (Ownable) |

## 통합 테스트

| 시나리오 | 단계 | 예상 결과 |
|----------|------|-----------|
| 다중 사용자 구매 | 1. user1 3장 구매 → 2. user2 5장 구매 → 3. user3 2장 구매 | 총 10장, 각자 getMyTickets로 조회 가능 |
| 연속 구매 | 같은 사용자가 3회 연속 구매 (1, 2, 3장) | 총 6장, getUserTickets로 6개 반환 |
| 가격 변경 후 구매 | 1. 100 META로 구매 → 2. setTicketPrice(200) → 3. 200 META로 구매 | 두 번째 구매는 200 META로 처리 |
| 라운드 전환 | 1. 라운드1 구매 → 2. closeRound → 3. drawWinner → 4. 라운드2 구매 | 라운드별로 독립적인 티켓 관리 |

## 경계 조건 / 에러 케이스

- **msg.value == totalCost**: 초과금 없음, 환불 없이 정상 처리
- **msg.value == totalCost + 1 wei**: 1 wei 환불
- **_count == 1**: 최소 구매 수량, 정상 처리
- **_count == 100**: 최대 구매 수량, 정상 처리
- **ticketPrice == 1 wei**: 극소 가격, 정상 처리 (overflow 없음)
- **ticketPrice * 100**: 오버플로우 없음 (Solidity 0.8.x)

## 가스 비용 테스트

| 구매 수량 | 예상 가스 범위 | 비고 |
|-----------|----------------|------|
| 1장 | 70,000 ~ 90,000 | 기준 |
| 10장 | 200,000 ~ 300,000 | 선형 증가 |
| 50장 | 800,000 ~ 1,000,000 | |
| 100장 | 1,800,000 ~ 2,200,000 | 블록 가스 한도 내 |

## Fuzz 테스트

| 대상 | 전략 | 검증 항목 |
|------|------|-----------|
| buyTickets | _count: 1 ~ 100, msg.value: totalCost ~ totalCost * 10 | 티켓 발급, 초과금 환불 |
| totalCost 계산 | ticketPrice: 1 ~ 1e24, _count: 1 ~ 100 | overflow 없음 (Solidity 0.8.x) |

## Invariant 테스트

| Invariant | 설명 |
|-----------|------|
| `roundTickets[roundId].length == round.ticketCount` | 티켓 수 일관성 |
| `sum(userTicketIndices[roundId][*]) == round.ticketCount` | 사용자별 티켓 합계 일관성 |
| `address(this).balance >= totalPool` | 컨트랙트 잔액 >= 풀 금액 |

## Foundry 테스트 코드 예시

```solidity
// test/MetaLottoTicket.t.sol
function test_BuyTickets_Single() public {
    _startNewRound();

    uint256 ticketPrice = metalotto.ticketPrice();

    vm.deal(user1, ticketPrice);
    vm.prank(user1);

    metalotto.buyTickets{value: ticketPrice}(1);

    assertEq(metalotto.getRoundTicketCount(1), 1);
    assertEq(metalotto.getMyTickets(1), 1);
}

function test_BuyTickets_Multiple() public {
    _startNewRound();

    uint256 ticketPrice = metalotto.ticketPrice();
    uint256 count = 10;
    uint256 totalCost = ticketPrice * count;

    vm.deal(user1, totalCost);
    vm.prank(user1);

    metalotto.buyTickets{value: totalCost}(count);

    assertEq(metalotto.getRoundTicketCount(1), count);
    assertEq(metalotto.getMyTickets(1), count);
}

function test_BuyTickets_RefundExcess() public {
    _startNewRound();

    uint256 ticketPrice = metalotto.ticketPrice();
    uint256 excess = 50 ether;

    vm.deal(user1, ticketPrice + excess);
    uint256 balanceBefore = user1.balance;

    vm.prank(user1);
    metalotto.buyTickets{value: ticketPrice + excess}(1);

    assertEq(user1.balance, balanceBefore - ticketPrice);
}

function test_BuyTickets_InsufficientPayment() public {
    _startNewRound();

    uint256 ticketPrice = metalotto.ticketPrice();

    vm.deal(user1, ticketPrice - 1);
    vm.prank(user1);

    vm.expectRevert(abi.encodeWithSignature("InsufficientPayment()"));
    metalotto.buyTickets{value: ticketPrice - 1}(1);
}

function test_BuyTickets_InvalidCount() public {
    _startNewRound();

    vm.deal(user1, 1000 ether);

    vm.prank(user1);
    vm.expectRevert(abi.encodeWithSignature("InvalidTicketCount()"));
    metalotto.buyTickets{value: 1000 ether}(0);

    vm.prank(user1);
    vm.expectRevert(abi.encodeWithSignature("InvalidTicketCount()"));
    metalotto.buyTickets{value: 1000 ether}(101);
}
```
