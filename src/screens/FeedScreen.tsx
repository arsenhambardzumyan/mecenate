import React, { useState } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { observer } from 'mobx-react-lite';
import { usePosts } from '../hooks/usePosts';
import { PublicationCard } from '../components/PublicationCard';
import { theme } from '../theme/theme';
import { uiStore } from '../store/uiStore';
import { FilterBar, FilterType } from '../components/FilterBar';
import { useCommentSocket } from '../hooks/useCommentSocket';

export const FeedScreen: React.FC = observer(() => {
  const [selectedTier, setSelectedTier] = useState<FilterType>('all');
  useCommentSocket();
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = usePosts(uiStore.simulateError, selectedTier === 'all' ? undefined : selectedTier);

  const posts = data?.pages.flatMap((page) => page.data.posts) ?? [];

  const handleRefresh = () => {
    uiStore.setSimulateError(false);
    refetch();
  };

  const handleRetry = () => {
    uiStore.setSimulateError(false);
    refetch();
  };

  if (isLoading && !isRefetching) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Не удалось загрузить публикации</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
          <Text style={styles.retryText}>Повторить</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FilterBar selected={selectedTier} onSelect={setSelectedTier} />
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <PublicationCard post={item} />}
        contentContainerStyle={styles.listContent}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={handleRefresh} tintColor={theme.colors.primary} />
        }
        ListFooterComponent={() =>
          isFetchingNextPage ? (
            <ActivityIndicator style={styles.footerLoader} color={theme.colors.primary} />
          ) : null
        }
        ListEmptyComponent={() => (
          <View style={styles.center}>
            <Text style={styles.emptyText}>По вашему запросу ничего не найдено</Text>
          </View>
        )}
      />
      <TouchableOpacity
        style={styles.errorSimButton}
        onPress={() => {
          uiStore.setSimulateError(true);
          refetch();
        }}
      >
        <Text style={styles.errorSimText}>Simulate Error</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  listContent: {
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.xxl,
  },
  center: {
    flex: theme.dimensions.flex1,
    justifyContent: theme.layout.center,
    alignItems: theme.layout.center,
  },
  footer: {
    paddingVertical: theme.spacing.md,
  },
  errorContainer: {
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  errorText: {
    fontSize: theme.fontSizes.xl,
    color: theme.colors.error,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  retryText: {
    color: theme.colors.white,
    fontFamily: theme.fonts.bold,
  },
  emptyText: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.textSecondary,
  },
  footerLoader: {
    marginVertical: theme.spacing.md,
  },
  errorSimButton: {
    position: 'absolute',
    bottom: theme.spacing.xl,
    right: theme.spacing.xl,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
  },
  errorSimText: {
    color: theme.colors.white,
    fontSize: theme.fontSizes.xs,
  },
});
