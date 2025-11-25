
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

    // Projects
    projectsList: `${API_BASE_URL}/management/company/project/list`,
    projectsDropdown: `${API_BASE_URL}/management/company/project/dropdown`,
    projectsCreate: `${API_BASE_URL}/management/company/project/create`,
    getProject: (id: string) => `${API_BASE_URL}/management/company/project/${id}`,
    updateProject: (id: string) => `${API_BASE_URL}/management/company/project/${id}`,
    deleteProject: (id: string) => `${API_BASE_URL}/management/company/project/${id}`,

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
    jobs: `${API_BASE_URL}/management/company/job/list`,
    jobsList: `${API_BASE_URL}/management/company/job/list`,
    jobsDropdown: `${API_BASE_URL}/management/company/job/dropdown`,
    jobsCreate: `${API_BASE_URL}/management/company/job/create`,
    jobsActive: `${API_BASE_URL}/management/company/job/active`,
    runGarak: `${API_BASE_URL}/api/run-garak`,
    getJob: (id: string) => `${API_BASE_URL}/management/company/job/${id}`,
    updateJob: (id: string) => `${API_BASE_URL}/management/company/job/${id}`,
    deleteJob: (id: string) => `${API_BASE_URL}/management/company/job/${id}`,
    getJobReport: (id: string, month: number, year: number) => `${API_BASE_URL}/management/company/job/${id}/report?month=${month}&year=${year}`,

    // Logs
    logsList: `${API_BASE_URL}/management/company/log/list`,
    logsJob: (jobId: string) => `${API_BASE_URL}/management/company/log/job/${jobId}`,

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
export const getJobUrl = (jobId: string) => `${API_BASE_URL}/management/company/job/${jobId}`;
export const getJobResultsUrl = (jobId: string) => `${API_BASE_URL}/management/company/job/${jobId}/results`;
export const getJobEnhancedUrl = (jobId: string) => `${API_BASE_URL}/management/company/job/${jobId}/enhanced`;
export const getJobCiMetricsUrl = (jobId: string) => `${API_BASE_URL}/management/company/job/${jobId}/ci-metrics`;

export default apiConfig;
