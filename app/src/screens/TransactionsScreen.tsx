import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { SectionList, Text, TextInput, View, ScrollView } from 'react-native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { api, Txn } from '../api/client';
import { useAuth } from '../state/auth';
import { useScrollY } from '../state/scroll';
import { formatMoney, currencySymbol, contentWidth } from '../theme';
import { useTheme, space, radius, icons, spring, type as typeScale, type LucideIcon } from '../theme';
import {
  Header, SearchBar, Chip, Button, AppModal, PopupModal, Toast, EmptyState, TransactionCard,
  SwipeableRow, SegmentControl, Avatar, AnimatedPressable, Skeleton, ScreenFade, AmountField,
  CategoryGrid, AccountSelector, type SelectableAccount,
} from '../components';
import { T } from '../testids';

const TYPES = ['', 'income', 'expense'];
const CATEGORIES = ['salary', 'investment', 'transfer', 'groceries', 'utilities', 'rent', 'entertainment', 'travel', 'other'];
const CONTACTS = [
  { id: 'c1', name: 'Aditi Rao', color: '#8E44AD' },
  { id: 'c2', name: 'Rahul Nair', color: '#2980B9' },
  { id: 'c3', name: 'Meera Iyer', color: '#B7791F' },
  { id: 'c4', name: 'Karan Shah', color: '#3D7A3A' },
  { id: 'c5', name: 'Zara Khan', color: '#C0392B' },
];

const SEND_QUICK_AMOUNTS = [100, 500, 1000, 2000, 5000];

const BILL_TYPES: Record<string, { title: string; numberLabel: string; numberPlaceholder: string; keyboard: 'phone-pad' | 'default'; providers: string[]; quickAmounts?: number[] }> = {
  recharge: {
    title: 'Mobile recharge', numberLabel: 'Mobile number', numberPlaceholder: '98765 43210', keyboard: 'phone-pad',
    providers: ['Airtel', 'Jio', 'Vi', 'BSNL'], quickAmounts: [199, 299, 499, 799],
  },
  electricity: {
    title: 'Electricity bill', numberLabel: 'Consumer number', numberPlaceholder: 'CA-102938', keyboard: 'default',
    providers: ['State Electricity Board', 'Adani Electricity', 'Tata Power'],
  },
  dth: {
    title: 'DTH recharge', numberLabel: 'Subscriber ID', numberPlaceholder: '1023456789', keyboard: 'phone-pad',
    providers: ['Tata Play', 'Dish TV', 'Airtel Digital TV', 'Sun Direct'], quickAmounts: [199, 299, 499],
  },
};

/** Today / Yesterday / This week / Earlier — grouping by real transaction date. */
function bucketFor(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00`);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfToday.getDate() - 1);
  const startOfWeek = new Date(startOfToday);
  startOfWeek.setDate(startOfToday.getDate() - 7);
  if (d >= startOfToday) return 'Today';
  if (d >= startOfYesterday) return 'Yesterday';
  if (d >= startOfWeek) return 'This week';
  return 'Earlier';
}

const BUCKET_ORDER = ['Today', 'Yesterday', 'This week', 'Earlier'];

function groupByBucket(items: Txn[]) {
  const buckets = new Map<string, Txn[]>();
  for (const t of items) {
    const key = bucketFor(t.date);
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key)!.push(t);
  }
  return BUCKET_ORDER
    .filter((b) => buckets.has(b))
    .map((title) => ({ title, data: buckets.get(title)! }));
}

/** Header icon + tint per flow — reuses the same category-tint language as
 * TransactionCard/MetricCard elsewhere, so the popup reads as part of the
 * same app rather than a bolted-on form. */
function getFlowMeta(
  sendMode: boolean,
  billType: string | null,
  colors: ReturnType<typeof useTheme>['colors'],
): { icon: LucideIcon; tint: string; title: string; subtitle: string } {
  if (sendMode) return { icon: icons.send, tint: colors.sky, title: 'Send money', subtitle: 'To a saved contact' };
  if (billType === 'recharge') return { icon: icons.recharge, tint: colors.purple, title: BILL_TYPES.recharge.title, subtitle: 'Prepaid & postpaid' };
  if (billType === 'electricity') return { icon: icons.electricity, tint: colors.warning, title: BILL_TYPES.electricity.title, subtitle: 'Pay your bill' };
  if (billType === 'dth') return { icon: icons.bills, tint: colors.savings, title: BILL_TYPES.dth.title, subtitle: 'Recharge your plan' };
  return { icon: icons.add, tint: colors.primary, title: 'New transaction', subtitle: 'Add income or expense' };
}

export default function TransactionsScreen() {
  const { currency } = useAuth();
  const { colors } = useTheme();
  const scrollY = useScrollY();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const [items, setItems] = useState<Txn[] | null>(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [sendMode, setSendMode] = useState(false);
  const [contact, setContact] = useState<typeof CONTACTS[number] | null>(null);
  const [billType, setBillType] = useState<string | null>(null);
  const [provider, setProvider] = useState<string | null>(null);
  const [billNumber, setBillNumber] = useState('');
  const [toast, setToast] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // form state
  const [amount, setAmount] = useState('');
  const [ftype, setFtype] = useState<'income' | 'expense'>('expense');
  const [category, setCategory] = useState('groceries');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [description, setDescription] = useState('');
  const [formError, setFormError] = useState('');
  const [accounts, setAccounts] = useState<SelectableAccount[]>([]);
  const [accountId, setAccountId] = useState('a-1');

  const load = useCallback(async (overrideSearch?: string) => {
    const q = overrideSearch ?? search;
    const params: Record<string, string> = { pageSize: '50', sort: 'date', order: 'desc' };
    if (typeFilter) params.type = typeFilter;
    if (q) params.q = q;
    try { setItems((await api.listTxns(params)).transactions); } catch { setItems([]); }
  }, [typeFilter, search]);

  const loadAccounts = useCallback(async () => {
    try {
      const res = await api.accounts();
      setAccounts(res.accounts.map((a) => ({ id: a.id, name: a.name, type: a.type })));
    } catch {
      // keep whatever we already had — the amount/category fields still work
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));
  useFocusEffect(useCallback(() => { loadAccounts(); }, [loadAccounts]));
  useFocusEffect(useCallback(() => { scrollY.value = 0; }, [scrollY]));

  // Land on a real fetched account instead of the placeholder default the
  // moment the real list arrives, and again if the previously-selected one
  // ever stops existing.
  useEffect(() => {
    if (accounts.length && !accounts.some((a) => a.id === accountId)) setAccountId(accounts[0].id);
  }, [accounts, accountId]);

  // Plain useEffect (not useFocusEffect) — reacting to route.params must run
  // synchronously with React's own render cycle. useFocusEffect's listener
  // fires off the navigation state's 'focus' event, which can arrive before
  // React has committed the new params, causing this to read a stale
  // route.params closure when navigated to from another tab (Dashboard quick
  // actions, Topbar quick-add/search).
  useEffect(() => {
    const p = route.params as { sendMoney?: boolean; openAdd?: boolean; bill?: string; category?: string; type?: 'income' | 'expense'; description?: string; q?: string } | undefined;

    if (p?.q !== undefined) {
      setSearch(p.q);
      load(p.q);
      navigation.setParams({ q: undefined });
      return;
    }

    if (p?.sendMoney || p?.openAdd || p?.bill) {
      setAmount('');
      setFormError('');
      setSendMode(!!p.sendMoney);
      setContact(null);
      setBillType(p.bill || null);
      setProvider(null);
      setBillNumber('');
      setFtype(p.type || 'expense');
      setCategory(p.sendMoney ? 'transfer' : p.bill ? 'utilities' : p.category || 'other');
      setDescription(p.description || '');
      setDate(new Date().toISOString().slice(0, 10));
      setModalOpen(true);
      navigation.setParams({ sendMoney: undefined, openAdd: undefined, bill: undefined, category: undefined, type: undefined, description: undefined });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route.params]);

  const closeForm = () => { setModalOpen(false); setSendMode(false); setBillType(null); };
  const flash = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 2500); };

  const bill = billType ? BILL_TYPES[billType] : null;
  // Recipient/provider selected + a real amount — same rule the button's
  // disabled state and the submit-time validation both key off, so the
  // button never lies about whether pressing it will actually do anything.
  const canSubmit = sendMode
    ? !!contact && Number(amount) > 0
    : bill
    ? !!provider && billNumber.trim().length > 0 && Number(amount) > 0
    : Number(amount) > 0;

  const onSubmit = async () => {
    setFormError('');
    if (sendMode && !contact) return setFormError('Choose who to send money to');
    if (bill && !provider) return setFormError('Choose a provider');
    if (bill && !billNumber.trim()) return setFormError(`Enter your ${bill.numberLabel.toLowerCase()}`);
    const amt = Number(amount);
    if (!amount || Number.isNaN(amt)) return setFormError('Enter a valid amount');
    if (amt <= 0) return setFormError('Amount must be greater than 0');
    if (!sendMode && !bill && date > new Date().toISOString().slice(0, 10)) return setFormError('Date cannot be in the future');
    const desc = sendMode ? `Sent to ${contact!.name}` : bill ? `${provider} ${bill.title} · ${billNumber.trim()}` : description;
    // Payments (send/bill) get an in-modal success beat before auto-closing;
    // a plain add-transaction keeps the existing toast-after-close. Built
    // from state that's still untouched at this point — resets only happen
    // once the success beat finishes (see onSuccessDone below).
    const paymentSuccessText = sendMode
      ? `Sent ${formatMoney(amt, currency)} to ${contact!.name}`
      : bill ? `${bill.title} of ${formatMoney(amt, currency)} successful` : null;
    setSubmitting(true);
    try {
      await api.createTxn({ accountId, date, type: ftype, category, amount: amt, description: desc });
      load();
      if (paymentSuccessText) {
        setSuccessMsg(paymentSuccessText);
      } else {
        closeForm();
        setAmount(''); setDescription(''); setContact(null); setProvider(null); setBillNumber('');
        flash('Transaction added');
      }
    } catch (e: any) {
      setFormError(e.message || 'Could not save');
    } finally {
      setSubmitting(false);
    }
  };

  const onSuccessDone = () => {
    setSuccessMsg('');
    closeForm();
    setAmount(''); setDescription(''); setContact(null); setProvider(null); setBillNumber('');
  };

  const confirmDelete = async () => {
    if (!confirmDeleteId) return;
    try { await api.deleteTxn(confirmDeleteId); flash('Transaction deleted'); load(); } catch { /* noop */ }
    setConfirmDeleteId(null);
  };

  // Regrouping into Today/Yesterday/This week/Earlier buckets on every render
  // (e.g. while typing in the search box before submitting) would re-walk the
  // whole list for nothing — only recompute when the list itself changes.
  const sections = useMemo(() => groupByBucket(items ?? []), [items]);
  const money = useCallback((v: number) => formatMoney(v, currency), [currency]);

  const flowMeta = getFlowMeta(sendMode, billType, colors);
  const symbol = currencySymbol(currency);
  const todayStr = new Date().toISOString().slice(0, 10);
  const yesterdayStr = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

  // Just the form fields — no header (PopupModal/AppModal each render their
  // own) and no footer buttons (each container lays those out differently:
  // PopupModal's fixed-width right-aligned pair vs the plain-add AppModal's
  // full-width pair). Shared between both since the sendMode/billType
  // conditionals below already gate on state that's only ever true in the
  // container it's actually rendered inside.
  const fields = (
    <>
      {sendMode ? (
        <>
          <FieldLabel>To</FieldLabel>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: space.md, paddingVertical: 4 }}>
            {CONTACTS.map((c) => (
              <ContactChip
                key={c.id}
                contact={c}
                selected={contact?.id === c.id}
                onPress={() => setContact(c)}
                testID={T.sendContact(c.id)}
              />
            ))}
          </ScrollView>
        </>
      ) : null}

      {billType ? (
        <>
          <FieldLabel>Provider</FieldLabel>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
            {BILL_TYPES[billType].providers.map((p) => (
              <Chip key={p} testID={T.billProvider(p)} label={p} active={provider === p} onPress={() => setProvider(p)} />
            ))}
          </View>

          <FieldLabel>{BILL_TYPES[billType].numberLabel}</FieldLabel>
          <FormInput
            testID={T.billNumber}
            value={billNumber}
            onChangeText={setBillNumber}
            keyboardType={BILL_TYPES[billType].keyboard}
            placeholder={BILL_TYPES[billType].numberPlaceholder}
          />
        </>
      ) : null}

      <FieldLabel>Amount</FieldLabel>
      <AmountField testID={T.txnFormAmount} value={amount} onChangeText={setAmount} currencySymbol={symbol} />

      {sendMode ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, marginTop: space.sm }}>
          {SEND_QUICK_AMOUNTS.map((a) => (
            <Chip key={a} testID={T.sendAmountChip(a)} label={`${symbol}${a}`} active={amount === String(a)} onPress={() => setAmount(String(a))} />
          ))}
        </View>
      ) : null}

      {billType && BILL_TYPES[billType].quickAmounts ? (
        <View style={{ flexDirection: 'row', gap: space.sm, marginTop: space.sm }}>
          {BILL_TYPES[billType].quickAmounts!.map((a) => (
            <Chip key={a} testID={T.billAmountChip(a)} label={`${symbol}${a}`} active={amount === String(a)} onPress={() => setAmount(String(a))} />
          ))}
        </View>
      ) : null}

      {!sendMode && !billType ? (
        <>
          <FieldLabel>Type</FieldLabel>
          <SegmentControl
            testIDPrefix={T.txnFormType}
            segments={[{ key: 'expense', label: 'Expense' }, { key: 'income', label: 'Income' }]}
            value={ftype}
            onChange={(v) => setFtype(v as 'income' | 'expense')}
          />

          <FieldLabel>Category</FieldLabel>
          <CategoryGrid categories={CATEGORIES} value={category} onChange={setCategory} testIDPrefix={T.txnFormCategory} />

          {accounts.length > 0 ? (
            <>
              <FieldLabel>Account</FieldLabel>
              <AccountSelector accounts={accounts} value={accountId} onChange={setAccountId} testIDPrefix={T.txnFormAccount} />
            </>
          ) : null}

          <FieldLabel>Date</FieldLabel>
          <FormInput testID={T.txnFormDate} value={date} onChangeText={setDate} placeholder="yyyy-mm-dd" />
          <View style={{ flexDirection: 'row', gap: space.sm, marginTop: space.sm }}>
            <Chip label="Today" active={date === todayStr} onPress={() => setDate(todayStr)} />
            <Chip label="Yesterday" active={date === yesterdayStr} onPress={() => setDate(yesterdayStr)} />
          </View>

          <FieldLabel>Description</FieldLabel>
          <TextInput
            testID={T.txnFormDescription}
            accessibilityLabel={T.txnFormDescription}
            value={description}
            onChangeText={setDescription}
            placeholder="Optional notes"
            placeholderTextColor={colors.caption}
            multiline
            numberOfLines={3}
            style={[
              typeScale.body,
              { borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: space.md, color: colors.heading, minHeight: 72, textAlignVertical: 'top' },
            ]}
          />
        </>
      ) : null}

      {formError ? <Text testID={T.txnFormError} style={[typeScale.caption, { color: colors.danger, marginTop: space.md }]}>{formError}</Text> : null}
    </>
  );

  return (
    <ScreenFade>
    <View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center' }}>
      <View style={{ flex: 1, width: '100%', maxWidth: contentWidth, padding: space.base }}>
        <Header
          title="Transactions"
          right={<Button testID={T.txnAddOpen} label="Add" icon={<icons.add size={16} color={colors.onPrimary} />} onPress={() => { setSendMode(false); setBillType(null); setModalOpen(true); }} />}
        />

        <View style={{ marginBottom: space.sm }}>
          <SearchBar testID={T.txnSearch} value={search} onChangeText={setSearch} onSubmit={() => load()} placeholder="Search description" />
        </View>

        <View style={{ flexDirection: 'row', gap: space.sm, marginBottom: space.base }}>
          {TYPES.map((t) => (
            <Chip
              key={t || 'all'}
              testID={`${T.txnFilterType}-${t || 'all'}`}
              label={t || 'all'}
              active={typeFilter === t}
              onPress={() => setTypeFilter(t)}
            />
          ))}
        </View>

        {items === null ? (
          <View style={{ gap: space.sm }}>
            <Skeleton width="100%" height={68} radius={radius.lg} />
            <Skeleton width="100%" height={68} radius={radius.lg} />
            <Skeleton width="100%" height={68} radius={radius.lg} />
          </View>
        ) : items.length === 0 ? (
          <EmptyState
            testID={T.txnEmpty}
            icon={icons.receipt}
            title="No transactions match"
            message="Add one, or clear the filters."
          />
        ) : (
          <SectionList
            testID={T.txnList}
            sections={sections}
            keyExtractor={(i) => i.id}
            contentContainerStyle={{ paddingBottom: space.xl }}
            stickySectionHeadersEnabled={false}
            onScroll={(e) => { scrollY.value = e.nativeEvent.contentOffset.y; }}
            scrollEventThrottle={16}
            renderSectionHeader={({ section }) => (
              <Text style={[typeScale.captionMedium, { color: colors.caption, marginTop: space.md, marginBottom: space.sm }]}>
                {section.title}
              </Text>
            )}
            ItemSeparatorComponent={() => <View style={{ height: space.sm }} />}
            renderItem={({ item }) => (
              <SwipeableRow onDelete={() => setConfirmDeleteId(item.id)} deleteTestID={T.txnRowDelete(item.id)}>
                <TransactionCard txn={item} formatter={money} testID={T.txnRow(item.id)} amountTestID={T.txnRowAmount(item.id)} />
              </SwipeableRow>
            )}
          />
        )}

        <Toast message={toast} visible={!!toast} testID={T.toast} />
      </View>

      {/* One shared PopupModal for every flow — Send Money, Recharge,
          Electricity, DTH, and the plain "New transaction" form — centered
          dialog on desktop/tablet, bottom sheet on phone. */}
      <PopupModal
        visible={modalOpen}
        onClose={closeForm}
        icon={flowMeta.icon}
        iconTint={flowMeta.tint}
        title={flowMeta.title}
        subtitle={flowMeta.subtitle}
        successMessage={successMsg}
        onSuccessDone={onSuccessDone}
        successTestID={T.paymentSuccess}
        closeTestID={T.txnFormClose}
        footer={
          <>
            <Button testID={T.txnFormCancel} label="Cancel" variant="ghost" style={{ width: 120 }} onPress={closeForm} />
            <Button
              testID={T.txnFormSubmit}
              label={sendMode ? 'Send' : billType ? 'Pay' : 'Save transaction'}
              style={{ minWidth: 140 }}
              loading={submitting}
              disabled={!canSubmit}
              onPress={onSubmit}
            />
          </>
        }
      >
        {fields}
      </PopupModal>

      <AppModal visible={!!confirmDeleteId} onClose={() => setConfirmDeleteId(null)}>
        <View style={{ padding: space.lg }}>
          <Text style={[typeScale.h3, { color: colors.heading, marginBottom: space.sm }]}>Delete transaction?</Text>
          <Text style={[typeScale.body, { color: colors.body, marginBottom: space.lg }]}>This can't be undone.</Text>
          <View style={{ flexDirection: 'row', gap: space.md }}>
            <Button label="Cancel" variant="outline" fullWidth style={{ flex: 1 }} onPress={() => setConfirmDeleteId(null)} />
            <Button label="Delete" variant="danger" fullWidth style={{ flex: 1 }} onPress={confirmDelete} />
          </View>
        </View>
      </AppModal>
    </View>
    </ScreenFade>
  );
}

function ContactChip({ contact, selected, onPress, testID }: {
  contact: { id: string; name: string; color: string }; selected: boolean; onPress: () => void; testID: string;
}) {
  const { colors } = useTheme();
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withSpring(selected ? 1.08 : 1, spring.snappy);
  }, [selected, scale]);

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <AnimatedPressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={`Send to ${contact.name}`}
      accessibilityState={{ selected }}
      onPress={onPress}
      style={{ alignItems: 'center', width: 56 }}
    >
      <Animated.View style={[{ borderRadius: 26, borderWidth: 2, borderColor: selected ? colors.primary : 'transparent' }, animatedStyle]}>
        <Avatar name={contact.name} color={contact.color} size={48} />
      </Animated.View>
      <Text style={[typeScale.small, { color: colors.body, marginTop: 4 }]} numberOfLines={1}>
        {contact.name.split(' ')[0]}
      </Text>
    </AnimatedPressable>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  const { colors } = useTheme();
  return <Text style={[typeScale.caption, { color: colors.body, marginTop: space.md, marginBottom: space.sm }]}>{children}</Text>;
}

function FormInput({ testID, value, onChangeText, placeholder, keyboardType }: {
  testID: string; value: string; onChangeText: (v: string) => void; placeholder?: string; keyboardType?: 'numeric' | 'phone-pad' | 'default';
}) {
  const { colors } = useTheme();
  return (
    <TextInput
      testID={testID}
      accessibilityLabel={testID}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={colors.caption}
      keyboardType={keyboardType}
      style={[typeScale.body, { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: space.md, paddingVertical: space.sm + 3, color: colors.heading }]}
    />
  );
}
