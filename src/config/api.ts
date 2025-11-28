
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost";
const AUTH_BASE_URL = process.env.NEXT_PUBLIC_AUTH_URL || API_BASE_URL;
const MANAGEMENT_BASE_URL = process.env.NEXT_PUBLIC_MANAGEMENT_URL || API_BASE_URL;

export const apiConfig = {
  baseUrl: API_BASE_URL,
  endpoints: {
    // === Auth Service ===

    authCompanyLogin: `${AUTH_BASE_URL}/auth/company/login`,
    authCompanyRegister: `${AUTH_BASE_URL}/auth/company/register`,

    // === Management Service ===
    // Detectors
    detectorsList: `${MANAGEMENT_BASE_URL}/management/company/detector/list`,
    detectorsBuiltin: `${MANAGEMENT_BASE_URL}/management/company/detector/built-in`,
    detectorsTypes: `${MANAGEMENT_BASE_URL}/management/company/detector/types`,
    detectorsCreate: `${MANAGEMENT_BASE_URL}/management/company/detector/create`,
    getDetector: (id: string) => `${MANAGEMENT_BASE_URL}/management/company/detector/${id}`,
    updateDetector: (id: string) => `${MANAGEMENT_BASE_URL}/management/company/detector/${id}`,
    deleteDetector: (id: string) => `${MANAGEMENT_BASE_URL}/management/company/detector/${id}`,

    // Categories
    categoriesList: `${MANAGEMENT_BASE_URL}/management/company/category/list`,
    categoriesCreate: `${MANAGEMENT_BASE_URL}/management/company/category/create`,
    getCategory: (id: string) => `${MANAGEMENT_BASE_URL}/management/company/category/${id}`,
    updateCategory: (id: string) => `${MANAGEMENT_BASE_URL}/management/company/category/${id}`,
    deleteCategory: (id: string) => `${MANAGEMENT_BASE_URL}/management/company/category/${id}`,

    // Projects
    projectsList: `${MANAGEMENT_BASE_URL}/management/company/project/list`,
    projectsDropdown: `${MANAGEMENT_BASE_URL}/management/company/project/dropdown`,
    projectsCreate: `${MANAGEMENT_BASE_URL}/management/company/project/create`,
    getProject: (id: string) => `${MANAGEMENT_BASE_URL}/management/company/project/${id}`,
    updateProject: (id: string) => `${MANAGEMENT_BASE_URL}/management/company/project/${id}`,
    deleteProject: (id: string) => `${MANAGEMENT_BASE_URL}/management/company/project/${id}`,

    // Probes
    probesList: `${MANAGEMENT_BASE_URL}/management/company/probe/list`,
    probesDropdown: `${MANAGEMENT_BASE_URL}/management/company/probe/dropdown`,
    probesCreate: `${MANAGEMENT_BASE_URL}/management/company/probe/create`,
    getProbe: (id: string) => `${MANAGEMENT_BASE_URL}/management/company/probe/${id}`,
    updateProbe: (id: string) => `${MANAGEMENT_BASE_URL}/management/company/probe/${id}`,
    deleteProbe: (id: string) => `${MANAGEMENT_BASE_URL}/management/company/probe/${id}`,

    // === Common / Legacy Endpoints ===
    restConfigs: `${API_BASE_URL}/api/rest-configs/`,
    policies: `${API_BASE_URL}/api/policies`,
    policiesCategories: `${API_BASE_URL}/api/policies/categories`,
    policiesProbes: `${API_BASE_URL}/api/policies/probes`,
    enhancedPolicies: `${API_BASE_URL}/api/policies/enhanced`,
    detectors: `${MANAGEMENT_BASE_URL}/management/company/detector/list`,
    detectorsTest: `${API_BASE_URL}/api/detectors/test`,

    // Jobs
    jobs: `${MANAGEMENT_BASE_URL}/management/company/job/list`,
    jobsList: `${MANAGEMENT_BASE_URL}/management/company/job/list`,
    jobsDropdown: `${MANAGEMENT_BASE_URL}/management/company/job/dropdown`,
    jobsCreate: `${MANAGEMENT_BASE_URL}/management/company/job/create`,
    jobsActive: `${MANAGEMENT_BASE_URL}/management/company/job/active`,
    runGarak: `${API_BASE_URL}/api/run-garak`,
    getJob: (id: string) => `${MANAGEMENT_BASE_URL}/management/company/job/${id}`,
    updateJob: (id: string) => `${MANAGEMENT_BASE_URL}/management/company/job/${id}`,
    deleteJob: (id: string) => `${MANAGEMENT_BASE_URL}/management/company/job/${id}`,
    getJobReport: (id: string, month: number, year: number) => `${MANAGEMENT_BASE_URL}/management/company/job/${id}/report?month=${month}&year=${year}`,

    // Logs
    logsList: `${MANAGEMENT_BASE_URL}/management/company/log/list`,
    logsJob: (jobId: string) => `${MANAGEMENT_BASE_URL}/management/company/log/job/${jobId}`,

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
export const getJobUrl = (jobId: string) => `${MANAGEMENT_BASE_URL}/management/company/job/${jobId}`;
export const getJobResultsUrl = (jobId: string) => `${MANAGEMENT_BASE_URL}/management/company/job/${jobId}/results`;
export const getJobEnhancedUrl = (jobId: string) => `${MANAGEMENT_BASE_URL}/management/company/job/${jobId}/enhanced`;
export const getJobCiMetricsUrl = (jobId: string) => `${MANAGEMENT_BASE_URL}/management/company/job/${jobId}/ci-metrics`;

export default apiConfig;
