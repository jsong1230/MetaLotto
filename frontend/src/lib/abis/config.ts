/**
 * MetaLotto 컨트랙트 wagmi/viem 설정
 *
 * wagmi 및 viem에서 MetaLotto 컨트랙트를 사용하기 위한 설정을 제공합니다.
 */

import { Address } from 'viem';
import { META_LOTTO_ABI } from './types';
import { getMetaLottoAddress } from './addresses';

/**
 * MetaLotto 컨트랙트 설정
 *
 * @remarks
 * 이 설정을 사용하여 wagmi hooks에서 MetaLotto 컨트랙트를 참조할 수 있습니다.
 *
 * @example
 * ```typescript
 * import { useReadContract } from 'wagmi';
 * import { metalottoContract } from '@/lib/abis/config';
 *
 * const { data: currentRound } = useReadContract({
 *   ...metalottoContract,
 *   functionName: 'getCurrentRound',
 * });
 * ```
 */
export function getMetalottoContract(chainId: number = 11) {
  return {
    address: getMetaLottoAddress(chainId) as Address,
    abi: META_LOTTO_ABI,
  } as const;
}

/**
 * 메인넷용 MetaLotto 컨트랙트 설정 (Chain ID: 11)
 */
export const metalottoContractMainnet = {
  address: getMetaLottoAddress(11) as Address,
  abi: META_LOTTO_ABI,
} as const;

/**
 * 테스트넷용 MetaLotto 컨트랙트 설정
 * (현재 메인넷과 동일한 체인 ID 사용)
 */
export const metalottoContractTestnet = {
  address: getMetaLottoAddress(11) as Address,
  abi: META_LOTTO_ABI,
} as const;

/**
 * 기본 MetaLotto 컨트랙트 설정
 *
 * @remarks
 * 기본적으로 메인넷 설정을 사용합니다.
 * 체인에 따라 다른 주소를 사용해야 한다면 `getMetalottoContract(chainId)`를 사용하세요.
 */
export const metalottoContract = metalottoContractMainnet;

/**
 * wagmi config에 추가할 컨트랙트 배열
 *
 * @example
 * ```typescript
 * // wagmi.config.ts
 * import { http, createConfig } from 'wagmi';
 * import { metadium } from '@/lib/chains';
 * import { META_LOTTO_CONTRACTS } from '@/lib/abis/config';
 *
 * export const config = createConfig({
 *   chains: [metadium],
 *   transports: {
 *     [metadium.id]: http(),
 *   },
 *   contracts: {
 *     ...META_LOTTO_CONTRACTS,
 *   },
 * });
 * ```
 */
export const META_LOTTO_CONTRACTS = {
  MetaLotto: {
    address: getMetaLottoAddress(11) as Address,
    abi: META_LOTTO_ABI,
  },
} as const;
