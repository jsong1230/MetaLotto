# RoundInfoSection 컴포넌트

## 개요
현재 라운드 정보를 표시하는 컴포넌트입니다. 라운드 상태, 남은 시간, 풀 규모, 참여 티켓 수 등의 정보를 실시간으로 조회하여 표시합니다.

## 파일 경로
`/Users/jsong/dev/metadium-github/MetaLotto/frontend/src/components/RoundInfoSection.tsx`

## Props
이 컴포넌트는 props를 받지 않습니다.

## 데이터 소스
- `useReadContract` 훅으로 `getCurrentRound` 함수 호출
- `useChainId` 훅으로 현재 체인 ID 가져옴

## 표시 정보

### 라운드 헤더
- **라운드 ID**: `Round #123` 형식
- **상태 배지**: Open(녹색), Closing(노랑), Completed(회색), Cancelled(빨강)

### 라운드 상세 정보
| 항목 | 설명 | 포맷 |
|------|------|------|
| 남은 시간 | 라운드 종료까지 남은 시간 | HH:MM:SS |
| 풀 규모 | 누적 상금 풀 | 1234.5678 META |
| 참여 티켓 | 발행된 총 티켓 수 | 123장 |
| 티켓 가격 | 1장당 가격 | 100.0000 META |

### 당첨자 정보 (완료된 라운드만)
- 녹색 배경의 당첨자 발표 섹션
- 별 아이콘과 함께 당첨 금액 표시
- 당첨자 주소는 마스킹 처리 (0x1234...5678)

## 로딩 상태
- 스켈레톤 UI 표시
- 회색 막대로 로딩 효과

## 에러 상태
- 데이터 로드 실패 시 "라운드 정보를 불러오는 중입니다..." 메시지 표시

## 스타일링
- Tailwind CSS 사용
- 다크 모드 지원
- 카드 레이아웃: 흰색 배경, 그림자 효과, 둥근 모서리

## 사용 예시
```tsx
import { RoundInfoSection } from '@/components/RoundInfoSection';

export function HomePage() {
  return (
    <div>
      <RoundInfoSection />
    </div>
  );
}
```

## 의존성
- wagmi v3.x (`useReadContract`, `useChainId`)
- @/lib/abis (`MetaLottoAbi`, `getMetaLottoAddress`)
- @/lib/utils (`formatEther`, `formatTime`, `getStatusText`, `getStatusColor`)
- @/types (`RoundInfo`)

## 참고
- 이 컴포넌트는 `'use client'` 지시어를 사용하여 클라이언트 컴포넌트로 작동합니다.
- 남은 시간은 클라이언트 시간을 기준으로 계산됩니다.
- 상태 배지 색상은 `getStatusColor` 함수로 결정됩니다.
