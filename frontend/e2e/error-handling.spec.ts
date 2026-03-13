import { test } from './fixtures';
import { expect } from '@playwright/test';

test.describe('에러 처리', () => {
  test('네트워크 오류 시 에러 메시지가 표시된다', async ({ mockContract, page }) => {
    // 네트워크 에러 시뮬레이션
    mockContract.simulateNetworkError();

    await page.goto('/');

    // 에러 메시지 확인
    const errorMessage = page.getByTestId('error-message');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toHaveText(/네트워크 연결을 확인해 주세요/);
  });

  test('네트워크 오류 시 재시도 버튼이 표시된다', async ({ mockContract, page }) => {
    mockContract.simulateNetworkError();

    await page.goto('/');

    // 재시도 버튼 확인
    const retryButton = page.getByRole('button', { name: /재시도|다시 시도/i });
    await expect(retryButton).toBeVisible();
    await expect(retryButton).toBeEnabled();
  });

  test('재시도 버튼 클릭 시 데이터를 다시 조회한다', async ({ mockContract, page }) => {
    // 먼저 에러 상태로 진입
    mockContract.simulateNetworkError();
    await page.goto('/');

    const errorMessage = page.getByTestId('error-message');
    await expect(errorMessage).toBeVisible();

    // 에러 해제 후 재시도
    mockContract.clearMocks();
    mockContract.mockGetCurrentRound({
      roundId: 1n,
      status: 0,
      ticketPrice: 100000000000000000000n,
      totalPool: 1000000000000000000000n,
      ticketCount: 10n,
      closingTime: BigInt(Math.floor(Date.now() / 1000) + 3600),
      drawTime: BigInt(Math.floor(Date.now() / 1000) + 7200),
    });

    const retryButton = page.getByRole('button', { name: /재시도|다시 시도/i });
    await retryButton.click();

    // 에러 메시지가 사라지고 정상 데이터가 표시되는지 확인
    await expect(errorMessage).not.toBeVisible();

    const statusBadge = page.getByTestId('round-status');
    await expect(statusBadge).toBeVisible();
    await expect(statusBadge).toHaveText(/진행 중/);
  });

  test('RPC 타임아웃 시 적절한 에러 메시지가 표시된다', async ({ page }) => {
    // RPC 타임아웃 시뮬레이션 (스크립트 주입)
    await page.addInitScript(() => {
      window.__MOCK_RPC_TIMEOUT__ = true;
    });

    await page.goto('/');

    const errorMessage = page.getByTestId('error-message');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toHaveText(/타임아웃|요청 시간 초과/);
  });

  test('잘못된 컨트랙트 주소 시 에러 메시지가 표시된다', async ({ page }) => {
    // 잘못된 컨트랙트 주소 시뮬레이션
    await page.addInitScript(() => {
      window.__MOCK_INVALID_CONTRACT__ = true;
    });

    await page.goto('/');

    const errorMessage = page.getByTestId('error-message');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toHaveText(/컨트랙트를 찾을 수 없습니다/);
  });

  test('지갑 연결 실패 시 에러 메시지가 표시된다', async ({ page }) => {
    // 지갑 연결 실패 시뮬레이션
    await page.addInitScript(() => {
      window.__MOCK_WALLET_ERROR__ = 'connection_failed';
    });

    await page.goto('/');

    const connectButton = page.getByRole('button', { name: /지갑 연결/i });
    await connectButton.click();

    // 에러 메시지 확인 (토스트 등)
    const errorMessage = page.getByText(/지갑 연결이 실패했습니다|연결 오류/i);
    await expect(errorMessage).toBeVisible();
  });

  test('사용자가 트랜잭션을 거부했을 때 메시지가 표시된다', async ({ mockWallet, page }) => {
    await page.goto('/');

    // 트랜잭션 거부 시뮬레이션
    mockWallet.mockTransactionRejected();

    // 구매 버튼 클릭 (트랜잭션 거부 확인)
    const purchaseButton = page.getByRole('button', { name: /티켓 구매/i });
    if (await purchaseButton.isEnabled()) {
      await purchaseButton.click();
    }

    // 거부 메시지 확인
    const errorMessage = page.getByText(/트랜잭션이 취소되었습니다|거부되었습니다/i);
    await expect(errorMessage).toBeVisible();
  });

  test('로딩 중 에러 발생 시 스켈레톤에서 에러 상태로 전환된다', async ({ mockContract, page }) => {
    // 빈 데이터로 로딩 상태 진입
    mockContract.mockGetCurrentRound({} as any);

    await page.goto('/');

    // 스켈레톤 UI 확인
    const skeleton = page.locator('[data-testid^="skeleton-"]').first();
    await expect(skeleton).toBeVisible();

    // 에러 발생 시뮬레이션 (약간의 지연 후)
    await page.waitForTimeout(1000);
    mockContract.simulateNetworkError();
    await page.reload();

    // 에러 메시지 확인
    const errorMessage = page.getByTestId('error-message');
    await expect(errorMessage).toBeVisible();
  });

  test('여러 번 재시도해도 실패 시 적절한 메시지가 표시된다', async ({ mockContract, page }) => {
    mockContract.simulateNetworkError();

    await page.goto('/');

    const retryButton = page.getByRole('button', { name: /재시도|다시 시도/i });

    // 3번 재시도
    for (let i = 0; i < 3; i++) {
      await retryButton.click();
      await page.waitForTimeout(500);
    }

    // 여전히 에러 메시지가 표시되는지 확인
    const errorMessage = page.getByTestId('error-message');
    await expect(errorMessage).toBeVisible();
  });

  test('에러 발생 후 새로고침 시 정상적으로 복구된다', async ({ mockContract, page }) => {
    // 에러 상태 진입
    mockContract.simulateNetworkError();
    await page.goto('/');

    const errorMessage = page.getByTestId('error-message');
    await expect(errorMessage).toBeVisible();

    // 에러 해제 및 정상 데이터 설정
    mockContract.clearMocks();
    mockContract.mockGetCurrentRound({
      roundId: 1n,
      status: 0,
      ticketPrice: 100000000000000000000n,
      totalPool: 1000000000000000000000n,
      ticketCount: 10n,
      closingTime: BigInt(Math.floor(Date.now() / 1000) + 3600),
      drawTime: BigInt(Math.floor(Date.now() / 1000) + 7200),
    });

    // 새로고침
    await page.reload();

    // 정상 데이터 표시 확인
    await expect(errorMessage).not.toBeVisible();

    const statusBadge = page.getByTestId('round-status');
    await expect(statusBadge).toBeVisible();
    await expect(statusBadge).toHaveText(/진행 중/);
  });
});
