import React, { useCallback, useState } from 'react';
import { Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../api/client';
import { useAuth } from '../state/auth';
import { useScrollY } from '../state/scroll';
import { useTheme, space, radius, icons, formWidth, type as typeScale } from '../theme';
import { Header, Card, Avatar, Chip, Button, ScreenFade } from '../components';
import { T } from '../testids';

const CURRENCIES = ['INR', 'USD', 'EUR'];

export default function SettingsScreen() {
  const { user, currency, setCurrency, logout } = useAuth();
  const { colors, isDark, toggle } = useTheme();
  const scrollY = useScrollY();
  // Settings has no scrollable content of its own, but still needs to reset
  // Topbar's scroll-blur state on focus — otherwise a scroll left over from
  // whichever tab was open before would stay "stuck".
  useFocusEffect(useCallback(() => { scrollY.value = 0; }, [scrollY]));
  const [status, setStatus] = useState('');
  const [resetting, setResetting] = useState(false);

  const onReset = async () => {
    setResetting(true);
    try { await api.reset(); setStatus('Data reset to seed baseline'); }
    catch (e: any) { setStatus(e.message || 'Reset failed'); }
    setResetting(false);
    setTimeout(() => setStatus(''), 2500);
  };

  return (
    <ScreenFade>
    <View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', padding: space.base }}>
      <View style={{ width: '100%', maxWidth: formWidth, gap: space.md }}>
        <Header title="Settings" />

        <Card>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
            <Avatar name={user?.name} size={48} />
            <View style={{ flex: 1 }}>
              <Text testID={T.settingsUser} style={[typeScale.bodySemibold, { color: colors.heading }]}>
                {user?.name}
              </Text>
              <Text style={[typeScale.caption, { color: colors.body, marginTop: 2 }]}>{user?.email}</Text>
            </View>
          </View>
        </Card>

        <Card>
          <SettingRow icon={icons.card} label="Display currency" />
          <View style={{ flexDirection: 'row', gap: space.sm, marginTop: space.sm }}>
            {CURRENCIES.map((c) => (
              <Chip key={c} testID={`${T.settingsCurrency}-${c}`} label={c} active={currency === c} onPress={() => setCurrency(c)} />
            ))}
          </View>
        </Card>

        <Card>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <SettingRow icon={isDark ? icons.moon : icons.sun} label="Dark mode" />
            <Chip testID={T.settingsDarkMode} label={isDark ? 'On' : 'Off'} active={isDark} onPress={toggle} />
          </View>
        </Card>

        <Button
          testID={T.settingsReset}
          label="Reset demo data"
          variant="outline"
          icon={<icons.refresh size={16} color={colors.primary} />}
          loading={resetting}
          fullWidth
          onPress={onReset}
        />

        <Button
          testID={T.settingsLogout}
          label="Log out"
          variant="danger"
          icon={<icons.logout size={16} color={colors.onPrimary} />}
          fullWidth
          onPress={logout}
        />

        {status ? <Text style={[typeScale.captionMedium, { color: colors.success, textAlign: 'center' }]}>{status}</Text> : null}
      </View>
    </View>
    </ScreenFade>
  );
}

function SettingRow({ icon: Icon, label }: { icon: typeof icons.card; label: string }) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
      <View style={{ width: 32, height: 32, borderRadius: radius.full, backgroundColor: colors.primaryDark, alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={15} color="#fff" />
      </View>
      <Text style={[typeScale.bodyMedium, { color: colors.heading }]}>{label}</Text>
    </View>
  );
}
