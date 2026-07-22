import React, { createContext, useContext } from 'react';
import { SharedValue, useSharedValue } from 'react-native-reanimated';

const ScrollYContext = createContext<SharedValue<number> | null>(null);

/** One shared scroll offset for whichever tab screen is currently focused —
 * lets Topbar (rendered as a sibling above the tab navigator, not a parent
 * of any screen's ScrollView) fade in a blur backdrop once the user
 * scrolls, without each screen needing to know Topbar exists. */
export function ScrollYProvider({ children }: { children: React.ReactNode }) {
  const scrollY = useSharedValue(0);
  return <ScrollYContext.Provider value={scrollY}>{children}</ScrollYContext.Provider>;
}

export function useScrollY(): SharedValue<number> {
  const ctx = useContext(ScrollYContext);
  if (!ctx) throw new Error('useScrollY must be used within ScrollYProvider');
  return ctx;
}
