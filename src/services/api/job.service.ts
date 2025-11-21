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


export const jobService = {

  async getList(params: JobListParams = {}): Promise<JobResponse> {
    try {
      const { page = 1, limit = 10 } = params;

      const response = await apiClient.post<{ data: JobResponse }>(
        `${apiConfig.endpoints.jobsList}?page=${page}&limit=${limit}`,
        {} 
      );

      return response.data.data || response.data;
    } catch (error) {
      return handleApiError(error, "Get Jobs List");
    }
  },


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


  async delete(id: string): Promise<void> {
    try {
      await apiClient.delete(apiConfig.endpoints.deleteJob(id));
    } catch (error) {
      return handleApiError(error, "Delete Job");
    }
  },
};
