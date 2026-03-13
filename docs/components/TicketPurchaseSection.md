# TicketPurchaseSection 컴포넌트

## 개요
티켓 구매를 위한 컴포넌트입니다. 티켓 수량 선택, 총 가격 계산, 구매 버튼을 제공하며 트랜잭션 상태를 표시합니다.

## 파일 경로
`/Users/jsong/dev/metadium-github/MetaLotto/frontend/src/components/TicketPurchaseSection.tsx`

## Props
이 컴포넌트는 props를 받지 않습니다.

## 상태
- `quantity`: 티켓 수량 (1~100, 기본값: 1)
- `error`: 에러 메시지 (null 또는 문자열)
- `isWriting`: 트랜잭션 서명 대기 중
- `isConfirming`: 트랜잭션 컨펌 대기 중
- `isSuccess`: 트랜잭션 성공 여부

## 데이터 소스
- `useAccount`: 지갑 연결 상태
- `useReadContract`: 현재 라운드 정보 (`getCurrentRound`)
- `useWriteContract`: 티켓 구매 트랜잭션 전송
- `useWaitForTransactionReceipt`: 트랜잭션 컨펌 대기
- `useChainId`: 현재 체인 ID

## 기능

### 수량 선택
- +/- 버튼으로 티켓 수량 조절
- 직접 입력 가능 (1~100)
- 최대 100장 제한

### 총 가격 계산
- `quantity * ticketPrice`로 계산
- 실시간 업데이트
- wei 단위를 ether 단위로 변환하여 표시

### 티켓 구매
- 구매 버튼 클릭 시 `buyTickets` 함수 호출
- `writeContract`로 트랜잭션 전송
- 파라미터: `count` (티켓 수), `value` (총 가격)

### 유효성 검사
| 에러 조건 | 메시지 |
|----------|---------|
| 지갑 연결 안됨 | "지갑을 연결해주세요." |
| 라운드 종료됨 | "현재 라운드가 종료되었습니다." |
| 수량 < 1 | "최소 1장 이상 구매해야 합니다." |
| 수량 > 100 | "최대 100장까지 구매 가능합니다." |

### 트랜잭션 상태
1. **서명 대기**: 스피너 아이콘과 "구매 중..." 메시지
2. **컨펌 대기**: 스피너 아이콘과 "트랜잭션 확인 중..." 메시지
3. **성공**: 녹색 성공 메시지
4. **실패**: 빨간 에러 메시지

## UI 구성

### 미연결 상태
- "티켓을 구매하려면 지갑을 연결해주세요." 메시지

### 라운드 종료 상태
- "현재 라운드가 종료되었습니다." 메시지

### 정상 상태
1. **수량 선택 섹션**:
   - 라벨: "티켓 수량"
   - -/+ 버튼
   - 수량 입력 필드
   - 최대 제한 표시: "/ 최대 100장"

2. **총 가격 섹션**:
   - 회색 배경의 표시 영역
   - "총 가격" 라벨
   - 큰 폰트의 가격 표시
   - META 단위

3. **구매 버튼**:
   - 인디고 배경
   - `${quantity}장 구매하기` 텍스트
   - 진행 중일 때 스피너 아이콘

## 스타일링
- Tailwind CSS 사용
- 다크 모드 지원
- 비활성 상태: 불투명도 적용
- 호버 효과 및 포커스 상태 포함

## 사용 예시
```tsx
import { TicketPurchaseSection } from '@/components/TicketPurchaseSection';

export function HomePage() {
  return (
    <div>
      <TicketPurchaseSection />
    </div>
  );
}
```

## 의존성
- wagmi v3.x (`useAccount`, `useWriteContract`, `useWaitForTransactionReceipt`, `useReadContract`, `useChainId`)
- @/lib/abis (`MetaLottoAbi`, `getMetaLottoAddress`)
- @/lib/utils (`formatEther`)
- @/types (`RoundInfo`)

## 참고
- 이 컴포넌트는 `'use client'` 지시어를 사용하여 클라이언트 컴포넌트로 작동합니다.
- 구매 완료 후 수량이 1로 초기화됩니다.
- 에러가 발생해도 수량이 유지됩니다.
- 컨트랙트의 `buyTickets` 함수를 호출합니다.
