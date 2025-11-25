import { apiClient } from "./api-client";
import { apiConfig } from "@/config/api";
import { LogResponse, LogListParams } from "@/types";
import { handleApiError } from "@/lib/utils";


export const logService = {

  async getList(params: LogListParams = {}): Promise<LogResponse> {
    try {
      const { page = 1, limit = 10, type = 'RED' } = params;

      const response = await apiClient.post<{ data: LogResponse }>(
        `${apiConfig.endpoints.logsList}?page=${page}&limit=${limit}`,
        { type }
      );

      return response.data.data || response.data;
    } catch (error) {
      return handleApiError(error, "Get Logs List");
    }
  },


  async getJobLogs(jobId: string, params: LogListParams = {}): Promise<LogResponse> {
    try {
      const { page = 1, limit = 10, type = 'RED' } = params;

      const response = await apiClient.post<{ data: LogResponse }>(
        `${apiConfig.endpoints.logsJob(jobId)}?page=${page}&limit=${limit}`,
        { type }
      );

      return response.data.data || response.data;
    } catch (error) {
      return handleApiError(error, "Get Job Logs");
    }
  },
};
