// API Configuration
// This file centralizes all API endpoint Projects

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const apiConfig = {
  baseUrl: API_BASE_URL,
  endpoints: {
    // Auth
    // authLogin: `${API_BASE_URL}/auth/login`,
    authCompanyLogin: `${API_BASE_URL}/api/auth/company/login`,
    authRegister: `${API_BASE_URL}/auth/register`,
    authMe: `${API_BASE_URL}/auth/me`,
    // REST Projects (Projects)
    restConfigs: `${API_BASE_URL}/rest-configs`,

    // Policies
    policies: `${API_BASE_URL}/policies`,
    policiesCategories: `${API_BASE_URL}/policies/categories`,
    policiesProbes: `${API_BASE_URL}/policies/probes`,
    enhancedPolicies: `${API_BASE_URL}/policies/enhanced`,

    // Detectors
    detectors: `${API_BASE_URL}/detectors/`,
    detectorsBuiltin: `${API_BASE_URL}/detectors/builtin`,
    detectorsTypes: `${API_BASE_URL}/detectors/types`,
    detectorsTest: `${API_BASE_URL}/detectors/test`,

    // Jobs
    runGarak: `${API_BASE_URL}/run-garak`,
    jobs: `${API_BASE_URL}/jobs`,
    jobsActive: `${API_BASE_URL}/jobs/active`,
    jobsCleanup: `${API_BASE_URL}/jobs/cleanup-orphaned`,

    // Agentic Radar Service
    agenticRadarFrameworks: `${API_BASE_URL}/api/v1/frameworks`,
    agenticRadarTestFramework: (framework: string) => `${API_BASE_URL}/api/v1/test-framework/${framework}`,
    agenticRadarScan: `${API_BASE_URL}/api/v1/scan-and-generate-pdf/`,
    agenticRadarStatus: (scanId: string) => `${API_BASE_URL}/api/v1/status/${scanId}`,
    agenticRadarReport: (scanId: string) => `${API_BASE_URL}/api/v1/report/${scanId}`,
    agenticRadarCrewAICompatibility: `${API_BASE_URL}/api/v1/crewai-compatibility-guide`,

    // Health
    health: `${API_BASE_URL}/`
  }
} as const;

// Helper functions for dynamic endpoints
export const getJobUrl = (jobId: string) => `${API_BASE_URL}/job/${jobId}`;
export const getJobStatusUrl = (jobId: string) => `${API_BASE_URL}/job/${jobId}/status`;
export const getJobResultsUrl = (jobId: string) => `${API_BASE_URL}/job/${jobId}/results`;
export const getJobEnhancedUrl = (jobId: string) => `${API_BASE_URL}/job/${jobId}/enhanced`;
export const getJobCiMetricsUrl = (jobId: string) => `${API_BASE_URL}/job/${jobId}/ci-metrics`;
export const getPolicyUrl = (policyId: string) => `${API_BASE_URL}/policies/${policyId}`;
export const getEnhancedPolicyUrl = (policyId: string) => `${API_BASE_URL}/policies/enhanced/${policyId}`;
export const getRestConfigUrl = (configId: string) => `${API_BASE_URL}/rest-configs/${configId}`;
export const getDetectorUrl = (detectorId: string) => `${API_BASE_URL}/detectors/${detectorId}`;

export default apiConfig;
