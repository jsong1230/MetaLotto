/**
 * MetaLotto 컨트랙트 배포 주소
 *
 * 각 네트워크별 컨트랙트 배포 주소를 관리합니다.
 * 배포 후 실제 주소로 업데이트해야 합니다.
 */

/**
 * 네트워크별 컨트랙트 주소
 *
 * @remarks
 * - Metadium Mainnet: Chain ID 11
 * - Metadium Testnet: Chain ID 11 (현재 메인넷과 동일한 체인 ID 사용)
 *
 * 배포 후 각 네트워크의 실제 컨트랙트 주소로 업데이트하세요.
 */
export const ADDRESSES = {
  /**
   * 메타디움 메인넷 (Chain ID: 11)
   */
  metadium: {
    MetaLotto: '0x0000000000000000000000000000000000000000' as const,
  } as const,

  /**
   * 메타디움 테스트넷 (Chain ID: 12)
   */
  metadium_testnet: {
    MetaLotto: '0x004233764dDafAc81a1C965f3ABf7D0aB95cf7BF' as const,
  } as const,
} as const;

/**
 * 네트워크 이름 타입
 */
export type NetworkName = keyof typeof ADDRESSES;

/**
 * 컨트랙트 이름 타입
 */
export type ContractName = 'MetaLotto';

/**
 * 주소 타입 (0x{string})
 */
export type Address = `0x${string}`;

/**
 * 네트워크별 주소 맵핑
 */
export type NetworkAddresses = Record<NetworkName, Record<ContractName, Address>>;

/**
 * 특정 네트워크의 컨트랙트 주소 조회 헬퍼
 *
 * @param networkName - 네트워크 이름 ('metadium' 또는 'metadium_testnet')
 * @param contractName - 컨트랙트 이름 (현재는 'MetaLotto'만 지원)
 * @returns 컨트랙트 주소
 *
 * @example
 * ```typescript
 * const address = getContractAddress('metadium', 'MetaLotto');
 * ```
 */
export function getContractAddress(
  networkName: NetworkName,
  contractName: ContractName = 'MetaLotto'
): Address {
  return ADDRESSES[networkName][contractName];
}

/**
 * 체인 ID로 네트워크 이름 조회 헬퍼
 *
 * @param chainId - EVM 체인 ID
 * @returns 네트워크 이름 또는 null
 *
 * @example
 * ```typescript
 * const networkName = getNetworkName(11); // 'metadium'
 * ```
 */
export function getNetworkName(chainId: number): NetworkName | null {
  if (chainId === 11) return 'metadium';
  if (chainId === 12) return 'metadium_testnet';
  return null;
}

/**
 * 현재 네트워크의 MetaLotto 컨트랙트 주소 조회
 *
 * @param chainId - EVM 체인 ID
 * @returns MetaLotto 컨트랙트 주소
 *
 * @throws 알 수 없는 체인 ID일 경우 에러 발생
 *
 * @example
 * ```typescript
 * const address = getMetaLottoAddress(11); // '0x...'
 * ```
 */
export function getMetaLottoAddress(chainId: number): Address {
  const networkName = getNetworkName(chainId);
  if (!networkName) {
    throw new Error(`Unknown chain ID: ${chainId}`);
  }
  return ADDRESSES[networkName].MetaLotto;
}
