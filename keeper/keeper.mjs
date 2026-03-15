/**
 * MetaLotto Keeper Bot
 *
 * 라운드 종료 시 closeRound() → drawWinner() 자동 호출
 * 실행: node keeper.mjs
 */

import { createPublicClient, createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import 'dotenv/config';

// ============================================
// 설정
// ============================================

const RPC_URL       = process.env.RPC_URL       ?? 'https://api.metadium.com/dev';
const PRIVATE_KEY   = process.env.KEEPER_PRIVATE_KEY;
const CONTRACT_ADDR = process.env.CONTRACT_ADDRESS ?? '0x004233764dDafAc81a1C965f3ABf7D0aB95cf7BF';
const POLL_INTERVAL = Number(process.env.POLL_INTERVAL_MS ?? 30_000); // 기본 30초
const GAS_PRICE     = BigInt(process.env.GAS_PRICE_GWEI ?? '80') * 1_000_000_000n;

if (!PRIVATE_KEY) {
  console.error('[Keeper] 환경변수 KEEPER_PRIVATE_KEY 가 설정되지 않았습니다.');
  process.exit(1);
}

// ============================================
// ABI (필요한 함수만)
// ============================================

const ABI = [
  {
    name: 'getCurrentRound', type: 'function', stateMutability: 'view', inputs: [],
    outputs: [{ type: 'tuple', components: [
      { name: 'id',               type: 'uint256' },
      { name: 'startTimestamp',   type: 'uint256' },
      { name: 'endTimestamp',     type: 'uint256' },
      { name: 'drawBlock',        type: 'uint256' },
      { name: 'totalPool',        type: 'uint256' },
      { name: 'ticketCount',      type: 'uint256' },
      { name: 'status',           type: 'uint8'   },
      { name: 'winner',           type: 'address' },
      { name: 'winnerPrize',      type: 'uint256' },
      { name: 'communityAmount',  type: 'uint256' },
      { name: 'operationAmount',  type: 'uint256' },
      { name: 'seed',             type: 'uint256' },
    ]}],
  },
  { name: 'closeRound',  type: 'function', stateMutability: 'nonpayable', inputs: [], outputs: [] },
  { name: 'drawWinner',  type: 'function', stateMutability: 'nonpayable', inputs: [], outputs: [] },
];

// RoundStatus enum
const RoundStatus = { Open: 0, Closing: 1, Completed: 2, Cancelled: 3 };

// ============================================
// 클라이언트 초기화
// ============================================

const metadiumTestnet = {
  id: 12,
  name: 'Metadium Testnet',
  nativeCurrency: { name: 'META', symbol: 'META', decimals: 18 },
  rpcUrls: { default: { http: [RPC_URL] } },
};

const account = privateKeyToAccount(PRIVATE_KEY);

const publicClient = createPublicClient({
  chain: metadiumTestnet,
  transport: http(RPC_URL),
});

const walletClient = createWalletClient({
  chain: metadiumTestnet,
  transport: http(RPC_URL),
  account,
});

// ============================================
// 트랜잭션 전송 헬퍼
// ============================================

async function sendTx(functionName) {
  const { request } = await publicClient.simulateContract({
    address: CONTRACT_ADDR,
    abi: ABI,
    functionName,
    account,
  });

  const hash = await walletClient.writeContract({
    ...request,
    gasPrice: GAS_PRICE,
  });

  log(`  TX 전송: ${hash}`);

  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  const ok = receipt.status === 'success';
  log(`  ${ok ? '✅ 성공' : '❌ 실패'} (block #${receipt.blockNumber})`);
  return ok;
}

// ============================================
// 메인 루프
// ============================================

function log(msg) {
  const ts = new Date().toISOString().replace('T', ' ').slice(0, 19);
  console.log(`[${ts}] ${msg}`);
}

async function tick() {
  try {
    const round = await publicClient.readContract({
      address: CONTRACT_ADDR,
      abi: ABI,
      functionName: 'getCurrentRound',
    });

    const now = BigInt(Math.floor(Date.now() / 1000));
    const { id, status, endTimestamp, drawBlock, ticketCount, totalPool } = round;

    log(`라운드 #${id} | 상태: ${Object.keys(RoundStatus)[status]} | 티켓: ${ticketCount} | 풀: ${totalPool / 10n**18n} META`);

    // ── Open 상태이고 시간이 지났으면 closeRound 호출
    if (status === RoundStatus.Open && now >= endTimestamp) {
      log('  → 라운드 종료 시간 도달. closeRound() 호출...');
      await sendTx('closeRound');
      return; // 다음 tick에서 Closing 상태 처리
    }

    // ── Closing 상태이고 drawBlock이 지났으면 drawWinner 호출
    if (status === RoundStatus.Closing) {
      const currentBlock = await publicClient.getBlockNumber();
      const blocksLeft = drawBlock - currentBlock;
      log(`  → Closing 상태. 추첨 블록: #${drawBlock}, 현재 블록: #${currentBlock} (${blocksLeft > 0n ? blocksLeft + ' 블록 남음' : '추첨 가능'})`);

      if (currentBlock > drawBlock && currentBlock <= drawBlock + 256n) {
        log('  → drawWinner() 호출...');
        await sendTx('drawWinner');
      } else if (currentBlock > drawBlock + 256n) {
        log('  ⚠️  256 블록 초과. 오너의 forceCloseDraw() 호출이 필요합니다.');
      }
    }
  } catch (err) {
    log(`❌ 오류: ${err.shortMessage ?? err.message}`);
  }
}

// ============================================
// 시작
// ============================================

log(`MetaLotto Keeper 시작`);
log(`  컨트랙트: ${CONTRACT_ADDR}`);
log(`  계정:     ${account.address}`);
log(`  폴링:     ${POLL_INTERVAL / 1000}초`);
log('─'.repeat(60));

tick(); // 즉시 1회 실행
setInterval(tick, POLL_INTERVAL);
