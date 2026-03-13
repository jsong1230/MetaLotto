# WalletConnectButton 컴포넌트

## 개요
지갑 연결 및 연결 상태 표시를 위한 컴포넌트입니다. wagmi의 `useAccount`, `useConnect`, `useDisconnect`, `useBalance` 훅을 사용하여 지갑 연결 상태를 관리하고 META 잔액을 조회합니다.

## 파일 경로
`/Users/jsong/dev/metadium-github/MetaLotto/frontend/src/components/WalletConnectButton.tsx`

## Props
이 컴포넌트는 props를 받지 않습니다.

## 상태
- `isConnected`: 지갑 연결 여부 (wagmi `useAccount` 훅에서 가져옴)
- `address`: 연결된 지갑 주소
- `isConnecting`: 연결 중인지 여부
- `balance`: META 잔액 (wei)

## 기능

### 지갑 연결
- "지갑 연결" 버튼 클릭 시 `useConnect` 훅의 `connect` 함수 호출
- MetaMask 및 기타 지갑 지원

### 지갑 연결 해제
- 연결된 상태에서 버튼 클릭 시 `useDisconnect` 훅의 `disconnect` 함수 호출
- 주소를 클릭하여 연결 해제 가능

### 잔액 표시
- `useBalance` 훅으로 META 잔액 실시간 조회
- wei 단위를 ether 단위로 변환하여 표시

## UI 구성

### 미연결 상태
- 인디고 배경의 "지갑 연결" 버튼
- 연결 중일 때 스피너 아이콘 표시

### 연결 상태
- 체인 정보 (Metadium/Mainnet 등)
- META 잔액 표시 (회색 배경)
- 마스킹된 주소 버튼 (클릭 시 연결 해제)

## 스타일링
- Tailwind CSS 사용
- 다크 모드 지원
- 호버 효과 및 포커스 상태 포함

## 사용 예시
```tsx
import { WalletConnectButton } from '@/components/WalletConnectButton';

export function MyComponent() {
  return (
    <div>
      <WalletConnectButton />
    </div>
  );
}
```

## 의존성
- wagmi v3.x
- viem v2.x
- @/lib/utils (`maskAddress`, `formatEther`)

## 참고
- 이 컴포넌트는 `'use client'` 지시어를 사용하여 클라이언트 컴포넌트로 작동합니다.
- SSR 환경에서는 초기 상태로 렌더링됩니다.
