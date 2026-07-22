import { Router } from 'express';
import { store } from '../data/store';
import { requireAuth } from '../middleware/auth';
import { computeNet, round } from '../lib/calc';

const router = Router();
router.use(requireAuth);

/** GET /api/accounts — list all accounts. */
router.get('/', (_req, res) => {
  res.json({ accounts: store.accounts });
});

/**
 * GET /api/accounts/summary — dashboard KPIs derived from live data.
 * Returns income, expense, net movement and current balance
 * (opening balances + net). All values recomputed on every call.
 */
router.get('/summary', (_req, res) => {
  const { income, expense, net } = computeNet(store.transactions);
  const openingTotal = round(store.accounts.reduce((s, a) => s + a.openingBalance, 0));
  const currentBalance = round(openingTotal + net);
  res.json({
    income,
    expense,
    net,
    openingBalance: openingTotal,
    currentBalance,
    transactionCount: store.transactions.length,
  });
});

export default router;
