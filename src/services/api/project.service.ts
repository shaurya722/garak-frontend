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

/**
 * Project Service
 * All API calls related to projects
 */
export const projectService = {
  /**
   * Get list of projects with pagination and filters
   */
  async getList(params: ProjectListParams = {}): Promise<ProjectResponse> {
    try {
      const { page = 1, limit = 10 } = params;

      const response = await apiClient.post<{ data: ProjectResponse }>(
        `${apiConfig.endpoints.projectsList}?page=${page}&limit=${limit}`,
        {} // Empty body as per the curl command
      );

      return response.data.data || response.data;
    } catch (error) {
      return handleApiError(error, "Get Projects List");
    }
  },

  /**
   * Get project by ID
   */
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

  /**
   * Create a new project
   */
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

  /**
   * Update an existing project
   */
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

  /**
   * Delete a project
   */
  async delete(id: string): Promise<void> {
    try {
      await apiClient.delete(apiConfig.endpoints.deleteProject(id));
    } catch (error) {
      return handleApiError(error, "Delete Project");
    }
  },
};
