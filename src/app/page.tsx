"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Shield,
  Settings,
  Activity,
  Eye,
  Play,
  TrendingUp,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import MainLayout from "@/components/layout/main-layout";
import { apiConfig } from "@/config/api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface RestConfig {
  config_id: string;
  config_name: string;
  description?: string;
  created_at: string;
  rest_generator: {
    name: string;
    uri: string;
    method: string;
  };
}

interface Policy {
  id?: string;
  policy_id?: string;
  name?: string;
  policy_name?: string;
  probe_count?: number;
  probes_count?: number;
  is_default?: boolean;
  created_at?: string;
  updated_at?: string;
  description?: string;
}

interface DashboardStats {
  projects: number;
  policies: number;
  detectors: number;
  activeTests: number;
}

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [recentConfigs, setRecentConfigs] = useState<RestConfig[]>([]);
  const [recentPolicies, setRecentPolicies] = useState<Policy[]>([]);

  // Debug state changes
  useEffect(() => {
    console.log("Recent configs state updated:", recentConfigs);
  }, [recentConfigs]);

  useEffect(() => {
    console.log("Recent policies state updated:", recentPolicies);
  }, [recentPolicies]);
  const [stats, setStats] = useState<DashboardStats>({
    projects: 0,
    policies: 0,
    detectors: 0,
    activeTests: 0,
  });

  useEffect(() => {
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchRecentConfigs(),
        fetchRecentPolicies(),
        fetchStats(),
      ]);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentConfigs = async () => {
    try {
      console.log(
        "Fetching recent configs from:",
        apiConfig.endpoints.restConfigs
      );
      const response = await fetch(apiConfig.endpoints.restConfigs);
      console.log("Recent configs response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("Recent configs raw data:", data);

        // Get the 3 most recent configs, sorted by creation date
        let recent = Array.isArray(data) ? data : [];
        recent = recent
          .sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
          )
          .slice(0, 3);
        console.log("Recent configs processed:", recent);
        setRecentConfigs(recent);
      } else {
        console.error(
          "Failed to fetch recent configs - Status:",
          response.status
        );
        const errorText = await response.text();
        console.error("Error response:", errorText);
      }
    } catch (error) {
      console.error("Failed to fetch recent configs:", error);
    }
  };

  const fetchRecentPolicies = async () => {
    try {
      console.log(
        "Fetching recent policies from:",
        apiConfig.endpoints.policies
      );
      const response = await fetch(apiConfig.endpoints.policies);
      console.log("Recent policies response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("Recent policies raw data:", data);

        // Handle both array and object responses
        let policies = [];
        if (Array.isArray(data)) {
          policies = data;
        } else if (data && typeof data === "object") {
          // If the API returns an object with a policies array
          if (Array.isArray(data.policies)) {
            policies = data.policies;
          } else if (Array.isArray(data.items)) {
            policies = data.items;
          } else {
            // If it's a single policy object, wrap it in an array
            policies = [data];
          }
        }

        // Get the 3 most recent policies, sorted by creation date
        const recent = policies
          .filter((policy: Policy) => policy) // Filter out any null/undefined entries
          .sort((a: Policy, b: Policy) => {
            const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
            const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
            return dateB - dateA;
          })
          .slice(0, 3);

        console.log("Recent policies processed:", recent);
        setRecentPolicies(recent);
      } else {
        console.error(
          "Failed to fetch recent policies - Status:",
          response.status
        );
        const errorText = await response.text();
        console.error("Error response:", errorText);
        toast.error(`Failed to load policies: ${response.status} ${errorText}`);
      }
    } catch (error) {
      console.error("Failed to fetch recent policies:", error);
      toast.error("Failed to load policies. Please try again.");
    }
  };

  const fetchWithRetry = async (
    url: string,
    options = {},
    retries = 2,
    backoff = 300
  ) => {
    try {
      const response = await fetch(url, options);
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      return response;
    } catch (error) {
      if (retries === 0) throw error;
      console.log(`Retrying ${url}... (${retries} attempts left)`);
      await new Promise((resolve) => setTimeout(resolve, backoff));
      return fetchWithRetry(url, options, retries - 1, backoff * 2);
    }
  };

  const fetchStats = async () => {
    try {
      // Fetch all stats in parallel, but handle active tests separately
      const [projectsResponse, policiesResponse, detectorsResponse] =
        await Promise.all([
          fetch(apiConfig.endpoints.restConfigs),
          fetch(apiConfig.endpoints.policies),
          fetch(apiConfig.endpoints.detectors),
        ]);

      // Handle active tests separately with retry logic
      let activeTestsResponse;
      try {
        activeTestsResponse = await fetchWithRetry(
          apiConfig.endpoints.jobsActive
        );
      } catch (error) {
        console.warn("Using fallback active tests count due to error:", error);
        // Set a default value when the endpoint fails
        setStats((prev) => ({ ...prev, activeTests: 0 }));
      }

      // Process projects count
      if (projectsResponse.ok) {
        const projectsData = await projectsResponse.json();
        console.log("Projects data:", projectsData);
        setStats((prev) => ({
          ...prev,
          projects: Array.isArray(projectsData) ? projectsData.length : 0,
        }));
      } else {
        console.error("Failed to fetch projects:", projectsResponse.status);
      }

      // Process policies count with better error handling and response format support
      if (policiesResponse.ok) {
        const data = await policiesResponse.json();
        console.log("Policies data:", data);

        let policies = [];
        if (Array.isArray(data)) {
          policies = data;
        } else if (data && typeof data === "object") {
          policies = data.policies || data.items || [];
          if (!Array.isArray(policies) && Object.keys(data).length > 0) {
            // If it's a single policy object, count as 1
            policies = [data];
          }
        }

        const policyCount = Array.isArray(policies) ? policies.length : 0;
        console.log("Processed policies count:", policyCount);
        setStats((prev) => ({ ...prev, policies: policyCount }));
      } else {
        console.error(
          "Failed to fetch policies - Status:",
          policiesResponse.status
        );
        const errorText = await policiesResponse.text();
        console.error("Policies error response:", errorText);
      }

      // Process detectors count
      if (detectorsResponse.ok) {
        const detectorsData = await detectorsResponse.json();
        console.log("Detectors data:", detectorsData);
        setStats((prev) => ({
          ...prev,
          detectors: Array.isArray(detectorsData) ? detectorsData.length : 0,
        }));
      } else {
        console.error("Failed to fetch detectors:", detectorsResponse.status);
      }

      // Process active tests count if the response is available
      if (activeTestsResponse) {
        try {
          const activeTestsData = await activeTestsResponse.json();
          console.log("Active tests raw response:", activeTestsData);

          let activeCount = 0;
          if (Array.isArray(activeTestsData)) {
            activeCount = activeTestsData.length;
            console.log("Active tests count from array length:", activeCount);
          } else if (activeTestsData && typeof activeTestsData === "object") {
            // If it's an object, check if it has a count property or jobs array
            if (activeTestsData.count !== undefined) {
              activeCount = activeTestsData.count;
              console.log(
                "Active tests count from count property:",
                activeCount
              );
            } else if (
              activeTestsData.jobs &&
              Array.isArray(activeTestsData.jobs)
            ) {
              activeCount = activeTestsData.jobs.length;
              console.log("Active tests count from jobs array:", activeCount);
            } else if (
              activeTestsData.active_jobs &&
              Array.isArray(activeTestsData.active_jobs)
            ) {
              activeCount = activeTestsData.active_jobs.length;
              console.log(
                "Active tests count from active_jobs array:",
                activeCount
              );
            }
          }

          console.log("Final active tests count:", activeCount);
          setStats((prev) => ({ ...prev, activeTests: activeCount }));
        } catch (error) {
          console.error("Error parsing active tests response:", error);
          setStats((prev) => ({ ...prev, activeTests: 0 }));
        }
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  const getConfigStatus = () => {
    // Since configs don't have a status, we'll show 'Active' for all
    return "Active";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case "SUCCESS":
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case "PENDING":
      case "STARTED":
        return <Badge className="bg-blue-100 text-blue-800">Running</Badge>;
      case "FAILURE":
      case "REVOKED":
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="p-6 flex items-center justify-center min-h-[400px]">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading dashboard...</span>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="py-3 px-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Monitor your AI security testing activities and system health
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button onClick={fetchDashboardData} variant="outline">
              <TrendingUp className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Link href="/tests/new">
              <Button>
                <Play className="h-4 w-4 mr-2" />
                Run Test
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
  
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Projects</CardTitle>

              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>

            <div className="flex justify-between items-end pr-4">
              <CardContent>
                <div className="text-2xl font-bold">{stats.projects}</div>

                <p className="text-xs text-muted-foreground">
                  REST API projects
                </p>
              </CardContent>

              <button
                className="text-xs font-medium rounded-sm border-1 px-2 h-8 bg-[#E5E5E5] text-[#171717]"
                onClick={() => router.push("/projects/new")}
              >
                Create Projects
              </button>

              {/* <Button variant="default">Create Projects</Button> */}
            </div>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Policies</CardTitle>

              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>

            <div className="flex justify-between items-end pr-4">
              <CardContent>
                <div className="text-2xl font-bold">{stats.policies}</div>

                <p className="text-xs text-muted-foreground">
                  Security policies
                </p>
              </CardContent>

              <button
                className="text-xs font-medium rounded-sm border-1 px-2 h-8 text-white hover:bg-white hover:text-black"
                onClick={() => router.push("/policies/new")}
              >
                Create Policies
              </button>
            </div>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Detectors</CardTitle>

              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>

            <div className="flex justify-between items-end pr-4">
              <CardContent>
                <div className="text-2xl font-bold">{stats.detectors}</div>

                <p className="text-xs text-muted-foreground">
                  Custom detectors
                </p>
              </CardContent>

              <button
                className="text-xs font-medium rounded-sm border-1 px-2 h-8 text-white hover:bg-white hover:text-black"
                onClick={() => router.push("/detectors")}
              >
                View Detectors
              </button>
            </div>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reports</CardTitle>

              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>

            <div className="flex justify-between items-end pr-4">
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeTests}</div>

                <p className="text-xs text-muted-foreground">total Reports</p>
              </CardContent>

              <button
                className="text-xs rounded-sm border-1 px-2 h-8 text-white hover:bg-white hover:text-black"
                onClick={() => router.push("/reports")}
              >
                View Reports
              </button>
            </div>
          </Card>
        </div>

        {/* Recent Tests Table */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Projects</CardTitle>
              <CardDescription>
                Recently created REST API configurations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Project Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Result</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentConfigs.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center text-muted-foreground py-8"
                      >
                        No recent projects found.{" "}
                        <Link
                          href="/projects/new"
                          className="text-blue-600 hover:underline"
                        >
                          Create your first project
                        </Link>
                      </TableCell>
                    </TableRow>
                  ) : (
                    recentConfigs.map((config) => (
                      <TableRow key={config.config_id}>
                        <TableCell className="font-medium">
                          {config.config_name}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(getConfigStatus())}
                        </TableCell>
                        <TableCell>{formatDate(config.created_at)}</TableCell>
                        <TableCell>
                          <Link href={`/projects/${config.config_id}`}>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Recent Policies Table */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Policies</CardTitle>
              <CardDescription>
                Recently created security policies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Policy Name</TableHead>
                    <TableHead className="w-[100px]">Type</TableHead>
                    <TableHead className="w-[100px]">Probes</TableHead>
                    <TableHead className="w-[200px]">Created</TableHead>
                    <TableHead className="w-[100px] text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentPolicies.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center text-muted-foreground py-8"
                      >
                        No policies found.{" "}
                        <Link
                          href="/policies/new"
                          className="text-blue-600 hover:underline"
                        >
                          Create your first policy
                        </Link>
                      </TableCell>
                    </TableRow>
                  ) : (
                    recentPolicies.map((policy) => (
                      <TableRow key={policy.policy_id || policy.id}>
                        <TableCell className="font-medium">
                          {policy.name ||
                            policy.policy_name ||
                            "Unnamed Policy"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              policy.is_default ? "default" : "secondary"
                            }
                          >
                            {policy.is_default ? "Default" : "Custom"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {policy.probe_count || policy.probes_count || 0}
                        </TableCell>
                        <TableCell>
                          {policy.created_at
                            ? formatDate(policy.created_at)
                            : "N/A"}
                        </TableCell>
                        <TableCell className="text-right">
                          <Link
                            href={`/policies/${
                              policy.policy_id || policy.id || ""
                            }`}
                          >
                            <Button
                              variant="ghost"
                              size="sm"
                              title="View details"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
