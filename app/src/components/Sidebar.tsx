import type { LucideIcon } from '../theme';

/** Shared route shape for the nav (FloatingMenuButton/NavigationPanel) —
 * kept in its own file since nav.tsx, FloatingMenuButton.tsx, and
 * NavigationPanel.tsx all need it and none of them "owns" it more than
 * the others. The old always-on Sidebar rail component that used to live
 * here was removed once the floating-button + drawer replaced it. */
export interface SidebarRoute {
  key: string;
  label: string;
  icon: LucideIcon;
  testID: string;
  /** Short blurb shown by NavigationPanel — the compact rail this used to
   * also serve had no room for it; the drawer does. */
  subtitle?: string;
}
