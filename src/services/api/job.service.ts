import { apiClient } from "./api-client";
import { apiConfig } from "@/config/api";
import {
  Job,
  JobResponse,
  JobListParams,
  CreateJobPayload,
  UpdateJobPayload,
  JobReportResponse,
  JobReportParams,
} from "@/types";
import { handleApiError } from "@/lib/utils";


export const jobService = {

  async getDropdown(): Promise<{ jobs: Job[] }> {
    try {
      const response = await apiClient.get<{ data: { jobs: Job[] } }>(
        apiConfig.endpoints.jobsDropdown
      );

      return response.data.data;
    } catch (error) {
      return handleApiError(error, "Get Jobs Dropdown");
    }
  },

  async getList(params: JobListParams = {}): Promise<JobResponse> {
    try {
      const { page = 1, limit = 10 } = params;

      const response = await apiClient.post<{ data: JobResponse } | JobResponse>(
        `${apiConfig.endpoints.jobsList}?page=${page}&limit=${limit}`,
        {} 
      );

      // Handle both response formats: { data: JobResponse } or direct JobResponse
      const responseData = response.data;
      if (responseData && typeof responseData === 'object' && 'data' in responseData) {
        return responseData.data as JobResponse;
      }
      return responseData as JobResponse;
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

  async getJobReport(id: string, params: JobReportParams): Promise<JobReportResponse> {
    try {
      const response = await apiClient.get<JobReportResponse>(
        apiConfig.endpoints.getJobReport(id, params.month, params.year)
      );

      return response.data;
    } catch (error) {
      return handleApiError(error, "Get Job Report");
    }
  },
};
