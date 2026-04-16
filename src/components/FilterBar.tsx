import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '../theme/theme';

export type FilterType = 'all' | 'free' | 'paid';

interface Props {
  selected: FilterType;
  onSelect: (type: FilterType) => void;
}

export const FilterBar: React.FC<Props> = ({ selected, onSelect }) => {
  const options: { label: string; value: FilterType }[] = [
    { label: 'Все', value: 'all' },
    { label: 'Бесплатные', value: 'free' },
    { label: 'Платные', value: 'paid' },
  ];

  return (
    <View style={styles.tabBarContainer}>
      <View style={styles.segmentsContainer}>
        {options.map((option) => {
          const isActive = selected === option.value;
          return (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.segment,
                isActive && styles.activeSegment
              ]}
              onPress={() => onSelect(option.value)}
              activeOpacity={0.8}
            >
              <Text style={[
                styles.segmentText,
                isActive && styles.activeSegmentText
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  tabBarContainer: {
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.sm,
  },
  segmentsContainer: {
    flexDirection: theme.layout.row,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.full,
    height: theme.dimensions.filterBarHeight,
    padding: theme.dimensions.zero,
    alignItems: 'stretch',
    ...theme.shadows.micro,
  },
  segment: {
    flex: theme.dimensions.flex1,
    borderRadius: theme.borderRadius.full,
    alignItems: theme.layout.center,
    justifyContent: theme.layout.center,
  },
  activeSegment: {
    backgroundColor: theme.colors.primary,
  },
  segmentText: {
    fontSize: theme.fontSizes.md,
    fontFamily: theme.fonts.medium,
    color: theme.colors.textTertiary,
  },
  activeSegmentText: {
    fontFamily: theme.fonts.semibold,
    color: theme.colors.white,
  },
});
