import { Page, expect } from '@playwright/test';

/** Locators use data-testid, which the Expo web build derives from the same
 *  testID props the native app uses — one contract, three surfaces. */
const tid = (id: string) => `[data-testid="${id}"]`;

export class SyslaFynixWeb {
  constructor(private page: Page) {}

  async login(email: string, password: string) {
    await this.page.fill(tid('login-email'), email);
    await this.page.fill(tid('login-password'), password);
    await this.page.click(tid('login-submit'));
  }

  async gotoTab(tab: 'dashboard' | 'transactions' | 'loan' | 'settings') {
    // Desktop nav lives behind the floating-button drawer now (hidden by
    // default so the dashboard gets full width) — open it, then pick the
    // destination. Selecting a row auto-closes the drawer.
    await this.page.click(tid('sidebar-logo'));
    await this.page.click(tid(`tab-${tab}`));
  }

  async kpiNet() {
    return (await this.page.textContent(tid('kpi-net-value')))?.trim();
  }

  async addTransaction(amount: string, description: string) {
    await this.page.click(tid('txn-add-open'));
    await this.page.fill(tid('txn-form-amount'), amount);
    await this.page.fill(tid('txn-form-description'), description);
    await this.page.click(tid('txn-form-submit'));
    await expect(this.page.locator(tid('toast'))).toBeVisible();
  }

  async calcLoan(principal: string, rate: string, tenure: string) {
    await this.page.fill(tid('loan-principal'), principal);
    await this.page.fill(tid('loan-rate'), rate);
    await this.page.fill(tid('loan-tenure'), tenure);
    await this.page.click(tid('loan-calculate'));
    return (await this.page.textContent(tid('loan-emi-result')))?.trim();
  }
}
