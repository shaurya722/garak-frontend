// Detector Types and Interfaces

export interface Detector {
  id: string;
  detectorName: string;
  description: string;
  creationType: "External" | "BuiltIn";
  detectorType: DetectorType;
  confidence: number;
  regex: string[];
  enabled?: boolean;
  createdAt: string;
  updatedAt: string;
}

export type DetectorType = 
  | "REGEX" 
  | "PII" 
  | "HEURISTIC" 
  | "EMBEDDING" 
  | "PACKAGE_REGISTRY";

export interface DetectorFormData {
  detectorName: string;
  description: string;
  detectorType: string;
  confidence: string;
  regex: string[];
}

export interface CreateDetectorPayload {
  detectorName: string;
  description: string;
  detectorType: string;
  confidence: number;
  regex: string[];
}

export type UpdateDetectorPayload = CreateDetectorPayload;

export interface DetectorListParams {
  page?: number;
  limit?: number;
  creationType?: "External" | "BuiltIn";
  search?: string;
}

export interface DetectorResponse {
  docs: Detector[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface Pagination {
  page: number;
  limit: number;
  totalDocs: number;
  totalPages: number;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
}
