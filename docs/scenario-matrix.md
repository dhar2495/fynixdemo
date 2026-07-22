# End-to-end scenario matrix

One business journey, verified on every surface with the tooling appropriate to
each — this is the coverage story to walk a client through.

## Journey: "Add income, confirm the balance, verify the loan math"

| Step | Web (Playwright) | API (Playwright request) | Android (Appium) | iOS (Appium) |
|------|------------------|--------------------------|------------------|--------------|
| Log in | fill `login-*`, click `login-submit` | `POST /auth/login` → JWT | `~login-*` + `~login-submit` | `~login-*` + `~login-submit` |
| Read baseline KPI | read `kpi-net-value` | `GET /accounts/summary` | `~kpi-net-value` | `~kpi-net-value` |
| Add transaction | `txn-add-open` → form → `txn-form-submit` | `POST /transactions` | `~txn-add-open` → `~txn-form-submit` | same |
| Confirm toast | wait for `toast` | assert 201 body | wait for `~toast` | wait for `~toast` |
| Verify KPI changed | re-read `kpi-net-value` | `GET /accounts/summary` delta | `~kpi-net-value` | `~kpi-net-value` |
| Loan calculation | `loan-calculate` → read `loan-emi-result` | `POST /loans/calculate` | `~loan-emi-result` | `~loan-emi-result` |
| Reset for next run | — | `POST /reset` | via API | via API |

## Why this sells the service
- **One locator contract** (`app/src/testids.ts`) drives all four columns — a
  rename is a one-line change, not four separate maintenance jobs.
- **Deterministic seed + `/reset`** gives every run the same starting point, so
  assertions use exact expected values (e.g. EMI = ₹22,957.25), not tolerances.
- **The calculation is the proof point**: the same reducing-balance result is
  asserted through the UI and directly against the API, showing the automation
  validates business logic, not just that buttons render.
