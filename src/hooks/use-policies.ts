// src/hooks/use-policies.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { policyService, PolicyResponse, Policy } from '@/services/policy/policy.service';
import { toast } from 'sonner';

export const usePolicies = (params?: { page?: number; limit?: number }) => {
  const { page = 1, limit = 10 } = params || {};

  return useQuery<PolicyResponse>({
    queryKey: ['policies', page, limit],
    queryFn: () => policyService.getPolicies({ page, limit }),
    staleTime: 1000 * 60, // 10 seconds - data stays fresh for 10s
  });
};

export const usePolicy = (id: string) => {
  return useQuery<Policy>({
    queryKey: ['policy', id],
    queryFn: () => policyService.getPolicy(id),
    enabled: !!id,
  });
};

export const useCreatePolicy = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Parameters<typeof policyService.createPolicy>[0]) => 
      policyService.createPolicy(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['policies'], exact: false });
      toast.success('Policy created successfully');
    },
    onError: (error) => {
      console.error('Policy creation failed:', error);
      toast.error('Failed to create policy');
    },
  });
};

export const useUpdatePolicy = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Parameters<typeof policyService.updatePolicy>[1]) =>
      policyService.updatePolicy(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['policies'], exact: false });
      toast.success('Policy updated successfully');
    },
    onError: (error) => {
      console.error('Policy update failed:', error);
      toast.error('Failed to update policy');
    },
  });
};

export const useDeletePolicy = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => policyService.deletePolicy(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['policies'], exact: false });
      toast.success('Policy deleted successfully');
    },
  });
};