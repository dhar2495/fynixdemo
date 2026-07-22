import React from 'react';
import { Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DashboardScreen from './screens/DashboardScreen';
import AccountsScreen from './screens/AccountsScreen';
import TransactionsScreen from './screens/TransactionsScreen';
import LoanScreen from './screens/LoanScreen';
import SettingsScreen from './screens/SettingsScreen';
import { useTheme, icons, useBreakpoint, type LucideIcon } from './theme';
import { type SidebarRoute } from './components/Sidebar';
import { T } from './testids';

const Tab = createBottomTabNavigator();

/** The desktop/tablet Sidebar only makes sense once there's room for it — a
 * narrow browser window (or a real phone browser) falls back to the mobile
 * bottom bar. Native (Android/iOS) never shows it, regardless of width. */
export function useSidebarLayout() {
  const { atLeastTablet } = useBreakpoint();
  return Platform.OS === 'web' && atLeastTablet;
}

const ROUTES = [
  { name: 'SyslaFynix', label: 'Dashboard', icon: icons.dashboard, testID: T.tabDashboard, component: DashboardScreen },
  { name: 'Accounts', label: 'Accounts', icon: icons.accounts, testID: T.tabAccounts, component: AccountsScreen },
  { name: 'Transactions', label: 'Transactions', icon: icons.transactions, testID: T.tabTransactions, component: TransactionsScreen },
  { name: 'Loan', label: 'Loan', icon: icons.loanNav, testID: T.tabLoan, component: LoanScreen },
  { name: 'Settings', label: 'Settings', icon: icons.settings, testID: T.tabSettings, component: SettingsScreen },
] as const;

/** Same routes, Lucide icons — consumed by the Sidebar (web tablet/desktop only). */
export const SIDEBAR_ROUTES: SidebarRoute[] = [
  { key: 'SyslaFynix', label: 'Dashboard', icon: icons.dashboard, testID: T.tabDashboard, subtitle: 'Overview & reports' },
  { key: 'Accounts', label: 'Accounts', icon: icons.accounts, testID: T.tabAccounts, subtitle: 'Balances & accounts' },
  { key: 'Transactions', label: 'Transactions', icon: icons.transactions, testID: T.tabTransactions, subtitle: 'Income & expenses' },
  { key: 'Loan', label: 'Loan', icon: icons.loanNav, testID: T.tabLoan, subtitle: 'EMI calculator' },
  { key: 'Settings', label: 'Settings', icon: icons.settings, testID: T.tabSettings, subtitle: 'Preferences' },
];

const icon = (Icon: LucideIcon) => ({ color }: { color: string; focused: boolean }) => (
  <Icon size={22} color={color} />
);

export function createBottomTabs() {
  return function Tabs() {
    const insets = useSafeAreaInsets();
    const sidebarLayout = useSidebarLayout();
    // This is the native mobile bottom-tab bar (and its header, on narrow web).
    // It's the one piece of chrome that predates the design system and was
    // still hardcoded to the static light-mode blue — meaning dark mode never
    // reached it. useTheme() works fine here since Tabs renders inside
    // App.tsx's ThemeProvider.
    const { colors, elevation } = useTheme();
    return (
      <Tab.Navigator
        screenOptions={{
          headerShown: !sidebarLayout,
          headerStyle: { backgroundColor: colors.primaryDark, ...elevation.card, shadowOpacity: 0.15 },
          headerTintColor: colors.onPrimary,
          headerTitleStyle: { fontWeight: '800' },
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.body,
          // The desktop/tablet Sidebar (App.tsx) replaces this bar entirely,
          // driven off the same navigationRef, so the mobile bottom bar is
          // just switched off here rather than repositioned.
          tabBarStyle: sidebarLayout ? { display: 'none' } : {
            height: 58 + insets.bottom,
            paddingBottom: Math.max(insets.bottom, 8),
            paddingTop: 8,
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
          },
          tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        }}
      >
        {ROUTES.map((r) => (
          <Tab.Screen
            key={r.name}
            name={r.name}
            component={r.component}
            options={{
              tabBarTestID: sidebarLayout ? undefined : r.testID,
              tabBarLabel: r.label,
              tabBarIcon: icon(r.icon),
            }}
          />
        ))}
      </Tab.Navigator>
    );
  };
}
