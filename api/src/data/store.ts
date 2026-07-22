import { Account, Transaction, User } from '../lib/types';

/**
 * Deterministic seed data. Fixed ids, dates and amounts so automation can
 * assert exact values and reset to a known baseline between tests.
 */
export const SEED_USERS: User[] = [
  { id: 'u-1', email: 'demo@SyslaFynix.dev', password: 'Demo@123', name: 'Demo Admin', role: 'admin' },
  { id: 'u-2', email: 'member@SyslaFynix.dev', password: 'Member@123', name: 'Demo Member', role: 'member' },
];

export const SEED_ACCOUNTS: Account[] = [
  { id: 'a-1', name: 'Primary Checking', type: 'checking', currency: 'INR', openingBalance: 50000 },
  { id: 'a-2', name: 'Savings', type: 'savings', currency: 'INR', openingBalance: 200000 },
];

export const SEED_TRANSACTIONS: Transaction[] = [
  { id: 't-1', accountId: 'a-1', date: '2025-01-05', type: 'income', category: 'salary', amount: 85000, description: 'January salary' },
  { id: 't-2', accountId: 'a-1', date: '2025-01-07', type: 'expense', category: 'rent', amount: 25000, description: 'Apartment rent' },
  { id: 't-3', accountId: 'a-1', date: '2025-01-09', type: 'expense', category: 'groceries', amount: 4200, description: 'Weekly groceries' },
  { id: 't-4', accountId: 'a-1', date: '2025-01-12', type: 'expense', category: 'utilities', amount: 3100, description: 'Electricity + water' },
  { id: 't-5', accountId: 'a-2', date: '2025-01-15', type: 'income', category: 'investment', amount: 12500, description: 'Dividend payout' },
  { id: 't-6', accountId: 'a-1', date: '2025-01-18', type: 'expense', category: 'entertainment', amount: 1800, description: 'Concert tickets' },
  { id: 't-7', accountId: 'a-1', date: '2025-01-22', type: 'expense', category: 'travel', amount: 6400, description: 'Train + cab' },
  { id: 't-8', accountId: 'a-2', date: '2025-01-25', type: 'income', category: 'salary', amount: 15000, description: 'Freelance project' },
];

interface Store {
  users: User[];
  accounts: Account[];
  transactions: Transaction[];
  seq: number;
}

// Deep clone so a reset restores pristine seed values.
const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v));

export const store: Store = {
  users: clone(SEED_USERS),
  accounts: clone(SEED_ACCOUNTS),
  transactions: clone(SEED_TRANSACTIONS),
  seq: 100,
};

/** Restore the store to the deterministic seed state. Used by POST /reset. */
export function resetStore(): void {
  store.users = clone(SEED_USERS);
  store.accounts = clone(SEED_ACCOUNTS);
  store.transactions = clone(SEED_TRANSACTIONS);
  store.seq = 100;
}

/** Monotonic id generator for new records. */
export function nextId(prefix: string): string {
  store.seq += 1;
  return `${prefix}-${store.seq}`;
}
