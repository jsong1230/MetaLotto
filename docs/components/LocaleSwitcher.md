# LocaleSwitcher

## 개요
다국어 지원을 위한 언어 선택 드롭다운 컴포넌트. Header에 통합되어 사용자가 한국어/영어/중국어/일본어 중 원하는 언어를 선택할 수 있습니다.

## 위치
`/src/components/layout/LocaleSwitcher.tsx`

## 기술 스택
- next-intl `useLocale` 훅으로 현재 locale 감지
- Next.js `useRouter`, `usePathname`으로 경로 전환
- Client Component (`'use client'`)

## 지원 언어

| 코드 | 언어 | 국기 |
|------|------|------|
| `ko` | 한국어 | 🇰🇷 |
| `en` | English | 🇺🇸 |
| `zh` | 中文 | 🇨🇳 |
| `ja` | 日本語 | 🇯🇵 |

## 동작 방식
1. 현재 URL 경로(`/ko/history`)에서 locale 세그먼트(`segments[1]`)를 교체
2. 새 locale 경로로 `router.push()` 호출
3. 드롭다운 외부 클릭 시 자동으로 닫힘 (`mousedown` 이벤트)

## Props
없음 (locale은 `useLocale()`로 자동 감지)

## 사용 예시
```tsx
// Header.tsx에서
import { LocaleSwitcher } from '@/components/layout/LocaleSwitcher';

<div className="flex items-center gap-3">
  <LocaleSwitcher />
  <WalletConnectButton />
</div>
```

## 접근성
- `aria-expanded`, `aria-haspopup="listbox"` 속성 적용
- 각 언어 옵션에 `role="option"`, `aria-selected` 적용
- 현재 선택된 언어는 체크 아이콘으로 시각적 표시
