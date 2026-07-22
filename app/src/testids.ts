/**
 * testids.ts — the single locator contract shared between the app and the
 * mobile automation (Appium). Every interactive / assertable element uses one
 * of these. On Android the testID surfaces as resource-id; on iOS as
 * accessibilityIdentifier. The web build (Playwright) uses the same strings
 * via data-testid, so ONE contract covers all three surfaces.
 */
export const T = {
  // Login
  loginEmail: 'login-email',
  loginPassword: 'login-password',
  loginSubmit: 'login-submit',
  loginError: 'login-error',

  // Tab bar
  tabDashboard: 'tab-dashboard',
  tabAccounts: 'tab-accounts',
  tabTransactions: 'tab-transactions',
  tabLoan: 'tab-loan',
  tabSettings: 'tab-settings',

  // Accounts
  accountsList: 'accounts-list',
  accountsEmpty: 'accounts-empty',
  accountCard: (id: string) => `account-card-${id}`,

  // Desktop/tablet sidebar (web only) + app-wide top bar
  sidebarLogo: 'sidebar-logo',
  navPanel: 'nav-panel',
  sidebarLogout: 'sidebar-logout',
  themeToggle: 'theme-toggle',
  topbarSearch: 'topbar-search',
  topbarNotifications: 'topbar-notifications',
  topbarQuickAdd: 'topbar-quick-add',
  topbarAvatar: 'topbar-avatar',
  profileMenuSettings: 'profile-menu-settings',
  profileMenuLogout: 'profile-menu-logout',

  // Dashboard
  kpiIncome: 'kpi-income-value',
  kpiExpense: 'kpi-expense-value',
  kpiNet: 'kpi-net-value',
  kpiBalance: 'kpi-balance-value',
  balanceHideToggle: 'balance-hide-toggle',
  dashboardRefresh: 'dashboard-refresh',
  dashboardRecentList: 'dashboard-recent-list',
  dashboardSeeAll: 'dashboard-see-all',

  // Transactions
  txnList: 'txn-list',
  txnAddOpen: 'txn-add-open',
  txnFormAmount: 'txn-form-amount',
  txnFormType: 'txn-form-type',
  txnFormCategory: 'txn-form-category',
  txnFormDate: 'txn-form-date',
  txnFormAccount: 'txn-form-account',
  txnFormDescription: 'txn-form-description',
  txnFormSubmit: 'txn-form-submit',
  txnFormCancel: 'txn-form-cancel',
  txnFormClose: 'txn-form-close',
  txnFormError: 'txn-form-error',
  txnSearch: 'txn-search',
  txnFilterType: 'txn-filter-type',
  txnEmpty: 'txn-empty',
  toast: 'toast',
  // row + row action helpers take an id, e.g. txnRow('t-1')
  txnRow: (id: string) => `txn-row-${id}`,
  txnRowAmount: (id: string) => `txn-row-amount-${id}`,
  txnRowDelete: (id: string) => `txn-row-delete-${id}`,

  // Loan calculator
  loanPrincipal: 'loan-principal',
  loanRate: 'loan-rate',
  loanTenure: 'loan-tenure',
  loanCalculate: 'loan-calculate',
  loanEmi: 'loan-emi-result',
  loanTotalInterest: 'loan-total-interest',
  loanTotalPayment: 'loan-total-payment',
  loanScheduleToggle: 'loan-schedule-toggle',
  loanScheduleTable: 'loan-schedule-table',

  // Settings
  settingsCurrency: 'settings-currency',
  settingsReset: 'settings-reset',
  settingsLogout: 'settings-logout',
  settingsUser: 'settings-user',
  settingsDarkMode: 'settings-dark-mode',

  // Dashboard quick actions + offers (Paytm-style)
  quickAction: (key: string) => `quick-action-${key}`,
  bannerDismiss: (id: string) => `banner-dismiss-${id}`,
  sendContact: (id: string) => `send-contact-${id}`,
  billProvider: (key: string) => `bill-provider-${key}`,
  billNumber: 'bill-number',
  billAmountChip: (amount: number) => `bill-amount-${amount}`,
  sendAmountChip: (amount: number) => `send-amount-${amount}`,
  paymentSuccess: 'payment-success',
} as const;
