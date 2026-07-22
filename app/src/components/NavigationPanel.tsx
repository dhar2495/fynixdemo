import React, { useEffect, useMemo, useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, { FadeIn, FadeOut, SlideInLeft, SlideOutLeft, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { AnimatedPressable } from './AnimatedPressable';
import { Avatar } from './Avatar';
import type { SidebarRoute } from './Sidebar';
import { space, radius, spring, zIndex, darkColors, palette, icons, type as typeScale } from '../theme';

interface Props {
  visible: boolean;
  onClose: () => void;
  routes: SidebarRoute[];
  activeKey: string;
  onNavigate: (key: string) => void;
  onLogout: () => void;
  userName?: string;
  userEmail?: string;
  logoutTestID?: string;
  testID?: string;
}

const PANEL_WIDTH = 300;

/**
 * Hidden navigation drawer opened by the floating SyslaFynix menu button — this
 * is the ONLY way to navigate on desktop/tablet now (no persistent rail).
 * Lists only real routes (Dashboard/Accounts/Transactions/Loan/Settings)
 * plus Logout; there's no Payments/Cards/Investments/Support destination
 * since nothing backs them yet.
 */
export function NavigationPanel({ visible, onClose, routes, activeKey, onNavigate, onLogout, userName, userEmail, logoutTestID, testID }: Props) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (Platform.OS !== 'web' || !visible) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [visible, onClose]);

  useEffect(() => {
    if (!visible) setQuery('');
  }, [visible]);

  const filteredRoutes = useMemo(
    () => routes.filter((r) => r.label.toLowerCase().includes(query.trim().toLowerCase())),
    [routes, query],
  );

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(150)} style={{ flex: 1, zIndex: zIndex.modal }}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityRole="button" accessibilityLabel="Close">
          <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
          <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.15)' }]} />
        </Pressable>
      </Animated.View>

      <Animated.View
        testID={testID}
        entering={SlideInLeft.duration(220)}
        exiting={SlideOutLeft.duration(180)}
        style={{
          position: 'absolute', top: 0, bottom: 0, left: 0, width: PANEL_WIDTH,
          zIndex: zIndex.modal + 1,
        }}
      >
        <LinearGradient
          colors={[darkColors.background, '#161d3d']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            flex: 1,
            borderTopRightRadius: 24,
            borderBottomRightRadius: 24,
            padding: space.lg,
            shadowColor: '#000',
            shadowOpacity: 0.35,
            shadowRadius: 24,
            shadowOffset: { width: 8, height: 0 },
            elevation: 12,
          }}
        >
          {/* The floating open-button sits underneath this panel once it's
              visible (same top-left corner), so it can't itself receive the
              "click it again" tap — this header doubles as that control:
              same brand mark, closes the drawer when pressed. */}
          <AnimatedPressable
            accessibilityRole="button"
            accessibilityLabel="Close menu"
            onPress={onClose}
            hitSlop={8}
            style={{ paddingHorizontal: space.sm, marginBottom: space.md }}
          >
            <Text style={[typeScale.h3, { color: '#fff' }]}>SyslaFynix</Text>
            <Text style={[typeScale.caption, { color: 'rgba(255,255,255,0.6)' }]}>Modern Digital Banking</Text>
          </AnimatedPressable>

          <View
            style={{
              flexDirection: 'row', alignItems: 'center', gap: space.sm,
              backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: radius.md,
              paddingHorizontal: space.md, height: 40, marginBottom: space.md,
            }}
          >
            <icons.search size={15} color="rgba(255,255,255,0.5)" />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search menu"
              placeholderTextColor="rgba(255,255,255,0.5)"
              style={[typeScale.body, { flex: 1, color: '#fff', height: '100%' }]}
            />
          </View>

          <View style={{ gap: 4 }}>
            {filteredRoutes.map((route) => (
              <PanelRow
                key={route.key}
                route={route}
                active={route.key === activeKey}
                onPress={() => { onNavigate(route.key); onClose(); }}
              />
            ))}
          </View>

          <View style={{ flex: 1 }} />

          <View
            style={{
              flexDirection: 'row', alignItems: 'center', gap: space.sm,
              backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: radius.xl,
              padding: space.md, marginBottom: space.sm,
            }}
          >
            <Avatar name={userName} size={40} />
            <View style={{ flex: 1 }}>
              <Text style={[typeScale.bodyMedium, { color: '#fff' }]} numberOfLines={1}>{userName || 'Account'}</Text>
              <Text style={[typeScale.small, { color: 'rgba(255,255,255,0.6)' }]} numberOfLines={1}>Premium Banking</Text>
            </View>
          </View>

          <PanelRow
            route={{ key: 'logout', label: 'Logout', icon: icons.logout, testID: logoutTestID || '', subtitle: 'Secure sign out' }}
            active={false}
            danger
            onPress={() => { onLogout(); onClose(); }}
          />
        </LinearGradient>
      </Animated.View>
    </Modal>
  );
}

function PanelRow({ route, active, onPress, danger }: {
  route: SidebarRoute; active: boolean; onPress: () => void; danger?: boolean;
}) {
  const translateX = useSharedValue(0);
  const Icon = route.icon;

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ translateX: translateX.value }] }));

  const content = (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: space.md,
        height: 72,
        paddingHorizontal: space.md,
        borderRadius: radius.xl,
      }}
    >
      <View
        style={{
          width: 40, height: 40, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center',
          backgroundColor: active ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.08)',
        }}
      >
        {Icon ? <Icon size={18} color={danger ? '#fca5a5' : '#fff'} /> : null}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[typeScale.bodyMedium, { color: danger ? '#fca5a5' : '#fff' }]}>{route.label}</Text>
        {route.subtitle ? (
          <Text style={[typeScale.small, { color: danger ? 'rgba(252,165,165,0.7)' : 'rgba(255,255,255,0.6)', marginTop: 1 }]}>
            {route.subtitle}
          </Text>
        ) : null}
      </View>
    </View>
  );

  return (
    <AnimatedPressable
      testID={route.testID}
      accessibilityRole="button"
      accessibilityLabel={route.label}
      accessibilityState={{ selected: active }}
      onPress={onPress}
      onHoverIn={() => { translateX.value = withSpring(4, spring.gentle); }}
      onHoverOut={() => { translateX.value = withSpring(0, spring.gentle); }}
      style={[
        { borderRadius: radius.xl, borderLeftWidth: active ? 3 : 0, borderLeftColor: palette.primary },
        active ? { paddingLeft: 0 } : null,
      ]}
    >
      {active ? (
        <LinearGradient
          colors={[palette.primary, '#1d3fd6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ borderRadius: radius.xl }}
        >
          <Animated.View style={animatedStyle}>{content}</Animated.View>
        </LinearGradient>
      ) : (
        <Animated.View style={animatedStyle}>{content}</Animated.View>
      )}
    </AnimatedPressable>
  );
}
