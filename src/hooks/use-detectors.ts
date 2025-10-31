import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { detectorService } from "@/services/api";
import { queryKeys } from "@/lib/react-query";
import { 
  DetectorListParams, 
  CreateDetectorPayload, 
  UpdateDetectorPayload,
  Detector,
} from "@/types";
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from "@/constants";
import { getErrorMessage } from "@/lib/utils";

/**
 * Hook to fetch detectors list
 */
export function useDetectors(params: DetectorListParams = {}) {
  return useQuery({
    queryKey: queryKeys.detectors.list(params as Record<string, unknown>),
    queryFn: () => detectorService.getList(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to fetch a single detector by ID
 */
export function useDetector(id: string) {
  return useQuery({
    queryKey: queryKeys.detectors.detail(id),
    queryFn: () => detectorService.getById(id),
    enabled: !!id,
  });
}

/**
 * Hook to fetch detector types
 */
export function useDetectorTypes() {
  return useQuery({
    queryKey: queryKeys.detectors.types(),
    queryFn: () => detectorService.getTypes(),
    staleTime: 1000 * 60 * 30, // 30 minutes - rarely changes
  });
}

/**
 * Hook to fetch built-in detectors
 */
export function useBuiltinDetectors(params: DetectorListParams = {}) {
  return useQuery({
    queryKey: queryKeys.detectors.builtin(),
    queryFn: () => detectorService.getBuiltin(params),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

/**
 * Hook to create a new detector
 */
export function useCreateDetector() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateDetectorPayload) => 
      detectorService.create(payload),
    onSuccess: () => {
      // Invalidate and refetch detectors list
      queryClient.invalidateQueries({ queryKey: queryKeys.detectors.lists() });
      toast.success(SUCCESS_MESSAGES.DETECTOR_CREATED);
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error(message || ERROR_MESSAGES.DETECTOR_CREATE_FAILED);
    },
  });
}

/**
 * Hook to update an existing detector
 */
export function useUpdateDetector() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateDetectorPayload }) => 
      detectorService.update(id, payload),
    onSuccess: (data, variables) => {
      // Invalidate lists and update specific detector cache
      queryClient.invalidateQueries({ queryKey: queryKeys.detectors.lists() });
      queryClient.setQueryData(queryKeys.detectors.detail(variables.id), data);
      toast.success(SUCCESS_MESSAGES.DETECTOR_UPDATED);
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error(message || ERROR_MESSAGES.DETECTOR_UPDATE_FAILED);
    },
  });
}

/**
 * Hook to delete a detector
 */
export function useDeleteDetector() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => detectorService.delete(id),
    onSuccess: (_, deletedId) => {
      // Invalidate lists and remove from cache
      queryClient.invalidateQueries({ queryKey: queryKeys.detectors.lists() });
      queryClient.removeQueries({ queryKey: queryKeys.detectors.detail(deletedId) });
      toast.success(SUCCESS_MESSAGES.DETECTOR_DELETED);
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error(message || ERROR_MESSAGES.DETECTOR_DELETE_FAILED);
    },
  });
}

/**
 * Hook to prefetch detector details (useful for hover states)
 */
export function usePrefetchDetector() {
  const queryClient = useQueryClient();

  return (id: string) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.detectors.detail(id),
      queryFn: () => detectorService.getById(id),
    });
  };
}
