# 기능 백로그

## 기능 목록

| ID | 기능명 | 설명 | 우선순위 | 의존성 | 병렬 그룹 | 마일스톤 | 상태 |
|----|--------|------|----------|--------|-----------|----------|------|
| F-01 | 라운드 관리 | 6시간 단위 라운드 생성/종료/추첨 자동화 | P0 | - | - | M1 | ✅ 완료 |
| F-02 | Blockhash 난수 생성 | 미래 블록 해시 기반 당첨자 선정 | P0 | F-01 | - | M1 | ✅ 완료 |

| F-03 | 티켓 구매 | META 토큰으로 티켓 구매 | P0 | F-01 | PG-01 | M1 | ✅ 완료 |
| F-04 | 상금 분배 | 90%/5%/5% 비율 분배 | P0 | F-02 | - | M1 | ✅ 완료 |

| F-05 | 자동 상금 지급 | 당첨 시 자동 전송 | P0 | F-04 | - | M1 | ✅ 완료 |

| F-06 | 웹 프론트엔드 | DApp UI | P0 | F-01~F-05 | - | M2 | ⏳ 대기 |
| F-07 | 이벤트 로그 | 온체인 이벤트 기록 | P0 | F-01 | PG-01 | M1 | ✅ 완료 |
| F-08 | 비상 정지 | Owner에 의한 일시 중단 | P0 | - | - | M1 | ✅ 완료 |

## 인수조건

### F-01: 라운드 관리

- [ ] Given 컨트랙트가 배포되면, When 초기화가 완료되면, Then 첫 번째 라운드가 자동으로 시작된다 (status = Open)
- [ ] Given 현재 라운드가 Open 상태이고 endTimestamp가 도달하면, When closeRound()가 호출되면, Then status가 Closing으로 변경되고 drawBlock이 설정된다
- [ ] Given 라운드 참여 티켓이 minTicketsPerRound 미만이면, When closeRound()가 호출되면, Then 라운드가 Cancelled 상태로 변경되고 새 라운드가 시작된다
- [ ] Given 라운드가 Completed 상태가 되면, When 분배가 완료되면, Then 자동으로 다음 라운드가 Open 상태로 시작된다
- [ ] Given 라운드 기본 설정값이 설정되면, When startNewRound()가 호출되면, Then roundDuration(6시간) 후에 endTimestamp가 설정된다

### F-02: Blockhash 난수 생성

- [ ] Given 라운드가 Closing 상태이고 drawBlock이 설정되어 있으면, When block.number > drawBlock이면, Then drawWinner()가 호출 가능하다
- [ ] Given drawWinner()가 호출되면, When blockhash(drawBlock)이 0이 아니면, Then 3개 블록 해시 + 누적 seed로 난수가 생성된다
- [ ] Given 256블록이 경과하여 blockhash가 0을 반환하면, When drawWinner()가 호출되면, Then DrawExpired 에러로 revert된다
- [ ] Given drawBlock + 256블록이 경과했으면, When Owner가 forceCloseDraw()를 호출하면, Then 새로운 drawBlock이 재설정된다
- [ ] Given 티켓이 구매되면, When buyTickets()가 실행될 때마다, Then seed에 구매자 주소와 블록 번호가 믹싱된다

### F-03: 티켓 구매

- [ ] Given 유저가 충분한 META를 보유하면, When 1장의 티켓을 구매하면, Then ticketPrice만큼 META가 차감되고 티켓이 발급된다
- [ ] Given 유저가 충분한 META를 보유하면, When N장의 티켓을 구매하면, Then ticketPrice * N만큼 META가 차감되고 N개의 티켓이 발급된다
- [ ] Given 유저가 티켓 가격보다 적은 META를 전송하면, When buyTickets()가 호출되면, Then InsufficientPayment 에러로 revert된다
- [ ] Given 라운드가 Open 상태가 아니면, When buyTickets()가 호출되면, Then RoundNotOpen 에러로 revert된다
- [ ] Given 101장 이상 구매를 시도하면, When buyTickets(101)이 호출되면, Then InvalidTicketCount 에러로 revert된다
- [ ] Given 컨트랙트가 Pause 상태이면, When buyTickets()가 호출되면, Then 트랜잭션이 revert된다

### F-04: 상금 분배

- [ ] Given 라운드 풀이 1000 META이면, When drawWinner()가 실행되면, Then 당첨자에게 900 META, 커뮤니티 펀드에 50 META, 운영비로 50 META가 분배된다
- [ ] Given 분배 비율이 설정되면, When 상금 분배가 실행되면, Then WINNER_SHARE(9000), COMMUNITY_SHARE(500), OPERATION_SHARE(500) basis points로 정확히 분배된다
- [ ] Given 반올림 오차가 발생하면, When 분배가 실행되면, Then 잔여분이 operationAmount에 포함되어 손실이 없다

### F-05: 자동 상금 지급

- [ ] Given 당첨자가 선정되면, When drawWinner()가 실행되면, Then 당첨자 지갑에 자동으로 상금이 입금된다
- [ ] Given 당첨자 주소로 전송이 실패하면, When drawWinner()가 실행되면, Then pendingWithdrawals 매핑에 상금이 저장된다 (Pull Pattern)
- [ ] Given pendingWithdrawals에 잔액이 있으면, When 당첨자가 withdrawPending()을 호출하면, Then 저장된 상금이 지갑으로 전송된다

### F-06: 웹 프론트엔드

- [ ] Given 유저가 웹사이트에 접속하면, When 페이지가 로드되면, Then 현재 라운드 정보(상태, 남은 시간, 풀 규모)가 표시된다
- [ ] Given 유저가 지갑 연결 버튼을 클릭하면, When MetaMask가 연결되면, Then 지갑 주소과 META 잔액이 표시된다
- [ ] Given 지갑이 연결되어 있으면, When 티켓 수량을 선택하고 구매 버튼을 클릭하면, Then MetaMask 트랜잭션이 생성되고 구매가 완료된다
- [ ] Given 라운드가 진행 중이면, When 페이지를 조회하면, Then 실시간 참여 현황과 티켓 수가 표시된다
- [ ] Given 라운드가 완료되면, When 결과가 확정되면, Then 당첨자 주소(마스킹)와 당첨 금액이 표시된다
- [ ] Given 유저가 과거 라운드를 조회하면, When 히스토리 페이지에 접속하면, Then 과거 당첨자 목록과 상금 내역이 표시된다

### F-07: 이벤트 로그

- [ ] Given 라운드가 시작되면, When startNewRound()가 실행되면, Then RoundStarted 이벤트가 emit된다 (roundId, startBlock, endTimestamp, ticketPrice)
- [ ] Given 티켓이 구매되면, When buyTickets()가 실행되면, Then TicketPurchased 이벤트가 emit된다 (roundId, buyer, ticketCount, totalCost)
- [ ] Given 라운드가 종료되면, When closeRound()가 실행되면, Then RoundClosing 이벤트가 emit된다 (roundId, drawBlock, totalPool, totalTickets)
- [ ] Given 당첨자가 선정되면, When drawWinner()가 실행되면, Then WinnerDrawn 이벤트가 emit된다 (roundId, winner, winnerPrize, communityAmount, operationAmount)
- [ ] Given 라운드가 취소되면, When closeRound()에서 minTickets 미달이 확인되면, Then RoundCancelled 이벤트가 emit된다 (roundId, refundableAmount, ticketCount)
- [ ] Given 환불이 처리되면, When claimRefund()가 실행되면, Then RefundClaimed 이벤트가 emit된다 (roundId, buyer, amount)

### F-08: 비상 정지

- [ ] Given Owner가 pause()를 호출하면, When 트랜잭션이 컨펌되면, Then 모든 buyTickets() 호출이 revert된다
- [ ] Given Owner가 unpause()를 호출하면, When 트랜잭션이 컨펌되면, Then 정상적으로 티켓 구매가 가능해진다
- [ ] Given Pause 상태이면, When view 함수들은 호출되면, Then 정상적으로 데이터 조회가 가능하다

## 병렬 그룹 규칙

- 같은 마일스톤 내에서만 그룹 구성
- 그룹 내 기능 간 상호 의존성 없음
- 그룹 내 기능 간 충돌 영역 미겹침
- 그룹당 최대 3개 기능

## 상태 범례

- ⏳ 대기 / 🔄 진행중 / ✅ 완료 / ⏸️ 보류 / ❌ 취소
