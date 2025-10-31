import api from '@/services/api/api-client';

const POLICY_BASE_URL = '/management/company/policy';

export const policyService = {
  getPolicies: async (params?: { page?: number; limit?: number }) => {
    const queryParams = params ? `?page=${params.page || 1}&limit=${params.limit || 10}` : '?page=1&limit=10';
    const response = await api.post(`${POLICY_BASE_URL}/list${queryParams}`);
    return response.data.data || response.data;
  },

  getPolicy: async (id: string) => {
    const response = await api.get(`${POLICY_BASE_URL}/${id}`);
    return response.data.data || response.data;
  },

  createPolicy: async (data: PolicyCreateData) => {
    const response = await api.post(`${POLICY_BASE_URL}/create`, data);
    return response.data.data || response.data;
  },

  updatePolicy: async (id: string, data: PolicyUpdateData) => {
    const response = await api.put(`${POLICY_BASE_URL}/${id}`, data);
    return response.data.data || response.data;
  },

  deletePolicy: async (id: string) => {
    await api.delete(`${POLICY_BASE_URL}/${id}`);
  },
};

export interface Policy {
  id: string;
  name: string;
  description: string;
  defaultDetector: boolean;
  categoryIds: string[] | null;
  detectorIds: string[] | null;
  categories?: Array<{
    id: string;
    name: string;
    description: string;
    category: string;
  }>;
  detectors?: Array<{
    id: string;
    detectorName: string;
    description: string;
    detectorType: string;
    creationType: string;
    confidence: number;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface PolicyCreateData {
  name: string;
  description: string;
  defaultDetector: boolean;
  categoryIds: string[] | null;
  detectorIds: string[] | null;
}

export type PolicyUpdateData = Partial<PolicyCreateData>;

export interface PolicyResponse {
  docs: Policy[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}