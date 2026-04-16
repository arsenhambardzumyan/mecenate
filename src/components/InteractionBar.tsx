import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Heart } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { CommentIcon } from './Icons';
import { theme } from '../theme/theme';

interface Props {
  likesCount: number;
  commentsCount: number;
  isLiked: boolean;
  onLikePress: () => void;
}

const AnimatedHeart = Animated.createAnimatedComponent(Heart);

export const InteractionBar: React.FC<Props> = ({
  likesCount,
  commentsCount,
  isLiked,
  onLikePress,
}) => {
  const scale = useRef(new Animated.Value(1)).current;

  const handleLikePress = () => {
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 1.3,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {
      console.warn('Haptics failed', e);
    }

    onLikePress();
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        activeOpacity={0.7}
        style={[
          styles.interactionGroup, 
          isLiked && styles.likedGroup
        ]} 
        onPress={handleLikePress}
      >
        <Animated.View style={{ transform: [{ scale }] }}>
          <AnimatedHeart
            size={theme.spacing.xl}
            color={isLiked ? theme.colors.white : theme.colors.textPrimary}
            fill={isLiked ? theme.colors.white : theme.colors.transparent}
          />
        </Animated.View>
        <Text style={[styles.countText, isLiked && styles.likedText]}>{likesCount}</Text>
      </TouchableOpacity>

      <View style={styles.interactionGroup}>
        <CommentIcon size={15} color={theme.colors.textPrimary} />
        <Text style={styles.countText}>{commentsCount}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
  interactionGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  likedGroup: {
    backgroundColor: theme.colors.likeRed,
    borderColor: theme.colors.likeRed,
  },
  countText: {
    fontSize: theme.fontSizes.sm,
    fontFamily: theme.fonts.medium,
    color: theme.colors.textPrimary,
  },
  likedText: {
    color: theme.colors.white,
  },
});

