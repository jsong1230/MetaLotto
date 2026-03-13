/**
 * wagmi/viem 설정
 *
 * MetaLotto DApp을 위한 wagmi config를 제공합니다.
 * Metadium Mainnet (Chain ID: 11) 및 Testnet (Chain ID: 511)을 지원합니다.
 */

import { createConfig, http } from 'wagmi';
import { injected, walletConnect } from 'wagmi/connectors';

// Metadium Mainnet Chain Configuration
export const metadium = {
  id: 11,
  name: 'Metadium',
  nativeCurrency: {
    name: 'META',
    symbol: 'META',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: [process.env.NEXT_PUBLIC_METADIUM_RPC_URL || 'https://rpc.metadium.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Metadium Explorer',
      url: 'https://explorer.metadium.com',
    },
  },
  testnet: false,
} as const;

// Metadium Testnet Chain Configuration
export const metadiumTestnet = {
  id: 511,
  name: 'Metadium Testnet',
  nativeCurrency: {
    name: 'META',
    symbol: 'META',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.test.metadium.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Metadium Testnet Explorer',
      url: 'https://explorer.test.metadium.com',
    },
  },
  testnet: true,
} as const;

// 현재 체인 결정 (환경 변수에서 Chain ID 읽기)
const chainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID) || 11;
const activeChain = chainId === 511 ? metadiumTestnet : metadium;

// WalletConnect Project ID (선택 사항)
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

/**
 * wagmi Config
 *
 * @remarks
 * - injected: 브라우저 내장 지갑 (MetaMask, Brave Wallet 등)
 * - metaMask: MetaMask 전용 커넥터
 * - walletConnect: WalletConnect 지원 지갑 (Project ID 필요 시)
 *
 * @example
 * ```typescript
 * import { config } from '@/lib/wagmi';
 * import { WagmiProvider } from 'wagmi';
 *
 * <WagmiProvider config={config}>
 *   <App />
 * </WagmiProvider>
 * ```
 */
export const config = createConfig({
  chains: [metadium, metadiumTestnet],
  connectors: [
    injected({ target: 'metaMask' }),
    ...(projectId ? [walletConnect({ projectId, showQrModal: false })] : []),
  ],
  transports: {
    [metadium.id]: http(process.env.NEXT_PUBLIC_METADIUM_RPC_URL || 'https://rpc.metadium.com'),
    [metadiumTestnet.id]: http('https://rpc.test.metadium.com'),
  },
  ssr: true,
});

// 타입 선언 (wagmi 모듈 확장)
declare module 'wagmi' {
  export interface Register {
    config: typeof config;
  }
}
