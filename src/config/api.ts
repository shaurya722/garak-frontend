// API Configuration
// Centralized API endpoints for all services (Auth + Management via Nginx)

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost";

export const apiConfig = {
  baseUrl: API_BASE_URL,
  endpoints: {
    // === Auth Service ===

    authCompanyLogin: `${API_BASE_URL}/auth/company/login`,
    authCompanyRegister: `${API_BASE_URL}/auth/company/register`,

    // === Management Service ===
    // Detectors
    detectorsList: `${API_BASE_URL}/management/company/detector/list`,
    detectorsBuiltin: `${API_BASE_URL}/management/company/detector/built-in`,
    detectorsTypes: `${API_BASE_URL}/management/company/detector/types`,
    detectorsCreate: `${API_BASE_URL}/management/company/detector/create`,
    getDetector: (id: string) => `${API_BASE_URL}/management/company/detector/${id}`,
    updateDetector: (id: string) => `${API_BASE_URL}/management/company/detector/${id}`,
    deleteDetector: (id: string) => `${API_BASE_URL}/management/company/detector/${id}`,

    // Categories
    categoriesList: `${API_BASE_URL}/management/company/category/list`,
    categoriesCreate: `${API_BASE_URL}/management/company/category/create`,
    getCategory: (id: string) => `${API_BASE_URL}/management/company/category/${id}`,
    updateCategory: (id: string) => `${API_BASE_URL}/management/company/category/${id}`,
    deleteCategory: (id: string) => `${API_BASE_URL}/management/company/category/${id}`,

    // Probes
    probesList: `${API_BASE_URL}/management/company/probe/list`,
    probesDropdown: `${API_BASE_URL}/management/company/probe/dropdown`,
    probesCreate: `${API_BASE_URL}/management/company/probe/create`,
    getProbe: (id: string) => `${API_BASE_URL}/management/company/probe/${id}`,
    updateProbe: (id: string) => `${API_BASE_URL}/management/company/probe/${id}`,
    deleteProbe: (id: string) => `${API_BASE_URL}/management/company/probe/${id}`,

    // === Common / Legacy Endpoints ===
    restConfigs: `${API_BASE_URL}/api/rest-configs/`,
    policies: `${API_BASE_URL}/api/policies`,
    policiesCategories: `${API_BASE_URL}/api/policies/categories`,
    policiesProbes: `${API_BASE_URL}/api/policies/probes`,
    enhancedPolicies: `${API_BASE_URL}/api/policies/enhanced`,
    detectors: `${API_BASE_URL}/management/company/detector/list`,
    detectorsTest: `${API_BASE_URL}/api/detectors/test`,

    // Jobs
    runGarak: `${API_BASE_URL}/api/run-garak/`,
    jobs: `${API_BASE_URL}/api/jobs`,
    jobsActive: `${API_BASE_URL}/api/jobs/active/`,
    jobsCleanup: `${API_BASE_URL}/api/jobs/cleanup-orphaned/`,

    // Agentic Radar Service
    agenticRadarFrameworks: `${API_BASE_URL}/api/api/v1/frameworks`,
    agenticRadarTestFramework: (framework: string) => `${API_BASE_URL}/api/api/v1/test-framework/${framework}`,
    agenticRadarScan: `${API_BASE_URL}/api/api/v1/scan-and-generate-pdf/`,
    agenticRadarStatus: (scanId: string) => `${API_BASE_URL}/api/api/v1/status/${scanId}`,
    agenticRadarReport: (scanId: string) => `${API_BASE_URL}/api/api/v1/report/${scanId}`,
    agenticRadarCrewAICompatibility: `${API_BASE_URL}/api/api/v1/crewai-compatibility-guide`,

    // Health
    health: `${API_BASE_URL}/`,
  },
} as const;

// === Helper Functions ===
export const getJobUrl = (jobId: string) => `${API_BASE_URL}/api/job/${jobId}`;
export const getJobStatusUrl = (jobId: string) => `${API_BASE_URL}/api/job/${jobId}/status/`;
export const getJobResultsUrl = (jobId: string) => `${API_BASE_URL}/api/job/${jobId}/results/`;
export const getJobEnhancedUrl = (jobId: string) => `${API_BASE_URL}/api/job/${jobId}/enhanced/`;
export const getJobCiMetricsUrl = (jobId: string) => `${API_BASE_URL}/api/job/${jobId}/ci-metrics/`;
export const getPolicyUrl = (policyId: string) => `${API_BASE_URL}/api/policies/${policyId}`;
export const getEnhancedPolicyUrl = (policyId: string) => `${API_BASE_URL}/api/policies/enhanced/${policyId}`;
export const getRestConfigUrl = (configId: string) => `${API_BASE_URL}/api/rest-configs/${configId}`;
export const getDetectorUrl = (detectorId: string) => `${API_BASE_URL}/api/detectors/${detectorId}`;

export default apiConfig;
