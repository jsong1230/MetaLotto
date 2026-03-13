import { test } from './fixtures';
import { expect } from '@playwright/test';

test.describe('MetaLotto App - 기본 기능', () => {
  test.beforeEach(async ({ mockContract }) => {
    mockContract.mockGetCurrentRound({
      roundId: '1',
      status: 0,
      ticketPrice: '100000000000000000000',
      totalPool: '1000000000000000000000',
      ticketCount: '10',
      closingTime: String(Math.floor(Date.now() / 1000) + 3600),
      drawTime: String(Math.floor(Date.now() / 1000) + 7200),
    });
  });

  test('홈 페이지가 로드된다', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/MetaLotto/);
  });

  test('지갑 연결 버튼이 표시된다', async ({ page }) => {
    await page.goto('/');

    const connectButton = page.getByRole('button', { name: /지갑 연결|Connect Wallet/i });
    await expect(connectButton).toBeVisible();
  });

  test('라운드 정보가 표시된다', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByTestId('round-status')).toBeVisible();
    await expect(page.getByTestId('pool-size')).toBeVisible();
    await expect(page.getByTestId('ticket-count')).toBeVisible();
  });
});

test.describe('티켓 구매', () => {
  test.beforeEach(async ({ mockContract, mockWallet }) => {
    mockContract.mockGetCurrentRound({
      roundId: '1',
      status: 0,
      ticketPrice: '100000000000000000000', // 100 META
      totalPool: '1000000000000000000000',
      ticketCount: '10',
      closingTime: String(Math.floor(Date.now() / 1000) + 3600),
      drawTime: String(Math.floor(Date.now() / 1000) + 7200),
    });

    mockWallet.mockConnect({
      address: '0x1234567890abcdef1234567890abcdef12345678',
      balance: 1000000000000000000000n, // 1000 META
      isConnected: true,
    });
  });

  test('기본 수량이 1로 설정된다', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(500);

    const quantityDisplay = page.getByTestId('ticket-quantity');
    await expect(quantityDisplay).toHaveText('1');
  });

  test('수량 증가 버튼이 동작한다', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(500);

    const increaseButton = page.getByRole('button', { name: /\+/ });
    await increaseButton.click();

    const quantityDisplay = page.getByTestId('ticket-quantity');
    await expect(quantityDisplay).toHaveText('2');
  });

  test('수량 감소 버튼이 동작한다', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(500);

    // 먼저 수량 증가
    const increaseButton = page.getByRole('button', { name: /\+/ });
    await increaseButton.click();

    // 수량 감소
    const decreaseButton = page.getByRole('button', { name: /\-/ });
    await decreaseButton.click();

    const quantityDisplay = page.getByTestId('ticket-quantity');
    await expect(quantityDisplay).toHaveText('1');
  });

  test('최소 수량 1 미만으로 감소되지 않는다', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(500);

    const decreaseButton = page.getByRole('button', { name: /\-/ });
    await decreaseButton.click();

    const quantityDisplay = page.getByTestId('ticket-quantity');
    await expect(quantityDisplay).toHaveText('1');
  });

  test('최대 수량 100을 초과할 수 없다', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(500);

    const increaseButton = page.getByRole('button', { name: /\+/ });

    // 수량을 100으로 설정
    for (let i = 0; i < 99; i++) {
      await increaseButton.click();
    }

    const quantityDisplay = page.getByTestId('ticket-quantity');
    await expect(quantityDisplay).toHaveText('100');

    // 101로 시도
    await increaseButton.click();

    // 여전히 100이어야 함
    await expect(quantityDisplay).toHaveText('100');

    // 경고 메시지 확인
    const warning = page.getByText(/최대 100장까지 구매 가능합니다/);
    await expect(warning).toBeVisible();
  });

  test('총 가격이 올바르게 계산된다', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(500);

    // 수량 5로 설정
    const increaseButton = page.getByRole('button', { name: /\+/ });
    for (let i = 0; i < 4; i++) {
      await increaseButton.click();
    }

    const totalPrice = page.getByTestId('total-price');
    await expect(totalPrice).toHaveText(/500 META/);
  });

  test('미연결 상태에서 구매 버튼이 비활성화된다', async ({ page }) => {
    // 지갑 연결 없이 접속
    await page.goto('/');

    const purchaseButton = page.getByRole('button', { name: /티켓 구매/i });
    await expect(purchaseButton).toBeDisabled();

    // 툴팁/메시지 확인
    const disabledMessage = page.getByText(/지갑 연결 필요/);
    await expect(disabledMessage).toBeVisible();
  });

  test('라운드 종료 상태에서 구매 버튼이 비활성화된다', async ({ mockContract, mockWallet, page }) => {
    mockContract.mockGetCurrentRound({
      roundId: '1',
      status: 1, // Closing
      ticketPrice: '100000000000000000000',
      totalPool: '500000000000000000000',
      ticketCount: '5',
      closingTime: String(Math.floor(Date.now() / 1000) - 100),
      drawTime: String(Math.floor(Date.now() / 1000) + 3600),
    });

    await page.goto('/');
    await page.waitForTimeout(500);

    const purchaseButton = page.getByRole('button', { name: /티켓 구매/i });
    await expect(purchaseButton).toBeDisabled();

    const closedMessage = page.getByText(/라운드 종료|판매 종료/);
    await expect(closedMessage).toBeVisible();
  });
});

test.describe('라운드 히스토리', () => {
  test.beforeEach(async ({ mockContract }) => {
    // 히스토리 데이터 Mock
    mockContract.mockGetRoundHistory([
      {
        roundId: '1',
        status: 2,
        ticketPrice: '100000000000000000000',
        totalPool: '1000000000000000000000',
        ticketCount: '10',
        closingTime: String(Math.floor(Date.now() / 1000) - 3600),
        drawTime: String(Math.floor(Date.now() / 1000) - 1800),
        winner: '0x1234567890abcdef1234567890abcdef12345678',
        winnerPrize: '900000000000000000000',
      },
      {
        roundId: '2',
        status: 2,
        ticketPrice: '100000000000000000000',
        totalPool: '500000000000000000000',
        ticketCount: '5',
        closingTime: String(Math.floor(Date.now() / 1000) - 7200),
        drawTime: String(Math.floor(Date.now() / 1000) - 5400),
        winner: '0xabcdef1234567890abcdef1234567890abcdef12',
        winnerPrize: '450000000000000000000',
      },
    ]);
  });

  test('히스토리 페이지가 로드된다', async ({ page }) => {
    await page.goto('/history');

    const pageTitle = page.getByRole('heading', { name: /히스토리|History/i });
    await expect(pageTitle).toBeVisible();
  });

  test('과거 라운드 목록이 표시된다', async ({ page }) => {
    await page.goto('/history');

    // 라운드 카드 확인
    const roundCards = page.getByTestId('round-card');
    await expect(roundCards).toHaveCount(2);
  });

  test('라운드 정보가 올바르게 표시된다', async ({ page }) => {
    await page.goto('/history');

    // 첫 번째 라운드 정보 확인
    const roundId = page.getByTestId('round-id').first();
    await expect(roundId).toBeVisible();
    await expect(roundId).toHaveText(/#1|Round 1/);

    const winnerAddress = page.getByTestId('winner-address').first();
    await expect(winnerAddress).toBeVisible();
    await expect(winnerAddress).toHaveText(/0x1234\.\.\.5678/);

    const winnerPrize = page.getByTestId('winner-prize').first();
    await expect(winnerPrize).toBeVisible();
    await expect(winnerPrize).toHaveText(/900 META/);
  });

  test('빈 히스토리일 때 안내 메시지가 표시된다', async ({ mockContract, page }) => {
    mockContract.mockGetRoundHistory([]);

    await page.goto('/history');

    const emptyMessage = page.getByText(/아직 완료된 라운드가 없습니다|No completed rounds/);
    await expect(emptyMessage).toBeVisible();
  });

  test('페이지네이션 더 보기 버튼이 표시된다', async ({ mockContract, page }) => {
    // 10개 이상의 히스토리 생성
    const historyData = Array.from({ length: 15 }, (_, i) => ({
      roundId: String(i + 1),
      status: 2,
      ticketPrice: '100000000000000000000',
      totalPool: '1000000000000000000000',
      ticketCount: '10',
      closingTime: String(Math.floor(Date.now() / 1000) - (i + 1) * 3600),
      drawTime: String(Math.floor(Date.now() / 1000) - (i + 1) * 1800),
      winner: `0x${i.toString(16).padStart(40, '0')}`,
      winnerPrize: '900000000000000000000',
    }));

    mockContract.mockGetRoundHistory(historyData);

    await page.goto('/history');

    const loadMoreButton = page.getByRole('button', { name: /더 보기|Load More/i });
    await expect(loadMoreButton).toBeVisible();
  });

  test('더 보기 버튼 클릭 시 추가 라운드가 로드된다', async ({ mockContract, page }) => {
    const historyData = Array.from({ length: 15 }, (_, i) => ({
      roundId: BigInt(i + 1),
      status: 2,
      ticketPrice: 100000000000000000000n,
      totalPool: 1000000000000000000000n,
      ticketCount: 10n,
      closingTime: BigInt(Math.floor(Date.now() / 1000) - (i + 1) * 3600),
      drawTime: BigInt(Math.floor(Date.now() / 1000) - (i + 1) * 1800),
      winner: `0x${i.toString(16).padStart(40, '0')}`,
      winnerPrize: 900000000000000000000n,
    }));

    mockContract.mockGetRoundHistory(historyData);

    await page.goto('/history');

    const loadMoreButton = page.getByRole('button', { name: /더 보기|Load More/i });
    await loadMoreButton.click();

    // 추가 카드 로딩 확인
    await page.waitForTimeout(500);
    const roundCards = page.getByTestId('round-card');
    await expect(roundCards).toHaveCount(15);
  });
});
