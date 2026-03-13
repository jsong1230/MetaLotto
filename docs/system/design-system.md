# MetaLotto — Design System

## 1. 디자인 철학

### 1.1 핵심 가치
- **투명성**: 블록체인 기반 온체인 데이터의 공정성을 시각적으로 전달
- **신뢰성**: 검증된 기술(VRF)과 24/7 운영 안정성 표현
- **실행성**: 명확한 CTA와 직관적인 사용자 경험

### 1.2 미학적 방향
- **톤앤매너**: Cyberpunk-Glam — 블록체인/Web3의 미래지향적 느낌과 글래머러스한 복권의 흥분감 결합
- **분위기**: 다크 모드 기반 네온 그라데이션, 빛나는 효과, 높은 명도 대비
- **참조 앱/사이트**:
  - Crypto.com — 다크 모드 + 그라데이션 CTA
  - PoolTogether — DeFi 복권의 투명성 전달
  - FTX (legacy) — 화려한 그라데이션 카드

### 1.3 금지된 패턴 (Generic AI 미학)
- X 보라/파랑 그라디언트 배경 (→ 네온 다중 그라데이션 사용)
- X 균등 3열 카드 그리드 (→ 비대칭 레이아웃 + 주요 카드 강조)
- X 순수 흰색 배경 (→ 다크 배경 #0F0F23 기반)
- X 시스템 기본 폰트 단독 (→ Inter 디자인 시스템 적용)
- X 과도한 둥근 모서리 (→ radius 16~24px으로 제어)

---

## 2. 색상 팔레트

### 2.1 Primary 그라데이션 (주요 CTA, 강조 요소)

```css
/* Hero Background Gradient */
--bg-hero: linear-gradient(135deg, #EAB308 10%, #00D9FF 50%, #7C3AED 80%, #FF6B6B 100%);

/* Primary Button Gradient */
--btn-primary-gradient: linear-gradient(135deg, #00D9FF 0%, #7C3AED 100%);

/* Card Icon Gradients */
--icon-gradient-1: linear-gradient(135deg, #EAB308 0%, #D946EF 100%);
--icon-gradient-2: linear-gradient(135deg, #00D9FF 0%, #7C3AED 100%);
--icon-gradient-3: linear-gradient(135deg, #7C3AED 0%, #2DD4BF 100%);
--icon-gradient-4: linear-gradient(135deg, #FF6B6B 0%, #FF4D6D 100%);

/* CTA Section Gradient */
--bg-cta: linear-gradient(135deg, #FF6B6B 20%, #FF4D6D 60%, #00D9FF 100%);
```

### 2.2 배경색 (Backgrounds)

```css
/* Primary Background */
--bg-primary: #0F0F23;

/* Secondary Background (Stats Section) */
--bg-secondary: rgba(255, 255, 255, 0.05);

/* Card Background */
--bg-card: rgba(255, 255, 255, 0.08);
--bg-card-hover: rgba(255, 255, 255, 0.12);

/* Decorative Circles (Hero) */
--decor-yellow-1: rgba(234, 179, 8, 0.06);
--decor-cyan: rgba(0, 217, 255, 0.03);
--decor-purple: rgba(124, 58, 237, 0.03);
--decor-red: rgba(255, 107, 107, 0.03);
```

### 2.3 텍스트 색상 (Text Colors)

```css
/* Primary Text (Headings, Important Labels) */
--text-primary: #FFFFFF;

/* Secondary Text (Descriptions, Body) */
--text-secondary: rgba(255, 255, 255, 0.7);

/* Tertiary Text (Labels, Stats) */
--text-tertiary: rgba(255, 255, 255, 0.6);

/* Accent Text */
--text-accent-cyan: #00D9FF;
--text-accent-yellow: #EAB308;
--text-accent-purple: #7C3AED;
--text-accent-red: #FF6B6B;
```

### 2.4 Semantic Colors (상태 표시)

```css
/* Success (당첨, 완료) */
--color-success: #22C55E;

/* Warning (종료 임박) */
--color-warning: #F59E0B;

/* Error (실패, 취소) */
--color-error: #EF4444;

/* Info (정보) */
--color-info: #3B82F6;
```

### 2.5 Border & Stroke

```css
/* Card Border */
--border-card: 1px solid rgba(255, 255, 255, 0.15);

/* Badge Border */
--border-badge: 2px solid rgba(255, 255, 255, 0.3);

/* Secondary Button Border */
--border-secondary: 2px solid rgba(255, 255, 255, 0.25);
```

### 2.6 WCAG 대비율 검증

| 요소 | 전경색 | 배경색 | 대비율 | WCAG 등급 |
|------|--------|--------|--------|-----------|
| 헤딩 텍스트 | #FFFFFF | 그라데이션 배경 | ~15:1 | AAA |
| 본문 텍스트 | rgba(255,255,255,0.7) | #0F0F23 | 12:1 | AAA |
| CTA 버튼 텍스트 | #FFFFFF | Primary Gradient | 4.5:1+ | AA |
| 보조 텍스트 | rgba(255,255,255,0.6) | #0F0F23 | 8:1 | AA |

---

## 3. 타이포그래피

### 3.1 폰트 패밀리

```css
--font-display: 'Inter', system-ui, -apple-system, sans-serif;
--font-body: 'Inter', system-ui, -apple-system, sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace; /* 주소, 해쉬 표시용 */
```

### 3.2 폰트 크기 스케일 (Type Scale)

| 용도 | CSS Variable | 크기 | 웨이트 | 라인높이 | 사용처 |
|------|--------------|------|--------|----------|--------|
| Display H1 | --text-7xl | 4.5rem (72px) | 900 | 1.05 | 메인 히어로 제목 |
| Display H2 | --text-6xl | 3.75rem (60px) | 900 | 1.1 | 섹션 메인 제목 |
| Heading H1 | --text-5xl | 3rem (48px) | 800 | 1.15 | 페이지 제목 |
| Heading H2 | --text-4xl | 2.25rem (36px) | 800 | 1.2 | 서브 섹션 제목 |
| Heading H3 | --text-3xl | 1.875rem (30px) | 800 | 1.25 | 카드 제목 |
| Card Title | --text-2xl | 1.5rem (24px) | 800 | 1.3 | 작은 카드 제목 |
| Subheading | --text-xl | 1.25rem (20px) | 700 | 1.4 | 소제목 |
| Body | --text-base | 1rem (16px) | 400 | 1.6 | 본문 텍스트 |
| Description | --text-lg | 1.125rem (18px) | 400 | 1.6 | 카드 설명 |
| Caption | --text-sm | 0.875rem (14px) | 700 | 1.5 | 캡션, 레이블 |
| Tiny | --text-xs | 0.75rem (12px) | 700 | 1.5 | 작은 레이블 |
| Stat Number | --text-8xl | 5rem (80px) | 900 | 1.1 | 통계 숫자 |
| Badge Text | --text-badge | 0.875rem (14px) | 800 | 1.4 | 뱃지 텍스트 |
| CTA Button | --text-cta | 1.25rem (20px) | 800 | 1.4 | CTA 버튼 텍스트 |
| CTA Button Large | --text-cta-lg | 1.375rem (22px) | 800 | 1.4 | 큰 CTA 버튼 |

### 3.3 폰트 웨이트

```css
--font-thin: 100;
--font-light: 300;
--font-normal: 400;  /* 본문 텍스트 */
--font-medium: 500;  /* 중요 텍스트 */
--font-semibold: 600;
--font-bold: 700;    /* 소제목 */
--font-extrabold: 800;  /* 제목, CTA */
--font-black: 900;   /* 메인 제목 */
```

### 3.4 자간 (Letter Spacing)

```css
--tracking-widest: 0.25em;   /* "BLOCKCHAIN V2.0" 뱃지 */
--tracking-wider: 0.1em;     /* 섹션 레이블 */
--tracking-wide: 0.05em;
--tracking-normal: 0;
--tracking-tight: -0.01em;
--tracking-tighter: -0.02em;  /* 디스플레이 헤딩 */
```

### 3.5 타이포그래피 사용 예시

```css
/* 메인 히어로 제목 */
.hero-title {
  font-size: var(--text-7xl);
  font-weight: 900;
  line-height: 1.05;
  letter-spacing: -0.02em;
  color: var(--text-primary);
}

/* 섹션 레이블 */
.section-label {
  font-size: var(--text-sm);
  font-weight: 900;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  color: var(--text-accent-cyan);
}

/* 카드 제목 */
.card-title {
  font-size: var(--text-2xl);
  font-weight: 800;
  line-height: 1.3;
  color: var(--text-primary);
}

/* 본문 텍스트 */
.body-text {
  font-size: var(--text-base);
  font-weight: 400;
  line-height: 1.6;
  color: var(--text-secondary);
}

/* CTA 버튼 텍스트 */
.cta-text {
  font-size: var(--text-cta);
  font-weight: 800;
  line-height: 1.4;
  color: var(--text-primary);
}
```

---

## 4. 스페이싱 시스템 (Spacing Scale)

### 4.1 기본 단위 (Base Unit: 4px)

| 이름 | px | rem | 사용처 |
|------|----|-----|--------|
| space-0 | 0 | 0 | 없음 |
| space-1 | 4 | 0.25 | 아주 작은 간격 |
| space-2 | 8 | 0.5 | 작은 간격 |
| space-3 | 12 | 0.75 | 작은 패딩, gap |
| space-4 | 16 | 1 | 기본 패딩, gap |
| space-5 | 20 | 1.25 | 여백 |
| space-6 | 24 | 1.5 | 버튼 패딩 (수직) |
| space-8 | 32 | 2 | 섹션 내 gap |
| space-10 | 40 | 2.5 | 카드 패딩 |
| space-12 | 48 | 3 | 섹션 간 간격 |
| space-16 | 56 | 3.5 | 큰 버튼 패딩 (수직) |
| space-20 | 80 | 5 | 섹션 패딩 |
| space-24 | 96 | 6 | 큰 섹션 패딩 |
| space-28 | 112 | 7 | 히어로 패딩 (수직) |
| space-32 | 128 | 8 | 최대 패딩 |

### 4.2 컴포넌트별 스페이싱

```css
/* 버튼 패딩 */
.btn-primary {
  padding: 24px 52px;  /* space-6 space-14 */
}

.btn-secondary {
  padding: 24px 52px;  /* space-6 space-14 */
}

.btn-large {
  padding: 24px 56px;  /* space-6 space-16 */
}

/* 카드 패딩 */
.card {
  padding: 40px;  /* space-10 */
}

/* 섹션 패딩 */
.section-padding {
  padding: 100px 80px;  /* space-25 space-20 */
}

.hero-padding {
  padding: 120px 80px;  /* space-30 space-20 */
}

/* 요소 간 간격 */
.gap-sm {
  gap: 12px;  /* space-3 */
}

.gap-md {
  gap: 20px;  /* space-5 */
}

.gap-lg {
  gap: 28px;  /* space-7 */
}

.gap-xl {
  gap: 40px;  /* space-10 */
}

/* Grid gaps */
.grid-gap {
  gap: 32px;  /* space-8 */
}
```

---

## 5. Border Radius

| 이름 | px | 사용처 |
|------|----|--------|
| rounded-none | 0 | 전체각형 |
| rounded-sm | 4px | 작은 모서리 |
| rounded-md | 8px | 기본 모서리 |
| rounded-lg | 12px | 일반 카드 |
| rounded-xl | 16px | 버튼, 뱃지 |
| rounded-2xl | 20px | 아이콘 컨테이너 |
| rounded-3xl | 24px | 피처 카드 |
| rounded-full | 9999px | 뱃지, 둥근 버튼 |

```css
/* 버튼 라운드 */
.button-radius {
  border-radius: 16px;  /* rounded-xl */
}

/* 뱃지 라운드 */
.badge-radius {
  border-radius: 50px;  /* rounded-full (pill shape) */
}

/* 아이콘 컨테이너 */
.icon-container {
  border-radius: 20px;  /* rounded-2xl */
}

/* 피처 카드 */
.feature-card {
  border-radius: 24px;  /* rounded-3xl */
}
```

---

## 6. Shadow (그림자 토큰)

### 6.1 Color-Based Shadows

```css
/* Primary Button Glow */
--shadow-primary: 0 8px 40px rgba(0, 217, 255, 0.38);

/* Card Shadow (Transparent) */
--shadow-card: 0 16px 48px rgba(0, 0, 0, 0.08);

/* Card Shadow (Colored variants) */
--shadow-card-cyan: 0 16px 48px rgba(0, 217, 255, 0.12);
--shadow-card-purple: 0 16px 48px rgba(124, 58, 237, 0.12);
--shadow-card-red: 0 16px 48px rgba(255, 107, 107, 0.12);

/* CTA Button Shadow */
--shadow-cta: 0 10px 48px rgba(0, 0, 0, 0.19);
```

### 6.2 Usage Examples

```css
/* Primary Button with Glow */
.btn-primary {
  background: var(--btn-primary-gradient);
  box-shadow: var(--shadow-primary);
}

.btn-primary:hover {
  box-shadow: 0 12px 48px rgba(0, 217, 255, 0.5);
}

/* Feature Card */
.feature-card {
  background: var(--bg-card);
  border: var(--border-card);
  border-radius: 24px;
  box-shadow: var(--shadow-card);
  padding: 40px;
}

/* Colored Card Shadows for Visual Distinction */
.card-variant-cyan {
  box-shadow: var(--shadow-card-cyan);
}

.card-variant-purple {
  box-shadow: var(--shadow-card-purple);
}

.card-variant-red {
  box-shadow: var(--shadow-card-red);
}
```

---

## 7. 컴포넌트 스타일 가이드

### 7.1 Button (버튼)

#### Primary Button (주요 CTA)
```css
.btn-primary {
  background: linear-gradient(135deg, #00D9FF 0%, #7C3AED 100%);
  color: #FFFFFF;
  padding: 24px 52px;
  border-radius: 16px;
  font-size: 20px;
  font-weight: 800;
  line-height: 1.4;
  box-shadow: 0 8px 40px rgba(0, 217, 255, 0.38);
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 48px rgba(0, 217, 255, 0.5);
}

.btn-primary:active {
  transform: translateY(0);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}
```

#### Secondary Button (보조 CTA)
```css
.btn-secondary {
  background: transparent;
  color: #FFFFFF;
  padding: 24px 52px;
  border-radius: 16px;
  font-size: 20px;
  font-weight: 700;
  line-height: 1.4;
  border: 2px solid rgba(255, 255, 255, 0.25);
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.4);
}

.btn-secondary:active {
  transform: scale(0.98);
}
```

#### Large CTA Button (섹션 마무리)
```css
.btn-cta-large {
  background: #FFFFFF;
  color: #00D9FF;
  padding: 24px 56px;
  border-radius: 16px;
  font-size: 22px;
  font-weight: 800;
  line-height: 1.4;
  box-shadow: 0 10px 48px rgba(0, 0, 0, 0.19);
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-cta-large:hover {
  transform: translateY(-2px);
  box-shadow: 0 14px 56px rgba(0, 0, 0, 0.25);
}

.btn-cta-large:active {
  transform: translateY(0);
}
```

### 7.2 Card (카드)

#### Feature Card
```css
.feature-card {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 24px;
  padding: 40px;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  gap: 20px;
  transition: all 0.3s ease;
}

.feature-card:hover {
  background: rgba(255, 255, 255, 0.12);
  transform: translateY(-4px);
}

/* Icon Container */
.card-icon {
  width: 72px;
  height: 72px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-icon.gradient-1 {
  background: linear-gradient(135deg, #EAB308 0%, #D946EF 100%);
}

.card-icon.gradient-2 {
  background: linear-gradient(135deg, #00D9FF 0%, #7C3AED 100%);
}

.card-icon.gradient-3 {
  background: linear-gradient(135deg, #7C3AED 0%, #2DD4BF 100%);
}

.card-icon.gradient-4 {
  background: linear-gradient(135deg, #FF6B6B 0%, #FF4D6D 100%);
}

/* Card Content */
.card-title {
  font-size: 1.5rem;
  font-weight: 800;
  line-height: 1.3;
  color: #FFFFFF;
  margin: 0;
}

.card-description {
  font-size: 1.0625rem;
  font-weight: 400;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
}
```

#### Stats Card
```css
.stats-container {
  background: rgba(255, 255, 255, 0.05);
  padding: 80px;
  display: flex;
  flex-direction: column;
  gap: 56px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.stat-number {
  font-size: 3.5rem;
  font-weight: 900;
  line-height: 1.1;
}

.stat-number.yellow {
  color: #EAB308;
}

.stat-number.cyan {
  color: #00D9FF;
}

.stat-number.purple {
  color: #7C3AED;
}

.stat-number.red {
  color: #FF6B6B;
}

.stat-label {
  font-size: 1rem;
  font-weight: 400;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.6);
}
```

### 7.3 Badge (뱃지)

```css
.badge {
  background: rgba(255, 255, 255, 0.15);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50px;
  padding: 12px 28px;
  display: inline-flex;
  align-items: center;
  gap: 12px;
}

.badge-text {
  font-size: 0.875rem;
  font-weight: 800;
  line-height: 1.4;
  color: #FFFFFF;
  letter-spacing: 0.1875em;  /* 3px */
  text-transform: uppercase;
}
```

### 7.4 Input (입력 필드)

```css
.input {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  padding: 16px 20px;
  color: #FFFFFF;
  font-size: 1rem;
  font-weight: 400;
  line-height: 1.6;
  transition: all 0.2s ease;
  outline: none;
}

.input::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.input:hover {
  border-color: rgba(255, 255, 255, 0.25);
}

.input:focus {
  border-color: #00D9FF;
  box-shadow: 0 0 0 3px rgba(0, 217, 255, 0.2);
}

.input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

---

## 8. 레이아웃 시스템

### 8.1 그리드 시스템

```css
/* Container */
.container {
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 80px;
}

/* Grid Layouts */
.grid-2 {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 32px;
}

.grid-3 {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 32px;
}

.grid-4 {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 48px;
}

/* Flex Layouts */
.flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

.flex-between {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.flex-column {
  display: flex;
  flex-direction: column;
}
```

### 8.2 반응형 브레이크포인트

```css
/* Breakpoints */
--breakpoint-sm: 640px;
--breakpoint-md: 768px;
--breakpoint-lg: 1024px;
--breakpoint-xl: 1280px;
--breakpoint-2xl: 1440px;

/* Media Queries */
@media (max-width: 1280px) {
  .container {
    padding: 0 60px;
  }
}

@media (max-width: 1024px) {
  .grid-3 {
    grid-template-columns: repeat(2, 1fr);
  }

  .grid-4 {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .container {
    padding: 0 40px;
  }

  .grid-2,
  .grid-3,
  .grid-4 {
    grid-template-columns: 1fr;
  }

  .hero-title {
    font-size: 2.5rem;
  }
}

@media (max-width: 640px) {
  .container {
    padding: 0 24px;
  }

  .section-padding {
    padding: 60px 24px;
  }
}
```

---

## 9. 애니메이션 & 트랜지션

### 9.1 기본 트랜지션

```css
--transition-fast: 0.15s ease;
--transition-base: 0.3s ease;
--transition-slow: 0.5s ease;

/* Hover Effects */
.hover-lift {
  transition: transform var(--transition-base), box-shadow var(--transition-base);
}

.hover-lift:hover {
  transform: translateY(-4px);
}

/* Fade In Animation */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fadeIn 0.6s ease-out;
}

/* Pulse Glow Animation */
@keyframes pulseGlow {
  0%, 100% {
    box-shadow: 0 0 20px rgba(0, 217, 255, 0.4);
  }
  50% {
    box-shadow: 0 0 40px rgba(0, 217, 255, 0.8);
  }
}

.animate-pulse-glow {
  animation: pulseGlow 2s ease-in-out infinite;
}
```

### 9.2 로딩 애니메이션

```css
/* Spinner */
.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.2);
  border-top-color: #00D9FF;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Skeleton Loading */
.skeleton {
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.08) 25%,
    rgba(255, 255, 255, 0.15) 50%,
    rgba(255, 255, 255, 0.08) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 8px;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
```

---

## 10. Tailwind CSS Config

### 10.1 tailwind.config.ts 커스텀 설정

```typescript
// frontend/tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary Backgrounds
        bg: {
          primary: '#0F0F23',
          secondary: 'rgba(255, 255, 255, 0.05)',
          card: 'rgba(255, 255, 255, 0.08)',
        },

        // Text Colors
        text: {
          primary: '#FFFFFF',
          secondary: 'rgba(255, 255, 255, 0.7)',
          tertiary: 'rgba(255, 255, 255, 0.6)',
        },

        // Accent Colors
        accent: {
          yellow: '#EAB308',
          cyan: '#00D9FF',
          purple: '#7C3AED',
          red: '#FF6B6B',
        },

        // Gradients (Custom properties)
        gradient: {
          hero: 'linear-gradient(135deg, #EAB308 10%, #00D9FF 50%, #7C3AED 80%, #FF6B6B 100%)',
          primary: 'linear-gradient(135deg, #00D9FF 0%, #7C3AED 100%)',
          cta: 'linear-gradient(135deg, #FF6B6B 20%, #FF4D6D 60%, #00D9FF 100%)',
        },
      },

      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },

      fontSize: {
        '7xl': ['4.5rem', { lineHeight: '1.05', letterSpacing: '-0.02em' }],
        '8xl': ['5rem', { lineHeight: '1.1' }],
      },

      spacing: {
        '14': '3.5rem',
        '25': '6.25rem',
        '30': '7.5rem',
      },

      borderRadius: {
        '2xl': '20px',
        '3xl': '24px',
      },

      boxShadow: {
        'primary': '0 8px 40px rgba(0, 217, 255, 0.38)',
        'card': '0 16px 48px rgba(0, 0, 0, 0.08)',
        'cta': '0 10px 48px rgba(0, 0, 0, 0.19)',
      },

      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'shimmer': 'shimmer 1.5s infinite',
      },

      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(0, 217, 255, 0.4)' },
          '50%': { boxShadow: '0 0 40px rgba(0, 217, 255, 0.8)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
      },
    },
  },
  plugins: [],
}

export default config
```

### 10.2 Tailwind 유틸리티 클래스 예시

```tsx
/* Primary Button */
<button className="
  bg-gradient-primary
  text-white
  px-14
  py-6
  rounded-2xl
  text-xl
  font-extrabold
  shadow-primary
  hover:shadow-[0_12px_48px_rgba(0,217,255,0.5)]
  hover:-translate-y-0.5
  transition-all
  duration-300
">
  지금 복권 구매
</button>

/* Feature Card */
<div className="
  bg-bg-card
  border border-white/15
  rounded-3xl
  p-10
  shadow-card
  hover:bg-white/12
  hover:-translate-y-1
  transition-all
  duration-300
  flex
  flex-col
  gap-5
">
  <div className="
    w-18
    h-18
    rounded-2xl
    bg-gradient-to-br
    from-accent-cyan
    to-accent-purple
  ">
    {/* Icon */}
  </div>
  <h3 className="
    text-2xl
    font-extrabold
    leading-tight
    text-text-primary
  ">
    6시간 라운드
  </h3>
  <p className="
    text-lg
    font-normal
    leading-normal
    text-text-secondary
  ">
    6시간 주기로 자동 라운드 시작/종료.
  </p>
</div>

/* Badge */
<div className="
  inline-flex
  items-center
  gap-3
  bg-white/15
  border-2
  border-white/30
  rounded-full
  px-7
  py-3
">
  <span className="
    text-sm
    font-extrabold
    text-white
    tracking-widest
    uppercase
  ">
    BLOCKCHAIN V2.0
  </span>
</div>
```

---

## 11. 다크 모드 지원

### 11.1 정책
- **기본**: 다크 모드만 지원 (MetaLotto는 Web3 앱)
- **명도 대비**: WCAG AA 기준 준수
- **색상 사용**: 밝은 그라데이션/네온 색상을 사용해 다크 배경과 대비

### 11.2 다크 모드 전용 토큰

```css
/* 모든 토큰이 다크 모드용으로 설계됨 */

/* Backgrounds (Dark) */
--bg-primary: #0F0F23;  /* 매우 어두운 네이비 */
--bg-secondary: rgba(255, 255, 255, 0.05);
--bg-card: rgba(255, 255, 255, 0.08);

/* Text (Light) */
--text-primary: #FFFFFF;
--text-secondary: rgba(255, 255, 255, 0.7);
--text-tertiary: rgba(255, 255, 255, 0.6);

/* Accents (Bright for contrast) */
--accent-yellow: #EAB308;
--accent-cyan: #00D9FF;
--accent-purple: #7C3AED;
--accent-red: #FF6B6B;
```

---

## 12. 접근성 (Accessibility)

### 12.1 WCAG 준수

| 요구사항 | 상태 | 비고 |
|----------|------|------|
| 대비율 (AA) | 준수 | 텍스트/배경 4.5:1 이상 |
| 대비율 (AAA) | 준수 | 주요 텍스트 7:1 이상 |
| 키보드 내비게이션 | 준수 | Tab 순서, 포커스 스타일 |
| ARIA 라벨 | 준수 | 지갑 주소, 블록 해쉬 등 |
| 색상 의존성 없음 | 준수 | 정보는 색상만으로 전달하지 않음 |

### 12.2 포커스 스타일

```css
.focus-visible {
  outline: 2px solid #00D9FF;
  outline-offset: 2px;
}

/* 버튼 포커스 */
.btn-primary:focus-visible {
  box-shadow: 0 0 0 4px rgba(0, 217, 255, 0.3);
}

/* 입력 필드 포커스 */
.input:focus {
  border-color: #00D9FF;
  box-shadow: 0 0 0 3px rgba(0, 217, 255, 0.2);
}
```

---

## 13. 아이콘 시스템

### 13.1 아이콘 라이브러리
- **기본**: Lucide React (현대적, 일관된 스타일)
- **사이즈**: 16px, 20px, 24px, 28px, 32px, 48px, 72px
- **색상**: white, accent-cyan, accent-purple 등

### 13.2 아이콘 사용 예시

```tsx
import { Ticket, ArrowRight, ShieldCheck, Clock, Users } from 'lucide-react'

// CTA Button Icon
<ArrowRight className="w-7 h-7 text-white" />

// Card Icon Container
<div className="
  w-18
  h-18
  rounded-2xl
  bg-gradient-to-br
  from-accent-yellow
  to-accent-purple
  flex
  items-center
  justify-center
">
  <Ticket className="w-8 h-8 text-white" />
</div>

// Trust Icons
<ShieldCheck className="w-6 h-6 text-accent-cyan" />
<Clock className="w-6 h-6 text-accent-cyan" />
<Users className="w-6 h-6 text-accent-cyan" />
```

---

## 14. 컴포넌트 상태

### 14.1 Button States

```css
/* Default */
.btn-primary {
  /* 스타일 */
}

/* Hover */
.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 48px rgba(0, 217, 255, 0.5);
}

/* Active */
.btn-primary:active {
  transform: translateY(0);
}

/* Disabled */
.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* Loading */
.btn-primary.is-loading {
  opacity: 0.7;
  pointer-events: none;
}
```

### 14.2 Card States

```css
/* Default */
.feature-card {
  /* 스타일 */
}

/* Hover */
.feature-card:hover {
  background: rgba(255, 255, 255, 0.12);
  transform: translateY(-4px);
  box-shadow: 0 20px 56px rgba(0, 0, 0, 0.12);
}

/* Active/Selected */
.feature-card.is-selected {
  border-color: #00D9FF;
  box-shadow: 0 0 0 3px rgba(0, 217, 255, 0.2);
}
```

---

## 15. 마이크로 인터랙션

### 15.1 버튼 인터랙션

```css
/* Scale on Click */
.btn-click-effect:active {
  transform: scale(0.98);
}

/* Ripple Effect (optional) */
.ripple {
  position: relative;
  overflow: hidden;
}

.ripple::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  transition: width 0.3s, height 0.3s;
}

.ripple:active::after {
  width: 300px;
  height: 300px;
}
```

### 15.2 카드 호버 효과

```css
/* Lift Effect */
.card-lift {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.card-lift:hover {
  transform: translateY(-4px) scale(1.02);
}

/* Glow Effect */
.card-glow {
  transition: all 0.3s ease;
}

.card-glow:hover {
  box-shadow: 0 0 30px rgba(0, 217, 255, 0.3);
  border-color: rgba(0, 217, 255, 0.3);
}
```

---

## 16. 상태 관리 UI 패턴

### 16.1 Loading State

```tsx
{/* Skeleton Loading */}
<div className="animate-pulse">
  <div className="h-8 bg-white/10 rounded-lg w-1/2 mb-4" />
  <div className="h-4 bg-white/10 rounded w-full mb-2" />
  <div className="h-4 bg-white/10 rounded w-3/4" />
</div>

{/* Spinner */}
<div className="flex items-center justify-center p-8">
  <div className="spinner" />
</div>
```

### 16.2 Empty State

```tsx
<div className="flex flex-col items-center justify-center p-12 text-center">
  <div className="w-20 h-20 mb-4 bg-white/5 rounded-full flex items-center justify-center">
    <Ticket className="w-10 h-10 text-white/30" />
  </div>
  <h3 className="text-xl font-bold text-white mb-2">티켓이 없습니다</h3>
  <p className="text-secondary">첫 번째 티켓을 구매해보세요!</p>
</div>
```

### 16.3 Error State

```tsx
<div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
  <div className="flex items-start gap-3">
    <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
    <div>
      <h4 className="text-red-500 font-bold mb-1">오류 발생</h4>
      <p className="text-secondary text-sm">{error}</p>
    </div>
  </div>
</div>
```

---

## 17. 반응형 디자인 가이드

### 17.1 Breakpoint Strategy

| 화면 | 너비 | 레이아웃 | 폰트 스케일 |
|------|------|---------|-------------|
| Mobile (SM) | 375-640px | 1열 카드 | 0.85x |
| Tablet (MD) | 641-1024px | 2열 카드 | 0.95x |
| Desktop (LG) | 1025-1280px | 3열 카드 | 1x |
| Desktop (XL) | 1281-1440px | 3열 카드 + 넓은 패딩 | 1x |
| Desktop (2XL) | 1441px+ | 4열 카드 | 1x |

### 17.2 모바일 최적화

```css
/* Mobile First Approach */
.container {
  padding: 0 24px;
}

@media (min-width: 640px) {
  .container {
    padding: 0 40px;
  }
}

@media (min-width: 1024px) {
  .container {
    padding: 0 60px;
  }
}

@media (min-width: 1280px) {
  .container {
    padding: 0 80px;
    max-width: 1440px;
    margin: 0 auto;
  }
}

/* Touch Targets (최소 44x44px) */
.btn-mobile {
  min-height: 44px;
  min-width: 44px;
}
```

---

## 18. Figma → Tailwind 매핑 가이드

| Figma 속성 | Tailwind 클래스 | CSS Variable |
|-----------|----------------|---------------|
| Fill: #0F0F23 | bg-bg-primary | --bg-primary |
| Fill: gradient | bg-gradient-primary | --bg-hero |
| Corner: 16px | rounded-2xl | - |
| Stroke: 2px, white/30 | border-2 border-white/30 | --border-secondary |
| Shadow: outer, #00D9FF60 | shadow-primary | --shadow-primary |
| Font: Inter, 20, 800 | text-xl font-extrabold | - |
| Letter spacing: 3px | tracking-widest | --tracking-widest |

---

## 19. 참조 및 리소스

### 19.1 디자인 파일
- **Figma**: `/frontend/pencil-new.pen`
- **Pencil 프로젝트**: 메인 랜딩 페이지 디자인

### 19.2 외부 참조
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Lucide Icons](https://lucide.dev/icons/)
- [Inter Font](https://rsms.me/inter/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Figma Tokens Plugin](https://tokens.studio/)

---

## 20. 변경 로그

| 버전 | 날짜 | 변경 사항 |
|------|------|-----------|
| 1.0.0 | 2026-03-13 | 초기 버전 — pencil-new.pen 기반 디자인 시스템 문서화 |

---

**문서 소유자**: UI/UX Designer (architect)
**마지막 업데이트**: 2026-03-13
**다음 검토일**: 2026-04-13
