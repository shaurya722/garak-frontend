import api from '@/services/api/api-client';

const CATEGORY_BASE_URL = '/management/company/category';

export const categoryService = {
  getCategories: async (params?: { page?: number; limit?: number }) => {
    const queryParams = params ? `?page=${params.page || 1}&limit=${params.limit || 10}` : '?page=1&limit=10';
    const response = await api.post(`${CATEGORY_BASE_URL}/list${queryParams}`);
    return response.data.data || response.data;
  },

  getCategory: async (id: string) => {
    const response = await api.get(`${CATEGORY_BASE_URL}/${id}`);

    let result = response.data.data || response.data;

    if (result?.category) {
      result = result.category;
    }

    return result;
  },

  createCategory: async (data: CategoryCreateData) => {
    const response = await api.post(`${CATEGORY_BASE_URL}/create`, data);
    return response.data.data || response.data;
  },

  updateCategory: async (id: string, data: CategoryUpdateData) => {
    const response = await api.put(`${CATEGORY_BASE_URL}/${id}`, data);
    return response.data.data || response.data;
  },

  deleteCategory: async (id: string) => {
    await api.delete(`${CATEGORY_BASE_URL}/${id}`);
  },
};

export interface Probe {
  id: string;
  probeId: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryProbe {
  probeId: string;
  categoryId: string;
  probe: Probe;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  category: string | null;
  createdAt: string;
  updatedAt: string;
  probes: CategoryProbe[];
}

export interface CategoryCreateData {
  name: string;
  description: string;
  probes: string[];
}

export type CategoryUpdateData = Partial<CategoryCreateData>;

export interface CategoryResponse {
  docs: Category[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
