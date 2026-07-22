import {
  Wallet, TrendingUp, ArrowLeftRight, ShoppingCart, Zap, House, Film, Plane, Ellipsis, Tv,
  CircleArrowDown, CircleArrowUp, Activity, Receipt, Send, Smartphone, FileText, Calculator,
  Search, Bell, Plus, Settings, LogOut, User, Sun, Moon, X, Trash2, Pencil, Copy, Star,
  ChevronRight, ChevronDown, RefreshCw, Landmark, PiggyBank, LayoutDashboard, ArrowUpRight, ArrowDownRight,
  CreditCard, Check, Circle, ListFilter, SlidersHorizontal, Menu, Mail, Lock, Eye, EyeOff,
  type LucideIcon,
} from 'lucide-react-native';

export type { LucideIcon };

/** Category → icon component, used by every screen/component that renders a
 * transaction (TransactionCard, Dashboard charts, etc). */
export const categoryIcon: Record<string, LucideIcon> = {
  salary: Wallet,
  investment: TrendingUp,
  transfer: ArrowLeftRight,
  groceries: ShoppingCart,
  utilities: Zap,
  rent: House,
  entertainment: Film,
  travel: Plane,
  other: Ellipsis,
};

/** DTH bills post as category 'utilities' but get their own icon, sniffed
 * from the description the DTH bill-pay flow writes. */
export function resolveCategoryIcon(t: { category: string; description?: string }): LucideIcon {
  if (t.category === 'utilities' && /dth/i.test(t.description || '')) return Tv;
  return categoryIcon[t.category] || categoryIcon.other;
}

export const icons = {
  income: CircleArrowDown,
  expense: CircleArrowUp,
  net: Activity,
  receipt: Receipt,
  send: Send,
  recharge: Smartphone,
  bills: FileText,
  loan: Calculator,
  search: Search,
  bell: Bell,
  add: Plus,
  settings: Settings,
  logout: LogOut,
  user: User,
  sun: Sun,
  moon: Moon,
  close: X,
  delete: Trash2,
  edit: Pencil,
  duplicate: Copy,
  favorite: Star,
  chevronRight: ChevronRight,
  chevronDown: ChevronDown,
  refresh: RefreshCw,
  accounts: Landmark,
  savings: PiggyBank,
  dashboard: LayoutDashboard,
  transactions: ArrowLeftRight,
  loanNav: Calculator,
  trendUp: ArrowUpRight,
  trendDown: ArrowDownRight,
  card: CreditCard,
  check: Check,
  circle: Circle,
  filter: ListFilter,
  sliders: SlidersHorizontal,
  menu: Menu,
  electricity: Zap,
  banner: Bell,
  mail: Mail,
  lock: Lock,
  eye: Eye,
  eyeOff: EyeOff,
} as const;
