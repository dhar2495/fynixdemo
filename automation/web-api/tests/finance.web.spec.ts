import { test, expect } from '@playwright/test';
import { SyslaFynixWeb } from '../pages/SyslaFynixWeb';
import { CREDENTIALS, LOAN_CASE } from './commonUtils';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('end-to-end: login, add a transaction, verify the loan calculation', async ({ page }) => {
  const app = new SyslaFynixWeb(page);

  // 1. Login
  await app.login(CREDENTIALS.admin.email, CREDENTIALS.admin.password);
  await expect(page.locator('[data-testid="kpi-net-value"]')).toBeVisible();

  // 2. Add a transaction and confirm the toast
  await app.gotoTab('transactions');
  await app.addTransaction('2500', 'Playwright expense');

  // 3. Loan calculation matches the known-good expectation
  await app.gotoTab('loan');
  const emi = await app.calcLoan(
    String(LOAN_CASE.input.principal),
    String(LOAN_CASE.input.annualRatePct),
    String(LOAN_CASE.input.tenureMonths),
  );
  expect(emi).toContain('22,957.25');
  await expect(page.locator('[data-testid="loan-schedule-toggle"]')).toBeVisible();
});

test('login rejects bad credentials', async ({ page }) => {
  const app = new SyslaFynixWeb(page);
  await app.login(CREDENTIALS.bad.email, CREDENTIALS.bad.password);
  await expect(page.locator('[data-testid="login-error"]')).toBeVisible();
});
