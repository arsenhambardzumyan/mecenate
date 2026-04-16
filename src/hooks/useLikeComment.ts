import { uiStore } from '../store/uiStore';

export const useLikeComment = () => {
  const toggleCommentLike = (commentId: string) => {
    uiStore.toggleCommentLike(commentId);
  };

  return { toggleCommentLike };
};
