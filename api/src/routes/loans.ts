import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { computeLoan } from '../lib/calc';
import { resetStore } from '../data/store';

const router = Router();

/**
 * POST /api/loans/calculate — reducing-balance EMI + amortization schedule.
 * Public (no auth) so it can be demoed straight from Swagger without a token.
 * Body: { principal, annualRatePct, tenureMonths }.
 */
router.post('/calculate', (req, res) => {
  const { principal, annualRatePct, tenureMonths } = req.body || {};
  if (typeof principal !== 'number' || principal <= 0) {
    return res.status(400).json({ error: 'principal must be a positive number' });
  }
  if (typeof annualRatePct !== 'number' || annualRatePct < 0) {
    return res.status(400).json({ error: 'annualRatePct must be zero or positive' });
  }
  if (!Number.isInteger(tenureMonths) || tenureMonths <= 0 || tenureMonths > 600) {
    return res.status(400).json({ error: 'tenureMonths must be a whole number between 1 and 600' });
  }
  const result = computeLoan({ principal, annualRatePct, tenureMonths });
  return res.json(result);
});

/** POST /api/reset — restore deterministic seed data (auth required). */
export const resetRouter = Router();
resetRouter.post('/', requireAuth, (_req, res) => {
  resetStore();
  res.json({ reset: true });
});

export default router;
