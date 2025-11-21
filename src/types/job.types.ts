// Job Types and Interfaces

export interface Job {
  id?: string;
  projectId: string;
  projectType?: string;
  status?: string;
  redAuthorizationValue?: string | null;
  evaluationThreshold?: number | null;
  agenticReport?: string | null;
  blueAPIKey?: string | null;
  createdAt?: string;
  updatedAt?: string;
  project?: any; // Full project object with nested data
}

export interface JobFormData {
  projectId: string;
  redAuthorizationValue: string;
  evaluationThreshold: string;
  agenticReport: string;
}

export interface CreateJobPayload {
  projectId: string;
  redAuthorizationValue?: string | null;
  evaluationThreshold?: number | null;
}

export type UpdateJobPayload = Partial<CreateJobPayload> & {
  agenticReport?: string | null;
};

export interface JobListParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface JobResponse {
  docs: Job[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
