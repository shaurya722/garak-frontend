export const queryKeys = {
  // Auth
  auth: {
    all: ["auth"] as const,
    user: () => [...queryKeys.auth.all, "user"] as const,
  },

  // Detectors
  detectors: {
    all: ["detectors"] as const,
    lists: () => [...queryKeys.detectors.all, "list"] as const,
    list: (filters: Record<string, unknown>) => 
      [...queryKeys.detectors.lists(), filters] as const,
    detail: (id: string) => [...queryKeys.detectors.all, "detail", id] as const,
    types: () => [...queryKeys.detectors.all, "types"] as const,
    builtin: () => [...queryKeys.detectors.all, "builtin"] as const,
  },

  // Categories
  categories: {
    all: ["categories"] as const,
    lists: () => [...queryKeys.categories.all, "list"] as const,
    list: (filters: Record<string, unknown>) => 
      [...queryKeys.categories.lists(), filters] as const,
    detail: (id: string) => [...queryKeys.categories.all, "detail", id] as const,
  },

  // Probes
  probes: {
    all: ["probes"] as const,
    lists: () => [...queryKeys.probes.all, "list"] as const,
    list: (filters: Record<string, unknown>) => 
      [...queryKeys.probes.lists(), filters] as const,
    detail: (id: string) => [...queryKeys.probes.all, "detail", id] as const,
    dropdown: () => [...queryKeys.probes.all, "dropdown"] as const,
  },

  // Projects
  projects: {
    all: ["projects"] as const,
    lists: () => [...queryKeys.projects.all, "list"] as const,
    list: (filters: Record<string, unknown>) => 
      [...queryKeys.projects.lists(), filters] as const,
    dropdown: () => [...queryKeys.projects.all, "dropdown"] as const,
    detail: (id: string) => [...queryKeys.projects.all, "detail", id] as const,
  },

  // Jobs
  jobs: {
    all: ["jobs"] as const,
    lists: () => [...queryKeys.jobs.all, "list"] as const,
    list: (filters: Record<string, unknown>) => 
      [...queryKeys.jobs.lists(), filters] as const,
    detail: (id: string) => [...queryKeys.jobs.all, "detail", id] as const,
  },

  // Logs
  logs: {
    all: ["logs"] as const,
    lists: () => [...queryKeys.logs.all, "list"] as const,
    list: (filters: Record<string, unknown>) => 
      [...queryKeys.logs.lists(), filters] as const,
    jobLogs: (jobId: string, filters: Record<string, unknown>) =>
      [...queryKeys.logs.all, "job", jobId, filters] as const,
  },
} as const;
