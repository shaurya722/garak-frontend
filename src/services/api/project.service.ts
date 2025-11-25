import { apiClient } from "./api-client";
import { apiConfig } from "@/config/api";
import {
  Project,
  ProjectResponse,
  ProjectListParams,
  CreateProjectPayload,
  UpdateProjectPayload,
} from "@/types";
import { handleApiError } from "@/lib/utils";


export const projectService = {

  async getList(params: ProjectListParams = {}): Promise<ProjectResponse> {
    try {
      const { page = 1, limit = 10 } = params;

      const response = await apiClient.post<{ data: ProjectResponse } | ProjectResponse>(
        `${apiConfig.endpoints.projectsList}?page=${page}&limit=${limit}`,
        {} 
      );

      // Handle both response formats: { data: ProjectResponse } or direct ProjectResponse
      const responseData = response.data;
      if (responseData && typeof responseData === 'object' && 'data' in responseData) {
        return responseData.data as ProjectResponse;
      }
      return responseData as ProjectResponse;
    } catch (error) {
      return handleApiError(error, "Get Projects List");
    }
  },


  async getDropdown(): Promise<{ projects: Project[] }> {
    try {
      const response = await apiClient.get<{ data: { projects: Project[] } }>(
        apiConfig.endpoints.projectsDropdown
      );

      return response.data.data;
    } catch (error) {
      return handleApiError(error, "Get Projects Dropdown");
    }
  },


  async getById(id: string): Promise<Project> {
    try {
      const response = await apiClient.get<{ data: { project: Project } }>(
        apiConfig.endpoints.getProject(id)
      );

      return response.data.data.project;
    } catch (error) {
      return handleApiError(error, "Get Project");
    }
  },


  async create(payload: CreateProjectPayload): Promise<Project> {
    try {
      const response = await apiClient.post<{ data: { project: Project } }>(
        apiConfig.endpoints.projectsCreate,
        payload
      );

      return response.data.data.project;
    } catch (error) {
      return handleApiError(error, "Create Project");
    }
  },


  async update(id: string, payload: UpdateProjectPayload): Promise<Project> {
    try {
      const response = await apiClient.put<{ data: { project: Project } }>(
        apiConfig.endpoints.updateProject(id),
        payload
      );

      return response.data.data.project;
    } catch (error) {
      return handleApiError(error, "Update Project");
    }
  },


  async delete(id: string): Promise<void> {
    try {
      await apiClient.delete(apiConfig.endpoints.deleteProject(id));
    } catch (error) {
      return handleApiError(error, "Delete Project");
    }
  },
};
