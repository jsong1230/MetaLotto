# RoundList 컴포넌트

## 개요
과거 라운드 목록을 표시하는 컴포넌트입니다. 완료된 라운드의 정보를 페이지네이션하여 보여줍니다.

## 파일 경로
`/Users/jsong/dev/metadium-github/MetaLotto/frontend/src/components/RoundList.tsx`

## Props
이 컴포넌트는 props를 받지 않습니다.

## 상태
- `page`: 현재 페이지 번호 (기본값: 1)
- `roundsPerPage`: 페이지당 표시할 라운드 수 (10)

## 데이터 소스
- `useReadContract`: 현재 라운드 ID (`currentRoundId`)
- 병렬 `useReadContract`: 라운드 정보 병렬 조회 (`rounds`)
- `useChainId`: 현재 체인 ID

## 표시 정보

### 각 라운드 카드
| 항목 | 설명 |
|------|------|
| 라운드 ID | `Round #123` 형식 |
| 상태 배지 | Open(녹색), Closing(노랑), Completed(회색) |
| 당첨자 | 마스킹된 주소 (완료된 라운드만) |
| 당첨 금액 | META 단위 (완료된 라운드만) |

### 라운드 상태별 표시
| 상태 | 표시 내용 |
|------|---------|
| Open | 상태 배지만 표시 |
| Closing | 상태 배지 + "추첨 대기 중" |
| Completed | 상태 배지 + 당첨자 + 당첨 금액 |
| Cancelled | 상태 배지만 표시 |

## 기능

### 병렬 조회
- 최대 10개의 라운드 정보를 병렬로 조회
- 각 라운드마다 별도의 `useReadContract` 호출
- 로딩 상태는 모든 쿼리 중 하나라도 로딩 중이면 true

### 페이지네이션
- "이전"/"다음" 버튼
- 페이지 번호 표시
- 마지막 페이지에서 "다음" 버튼 비활성
- 첫 페이지에서 "이전" 버튼 비활성

### 페이지네이션 로직
- 1페이지: 최근 10개 (currentRoundId-1 ~ currentRoundId-10)
- 2페이지: 그 다음 10개
- 최대 페이지: `Math.ceil(currentRoundId / roundsPerPage)`

## 로딩 상태
- 스켈레톤 UI 표시
- 5개의 가짜 라운드 카드

### 빈 상태
- "아직 완료된 라운드가 없습니다." 메시지

## UI 구성

### 헤더
- "과거 라운드" 제목
- 흰색 배경, 하단 경계선

### 라운드 목록
- 세로 분할선으로 구분
- 호버 시 회색 배경
- 플렉스박스로 좌우 정렬

### 페이지네이션
- 상단 경계선
- 좌우 버튼, 중앙 페이지 번호

## 스타일링
- Tailwind CSS 사용
- 다크 모드 지원
- 카드 레이아웃: 흰색 배경, 그림자 효과, 둥근 모서리

## 사용 예시
```tsx
import { RoundList } from '@/components/RoundList';

export function HistoryPage() {
  return (
    <div>
      <RoundList />
    </div>
  );
}
```

## 의존성
- wagmi v3.x (`useReadContract`, `useChainId`)
- @/lib/abis (`MetaLottoAbi`, `getMetaLottoAddress`)
- @/lib/utils (`formatEther`, `maskAddress`, `getStatusText`, `getStatusColor`)

## 참고
- 이 컴포넌트는 `'use client'` 지시어를 사용하여 클라이언트 컴포넌트로 작동합니다.
- 라운드 데이터를 캐싱하기 위해 `queryKey`를 사용합니다.
- 당첨자 주소는 `maskAddress` 함수로 마스킹됩니다.
- 페이지네이션은 간단한 구현으로, 실제로는 페이지 변경 시 `roundIds`가 다시 계산됩니다.
