import { useQuery } from '@tanstack/react-query';
import api from '@/services/api/api-client';
import { apiConfig } from '@/config/api';

const categoryService = {
  getCategories: async (params?: { page?: number; limit?: number }) => {
    const queryParams = params ? `?page=${params.page || 1}&limit=${params.limit || 10}` : '?page=1&limit=10';
    const response = await api.post(`${apiConfig.endpoints.categoriesList}${queryParams}`);
    return response.data.data || [];
  },
};
export const useCategories = (params?: { page?: number; limit?: number }) => {
  return useQuery({
    queryKey: ['categories', params],
    queryFn: () => categoryService.getCategories(params),
  });
};
