"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Activity, 
  Plus, 
  Search, 
  Eye, 
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Play
} from "lucide-react";
import Link from "next/link";
import MainLayout from "@/components/layout/main-layout";
import api from "@/lib/axios";
import { apiConfig, getJobUrl } from "@/config/api";

interface TestJob {
  job_id: string;
  status: "PENDING" | "STARTED" | "SUCCESS" | "FAILURE" | "REVOKED";
  config_name?: string;
  probes?: string[];
  created_at: string;
  completed_at?: string;
}

const statusConfig = {
  PENDING: { icon: Clock, color: "bg-yellow-100 text-yellow-800", label: "Pending" },
  STARTED: { icon: Activity, color: "bg-blue-100 text-blue-800", label: "Running" },
  SUCCESS: { icon: CheckCircle, color: "bg-green-100 text-green-800", label: "Completed" },
  FAILURE: { icon: XCircle, color: "bg-red-100 text-red-800", label: "Failed" },
  REVOKED: { icon: AlertCircle, color: "bg-gray-100 text-gray-800", label: "Cancelled" },
};

export default function TestsPage() {
  const [jobs, setJobs] = useState<TestJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchJobs();
    // Set up polling for active jobs
    const interval = setInterval(fetchJobs, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchJobs = async () => {
    try {
      const { data } = await api.get(apiConfig.endpoints.jobs);
      type ApiJob = {
        job_id: string;
        status: TestJob["status"];
        config_name?: string;
        probes?: string[];
        created_at: string;
        completed_at?: string;
      };
      const jobsArray: ApiJob[] = Array.isArray(data.jobs) ? (data.jobs as ApiJob[]) : [];
      const transformedJobs: TestJob[] = jobsArray.map((job) => ({
        job_id: job.job_id,
        status: job.status,
        config_name: job.config_name,
        probes: job.probes,
        created_at: job.created_at,
        completed_at: job.completed_at,
      }));
      setJobs(transformedJobs);
    } catch (error) {
      console.error("Failed to fetch jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const cancelJob = async (jobId: string) => {
    if (!confirm("Are you sure you want to cancel this test?")) return;
    
    try {
      await api.delete(getJobUrl(jobId));
      setJobs(jobs.map(job => 
        job.job_id === jobId 
          ? { ...job, status: "REVOKED" as const }
          : job
      ));
    } catch (error) {
      console.error("Failed to cancel job:", error);
    }
  };

  const filteredJobs = jobs.filter(job =>
    job.job_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.config_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentJobs = filteredJobs.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Reset to first page when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const getStatusBadge = (status: TestJob["status"]) => {
    // Ensure we have a valid configuration for the status
    const config = statusConfig[status] || {
      color: "bg-gray-100 text-gray-800",
      label: "Unknown"
    };
    return (
      <Badge variant="secondary" className={config.color}>
        <span className="ml-1">{config.label}</span>
      </Badge>
    );
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Activity className="h-12 w-12 text-purple-600 mx-auto mb-4 animate-pulse" />
              <p className="text-muted-foreground">Loading tests...</p>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="container flex items-center justify-between fixed">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Security Scan</h1>
            <p className="text-muted-foreground">
              Monitor and manage your AI security testing jobs
            </p>
          </div>
          <Link href="/tests/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Scan
            </Button>
          </Link>
        </div>

        {/* Search */}
        <div className="relative max-w-sm mt-20">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search tests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Tests Table */}
        <Card>
          <CardHeader>
            <CardTitle>Test Jobs</CardTitle>
            <CardDescription>
              Showing {Math.min(indexOfFirstItem + 1, filteredJobs.length)}-{Math.min(indexOfLastItem, filteredJobs.length)} of {filteredJobs.length} tests
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredJobs.length === 0 ? (
              <div className="text-center py-12">
                <Activity className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium mb-2">
                  {searchTerm ? "No tests found" : "No tests run yet"}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm 
                    ? "Try adjusting your search terms"
                    : "Start your first security test to see results here"
                  }
                </p>
                {!searchTerm && (
                  <Link href="/tests/new">
                    <Button>
                      <Play className="h-4 w-4 mr-2" />
                      Run First Test
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Scan ID</TableHead>
                    <TableHead>Configuration</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Started</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Probes</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentJobs.map((job) => (
                    <TableRow key={job.job_id}>
                      <TableCell className="font-mono text-sm">{job.job_id}</TableCell>
                      <TableCell>{job.config_name || "No configuration"}</TableCell>
                      <TableCell>{getStatusBadge(job.status)}</TableCell>
                      <TableCell>{new Date(job.created_at).toLocaleString()}</TableCell>
                      <TableCell>
                        {job.completed_at 
                          ? `${Math.round((new Date(job.completed_at).getTime() - new Date(job.created_at).getTime()) / 1000 / 60)}m`
                          : job.status === "STARTED" ? "Running..." : "-"
                        }
                      </TableCell>
                      <TableCell>{job.probes?.length || 0}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Link href={`/tests/${job.job_id}`}>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          {(job.status === "PENDING" || job.status === "STARTED") && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => cancelJob(job.job_id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

<div className="flex items-center justify-between px-6 py-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => paginate(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <div className="flex space-x-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        // Show first, last, and pages around current page
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        
                        return (
                          <Button
                            key={pageNum}
                            variant={pageNum === currentPage ? "default" : "outline"}
                            size="sm"
                            onClick={() => paginate(pageNum)}
                            className={pageNum === currentPage ? "font-bold" : ""}
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
            </CardContent>
          </Card>
      </div>
    </MainLayout>
  );
}
