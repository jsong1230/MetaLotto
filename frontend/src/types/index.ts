/**
 * MetaLotto 타입 정의
 */

/**
 * 라운드 정보
 */
export interface RoundInfo {
  roundId: bigint;
  status: number; // 0: Open, 1: Closing, 2: Completed, 3: Cancelled
  startBlock: bigint;
  endTimestamp: bigint;
  drawBlock: bigint;
  ticketPrice: bigint;
  totalPool: bigint;
  ticketCount: bigint;
  winner: `0x${string}`;
  winnerPrize: bigint;
  seed: bigint;
}

/**
 * 라운드 카드 정보
 */
export interface RoundCardInfo {
  roundId: bigint;
  status: number;
  winner: `0x${string}`;
  prize: bigint;
  timestamp: bigint;
}

/**
 * 티켓 구매 상태
 */
export interface TicketPurchaseState {
  quantity: number;
  totalPrice: bigint;
  isPending: boolean;
  error: string | null;
}
