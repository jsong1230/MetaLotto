/**
 * MetaLotto 컨트랙트 타입 정의
 *
 * 이 파일은 MetaLotto 컨트랙트의 함수, 이벤트, 상태를 위한 TypeScript 타입을 제공합니다.
 */

import { Abi } from 'viem';
import MetaLottoAbi from './MetaLotto.json';

// ============ Enums ============

/**
 * 라운드 상태 열거형
 */
export enum RoundStatus {
  Open = 0,       // 티켓 판매 중
  Closing = 1,    // 판매 종료, 미래 블록 대기 중
  Completed = 2,  // 상금 분배 완료
  Cancelled = 3,   // 라운드 취소 (최소 인원 미달)
}

// ============ Structs ============

/**
 * 라운드 정보 구조체
 */
export interface Round {
  roundId: bigint;          // 라운드 고유 ID
  status: RoundStatus;      // 현재 상태
  startBlock: bigint;      // 라운드 시작 블록
  endTimestamp: bigint;     // 티켓 판매 마감 시각 (Unix timestamp)
  drawBlock: bigint;       // 난수 생성에 사용할 미래 블록 번호
  ticketPrice: bigint;     // 티켓 가격 (wei)
  totalPool: bigint;       // 누적 풀 금액 (wei)
  ticketCount: bigint;     // 발행된 총 티켓 수
  winner: `0x${string}`;  // 당첨자 주소
  winnerPrize: bigint;     // 당첨 금액 (wei)
  seed: bigint;            // 누적 엔트로피 시드
}

/**
 * 티켓 정보 구조체
 */
export interface Ticket {
  roundId: bigint;          // 라운드 ID
  buyer: `0x${string}`;    // 구매자 주소
  purchaseBlock: bigint;    // 구매 블록 번호
}

// ============ Events ============

/**
 * RoundStarted 이벤트
 */
export interface RoundStartedEvent {
  roundId: bigint;
  startBlock: bigint;
  endTimestamp: bigint;
  ticketPrice: bigint;
}

/**
 * TicketPurchased 이벤트
 */
export interface TicketPurchasedEvent {
  roundId: bigint;
  buyer: `0x${string}`;
  ticketCount: bigint;
  totalCost: bigint;
}

/**
 * RoundClosing 이벤트
 */
export interface RoundClosingEvent {
  roundId: bigint;
  drawBlock: bigint;
  totalPool: bigint;
  totalTickets: bigint;
}

/**
 * WinnerDrawn 이벤트
 */
export interface WinnerDrawnEvent {
  roundId: bigint;
  winner: `0x${string}`;
  winnerPrize: bigint;
  communityAmount: bigint;
  operationAmount: bigint;
}

/**
 * RoundCancelled 이벤트
 */
export interface RoundCancelledEvent {
  roundId: bigint;
  refundableAmount: bigint;
  ticketCount: bigint;
}

/**
 * RefundClaimed 이벤트
 */
export interface RefundClaimedEvent {
  roundId: bigint;
  buyer: `0x${string}`;
  amount: bigint;
}

/**
 * ConfigUpdated 이벤트
 */
export interface ConfigUpdatedEvent {
  parameter: string;
  oldValue: bigint;
  newValue: bigint;
}

/**
 * FundAddressUpdated 이벤트
 */
export interface FundAddressUpdatedEvent {
  fundType: string;
  oldAddress: `0x${string}`;
  newAddress: `0x${string}`;
}

/**
 * PrizeDistributed 이벤트
 */
export interface PrizeDistributedEvent {
  roundId: bigint;
  winner: `0x${string}`;
  winnerAmount: bigint;
  communityAmount: bigint;
  operationAmount: bigint;
}

/**
 * PrizeTransferSuccess 이벤트
 */
export interface PrizeTransferSuccessEvent {
  winner: `0x${string}`;
  amount: bigint;
}

/**
 * PrizeTransferFailed 이벤트
 */
export interface PrizeTransferFailedEvent {
  winner: `0x${string}`;
  amount: bigint;
}

/**
 * WithdrawalClaimed 이벤트
 */
export interface WithdrawalClaimedEvent {
  user: `0x${string}`;
  amount: bigint;
}

// ============ Read Functions ============

/**
 * 라운드 상태 getter
 */
export type GetRoundStatusFunction = {
  abi: Abi;
  functionName: 'rounds';
  args: [roundId: bigint];
};

/**
 * 티켓 정보 getter
 */
export type GetRoundTicketsFunction = {
  abi: Abi;
  functionName: 'roundTickets';
  args: [roundId: bigint];
};

/**
 * 사용자 티켓 인덱스 getter
 */
export type GetUserTicketIndicesFunction = {
  abi: Abi;
  functionName: 'userTicketIndices';
  args: [roundId: bigint, buyer: `0x${string}`];
};

/**
 * 미수령 상금 getter
 */
export type GetPendingWithdrawalsFunction = {
  abi: Abi;
  functionName: 'pendingWithdrawals';
  args: [user: `0x${string}`];
};

/**
 * 현재 라운드 ID getter
 */
export type GetCurrentRoundIdFunction = {
  abi: Abi;
  functionName: 'currentRoundId';
  args: [];
};

/**
 * 커뮤니티 펀드 주소 getter
 */
export type GetCommunityFundFunction = {
  abi: Abi;
  functionName: 'communityFund';
  args: [];
};

/**
 * 운영 펀드 주소 getter
 */
export type GetOperationFundFunction = {
  abi: Abi;
  functionName: 'operationFund';
  args: [];
};

/**
 * 티켓 가격 getter
 */
export type GetTicketPriceFunction = {
  abi: Abi;
  functionName: 'ticketPrice';
  args: [];
};

/**
 * 라운드 기간 getter
 */
export type GetRoundDurationFunction = {
  abi: Abi;
  functionName: 'roundDuration';
  args: [];
};

/**
 * 추첨 지연 getter
 */
export type GetDrawDelayFunction = {
  abi: Abi;
  functionName: 'drawDelay';
  args: [];
};

/**
 * 최소 티켓 수 getter
 */
export type GetMinTicketsPerRoundFunction = {
  abi: Abi;
  functionName: 'minTicketsPerRound';
  args: [];
};

/**
 * 현재 라운드 정보 조회
 */
export type GetCurrentRoundFunction = {
  abi: Abi;
  functionName: 'getCurrentRound';
  args: [];
};

/**
 * 특정 라운드 정보 조회
 */
export type GetRoundFunction = {
  abi: Abi;
  functionName: 'getRound';
  args: [roundId: bigint];
};

/**
 * 내 티켓 수 조회
 */
export type GetMyTicketsFunction = {
  abi: Abi;
  functionName: 'getMyTickets';
  args: [roundId: bigint];
};

/**
 * 라운드 전체 티켓 수 조회
 */
export type GetRoundTicketCountFunction = {
  abi: Abi;
  functionName: 'getRoundTicketCount';
  args: [roundId: bigint];
};

/**
 * 특정 티켓 구매자 조회
 */
export type GetTicketBuyerFunction = {
  abi: Abi;
  functionName: 'getTicketBuyer';
  args: [roundId: bigint, index: bigint];
};

/**
 * 남은 시간 조회 (초)
 */
export type GetTimeRemainingFunction = {
  abi: Abi;
  functionName: 'getTimeRemaining';
  args: [];
};

/**
 * 추첨까지 남은 블록 수 조회
 */
export type GetDrawBlockRemainingFunction = {
  abi: Abi;
  functionName: 'getDrawBlockRemaining';
  args: [];
};

/**
 * 미수령 상금 조회
 */
export type GetPendingWithdrawalFunction = {
  abi: Abi;
  functionName: 'getPendingWithdrawal';
  args: [user: `0x${string}`];
};

/**
 * 일시정지 상태 조회
 */
export type IsPausedFunction = {
  abi: Abi;
  functionName: 'isPaused';
  args: [];
};

/**
 * 상수 getter - WINNER_SHARE
 */
export type GetWinnerShareFunction = {
  abi: Abi;
  functionName: 'WINNER_SHARE';
  args: [];
};

/**
 * 상수 getter - COMMUNITY_SHARE
 */
export type GetCommunityShareFunction = {
  abi: Abi;
  functionName: 'COMMUNITY_SHARE';
  args: [];
};

/**
 * 상수 getter - OPERATION_SHARE
 */
export type GetOperationShareFunction = {
  abi: Abi;
  functionName: 'OPERATION_SHARE';
  args: [];
};

/**
 * 상수 getter - BASIS_POINTS
 */
export type GetBasisPointsFunction = {
  abi: Abi;
  functionName: 'BASIS_POINTS';
  args: [];
};

/**
 * 상수 getter - MAX_TICKETS_PER_PURCHASE
 */
export type GetMaxTicketsPerPurchaseFunction = {
  abi: Abi;
  functionName: 'MAX_TICKETS_PER_PURCHASE';
  args: [];
};

// ============ Write Functions ============

/**
 * 티켓 구매
 */
export type BuyTicketsFunction = {
  abi: Abi;
  functionName: 'buyTickets';
  args: [count: bigint];
  value: bigint;
};

/**
 * 라운드 종료
 */
export type CloseRoundFunction = {
  abi: Abi;
  functionName: 'closeRound';
  args: [];
};

/**
 * 당첨자 추첨 및 상금 분배
 */
export type DrawWinnerFunction = {
  abi: Abi;
  functionName: 'drawWinner';
  args: [];
};

/**
 * 환불 청구
 */
export type ClaimRefundFunction = {
  abi: Abi;
  functionName: 'claimRefund';
  args: [roundId: bigint];
};

/**
 * 미수령 상금 인출
 */
export type WithdrawPendingFunction = {
  abi: Abi;
  functionName: 'withdrawPending';
  args: [];
};

/**
 * 티켓 가격 변경 (Owner only)
 */
export type SetTicketPriceFunction = {
  abi: Abi;
  functionName: 'setTicketPrice';
  args: [newPrice: bigint];
};

/**
 * 라운드 기간 변경 (Owner only)
 */
export type SetRoundDurationFunction = {
  abi: Abi;
  functionName: 'setRoundDuration';
  args: [newDuration: bigint];
};

/**
 * 추첨 지연 블록 수 변경 (Owner only)
 */
export type SetDrawDelayFunction = {
  abi: Abi;
  functionName: 'setDrawDelay';
  args: [newDelay: bigint];
};

/**
 * 최소 티켓 수 변경 (Owner only)
 */
export type SetMinTicketsFunction = {
  abi: Abi;
  functionName: 'setMinTickets';
  args: [newMin: bigint];
};

/**
 * 커뮤니티 펀드 주소 변경 (Owner only)
 */
export type SetCommunityFundFunction = {
  abi: Abi;
  functionName: 'setCommunityFund';
  args: [newAddress: `0x${string}`];
};

/**
 * 운영 펀드 주소 변경 (Owner only)
 */
export type SetOperationFundFunction = {
  abi: Abi;
  functionName: 'setOperationFund';
  args: [newAddress: `0x${string}`];
};

/**
 * drawBlock 재설정 (Owner only)
 */
export type ForceCloseDrawFunction = {
  abi: Abi;
  functionName: 'forceCloseDraw';
  args: [];
};

/**
 * 컨트랙트 일시 정지 (Owner only)
 */
export type PauseFunction = {
  abi: Abi;
  functionName: 'pause';
  args: [];
};

/**
 * 컨트랙트 재개 (Owner only)
 */
export type UnpauseFunction = {
  abi: Abi;
  functionName: 'unpause';
  args: [];
};

// ============ ABI Export ============

/**
 * MetaLotto 컨트랙트 ABI
 */
export const META_LOTTO_ABI = MetaLottoAbi as Abi;

/**
 * MetaLotto 컨트랙트 전체 타입 (viem용)
 */
export type MetaLottoContract = {
  abi: typeof META_LOTTO_ABI;
};
