import { apiClient } from "./api-client";
import { apiConfig } from "@/config/api";
import { 
  Detector, 
  DetectorResponse, 
  DetectorListParams,
  CreateDetectorPayload,
  UpdateDetectorPayload,
} from "@/types";
import { handleApiError } from "@/lib/utils";


export const detectorService = {

  async getList(params: DetectorListParams = {}): Promise<DetectorResponse> {
    try {
      const { page = 1, limit = 10, creationType } = params;
      
      const body = creationType ? { creationType } : {};
      
      const response = await apiClient.post<{ data: DetectorResponse } | DetectorResponse>(
        `${apiConfig.endpoints.detectorsList}?page=${page}&limit=${limit}`,
        body
      );

      // Handle both response formats: { data: DetectorResponse } or direct DetectorResponse
      const responseData = response.data;
      if (responseData && typeof responseData === 'object' && 'data' in responseData) {
        return responseData.data as DetectorResponse;
      }
      return responseData as DetectorResponse;
    } catch (error) {
      return handleApiError(error, "Get Detectors List");
    }
  },


  async getById(id: string): Promise<Detector> {
    try {
      const response = await apiClient.get<{ data: { detector: Detector } } | Detector>(
        apiConfig.endpoints.getDetector(id)
      );

      const responseData = response.data;
      if (responseData && typeof responseData === 'object' && 'data' in responseData && responseData.data && 'detector' in responseData.data) {
        return responseData.data.detector as Detector;
      }
      return responseData as Detector;
    } catch (error) {
      return handleApiError(error, "Get Detector");
    }
  },


  async getTypes(): Promise<string[]> {
    try {
      const response = await apiClient.get<{ data: { detectorTypes: string[] } }>(
        apiConfig.endpoints.detectorsTypes
      );

      return response.data.data?.detectorTypes || [];
    } catch (error) {
      return handleApiError(error, "Get Detector Types");
    }
  },


  async getBuiltin(params: DetectorListParams = {}): Promise<DetectorResponse> {
    try {
      const { page = 1, limit = 10 } = params;
      
      const response = await apiClient.post<{ data: DetectorResponse } | DetectorResponse>(
        `${apiConfig.endpoints.detectorsBuiltin}?page=${page}&limit=${limit}`,
        { creationType: "BuiltIn" }
      );

      // Handle both response formats: { data: DetectorResponse } or direct DetectorResponse
      const responseData = response.data;
      if (responseData && typeof responseData === 'object' && 'data' in responseData) {
        return responseData.data as DetectorResponse;
      }
      return responseData as DetectorResponse;
    } catch (error) {
      return handleApiError(error, "Get Built-in Detectors");
    }
  },


  async create(payload: CreateDetectorPayload): Promise<Detector> {
    try {
      const response = await apiClient.post<{ data: Detector } | Detector>(
        apiConfig.endpoints.detectorsCreate,
        payload
      );

      const responseData = response.data;
      if (responseData && typeof responseData === 'object' && 'data' in responseData) {
        return responseData.data as Detector;
      }
      return responseData as Detector;
    } catch (error) {
      return handleApiError(error, "Create Detector");
    }
  },


  async update(id: string, payload: UpdateDetectorPayload): Promise<Detector> {
    try {
      const response = await apiClient.put<{ data: Detector } | Detector>(
        apiConfig.endpoints.updateDetector(id),
        payload
      );

      const responseData = response.data;
      if (responseData && typeof responseData === 'object' && 'data' in responseData) {
        return responseData.data as Detector;
      }
      return responseData as Detector;
    } catch (error) {
      return handleApiError(error, "Update Detector");
    }
  },


  async delete(id: string): Promise<void> {
    try {
      await apiClient.delete(apiConfig.endpoints.deleteDetector(id));
    } catch (error) {
      return handleApiError(error, "Delete Detector");
    }
  },


  async test(id: string, testData: Record<string, unknown>): Promise<unknown> {
    try {
      const response = await apiClient.post(
        apiConfig.endpoints.detectorsTest,
        { detectorId: id, ...testData }
      );

      return response.data;
    } catch (error) {
      return handleApiError(error, "Test Detector");
    }
  },
};
