/** Raw brand palette — the fixed hex values behind every semantic color below. */
export const palette = {
  primary: '#2453FF',
  primaryDark: '#183BBF',
  primaryLight: '#EEF3FF',
  success: '#16A34A',
  successBg: '#ECFDF3',
  danger: '#DC2626',
  dangerBg: '#FEF3F2',
  warning: '#F59E0B',
  purple: '#7C3AED',
  sky: '#0EA5E9',
  loan: '#FB7185',
  savings: '#14B8A6',
  expense: '#EF4444',
  income: '#22C55E',
  white: '#FFFFFF',
  black: '#000000',
} as const;

export interface ColorScheme {
  background: string;
  surface: string;
  card: string;
  border: string;
  divider: string;
  heading: string;
  body: string;
  caption: string;
  onPrimary: string;
  primary: string;
  primaryDark: string;
  primaryLight: string;
  success: string;
  successBg: string;
  danger: string;
  dangerBg: string;
  warning: string;
  warningBg: string;
  purple: string;
  sky: string;
  loan: string;
  savings: string;
  expense: string;
  income: string;
  overlay: string;
  skeleton: string;
  skeletonHighlight: string;
}

export const lightColors: ColorScheme = {
  background: '#F6F8FC',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  border: '#E8ECF5',
  divider: '#F1F5F9',
  heading: '#0F172A',
  body: '#475467',
  // #98A2B3 (the raw brand caption gray) only clears ~2.5:1 against white/background —
  // fails WCAG AA (4.5:1) for the small text it's used on everywhere (dates, hints,
  // labels). Darkened just enough to pass; verified via scripts/contrast-check in Phase 17.
  caption: '#667085',
  onPrimary: '#FFFFFF',
  primary: palette.primary,
  primaryDark: palette.primaryDark,
  primaryLight: palette.primaryLight,
  // success/income/expense below are darkened from the raw palette specifically
  // because they're used as plain TEXT (status messages, transaction amounts),
  // not just icon tints — the original vivid shades fail AA for text at this size.
  success: '#15803D',
  successBg: palette.successBg,
  danger: palette.danger,
  dangerBg: palette.dangerBg,
  warning: '#B45309',
  warningBg: '#FFFBEB',
  purple: palette.purple,
  sky: palette.sky,
  loan: palette.loan,
  savings: palette.savings,
  expense: '#DC2626',
  income: '#15803D',
  overlay: 'rgba(15, 23, 42, 0.45)',
  skeleton: '#EDF1F8',
  skeletonHighlight: '#F8FAFD',
};

export const darkColors: ColorScheme = {
  background: '#0A0F1E',
  surface: '#12182B',
  card: '#161D33',
  border: '#232B45',
  divider: '#1B2238',
  heading: '#F8FAFC',
  body: '#AEB8CC',
  // #6E7890 falls just short of 4.5:1 against background/card — lightened slightly.
  caption: '#8B96AD',
  onPrimary: '#FFFFFF',
  // `primary` stays the lighter accent blue (reads well against dark surfaces —
  // sidebar active state, chart lines). It must NOT be used as a solid button
  // background with white text on top (only ~3.5:1) — use `primaryDark` for that,
  // which is dark enough for white text while still a legible blue.
  primary: '#5B82FF',
  primaryDark: '#2453FF',
  // Slightly darkened from #182451 so it clears 4.5:1 when used as muted caption
  // text on a `primary`-colored surface (BalanceCard/LoanCard hero, Login subtitle),
  // while staying dark enough to still read as a subtle background tint elsewhere.
  primaryLight: '#141F3F',
  success: '#22C55E',
  successBg: '#0F2A1B',
  danger: '#F87171',
  dangerBg: '#341515',
  warning: '#FBBF24',
  warningBg: '#332405',
  purple: '#A78BFA',
  sky: '#38BDF8',
  loan: '#FDA4AF',
  savings: '#2DD4BF',
  expense: '#F87171',
  income: '#4ADE80',
  overlay: 'rgba(0, 0, 0, 0.6)',
  skeleton: '#1B2238',
  skeletonHighlight: '#232B45',
};

/** Transaction category → accent color. Same colors regardless of light/dark
 * (used as small icon-chip backgrounds at low opacity, stays legible either way). */
export const categoryColors: Record<string, string> = {
  salary: palette.income,
  investment: palette.purple,
  transfer: palette.sky,
  groceries: palette.warning,
  utilities: palette.warning,
  rent: palette.primary,
  entertainment: palette.purple,
  travel: palette.sky,
  other: '#98A2B3',
};

/** Ordered categorical palette for charts (income/expense breakdowns, trends). */
export const chartPalette = [
  palette.primary,
  palette.income,
  palette.warning,
  palette.purple,
  palette.savings,
  palette.loan,
];
