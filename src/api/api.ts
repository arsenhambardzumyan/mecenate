import axios from 'axios';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://k8s.mectest.ru/test-app';
const TEST_TOKEN = process.env.EXPO_PUBLIC_API_TOKEN || '550e8400-e29b-41d4-a716-446655440000';

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    Authorization: `Bearer ${TEST_TOKEN}`,
  },
});

export const fetchPosts = async ({
  pageParam = '',
  simulateError = false,
  tier,
}: {
  pageParam?: string;
  simulateError?: boolean;
  tier?: string;
}) => {
  const response = await api.get('/posts', {
    params: {
      cursor: pageParam,
      limit: 10,
      simulate_error: simulateError,
      tier,
    },
  });
  return response.data;
};

export const toggleLike = async (postId: string) => {
  const response = await api.post(`/posts/${postId}/like`);
  return response.data;
};
