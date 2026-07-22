/**
 * commonUtils — shared helpers and a deterministic-ish data generator used
 * across API and web specs. Mirrors the pattern used in the Syslatech
 * frameworks: centralised builders so specs stay declarative.
 */
export const CREDENTIALS = {
  admin: { email: 'demo@SyslaFynix.dev', password: 'Demo@123' },
  member: { email: 'member@SyslaFynix.dev', password: 'Member@123' },
  bad: { email: 'demo@SyslaFynix.dev', password: 'wrong' },
};

let counter = 0;
export function buildTransaction(overrides: Partial<Record<string, unknown>> = {}) {
  counter += 1;
  return {
    accountId: 'a-1',
    date: new Date().toISOString().slice(0, 10),
    type: 'expense',
    category: 'groceries',
    amount: 1000 + counter,
    description: `Automated txn ${counter}`,
    ...overrides,
  };
}

/** Known-good loan case with pre-computed expectations for assertions. */
export const LOAN_CASE = {
  input: { principal: 500000, annualRatePct: 9.5, tenureMonths: 24 },
  expected: { emi: 22957.25, totalInterest: 50973.92, totalPayment: 550973.92 },
};
