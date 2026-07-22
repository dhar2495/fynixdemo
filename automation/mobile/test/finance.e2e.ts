/**
 * finance.e2e.ts — one spec that runs unchanged on Android and iOS.
 * The `~name` selector resolves to accessibilityId, which maps to the SAME
 * testID strings the web build uses. This is the "one locator contract,
 * three surfaces" story: web (Playwright data-testid), Android and iOS
 * (Appium accessibility id) all key off src/testids.ts.
 */

const CREDS = { email: 'demo@SyslaFynix.dev', password: 'Demo@123' };

describe('SyslaFynix — mobile E2E', () => {
  it('logs in and lands on the dashboard', async () => {
    await $('~login-email').setValue(CREDS.email);
    await $('~login-password').setValue(CREDS.password);
    await $('~login-submit').click();

    const net = await $('~kpi-net-value');
    await net.waitForDisplayed({ timeout: 15_000 });
    expect(await net.getText()).toContain('₹');
  });

  it('adds a transaction and shows the confirmation toast', async () => {
    await $('~tab-transactions').click();
    await $('~txn-add-open').click();
    await $('~txn-form-amount').setValue('2500');
    await $('~txn-form-description').setValue('Appium expense');
    await $('~txn-form-submit').click();

    const toast = await $('~toast');
    await toast.waitForDisplayed({ timeout: 10_000 });
  });

  it('calculates a loan and reveals the amortization schedule', async () => {
    await $('~tab-loan').click();
    await $('~loan-principal').setValue('500000');
    await $('~loan-rate').setValue('9.5');
    await $('~loan-tenure').setValue('24');
    await $('~loan-calculate').click();

    const emi = await $('~loan-emi-result');
    await emi.waitForDisplayed({ timeout: 10_000 });
    expect(await emi.getText()).toContain('22,957.25');

    await $('~loan-schedule-toggle').click();
    await $('~loan-schedule-table').waitForDisplayed({ timeout: 10_000 });
  });
});
