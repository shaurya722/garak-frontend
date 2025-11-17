// Project Types and Interfaces

export interface Project {
  id?: string;
  name: string;
  description: string;
  type: 'RED' | 'BLUE' | 'AGENTIC';
  policyId?: string;
  // Red team specific fields
  redModelType?: 'OPENAI' | 'ANTHROPIC' | 'GOOGLE' | 'CUSTOM' | 'REST' | 'HUGGING_FACE' | 'HUGGING_FACE_INFERENCE_API' | 'HUGGING_FACE_INFERENCE_ENDPOINT' | 'REPLICATE' | 'COHERE' | 'GROQ' | 'NIM' | 'GGML' | null;
  redModelName?: string;
  redModelUrl?: string;
  redModelToken?: string;
  redAuthorizationType?: 'BEARER' | 'API_KEY' | 'BASIC' | 'CUSTOM' | 'NONE';
  redAuthorizationValue?: string | null;
  redRequestTemplate?: Record<string, unknown>;
  agenticZipUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProjectFormData {
  name: string;
  description: string;
  type: 'RED' | 'BLUE' | 'AGENTIC';
  policyId?: string;
  // Red team specific fields
  redModelType?: string;
  redModelName?: string;
  redModelUrl?: string;
  redModelToken?: string;
  redAuthorizationType?: string | null;
  redAuthorizationValue?: string | null;
  redRequestTemplate?: string; // JSON string for form
  agenticZipUrl?: string | null;
}

export interface CreateProjectPayload {
  name: string;
  description: string;
  type: 'RED' | 'BLUE' | 'AGENTIC';
  policyId?: string;
  redModelType?: string;
  redModelName?: string;
  redModelUrl?: string;
  redModelToken?: string;
  redAuthorizationType?: string;
  redAuthorizationValue?: string | null;
  redRequestTemplate?: Record<string, unknown>;
  agenticZipUrl?: string | null;
}

export type UpdateProjectPayload = CreateProjectPayload;

export interface ProjectListParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface ProjectResponse {
  docs: Project[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
