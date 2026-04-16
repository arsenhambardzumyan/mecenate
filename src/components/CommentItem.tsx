import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Heart } from 'lucide-react-native';
import { observer } from 'mobx-react-lite';
import { Comment } from '../types/api';
import { theme } from '../theme/theme';
import { useLikeComment } from '../hooks/useLikeComment';
import { uiStore } from '../store/uiStore';

const getBaseLikes = (id: string) => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash % 12);
};

interface Props {
  comment: Comment;
}

export const CommentItem: React.FC<Props> = observer(({ comment }) => {
  const { toggleCommentLike } = useLikeComment();
  const isLiked = uiStore.likedCommentIds.has(comment.id);
  const baseLikes = getBaseLikes(comment.id);
  const likesCount = baseLikes + (isLiked ? 1 : 0);

  const toggleLike = () => {
    toggleCommentLike(comment.id);
  };

  const formatDate = (dateString: string) => {
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return dateString;

      const now = new Date();
      const isToday = d.getFullYear() === now.getFullYear() && 
                      d.getMonth() === now.getMonth() && 
                      d.getDate() === now.getDate();
      
      if (isToday) {
        const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);
        if (diffInSeconds < 60) return 'Только что';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} мин. назад`;
        return `Сегодня, ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
      }

      const months = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
      return `${d.getDate()} ${months[d.getMonth()]}, ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
    } catch {
      return dateString;
    }
  };

  return (
    <View style={styles.container}>
      <Image source={{ uri: comment.author.avatarUrl }} style={styles.avatar} />
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.authorName}>{comment.author.displayName}</Text>
          <TouchableOpacity onPress={toggleLike} style={styles.likeContainer}>
            <Heart
              size={12}
              color={isLiked ? theme.colors.likeRed : theme.colors.textTertiary}
              fill={isLiked ? theme.colors.likeRed : 'transparent'}
            />
            <Text style={[styles.likesCount, isLiked && { color: theme.colors.likeRed }]}>
              {likesCount}
            </Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.text}>{comment.text}</Text>
        <Text style={styles.date}>
          {formatDate(comment.createdAt)}
        </Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.card,
  },
  avatar: {
    width: theme.dimensions.avatarMd,
    height: theme.dimensions.avatarMd,
    borderRadius: theme.borderRadius.md,
    marginRight: theme.spacing.md,
  },
  content: {
    flex: theme.dimensions.flex1,
  },
  authorName: {
    fontSize: theme.fontSizes.md,
    fontFamily: theme.fonts.semibold,
    color: theme.colors.textPrimary,
    marginBottom: theme.dimensions.microMargin,
  },
  text: {
    fontSize: theme.fontSizes.md,
    lineHeight: theme.lineHeights.sm,
    fontFamily: theme.fonts.regular,
    color: theme.colors.textPrimary,
  },
  date: {
    fontSize: theme.fontSizes.sm,
    fontFamily: theme.fonts.regular,
    color: theme.colors.textTertiary,
    marginTop: theme.spacing.xs,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.dimensions.microMargin,
  },
  likeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likesCount: {
    fontSize: theme.fontSizes.xs,
    fontFamily: theme.fonts.medium,
    color: theme.colors.textTertiary,
    marginLeft: theme.spacing.xs,
  },
});
