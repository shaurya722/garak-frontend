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

/**
 * Detector Service
 * All API calls related to detectors
 */
export const detectorService = {
  /**
   * Get list of detectors with pagination and filters
   */
  async getList(params: DetectorListParams = {}): Promise<DetectorResponse> {
    try {
      const { page = 1, limit = 10, creationType } = params;
      
      const body = creationType ? { creationType } : {};
      
      const response = await apiClient.post<{ data: DetectorResponse }>(
        `${apiConfig.endpoints.detectorsList}?page=${page}&limit=${limit}`,
        body
      );

      return response.data.data || response.data;
    } catch (error) {
      return handleApiError(error, "Get Detectors List");
    }
  },

  /**
   * Get detector by ID
   */
  async getById(id: string): Promise<Detector> {
    try {
      const response = await apiClient.get<{ data: { detector: Detector } }>(
        apiConfig.endpoints.getDetector(id)
      );

      return response.data.data?.detector || response.data.data || response.data;
    } catch (error) {
      return handleApiError(error, "Get Detector");
    }
  },

  /**
   * Get available detector types
   */
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

  /**
   * Get built-in detectors
   */
  async getBuiltin(params: DetectorListParams = {}): Promise<DetectorResponse> {
    try {
      const { page = 1, limit = 10 } = params;
      
      const response = await apiClient.post<{ data: DetectorResponse }>(
        `${apiConfig.endpoints.detectorsBuiltin}?page=${page}&limit=${limit}`,
        { creationType: "BuiltIn" }
      );

      return response.data.data || response.data;
    } catch (error) {
      return handleApiError(error, "Get Built-in Detectors");
    }
  },

  /**
   * Create a new detector
   */
  async create(payload: CreateDetectorPayload): Promise<Detector> {
    try {
      const response = await apiClient.post<{ data: Detector }>(
        apiConfig.endpoints.detectorsCreate,
        payload
      );

      return response.data.data || response.data;
    } catch (error) {
      return handleApiError(error, "Create Detector");
    }
  },

  /**
   * Update an existing detector
   */
  async update(id: string, payload: UpdateDetectorPayload): Promise<Detector> {
    try {
      const response = await apiClient.put<{ data: Detector }>(
        apiConfig.endpoints.updateDetector(id),
        payload
      );

      return response.data.data || response.data;
    } catch (error) {
      return handleApiError(error, "Update Detector");
    }
  },

  /**
   * Delete a detector
   */
  async delete(id: string): Promise<void> {
    try {
      await apiClient.delete(apiConfig.endpoints.deleteDetector(id));
    } catch (error) {
      return handleApiError(error, "Delete Detector");
    }
  },

  /**
   * Test a detector (if endpoint exists)
   */
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
