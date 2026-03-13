/**
 * MetaLotto 컨트랙트 ABI 통합 exports
 *
 * 모든 컨트랙트 관련 타입, 설정, 주소를 한 곳에서 import할 수 있습니다.
 */

// ABI JSON
export { default as MetaLottoAbi } from './MetaLotto.json';

// TypeScript 타입
export type {
  // Enums
  RoundStatus,

  // Structs
  Round,
  Ticket,

  // Events
  RoundStartedEvent,
  TicketPurchasedEvent,
  RoundClosingEvent,
  WinnerDrawnEvent,
  RoundCancelledEvent,
  RefundClaimedEvent,
  ConfigUpdatedEvent,
  FundAddressUpdatedEvent,
  PrizeDistributedEvent,
  PrizeTransferSuccessEvent,
  PrizeTransferFailedEvent,
  WithdrawalClaimedEvent,

  // Read Functions
  GetRoundStatusFunction,
  GetRoundTicketsFunction,
  GetUserTicketIndicesFunction,
  GetPendingWithdrawalsFunction,
  GetCurrentRoundIdFunction,
  GetCommunityFundFunction,
  GetOperationFundFunction,
  GetTicketPriceFunction,
  GetRoundDurationFunction,
  GetDrawDelayFunction,
  GetMinTicketsPerRoundFunction,
  GetCurrentRoundFunction,
  GetRoundFunction,
  GetMyTicketsFunction,
  GetRoundTicketCountFunction,
  GetTicketBuyerFunction,
  GetTimeRemainingFunction,
  GetDrawBlockRemainingFunction,
  GetPendingWithdrawalFunction,
  IsPausedFunction,
  GetWinnerShareFunction,
  GetCommunityShareFunction,
  GetOperationShareFunction,
  GetBasisPointsFunction,
  GetMaxTicketsPerPurchaseFunction,

  // Write Functions
  BuyTicketsFunction,
  CloseRoundFunction,
  DrawWinnerFunction,
  ClaimRefundFunction,
  WithdrawPendingFunction,
  SetTicketPriceFunction,
  SetRoundDurationFunction,
  SetDrawDelayFunction,
  SetMinTicketsFunction,
  SetCommunityFundFunction,
  SetOperationFundFunction,
  ForceCloseDrawFunction,
  PauseFunction,
  UnpauseFunction,

  // Contract Type
  MetaLottoContract,
} from './types';

// ABI 상수
export { META_LOTTO_ABI } from './types';

// 주소 관련 exports
export {
  ADDRESSES,
  getContractAddress,
  getNetworkName,
  getMetaLottoAddress,
} from './addresses';

export type {
  NetworkName,
  ContractName,
  Address,
  NetworkAddresses,
} from './addresses';

// wagmi config exports
export {
  getMetalottoContract,
  metalottoContractMainnet,
  metalottoContractTestnet,
  metalottoContract,
  META_LOTTO_CONTRACTS,
} from './config';
