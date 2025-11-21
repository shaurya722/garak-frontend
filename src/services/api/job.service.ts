import { apiClient } from "./api-client";
import { apiConfig } from "@/config/api";
import {
  Job,
  JobResponse,
  JobListParams,
  CreateJobPayload,
  UpdateJobPayload,
} from "@/types";
import { handleApiError } from "@/lib/utils";

/**
 * Job Service
 * All API calls related to jobs
 */
export const jobService = {
  /**
   * Get list of jobs with pagination and filters
   */
  async getList(params: JobListParams = {}): Promise<JobResponse> {
    try {
      const { page = 1, limit = 10 } = params;

      const response = await apiClient.post<{ data: JobResponse }>(
        `${apiConfig.endpoints.jobsList}?page=${page}&limit=${limit}`,
        {} // Empty body as per the curl command
      );

      return response.data.data || response.data;
    } catch (error) {
      return handleApiError(error, "Get Jobs List");
    }
  },

  /**
   * Get job by ID
   */
  async getById(id: string): Promise<Job> {
    try {
      const response = await apiClient.get<{ data: { job: Job } }>(
        apiConfig.endpoints.getJob(id)
      );

      return response.data.data.job;
    } catch (error) {
      return handleApiError(error, "Get Job");
    }
  },

  /**
   * Create a new job
   */
  async create(payload: CreateJobPayload): Promise<Job> {
    try {
      const response = await apiClient.post<{ data: { job: Job } }>(
        apiConfig.endpoints.jobsCreate,
        payload
      );

      return response.data.data.job;
    } catch (error) {
      return handleApiError(error, "Create Job");
    }
  },

  /**
   * Update an existing job
   */
  async update(id: string, payload: UpdateJobPayload): Promise<Job> {
    try {
      const response = await apiClient.put<{ data: { job: Job } }>(
        apiConfig.endpoints.updateJob(id),
        payload
      );

      return response.data.data.job;
    } catch (error) {
      return handleApiError(error, "Update Job");
    }
  },

  /**
   * Delete a job
   */
  async delete(id: string): Promise<void> {
    try {
      await apiClient.delete(apiConfig.endpoints.deleteJob(id));
    } catch (error) {
      return handleApiError(error, "Delete Job");
    }
  },
};
