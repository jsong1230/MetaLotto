# MetaLotto

메타디움 블록체인 기반 투명한 복권 DApp — META 토큰으로 티켓 구매, 온체인 추첨, 자동 상금 지급

## 개요

MetaLotto는 메타디움 블록체인(Metadium Mainnet) 위에서 구동되는 완전히 탈중앙화된 복권 DApp입니다. 온체인 난수 생성 기술을 사용하여 100% 투명하고 검증 가능한 추첨 시스템을 제공합니다.

### 핵심 가치

- **온체인 투명성**: 모든 추첨 과정이 블록체인에 기록됩니다.
- **META 토큰 실사용**: 티켓 구매와 상금 지급에 META 토큰을 사용합니다.
- **자생적 생태계**: 상금의 10%가 커뮤니티 펀드에 기부되어 생태계 투자 재원이 됩니다.
- **낮은 진입 장벽**: 기존 지갑(MetaMask 등) 사용, 낮은 가스비.

---

## 기술 스택

- **Backend**: Solidity ^0.8.24 + Foundry + OpenZeppelin v5.x
- **Frontend**: Next.js 15 (App Router) + TypeScript + Tailwind CSS + wagmi/viem
- **Chain**: Metadium Mainnet (Chain ID: 11)

---

## 시작하기

### 선행 요구사항

- Node.js 18.x 이상
- Foundry (forge, cast, anvil)

### 설치

```bash
# 의존성 설치
make install-all

# 개발 모드 시작
make dev
```

### 개별 설치

```bash
# Foundry 설치
curl -L https://foundry.paradigm.xyz | bash
source ~/.bashrc  # 또는 source ~/.zshrc
foundryup

# OpenZeppelin 설치
make install-contracts

# Frontend 의존성 설치
make install-frontend
```

---

## 디렉토리 구조

```
MetaLotto/
├── contracts/                      # Foundry 스마트 컨트랙트
│   ├── src/
│   │   └── MetaLotto.sol          # 메인 컨트랙트
│   ├── test/
│   ├── script/
│   └── foundry.toml
│
├── frontend/                       # Next.js DApp
│   ├── src/
│   │   ├── app/                   # App Router 페이지
│   │   ├── components/
│   │   ├── hooks/
│   │   └── lib/
│   └── package.json
│
├── docs/                           # 프로젝트 문서
│   ├── project/
│   ├── system/
│   ├── specs/
│   ├── api/
│   └── db/
│
└── Makefile
```

---

## 명령어

### 개발

```bash
# Frontend 개발 서버
make dev

# 컨트랙트 빌드
cd contracts && forge build

# 컨트랙트 테스트
make test
```

### 테스트

```bash
# 스마트 컨트랙트 테스트
make test

# 프론트엔드 단위 테스트
make test:unit

# 프론트엔드 통합 테스트
make test:integration

# E2E 테스트
make test:e2e
```

### 빌드

```bash
# 전체 빌드
make build
```

### 배포

```bash
# 환경 변수 설정 (.env 파일 생성)
echo "PRIVATE_KEY=your_private_key" >> contracts/.env
echo "COMMUNITY_FUND=0x..." >> contracts/.env
echo "OPERATION_FUND=0x..." >> contracts/.env
echo "METADIUM_RPC_URL=https://api.metadium.com/prod" >> contracts/.env

# 테스트넷 배포
cd contracts && forge script script/DeployTestnet.s.sol --rpc-url $METADIUM_TESTNET_RPC_URL --broadcast

# 메인넷 배포
make deploy-contracts
```

---

## 스마트 컨트랙트

### 주요 기능

| 기능 | 설명 |
|------|------|
| F-01 라운드 관리 | 6시간 라운드 자동 생성/종료 |
| F-02 티켓 구매 | 1~100 META 티켓 구매 |
| F-02 온체인 추첨 | blockhash 기반 난수 생성 |
| F-02 상금 분배 | 90/5/5 (당첨자/커뮤니티/운영) 자동 분배 |
| F-08 비상 정지 | 긴급 상황 시 컨트랙트 일시정지 |

### 상태 머신

```
[Open] → [Closing] → [Completed] → [Open] (다음 라운드)
   ↓           ↓
   └──→ [Cancelled] (최소 인원 미달)
```

### API 문서

- [스마트 컨트랙트 API 스펙](/docs/api/F-01-F-08-smart-contracts.md)
- [상태 매핑 (State Mapping)](/docs/db/F-01-F-08-state-mapping.md)

---

## 프론트엔드

### 기술 스택

- Next.js 15 (App Router)
- TypeScript 5.x
- Tailwind CSS 3.x
- wagmi 2.x (React Hooks for Ethereum)
- viem 2.x (TypeScript Ethereum library)
- Zustand 4.x (상태 관리)

### 주요 페이지

| 페이지 | 경로 | 설명 |
|--------|------|------|
| 홈 | `/` | 현재 라운드 현황, 티켓 구매 |
| 히스토리 | `/history` | 과거 라운드 결과 |
| 내 티켓 | `/my-tickets` | 내 참여 내역, 환불/미수령 상금 |

---

## Metadium 네트워크

| 네트워크 | Chain ID | RPC URL | Explorer |
|----------|----------|---------|----------|
| Mainnet | 11 | `https://api.metadium.com/prod` | `https://explorer.metadium.com` |
| Testnet | 12 | `https://api.metadium.com/dev` | `https://testnetexplorer.metadium.com` |

### Faucet (Testnet)

- 테스트넷 META 토큰: [Metadium Faucet](https://faucet.metadium.com)

---

## 보안

- OpenZeppelin v5.x 라이브러리 사용
- ReentrancyGuard 적용
- Pausable 패턴 (비상 정지)
- CEI (Checks-Effects-Interactions) 패턴
- Pull Pattern (송금 실패 대비)

---

## 기여하기

1. Fork the repository
2. Feature 브랜치 생성 (`git checkout -b feature/amazing-feature`)
3. Commit 변경 (`git commit -m 'feat: Add amazing feature'`)
4. Push 브랜치 (`git push origin feature/amazing-feature`)
5. Pull Request 생성

---

## 라이선스

MIT License

---

## 문서

- [PRD](/docs/project/prd.md)
- [기능 백로그](/docs/project/features.md)
- [로드맵](/docs/project/roadmap.md)
- [시스템 설계](/docs/system/system-design.md)
- [기능별 설계](/docs/specs/)
- [API 스펙](/docs/api/)
- [DB 스키마](/docs/db/)

---

## 연락처

- 프로젝트: [MetaLotto GitHub](https://github.com/metadium-github/MetaLotto)
- 문의: support@metadium.com
