import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Text, TextInput, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useAuth } from '../state/auth';
import { useTheme, space, radius, icons, formWidth, type as typeScale } from '../theme';
import { Button, Card, AnimatedPressable } from '../components';
import { T } from '../testids';

export default function LoginScreen() {
  const { login } = useAuth();
  const { colors } = useTheme();
  const [email, setEmail] = useState('demo@SyslaFynix.dev');
  const [password, setPassword] = useState('Demo@123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const onSubmit = async () => {
    setError('');
    setBusy(true);
    try {
      await login(email.trim(), password);
    } catch (e: any) {
      setError(e.message || 'Login failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: colors.primary, justifyContent: 'center', padding: space.xl }}
    >
      <View style={{ width: '100%', maxWidth: formWidth, alignSelf: 'center' }}>
        <Animated.View entering={FadeInDown.duration(400).springify()} style={{ alignItems: 'center', marginBottom: space.xxl }}>
          <View style={{ width: 56, height: 56, borderRadius: radius.lg, backgroundColor: 'rgba(255,255,255,0.16)', alignItems: 'center', justifyContent: 'center', marginBottom: space.md }}>
            <icons.trendUp size={28} color={colors.onPrimary} />
          </View>
          <Text style={[typeScale.display, { color: colors.onPrimary, letterSpacing: -1 }]}>SyslaFynix</Text>
          <Text style={[typeScale.bodyMedium, { color: colors.primaryLight, marginTop: -4 }]}>Finance</Text>
        </Animated.View>

        <Animated.View entering={FadeInUp.duration(450).delay(80).springify()}>
          <Card elevation="sheet" style={{ padding: space.xl }}>
            <Text style={[typeScale.h2, { color: colors.heading, marginBottom: space.lg }]}>Sign in</Text>

            <FieldLabel>Email</FieldLabel>
            <InputWithIcon icon={icons.mail} testID={T.loginEmail} value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" />

            <FieldLabel>Password</FieldLabel>
            <InputWithIcon
              icon={icons.lock}
              testID={T.loginPassword}
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secureTextEntry={!showPassword}
              trailing={
                <AnimatedPressable accessibilityRole="button" accessibilityLabel={showPassword ? 'Hide password' : 'Show password'} onPress={() => setShowPassword((s) => !s)}>
                  {showPassword ? <icons.eyeOff size={17} color={colors.caption} /> : <icons.eye size={17} color={colors.caption} />}
                </AnimatedPressable>
              }
            />

            {error ? <Text testID={T.loginError} style={[typeScale.caption, { color: colors.danger, marginTop: space.md }]}>{error}</Text> : null}

            <Button
              testID={T.loginSubmit}
              label={busy ? 'Signing in…' : 'Sign in'}
              loading={busy}
              onPress={onSubmit}
              fullWidth
              style={{ marginTop: space.lg }}
            />

            <Text style={[typeScale.small, { color: colors.caption, textAlign: 'center', marginTop: space.md }]}>
              Demo: demo@SyslaFynix.dev / Demo@123
            </Text>
          </Card>
        </Animated.View>
      </View>
    </KeyboardAvoidingView>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  const { colors } = useTheme();
  return <Text style={[typeScale.caption, { color: colors.body, marginTop: space.md, marginBottom: space.sm }]}>{children}</Text>;
}

function InputWithIcon({ icon: Icon, testID, value, onChangeText, placeholder, keyboardType, secureTextEntry, autoCapitalize, trailing }: {
  icon: typeof icons.mail; testID: string; value: string; onChangeText: (v: string) => void; placeholder?: string;
  keyboardType?: 'email-address'; secureTextEntry?: boolean; autoCapitalize?: 'none'; trailing?: React.ReactNode;
}) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: space.md, gap: space.sm }}>
      <Icon size={16} color={colors.caption} />
      <TextInput
        testID={testID}
        accessibilityLabel={testID}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.caption}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        autoCapitalize={autoCapitalize}
        style={[typeScale.body, { flex: 1, color: colors.heading, paddingVertical: space.sm + 3 }]}
      />
      {trailing}
    </View>
  );
}
