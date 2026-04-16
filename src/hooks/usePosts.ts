import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchPosts } from '../api/api';
import { PostsResponse } from '../types/api';

export const usePosts = (simulateError = false, tier?: string) => {
  return useInfiniteQuery<PostsResponse>({
    queryKey: ['posts', tier],
    queryFn: ({ pageParam }) => fetchPosts({ pageParam: pageParam as string, simulateError, tier }),
    getNextPageParam: (lastPage) => lastPage.data.nextCursor ?? undefined,
    initialPageParam: '',
  });
};
