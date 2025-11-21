import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { jobService } from '@/services/api';
import { queryKeys } from '@/lib/react-query';
import {
  Job,
  JobResponse,
  JobListParams,
  CreateJobPayload,
  UpdateJobPayload,
} from '@/types';
import { toast } from 'sonner';

export const useJobs = (params: JobListParams = {}) => {
  const { page = 1, limit = 10 } = params;

  return useQuery<JobResponse>({
    queryKey: queryKeys.jobs.list(params as Record<string, unknown>),
    queryFn: () => jobService.getList(params),
    staleTime: 1000 * 60,
  });
};

export const useJob = (id: string) => {
  return useQuery<Job>({
    queryKey: queryKeys.jobs.detail(id),
    queryFn: () => jobService.getById(id),
    enabled: !!id,
  });
};

export const useCreateJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateJobPayload) =>
      jobService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.all });
      toast.success('Job created successfully');
    },
    onError: (error) => {
      console.error('Job creation failed:', error);
      toast.error('Failed to create job');
    },
  });
};

export const useUpdateJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & UpdateJobPayload) =>
      jobService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.all });
      toast.success('Job updated successfully');
    },
    onError: (error) => {
      console.error('Job update failed:', error);
      toast.error('Failed to update job');
    },
  });
};

export const useDeleteJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => jobService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.all });
      toast.success('Job deleted successfully');
    },
    onError: (error) => {
      console.error('Job deletion failed:', error);
      toast.error('Failed to delete job');
    },
  });
};
