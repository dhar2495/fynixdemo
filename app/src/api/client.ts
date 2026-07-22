import Constants from 'expo-constants';

/**
 * Resolve the API base URL. Order of precedence:
 *  1. EXPO_PUBLIC_API_URL env var (set per environment / CI)
 *  2. app.json extra.apiBaseUrl
 *  3. localhost fallback
 */
const BASE =
  process.env.EXPO_PUBLIC_API_URL ||
  (Constants.expoConfig?.extra as any)?.apiBaseUrl ||
  'http://localhost:4000/api';

let token: string | null = null;
export const setToken = (t: string | null) => { token = t; };
export const getBaseUrl = () => BASE;

async function request<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(opts.headers || {}),
    },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((body as any).error || `Request failed (${res.status})`);
  return body as T;
}

export interface Txn {
  id: string; accountId: string; date: string;
  type: 'income' | 'expense'; category: string; amount: number; description: string;
}
export interface Summary {
  income: number; expense: number; net: number;
  openingBalance: number; currentBalance: number; transactionCount: number;
}
export interface LoanResult {
  emi: number; totalPayment: number; totalInterest: number;
  schedule: { month: number; openingBalance: number; emi: number; principalComponent: number; interestComponent: number; closingBalance: number }[];
}
export interface Account {
  id: string; name: string; type: string; currency: string; openingBalance: number;
}

export const api = {
  login: (email: string, password: string) =>
    request<{ token: string; user: { id: string; email: string; name: string; role: string } }>(
      '/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) },
    ),
  summary: () => request<Summary>('/accounts/summary'),
  accounts: () => request<{ accounts: Account[] }>('/accounts'),
  listTxns: (params: Record<string, string> = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request<{ transactions: Txn[]; total: number; page: number; pageSize: number }>(
      `/transactions${qs ? `?${qs}` : ''}`,
    );
  },
  createTxn: (t: Omit<Txn, 'id'>) =>
    request<{ transaction: Txn }>('/transactions', { method: 'POST', body: JSON.stringify(t) }),
  deleteTxn: (id: string) => request<{ deleted: string }>(`/transactions/${id}`, { method: 'DELETE' }),
  calcLoan: (principal: number, annualRatePct: number, tenureMonths: number) =>
    request<LoanResult>('/loans/calculate', {
      method: 'POST', body: JSON.stringify({ principal, annualRatePct, tenureMonths }),
    }),
  reset: () => request<{ reset: boolean }>('/reset', { method: 'POST' }),
};
