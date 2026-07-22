import { Router } from 'express';
import { store, nextId } from '../data/store';
import { requireAuth } from '../middleware/auth';
import { TxnCategory, TxnType } from '../lib/types';

const router = Router();
router.use(requireAuth);

const TYPES: TxnType[] = ['income', 'expense'];
const CATEGORIES: TxnCategory[] = [
  'salary', 'investment', 'transfer', 'groceries', 'utilities',
  'rent', 'entertainment', 'travel', 'other',
];

const isIsoDate = (s: unknown): s is string =>
  typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s));

function validate(body: any): string | null {
  if (body == null || typeof body !== 'object') return 'Request body is required';
  if (typeof body.amount !== 'number' || Number.isNaN(body.amount)) return 'amount must be a number';
  if (body.amount <= 0) return 'amount must be greater than 0';
  if (!TYPES.includes(body.type)) return `type must be one of: ${TYPES.join(', ')}`;
  if (!CATEGORIES.includes(body.category)) return `category must be one of: ${CATEGORIES.join(', ')}`;
  if (!isIsoDate(body.date)) return 'date must be in yyyy-mm-dd format';
  if (body.date > new Date().toISOString().slice(0, 10)) return 'date cannot be in the future';
  if (!store.accounts.some((a) => a.id === body.accountId)) return 'accountId does not exist';
  return null;
}

/**
 * GET /api/transactions — list with optional filtering, search, sort, paging.
 * Query: type, category, q (search description), sort (date|amount),
 * order (asc|desc), page (1-based), pageSize.
 */
router.get('/', (req, res) => {
  let items = [...store.transactions];
  const { type, category, q, sort = 'date', order = 'desc' } = req.query as Record<string, string>;

  if (type) items = items.filter((t) => t.type === type);
  if (category) items = items.filter((t) => t.category === category);
  if (q) items = items.filter((t) => t.description.toLowerCase().includes(q.toLowerCase()));

  items.sort((a, b) => {
    const dir = order === 'asc' ? 1 : -1;
    if (sort === 'amount') return (a.amount - b.amount) * dir;
    return (a.date < b.date ? -1 : a.date > b.date ? 1 : 0) * dir;
  });

  const total = items.length;
  const page = Math.max(1, parseInt((req.query.page as string) || '1', 10));
  const pageSize = Math.max(1, parseInt((req.query.pageSize as string) || '10', 10));
  const start = (page - 1) * pageSize;
  const paged = items.slice(start, start + pageSize);

  res.json({ transactions: paged, total, page, pageSize });
});

/** GET /api/transactions/:id */
router.get('/:id', (req, res) => {
  const txn = store.transactions.find((t) => t.id === req.params.id);
  if (!txn) return res.status(404).json({ error: 'Transaction not found' });
  return res.json({ transaction: txn });
});

/** POST /api/transactions — create. */
router.post('/', (req, res) => {
  const err = validate(req.body);
  if (err) return res.status(400).json({ error: err });
  const txn = {
    id: nextId('t'),
    accountId: req.body.accountId,
    date: req.body.date,
    type: req.body.type,
    category: req.body.category,
    amount: req.body.amount,
    description: (req.body.description || '').toString().slice(0, 120),
  };
  store.transactions.push(txn);
  return res.status(201).json({ transaction: txn });
});

/** PUT /api/transactions/:id — update. */
router.put('/:id', (req, res) => {
  const idx = store.transactions.findIndex((t) => t.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Transaction not found' });
  const err = validate(req.body);
  if (err) return res.status(400).json({ error: err });
  store.transactions[idx] = {
    ...store.transactions[idx],
    accountId: req.body.accountId,
    date: req.body.date,
    type: req.body.type,
    category: req.body.category,
    amount: req.body.amount,
    description: (req.body.description || '').toString().slice(0, 120),
  };
  return res.json({ transaction: store.transactions[idx] });
});

/** DELETE /api/transactions/:id */
router.delete('/:id', (req, res) => {
  const idx = store.transactions.findIndex((t) => t.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Transaction not found' });
  const [removed] = store.transactions.splice(idx, 1);
  return res.json({ deleted: removed.id });
});

export default router;
