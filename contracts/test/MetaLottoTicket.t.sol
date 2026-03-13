// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test, Vm} from "forge-std/Test.sol";
import {MetaLotto} from "../src/MetaLotto.sol";

/**
 * F-03: 티켓 구매 기능 테스트
 * RED Phase - 실패하는 테스트 작성
 */
contract MetaLottoTicketTest is Test {
    // 컨트랙트
    MetaLotto public metalotto;

    // 테스트 계정
    address public owner;
    address public user1;
    address public user2;
    address public user3;
    address public communityFund;
    address public operationFund;

    // 환불 실패용 컨트랙트 (receive() 없음)
    address public refundFailContract;

    // 라운드 상수
    uint256 public constant ROUND_DURATION = 6 hours;
    uint256 public constant MIN_TICKETS_PER_ROUND = 2;
    uint256 public constant TICKET_PRICE = 100 ether;
    uint256 public constant DRAW_DELAY = 1;

    function setUp() public {
        owner = address(this);
        user1 = address(0x1);
        user2 = address(0x2);
        user3 = address(0x3);
        communityFund = address(0x4);
        operationFund = address(0x5);

        vm.deal(user1, 10000 ether);
        vm.deal(user2, 10000 ether);
        vm.deal(user3, 10000 ether);

        // 환불 실패용 컨트랙트 배포
        refundFailContract = address(new RefundFailContract());

        // 컨트랙트 배포
        metalotto = new MetaLotto(
            communityFund,
            operationFund,
            TICKET_PRICE,
            ROUND_DURATION,
            DRAW_DELAY,
            MIN_TICKETS_PER_ROUND
        );
    }

    // ============================================
    // 단위 테스트: buyTickets (정상 구매)
    // ============================================

    /**
     * 1장 구매 (정확한 금액)
     */
    function test_BuyTickets_Single_ExactAmount() public {
        uint256 balanceBefore = user1.balance;
        uint256 roundTicketsBefore = metalotto.getRoundTicketCount(1);

        vm.prank(user1);
        metalotto.buyTickets{value: TICKET_PRICE}(1);

        assertEq(metalotto.getRoundTicketCount(1), roundTicketsBefore + 1, unicode"라운드 티켓 수 1 증가");

        MetaLotto.Round memory round = metalotto.getRound(1);
        assertEq(round.totalPool, TICKET_PRICE, unicode"풀 금액은 티켓 가격");
        assertEq(round.ticketCount, 1, unicode"티켓 수 1");
        assertEq(user1.balance, balanceBefore - TICKET_PRICE, unicode"사용자 잔액 차감");
    }

    /**
     * 1장 구매 (초과금 있음)
     */
    function test_BuyTickets_Single_ExcessAmount() public {
        uint256 excess = 50 ether;
        uint256 balanceBefore = user1.balance;

        vm.prank(user1);
        metalotto.buyTickets{value: TICKET_PRICE + excess}(1);

        MetaLotto.Round memory round = metalotto.getRound(1);
        assertEq(round.totalPool, TICKET_PRICE, unicode"풀 금액은 티켓 가격만큼만 증가");
        assertEq(user1.balance, balanceBefore - TICKET_PRICE, unicode"티켓 가격만큼만 차감");
    }

    /**
     * N장 구매
     */
    function test_BuyTickets_MultipleTickets() public {
        uint256 count = 10;
        uint256 totalCost = TICKET_PRICE * count;
        uint256 balanceBefore = user1.balance;

        vm.prank(user1);
        metalotto.buyTickets{value: totalCost}(count);

        assertEq(metalotto.getRoundTicketCount(1), count, unicode"라운드 티켓 수");
        assertEq(user1.balance, balanceBefore - totalCost, unicode"사용자 잔액 차감");

        MetaLotto.Round memory round = metalotto.getRound(1);
        assertEq(round.totalPool, totalCost, unicode"풀 금액");
        assertEq(round.ticketCount, count, unicode"티켓 수");
    }

    /**
     * 100장 구매 (최대)
     */
    function test_BuyTickets_MaxTickets() public {
        uint256 maxTickets = 100;
        uint256 totalCost = TICKET_PRICE * maxTickets;
        uint256 balanceBefore = user1.balance;

        vm.prank(user1);
        metalotto.buyTickets{value: totalCost}(maxTickets);

        assertEq(metalotto.getRoundTicketCount(1), maxTickets, unicode"라운드 티켓 수");
        assertEq(user1.balance, balanceBefore - totalCost, unicode"사용자 잔액 차감");

        MetaLotto.Round memory round = metalotto.getRound(1);
        assertEq(round.totalPool, totalCost, unicode"풀 금액");
    }

    // ============================================
    // 단위 테스트: buyTickets (에러 케이스)
    // ============================================

    /**
     * 0장 구매 실패
     */
    function test_BuyTickets_ZeroCount() public {
        vm.prank(user1);
        vm.expectRevert(abi.encodeWithSelector(MetaLotto.InvalidTicketCount.selector));
        metalotto.buyTickets{value: TICKET_PRICE}(0);
    }

    /**
     * 101장 구매 실패 (초과)
     */
    function test_BuyTickets_ExceedsMax() public {
        uint256 count = 101;
        uint256 totalCost = TICKET_PRICE * count;

        vm.deal(user1, totalCost);

        vm.prank(user1);
        vm.expectRevert(abi.encodeWithSelector(MetaLotto.InvalidTicketCount.selector));
        metalotto.buyTickets{value: totalCost}(count);
    }

    /**
     * 금액 부족 (1 wei 부족)
     */
    function test_BuyTickets_InsufficientPayment_1Wei() public {
        vm.prank(user1);
        vm.expectRevert(abi.encodeWithSelector(MetaLotto.InsufficientPayment.selector));
        metalotto.buyTickets{value: TICKET_PRICE - 1}(1);
    }

    /**
     * 금액 부족 (50% 부족)
     */
    function test_BuyTickets_InsufficientPayment_Half() public {
        vm.prank(user1);
        vm.expectRevert(abi.encodeWithSelector(MetaLotto.InsufficientPayment.selector));
        metalotto.buyTickets{value: TICKET_PRICE / 2}(1);
    }

    /**
     * 금액 정확히 부족 (2장 구매 시 1장 가격만 전송)
     */
    function test_BuyTickets_InsufficientPayment_Exact() public {
        uint256 count = 2;
        uint256 totalCost = TICKET_PRICE * count;
        uint256 insufficientAmount = TICKET_PRICE; // 1장 가격만 전송

        vm.prank(user1);
        vm.expectRevert(abi.encodeWithSelector(MetaLotto.InsufficientPayment.selector));
        metalotto.buyTickets{value: insufficientAmount}(count);
    }

    /**
     * Open 상태 아님 (Closing 상태)
     */
    function test_BuyTickets_RoundNotOpen_Closing() public {
        // 라운드 종료
        vm.prank(user1);
        metalotto.buyTickets{value: TICKET_PRICE}(1);
        vm.prank(user2);
        metalotto.buyTickets{value: TICKET_PRICE}(1);

        vm.warp(block.timestamp + ROUND_DURATION + 1);
        vm.prank(owner);
        metalotto.closeRound();

        // Closing 상태에서 구매 시도
        vm.prank(user1);
        vm.expectRevert(abi.encodeWithSelector(MetaLotto.RoundNotOpen.selector));
        metalotto.buyTickets{value: TICKET_PRICE}(1);
    }

    /**
     * Open 상태 아님 (Completed 상태)
     */
    function test_BuyTickets_RoundNotOpen_Completed() public {
        // 라운드 완료
        vm.prank(user1);
        metalotto.buyTickets{value: TICKET_PRICE}(1);
        vm.prank(user2);
        metalotto.buyTickets{value: TICKET_PRICE}(1);

        vm.warp(block.timestamp + ROUND_DURATION + 1);
        vm.prank(owner);
        metalotto.closeRound();

        MetaLotto.Round memory round = metalotto.getRound(1);
        vm.roll(round.drawBlock + DRAW_DELAY + 1);
        vm.prank(owner);
        metalotto.drawWinner();

        // Completed 상태에서 구매 시도 (새 라운드 구매 가능)
        vm.prank(user1);
        metalotto.buyTickets{value: TICKET_PRICE}(1); // 라운드 2에 구매
    }

    /**
     * Open 상태 아님 (Cancelled 상태)
     */
    function test_BuyTickets_RoundNotOpen_Cancelled() public {
        // 라운드 취소 (최소 티켓 미달)
        vm.prank(user1);
        metalotto.buyTickets{value: TICKET_PRICE}(1);

        vm.warp(block.timestamp + ROUND_DURATION + 1);
        vm.prank(owner);
        metalotto.closeRound();

        // Cancelled 상태에서 구매 시도 (새 라운드 구매 가능)
        vm.prank(user1);
        metalotto.buyTickets{value: TICKET_PRICE}(1); // 라운드 2에 구매
    }

    /**
     * Pause 상태
     */
    function test_BuyTickets_WhenPaused() public {
        vm.prank(owner);
        metalotto.pause();

        vm.prank(user1);
        vm.expectRevert();
        metalotto.buyTickets{value: TICKET_PRICE}(1);
    }

    /**
     * 환불 실패 (receive() 없는 컨트랙트)
     */
    function test_BuyTickets_RefundFail() public {
        uint256 excess = 50 ether;

        vm.deal(refundFailContract, TICKET_PRICE + excess);

        vm.prank(refundFailContract);
        vm.expectRevert(abi.encodeWithSelector(MetaLotto.TransferFailed.selector));
        metalotto.buyTickets{value: TICKET_PRICE + excess}(1);
    }

    // ============================================
    // 통합 테스트: 다중 사용자 구매
    // ============================================

    /**
     * 여러 사용자 구매
     */
    function test_BuyTickets_MultipleUsers() public {
        // user1 3장 구매
        vm.prank(user1);
        metalotto.buyTickets{value: TICKET_PRICE * 3}(3);

        // user2 5장 구매
        vm.prank(user2);
        metalotto.buyTickets{value: TICKET_PRICE * 5}(5);

        // user3 2장 구매
        vm.prank(user3);
        metalotto.buyTickets{value: TICKET_PRICE * 2}(2);

        // 총 티켓 수 확인
        assertEq(metalotto.getRoundTicketCount(1), 10, unicode"총 10장");

        // 각 사용자 티켓 수 확인
        vm.prank(user1);
        assertEq(metalotto.getMyTickets(1), 3, unicode"user1 3장");
        vm.prank(user2);
        assertEq(metalotto.getMyTickets(1), 5, unicode"user2 5장");
        vm.prank(user3);
        assertEq(metalotto.getMyTickets(1), 2, unicode"user3 2장");
    }

    /**
     * 연속 구매 (같은 사용자)
     */
    function test_BuyTickets_Consecutive() public {
        // 1회: 1장 구매
        vm.prank(user1);
        metalotto.buyTickets{value: TICKET_PRICE}(1);
        vm.prank(user1);
        assertEq(metalotto.getMyTickets(1), 1, unicode"1회 후 1장");

        // 2회: 2장 구매
        vm.prank(user1);
        metalotto.buyTickets{value: TICKET_PRICE * 2}(2);
        vm.prank(user1);
        assertEq(metalotto.getMyTickets(1), 3, unicode"2회 후 3장");

        // 3회: 3장 구매
        vm.prank(user1);
        metalotto.buyTickets{value: TICKET_PRICE * 3}(3);
        vm.prank(user1);
        assertEq(metalotto.getMyTickets(1), 6, unicode"3회 후 6장");
    }

    /**
     * 가격 변경 후 구매
     */
    function test_BuyTickets_AfterPriceChange() public {
        // 첫 번째 구매 (100 META)
        vm.prank(user1);
        metalotto.buyTickets{value: TICKET_PRICE}(1);

        // 가격 변경
        uint256 newPrice = 200 ether;
        vm.prank(owner);
        metalotto.setTicketPrice(newPrice);

        // 두 번째 구매 (200 META)
        vm.prank(user2);
        metalotto.buyTickets{value: newPrice}(1);

        MetaLotto.Round memory round = metalotto.getRound(1);
        assertEq(round.totalPool, TICKET_PRICE + newPrice, unicode"풀 금액 합산");
    }

    /**
     * 라운드 전환 후 구매
     */
    function test_BuyTickets_RoundTransition() public {
        // 라운드 1 구매
        vm.prank(user1);
        metalotto.buyTickets{value: TICKET_PRICE}(1);
        vm.prank(user2);
        metalotto.buyTickets{value: TICKET_PRICE}(1);

        // 라운드 1 종료
        vm.warp(block.timestamp + ROUND_DURATION + 1);
        vm.prank(owner);
        metalotto.closeRound();

        MetaLotto.Round memory round = metalotto.getRound(1);
        vm.roll(round.drawBlock + DRAW_DELAY + 1);
        vm.prank(owner);
        metalotto.drawWinner();

        // 라운드 2 구매 (새 라운드는 drawWinner 후 자동 시작됨)
        vm.prank(user1);
        metalotto.buyTickets{value: TICKET_PRICE * 2}(2);
        vm.prank(user3);
        metalotto.buyTickets{value: TICKET_PRICE}(1);

        // 라운드별 티켓 수 확인
        assertEq(metalotto.getRoundTicketCount(1), 2, unicode"라운드 1: 2장");
        assertEq(metalotto.getRoundTicketCount(2), 3, unicode"라운드 2: 3장");

        vm.prank(user1);
        assertEq(metalotto.getMyTickets(1), 1, unicode"user1 라운드 1: 1장");
        vm.prank(user1);
        assertEq(metalotto.getMyTickets(2), 2, unicode"user1 라운드 2: 2장");
    }

    // ============================================
    // 경계 조건 테스트
    // ============================================

    /**
     * msg.value == totalCost (초과금 없음)
     */
    function test_BuyTickets_NoExcess() public {
        uint256 totalCost = TICKET_PRICE * 5;
        uint256 balanceBefore = user1.balance;

        vm.prank(user1);
        metalotto.buyTickets{value: totalCost}(5);

        assertEq(user1.balance, balanceBefore - totalCost, unicode"초과금 없음");
    }

    /**
     * msg.value == totalCost + 1 wei (1 wei 환불)
     */
    function test_BuyTickets_1WeiExcess() public {
        uint256 totalCost = TICKET_PRICE * 5;
        uint256 balanceBefore = user1.balance;

        vm.prank(user1);
        metalotto.buyTickets{value: totalCost + 1}(5);

        assertEq(user1.balance, balanceBefore - totalCost, unicode"1 wei 환불");
    }

    /**
     * _count == 1 (최소 구매 수량)
     */
    function test_BuyTickets_MinCount() public {
        vm.prank(user1);
        metalotto.buyTickets{value: TICKET_PRICE}(1);

        vm.prank(user1);
        assertEq(metalotto.getMyTickets(1), 1, unicode"1장 구매 성공");
    }

    /**
     * _count == 100 (최대 구매 수량)
     */
    function test_BuyTickets_MaxCount() public {
        uint256 totalCost = TICKET_PRICE * 100;

        vm.prank(user1);
        metalotto.buyTickets{value: totalCost}(100);

        vm.prank(user1);
        assertEq(metalotto.getMyTickets(1), 100, unicode"100장 구매 성공");
    }

    /**
     * ticketPrice == 1 wei (극소 가격)
     */
    function test_BuyTickets_MinPrice() public {
        // 새 컨트랙트 배포 (최소 가격 1 wei)
        MetaLotto smallPriceLotto = new MetaLotto(
            communityFund,
            operationFund,
            1 wei,
            ROUND_DURATION,
            DRAW_DELAY,
            MIN_TICKETS_PER_ROUND
        );

        vm.prank(user1);
        smallPriceLotto.buyTickets{value: 100}(100);

        assertEq(smallPriceLotto.getRoundTicketCount(1), 100, unicode"극소 가격 구매 성공");
    }

    /**
     * ticketPrice * 100 (오버플로우 없음)
     */
    function test_BuyTickets_NoOverflow() public {
        uint256 maxPrice = 1e18; // 1e18 wei = 1 META
        uint256 maxCount = 100;
        uint256 totalCost = maxPrice * maxCount;

        // 새 컨트랙트 배포
        MetaLotto highPriceLotto = new MetaLotto(
            communityFund,
            operationFund,
            maxPrice,
            ROUND_DURATION,
            DRAW_DELAY,
            MIN_TICKETS_PER_ROUND
        );

        vm.prank(user1);
        highPriceLotto.buyTickets{value: totalCost}(maxCount);

        assertEq(highPriceLotto.getRoundTicketCount(1), maxCount, unicode"오버플로우 없음");
    }

    // ============================================
    // View 함수 테스트
    // ============================================

    /**
     * getRoundTicketCount: 티켓 있음
     */
    function test_GetRoundTicketCount_WithTickets() public {
        vm.prank(user1);
        metalotto.buyTickets{value: TICKET_PRICE * 5}(5);

        assertEq(metalotto.getRoundTicketCount(1), 5, unicode"5장 반환");
    }

    /**
     * getRoundTicketCount: 티켓 없음
     */
    function test_GetRoundTicketCount_NoTickets() public {
        assertEq(metalotto.getRoundTicketCount(1), 0, unicode"0 반환");
    }

    /**
     * getRoundTicketCount: 존재하지 않는 라운드
     */
    function test_GetRoundTicketCount_NonExistent() public {
        assertEq(metalotto.getRoundTicketCount(999), 0, unicode"존재하지 않는 라운드는 0");
    }

    /**
     * getMyTickets: 내 티켓 조회
     */
    function test_GetMyTickets_WithTickets() public {
        vm.prank(user1);
        metalotto.buyTickets{value: TICKET_PRICE * 3}(3);

        vm.prank(user1);
        assertEq(metalotto.getMyTickets(1), 3, unicode"3장 반환");
    }

    /**
     * getMyTickets: 티켓 없음
     */
    function test_GetMyTickets_NoTickets() public {
        vm.prank(user1);
        assertEq(metalotto.getMyTickets(1), 0, unicode"0 반환");
    }

    /**
     * getTicketBuyer: 유효한 인덱스
     */
    function test_GetTicketBuyer_ValidIndex() public {
        vm.prank(user1);
        metalotto.buyTickets{value: TICKET_PRICE * 3}(3);

        address buyer = metalotto.getTicketBuyer(1, 0);
        assertEq(buyer, user1, unicode"티켓 0 구매자는 user1");

        buyer = metalotto.getTicketBuyer(1, 1);
        assertEq(buyer, user1, unicode"티켓 1 구매자는 user1");

        buyer = metalotto.getTicketBuyer(1, 2);
        assertEq(buyer, user1, unicode"티켓 2 구매자는 user1");
    }

    /**
     * getTicketBuyer: 유효하지 않은 인덱스
     */
    function test_GetTicketBuyer_InvalidIndex() public {
        vm.prank(user1);
        metalotto.buyTickets{value: TICKET_PRICE}(1);

        vm.expectRevert();
        metalotto.getTicketBuyer(1, 999);
    }

    // ============================================
    // Admin 함수 테스트
    // ============================================

    /**
     * setTicketPrice: 가격 변경
     */
    function test_SetTicketPrice() public {
        uint256 newPrice = 200 ether;

        vm.prank(owner);
        metalotto.setTicketPrice(newPrice);

        assertEq(metalotto.ticketPrice(), newPrice, unicode"가격 변경됨");
    }

    /**
     * setTicketPrice: 0 가격 설정 실패
     */
    function test_SetTicketPrice_Zero() public {
        vm.prank(owner);
        vm.expectRevert(abi.encodeWithSelector(MetaLotto.InvalidParameter.selector));
        metalotto.setTicketPrice(0);
    }

    /**
     * setTicketPrice: Owner만 호출 가능
     */
    function test_SetTicketPrice_OnlyOwner() public {
        vm.prank(user1);
        vm.expectRevert();
        metalotto.setTicketPrice(200 ether);
    }

    // ============================================
    // 이벤트 테스트
    // ============================================

    /**
     * TicketPurchased 이벤트 발생
     */
    function test_Event_TicketPurchased() public {
        uint256 count = 5;
        uint256 totalCost = TICKET_PRICE * count;
        uint256 currentRoundId = metalotto.getCurrentRound().roundId;

        vm.expectEmit(true, true, false, true);
        emit MetaLotto.TicketPurchased(currentRoundId, user1, count, totalCost);

        vm.prank(user1);
        metalotto.buyTickets{value: totalCost}(count);
    }

    /**
     * TicketPurchased 이벤트: 여러 사용자
     */
    function test_Event_TicketPurchased_MultipleUsers() public {
        uint256 currentRoundId = metalotto.getCurrentRound().roundId;

        vm.expectEmit(true, true, false, true);
        emit MetaLotto.TicketPurchased(currentRoundId, user1, 1, TICKET_PRICE);
        vm.prank(user1);
        metalotto.buyTickets{value: TICKET_PRICE}(1);

        vm.expectEmit(true, true, false, true);
        emit MetaLotto.TicketPurchased(currentRoundId, user2, 2, TICKET_PRICE * 2);
        vm.prank(user2);
        metalotto.buyTickets{value: TICKET_PRICE * 2}(2);
    }

    /**
     * ConfigUpdated 이벤트: ticketPrice 변경
     */
    function test_Event_ConfigUpdated() public {
        uint256 newPrice = 200 ether;

        vm.expectEmit(true, false, false, true);
        emit MetaLotto.ConfigUpdated("ticketPrice", TICKET_PRICE, newPrice);

        vm.prank(owner);
        metalotto.setTicketPrice(newPrice);
    }

    // ============================================
    // Fuzz 테스트
    // ============================================

    /**
     * Fuzz: buyTickets (수량 1~100, 금액 totalCost~totalCost*10)
     */
    function testFuzz_BuyTickets(uint256 _count, uint256 _excessMultiplier) public {
        // 범위 제한: count 1~100, multiplier 0~10
        _count = bound(_count, 1, 100);
        _excessMultiplier = bound(_excessMultiplier, 0, 10);

        uint256 totalCost = TICKET_PRICE * _count;
        uint256 excess = totalCost * _excessMultiplier;
        uint256 totalValue = totalCost + excess;

        vm.deal(user1, totalValue);
        uint256 balanceBefore = user1.balance;

        vm.prank(user1);
        metalotto.buyTickets{value: totalValue}(_count);

        assertEq(metalotto.getRoundTicketCount(1), _count, unicode"티켓 수 일치");
        assertEq(user1.balance, balanceBefore - totalCost, unicode"초과금 환불 확인");

        MetaLotto.Round memory round = metalotto.getRound(1);
        assertEq(round.totalPool, totalCost, unicode"풀 금액 일치");
    }

    /**
     * Fuzz: totalCost 계산 (오버플로우 없음)
     */
    function testFuzz_TotalCost_NoOverflow(uint256 _ticketPrice, uint256 _count) public {
        // 범위 제한
        _ticketPrice = bound(_ticketPrice, 1, 1e24);
        _count = bound(_count, 1, 100);

        uint256 totalCost = _ticketPrice * _count;

        // 새 컨트랙트 배포
        MetaLotto fuzzLotto = new MetaLotto(
            communityFund,
            operationFund,
            _ticketPrice,
            ROUND_DURATION,
            DRAW_DELAY,
            MIN_TICKETS_PER_ROUND
        );

        vm.deal(user1, totalCost);

        vm.prank(user1);
        fuzzLotto.buyTickets{value: totalCost}(_count);

        assertEq(fuzzLotto.getRoundTicketCount(1), _count, unicode"오버플로우 없음");
    }

    // ============================================
    // Invariant 테스트
    // ============================================

    /**
     * Invariant: roundTickets.length == round.ticketCount
     */
    function test_Invariant_TicketCount() public {
        vm.prank(user1);
        metalotto.buyTickets{value: TICKET_PRICE}(1);

        MetaLotto.Round memory round = metalotto.getRound(1);
        uint256 ticketCountFromStorage = round.ticketCount;
        uint256 ticketCountFromArray = metalotto.getRoundTicketCount(1);

        assertEq(ticketCountFromStorage, ticketCountFromArray, unicode"티켓 수 일치");
    }

    /**
     * Invariant: sum(userTicketIndices) == round.ticketCount
     */
    function test_Invariant_UserTicketSum() public {
        vm.prank(user1);
        metalotto.buyTickets{value: TICKET_PRICE * 3}(3);
        vm.prank(user2);
        metalotto.buyTickets{value: TICKET_PRICE * 2}(2);
        vm.prank(user3);
        metalotto.buyTickets{value: TICKET_PRICE * 1}(1);

        MetaLotto.Round memory round = metalotto.getRound(1);
        assertEq(round.ticketCount, 6, unicode"총 6장");

        vm.prank(user1);
        assertEq(metalotto.getMyTickets(1), 3, unicode"user1 3장");
        vm.prank(user2);
        assertEq(metalotto.getMyTickets(1), 2, unicode"user2 2장");
        vm.prank(user3);
        assertEq(metalotto.getMyTickets(1), 1, unicode"user3 1장");
    }

    /**
     * Invariant: address(this).balance >= totalPool
     */
    function test_Invariant_ContractBalance() public {
        vm.prank(user1);
        metalotto.buyTickets{value: TICKET_PRICE * 10}(10);

        MetaLotto.Round memory round = metalotto.getRound(1);
        uint256 contractBalance = address(metalotto).balance;

        assertGe(contractBalance, round.totalPool, unicode"컨트랙트 잔액 >= 풀 금액");
    }

    /**
     * Invariant: seed 누적
     */
    function test_Invariant_SeedAccumulation() public {
        MetaLotto.Round memory round = metalotto.getRound(1);
        uint256 seed1 = round.seed;
        assertEq(seed1, 0, unicode"초기 seed 0");

        vm.prank(user1);
        metalotto.buyTickets{value: TICKET_PRICE}(1);

        round = metalotto.getRound(1);
        uint256 seed2 = round.seed;
        assertGt(seed2, 0, unicode"구매 후 seed 변경");
        assertNotEq(seed2, seed1, unicode"seed 다름");

        vm.prank(user2);
        metalotto.buyTickets{value: TICKET_PRICE}(1);

        round = metalotto.getRound(1);
        uint256 seed3 = round.seed;
        assertNotEq(seed3, seed2, unicode"추가 구매 후 seed 변경");
    }
}

/**
 * 환불 실패용 컨트랙트 (receive() 없음)
 */
contract RefundFailContract {
    constructor() {}

    // receive() 없음 -> 환불 실패
}
