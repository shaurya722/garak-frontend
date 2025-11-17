import { useQuery } from '@tanstack/react-query';
import api from '@/services/api/api-client';

const PROBE_BASE_URL = '/management/company/probe';

const probeService = {
  getProbes: async (params?: { page?: number; limit?: number }) => {
    const queryParams = params ? `?page=${params.page || 1}&limit=${params.limit || 10}` : '?page=1&limit=10';
    const response = await api.post(`${PROBE_BASE_URL}/list${queryParams}`);
    return response.data.data || response.data;
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

export interface ProbeResponse {
  docs: Probe[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export const useProbes = (params?: { page?: number; limit?: number }) => {
  const { page = 1, limit = 10 } = params || {};

  return useQuery<ProbeResponse>({
    queryKey: ['probes', page, limit],
    queryFn: () => probeService.getProbes({ page, limit }),
    staleTime: 1000 * 60, // 10 seconds - data stays fresh for 10s
  });
};
