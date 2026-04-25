import { useMutation, useQueryClient, InfiniteData } from '@tanstack/react-query';
import { toggleLike } from '../api/api';
import { PostsResponse, Post, LikeResponse } from '../types/api';

export const useLikePost = () => {
  const queryClient = useQueryClient();

  return useMutation<LikeResponse, Error, string, { previousPosts?: InfiniteData<PostsResponse>; previousPost?: { ok: boolean; data: { post: Post } } }>({
    mutationFn: toggleLike,
    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: ['posts'] });
      await queryClient.cancelQueries({ queryKey: ['post', postId] });

      const previousPosts = queryClient.getQueryData<InfiniteData<PostsResponse>>(['posts']);
      const previousPost = queryClient.getQueryData<{ ok: boolean; data: { post: Post } }>(['post', postId]);

      queryClient.setQueriesData<InfiniteData<PostsResponse>>({ queryKey: ['posts'] }, (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            data: {
              ...page.data,
              posts: page.data.posts.map((post) =>
                post.id === postId
                  ? {
                      ...post,
                      isLiked: !post.isLiked,
                      likesCount: post.isLiked ? post.likesCount - 1 : post.likesCount + 1,
                    }
                  : post
              ),
            },
          })),
        };
      });

      queryClient.setQueryData<{ ok: boolean; data: { post: Post } }>(['post', postId], (old) => {
        if (!old) return old;
        return {
          ...old,
          data: {
            ...old.data,
            post: {
              ...old.data.post,
              isLiked: !old.data.post.isLiked,
              likesCount: old.data.post.isLiked ? old.data.post.likesCount - 1 : old.data.post.likesCount + 1,
            },
          },
        };
      });

      return { previousPosts, previousPost };
    },
    onError: (err, postId, context: { previousPosts?: InfiniteData<PostsResponse>; previousPost?: { ok: boolean; data: { post: Post } } } | undefined) => {
      if (context?.previousPosts) {
        queryClient.setQueriesData({ queryKey: ['posts'] }, context.previousPosts);
      }
      if (context?.previousPost) {
        queryClient.setQueryData(['post', postId], context.previousPost);
      }
    },
    onSettled: (data, error, postId) => {
      queryClient.invalidateQueries({ queryKey: ['post', postId] });
    },
  });
};
