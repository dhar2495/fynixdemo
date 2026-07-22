# Locator contract — one set of IDs, three surfaces

Every interactive/assertable element carries a stable `testID`. The same string
is used by all three automation surfaces, so a rename happens in exactly one
place: `app/src/testids.ts`.

| Surface | Selector form            | Example                          |
|---------|--------------------------|----------------------------------|
| Web     | `[data-testid="..."]`    | `[data-testid="loan-emi-result"]`|
| Android | accessibility id (`~`)   | `$('~loan-emi-result')`          |
| iOS     | accessibility id (`~`)   | `$('~loan-emi-result')`          |

React Native maps `testID` → Android `resource-id`/content-desc and iOS
`accessibilityIdentifier`. Expo web maps `testID` → `data-testid`. That is why a
single contract works everywhere.

## Naming convention
`<screen>-<element>[-<qualifier>]` — e.g. `txn-form-submit`, `kpi-net-value`,
`txn-row-t-1`. Row-scoped ids are generated: `T.txnRow('t-1') === 'txn-row-t-1'`.

## Key ids by screen
- **Login:** `login-email`, `login-password`, `login-submit`, `login-error`
- **Tabs:** `tab-dashboard`, `tab-accounts`, `tab-transactions`, `tab-loan`, `tab-settings`
- **Accounts:** `accounts-list`, `accounts-empty`, `account-card-<id>`
- **Navigation drawer / top bar (web only):** `sidebar-logo` (floating button that opens the drawer — click it before any `tab-*` id on desktop), `nav-panel`, `sidebar-logout`, `theme-toggle`, `topbar-search`, `topbar-notifications`, `topbar-quick-add`, `topbar-avatar`, `profile-menu-settings`, `profile-menu-logout`
- **Dashboard:** `kpi-income-value`, `kpi-expense-value`, `kpi-net-value`, `kpi-balance-value`, `balance-hide-toggle`, `dashboard-refresh`, `dashboard-recent-list`, `dashboard-see-all`, `quick-action-<key>`, `banner-dismiss-<id>`
- **Transactions:** `txn-add-open`, `txn-form-amount`, `txn-form-submit`, `txn-form-account-<id>`, `txn-search`, `toast`, `payment-success`, `txn-row-<id>`, `txn-row-delete-<id>`, `send-contact-<id>`, `bill-provider-<key>`, `bill-number`, `bill-amount-<amount>`
- **Loan:** `loan-principal`, `loan-rate`, `loan-tenure`, `loan-calculate`, `loan-emi-result`, `loan-schedule-table`
- **Settings:** `settings-currency-<CUR>`, `settings-reset`, `settings-logout`, `settings-user`, `settings-dark-mode`

The full, authoritative list always lives in `app/src/testids.ts` — this doc is a
quick-reference summary, not a substitute for it.
