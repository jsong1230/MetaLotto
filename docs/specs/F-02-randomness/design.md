# F-02 Blockhash 난수 생성 — 기술 설계서

## 1. 참조
- 인수조건: docs/project/features.md #F-02
- 시스템 설계: docs/system/system-design.md

## 2. 아키텍처 결정

### 결정 1: 난수 소스
- **선택지**: A) Blockhash / B) Chainlink VRF / C) 커스텀 VRF
- **결정**: A) Blockhash
- **근거**: Metadium에 Chainlink VRF 미지원, 추가 인프라 없이 구현 가능, v2에서 VRF로 업그레이드 경로 유지

### 결정 2: 블록 해시 조합 방식
- **선택지**: A) 단일 블록 / B) 3개 블록 조합 / C) N개 블록
- **결정**: B) 3개 블록 조합
- **근거**: 검증자 조작 난이도 증가 (3개 연속 블록 모두 조작해야 함), 가스 비용 합리적

### 결정 3: 엔트로피 수집 방식
- **선택지**: A) 추첨 시점에만 수집 / B) 티켓 구매 시마다 누적
- **결정**: B) 티켓 구매 시마다 누적
- **근거**: 마지막 구매자의 seed 조작 방지, 참여자 모두의 입력이 결과에 영향

## 3. 난수 생성 알고리즘

### 3.1 알고리즘 개요

```
1단계: 티켓 구매 시 seed 누적 (엔트로피 수집)
   seed = keccak256(seed, msg.sender, block.number, _count)

2단계: closeRound() 호출 시 미래 블록 지정
   drawBlock = block.number + drawDelay

3단계: drawWinner() 호출 시 난수 생성
   randomness = keccak256(
       blockhash(drawBlock),
       blockhash(drawBlock + 1),
       blockhash(drawBlock + 2),
       seed
   )
   winnerIndex = randomness % ticketCount
```

### 3.2 Seed 누적 로직 (buyTickets 내부)

```solidity
function buyTickets(uint256 _count) external payable whenNotPaused nonReentrant {
    // ... 검증 로직 ...

    Round storage round = rounds[currentRoundId];

    // 엔트로피 누적
    round.seed = uint256(keccak256(
        abi.encodePacked(
            round.seed,
            msg.sender,
            block.number,
            _count,
            msg.value  // 추가 엔트로피
        )
    ));

    // ... 티켓 발급 로직 ...
}
```

### 3.3 난수 생성 로직 (drawWinner 내부)

```solidity
function _generateRandomness(Round storage round) internal view returns (uint256) {
    bytes32 hash1 = blockhash(round.drawBlock);
    bytes32 hash2 = blockhash(round.drawBlock + 1);
    bytes32 hash3 = blockhash(round.drawBlock + 2);

    return uint256(keccak256(
        abi.encodePacked(
            hash1,
            hash2,
            hash3,
            round.seed
        )
    ));
}
```

### 3.4 당첨자 선정

```solidity
function _selectWinner(uint256 randomness, uint256 ticketCount) internal pure returns (uint256) {
    return randomness % ticketCount;
}
```

## 4. 256블록 제한 처리

### 4.1 문제 설명
- Solidity `blockhash(n)` 함수는 최근 256블록만 조회 가능
- `block.number > n + 256`인 경우 `bytes32(0)` 반환
- 추첨이 지연되면 난수 생성 불가

### 4.2 해결 방안: forceCloseDraw()

```solidity
function forceCloseDraw() external onlyOwner {
    Round storage round = rounds[currentRoundId];

    require(round.status == RoundStatus.Closing, RoundNotClosing());
    require(block.number > round.drawBlock + 256, DrawBlockNotReached());

    // 새로운 drawBlock 설정
    uint256 oldDrawBlock = round.drawBlock;
    round.drawBlock = block.number + drawDelay;

    emit ConfigUpdated("drawBlock", oldDrawBlock, round.drawBlock);
}
```

### 4.3 drawWinner()에서의 유효성 검사

```solidity
function drawWinner() external whenNotPaused nonReentrant {
    Round storage round = rounds[currentRoundId];

    // 상태 검증
    require(round.status == RoundStatus.Closing, RoundNotClosing());

    // 블록 번호 검증
    require(block.number > round.drawBlock, DrawBlockNotReached());
    require(block.number <= round.drawBlock + 256, DrawExpired());

    // blockhash 유효성 검증
    bytes32 hash1 = blockhash(round.drawBlock);
    require(hash1 != bytes32(0), DrawExpired());

    // ... 난수 생성 및 당첨자 선정 ...
}
```

## 5. 보안 분석

### 5.1 공격 벡터별 대응

| 공격 벡터 | 위험도 | 대응 방안 |
|-----------|--------|-----------|
| 검증자가 drawBlock 해시 조작 | 중 | 3개 블록 해시 조합 + 누적 seed → 3개 연속 블록 모두 조작해야 함 |
| 마지막 구매자가 seed 조작 시도 | 낮 | seed는 누적 방식, 이전 참여자 데이터도 포함됨 |
| drawWinner() 호출 타이밍 조작 | 낮음 | drawBlock 고정 → 호출 시점 무관 |
| Front-running (당첨 예측 후 구매) | 낮음 | drawBlock은 closeRound() 이후 확정, 구매 시점엔 알 수 없음 |
| 256블록 초과로 blockhash 소실 | 중 | forceCloseDraw()로 drawBlock 재설정 |

### 5.2 Seed 조작 방지 메커니즘

```
시나리오: 공격자가 마지막에 티켓을 구매하여 자신이 당첨되도록 조작 시도

분석:
1. 공격자는 자신의 티켓 인덱스를 알 수 있음
2. 하지만 seed는 이전 구매자들의 데이터가 누적되어 있음
3. drawBlock의 해시는 미래에 결정됨 (공격자가 알 수 없음)
4. 따라서 seed 조작으로 특정 결과를 만들 수 없음
```

## 6. 함수 설계

### 6.1 drawWinner() — external

```solidity
function drawWinner() external whenNotPaused nonReentrant {
    Round storage round = rounds[currentRoundId];

    // 검증
    require(round.status == RoundStatus.Closing, RoundNotClosing());
    require(block.number > round.drawBlock, DrawBlockNotReached());
    require(block.number <= round.drawBlock + 256, DrawExpired());

    // blockhash 유효성 확인
    bytes32 hash1 = blockhash(round.drawBlock);
    require(hash1 != bytes32(0), DrawExpired());

    // 난수 생성
    uint256 randomness = _generateRandomness(round);

    // 당첨자 선정
    uint256 winnerIndex = randomness % round.ticketCount;
    address winner = roundTickets[currentRoundId][winnerIndex].buyer;

    // 상태 업데이트
    round.winner = winner;
    round.status = RoundStatus.Completed;

    // 상금 분배 (F-04, F-05에서 구현)
    _distributePrize(round, winner);

    emit WinnerDrawn(
        currentRoundId,
        winner,
        round.winnerPrize,
        _communityAmount,
        _operationAmount
    );

    // 새 라운드 시작
    _startNewRound();
}
```

### 6.2 _generateRandomness() — internal view

```solidity
function _generateRandomness(Round storage round) internal view returns (uint256) {
    bytes32 hash1 = blockhash(round.drawBlock);
    bytes32 hash2 = blockhash(round.drawBlock + 1);
    bytes32 hash3 = blockhash(round.drawBlock + 2);

    return uint256(keccak256(
        abi.encodePacked(
            hash1,
            hash2,
            hash3,
            round.seed
        )
    ));
}
```

## 7. 에러 케이스

| Error | 시나리오 | 대응 |
|-------|----------|------|
| `RoundNotClosing()` | Closing 상태가 아닐 때 drawWinner() 호출 | revert |
| `DrawBlockNotReached()` | block.number <= drawBlock일 때 drawWinner() 호출 | revert |
| `DrawExpired()` | block.number > drawBlock + 256일 때 drawWinner() 호출 | revert |
| `DrawExpired()` | blockhash(drawBlock) == bytes32(0) | revert |

## 8. View 함수

### 8.1 getDrawBlockRemaining()

```solidity
function getDrawBlockRemaining() external view returns (int256) {
    Round storage round = rounds[currentRoundId];

    if (round.status != RoundStatus.Closing) {
        return -1;  // Closing 상태가 아님
    }

    int256 remaining = int256(round.drawBlock) - int256(block.number);

    if (remaining < -256) {
        return -256;  // 만료됨, forceCloseDraw 필요
    }

    return remaining;  // 양수: 대기 중, 음수: 추첨 가능
}
```

## 9. 이벤트

```solidity
// drawWinner에서 emit
event WinnerDrawn(
    uint256 indexed roundId,
    address indexed winner,
    uint256 winnerPrize,
    uint256 communityAmount,
    uint256 operationAmount
);

// forceCloseDraw에서 emit
event ConfigUpdated(
    string parameter,
    uint256 oldValue,
    uint256 newValue
);
```

## 10. v2 VRF 업그레이드 경로

### 10.1 인터페이스 준비

```solidity
// contracts/src/interfaces/IRandomnessProvider.sol
interface IRandomnessProvider {
    function requestRandomness(uint256 roundId) external returns (uint256 requestId);
    function isRandomnessReady(uint256 roundId) external view returns (bool);
    function getRandomness(uint256 roundId) external view returns (uint256);
}
```

### 10.2 업그레이드 전략
- v1: BlockhashRandomness (내부 구현)
- v2: 프록시 패턴으로 IRandomnessProvider 교체 가능
- 상태 변수는 그대로 유지

## 11. 영향 범위

### 수정 필요 파일
- `contracts/src/MetaLotto.sol`

### 신규 생성 파일
- `contracts/src/interfaces/IRandomnessProvider.sol` (v2 준비)
- `contracts/test/MetaLottoRandomness.t.sol` (난수 생성 테스트)
- `contracts/test/MetaLottoRandomness.fuzz.t.sol` (분포 테스트)

## 12. 성능 고려사항

### 가스 최적화
- `blockhash()` 호출 3회: EVM 내장 함수, 저렴함
- `keccak256()`: 가스 비용 일정
- `abi.encodePacked()`: 타입 패킹으로 가스 절약

### 분포 균등성
- `randomness % ticketCount`: modulo bias 존재하지만 2^256 범위에서 무시 가능
- 대규모 테스트에서 분포 검증 필요

## 변경 이력
| 날짜 | 변경 내용 | 이유 |
|------|----------|------|
| 2026-03-13 | 초기 작성 | M1 마일스톤 시작 |
