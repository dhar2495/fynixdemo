/**
 * calc.ts — SyslaFynix calculation engine.
 *
 * Single source of truth for every number the app and API produce. Kept pure
 * and dependency-free so the same logic can be unit-tested directly and so
 * automation can assert exact, reproducible outputs.
 *
 * ROUNDING CONTRACT: all currency values are rounded to 2 decimal places using
 * round-half-up. Automation should expect these exact values.
 */

export interface LoanInput {
  /** Principal amount borrowed, in major currency units (e.g. 500000). */
  principal: number;
  /** Nominal ANNUAL interest rate as a percentage (e.g. 9.5 means 9.5%). */
  annualRatePct: number;
  /** Loan tenure in whole months (e.g. 24). */
  tenureMonths: number;
}

export interface AmortizationRow {
  month: number;
  openingBalance: number;
  emi: number;
  principalComponent: number;
  interestComponent: number;
  closingBalance: number;
}

export interface LoanResult {
  emi: number;
  totalPayment: number;
  totalInterest: number;
  schedule: AmortizationRow[];
}

/** Round half-up to `dp` decimal places. Stable and locale-independent. */
export function round(value: number, dp = 2): number {
  const f = Math.pow(10, dp);
  return Math.round((value + Number.EPSILON) * f) / f;
}

/**
 * Standard reducing-balance EMI (equated monthly instalment).
 *
 *        P * r * (1 + r)^n
 *  EMI = ------------------      where r = annualRate / 12 / 100, n = tenureMonths
 *        (1 + r)^n - 1
 *
 * When the rate is 0, EMI is simply principal / tenure.
 */
export function computeEmi(principal: number, annualRatePct: number, tenureMonths: number): number {
  if (tenureMonths <= 0) return 0;
  const r = annualRatePct / 12 / 100;
  if (r === 0) return round(principal / tenureMonths);
  const factor = Math.pow(1 + r, tenureMonths);
  return round((principal * r * factor) / (factor - 1));
}

/**
 * Full loan breakdown including a month-by-month amortization schedule.
 * The final month's principal component is adjusted so the closing balance
 * lands exactly on 0 (absorbs cumulative rounding).
 */
export function computeLoan(input: LoanInput): LoanResult {
  const { principal, annualRatePct, tenureMonths } = input;
  const emi = computeEmi(principal, annualRatePct, tenureMonths);
  const r = annualRatePct / 12 / 100;

  const schedule: AmortizationRow[] = [];
  let balance = principal;

  for (let month = 1; month <= tenureMonths; month++) {
    const interest = round(balance * r);
    let principalComponent = round(emi - interest);
    const isLast = month === tenureMonths;

    // Last instalment clears the remaining balance exactly.
    if (isLast) principalComponent = round(balance);

    const closing = round(balance - principalComponent);
    schedule.push({
      month,
      openingBalance: round(balance),
      emi: isLast ? round(principalComponent + interest) : emi,
      principalComponent,
      interestComponent: interest,
      closingBalance: closing <= 0 ? 0 : closing,
    });
    balance = closing;
  }

  const totalPayment = round(schedule.reduce((s, row) => s + row.emi, 0));
  const totalInterest = round(totalPayment - principal);
  return { emi, totalPayment, totalInterest, schedule };
}

/** Sum of income transactions minus sum of expense transactions. */
export function computeNet(txns: { type: 'income' | 'expense'; amount: number }[]): {
  income: number;
  expense: number;
  net: number;
} {
  let income = 0;
  let expense = 0;
  for (const t of txns) {
    if (t.type === 'income') income += t.amount;
    else expense += t.amount;
  }
  income = round(income);
  expense = round(expense);
  return { income, expense, net: round(income - expense) };
}
