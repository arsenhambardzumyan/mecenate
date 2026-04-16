import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MoneyIcon } from './Icons';
import { theme } from '../theme/theme';

export const PaidContentPlaceholder: React.FC = () => {
  return (
    <View style={styles.container}>
      <View style={styles.blurOverlay}>
        <View style={styles.iconContainer}>
          <MoneyIcon size={20} color={theme.colors.white} />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.textPrimary}>
            Контент скрыт пользователем.
          </Text>
          <Text style={styles.textSecondary}>
            Доступ откроется после доната
          </Text>
        </View>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Отправить донат</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.colors.overlay,
    justifyContent: theme.layout.center,
    alignItems: theme.layout.center,
    borderRadius: theme.borderRadius.md,
  },
  blurOverlay: {
    padding: theme.spacing.lg,
    alignItems: theme.layout.center,
    width: theme.layout.fullWidth,
  },
  iconContainer: {
    width: theme.dimensions.iconContainer,
    height: theme.dimensions.iconContainer,
    borderRadius: theme.spacing.md,
    backgroundColor: theme.colors.primary,
    justifyContent: theme.layout.center,
    alignItems: theme.layout.center,
    marginBottom: theme.spacing.lg,
  },
  textContainer: {
    marginBottom: theme.spacing.lg,
    alignItems: theme.layout.center,
  },
  textPrimary: {
    color: theme.colors.white,
    textAlign: 'center',
    fontSize: theme.fontSizes.xl,
    fontFamily: theme.fonts.bold,
  },
  textSecondary: {
    color: theme.colors.white,
    textAlign: 'center',
    fontSize: theme.fontSizes.md,
    fontFamily: theme.fonts.medium,
    opacity: 0.9,
  },
  button: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.xxxl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.full,
    alignItems: theme.layout.center,
    minWidth: '70%',
  },
  buttonText: {
    color: theme.colors.white,
    fontSize: theme.fontSizes.xl,
    fontFamily: theme.fonts.bold,
  },
});
