import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, { Extrapolation, interpolate, useAnimatedStyle } from 'react-native-reanimated';
import { AnimatedPressable } from './AnimatedPressable';
import { Avatar } from './Avatar';
import { EmptyState } from './EmptyState';
import { SearchBar } from './SearchBar';
import { useScrollY } from '../state/scroll';
import { useTheme, space, radius, icons, type as typeScale } from '../theme';

interface TopbarTestIDs {
  themeToggle?: string;
  search?: string;
  notifications?: string;
  quickAdd?: string;
  avatar?: string;
  menuSettings?: string;
  menuLogout?: string;
}

interface Props {
  greeting: string;
  userName?: string;
  isDark: boolean;
  onToggleTheme: () => void;
  onSearchSubmit?: (query: string) => void;
  onQuickAdd?: () => void;
  onOpenSettings?: () => void;
  onLogout?: () => void;
  testIDs?: TopbarTestIDs;
  /** Skip the bar's own background/border — used when a parent row (the
   * floating-menu-button bar) already supplies them, so there's no double
   * edge between the button and the greeting text. */
  bare?: boolean;
}

/** App-wide top bar: greeting, search, dark-mode toggle, notifications,
 * quick-add, profile menu. Rendered above the screen content on wide layouts
 * (paired with Sidebar). Search submits into the real transactions search
 * (`GET /transactions?q=`); quick-add opens the real add-transaction form —
 * neither is decorative. Notifications has no backend data yet, so it opens
 * an honest empty state rather than fabricated alerts. */
export function Topbar({
  greeting, userName, isDark, onToggleTheme, onSearchSubmit, onQuickAdd, onOpenSettings, onLogout, testIDs, bare,
}: Props) {
  const { colors } = useTheme();
  const ThemeIcon = isDark ? icons.sun : icons.moon;
  const [query, setQuery] = useState('');
  const [notifOpen, setNotifOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const scrollY = useScrollY();

  // Solid at rest; once the focused screen scrolls past a few pixels, a
  // frosted-glass BlurView fades in behind the bar instead of a hard edge.
  const blurStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, 24], [0, 1], Extrapolation.CLAMP),
  }));

  const submitSearch = () => {
    if (onSearchSubmit) onSearchSubmit(query.trim());
  };

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: space.lg,
        paddingHorizontal: space.xl,
        height: 64,
        backgroundColor: bare ? undefined : colors.surface,
        borderBottomWidth: bare ? 0 : 1,
        borderBottomColor: colors.border,
      }}
    >
      <Animated.View style={[StyleSheet.absoluteFillObject, blurStyle]} pointerEvents="none">
        <BlurView intensity={40} tint={isDark ? 'dark' : 'light'} style={{ flex: 1 }} />
      </Animated.View>

      <View style={{ minWidth: 140 }}>
        <Text style={[typeScale.caption, { color: colors.body }]}>{greeting}</Text>
        {userName ? <Text style={[typeScale.bodySemibold, { color: colors.heading }]}>{userName}</Text> : null}
      </View>

      {onSearchSubmit ? (
        <View style={{ flex: 1, maxWidth: 360 }}>
          <SearchBar
            testID={testIDs?.search}
            value={query}
            onChangeText={setQuery}
            onSubmit={submitSearch}
            placeholder="Search transactions"
          />
        </View>
      ) : null}

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
        <IconButton testID={testIDs?.themeToggle} icon={ThemeIcon} onPress={onToggleTheme} accessibilityLabel="Toggle dark mode" />

        <IconButton
          testID={testIDs?.notifications}
          icon={icons.bell}
          onPress={() => { setMenuOpen(false); setNotifOpen(true); }}
          accessibilityLabel="Notifications"
        />

        {onQuickAdd ? <IconButton testID={testIDs?.quickAdd} icon={icons.add} onPress={onQuickAdd} accessibilityLabel="Quick add" filled /> : null}

        <AnimatedPressable
          testID={testIDs?.avatar}
          accessibilityRole="button"
          accessibilityLabel="Profile"
          onPress={() => { setNotifOpen(false); setMenuOpen(true); }}
        >
          <Avatar name={userName} size={36} />
        </AnimatedPressable>
      </View>

      <AnchoredOverlay visible={notifOpen} onClose={() => setNotifOpen(false)}>
        <EmptyState icon={icons.bell} title="No notifications yet" message="You're all caught up." />
      </AnchoredOverlay>

      <AnchoredOverlay visible={menuOpen} onClose={() => setMenuOpen(false)}>
        <MenuItem testID={testIDs?.menuSettings} icon={icons.settings} label="Settings" onPress={() => { setMenuOpen(false); onOpenSettings?.(); }} />
        <MenuItem testID={testIDs?.menuLogout} icon={icons.logout} label="Log out" danger onPress={() => { setMenuOpen(false); onLogout?.(); }} />
      </AnchoredOverlay>
    </View>
  );
}

function IconButton({ icon: Icon, onPress, accessibilityLabel, testID, filled }: {
  icon: typeof icons.bell; onPress?: () => void; accessibilityLabel: string; testID?: string; filled?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <AnimatedPressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={{
        width: 38, height: 38, borderRadius: radius.md,
        alignItems: 'center', justifyContent: 'center',
        backgroundColor: filled ? colors.primary : colors.background,
        borderWidth: filled ? 0 : 1,
        borderColor: colors.border,
      }}
    >
      <Icon size={18} color={filled ? colors.onPrimary : colors.body} />
    </AnimatedPressable>
  );
}

/** Anchored near the top-right (below the icon cluster) via a plain
 * transparent Modal — sidesteps manual absolute-position/z-index juggling
 * against the Sidebar and screen content, and closes on any outside tap. */
function AnchoredOverlay({ visible, onClose, children }: { visible: boolean; onClose: () => void; children: React.ReactNode }) {
  const { colors, elevation } = useTheme();
  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={{ flex: 1 }} onPress={onClose} accessibilityRole="button" accessibilityLabel="Close">
        <View
          style={{
            position: 'absolute',
            top: 72,
            right: space.xl,
            minWidth: 220,
            maxWidth: 300,
            backgroundColor: colors.surface,
            borderRadius: radius.lg,
            borderWidth: 1,
            borderColor: colors.border,
            overflow: 'hidden',
            ...elevation.sheet,
          }}
        >
          {children}
        </View>
      </Pressable>
    </Modal>
  );
}

function MenuItem({ icon: Icon, label, onPress, testID, danger }: {
  icon: typeof icons.bell; label: string; onPress: () => void; testID?: string; danger?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <AnimatedPressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingHorizontal: space.base, paddingVertical: space.md }}
    >
      <Icon size={17} color={danger ? colors.danger : colors.body} />
      <Text style={[typeScale.bodyMedium, { color: danger ? colors.danger : colors.heading }]}>{label}</Text>
    </AnimatedPressable>
  );
}
