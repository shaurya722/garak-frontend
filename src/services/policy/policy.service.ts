import api from '@/services/api/api-client';
import { Policy, PolicyCreateData, PolicyUpdateData } from '@/types/policies.type';

const POLICY_BASE_URL = '/management/company/policy';

export const policyService = {
  getPolicies: async (params?: { page?: number; limit?: number }) => {
    const queryParams = params ? `?page=${params.page || 1}&limit=${params.limit || 10}` : '?page=1&limit=10';
    const response = await api.post(`${POLICY_BASE_URL}/list${queryParams}`);
    return response.data.data || response.data;
  },

  getPolicyDropdown: async () => {
    const response = await api.get(`${POLICY_BASE_URL}/dropdown`);
    return response.data.data?.policies || response.data.policies || [];
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

export interface PolicyResponse {
  docs: Policy[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}