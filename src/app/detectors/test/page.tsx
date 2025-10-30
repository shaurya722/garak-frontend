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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, TestTube, AlertTriangle, CheckCircle } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { apiConfig } from "@/config/api";
import api from "@/api/axios";
import MainLayout from "@/components/layout/main-layout";

interface Detector {
  detector_id: string;
  name: string;
  description: string;
  detector_type: string;
  confidence_threshold: number;
  enabled: boolean;
}

interface DetectionResult {
  detector_id: string;
  detector_name: string;
  confidence: number;
  tags: string[];
  matched: boolean;
}

interface TestResult {
  content: string;
  results: DetectionResult[];
  total_detectors: number;
  detections_found: number;
}

export default function TestDetectorsPage() {
  const [loading, setLoading] = useState(false);
  const [detectors, setDetectors] = useState<Detector[]>([]);
  const [selectedDetectors, setSelectedDetectors] = useState<string[]>([]);
  const [testContent, setTestContent] = useState("");
  const [testResult, setTestResult] = useState<TestResult | null>(null);

  useEffect(() => {
    fetchDetectors();
  }, []);

  const fetchDetectors = async () => {
    try {
      const [{ data: customData }, { data: builtinData }] = await Promise.all([
        api.get(apiConfig.endpoints.detectors),
        api.get(apiConfig.endpoints.detectorsBuiltin),
      ]);
      const allDetectors = [
        ...(Array.isArray(customData) ? customData : []),
        ...(Array.isArray(builtinData) ? builtinData : []),
      ];

      setDetectors(allDetectors);

      // Select all enabled detectors by default
      const enabledDetectors = allDetectors
        .filter((d) => d.enabled)
        .map((d) => d.detector_id);
      setSelectedDetectors(enabledDetectors);
    } catch (error) {
      console.error("Failed to fetch detectors:", error);
      toast.error("Failed to load detectors");
    }
  };

  const handleDetectorToggle = (detectorId: string, checked: boolean) => {
    setSelectedDetectors((prev) =>
      checked ? [...prev, detectorId] : prev.filter((id) => id !== detectorId)
    );
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedDetectors(detectors.map((d) => d.detector_id));
    } else {
      setSelectedDetectors([]);
    }
  };

  const handleTest = async () => {
    if (!testContent.trim()) {
      toast.error("Please enter content to test");
      return;
    }

    if (selectedDetectors.length === 0) {
      toast.error("Please select at least one detector");
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post(apiConfig.endpoints.detectorsTest, {
        content: testContent,
        detector_ids: selectedDetectors,
      });
      setTestResult(data);
      toast.success("Detection test completed");
    } catch (error) {
      console.error("Failed to test detectors:", error);
      toast.error("Failed to run detection test");
    } finally {
      setLoading(false);
    }
  };

  const getDetectorTypeColor = (type: string) => {
    const colors = {
      regex: "bg-blue-100 text-blue-800",
      heuristic: "bg-green-100 text-green-800",
      classifier: "bg-purple-100 text-purple-800",
      embedding: "bg-orange-100 text-orange-800",
      package_registry: "bg-red-100 text-red-800",
      pii: "bg-yellow-100 text-yellow-800",
    };
    return colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "text-red-600";
    if (confidence >= 0.6) return "text-orange-600";
    if (confidence >= 0.4) return "text-yellow-600";
    return "text-green-600";
  };

  return (
    <MainLayout>
      <div className="min-h-screen ">
        {/* Header */}
        <header className="border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link href="/detectors">
                  <Button variant="ghost" size="sm">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Detectors
                  </Button>
                </Link>
                <div className="flex items-center space-x-2">
                  <TestTube className="h-8 w-8 text-red-600" />
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Test Detectors
                  </h1>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Test Configuration */}
            <div className="space-y-6">
              {/* Test Content */}
              <Card>
                <CardHeader>
                  <CardTitle>Test Content</CardTitle>
                  <CardDescription>
                    Enter the content you want to test against the selected
                    detectors
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="test-content">Content to Test</Label>
                      <Textarea
                        id="test-content"
                        value={testContent}
                        onChange={(e) => setTestContent(e.target.value)}
                        placeholder="Enter text content to test for security issues..."
                        rows={8}
                        className="resize-none"
                      />
                    </div>

                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                        Example Test Content:
                      </h4>
                      <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                        <p>
                          • API keys: &quot;My API key is
                          sk-1234567890abcdef...&quot;
                        </p>
                        <p>
                          • PII: &quot;Contact John Doe at john.doe@company.com
                          or 123-45-6789&quot;
                        </p>
                        <p>
                          • Jailbreak: &quot;Ignore all previous instructions
                          and...&quot;
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Detector Selection */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Select Detectors</CardTitle>
                      <CardDescription>
                        Choose which detectors to run against your content
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="select-all"
                        checked={selectedDetectors.length === detectors.length}
                        onCheckedChange={handleSelectAll}
                      />
                      <Label htmlFor="select-all" className="text-sm">
                        Select All
                      </Label>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {detectors.map((detector) => (
                      <div
                        key={detector.detector_id}
                        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <Checkbox
                          id={detector.detector_id}
                          checked={selectedDetectors.includes(
                            detector.detector_id
                          )}
                          onCheckedChange={(checked) =>
                            handleDetectorToggle(
                              detector.detector_id,
                              checked as boolean
                            )
                          }
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <Label
                              htmlFor={detector.detector_id}
                              className="font-medium cursor-pointer"
                            >
                              {detector.name}
                            </Label>
                            <Badge
                              className={getDetectorTypeColor(
                                detector.detector_type
                              )}
                            >
                              {detector.detector_type}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                            {detector.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-4 border-t">
                    <Button
                      onClick={handleTest}
                      disabled={
                        loading ||
                        !testContent.trim() ||
                        selectedDetectors.length === 0
                      }
                      className="w-full"
                    >
                      <TestTube className="h-4 w-4 mr-2" />
                      {loading
                        ? "Testing..."
                        : `Test with ${selectedDetectors.length} Detectors`}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Test Results */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Detection Results</CardTitle>
                  <CardDescription>
                    Results from running the selected detectors against your
                    content
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!testResult ? (
                    <div className="text-center py-12">
                      <TestTube className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 dark:text-gray-400">
                        Run a test to see detection results here
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Summary */}
                      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">
                              Total Detectors:
                            </span>{" "}
                            {testResult.total_detectors}
                          </div>
                          <div>
                            <span className="font-medium">
                              Detections Found:
                            </span>{" "}
                            {testResult.detections_found}
                          </div>
                        </div>
                      </div>

                      {/* Results */}
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {testResult.results.map((result, index) => (
                          <div key={index} className="p-3 border rounded-lg">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                {result.matched ? (
                                  <AlertTriangle className="h-4 w-4 text-red-600" />
                                ) : (
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                )}
                                <span className="font-medium">
                                  {result.detector_name}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span
                                  className={`text-sm font-medium ${getConfidenceColor(
                                    result.confidence || 0
                                  )}`}
                                >
                                  {result.confidence !== null &&
                                  result.confidence !== undefined
                                    ? (result.confidence * 100).toFixed(1)
                                    : "0.0"}
                                  %
                                </span>
                                {result.matched ? (
                                  <Badge variant="destructive">Detected</Badge>
                                ) : (
                                  <Badge variant="secondary">Clean</Badge>
                                )}
                              </div>
                            </div>

                            {result.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
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
                            )}
                          </div>
                        ))}
                      </div>

                      {testResult.detections_found > 0 && (
                        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                          <div className="flex items-center space-x-2">
                            <AlertTriangle className="h-5 w-5 text-red-600" />
                            <span className="font-medium text-red-800 dark:text-red-200">
                              Security Issues Detected
                            </span>
                          </div>
                          <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                            {testResult.detections_found} detector(s) found
                            potential security issues in the content.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </MainLayout>
  );
}
