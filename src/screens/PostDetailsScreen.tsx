import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Image,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { ArrowLeft, Send } from 'lucide-react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import { usePost, useComments, useAddCommentMutation } from '../hooks/postDetails';
import { CommentItem } from '../components/CommentItem';
import { AuthorInfo } from '../components/AuthorInfo';
import { InteractionBar } from '../components/InteractionBar';
import { theme } from '../theme/theme';
import { PaidContentPlaceholder } from '../components/PaidContentPlaceholder';
import { useLikePost } from '../hooks/useLikePost';
import { useCommentSocket } from '../hooks/useCommentSocket';
import {Post, Comment} from "../types/api";


interface PostHeaderProps {
  post: Post;
  isPaid: boolean;
}

const PostHeader = React.memo(({ post, isPaid }: PostHeaderProps) => (
  <View>
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
      <AuthorInfo author={post.author} date={post.createdAt} avatarSize={36} />
      <View style={styles.textContent}>
        {isPaid ? (
          <View style={styles.skeletonContainer}>
            <View style={[styles.skeleton, styles.skeletonShort]} />
            <View style={[styles.skeleton, styles.skeletonLong]} />
          </View>
        ) : (
          <>
            <Text style={styles.title}>{post.title}</Text>
            <Text style={styles.body}>{post.body || post.preview}</Text>
          </>
        )}
      </View>
    </View>
  </View>
));

interface InteractionSectionProps {
  post: Post;
  isPaid: boolean;
  onLikePress: () => void;
  onSortPress: () => void;
  sortOrder: 'newest' | 'oldest';
}

const InteractionSection = React.memo(({ post, isPaid, onLikePress, onSortPress, sortOrder }: InteractionSectionProps) => {
  if (isPaid) return null;
  return (
    <View>
      <InteractionBar
        likesCount={post.likesCount}
        commentsCount={post.commentsCount}
        isLiked={post.isLiked}
        onLikePress={onLikePress}
      />
      <View style={styles.divider} />
      <View style={styles.commentsHeader}>
        <Text style={styles.sectionTitle}>Комментарии ({post.commentsCount})</Text>
        <TouchableOpacity onPress={onSortPress}>
          <Text style={styles.sortToggle}>
            {sortOrder === 'newest' ? 'Сначала новые' : 'Сначала старые'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});

interface CommentInputProps {
  postId: string;
  onSuccess: () => void;
}

const CommentInput = React.memo(({ postId, onSuccess }: CommentInputProps) => {
  const [text, setText] = React.useState('');
  const addCommentMutation = useAddCommentMutation(postId);

  const handleSubmit = () => {
    if (!text.trim() || addCommentMutation.isPending) return;
    addCommentMutation.mutate(text, {
      onSuccess: () => {
        setText('');
        onSuccess();
      },
    });
  };

  return (
    <View style={styles.commentInputWrapper}>
      <View style={styles.commentInputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Ваш комментарий..."
          placeholderTextColor={theme.colors.textTertiary}
          value={text}
          onChangeText={setText}
          multiline
        />
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={!text.trim() || addCommentMutation.isPending}
          style={styles.sendButton}
        >
          <Send
            size={20}
            color={text.trim() ? theme.colors.primary : theme.colors.textTertiary}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
});


type PostDetailsRouteProp = RouteProp<RootStackParamList, 'PostDetails'>;

export const PostDetailsScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<PostDetailsRouteProp>();
  const { postId } = route.params;
  const [sortOrder, setSortOrder] = React.useState<'newest' | 'oldest'>('newest');

  const { data: postData, isLoading: postLoading } = usePost(postId);
  const {
    data: commentsData,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage
  } = useComments(postId, sortOrder);

  const { mutate: toggleLike } = useLikePost();
  useCommentSocket(postId);

  const handleLike = React.useCallback(() => {
    if (postData?.data.post.id) {
      toggleLike(postData.data.post.id);
    }
  }, [postData?.data.post.id, toggleLike]);

  const toggleSort = React.useCallback(() => {
    setSortOrder(prev => prev === 'newest' ? 'oldest' : 'newest');
  }, []);

  const renderComment = React.useCallback(({ item }: { item: Comment }) => (
    <CommentItem comment={item} />
  ), []);

  const rawComments = commentsData?.pages.flatMap(p => p.data.comments) ?? [];
  const comments = React.useMemo(() => {
    const getTime = (dateStr: string) => {
      const d = new Date(dateStr).getTime();
      return isNaN(d) ? 0 : d;
    };

        const uniqueMap = new Map();
    rawComments.forEach(c => {
      const existing = uniqueMap.get(c.id);
            if (!existing || getTime(c.createdAt) > getTime(existing.createdAt)) {
        uniqueMap.set(c.id, c);
      }
    });

    return Array.from(uniqueMap.values()).sort((a, b) => {
      const timeA = getTime(a.createdAt);
      const timeB = getTime(b.createdAt);
      if (timeA !== timeB) {
        return sortOrder === 'newest' ? timeB - timeA : timeA - timeB;
      }
      return sortOrder === 'newest' ? b.id.localeCompare(a.id) : a.id.localeCompare(b.id);
    });
  }, [rawComments, sortOrder]);

  if (postLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  const post = postData?.data.post;

  if (!post) return null;

  const isPaid = post.tier === 'paid';

  return (
    <View style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <ArrowLeft size={theme.fontSizes.xl} color={theme.colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Image source={{ uri: post.author.avatarUrl }} style={styles.headerAvatar} />
            <Text style={styles.headerName} numberOfLines={theme.dimensions.flex1}>{post.author.displayName}</Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
          <FlatList
            data={isPaid ? [] : comments}
            keyExtractor={(item) => item.id}
            renderItem={renderComment}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: theme.spacing.lg, paddingBottom: theme.spacing.xl }}
            ListHeaderComponent={
              <View>
                <PostHeader post={post} isPaid={isPaid} />
                <InteractionSection
                  post={post}
                  isPaid={isPaid}
                  onLikePress={handleLike}
                  onSortPress={toggleSort}
                  sortOrder={sortOrder}
                />
              </View>
            }

            onEndReached={() => {
              if (hasNextPage && !isFetchingNextPage) fetchNextPage();
            }}
            ListFooterComponent={
              isFetchingNextPage || (isFetching && comments.length === 0) ? (
                <ActivityIndicator style={{ margin: theme.spacing.lg }} color={theme.colors.primary} />
              ) : null
            }
          />
          <View style={{ padding: theme.spacing.lg, paddingBottom: theme.spacing.xxl }}>
          {!isPaid && <CommentInput postId={postId} onSuccess={() => {}} />}
          </View>
        </KeyboardAvoidingView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: theme.dimensions.flex1,
    backgroundColor: theme.colors.card,
    paddingTop: Platform.OS === 'ios' ? theme.layout.paddingIOS : theme.dimensions.zero,
  },
  container: {
    flex: theme.dimensions.flex1,
    backgroundColor: theme.colors.card,
  },
  header: {
    height: theme.layout.headerHeight,
    flexDirection: theme.layout.row,
    alignItems: theme.layout.center,
    paddingHorizontal: theme.spacing.sm,
    borderBottomWidth: theme.dimensions.borderWidth,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    width: theme.dimensions.iconContainer,
    height: theme.dimensions.iconContainer,
    justifyContent: theme.layout.center,
    alignItems: theme.layout.center,
  },
  headerContent: {
    flex: theme.dimensions.flex1,
    flexDirection: theme.layout.row,
    alignItems: theme.layout.center,
    justifyContent: theme.layout.center,
  },
  headerAvatar: {
    width: theme.dimensions.avatarSm,
    height: theme.dimensions.avatarSm,
    borderRadius: theme.dimensions.avatarSm / 2,
    marginRight: theme.spacing.sm,
  },
  headerName: {
    fontSize: theme.fontSizes.xl,
    fontFamily: theme.fonts.semibold,
    color: theme.colors.textPrimary,
  },
  center: {
    flex: theme.dimensions.flex1,
    justifyContent: theme.layout.center,
    alignItems: theme.layout.center,
  },
  imageContainer: {
    width: theme.layout.fullWidth,
    aspectRatio: theme.dimensions.aspectRatio1,
  },
  cover: {
    width: theme.layout.fullWidth,
    height: theme.layout.fullHeight,
  },
  content: {
    backgroundColor: theme.colors.card,
  },
  textContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  title: {
    fontSize: theme.fontSizes.xxxl,
    lineHeight: theme.lineHeights.xxl,
    fontFamily: theme.fonts.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  body: {
    fontSize: theme.fontSizes.lg,
    lineHeight: theme.lineHeights.xl,
    fontFamily: theme.fonts.regular,
    color: theme.colors.textSecondary,
  },
  divider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
    marginHorizontal: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.fontSizes.xl,
    fontFamily: theme.fonts.bold,
    color: theme.colors.textPrimary,
  },
  commentsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  sortToggle: {
    fontSize: theme.fontSizes.sm,
    fontFamily: theme.fonts.medium,
    color: theme.colors.primary,
  },
  commentInputWrapper: {
    backgroundColor: theme.colors.card,
    borderTopWidth: theme.dimensions.borderWidth,
    borderTopColor: theme.colors.border,
    padding: theme.spacing.md,
    paddingBottom: Platform.OS === 'ios' ? theme.spacing.xl : theme.spacing.md,
  },
  commentInputContainer: {
    flexDirection: theme.layout.row,
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.md,
    minHeight: 44,
  },
  input: {
    flex: theme.dimensions.flex1,
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSizes.md,
    color: theme.colors.textPrimary,
    paddingVertical: theme.spacing.sm,
  },
  sendButton: {
    marginLeft: theme.spacing.sm,
    padding: theme.spacing.xs,
  },
  headerSpacer: {
    width: theme.spacing.xxxl,
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
