// Log Types and Interfaces

export interface Log {
  id: string;
  jobId: string;
  projectId: string;
  policyId: string;
  policyName: string;
  userPrompt: string;
  sanitizedContent: string;
  status: 'pass' | 'blocked';
  isFail: boolean;
  scannersUsed: string[];
  scanResults: Record<string, boolean>;
  riskScores: Record<string, number>;
  failedScanners: string[];
  createdAt: string;
}

export interface LogListParams {
  page?: number;
  limit?: number;
  jobId?: string;
}

export interface LogResponse {
  docs: Log[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
