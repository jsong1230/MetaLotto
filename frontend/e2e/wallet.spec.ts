import { test } from './fixtures';
import { expect } from '@playwright/test';

test.describe('지갑 연결', () => {
  test('지갑 연결 버튼이 표시된다', async ({ page }) => {
    await page.goto('/');

    const connectButton = page.getByRole('button', { name: /지갑 연결/i });
    await expect(connectButton).toBeVisible();
    await expect(connectButton).toBeEnabled();
  });

  test('지갑 연결 시 주소와 잔액이 표시된다', async ({ mockWallet, mockContract, page }) => {
    mockContract.mockGetCurrentRound({
      roundId: '1',
      status: 0,
      ticketPrice: '100000000000000000000',
      totalPool: '1000000000000000000000',
      ticketCount: '10',
      closingTime: String(Math.floor(Date.now() / 1000) + 3600),
      drawTime: String(Math.floor(Date.now() / 1000) + 7200),
    });

    mockWallet.mockConnect({
      address: '0x1234567890abcdef1234567890abcdef12345678',
      balance: '1000000000000000000000', // 1000 META
      isConnected: true,
    });

    await page.goto('/');
    await page.waitForTimeout(500); // Mock 이벤트 대기

    // 지갑 주소 확인 (마스킹된 형태)
    const walletAddress = page.getByTestId('wallet-address');
    await expect(walletAddress).toBeVisible();
    await expect(walletAddress).toHaveText(/0x1234\.\.\.5678/);

    // META 잔액 확인
    const walletBalance = page.getByTestId('wallet-balance');
    await expect(walletBalance).toBeVisible();
    await expect(walletBalance).toHaveText(/1000 META/);

    // 연결 해제 버튼 확인
    const disconnectButton = page.getByRole('button', { name: /연결 해제/i });
    await expect(disconnectButton).toBeVisible();
  });

  test('지갑 연결 시 구매 버튼이 활성화된다', async ({ mockWallet, mockContract, page }) => {
    mockContract.mockGetCurrentRound({
      roundId: '1',
      status: 0,
      ticketPrice: '100000000000000000000',
      totalPool: '1000000000000000000000',
      ticketCount: '10',
      closingTime: String(Math.floor(Date.now() / 1000) + 3600),
      drawTime: String(Math.floor(Date.now() / 1000) + 7200),
    });

    mockWallet.mockConnect({
      address: '0x1234567890abcdef1234567890abcdef12345678',
      balance: '1000000000000000000000',
      isConnected: true,
    });

    await page.goto('/');
    await page.waitForTimeout(500);

    const purchaseButton = page.getByRole('button', { name: /티켓 구매/i });
    await expect(purchaseButton).toBeEnabled();
  });

  test('지갑 연결 해제 시 연결 버튼으로 변경된다', async ({ mockWallet, mockContract, page }) => {
    mockContract.mockGetCurrentRound({
      roundId: '1',
      status: 0,
      ticketPrice: '100000000000000000000',
      totalPool: '1000000000000000000000',
      ticketCount: '10',
      closingTime: String(Math.floor(Date.now() / 1000) + 3600),
      drawTime: String(Math.floor(Date.now() / 1000) + 7200),
    });

    // 먼저 연결
    mockWallet.mockConnect({
      address: '0x1234567890abcdef1234567890abcdef12345678',
      balance: '1000000000000000000000',
      isConnected: true,
    });

    await page.goto('/');
    await page.waitForTimeout(500);

    // 연결 상태 확인
    const walletAddress = page.getByTestId('wallet-address');
    await expect(walletAddress).toBeVisible();

    // 연결 해제
    mockWallet.mockDisconnect();
    await page.waitForTimeout(500);

    // 연결 버튼으로 변경 확인
    const connectButton = page.getByRole('button', { name: /지갑 연결/i });
    await expect(connectButton).toBeVisible();
    await expect(walletAddress).not.toBeVisible();
  });

  test('잔액 부족 시 경고 메시지가 표시된다', async ({ mockWallet, mockContract, page }) => {
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
      balance: '50000000000000000000', // 50 META (부족)
      isConnected: true,
    });

    await page.goto('/');
    await page.waitForTimeout(500);

    // 잔액 부족 경고 확인
    const balanceWarning = page.getByText(/잔액이 부족합니다/i);
    await expect(balanceWarning).toBeVisible();
  });

  test('잘못된 네트워크 시 전환 요청 메시지가 표시된다', async ({ mockWallet, page }) => {
    mockWallet.mockNetworkMismatch();

    await page.goto('/');
    await page.waitForTimeout(500);

    // 네트워크 전환 요청 메시지 확인
    const networkWarning = page.getByText(/Metadium 네트워크로 전환해 주세요/i);
    await expect(networkWarning).toBeVisible();

    // 전환 버튼 확인
    const switchButton = page.getByRole('button', { name: /네트워크 전환/i });
    await expect(switchButton).toBeVisible();
  });
});
