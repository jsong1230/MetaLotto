# F-04 상금 분배 — 기술 설계서

## 1. 참조
- 인수조건: docs/project/features.md #F-04
- 시스템 설계: docs/system/system-design.md

## 2. 아키텍처 결정

### 결정 1: 분배 비율 단위
- **선택지**: A) 퍼센트 (1~100) / B) Basis Points (1~10000)
- **결정**: B) Basis Points
- **근거**: 더 정밀한 분배 가능, 금융 표준

### 결정 2: 반올림 처리
- **선택지**: A) 내림 / B) 반올림 / C) 잔여분을 운영비에 포함
- **결정**: C) 잔여분을 운영비에 포함
- **근거**: 손실 없음, 구현 단순

## 3. 상수 정의

```solidity
uint256 public constant WINNER_SHARE = 9000;     // 90% (basis points)
uint256 public constant COMMUNITY_SHARE = 500;   // 5% (basis points)
uint256 public constant OPERATION_SHARE = 500;   // 5% (basis points)
uint256 public constant BASIS_POINTS = 10000;    // 100% (기준)
```

### 3.1 검증
```
WINNER_SHARE + COMMUNITY_SHARE + OPERATION_SHARE
= 9000 + 500 + 500
= 10000 (= BASIS_POINTS) ✓
```

## 4. 분배 알고리즘

### 4.1 기본 계산

```solidity
function _calculateDistribution(uint256 _totalPool)
    internal
    pure
    returns (
        uint256 winnerAmount,
        uint256 communityAmount,
        uint256 operationAmount
    )
{
    winnerAmount = (_totalPool * WINNER_SHARE) / BASIS_POINTS;      // 90%
    communityAmount = (_totalPool * COMMUNITY_SHARE) / BASIS_POINTS; // 5%
    // operationAmount: 나머지 (반올림 오차 흡수)
    operationAmount = _totalPool - winnerAmount - communityAmount;   // 5% + 오차
}
```

### 4.2 반올림 처리 예시

```
풀 금액: 1001 META

winnerAmount = (1001 * 9000) / 10000 = 9009000 / 10000 = 900 META (내림)
communityAmount = (1001 * 500) / 10000 = 500500 / 10000 = 50 META (내림)
operationAmount = 1001 - 900 - 50 = 51 META

합계: 900 + 50 + 51 = 1001 META ✓ (손실 없음)
```

### 4.3 검증

```solidity
// 분배 후 컨트랙트 잔액 검증
assert(
    winnerAmount + communityAmount + operationAmount == _totalPool
);
```

## 5. 함수 설계

### 5.1 _distributePrize() — internal

```solidity
function _distributePrize(Round storage round, address winner) internal {
    uint256 totalPool = round.totalPool;

    // 분배 금액 계산
    (
        uint256 winnerAmount,
        uint256 communityAmount,
        uint256 operationAmount
    ) = _calculateDistribution(totalPool);

    // 당첨 금액 저장
    round.winnerPrize = winnerAmount;

    // 당첨자 송금 (Pull Pattern - F-05에서 구현)
    _sendPrize(winner, winnerAmount);

    // 커뮤니티 펀드 송금
    (bool communitySent, ) = communityFund.call{value: communityAmount}("");
    require(communitySent, TransferFailed());

    // 운영비 송금
    (bool operationSent, ) = operationFund.call{value: operationAmount}("");
    require(operationSent, TransferFailed());

    emit PrizeDistributed(
        round.roundId,
        winner,
        winnerAmount,
        communityAmount,
        operationAmount
    );
}
```

### 5.2 _calculateDistribution() — internal pure

```solidity
function _calculateDistribution(uint256 _totalPool)
    internal
    pure
    returns (
        uint256 winnerAmount,
        uint256 communityAmount,
        uint256 operationAmount
    )
{
    require(_totalPool > 0, InvalidParameter());

    winnerAmount = (_totalPool * WINNER_SHARE) / BASIS_POINTS;
    communityAmount = (_totalPool * COMMUNITY_SHARE) / BASIS_POINTS;
    operationAmount = _totalPool - winnerAmount - communityAmount;
}
```

### 5.3 _sendPrize() — internal

```solidity
function _sendPrize(address _winner, uint256 _amount) internal {
    (bool sent, ) = _winner.call{value: _amount}("");

    if (!sent) {
        // Pull Pattern: 실패 시 pendingWithdrawals에 저장
        pendingWithdrawals[_winner] += _amount;
        emit PrizeTransferFailed(_winner, _amount);
    } else {
        emit PrizeTransferSuccess(_winner, _amount);
    }
}
```

## 6. 분배 비율 검증

### 6.1 예시 시나리오

| 풀 금액 | 당첨자 (90%) | 커뮤니티 (5%) | 운영비 (5%+오차) | 합계 |
|---------|-------------|---------------|------------------|------|
| 100 META | 90 | 5 | 5 | 100 |
| 1000 META | 900 | 50 | 50 | 1000 |
| 1001 META | 900 | 50 | 51 | 1001 |
| 999 META | 899 | 49 | 51 | 999 |
| 1 META | 0 | 0 | 1 | 1 |
| 10 META | 9 | 0 | 1 | 10 |

### 6.2 경계 조건
- `totalPool = 1 wei`: winnerAmount = 0, communityAmount = 0, operationAmount = 1
- `totalPool = 10000 wei`: 정확한 분배 (9000, 500, 500)

## 7. 에러 케이스

| Error | 시나리오 | 대응 |
|-------|----------|------|
| `InvalidParameter()` | totalPool = 0 | revert |
| `TransferFailed()` | 커뮤니티/운영 펀드 송금 실패 | revert |

## 8. 이벤트

```solidity
event PrizeDistributed(
    uint256 indexed roundId,
    address indexed winner,
    uint256 winnerAmount,
    uint256 communityAmount,
    uint256 operationAmount
);

event PrizeTransferSuccess(
    address indexed winner,
    uint256 amount
);

event PrizeTransferFailed(
    address indexed winner,
    uint256 amount
);
```

## 9. Admin 함수

### 9.1 setCommunityFund(address _newFund)

```solidity
function setCommunityFund(address _newFund) external onlyOwner {
    require(_newFund != address(0), InvalidAddress());

    address oldFund = communityFund;
    communityFund = _newFund;

    emit FundAddressUpdated("communityFund", oldFund, _newFund);
}
```

### 9.2 setOperationFund(address _newFund)

```solidity
function setOperationFund(address _newFund) external onlyOwner {
    require(_newFund != address(0), InvalidAddress());

    address oldFund = operationFund;
    operationFund = _newFund;

    emit FundAddressUpdated("operationFund", oldFund, _newFund);
}
```

## 10. 영향 범위

### 수정 필요 파일
- `contracts/src/MetaLotto.sol`

### 신규 생성 파일
- `contracts/test/MetaLottoPrize.t.sol` (상금 분배 테스트)

## 11. View 함수

### 11.1 getDistribution(uint256 _totalPool)

```solidity
function getDistribution(uint256 _totalPool)
    external
    pure
    returns (
        uint256 winnerAmount,
        uint256 communityAmount,
        uint256 operationAmount
    )
{
    return _calculateDistribution(_totalPool);
}
```

## 변경 이력
| 날짜 | 변경 내용 | 이유 |
|------|----------|------|
| 2026-03-13 | 초기 작성 | M1 마일스톤 시작 |
