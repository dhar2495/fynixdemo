import 'react-native-gesture-handler';
import React, { useMemo, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { createBottomTabs, useSidebarLayout, SIDEBAR_ROUTES } from './src/nav';
import { AuthProvider, useAuth } from './src/state/auth';
import { ScrollYProvider } from './src/state/scroll';
import { ThemeProvider, useTheme, space } from './src/theme';
import { FloatingMenuButton, Topbar } from './src/components';
import { T } from './src/testids';
import LoginScreen from './src/screens/LoginScreen';

const isWeb = Platform.OS === 'web';

function Root() {
  const { user, logout } = useAuth();
  const { colors, isDark, toggle } = useTheme();
  // createBottomTabs() returns a new component type each call — calling it
  // directly in render would recreate `Tabs` on every re-render of Root()
  // (e.g. every navigation state change via onStateChange below), which
  // unmounts/remounts the whole tab navigator and wipes every screen's local
  // state. Must stay referentially stable across renders.
  const Tabs = useMemo(() => createBottomTabs(), []);
  const navRef = useNavigationContainerRef();
  const [active, setActive] = useState('SyslaFynix');
  const sidebarLayout = useSidebarLayout();

  const navigator = (
    <NavigationContainer ref={navRef} onStateChange={() => setActive(navRef.current?.getCurrentRoute()?.name || 'SyslaFynix')}>
      <StatusBar style="light" />
      {user ? <Tabs /> : <LoginScreen />}
    </NavigationContainer>
  );

  if (!user || !sidebarLayout) return navigator;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md, paddingLeft: space.md, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border }}>
        <FloatingMenuButton
          testID={T.sidebarLogo}
          panelTestID={T.navPanel}
          routes={SIDEBAR_ROUTES}
          activeKey={active}
          onNavigate={(key) => navRef.current?.navigate(key as never)}
          onLogout={logout}
          userName={user.name}
          userEmail={user.email}
          logoutTestID={T.sidebarLogout}
        />
        <View style={{ flex: 1 }}>
          <Topbar
            greeting="Good to see you,"
            userName={user.name}
            isDark={isDark}
            onToggleTheme={toggle}
            onSearchSubmit={(q) => (navRef.current as any)?.navigate('Transactions', { q })}
            onQuickAdd={() => (navRef.current as any)?.navigate('Transactions', { openAdd: true })}
            onOpenSettings={() => navRef.current?.navigate('Settings' as never)}
            onLogout={logout}
            bare
            testIDs={{
              themeToggle: T.themeToggle,
              search: T.topbarSearch,
              notifications: T.topbarNotifications,
              quickAdd: T.topbarQuickAdd,
              avatar: T.topbarAvatar,
              menuSettings: T.profileMenuSettings,
              menuLogout: T.profileMenuLogout,
            }}
          />
        </View>
      </View>
      <View style={{ flex: 1 }}>{navigator}</View>
    </View>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <SafeAreaProvider>
          <BottomSheetModalProvider>
            <AuthProvider>
              <ScrollYProvider>
                <View style={styles.webBackdrop}>
                  <View style={styles.webShell}>
                    <Root />
                  </View>
                </View>
              </ScrollYProvider>
            </AuthProvider>
          </BottomSheetModalProvider>
        </SafeAreaProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

// ponytail: the shell fills the window (fits any monitor edge to edge — the
// sidebar + top bar span the full window like a real desktop app). Native
// (Android/iOS) is untouched — Root falls back to a bare NavigationContainer
// there. Individual screens cap their own content at theme.contentWidth so
// cards/lists don't stretch edge to edge; narrow forms (login, modals, the
// loan card) cap further at theme.formWidth.
const styles = StyleSheet.create({
  webBackdrop: { flex: 1 },
  webShell: isWeb ? { flex: 1, backgroundColor: '#fff' } : { flex: 1 },
});
