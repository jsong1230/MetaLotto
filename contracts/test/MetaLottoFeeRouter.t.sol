// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Test} from "forge-std/Test.sol";
import {MetaLottoFeeRouter} from "../src/MetaLottoFeeRouter.sol";

/// @notice FeeDistributor mock — depositFee/receive로 들어온 값 기록
contract MockFeeDistributor {
    uint256 public totalReceived;
    uint256 public depositCalls;

    function depositFee() external payable {
        totalReceived += msg.value;
        depositCalls += 1;
    }

    receive() external payable {
        totalReceived += msg.value;
    }
}

/// @notice depositFee가 revert하는 mock (실패 경로용) — 여기선 미사용, 확장 여지
contract MetaLottoFeeRouterTest is Test {
    MockFeeDistributor fd;
    MetaLottoFeeRouter router;

    address metaLotto = address(0xA0); // MetaLotto 분배 주체 대역
    address keeper = address(0xC0);

    event Received(address indexed from, uint256 amount);
    event Forwarded(address indexed caller, uint256 amount, uint256 totalForwarded);

    function setUp() public {
        fd = new MockFeeDistributor();
        router = new MetaLottoFeeRouter(address(fd));
        vm.deal(metaLotto, 100 ether);
    }

    function test_RevertWhen_ConstructorZeroAddress() public {
        vm.expectRevert(MetaLottoFeeRouter.ZeroAddress.selector);
        new MetaLottoFeeRouter(address(0));
    }

    function test_ReceivePayout_EmitsAndHolds() public {
        vm.expectEmit(true, false, false, true, address(router));
        emit Received(metaLotto, 5 ether);
        vm.prank(metaLotto);
        (bool ok,) = address(router).call{value: 5 ether}("");
        assertTrue(ok);
        assertEq(router.pending(), 5 ether);
        assertEq(address(router).balance, 5 ether);
    }

    function test_Flush_ForwardsToFeeDistributor() public {
        vm.prank(metaLotto);
        (bool ok,) = address(router).call{value: 5 ether}("");
        assertTrue(ok);

        vm.expectEmit(true, false, false, true, address(router));
        emit Forwarded(keeper, 5 ether, 5 ether);
        vm.prank(keeper);
        uint256 amount = router.flush();

        assertEq(amount, 5 ether);
        assertEq(address(fd).balance, 5 ether);
        assertEq(fd.totalReceived(), 5 ether);
        assertEq(fd.depositCalls(), 1);
        assertEq(router.totalForwarded(), 5 ether);
        assertEq(router.pending(), 0);
    }

    function test_Flush_AggregatesMultiplePayouts() public {
        vm.startPrank(metaLotto);
        (bool a,) = address(router).call{value: 3 ether}("");
        (bool b,) = address(router).call{value: 2 ether}("");
        vm.stopPrank();
        assertTrue(a && b);
        assertEq(router.pending(), 5 ether);

        router.flush();
        assertEq(fd.totalReceived(), 5 ether);
        assertEq(fd.depositCalls(), 1);
        assertEq(router.totalForwarded(), 5 ether);
    }

    function test_RevertWhen_FlushWithNothing() public {
        vm.expectRevert(MetaLottoFeeRouter.NothingToForward.selector);
        router.flush();
    }

    function test_FlushIsPermissionless() public {
        vm.prank(metaLotto);
        (bool ok,) = address(router).call{value: 1 ether}("");
        assertTrue(ok);
        // 임의 주소가 호출 가능 (자금은 FeeDistributor로만 흐름)
        vm.prank(address(0xDEAD));
        router.flush();
        assertEq(fd.totalReceived(), 1 ether);
    }

    function test_MultipleFlushCyclesAccumulateTotal() public {
        vm.startPrank(metaLotto);
        (bool a,) = address(router).call{value: 4 ether}("");
        vm.stopPrank();
        assertTrue(a);
        router.flush();

        vm.prank(metaLotto);
        (bool b,) = address(router).call{value: 6 ether}("");
        assertTrue(b);
        router.flush();

        assertEq(router.totalForwarded(), 10 ether);
        assertEq(fd.totalReceived(), 10 ether);
        assertEq(fd.depositCalls(), 2);
    }
}
