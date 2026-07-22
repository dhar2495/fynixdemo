export type TxnType = 'income' | 'expense';

export type TxnCategory =
  | 'salary'
  | 'investment'
  | 'transfer'
  | 'groceries'
  | 'utilities'
  | 'rent'
  | 'entertainment'
  | 'travel'
  | 'other';

export interface User {
  id: string;
  email: string;
  password: string; // plaintext for demo only — never do this in production
  name: string;
  role: 'admin' | 'member';
}

export interface Account {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'credit';
  currency: string;
  openingBalance: number;
}

export interface Transaction {
  id: string;
  accountId: string;
  date: string; // ISO yyyy-mm-dd
  type: TxnType;
  category: TxnCategory;
  amount: number;
  description: string;
}
