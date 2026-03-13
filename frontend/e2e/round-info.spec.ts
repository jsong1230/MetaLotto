import { test } from './fixtures';
import { expect } from '@playwright/test';

test.describe('라운드 정보 표시', () => {
  test.beforeEach(async ({ mockContract }) => {
    // 기본 Mock 데이터 설정
    mockContract.mockGetCurrentRound({
      roundId: '1',
      status: 0, // Open
      ticketPrice: '100000000000000000000', // 100 META
      totalPool: '1000000000000000000000', // 1000 META
      ticketCount: '42',
      closingTime: String(Math.floor(Date.now() / 1000) + 3600), // 1시간 후
      drawTime: String(Math.floor(Date.now() / 1000) + 7200), // 2시간 후
    });
  });

  test('페이지 접속 시 라운드 정보가 표시된다', async ({ page }) => {
    await page.goto('/');

    // 라운드 상태 배지 확인
    const statusBadge = page.getByTestId('round-status');
    await expect(statusBadge).toBeVisible();
    await expect(statusBadge).toHaveText(/진행 중/);

    // 풀 규모 확인
    const poolSize = page.getByTestId('pool-size');
    await expect(poolSize).toBeVisible();
    await expect(poolSize).toHaveText(/1000 META/);

    // 티켓 수 확인
    const ticketCount = page.getByTestId('ticket-count');
    await expect(ticketCount).toBeVisible();
    await expect(ticketCount).toHaveText(/42장/);
  });

  test('카운트다운 타이머가 표시된다', async ({ page }) => {
    await page.goto('/');

    // 카운트다운 타이머 확인
    const countdown = page.getByTestId('countdown-timer');
    await expect(countdown).toBeVisible();

    // 타이머 형식 확인 (HH:MM:SS)
    const timerText = await countdown.textContent();
    expect(timerText).toMatch(/\d{2}:\d{2}:\d{2}/);
  });

  test('카운트다운 타이머가 실시간으로 감소한다', async ({ page }) => {
    await page.goto('/');

    const countdown = page.getByTestId('countdown-timer');
    const initialTime = await countdown.textContent();

    // 2초 대기
    await page.waitForTimeout(2000);

    const newTime = await countdown.textContent();
    expect(newTime).not.toBe(initialTime);
  });

  test('Closing 상태일 때 추첨 대기 배지가 표시된다', async ({ mockContract, page }) => {
    mockContract.mockGetCurrentRound({
      roundId: '1',
      status: 1, // Closing
      ticketPrice: '100000000000000000000',
      totalPool: '500000000000000000000',
      ticketCount: '5',
      closingTime: String(Math.floor(Date.now() / 1000) - 100), // 이미 종료
      drawTime: String(Math.floor(Date.now() / 1000) + 3600),
    });

    await page.goto('/');

    const statusBadge = page.getByTestId('round-status');
    await expect(statusBadge).toHaveText(/추첨 대기/);
  });

  test('Completed 상태일 때 완료 배지가 표시된다', async ({ mockContract, page }) => {
    mockContract.mockGetCurrentRound({
      roundId: '1',
      status: 2, // Completed
      ticketPrice: '100000000000000000000',
      totalPool: '1000000000000000000000',
      ticketCount: '10',
      closingTime: String(Math.floor(Date.now() / 1000) - 3600),
      drawTime: String(Math.floor(Date.now() / 1000) - 1800),
      winner: '0x1234567890abcdef1234567890abcdef12345678',
      winnerPrize: '900000000000000000000',
    });

    await page.goto('/');

    const statusBadge = page.getByTestId('round-status');
    await expect(statusBadge).toHaveText(/완료/);

    // 당첨자 정보 확인
    const winnerAddress = page.getByTestId('winner-address');
    await expect(winnerAddress).toBeVisible();
    await expect(winnerAddress).toHaveText(/0x1234\.\.\.5678/);

    const winnerPrize = page.getByTestId('winner-prize');
    await expect(winnerPrize).toBeVisible();
    await expect(winnerPrize).toHaveText(/900 META/);
  });

  test('Cancelled 상태일 때 취소 배지가 표시된다', async ({ mockContract, page }) => {
    mockContract.mockGetCurrentRound({
      roundId: '1',
      status: 3, // Cancelled
      ticketPrice: '100000000000000000000',
      totalPool: '200000000000000000000',
      ticketCount: '2',
      closingTime: String(Math.floor(Date.now() / 1000) - 1800),
      drawTime: String(Math.floor(Date.now() / 1000) - 900),
    });

    await page.goto('/');

    const statusBadge = page.getByTestId('round-status');
    await expect(statusBadge).toHaveText(/취소/);
  });

  test('로딩 상태에서 스켈레톤 UI가 표시된다', async ({ mockContract, page }) => {
    // 빈 데이터로 로딩 상태 시뮬레이션
    mockContract.mockGetCurrentRound({} as any);

    await page.goto('/');

    // 스켈레톤 UI 확인 (data-testid가 skeleton으로 시작하는 요소들)
    const skeleton = page.locator('[data-testid^="skeleton-"]').first();
    await expect(skeleton).toBeVisible();
  });
});
