import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { AnimatedPressable } from './AnimatedPressable';
import { NavigationPanel } from './NavigationPanel';
import type { SidebarRoute } from './Sidebar';
import { space, radius, icons, palette, darkColors, type as typeScale } from '../theme';

interface Props {
  routes: SidebarRoute[];
  activeKey: string;
  onNavigate: (key: string) => void;
  onLogout: () => void;
  userName?: string;
  userEmail?: string;
  logoutTestID?: string;
  testID?: string;
  panelTestID?: string;
}

const HOVER_MS = 180;

/**
 * The SyslaFynix brand mark, always visible top-left, doubling as the sole
 * desktop navigation trigger (there's no persistent rail anymore). Not a
 * generic hamburger/back-arrow — same rounded blue icon square + wordmark
 * used as the drawer's own header, so the trigger and the thing it opens
 * read as one brand element. Owns its own open state; pressing it again
 * while open closes the drawer (NavigationPanel's own header is the other
 * "click it again" target, since this button sits underneath the open
 * drawer at the same corner).
 */
export function FloatingMenuButton({ routes, activeKey, onNavigate, onLogout, userName, userEmail, logoutTestID, testID, panelTestID }: Props) {
  const [open, setOpen] = useState(false);
  const scale = useSharedValue(1);
  const hoverOpacity = useSharedValue(0);

  const scaleStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const hoverBgStyle = useAnimatedStyle(() => ({ opacity: hoverOpacity.value }));

  return (
    <View>
      <AnimatedPressable
        testID={testID}
        accessibilityRole="button"
        accessibilityLabel="Toggle navigation menu"
        accessibilityState={{ expanded: open }}
        onPress={() => setOpen((o) => !o)}
        onHoverIn={() => {
          scale.value = withTiming(1.02, { duration: HOVER_MS });
          hoverOpacity.value = withTiming(1, { duration: HOVER_MS });
        }}
        onHoverOut={() => {
          scale.value = withTiming(1, { duration: HOVER_MS });
          hoverOpacity.value = withTiming(0, { duration: HOVER_MS });
        }}
      >
        <Animated.View style={[{ borderRadius: radius.lg, overflow: 'hidden' }, scaleStyle]}>
          <View style={{ backgroundColor: darkColors.background }}>
            <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(37,83,255,0.22)' }, hoverBgStyle]} />
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: space.sm, paddingHorizontal: space.md }}>
              <LinearGradient
                colors={[palette.primary, palette.primaryDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ width: 36, height: 36, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center' }}
              >
                <icons.trendUp size={18} color="#fff" />
              </LinearGradient>
              <Text style={[typeScale.h2, { color: '#fff' }]}>SyslaFynix</Text>
            </View>
          </View>
        </Animated.View>
      </AnimatedPressable>

      <NavigationPanel
        testID={panelTestID}
        visible={open}
        onClose={() => setOpen(false)}
        routes={routes}
        activeKey={activeKey}
        onNavigate={onNavigate}
        onLogout={onLogout}
        userName={userName}
        userEmail={userEmail}
        logoutTestID={logoutTestID}
      />
    </View>
  );
}
