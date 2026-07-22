import React from 'react';
import { Modal, Pressable, StyleProp, View, ViewStyle } from 'react-native';
import Animated, { SlideInDown, SlideOutDown, FadeIn, FadeOut } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { useTheme, radius, zIndex } from '../theme';

interface Props {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

/** Bottom-sheet-style modal: backdrop fades in, sheet slides up from the
 * bottom. Used for forms (add transaction, send money, bill pay) — same
 * shape as the RN <Modal> it replaces, just with real enter/exit motion. */
export function AppModal({ visible, onClose, children, style }: Props) {
  const { colors, isDark, elevation } = useTheme();

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(150)} style={{ flex: 1, zIndex: zIndex.modal }}>
        <Pressable
          style={{ flex: 1 }}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Close"
        >
          <BlurView intensity={35} tint={isDark ? 'dark' : 'light'} style={{ flex: 1 }} />
        </Pressable>
      </Animated.View>
      <Animated.View
        entering={SlideInDown.springify().damping(18)}
        exiting={SlideOutDown.duration(200)}
        style={[
          {
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: colors.surface,
            borderTopLeftRadius: radius.xxl,
            borderTopRightRadius: radius.xxl,
            maxHeight: '90%',
            zIndex: zIndex.modal + 1,
            ...elevation.sheet,
          },
          style,
        ]}
      >
        <View style={{ alignItems: 'center', paddingTop: 10 }}>
          <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border }} />
        </View>
        {children}
      </Animated.View>
    </Modal>
  );
}
