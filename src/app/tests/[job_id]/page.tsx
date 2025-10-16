"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  Activity, 
  ArrowLeft,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Download,
  Eye
} from "lucide-react";
import Link from "next/link";
import SecurityReportPDF from "../../components/SecurityReportPDF";
import api from "@/lib/axios";
import { getJobStatusUrl, getJobUrl } from "@/config/api";
import { useCallback } from "react";
import MainLayout from "@/components/layout/main-layout";

interface JobDetails {
  job_id: string;
  status: "PENDING" | "STARTED" | "SUCCESS" | "FAILURE" | "REVOKED";
  config_name?: string;
  probes?: string[];
  created_at: string;
  completed_at?: string;
  error_message?: string;
}

const statusConfig = {
  PENDING: { icon: Clock, color: "bg-yellow-100 text-yellow-800", label: "Pending" },
  STARTED: { icon: Activity, color: "bg-blue-100 text-blue-800", label: "Running" },
  SUCCESS: { icon: CheckCircle, color: "bg-green-100 text-green-800", label: "Completed" },
  FAILURE: { icon: XCircle, color: "bg-red-100 text-red-800", label: "Failed" },
  REVOKED: { icon: AlertCircle, color: "bg-gray-100 text-gray-800", label: "Cancelled" },
};

export default function TestDetailsPage() {
  const params = useParams();
  const job_id = params.job_id as string;
  
  const [job, setJob] = useState<JobDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJobDetails = useCallback(async () => {
    try {
      const { data } = await api.get(getJobStatusUrl(job_id));
      setJob({
        job_id: data.job_id,
        status: data.status,
        created_at: new Date().toISOString(), // Mock data if not provided
      });
    } catch (err) {
      console.error("Failed to fetch job details:", err);
      setError("Failed to fetch job details");
    } finally {
      setLoading(false);
    }
  }, [job_id]);

  useEffect(() => {
    if (!job_id) return;
    fetchJobDetails();
    const interval = setInterval(() => {
      if (job?.status === "STARTED" || job?.status === "PENDING") {
        fetchJobDetails();
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [job_id, job?.status, fetchJobDetails]);

  

  

  const cancelJob = async () => {
    if (!confirm("Are you sure you want to cancel this test?")) return;
    
    try {
      await api.delete(getJobUrl(job_id));
      setJob(prev => prev ? { ...prev, status: "REVOKED" } : null);
    } catch (error) {
      console.error("Failed to cancel job:", error);
    }
  };

  const getStatusIcon = (status: JobDetails["status"]) => {
    const config = statusConfig[status];
    const Icon = config.icon;
    return <Icon className="h-5 w-5" />;
  };

  const getStatusBadge = (status: JobDetails["status"]) => {
    const config = statusConfig[status];
    return (
      <Badge variant="secondary" className={`${config.color} text-sm`}>
        {getStatusIcon(status)}
        <span className="ml-2">{config.label}</span>
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen ">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-lg font-medium">Loading test details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen ">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <Card className="w-full max-w-md">
              <CardContent className="text-center py-12">
                <XCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
                <h3 className="text-lg font-semibold mb-2">Test Not Found</h3>
                <p className="text-gray-600 mb-4">
                  {error || "The requested test could not be found."}
                </p>
                <Link href="/tests">
                  <Button>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Tests
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <MainLayout>
    <div className="min-h-screen ">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/tests">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Tests
                </Button>
              </Link>
              <div className="flex items-center space-x-2">
                <Shield className="h-8 w-8 text-red-600" />
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Test Details
                </h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {getStatusBadge(job.status)}
              {job.status === "STARTED" && (
                <Button variant="outline" size="sm" onClick={cancelJob}>
                  Cancel Test
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Test Overview */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Test Overview</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Job ID</h4>
                <p className="text-sm font-mono bg-gray-100 dark:bg-gray-800 p-2 rounded">
                  {job.job_id}
                </p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Status</h4>
                {getStatusBadge(job.status)}
              </div>
              
              <div>
                <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Started</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {new Date(job.created_at).toLocaleString()}
                </p>
              </div>
              
              {job.completed_at && (
                <div>
                  <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Completed</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {new Date(job.completed_at).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Configuration Details */}
        {job.config_name && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-medium">{job.config_name}</p>
              {job.probes && (
                <div className="mt-4">
                  <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Security Probes</h4>
                  <div className="flex flex-wrap gap-2">
                    {job.probes.map((probe, index) => (
                      <Badge key={index} variant="outline">
                        {probe}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Status-specific Content */}
        {job.status === "STARTED" && (
          <Card className="mb-6">
            <CardContent className="text-center py-12">
              <RefreshCw className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
              <h3 className="text-lg font-semibold mb-2">Test in Progress</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Your security test is currently running. This page will update automatically.
              </p>
            </CardContent>
          </Card>
        )}

        {job.status === "SUCCESS" && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span>Test Completed Successfully</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Your security test has completed successfully. View the detailed results below.
              </p>
              <div className="flex space-x-3">
                <Link href={`/tests/${job_id}/results`}>
                  <Button>
                    <Eye className="h-4 w-4 mr-2" />
                    View Results
                  </Button>
                </Link>
                <Link href={`/tests/${job_id}/enhanced`}>
                  <Button variant="outline">
                    <Shield className="h-4 w-4 mr-2" />
                    Enhanced Analysis
                  </Button>
                </Link>
                <SecurityReportPDF data={{
                  job_id: job.job_id,
                  status: job.status,
                  created_at: job.created_at,
                  completed_at: job.completed_at,
                  config_name: job.config_name,
                  probes: job.probes
                }}>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Download Report
                  </Button>
                </SecurityReportPDF>
              </div>
            </CardContent>
          </Card>
        )}

        {job.status === "FAILURE" && (
          <Card className="mb-6 border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-red-600">
                <XCircle className="h-5 w-5" />
                <span>Test Failed</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                The security test encountered an error and could not complete.
              </p>
              {job.error_message && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">Error Details</h4>
                  <p className="text-sm text-red-700 dark:text-red-300 font-mono">
                    {job.error_message}
                  </p>
                </div>
              )}
              <div className="mt-4">
                <Link href="/tests/new">
                  <Button>
                    Try Again
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {job.status === "REVOKED" && (
          <Card className="mb-6">
            <CardContent className="text-center py-12">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-500" />
              <h3 className="text-lg font-semibold mb-2">Test Cancelled</h3>
              <p className="text-gray-600 dark:text-gray-400">
                This test was cancelled before completion.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" onClick={fetchJobDetails}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Status
              </Button>
              
              {job.status === "SUCCESS" && (
                <>
                  <Link href={`/tests/${job_id}/results`}>
                    <Button variant="outline">
                      <Eye className="h-4 w-4 mr-2" />
                      View Results
                    </Button>
                  </Link>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Download Report
                  </Button>
                </>
              )}
              
              <Link href="/tests/new">
                <Button variant="outline">
                  Run New Test
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
    </MainLayout>
  );
}
