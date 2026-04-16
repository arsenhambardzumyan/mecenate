import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import { Post } from '../types/api';
import { theme } from '../theme/theme';
import { AuthorInfo } from './AuthorInfo';
import { InteractionBar } from './InteractionBar';
import { PaidContentPlaceholder } from './PaidContentPlaceholder';
import { useLikePost } from '../hooks/useLikePost';

interface Props {
  post: Post;
}

type NavigationProp = StackNavigationProp<RootStackParamList, 'Feed'>;

export const PublicationCard: React.FC<Props> = ({ post }) => {
  const navigation = useNavigation<NavigationProp>();
  const [showFullBody, setShowFullBody] = useState(false);
  const { mutate: toggleLike } = useLikePost();

  const handlePress = () => {
    navigation.navigate('PostDetails', { postId: post.id });
  };

  const handleLike = () => {
    toggleLike(post.id);
  };

  const isPaid = post.tier === 'paid';

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress} activeOpacity={0.8}>
      <AuthorInfo author={post.author} date={post.createdAt} avatarSize={36} />

      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: post.coverUrl }} 
          style={styles.cover} 
          resizeMode="cover"
          blurRadius={isPaid ? 50 : 0}
        />
        {isPaid && <PaidContentPlaceholder />}
      </View>

      <View style={styles.content}>
        {isPaid ? (
          <View style={styles.skeletonContainer}>
            <View style={[styles.skeleton, styles.skeletonShort]} />
            <View style={[styles.skeleton, styles.skeletonLong]} />
          </View>
        ) : (
          <>
            <Text style={styles.title}>{post.title}</Text>
            <Text style={styles.body} numberOfLines={showFullBody ? undefined : theme.dimensions.flex3}>
              {showFullBody ? (post.body || post.preview) : post.preview}
            </Text>
            {post.body && post.body !== post.preview && !showFullBody && (
              <TouchableOpacity onPress={() => setShowFullBody(true)}>
                <Text style={styles.showMore}>Показать еще</Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </View>

      {!isPaid && (
        <InteractionBar
          likesCount={post.likesCount}
          commentsCount={post.commentsCount}
          isLiked={post.isLiked}
          onLikePress={handleLike}
        />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.lg,
    overflow: theme.layout.overflowHidden,
    ...theme.shadows.light,
  },
  imageContainer: {
    width: theme.layout.fullWidth,
    aspectRatio: theme.dimensions.aspectRatio1,
    backgroundColor: theme.colors.background,
  },
  cover: {
    width: theme.layout.fullWidth,
    height: theme.layout.fullHeight,
  },
  content: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },
  title: {
    fontSize: theme.fontSizes.xxl,
    fontWeight: theme.fontWeights.bold,
    fontFamily: theme.fonts.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
    lineHeight: theme.lineHeights.xl,
  },
  body: {
    fontSize: theme.fontSizes.lg,
    lineHeight: theme.lineHeights.lg,
    fontWeight: theme.fontWeights.medium,
    fontFamily: theme.fonts.regular,
    color: theme.colors.textSecondary,
  },
  showMore: {
    fontFamily: theme.fonts.medium,
    color: theme.colors.primary,
    marginTop: theme.spacing.xs,
  },
  skeletonContainer: {
    paddingVertical: theme.spacing.xs,
  },
  skeleton: {
    height: theme.dimensions.skeletonHeight,
    backgroundColor: theme.colors.skeleton,
    borderRadius: theme.dimensions.skeletonHeight / 2,
  },
  skeletonShort: {
    width: '40%',
    marginBottom: theme.spacing.md,
  },
  skeletonLong: {
    width: '90%',
  },
});
