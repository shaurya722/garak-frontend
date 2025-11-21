import { apiClient } from "./api-client";
import { apiConfig } from "@/config/api";
import { Log, LogResponse, LogListParams } from "@/types";
import { handleApiError } from "@/lib/utils";

/**
 * Log Service
 * All API calls related to logs
 */
export const logService = {
  /**
   * Get list of logs with pagination
   */
  async getList(params: LogListParams = {}): Promise<LogResponse> {
    try {
      const { page = 1, limit = 10 } = params;

      const response = await apiClient.post<{ data: LogResponse }>(
        `${apiConfig.endpoints.logsList}?page=${page}&limit=${limit}`,
        {} // Empty body as per the curl command
      );

      return response.data.data || response.data;
    } catch (error) {
      return handleApiError(error, "Get Logs List");
    }
  },

  /**
   * Get logs for a specific job
   */
  async getJobLogs(jobId: string, params: LogListParams = {}): Promise<LogResponse> {
    try {
      const { page = 1, limit = 10 } = params;

      const response = await apiClient.post<{ data: LogResponse }>(
        `${apiConfig.endpoints.logsJob(jobId)}?page=${page}&limit=${limit}`,
        {} // Empty body as per the curl command
      );

      return response.data.data || response.data;
    } catch (error) {
      return handleApiError(error, "Get Job Logs");
    }
  },
};
