# MetaLotto — Product Requirements Document

**Version**: 1.1
**Date**: 2026-03-12
**Author**: Jeffrey Song
**Status**: Draft

---

## 1. Problem Statement

메타디움 블록체인은 DID 중심의 인프라로 구축되었으나, 일반 사용자가 일상적으로 참여할 수 있는 소비자 대상 DApp이 부족하다. META 토큰의 실질적 활용처가 제한적이어서 기존 홀더의 이탈 위험이 있고, 새로운 유저 유입을 위한 킬러 앱이 없는 상황이다.

기존 온라인 복권/추첨 시스템은 중앙화된 서버에서 운영되어 추첨 과정의 투명성을 검증할 수 없고, 운영자의 조작 가능성에 대한 신뢰 문제가 존재한다. 블록체인 기반 복권은 이 문제를 근본적으로 해결하면서, 사용자에게 재미와 기대감을 제공하는 킬러 유즈케이스가 될 수 있다.

**영향 범위**: 메타디움 생태계 전체 — 토큰 유틸리티, 온체인 활성도, 커뮤니티 성장에 직결

---

## 2. Goals

| # | Goal | Measurement |
|---|------|-------------|
| **G1** | 메타디움 체인의 일일 활성 주소(DAA) 30% 증가 | 런칭 후 90일 시점 측정 |
| **G2** | META 토큰의 실사용 트랜잭션 볼륨 2배 증가 | 런칭 전 vs 후 비교 |
| **G3** | 월 1,000명 이상의 반복 참여 유저 확보 | MAU 기준 |
| **G4** | 커뮤니티 펀드를 통한 자생적 생태계 투자 재원 확보 | 월 펀드 적립액 |
| **G5** | 외부 크립토 유저의 메타디움 체인 첫 진입 유도 | 신규 지갑 생성 수 |

---

## 3. Non-Goals

| # | Non-Goal | Rationale |
|---|----------|-----------|
| **NG1** | 법정화폐(KRW, USD) 직접 결제 지원 | 규제 리스크가 크고, v1에서는 META 토큰 중심으로 집중 |
| **NG2** | 모바일 네이티브 앱 출시 | v1은 반응형 웹 + PWA로 모바일 대응. 앱스토어 복권/도박 심사 리젝 리스크 회피. PMF 확인 후(MAU 3,000+) 네이티브 검토 |
| **NG3** | 다른 EVM 체인(Polygon, BSC 등) 동시 지원 | 메타디움 생태계 성장이 우선. 멀티체인은 PMF 확인 후 |
| **NG4** | 복잡한 복권 구조(파워볼 방식 등) | 단순한 UX가 핵심. 복잡한 게임 메커니즘은 유저 검증 후 추가 |
| **NG5** | 자체 DEX 또는 스왑 기능 내장 | 기존 DEX와의 통합으로 해결, 직접 구축은 범위 밖 |

---

## 4. User Stories

### Persona A: META 홀더 (기존 커뮤니티)

- **As a** META 홀더, **I want to** 보유 중인 META로 복권 티켓을 구매할 수 있어서 **so that** 토큰을 홀딩하는 것 외에 재미있는 활용처를 갖는다.
- **As a** META 홀더, **I want to** 추첨 과정을 온체인에서 직접 검증할 수 있어서 **so that** 공정성을 신뢰할 수 있다.
- **As a** META 홀더, **I want to** 과거 추첨 결과와 당첨 확률을 투명하게 볼 수 있어서 **so that** 참여 여부를 합리적으로 결정할 수 있다.
- **As a** META 홀더, **I want to** 당첨 시 자동으로 지갑에 상금이 입금되어서 **so that** 별도의 클레임 절차 없이 편하게 받을 수 있다.

### Persona B: 일반 크립토 유저 (신규 유입)

- **As a** 일반 크립토 유저, **I want to** MetaMask 등 기존 지갑을 연결해 바로 참여할 수 있어서 **so that** 새로운 지갑을 만들지 않아도 된다.
- **As a** 일반 크립토 유저, **I want to** 메타디움 체인 추가와 META 토큰 획득 과정이 안내되어서 **so that** 처음이어도 쉽게 시작할 수 있다.
- **As a** 일반 크립토 유저, **I want to** 낮은 가스비로 티켓을 구매할 수 있어서 **so that** 소액으로도 부담 없이 참여할 수 있다.

### Persona C: 운영/관리자

- **As an** 관리자, **I want to** 라운드별 파라미터(기간, 티켓 가격, 상금 비율)를 조정할 수 있어서 **so that** 시장 상황에 맞게 운영할 수 있다.
- **As an** 관리자, **I want to** 커뮤니티 펀드 적립 현황을 실시간으로 모니터링할 수 있어서 **so that** 생태계 투자 계획을 세울 수 있다.
- **As an** 관리자, **I want to** 비상 시 컨트랙트를 일시 중단할 수 있어서 **so that** 보안 이슈 발생 시 신속 대응이 가능하다.

---

## 5. Requirements

### Must-Have (P0)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| **P0-1** | **스마트 컨트랙트: 라운드 관리** — 6시간 단위(하루 4회) 라운드 생성, 티켓 판매, 추첨, 상금 분배의 전체 생명주기를 컨트랙트로 관리 | Given 현재 라운드가 종료되면, When 추첨이 완료되면, Then 새 라운드가 자동 시작되고 상금이 분배된다 |
| **P0-2** | **Blockhash 기반 난수 생성** — `blockhash(block.number - N)`을 활용하여 당첨자 선정. 추첨 트리거 이후 미래 블록 해시를 사용하여 예측 불가능성 확보. v2에서 VRF 업그레이드 경로 보유 | Given 추첨 시점이 되면, When 지정된 미래 블록이 생성되면, Then 해당 블록 해시 기반으로 당첨자가 결정되고 누구나 검증할 수 있다 |
| **P0-3** | **티켓 구매 시스템** — META 토큰으로 티켓 구매. 1장 단위 구매 및 복수 구매 지원 | Given 유저가 충분한 META를 보유하면, When 티켓 수량을 선택하고 구매하면, Then META가 차감되고 티켓이 발급된다 |
| **P0-4** | **상금 풀 분배** — 풀의 90%를 당첨자에게, 5%를 커뮤니티 펀드, 5%를 운영비로 분배 | Given 라운드 종료 시, When 상금 분배가 실행되면, Then 정확한 비율로 각 주소에 전송된다 |
| **P0-5** | **자동 상금 지급** — 당첨자에게 자동으로 META 전송 (별도 클레임 불필요) | Given 당첨자가 선정되면, When 분배 트랜잭션이 실행되면, Then 당첨자 지갑에 자동 입금된다 |
| **P0-6** | **웹 프론트엔드** — 지갑 연결, 티켓 구매, 라운드 현황, 결과 확인이 가능한 반응형 웹 DApp | Given 유저가 웹사이트에 접속하면, When MetaMask를 연결하면, Then 현재 라운드 정보와 티켓 구매 UI가 표시된다 |
| **P0-7** | **이벤트 로그 및 투명성** — 모든 주요 액션(구매, 추첨, 분배)이 이벤트로 기록되어 블록 익스플로러에서 확인 가능 | Given 어떤 액션이 발생하면, When 트랜잭션이 컨펌되면, Then 해당 이벤트 로그가 익스플로러에서 조회 가능하다 |
| **P0-8** | **보안: Pause/Unpause** — 긴급 상황 시 컨트랙트 일시 중단 기능 (Owner only) | Given 보안 이슈가 감지되면, When Owner가 pause를 실행하면, Then 모든 티켓 구매와 추첨이 중단된다 |

### Nice-to-Have (P1)

| ID | Requirement | Description |
|----|-------------|-------------|
| **P1-1** | **라운드 히스토리 대시보드** — 과거 라운드별 참여자 수, 풀 규모, 당첨자, 당첨 확률 등 통계 |
| **P1-2** | **추첨 카운트다운 타이머** — 다음 추첨까지 실시간 카운트다운 표시 |
| **P1-3** | **다단계 당첨 구조** — 1등/2등/3등 분리 (예: 70%/20%/10%) |
| **P1-4** | **소셜 공유 기능** — 당첨 결과를 Twitter/Telegram으로 공유 |
| **P1-5** | **온보딩 가이드** — 메타디움 체인 추가, META 토큰 획득 방법 등 신규 유저용 가이드 |
| **P1-6** | **다국어 지원** — 한국어/영어/중국어/일본어 4개 언어 |
| **P1-7** | **알림 시스템** — 추첨 결과, 당첨 여부를 Telegram 봇 또는 이메일로 알림 |
| **P1-8** | **다중 티어 풀** — 100 META(기본) / 500 META / 1,000 META 등 복수 가격대 풀 운영으로 유저 선택지 확대 |
| **P1-9** | **PWA (Progressive Web App)** — 홈 화면 추가, 오프라인 캐싱, 푸시 알림 지원으로 네이티브 앱에 준하는 모바일 UX 제공 |

### Future Considerations (P2)

| ID | Requirement | Description |
|----|-------------|-------------|
| **P2-1** | **No-Loss 복권 모드** — 스테이킹 이자로 상금을 구성하는 원금 보장 모드 |
| **P2-2** | **NFT 티켓** — 복권 티켓을 NFT로 발행하여 수집/거래 가능 |
| **P2-3** | **거버넌스 연동** — 커뮨니티 펀드 사용처를 DAO 투표로 결정 |
| **P2-4** | **멀티체인 확장** — Polygon, Arbitrum 등 타 EVM 체인 지원 |
| **P2-5** | **미니게임 통합** — 복권 외 추가 게임 모듈(가위바위보, 코인 플립 등) |

---

## 6. Technical Architecture (High-Level)

### Smart Contract Stack

```
MetaLotto (Solidity ^0.8.x)
├── LottoCore.sol          — 라운드 생명주기, 티켓 관리
├── LottoRandomness.sol    — Blockhash 기반 난수 생성 + 미래 VRF 업그레이드 인터페이스
├── LottoPrizePool.sol     — 상금 풀 관리, 분배 로직
├── LottoAdmin.sol         — 파라미터 설정, Pause/Unpause
└── interfaces/
    └── IRandomnessProvider.sol — 난수 프로바이더 추상화 (Blockhash → VRF 교체 가능)
```

### Frontend Stack

```
Web DApp (반응형 + PWA)
├── Framework: Next.js (React) + TypeScript
├── Web3: wagmi + RainbowKit (MetaMask, WalletConnect, Coinbase Wallet 등)
├── State: Zustand 또는 React Query
├── Styling: Tailwind CSS
├── PWA: next-pwa (홈 화면 추가, 푸시 알림, 오프라인 캐싱)
└── Hosting: Vercel 또는 IPFS (탈중앙화 옵션)
```

### Randomness Strategy

**v1: Blockhash 방식 (외부 의존성 없음)**

추첨 시 `blockhash(block.number - N)`을 사용하여 난수를 생성한다. 조작 방지를 위해 다음 메커니즘을 적용:

- **Future Block 패턴**: 추첨 트리거 트랜잭션 이후 N블록 뒤의 블록 해시를 사용 (트리거 시점에 결과 예측 불가)
- **다중 블록 해시 조합**: 단일 블록이 아닌 여러 블록의 해시를 XOR 연산으로 조합하여 단일 validator 조작 난이도 상승
- **티켓 구매 해시 믹싱**: 각 참여자의 구매 트랜잭션 해시를 시드에 포함하여 추가 엔트로피 확보

**Security Note**: Validator가 해시를 조작하려면 블록 보상을 포기해야 하므로, 상금 풀 < 블록 보상인 동안은 경제적으로 안전하다. 풀 규모가 커지면 v2에서 VRF로 업그레이드.

**v2 (Future): VRF 업그레이드 경로**

`IRandomnessProvider` 인터페이스를 통해 추상화되어 있으므로, Chainlink VRF 또는 drand 오라클 연동 구현체로 교체 가능.

### 라운드 흐름

```
[Open] → 티켓 판매 중 (6시간, 하루 4라운드)
  ↓
[Closing] → 판매 종료, 추첨 트리거 (미래 블록 지정)
  ↓
[Drawing] → 지정 블록 도달, blockhash로 당첨자 선정
  ↓
[Completed] → 상금 자동 분배, 결과 기록
  ↓
[Next Round] → 새 라운드 자동 시작
```

### 상금 분배 구조 (v1)

```
Total Pool (100%)
├── 당첨자 상금: 90%
├── 커뮤니티 펀드: 5%  → 멀티시그 지갑
└── 운영비: 5%         → 운영 지갑
```

---

## 7. Success Metrics

### Leading Indicators (런칭 후 1~4주)

| Metric | Target | Stretch | Measurement |
|--------|--------|---------|-------------|
| 첫 주 티켓 구매 고유 지갑 수 | 200+ | 500+ | 온체인 이벤트 로그 |
| 일일 평균 티켓 판매량 | 100장+ | 500장+ | 컨트랙트 이벤트 |
| 지갑 연결 → 티켓 구매 전환율 | 30%+ | 50%+ | 프론트엔드 분석 |
| 평균 구매 소요 시간 | < 60초 | < 30초 | UX 테스트 |
| 트랜잭션 실패율 | < 2% | < 0.5% | 온체인 모니터링 |

### Lagging Indicators (런칭 후 1~3개월)

| Metric | Target | Stretch | Measurement |
|--------|--------|---------|-------------|
| MAU (월 활성 유저) | 1,000+ | 3,000+ | 고유 지갑 수 |
| 재참여율 (2회 이상 구매) | 40%+ | 60%+ | 온체인 분석 |
| 메타디움 체인 DAA 증가율 | +30% | +100% | 체인 익스플로러 |
| 커뮤니티 펀드 월 적립액 | 확인 필요 | — | 멀티시그 지갑 잔액 |
| 신규 지갑 생성 (MetaLotto 기인) | 500+/월 | 2,000+/월 | 첫 트랜잭션이 MetaLotto인 지갑 |

---

## 8. Open Questions

| # | Question | Owner | Blocking? |
|---|----------|-------|-----------|
| **Q1** | ~~VRF 호환성~~ → **Resolved**: v1은 blockhash 방식 채택. 풀 규모 확대 시 VRF 업그레이드 검토 | Engineering | No (해결됨) |
| **Q2** | ~~한국 법률~~ → **Resolved**: 케이맨 제도 법인으로 한국 사행성 규제 직접 적용 대상 아님. 케이맨 관할권 내 규제 확인 필요 | Legal | No (대폭 경감) |
| **Q3** | ~~적정 티켓 가격~~ → **Resolved**: 기본 티켓 가격 100 META (현재 시세 약 1,400원). 적정 진입 가격으로 풀 규모 확보와 참여 장벽 균형. 상위 티어 풀(500/1000 META)은 P1으로 검토 | Product/Biz | No (해결됨) |
| **Q4** | 커뮤니티 펀드의 거버넌스 구조 — 멀티시그 구성원은 누구인가? | Stakeholder | No |
| **Q5** | 보안 감사(Audit) 범위와 예산은? 외부 감사 필수인가? | Engineering/Biz | No |
| **Q6** | 기존 메타디움 DID 인프라와의 시너지 가능성 — 본인 인증 연계 등 | Product | No |
| **Q7** | 메타디움 재단 또는 핵심 팀의 지원/파트너십 가능성은? | Biz | No |

---

## 9. Timeline Considerations

### Phase 1: MVP (예상 6~8주)

| Week | Milestone |
|------|-----------|
| 1-2 | 스마트 컨트랙트 핵심 로직 (LottoCore, PrizePool, Randomness) 개발 |
| 3-4 | Blockhash 난수 로직 테스트, 테스트넷 배포, 프론트엔드 기본 UI |
| 5-6 | 프론트엔드 완성 (지갑 연결, 구매, 결과 확인), 통합 테스트 |
| 7-8 | 보안 리뷰, 버그 픽스, 테스트넷 공개 베타 |

### Phase 2: Mainnet Launch (예상 2~4주)

| Week | Milestone |
|------|-----------|
| 9-10 | 보안 감사 (외부 또는 내부), 최종 파라미터 확정 |
| 11-12 | 메인넷 배포, 소프트 런칭, 커뮤니티 이벤트 |

### Dependencies

- ~~VRF 프로바이더 선정~~ → v1은 blockhash 방식으로 확정, 외부 의존성 없음
- ~~법률 검토~~ → 케이맨 법인으로 주요 블로커 해소. 케이맨 관할권 규제만 확인
- META 토큰 유동성 확보 (DEX 파트너십 등)
- ~~적정 티켓 가격~~ → 100 META로 확정

---

## 10. Risk Assessment

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Blockhash 조작 가능성 (validator) | Medium | Low | Future block 패턴 + 다중 블록 해시 조합 + 참여자 해시 믹싱으로 경제적 조작 비용 >> 기대 이익 구조 확보. 풀 확대 시 VRF 업그레이드 |
| 케이맨 관할권 규제 변경 | Medium | Low | 현지 법률 자문 확보, 이용약관에 관할권 조항 명시, 필요시 지역별 접근 제한 |
| 낮은 초기 참여율 → 상금 풀 매력 부족 | High | Medium | 초기 시딩 이벤트, 재단 보조금으로 최소 풀 보장 |
| 스마트 컨트랙트 취약점 | Critical | Low | 외부 감사, OpenZeppelin 기반 개발, 긴급 중단 기능 |
| META 토큰 가격 급변동 | Medium | High | USD 기준 동적 티켓 가격 조정 메커니즘 (P1으로 검토) |

---

## Appendix: Competitive Landscape

| Project | Chain | Model | 차별점 대비 MetaLotto |
|---------|-------|-------|----------------------|
| PoolTogether | Ethereum/Polygon | No-loss lottery | MetaLotto는 직접적 상금 모델로 더 높은 기대수익 |
| Pancake Lottery | BSC | Simple lottery | MetaLotto는 메타디움 생태계 성장에 직접 기여 |
| LotteryEth | Ethereum | Basic lottery | MetaLotto는 낮은 가스비 + 커뮤니티 펀드 구조 |

---

*이 문서는 살아있는 문서입니다. 개발 진행에 따라 지속적으로 업데이트됩니다.*
