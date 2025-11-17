"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
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
  Shield,
  ArrowLeft,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Download,
  BarChart3,
  FileText,
  Target,
} from "lucide-react";
import Link from "next/link";
import SecurityReportPDF from "../../../components/SecurityReportPDF";
import api from "@/api/axios";
import { getJobEnhancedUrl, getJobResultsUrl } from "@/config/api";
import MainLayout from "@/components/layout/main-layout";

interface TestResult {
  probe_detector: string;
  result: string;
  ok_on?: string;
  attack_success_rate?: number;
}

interface SummaryStats {
  total_probes: number;
  fail_count: number;
  average_attack_success_rate: number;
}

interface GarakResults {
  job_id: string;
  status: string;
  summary?: SummaryStats;
  results?: TestResult[];
  report_file?: string;
  summary_file?: string;
  error_message?: string;
  created_at: string;
  completed_at?: string;
}

export default function TestResultsPage() {
  const params = useParams();
  const job_id = params.job_id as string;

  const [results, setResults] = useState<GarakResults | null>(null);
  const [enhancedResults, setEnhancedResults] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (job_id) {
      fetchResults();
      fetchEnhancedResults();
    }
  }, [job_id]);

  const fetchResults = async () => {
    try {
      const { data } = await api.get(getJobResultsUrl(job_id));
      setResults(data);
    } catch (err) {
      console.error("Failed to fetch results:", err);
      setError("Failed to fetch test results");
    } finally {
      setLoading(false);
    }
  };

  const fetchEnhancedResults = async () => {
    try {
      const { data } = await api.get(getJobEnhancedUrl(job_id));
      setEnhancedResults(data);
    } catch (err) {
      console.error("Failed to fetch enhanced results:", err);
    }
  };

  const getResultBadge = (result: string) => {
    switch (result.toLowerCase()) {
      case "pass":
        return <Badge className="bg-green-100 text-green-800">Pass</Badge>;
      case "fail":
        return <Badge className="bg-red-100 text-red-800">Fail</Badge>;
      default:
        return <Badge variant="secondary">{result}</Badge>;
    }
  };

  const getRiskLevel = (successRate: number) => {
    if (successRate >= 70)
      return { level: "High", color: "text-red-600", bg: "bg-red-100" };
    if (successRate >= 30)
      return { level: "Medium", color: "text-yellow-600", bg: "bg-yellow-100" };
    return { level: "Low", color: "text-green-600", bg: "bg-green-100" };
  };

  if (loading) {
    return (
      <div className="min-h-screen ">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-lg font-medium">Loading test results...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !results) {
    return (
      <div className="min-h-screen ">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <Card className="w-full max-w-md">
              <CardContent className="text-center py-12">
                <XCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
                <h3 className="text-lg font-semibold mb-2">
                  Results Not Available
                </h3>
                <p className="text-gray-600 mb-4">
                  {error || "Test results are not available yet."}
                </p>
                <div className="flex space-x-3 justify-center">
                  <Link href={`/tests/${job_id}`}>
                    <Button variant="outline">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to Test
                    </Button>
                  </Link>
                  <Link href="/tests">
                    <Button>View All Tests</Button>
                  </Link>
                </div>
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
                <Link href={`/tests/${job_id}`}>
                  <Button variant="ghost" size="sm">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Test
                  </Button>
                </Link>
                <div className="flex items-center space-x-2">
                  <Shield className="h-8 w-8 text-red-600" />
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Test Results
                  </h1>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <SecurityReportPDF data={results}>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Download Report
                  </Button>
                </SecurityReportPDF>
              </div>
            </div>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Summary Cards */}
          {results.summary && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Probes
                  </CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {results.summary.total_probes}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Security tests executed
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Failed Tests
                  </CardTitle>
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {results.summary.fail_count}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {results.summary.total_probes > 0
                      ? (
                          (results.summary.fail_count /
                            results.summary.total_probes) *
                          100
                        ).toFixed(1)
                      : "0.0"}
                    % failure rate
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Attack Success Rate
                  </CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {results.summary.average_attack_success_rate !== null &&
                    results.summary.average_attack_success_rate !== undefined
                      ? results.summary.average_attack_success_rate.toFixed(1)
                      : "0.0"}
                    %
                  </div>
                  <div className="flex items-center space-x-2 mt-1">
                    {(() => {
                      const rate =
                        results.summary.average_attack_success_rate || 0;
                      const risk = getRiskLevel(rate);
                      return (
                        <Badge className={`${risk.bg} ${risk.color}`}>
                          {risk.level} Risk
                        </Badge>
                      );
                    })()}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Test Results */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Detailed Results</CardTitle>
              <CardDescription>
                Individual probe results and security findings
              </CardDescription>
            </CardHeader>
            <CardContent>
              {results.results && results.results.length > 0 ? (
                <div className="space-y-4">
                  {results.results.map((result, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{result.probe_detector}</h4>
                        {getResultBadge(result.result)}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        {result.ok_on && (
                          <div>
                            <span className="font-medium text-gray-600">
                              Evaluated on:
                            </span>
                            <p className="text-gray-800">{result.ok_on}</p>
                          </div>
                        )}

                        {result.attack_success_rate !== undefined &&
                          result.attack_success_rate !== null && (
                            <div>
                              <span className="font-medium text-gray-600">
                                Success Rate:
                              </span>
                              <div className="flex items-center space-x-2">
                                <span className="text-gray-800">
                                  {result.attack_success_rate.toFixed(1)}%
                                </span>
                                {(() => {
                                  const risk = getRiskLevel(
                                    result.attack_success_rate
                                  );
                                  return (
                                    <Badge
                                      variant="outline"
                                      className={`${risk.color} text-xs`}
                                    >
                                      {risk.level}
                                    </Badge>
                                  );
                                })()}
                              </div>
                            </div>
                          )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600">No detailed results available</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Test Information */}
          <Card>
            <CardHeader>
              <CardTitle>Test Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Job ID
                  </h4>
                  <p className="text-sm font-mono bg-gray-100 dark:bg-gray-800 p-2 rounded">
                    {results.job_id}
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Status
                  </h4>
                  <Badge
                    variant="secondary"
                    className="bg-green-100 text-green-800"
                  >
                    <CheckCircle className="h-3 w-3 mr-1" />
                    {results.status}
                  </Badge>
                </div>

                <div>
                  <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Started
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {new Date(results.created_at).toLocaleString()}
                  </p>
                </div>

                {results.completed_at && (
                  <div>
                    <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Completed
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(results.completed_at).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>

              {results.error_message && (
                <div className="mt-6">
                  <h4 className="font-medium text-red-700 dark:text-red-300 mb-2">
                    Error Message
                  </h4>
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <p className="text-sm text-red-700 dark:text-red-300 font-mono">
                      {results.error_message}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </MainLayout>
  );
}