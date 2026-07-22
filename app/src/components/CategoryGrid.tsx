import React from 'react';
import { Text, View } from 'react-native';
import { AnimatedPressable } from './AnimatedPressable';
import { useTheme, space, radius, categoryColors, categoryIcon, ensureFillContrast, type as typeScale } from '../theme';

interface Props {
  categories: string[];
  value: string;
  onChange: (category: string) => void;
  testIDPrefix: string;
}

/** Category picker as a grid of icon tiles rather than a wrapped chip row —
 * only the categories the API actually accepts (see api/src/routes/
 * transactions.ts's CATEGORIES list); no invented extras like "Medical" or
 * "Fuel" that the backend would reject. */
export function CategoryGrid({ categories, value, onChange, testIDPrefix }: Props) {
  const { colors } = useTheme();

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
      {categories.map((cat) => {
        const active = value === cat;
        const tint = categoryColors[cat] || colors.caption;
        const Icon = categoryIcon[cat] || categoryIcon.other;
        const iconFill = ensureFillContrast(tint);
        return (
          <AnimatedPressable
            key={cat}
            testID={`${testIDPrefix}-${cat}`}
            accessibilityRole="button"
            accessibilityLabel={cat}
            accessibilityState={{ selected: active }}
            onPress={() => onChange(cat)}
            style={{
              width: 82,
              alignItems: 'center',
              gap: 4,
              paddingVertical: space.sm,
              borderRadius: radius.lg,
              borderWidth: active ? 2 : 1,
              borderColor: active ? tint : colors.border,
              backgroundColor: active ? `${tint}14` : colors.card,
            }}
          >
            <View style={{ width: 36, height: 36, borderRadius: radius.full, backgroundColor: iconFill, alignItems: 'center', justifyContent: 'center' }}>
              <Icon size={16} color="#fff" />
            </View>
            <Text style={[typeScale.small, { color: colors.heading, textAlign: 'center', textTransform: 'capitalize' }]} numberOfLines={1}>
              {cat}
            </Text>
          </AnimatedPressable>
        );
      })}
    </View>
  );
}
