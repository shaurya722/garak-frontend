// src/hooks/use-logs.ts
import { useQuery } from '@tanstack/react-query';
import { logService } from '@/services/api';
import { queryKeys } from '@/lib/react-query';
import { LogResponse, LogListParams } from '@/types';

export const useLogs = (params: LogListParams = {}) => {
  const { page = 1, limit = 10 } = params;

  return useQuery<LogResponse>({
    queryKey: queryKeys.logs.list(params as Record<string, unknown>),
    queryFn: () => logService.getList(params),
    staleTime: 1000 * 60,
  });
};

export const useJobLogs = (jobId: string, params: LogListParams = {}) => {
  const { page = 1, limit = 10 } = params;

  return useQuery<LogResponse>({
    queryKey: queryKeys.logs.jobLogs(jobId, params as Record<string, unknown>),
    queryFn: () => logService.getJobLogs(jobId, params),
    enabled: !!jobId,
    staleTime: 1000 * 60,
  });
};
