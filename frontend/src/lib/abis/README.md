# MetaLotto 컨트랙트 ABI

이 디렉토리는 MetaLotto 스마트 컨트랙트의 ABI (Application Binary Interface)와 관련 TypeScript 타입 정의를 포함합니다.

## 파일 설명

| 파일 | 설명 |
|------|------|
| `MetaLotto.json` | 컨트랙트 ABI JSON (77개 엔트리: 43개 함수, 15개 이벤트) |
| `types.ts` | TypeScript 타입 정의 (함수, 이벤트, 구조체) |
| `addresses.ts` | 네트워크별 컨트랙트 배포 주소 |
| `config.ts` | wagmi/viem용 컨트랙트 설정 |
| `index.ts` | 통합 exports (한 곳에서 import 가능) |
| `validate.ts` | ABI 유효성 검증 스크립트 |
| `README.md` | 이 파일 |

## 빠른 시작

### 1. 컨트랙트 상태 조회

```typescript
import { useReadContract } from 'wagmi';
import { metalottoContract } from '@/lib/abis';

const { data: currentRound } = useReadContract({
  ...metalottoContract,
  functionName: 'getCurrentRound',
});
```

### 2. 티켓 구매

```typescript
import { useWriteContract } from 'wagmi';
import { metalottoContract } from '@/lib/abis';

const { writeContract } = useWriteContract();

writeContract({
  ...metalottoContract,
  functionName: 'buyTickets',
  args: [BigInt(5)], // 5장 구매
  value: BigInt(5) * ticketPrice, // 티켓 가격 x 5
});
```

### 3. 이벤트 리스닝

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

## ABI 업데이트 방법

컨트랙트를 재배포하거나 수정한 경우 다음 단계로 ABI를 업데이트하세요:

```bash
# 1. 컨트랙트 재컴파일
cd contracts
forge build

# 2. ABI 추출
jq '.abi' out/MetaLotto.sol/MetaLotto.json > ../frontend/src/lib/abis/MetaLotto.json

# 3. TypeScript 타입 검증 (선택)
cd ../frontend
npx ts-node src/lib/abis/validate.ts
```

## 타입 검증

`validate.ts`를 실행하여 ABI와 TypeScript 타입의 일치성을 확인할 수 있습니다:

```bash
npx ts-node src/lib/abis/validate.ts
```

## 배포 후 작업

컨트랙트를 배포한 후 `addresses.ts`에서 실제 컨트랙트 주소를 업데이트하세요:

```typescript
export const ADDRESSES = {
  metadium: {
    MetaLotto: '0x<실제_주소>' as const,
  },
  metadium_testnet: {
    MetaLotto: '0x<실제_주소>' as const,
  },
} as const;
```

## 참고 문서

상세한 사용법은 [docs/components/abis.md](../../../../docs/components/abis.md)를 참고하세요.
