# F-04 상금 분배 — 테스트 명세

## 참조
- 설계서: docs/specs/F-04-prize-distribution/design.md
- 인수조건: docs/project/features.md #F-04

## 단위 테스트

| 대상 | 시나리오 | 입력 | 예상 결과 |
|------|----------|------|-----------|
| _calculateDistribution | 1000 META 풀 | totalPool = 1000e18 | winner=900e18, community=50e18, operation=50e18 |
| _calculateDistribution | 100 META 풀 | totalPool = 100e18 | winner=90e18, community=5e18, operation=5e18 |
| _calculateDistribution | 1001 META 풀 | totalPool = 1001e18 | winner=900e18, community=50e18, operation=51e18 |
| _calculateDistribution | 999 META 풀 | totalPool = 999e18 | winner=899e18, community=49e18, operation=51e18 |
| _calculateDistribution | 1 META 풀 | totalPool = 1e18 | winner=0, community=0, operation=1e18 |
| _calculateDistribution | 10 META 풀 | totalPool = 10e18 | winner=9e18, community=0, operation=1e18 |
| _calculateDistribution | 0 풀 | totalPool = 0 | revert `InvalidParameter()` |
| getDistribution | View 함수 | totalPool = 1000e18 | 위와 동일 |
| setCommunityFund | 정상 변경 | newFund = 0x123... | communityFund 변경, FundAddressUpdated 이벤트 |
| setCommunityFund | 0x0 주소 | newFund = address(0) | revert `InvalidAddress()` |
| setOperationFund | 정상 변경 | newFund = 0x456... | operationFund 변경, FundAddressUpdated 이벤트 |
| setOperationFund | 0x0 주소 | newFund = address(0) | revert `InvalidAddress()` |

## 통합 테스트

| 시나리오 | 단계 | 예상 결과 |
|----------|------|-----------|
| 정상 분배 | 1. 티켓 판매 → 2. closeRound → 3. drawWinner | 당첨자, 커뮤니티, 운영비 각각 수령 |
| 분배 후 잔액 | 분배 완료 후 컨트랙트 잔액 확인 | 0 (모든 금액 분배됨) |
| 펀드 주소 변경 | 1. setCommunityFund → 2. drawWinner | 새 주소로 커뮤니티 금액 송금 |

## 경계 조건 / 에러 케이스

- **totalPool = 1 wei**: winner=0, community=0, operation=1 (손실 없음)
- **totalPool = 10000 wei**: 정확한 분배 (9000, 500, 500)
- **totalPool = 9999 wei**: winner=8999, community=499, operation=501
- **커뮤니티 펀드 송금 실패**: revert `TransferFailed()` (전체 트랜잭션 롤백)
- **운영비 송금 실패**: revert `TransferFailed()`

## 반올림 처리 검증

| totalPool | winner (90%) | community (5%) | operation (5%+오차) | 합계 | 검증 |
|-----------|-------------|----------------|---------------------|------|------|
| 1000e18 | 900e18 | 50e18 | 50e18 | 1000e18 | OK |
| 1001e18 | 900.9e18 → 900e18 | 50.05e18 → 50e18 | 51e18 | 1001e18 | OK |
| 999e18 | 899.1e18 → 899e18 | 49.95e18 → 49e18 | 51e18 | 999e18 | OK |
| 1e18 | 0.9e18 → 0 | 0.05e18 → 0 | 1e18 | 1e18 | OK |
| 10e18 | 9e18 | 0.5e18 → 0 | 1e18 | 10e18 | OK |

## Fuzz 테스트

| 대상 | 전략 | 검증 항목 |
|------|------|-----------|
| _calculateDistribution | totalPool: 1 ~ 1e30 | winner + community + operation == totalPool |
| _calculateDistribution | totalPool: 1 ~ 1e30 | winner == (totalPool * 9000) / 10000 |

## Invariant 테스트

| Invariant | 설명 |
|-----------|------|
| `winner + community + operation == totalPool` | 분배 후 손실 없음 |
| `winner == (totalPool * WINNER_SHARE) / BASIS_POINTS` | 당첨자 비율 정확 |
| `community == (totalPool * COMMUNITY_SHARE) / BASIS_POINTS` | 커뮤니티 비율 정확 |
| `operation >= (totalPool * OPERATION_SHARE) / BASIS_POINTS` | 운영비는 최소 비율 이상 |

## Foundry 테스트 코드 예시

```solidity
// test/MetaLottoPrize.t.sol
function test_CalculateDistribution_1000META() public {
    uint256 totalPool = 1000 ether;

    (uint256 winner, uint256 community, uint256 operation) =
        metalotto.getDistribution(totalPool);

    assertEq(winner, 900 ether);
    assertEq(community, 50 ether);
    assertEq(operation, 50 ether);
    assertEq(winner + community + operation, totalPool);
}

function test_CalculateDistribution_Rounding() public {
    uint256 totalPool = 1001 ether;

    (uint256 winner, uint256 community, uint256 operation) =
        metalotto.getDistribution(totalPool);

    assertEq(winner, 900 ether);      // floor(900.9)
    assertEq(community, 50 ether);     // floor(50.05)
    assertEq(operation, 51 ether);     // 1001 - 900 - 50 = 51
    assertEq(winner + community + operation, totalPool);
}

function test_CalculateDistribution_SmallPool() public {
    uint256 totalPool = 1 ether;

    (uint256 winner, uint256 community, uint256 operation) =
        metalotto.getDistribution(totalPool);

    assertEq(winner, 0);
    assertEq(community, 0);
    assertEq(operation, 1 ether);      // 모든 금액이 운영비로
    assertEq(winner + community + operation, totalPool);
}

function testFuzz_CalculateDistribution(uint256 totalPool) public {
    vm.assume(totalPool > 0);
    vm.assume(totalPool < 1e30);

    (uint256 winner, uint256 community, uint256 operation) =
        metalotto.getDistribution(totalPool);

    // 합계 검증
    assertEq(winner + community + operation, totalPool);

    // 비율 검증
    uint256 expectedWinner = (totalPool * 9000) / 10000;
    uint256 expectedCommunity = (totalPool * 500) / 10000;

    assertEq(winner, expectedWinner);
    assertEq(community, expectedCommunity);
    assertGe(operation, (totalPool * 500) / 10000);  // 최소 비율 이상
}
```
