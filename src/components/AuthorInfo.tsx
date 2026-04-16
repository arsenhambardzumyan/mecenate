import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Author } from '../types/api';
import { theme } from '../theme/theme';
import { CheckCircle2 } from 'lucide-react-native';

interface Props {
  author: Author;
  date?: string;
  avatarSize?: number;
}

export const AuthorInfo: React.FC<Props> = ({ author, date, avatarSize = 36 }) => {
  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    const months = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
    const month = months[d.getMonth()];
    const day = d.getDate();
    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');
    return `${day} ${month}, ${hours}:${minutes}`;
  };

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: author.avatarUrl }}
        style={[styles.avatar, { width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2 }]}
      />
      <View style={styles.content}>
        <View style={styles.nameContainer}>
          <Text style={styles.name}>{author.displayName}</Text>
          {author.isVerified && (
            <CheckCircle2 size={14} color={theme.colors.primary} style={styles.badge} />
          )}
        </View>
        {date && <Text style={styles.date}>{formatDate(date)}</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: theme.layout.row,
    alignItems: theme.layout.center,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.card,
  },
  avatar: {
    backgroundColor: theme.colors.avatarBackground,
  },
  content: {
    marginLeft: theme.spacing.md,
    justifyContent: theme.layout.center,
  },
  nameContainer: {
    flexDirection: theme.layout.row,
    alignItems: theme.layout.center,
    marginBottom: theme.dimensions.microMargin,
  },
  name: {
    fontSize: theme.fontSizes.lg,
    lineHeight: theme.lineHeights.md,
    fontWeight: theme.fontWeights.bold,
    fontFamily: theme.fonts.semibold,
    color: theme.colors.textPrimary,
  },
  badge: {
    marginLeft: theme.spacing.xs,
  },
  date: {
    fontSize: theme.fontSizes.sm,
    lineHeight: theme.lineHeights.xs,
    fontFamily: theme.fonts.regular,
    color: theme.colors.textSecondary,
  },
});
