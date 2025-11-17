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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Zap,
  Activity,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { getJobEnhancedUrl, getJobCiMetricsUrl } from "@/config/api";
import api from "@/api/axios";
import SecurityReportPDF from "../../../components/SecurityReportPDF";
import MainLayout from "@/components/layout/main-layout";

interface DetectorOutput {
  detector_id: string;
  confidence_score: number;
  tags: string[];
  matched_patterns: string[] | null;
  evidence: Record<string, unknown>;
}

interface AuditLog {
  decision_metadata: {
    max_confidence: number;
    tags: string[];
    decision_method: string;
  };
  timestamp: string;
  policy_version: string;
}

interface EnhancedResult {
  probe_detector: string;
  result: string; // Changed from garak_result
  ok_on?: string; // Added field
  attack_success_rate: number | null; // Can be null
  confidence_score: number;
  enforcement_action: "ALLOW" | "SANITIZE" | "REFUSE" | "WARN";
  detector_outputs: DetectorOutput[];
  sanitized_content: string | null; // Added field
  refusal_reason: string | null;
  tags: string[]; // Added field
  audit_log: AuditLog; // Added field
}

interface EnhancedJobResults {
  job_id: string;
  status: string;
  enhanced_results: EnhancedResult[];
  enforcement_summary: {
    ALLOW: number;
    SANITIZE: number;
    REFUSE: number;
    WARN: number;
  };
  policy_violations: Record<string, unknown>[];
  total_tests: number;
  created_at: string;
  completed_at?: string;
}

interface CIMetrics {
  job_id: string;
  ci_status: "PASS" | "FAIL";
  ci_metrics: {
    total_tests: number;
    critical_incidents: number;
    failure_rate: number;
    policy_violations_count: number;
  };
  acceptance_criteria: {
    zero_critical_incidents: boolean;
    low_failure_rate: boolean;
    no_data_leaks: boolean;
  };
  enforcement_summary: {
    ALLOW: number;
    SANITIZE: number;
    REFUSE: number;
    WARN: number;
  };
  recommendations: string[];
}

export default function EnhancedTestResultsPage() {
  const params = useParams();
  const job_id = params.job_id as string;

  const [results, setResults] = useState<EnhancedJobResults | null>(null);
  const [ciMetrics, setCiMetrics] = useState<CIMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (job_id) {
      fetchEnhancedResults();
      fetchCiMetrics();
    }
  }, [job_id]);

  const fetchEnhancedResults = async () => {
    try {
      const { data } = await api.get(getJobEnhancedUrl(job_id));
      setResults(data);
    } catch (err) {
      console.error("Failed to fetch enhanced results:", err);
      setError("Enhanced results not available");
    }
  };

  const fetchCiMetrics = async () => {
    try {
      const { data } = await api.get(getJobCiMetricsUrl(job_id));
      setCiMetrics(data);
    } catch (err) {
      console.error("Failed to fetch CI metrics:", err);
    } finally {
      setLoading(false);
    }
  };

  const getEnforcementBadge = (action: string) => {
    const colors = {
      ALLOW: "bg-green-100 text-green-800",
      SANITIZE: "bg-yellow-100 text-yellow-800",
      REFUSE: "bg-red-100 text-red-800",
      WARN: "bg-orange-100 text-orange-800",
    };
    return (
      <Badge
        className={
          colors[action as keyof typeof colors] || "bg-gray-100 text-gray-800"
        }
      >
        {action}
      </Badge>
    );
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "text-red-600";
    if (confidence >= 0.6) return "text-orange-600";
    if (confidence >= 0.4) return "text-yellow-600";
    return "text-green-600";
  };

  const getCiStatusBadge = (status: string) => {
    return status === "PASS" ? (
      <Badge className="bg-green-100 text-green-800">✓ PASS</Badge>
    ) : (
      <Badge className="bg-red-100 text-red-800">✗ FAIL</Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen ">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Shield className="h-12 w-12 text-red-600 mx-auto mb-4 animate-pulse" />
              <p className="text-gray-600 dark:text-gray-400">
                Loading enhanced results...
              </p>
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
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Enhanced Results Not Available
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {error || "Enhanced results are not available for this test."}
            </p>
            <Link href={`/tests/${job_id}`}>
              <Button>View Basic Results</Button>
            </Link>
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
                  <Zap className="h-8 w-8 text-red-600" />
                  <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                      Enhanced Security Analysis
                    </h1>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Job ID: {job_id}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {ciMetrics && getCiStatusBadge(ciMetrics.ci_status)}
                <SecurityReportPDF data={results}>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Enhanced Report
                  </Button>
                </SecurityReportPDF>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-6"
          >
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="detections">Detections</TabsTrigger>
              <TabsTrigger value="enforcement">Enforcement</TabsTrigger>
              <TabsTrigger value="ci-metrics">CI Metrics</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Tests
                    </CardTitle>
                    <Target className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {results.total_tests}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Policy Violations
                    </CardTitle>
                    <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">
                      {results.policy_violations.length}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Refused Actions
                    </CardTitle>
                    <XCircle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">
                      {results.enforcement_summary.REFUSE}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Allowed Actions
                    </CardTitle>
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {results.enforcement_summary.ALLOW}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Enforcement Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Enforcement Summary</CardTitle>
                  <CardDescription>
                    Distribution of enforcement actions taken based on detector
                    analysis
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {results.enforcement_summary.ALLOW}
                      </div>
                      <p className="text-sm text-green-800 dark:text-green-200">
                        ALLOW
                      </p>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">
                        {results.enforcement_summary.SANITIZE}
                      </div>
                      <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        SANITIZE
                      </p>
                    </div>
                    <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">
                        {results.enforcement_summary.REFUSE}
                      </div>
                      <p className="text-sm text-red-800 dark:text-red-200">
                        REFUSE
                      </p>
                    </div>
                    <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">
                        {results.enforcement_summary.WARN}
                      </div>
                      <p className="text-sm text-orange-800 dark:text-orange-200">
                        WARN
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Detections Tab */}
            <TabsContent value="detections" className="space-y-6">
              <div className="space-y-4">
                {results.enhanced_results.map((result, index) => (
                  <Card
                    key={index}
                    className={`${
                      result.tags.includes("policy_violation")
                        ? "border-red-200 dark:border-red-800"
                        : ""
                    }`}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <CardTitle className="text-lg">
                            {result.probe_detector}
                          </CardTitle>
                          <div className="flex items-center space-x-2">
                            <Badge
                              variant={
                                result.result === "PASS"
                                  ? "secondary"
                                  : "destructive"
                              }
                            >
                              {result.result}
                            </Badge>
                            {getEnforcementBadge(result.enforcement_action)}
                            {result.tags.includes("policy_violation") && (
                              <Badge variant="destructive">
                                Policy Violation
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div
                            className={`text-lg font-bold ${getConfidenceColor(
                              result.confidence_score
                            )}`}
                          >
                            {result.confidence_score !== null &&
                            result.confidence_score !== undefined
                              ? (result.confidence_score * 100).toFixed(1)
                              : "0.0"}
                            %
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            Confidence
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {result.ok_on && (
                        <div>
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Test Results:
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {result.ok_on}
                          </p>
                        </div>
                      )}

                      {result.tags.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Tags:
                          </p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {result.tags.map((tag, tagIndex) => (
                              <Badge
                                key={tagIndex}
                                variant="outline"
                                className="text-xs"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {result.refusal_reason && (
                        <div>
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Refusal Reason:
                          </p>
                          <p className="text-sm text-red-600 dark:text-red-400">
                            {result.refusal_reason}
                          </p>
                        </div>
                      )}

                      {result.detector_outputs.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Detector Analysis:
                          </p>
                          <div className="mt-2 space-y-2">
                            {result.detector_outputs.map(
                              (output, outputIndex) => (
                                <div
                                  key={outputIndex}
                                  className="border border-gray-200 dark:border-gray-700 p-3 rounded-lg"
                                >
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="font-medium text-sm">
                                      {output.detector_id}
                                    </span>
                                    <div className="flex items-center space-x-2">
                                      <span
                                        className={`text-xs font-medium ${getConfidenceColor(
                                          output.confidence_score || 0
                                        )}`}
                                      >
                                        {output.confidence_score !== null &&
                                        output.confidence_score !== undefined
                                          ? (
                                              output.confidence_score * 100
                                            ).toFixed(1)
                                          : "0.0"}
                                        %
                                      </span>
                                      {output.tags.length > 0 && (
                                        <div className="flex gap-1">
                                          {output.tags.map((tag, tagIdx) => (
                                            <Badge
                                              key={tagIdx}
                                              variant="outline"
                                              className="text-xs"
                                            >
                                              {tag}
                                            </Badge>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  {output.evidence && (
                                    <div className="text-xs text-gray-600 dark:text-gray-400">
                                      <details>
                                        <summary className="cursor-pointer hover:text-gray-800 dark:hover:text-gray-200">
                                          Evidence
                                        </summary>
                                        <pre className="mt-1 whitespace-pre-wrap bg-gray-50 dark:bg-gray-800 p-2 rounded text-xs overflow-x-auto">
                                          {JSON.stringify(
                                            output.evidence,
                                            null,
                                            2
                                          )}
                                        </pre>
                                      </details>
                                    </div>
                                  )}
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}

                      {result.audit_log && (
                        <div>
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Decision Audit:
                          </p>
                          <div className="mt-1 text-xs bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <span className="font-medium">
                                  Max Confidence:
                                </span>{" "}
                                {(
                                  result.audit_log.decision_metadata
                                    .max_confidence * 100
                                ).toFixed(1)}
                                %
                              </div>
                              <div>
                                <span className="font-medium">Method:</span>{" "}
                                {
                                  result.audit_log.decision_metadata
                                    .decision_method
                                }
                              </div>
                              <div>
                                <span className="font-medium">
                                  Policy Version:
                                </span>{" "}
                                {result.audit_log.policy_version}
                              </div>
                              <div>
                                <span className="font-medium">Timestamp:</span>{" "}
                                {new Date(
                                  result.audit_log.timestamp
                                ).toLocaleString()}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Enforcement Tab */}
            <TabsContent value="enforcement" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(results.enforcement_summary).map(
                  ([action, count]) => (
                    <Card key={action}>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          {getEnforcementBadge(action)}
                          <span>{action} Actions</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold mb-2">{count}</div>
                        <div className="space-y-2">
                          {results.enhanced_results
                            .filter((r) => r.enforcement_action === action)
                            .slice(0, 3)
                            .map((result, index) => (
                              <div
                                key={index}
                                className="text-sm p-2 bg-gray-50 dark:bg-gray-800 rounded"
                              >
                                <div className="font-medium">
                                  {result.probe_detector}
                                </div>
                                <div className="text-gray-600 dark:text-gray-400 truncate">
                                  {result.ok_on || "No test results available"}
                                </div>
                              </div>
                            ))}
                          {results.enhanced_results.filter(
                            (r) => r.enforcement_action === action
                          ).length > 3 && (
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              +
                              {results.enhanced_results.filter(
                                (r) => r.enforcement_action === action
                              ).length - 3}{" "}
                              more
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                )}
              </div>
            </TabsContent>

            {/* CI Metrics Tab */}
            <TabsContent value="ci-metrics" className="space-y-6">
              {ciMetrics ? (
                <>
                  {/* CI Status */}
                  <Card
                    className={
                      ciMetrics.ci_status === "FAIL"
                        ? "border-red-200 dark:border-red-800"
                        : "border-green-200 dark:border-green-800"
                    }
                  >
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <TrendingUp className="h-5 w-5" />
                        <span>CI/CD Status</span>
                        {getCiStatusBadge(ciMetrics.ci_status)}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <div className="text-2xl font-bold">
                            {ciMetrics.ci_metrics.total_tests}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Total Tests
                          </p>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-red-600">
                            {ciMetrics.ci_metrics.critical_incidents}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Critical Incidents
                          </p>
                        </div>
                        <div>
                          <div className="text-2xl font-bold">
                            {ciMetrics.ci_metrics.failure_rate !== null &&
                            ciMetrics.ci_metrics.failure_rate !== undefined
                              ? (
                                  ciMetrics.ci_metrics.failure_rate * 100
                                ).toFixed(1)
                              : "0.0"}
                            %
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Failure Rate
                          </p>
                        </div>
                        <div>
                          <div className="text-2xl font-bold">
                            {ciMetrics.ci_metrics.policy_violations_count}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Policy Violations
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Acceptance Criteria */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Acceptance Criteria</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {Object.entries(ciMetrics.acceptance_criteria).map(
                          ([criterion, passed]) => (
                            <div
                              key={criterion}
                              className="flex items-center space-x-3"
                            >
                              {passed ? (
                                <CheckCircle className="h-5 w-5 text-green-600" />
                              ) : (
                                <XCircle className="h-5 w-5 text-red-600" />
                              )}
                              <span
                                className={
                                  passed
                                    ? "text-green-800 dark:text-green-200"
                                    : "text-red-800 dark:text-red-200"
                                }
                              >
                                {criterion
                                  .replace(/_/g, " ")
                                  .replace(/\b\w/g, (l) => l.toUpperCase())}
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Recommendations */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Recommendations</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {ciMetrics.recommendations.map(
                          (recommendation, index) => (
                            <div
                              key={index}
                              className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg"
                            >
                              <p className="text-sm text-blue-800 dark:text-blue-200">
                                {recommendation}
                              </p>
                            </div>
                          )
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <Card>
                  <CardContent className="py-12">
                    <div className="text-center">
                      <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 dark:text-gray-400">
                        CI metrics not available
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </MainLayout>
  );
}