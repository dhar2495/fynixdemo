/**
 * Small set of standalone helpers that predate the design system tokens but
 * are still genuinely used everywhere (money formatting, avatar initials, the
 * two content-width caps). The original flat color palette, single shadow
 * constant, and Ionicons-based category map that used to live here were
 * removed in Phase 20 once every screen had migrated to theme/colors.ts,
 * theme/elevation.ts, and theme/icons.ts respectively — confirmed dead via a
 * full grep audit before deleting.
 */

export const formWidth = 460;
export const contentWidth = 1200;

const SYMBOLS: Record<string, string> = { INR: '₹', USD: '$', EUR: '€' };

export function initials(name?: string): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  return (parts[0]?.[0] || '').concat(parts[1]?.[0] || '').toUpperCase() || name[0]?.toUpperCase() || '?';
}

/** Darkens a hex color by mixing in black — used wherever a color that's
 * safe as TEXT (e.g. `colors.income`/`colors.expense`, tuned per-theme for
 * 4.5:1 as foreground text) needs to become a solid FILL behind a white
 * icon instead, which needs much more headroom than text-on-card does.
 * Darkening only ever increases contrast against white, so this is safe to
 * apply without re-deriving per-color contrast math at each call site. */
export function darken(hex: string, amount: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, (num >> 16) - Math.round(255 * amount));
  const g = Math.max(0, ((num >> 8) & 0xff) - Math.round(255 * amount));
  const b = Math.max(0, (num & 0xff) - Math.round(255 * amount));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

function relativeLuminance(hex: string): number {
  const num = parseInt(hex.replace('#', ''), 16);
  const toLinear = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  const r = toLinear((num >> 16) & 0xff);
  const g = toLinear((num >> 8) & 0xff);
  const b = toLinear(num & 0xff);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(hexA: string, hexB: string): number {
  const a = relativeLuminance(hexA);
  const b = relativeLuminance(hexB);
  const [lighter, darker] = a > b ? [a, b] : [b, a];
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Some theme colors (`colors.income`/`colors.expense`/`colors.primary` etc.)
 * are tuned per-theme for 4.5:1 as foreground TEXT on a card — that's a much
 * lower bar than being a solid FILL with a white icon on top (dark mode's
 * versions of these are deliberately lightened for text-on-dark legibility,
 * which makes them too light for this). Darkens only as much as actually
 * needed to clear `minRatio` against white, so an already-dark color (light
 * mode's income/expense) comes back unchanged instead of over-darkened.
 */
export function ensureFillContrast(hex: string, minRatio = 4.5): string {
  let result = hex;
  for (let amount = 0; amount <= 0.6; amount += 0.05) {
    result = darken(hex, amount);
    if (contrastRatio(result, '#FFFFFF') >= minRatio) return result;
  }
  return result;
}

export function currencySymbol(currency = 'INR'): string {
  return SYMBOLS[currency] || '';
}

export function formatMoney(value: number, currency = 'INR'): string {
  const symbol = SYMBOLS[currency] || '';
  const fixed = Math.abs(value).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${value < 0 ? '-' : ''}${symbol}${fixed}`;
}
