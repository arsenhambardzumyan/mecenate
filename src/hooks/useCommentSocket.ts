import { useEffect } from 'react';
import { useQueryClient, InfiniteData } from '@tanstack/react-query';
import { CommentsResponse, Comment, Post, PostsResponse } from '../types/api';

const WS_BASE_URL = 'wss://k8s.mectest.ru/test-app/ws';
const TEST_TOKEN = '550e8400-e29b-41d4-a716-446655440000';

export const useCommentSocket = (postId?: string) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    let socket: WebSocket | null = null;
    let reconnectTimeout: NodeJS.Timeout;

    const connect = () => {
      const wsUrl = `${WS_BASE_URL}?token=${TEST_TOKEN}`;
      socket = new WebSocket(wsUrl);

      socket.onopen = () => {
        console.log('connected to mecenate websocket');
      };

      socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);

          if (message.type === 'comment_added') {
            const { postId: eventPostId, comment: remoteComment } = message;

            if (postId && eventPostId !== postId) return;

            const newComment: Comment = {
              ...remoteComment,
              createdAt: remoteComment.createdAt || new Date().toISOString(),
            };

            queryClient.setQueryData<InfiniteData<CommentsResponse>>(
              ['comments', eventPostId],
              (oldData) => {
                if (!oldData) return oldData;

                        const alreadyExists = oldData.pages.some(page =>
                  page.data.comments.some(c => c.id === newComment.id)
                );
                
                if (alreadyExists) {
                                    return {
                    ...oldData,
                    pages: oldData.pages.map(page => ({
                      ...page,
                      data: {
                        ...page.data,
                        comments: page.data.comments.map(c => 
                          c.id === newComment.id ? newComment : c
                        )
                      }
                    }))
                  };
                }

                                const pages = [...oldData.pages];
                pages[0] = {
                  ...pages[0],
                  data: {
                    ...pages[0].data,
                    comments: [newComment, ...pages[0].data.comments],
                  },
                };

                return { ...oldData, pages };
              }
            );

                        queryClient.setQueriesData<{ ok: boolean; data: { post: Post } }>(
              { queryKey: ['post', eventPostId] },
              (oldPost) => {
                if (!oldPost) return oldPost;
                return {
                  ...oldPost,
                  data: {
                    ...oldPost.data,
                    post: {
                      ...oldPost.data.post,
                      commentsCount: oldPost.data.post.commentsCount + 1
                    }
                  }
                };
              }
            );
          }

                    if (message.type === 'like_updated') {
            const { postId: eventPostId, likesCount } = message;

                        queryClient.setQueriesData<{ ok: boolean; data: { post: Post } }>(
              { queryKey: ['post', eventPostId] },
              (oldPost) => {
                if (!oldPost) return oldPost;
                return {
                  ...oldPost,
                  data: {
                    ...oldPost.data,
                    post: {
                      ...oldPost.data.post,
                      likesCount: likesCount
                    }
                  }
                };
              }
            );

                        queryClient.setQueriesData<InfiniteData<PostsResponse>>(
              { queryKey: ['posts'] },
              (oldData) => {
                if (!oldData) return oldData;
                return {
                  ...oldData,
                  pages: oldData.pages.map(page => ({
                    ...page,
                    data: {
                      ...page.data,
                      posts: page.data.posts.map((p: Post) =>
                        p.id === eventPostId ? { ...p, likesCount } : p
                      )
                    }
                  }))
                };
              }
            );
          }
        } catch (e) {
          console.warn('WebSocket message error', e);
        }
      };

      socket.onclose = () => {
        reconnectTimeout = setTimeout(connect, 3000);
      };

      socket.onerror = (e) => {
        console.warn('WebSocket error', e);
      };
    };

    connect();

    return () => {
      if (socket) {
        socket.onclose = null;
        socket.close();
      }
      clearTimeout(reconnectTimeout);
    };
  }, [postId, queryClient]);
};

