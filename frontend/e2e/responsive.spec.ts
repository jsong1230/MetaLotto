import { test, expect } from '@playwright/test';

test.describe('반응형 디자인', () => {
  test.describe('모바일 뷰포트', () => {
    test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE

    test('모바일에서 레이아웃이 올바르게 표시된다', async ({ page }) => {
      await page.goto('/');

      // 메인 컨텐츠 확인
      const mainContent = page.getByTestId('main-content');
      await expect(mainContent).toBeVisible();

      // 모바일 햄버거 메뉴 확인 (모바일에서만 표시)
      const mobileMenu = page.getByTestId('mobile-menu-button');
      await expect(mobileMenu).toBeVisible();
    });

    test('모바일에서 지갑 연결 버튼이 표시된다', async ({ page }) => {
      await page.goto('/');

      const connectButton = page.getByRole('button', { name: /지갑 연결/i });
      await expect(connectButton).toBeVisible();
      await expect(connectButton).toBeEnabled();
    });

    test('모바일에서 라운드 정보가 올바르게 표시된다', async ({ page }) => {
      await page.goto('/');

      // 라운드 정보 확인
      const statusBadge = page.getByTestId('round-status');
      await expect(statusBadge).toBeVisible();

      const poolSize = page.getByTestId('pool-size');
      await expect(poolSize).toBeVisible();
    });

    test('모바일에서 티켓 구매 섹션이 표시된다', async ({ page }) => {
      await page.goto('/');

      const purchaseSection = page.getByTestId('ticket-purchase-section');
      await expect(purchaseSection).toBeVisible();

      // 수량 조절 버튼 확인
      const increaseButton = page.getByRole('button', { name: /\+/ });
      await expect(increaseButton).toBeVisible();

      const decreaseButton = page.getByRole('button', { name: /\-/ });
      await expect(decreaseButton).toBeVisible();
    });
  });

  test.describe('태블릿 뷰포트', () => {
    test.use({ viewport: { width: 768, height: 1024 } }); // iPad

    test('태블릿에서 레이아웃이 올바르게 표시된다', async ({ page }) => {
      await page.goto('/');

      const mainContent = page.getByTestId('main-content');
      await expect(mainContent).toBeVisible();
    });

    test('태블릿에서 헤더 네비게이션이 표시된다', async ({ page }) => {
      await page.goto('/');

      const header = page.getByTestId('header');
      await expect(header).toBeVisible();

      // 데스크탑 네비게이션 확인
      const desktopNav = page.getByTestId('desktop-navigation');
      await expect(desktopNav).toBeVisible();
    });
  });

  test.describe('데스크탑 뷰포트', () => {
    test.use({ viewport: { width: 1280, height: 720 } });

    test('데스크탑에서 레이아웃이 올바르게 표시된다', async ({ page }) => {
      await page.goto('/');

      const mainContent = page.getByTestId('main-content');
      await expect(mainContent).toBeVisible();

      const header = page.getByTestId('header');
      await expect(header).toBeVisible();

      const footer = page.getByTestId('footer');
      await expect(footer).toBeVisible();
    });

    test('데스크탑에서 네비게이션이 표시된다', async ({ page }) => {
      await page.goto('/');

      const desktopNav = page.getByTestId('desktop-navigation');
      await expect(desktopNav).toBeVisible();

      // 네비게이션 링크들 확인
      const homeLink = page.getByRole('link', { name: /홈|Home/i });
      await expect(homeLink).toBeVisible();

      const historyLink = page.getByRole('link', { name: /히스토리|History/i });
      await expect(historyLink).toBeVisible();
    });
  });

  test('뷰포트 크기 변경 시 레이아웃이 적응한다', async ({ page }) => {
    await page.goto('/');

    // 모바일로 변경
    await page.setViewportSize({ width: 375, height: 667 });
    const mobileMenu = page.getByTestId('mobile-menu-button');
    await expect(mobileMenu).toBeVisible();

    // 데스크탑으로 변경
    await page.setViewportSize({ width: 1280, height: 720 });
    await expect(mobileMenu).not.toBeVisible();

    const desktopNav = page.getByTestId('desktop-navigation');
    await expect(desktopNav).toBeVisible();
  });
});
