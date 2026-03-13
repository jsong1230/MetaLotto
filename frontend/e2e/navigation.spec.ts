import { test } from './fixtures';
import { expect } from '@playwright/test';

test.describe('네비게이션', () => {
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

  test('홈 페이지에서 히스토리 페이지로 이동한다', async ({ page }) => {
    await page.goto('/');

    // 히스토리 링크 클릭
    const historyLink = page.getByRole('link', { name: /히스토리|History/i });
    await historyLink.click();

    // URL 확인
    await expect(page).toHaveURL(/\/history/);

    // 히스토리 페이지 제목 확인
    const pageTitle = page.getByRole('heading', { name: /히스토리|History/i });
    await expect(pageTitle).toBeVisible();
  });

  test('뒤로가기로 홈 페이지로 돌아간다', async ({ page }) => {
    await page.goto('/');
    await page.goto('/history');

    // 뒤로가기
    await page.goBack();

    // 홈 페이지 URL 확인
    await expect(page).toHaveURL('/');
  });

  test('브라우저 뒤로가기/앞으로가기가 정상 작동한다', async ({ page }) => {
    await page.goto('/');

    // 히스토리 페이지로 이동
    const historyLink = page.getByRole('link', { name: /히스토리|History/i });
    await historyLink.click();
    await expect(page).toHaveURL(/\/history/);

    // 뒤로가기
    await page.goBack();
    await expect(page).toHaveURL('/');

    // 앞으로가기
    await page.goForward();
    await expect(page).toHaveURL(/\/history/);
  });

  test('헤더 네비게이션이 항상 표시된다', async ({ page }) => {
    await page.goto('/');

    const header = page.getByTestId('header');
    await expect(header).toBeVisible();

    // 로고 확인
    const logo = page.getByRole('link', { name: /MetaLotto/i });
    await expect(logo).toBeVisible();
  });

  test('풋터가 항상 표시된다', async ({ page }) => {
    await page.goto('/');

    const footer = page.getByTestId('footer');
    await expect(footer).toBeVisible();
  });
});
