import React, { useEffect, useRef } from 'react';
import { Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Animated, { Easing, FadeIn, FadeOut } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { AnimatedPressable } from './AnimatedPressable';
import { AppBottomSheet } from './AppBottomSheet';
import { SuccessCheck } from './SuccessCheck';
import { useTheme, useBreakpoint, space, radius, zIndex, icons, ensureFillContrast, type as typeScale, type LucideIcon } from '../theme';

interface Props {
  visible: boolean;
  onClose: () => void;
  icon: LucideIcon;
  iconTint: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  /** Right-aligned action row (e.g. Cancel + primary button) — hidden while
   * `successMessage` is shown. */
  footer?: React.ReactNode;
  /** When set, replaces `children`/`footer` with an in-place success beat
   * (checkmark + message) that calls `onSuccessDone` once it's finished. */
  successMessage?: string;
  onSuccessDone?: () => void;
  closeTestID?: string;
  successTestID?: string;
}

const DIALOG_WIDTH = 520;
const DIALOG_MAX_WIDTH = 560;
const DIALOG_MIN_WIDTH = 480;

/**
 * Shared popup shell for payment-style flows (Send Money, Recharge,
 * Electricity, DTH): a centered dialog on desktop/tablet, a bottom sheet on
 * phone — the same component picks the right presentation from the current
 * breakpoint, so callers just describe header/body/footer content once.
 */
export function PopupModal({
  visible, onClose, icon: Icon, iconTint, title, subtitle, children, footer, successMessage, onSuccessDone, closeTestID, successTestID,
}: Props) {
  const { colors, isDark, elevation } = useTheme();
  const { isPhone } = useBreakpoint();
  const { height: windowHeight } = useWindowDimensions();
  const sheetRef = useRef<BottomSheetModal>(null);
  const iconFill = ensureFillContrast(iconTint);

  useEffect(() => {
    if (isPhone && visible) sheetRef.current?.present();
    else sheetRef.current?.dismiss();
  }, [isPhone, visible]);

  // ESC closes on desktop/tablet — web only, and only while showing as a
  // centered dialog (the bottom sheet already closes on swipe-down/backdrop).
  useEffect(() => {
    if (Platform.OS !== 'web' || isPhone || !visible) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [visible, isPhone, onClose]);

  const header = (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: space.lg, paddingBottom: space.md }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md, flex: 1 }}>
        <View style={{ width: 44, height: 44, borderRadius: radius.full, backgroundColor: iconFill, alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={20} color="#fff" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[typeScale.h3, { color: colors.heading }]} numberOfLines={1}>{title}</Text>
          {subtitle ? <Text style={[typeScale.caption, { color: colors.body, marginTop: 1 }]} numberOfLines={1}>{subtitle}</Text> : null}
        </View>
      </View>
      <AnimatedPressable
        testID={closeTestID}
        accessibilityRole="button"
        accessibilityLabel="Close"
        onPress={onClose}
        hitSlop={10}
        style={{ width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.divider }}
      >
        <icons.close size={16} color={colors.body} />
      </AnimatedPressable>
    </View>
  );

  const fields = successMessage ? (
    <SuccessCheck visible message={successMessage} onDone={onSuccessDone ?? onClose} testID={successTestID} />
  ) : (
    <View style={{ paddingHorizontal: space.lg, gap: space.base }}>{children}</View>
  );

  const footerRow = !successMessage && footer ? (
    <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: space.md, padding: space.lg, paddingTop: space.base }}>
      {footer}
    </View>
  ) : null;

  if (isPhone) {
    return (
      <AppBottomSheet ref={sheetRef} onDismiss={onClose}>
        <BottomSheetScrollView>
          {header}
          {fields}
          {footerRow}
        </BottomSheetScrollView>
      </AppBottomSheet>
    );
  }

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <Animated.View entering={FadeIn.duration(180)} exiting={FadeOut.duration(150)} style={{ flex: 1, zIndex: zIndex.modal }}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityRole="button" accessibilityLabel="Close">
          <BlurView intensity={30} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
          <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.4)' }]} />
        </Pressable>
      </Animated.View>

      <View style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center', zIndex: zIndex.modal + 1 }]} pointerEvents="box-none">
        <Animated.View
          entering={FadeIn.duration(180).easing(Easing.out(Easing.cubic)).withInitialValues({ transform: [{ scale: 0.96 }] })}
          exiting={FadeOut.duration(150)}
          style={{
            width: DIALOG_WIDTH,
            maxWidth: DIALOG_MAX_WIDTH,
            minWidth: DIALOG_MIN_WIDTH,
            maxHeight: windowHeight * 0.85,
            borderRadius: 24,
            backgroundColor: colors.surface,
            overflow: 'hidden',
            ...elevation.floating,
          }}
        >
          {header}
          <ScrollView style={{ flexGrow: 0, flexShrink: 1 }} contentContainerStyle={{ flexGrow: 1 }}>
            {fields}
          </ScrollView>
          {footerRow}
        </Animated.View>
      </View>
    </Modal>
  );
}
