// src/hooks/use-projects.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectService } from '@/services/api';
import { queryKeys } from '@/lib/react-query';
import {
  Project,
  ProjectResponse,
  ProjectListParams,
  CreateProjectPayload,
  UpdateProjectPayload,
} from '@/types';
import { toast } from 'sonner';

export const useProjects = (params: ProjectListParams = {}) => {
  const { page = 1, limit = 10 } = params;

  return useQuery<ProjectResponse>({
    queryKey: queryKeys.projects.list(params as Record<string, unknown>),
    queryFn: () => projectService.getList(params),
    staleTime: 1000 * 60,
  });
};

export const useProject = (id: string) => {
  return useQuery<Project>({
    queryKey: queryKeys.projects.detail(id),
    queryFn: () => projectService.getById(id),
    enabled: !!id,
  });
};

export const useCreateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProjectPayload) =>
      projectService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
      toast.success('Project created successfully');
    },
    onError: (error) => {
      console.error('Project creation failed:', error);
      toast.error('Failed to create project');
    },
  });
};

export const useUpdateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & UpdateProjectPayload) =>
      projectService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
      toast.success('Project updated successfully');
    },
    onError: (error) => {
      console.error('Project update failed:', error);
      toast.error('Failed to update project');
    },
  });
};

export const useDeleteProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => projectService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
      toast.success('Project deleted successfully');
    },
    onError: (error) => {
      console.error('Project deletion failed:', error);
      toast.error('Failed to delete project');
    },
  });
};
