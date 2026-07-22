import { test, expect, APIRequestContext } from '@playwright/test';
import { CREDENTIALS, buildTransaction, LOAN_CASE } from './commonUtils';

async function login(request: APIRequestContext): Promise<string> {
  const res = await request.post('/api/auth/login', { data: CREDENTIALS.admin });
  expect(res.ok()).toBeTruthy();
  return (await res.json()).token as string;
}

test.describe('Auth', () => {
  test('valid login returns a token and user', async ({ request }) => {
    const res = await request.post('/api/auth/login', { data: CREDENTIALS.admin });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.token).toBeTruthy();
    expect(body.user.email).toBe(CREDENTIALS.admin.email);
  });

  test('invalid credentials are rejected', async ({ request }) => {
    const res = await request.post('/api/auth/login', { data: CREDENTIALS.bad });
    expect(res.status()).toBe(401);
  });

  test('protected route requires a token', async ({ request }) => {
    const res = await request.get('/api/accounts/summary');
    expect(res.status()).toBe(401);
  });
});

test.describe('Transactions CRUD', () => {
  test('create then delete a transaction and see the count change', async ({ request }) => {
    const token = await login(request);
    const headers = { Authorization: `Bearer ${token}` };

    const before = await (await request.get('/api/accounts/summary', { headers })).json();

    const create = await request.post('/api/transactions', { headers, data: buildTransaction({ amount: 4321 }) });
    expect(create.status()).toBe(201);
    const created = (await create.json()).transaction;
    expect(created.id).toMatch(/^t-\d+$/);

    const mid = await (await request.get('/api/accounts/summary', { headers })).json();
    expect(mid.transactionCount).toBe(before.transactionCount + 1);
    expect(mid.expense).toBe(before.expense + 4321);

    const del = await request.delete(`/api/transactions/${created.id}`, { headers });
    expect(del.status()).toBe(200);

    const after = await (await request.get('/api/accounts/summary', { headers })).json();
    expect(after.transactionCount).toBe(before.transactionCount);
  });

  test('validation rejects a future-dated transaction', async ({ request }) => {
    const token = await login(request);
    const future = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
    const res = await request.post('/api/transactions', {
      headers: { Authorization: `Bearer ${token}` },
      data: buildTransaction({ date: future }),
    });
    expect(res.status()).toBe(400);
    expect((await res.json()).error).toContain('future');
  });
});

test.describe('Loan calculation', () => {
  test('EMI and totals match the expected reducing-balance result', async ({ request }) => {
    const res = await request.post('/api/loans/calculate', { data: LOAN_CASE.input });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.emi).toBe(LOAN_CASE.expected.emi);
    expect(body.totalInterest).toBe(LOAN_CASE.expected.totalInterest);
    expect(body.totalPayment).toBe(LOAN_CASE.expected.totalPayment);
    expect(body.schedule).toHaveLength(LOAN_CASE.input.tenureMonths);
    expect(body.schedule.at(-1).closingBalance).toBe(0);
  });

  test('rejects invalid tenure', async ({ request }) => {
    const res = await request.post('/api/loans/calculate', {
      data: { principal: 100000, annualRatePct: 8, tenureMonths: 0 },
    });
    expect(res.status()).toBe(400);
  });
});

test('reset restores the seed baseline', async ({ request }) => {
  const token = await login(request);
  const headers = { Authorization: `Bearer ${token}` };
  await request.post('/api/transactions', { headers, data: buildTransaction() });
  await request.post('/api/reset', { headers });
  const summary = await (await request.get('/api/accounts/summary', { headers })).json();
  expect(summary.transactionCount).toBe(8); // deterministic seed count
});
