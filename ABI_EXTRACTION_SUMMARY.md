# MetaLotto ABI 추출 및 TypeScript 타입 생성 완료

## 작업 개요

MetaLotto 스마트 컨트랙트의 ABI를 추출하고, wagmi/viem에서 사용할 수 있는 TypeScript 타입 정의를 생성했습니다.

## 생성된 파일

### 1. ABI JSON
- **파일**: `frontend/src/lib/abis/MetaLotto.json`
- **크기**: 24KB (1274 lines)
- **엔트리 수**: 77개
  - 함수: 43개
  - 이벤트: 15개
  - 생성자: 1개
  - 에러: 14개

### 2. TypeScript 타입 정의
- **파일**: `frontend/src/lib/abis/types.ts` (9.4KB)
- **내용**:
  - `RoundStatus` enum (라운드 상태)
  - `Round` interface (라운드 정보)
  - `Ticket` interface (티켓 정보)
  - 이벤트 타입 15개
  - Read 함수 타입 22개
  - Write 함수 타입 14개
  - ABI 상수 exports

### 3. 컨트랙트 주소 관리
- **파일**: `frontend/src/lib/abis/addresses.ts` (2.6KB)
- **기능**:
  - 네트워크별 컨트랙트 주소 (메인넷/테스트넷)
  - `getContractAddress()` 헬퍼 함수
  - `getNetworkName()` 헬퍼 함수
  - `getMetaLottoAddress()` 헬퍼 함수
- **참고**: 배포 후 실제 주소로 업데이트 필요

### 4. wagmi/viem 설정
- **파일**: `frontend/src/lib/abis/config.ts` (2.1KB)
- **내용**:
  - `metalottoContract` (기본 설정)
  - `metalottoContractMainnet` (메인넷 설정)
  - `metalottoContractTestnet` (테스트넷 설정)
  - `getMetalottoContract(chainId)` (동적 설정)

### 5. 통합 Exports
- **파일**: `frontend/src/lib/abis/index.ts` (2.2KB)
- **기능**: 모든 타입, 설정, 주소를 한 곳에서 import 가능

### 6. 유효성 검증 스크립트
- **파일**: `frontend/src/lib/abis/validate.ts` (3.8KB)
- **기능**:
  - ABI 구조 검증
  - 함수/이벤트 중복 확인
  - 필수 함수/이벤트 존재 확인
  - 통계 정보 출력

### 7. 문서화
- **파일**: `docs/components/abis.md` (상세 사용법)
- **파일**: `frontend/src/lib/abis/README.md` (빠른 참조)

## 사용 예시

### Read Contract
```typescript
import { useReadContract } from 'wagmi';
import { metalottoContract } from '@/lib/abis';

const { data: currentRound } = useReadContract({
  ...metalottoContract,
  functionName: 'getCurrentRound',
});
```

### Write Contract
```typescript
import { useWriteContract } from 'wagmi';
import { metalottoContract } from '@/lib/abis';

const { writeContract } = useWriteContract();

writeContract({
  ...metalottoContract,
  functionName: 'buyTickets',
  args: [BigInt(5)],
  value: BigInt(5) * ticketPrice,
});
```

### Event Listening
```typescript
import { useContractEvent } from 'wagmi';
import { metalottoContract } from '@/lib/abis';

useContractEvent({
  ...metalottoContract,
  eventName: 'WinnerDrawn',
  listener: (logs) => {
    console.log('Winner:', logs[0].args.winner);
  },
});
```

## 다음 작업

### 필수 (배포 전)
1. ~~ABI 추출 및 TypeScript 타입 생성~~ (완료)
2. 컨트랙트 배포 (배포 스크립트 작성 필요)
3. `addresses.ts`에 실제 컨트랙트 주소 업데이트

### 선택 (개발 시)
1. ABI 유효성 검증 실행: `npx ts-node src/lib/abis/validate.ts`
2. 타입스크립트 빌드 확인: `npm run build`
3. 테스트 케이스 작성

## 참고

- 메타디움 메인넷 Chain ID: 11
- 메타디움 테스트넷 Chain ID: 11 (현재 동일)
- 모든 `uint256` 타입은 TypeScript `bigint`로 매핑됨
- 모든 `address` 타입은 TypeScript `` `0x${string}` ``로 매핑됨

## 파일 경로 정리

```
/Users/jsong/dev/metadium-github/MetaLotto/
├── frontend/src/lib/abis/
│   ├── MetaLotto.json          # ABI JSON (24KB)
│   ├── types.ts                # TypeScript 타입 (9.4KB)
│   ├── addresses.ts            # 컨트랙트 주소 (2.6KB)
│   ├── config.ts               # wagmi/viem 설정 (2.1KB)
│   ├── index.ts                # 통합 exports (2.2KB)
│   ├── validate.ts             # 유효성 검증 (3.8KB)
│   └── README.md               # 빠른 참조
└── docs/components/
    └── abis.md                 # 상세 사용법
```

---

작업 완료 시간: 2026-03-13
