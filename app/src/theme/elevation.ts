import { makeElevation, ShadowStyle } from './shadow';

/**
 * Semantic surface → elevation level mapping. Components ask "how high do I
 * sit" (e.g. `elevation.card`) rather than picking a raw shadow level, so the
 * whole app's depth hierarchy can be retuned from one place.
 */
export interface ElevationScale {
  flat: ShadowStyle;
  card: ShadowStyle;
  raised: ShadowStyle;
  sheet: ShadowStyle;
  floating: ShadowStyle;
  hero: ShadowStyle;
}

export function buildElevation(tint: string): ElevationScale {
  return {
    flat: makeElevation(0, tint),
    card: makeElevation(1, tint),
    raised: makeElevation(2, tint),
    sheet: makeElevation(3, tint),
    floating: makeElevation(4, tint),
    hero: makeElevation(5, tint),
  };
}
