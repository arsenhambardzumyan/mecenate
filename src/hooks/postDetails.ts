import { useQuery, useInfiniteQuery, useMutation, useQueryClient, InfiniteData } from '@tanstack/react-query';
import { api } from '../api/api';
import { Post, CommentsResponse, Comment } from '../types/api';

type AddCommentApiResponse =
  | { ok: boolean; data?: { comment?: Comment } }
  | { data?: { comment?: Comment } }
  | { comment?: Comment }
  | unknown;

export const usePost = (postId: string) => {
  return useQuery<{ ok: boolean; data: { post: Post } }>({
    queryKey: ['post', postId],
    queryFn: async () => {
      const response = await api.get(`/posts/${postId}`);
      return response.data;
    },
  });
};

export const useComments = (postId: string, sortOrder: 'newest' | 'oldest' = 'newest') => {
  return useInfiniteQuery<CommentsResponse>({
    queryKey: ['comments', postId, sortOrder],
    queryFn: async ({ pageParam }) => {
      const response = await api.get(`/posts/${postId}/comments`, {
        params: { 
          cursor: pageParam, 
          limit: 10,
          order: sortOrder === 'newest' ? 'desc' : 'asc'
        },
      });
      return response.data;
    },
    getNextPageParam: (lastPage) => lastPage.data.nextCursor ?? undefined,
    initialPageParam: '',
  });
};

export const useAddCommentMutation = (postId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (text: string) => {
      const response = await api.post(`/posts/${postId}/comments`, { text });
      return response.data;
    },
    onMutate: async (text: string) => {
      await queryClient.cancelQueries({ queryKey: ['comments', postId] });
      await queryClient.cancelQueries({ queryKey: ['post', postId] });

      const prevComments = queryClient.getQueriesData<InfiniteData<CommentsResponse>>({
        queryKey: ['comments', postId],
      });
      const prevPost = queryClient.getQueryData<{ ok: boolean; data: { post: Post } }>(['post', postId]);
      
      const author = prevPost?.data.post.author || {
        id: 'me',
        username: 'me',
        displayName: 'Вы',
        avatarUrl: 'https://s3.regru.cloud/mecenate-test-picture/pic2.jpeg',
        isVerified: false,
        subscribersCount: 0
      };

      const optimisticComment: Comment = {
        id: `temp-${Date.now()}`,
        postId,
        author,
        text,
        createdAt: new Date().toISOString(),
        likesCount: 0,
        isLiked: false,
      };

      queryClient.setQueriesData<InfiniteData<CommentsResponse>>({ queryKey: ['comments', postId] }, (old) => {
        if (!old) return old;
        const newPages = [...old.pages];
        if (newPages[0]) {
          newPages[0] = {
            ...newPages[0],
            data: {
              ...newPages[0].data,
              comments: [optimisticComment, ...newPages[0].data.comments],
            },
          };
        }
        return { ...old, pages: newPages };
      });

      queryClient.setQueryData<{ ok: boolean; data: { post: Post } }>(['post', postId], (old) => {
        if (!old) return old;
        return {
          ...old,
          data: {
            ...old.data,
            post: { ...old.data.post, commentsCount: old.data.post.commentsCount + 1 }
          }
        };
      });

      return { prevComments, prevPost, optimisticId: optimisticComment.id };
    },
    onSuccess: (response: AddCommentApiResponse, _text, context) => {
      const r = response as any;
      const realComment: Comment | undefined =
        r?.data?.comment ?? r?.comment ?? r?.data?.data?.comment ?? r?.data ?? undefined;

      if (!realComment) {
        // If we can't extract a comment, force-sync from server.
        queryClient.invalidateQueries({ queryKey: ['comments', postId] });
        queryClient.invalidateQueries({ queryKey: ['post', postId] });
        return;
      }

      queryClient.setQueriesData<InfiniteData<CommentsResponse>>({ queryKey: ['comments', postId] }, (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map(page => ({
            ...page,
            data: {
              ...page.data,
              comments: page.data.comments.map(c =>
                c.id === context?.optimisticId ? realComment : c
              ),
            },
          })),
        };
      });
    },
    onError: (_err, _text, context) => {
      if (context?.prevComments?.length) {
        for (const [key, data] of context.prevComments) {
          queryClient.setQueryData(key, data);
        }
      }
      if (context?.prevPost) {
        queryClient.setQueryData(['post', postId], context.prevPost);
      }
    },
    onSettled: () => {
      // Ensure eventual consistency with WS/server.
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
      queryClient.invalidateQueries({ queryKey: ['post', postId] });
    }
  });
};
