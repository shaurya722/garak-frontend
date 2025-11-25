// Job Types and Interfaces

import { Project } from './project.types';

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
  project?: Project; // Full project object with nested data
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

export interface JobReportProjectBreakdown {
  projectId: string;
  projectName: string;
  totalLogs: number;
  totalFailedLogs: number;
  failedLogPercentage: number;
}

export interface JobReportDailyLog {
  date: string;
  totalLogs: number;
}

export interface JobReportDailyFailedPercentage {
  date: string;
  failedPercentage: number;
}

export interface JobReportData {
  totalLogs: number;
  totalFailedLogs: number;
  failedLogPercentage: number;
  projectBreakdown: JobReportProjectBreakdown[];
  dailyLogsGraph: JobReportDailyLog[];
  dailyFailedPercentageGraph: JobReportDailyFailedPercentage[];
}

export interface JobReportResponse {
  message: string;
  data: JobReportData;
}

export interface JobReportParams {
  month: number;
  year: number;
}
