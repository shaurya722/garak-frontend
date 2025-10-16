"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, ArrowLeft, Edit, Trash2, TestTube } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { getDetectorUrl } from "@/config/api";
import api from "@/lib/axios";
import MainLayout from "@/components/layout/main-layout";

interface Detector {
  detector_id: string;
  detector_type: string;
  name: string;
  description: string;
  confidence_threshold: number;
  patterns?: string[];
  enabled: boolean;
  created_at?: string;
  updated_at?: string;
}

export default function DetectorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const detectorId = params.detector_id as string;

  const [loading, setLoading] = useState(true);
  const [detector, setDetector] = useState<Detector | null>(null);

  const fetchDetector = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get(getDetectorUrl(detectorId));
      setDetector(data);
    } catch (error) {
      console.error("Failed to fetch detector:", error);
      toast.error("Failed to load detector");
    } finally {
      setLoading(false);
    }
  }, [detectorId]);

  useEffect(() => {
    if (detectorId) {
      fetchDetector();
    }
  }, [detectorId, fetchDetector]);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this detector?")) return;

    try {
      await api.delete(getDetectorUrl(detectorId));
      toast.success("Detector deleted successfully");
      router.push("/detectors");
    } catch (error) {
      console.error("Failed to delete detector:", error);
      toast.error("Failed to delete detector");
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

  if (loading) {
    return (
      <div className="min-h-screen ">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Shield className="h-12 w-12 text-red-600 mx-auto mb-4 animate-pulse" />
              <p className="text-gray-600 dark:text-gray-400">
                Loading detector...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!detector) {
    return (
      <div className="min-h-screen ">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Detector Not Found
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              The detector you&apos;re looking for doesn&apos;t exist or has
              been deleted.
            </p>
            <Link href="/detectors">
              <Button>Back to Detectors</Button>
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
        <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-slate-900/80">
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
                  <Shield className="h-8 w-8 text-red-600" />
                  <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                      {detector.name}
                    </h1>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Detector ID: {detector.detector_id}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Link href={`/detectors/test?detector=${detector.detector_id}`}>
                  <Button variant="outline">
                    <TestTube className="h-4 w-4 mr-2" />
                    Test
                  </Button>
                </Link>
                <Link href={`/detectors/${detector.detector_id}/edit`}>
                  <Button variant="outline">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  onClick={handleDelete}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Detector ID
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {detector.detector_id}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Type
                    </label>
                    <div className="mt-1">
                      <Badge
                        className={getDetectorTypeColor(detector.detector_type)}
                      >
                        {detector.detector_type}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Name
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {detector.name}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Description
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {detector.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Confidence Threshold
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {detector.confidence_threshold}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Status
                    </label>
                    <div className="mt-1">
                      <Badge
                        variant={detector.enabled ? "default" : "secondary"}
                      >
                        {detector.enabled ? "Enabled" : "Disabled"}
                      </Badge>
                    </div>
                  </div>
                </div>

                {detector.created_at && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Created
                      </label>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {new Date(detector.created_at).toLocaleString()}
                      </p>
                    </div>
                    {detector.updated_at && (
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Last Updated
                        </label>
                        <p className="text-sm text-gray-900 dark:text-white">
                          {new Date(detector.updated_at).toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Patterns (for regex detectors) */}
            {detector.detector_type === "regex" && detector.patterns && (
              <Card>
                <CardHeader>
                  <CardTitle>Detection Patterns</CardTitle>
                  <CardDescription>
                    Regular expression patterns used by this detector
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {detector.patterns.map((pattern, index) => (
                      <div
                        key={index}
                        className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Pattern {index + 1}
                          </span>
                        </div>
                        <code className="text-sm text-gray-900 dark:text-white break-all">
                          {pattern}
                        </code>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Usage Information */}
            <Card>
              <CardHeader>
                <CardTitle>Usage Information</CardTitle>
                <CardDescription>
                  How to use this detector in policies and tests
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Detector ID for API
                  </label>
                  <div className="mt-1 p-2 bg-gray-50 dark:bg-gray-800 rounded border">
                    <code className="text-sm text-gray-900 dark:text-white">
                      {detector.detector_id}
                    </code>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                    Usage Examples:
                  </h4>
                  <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                    <li>• Include this detector in enhanced policies</li>
                    <li>• Use in detector testing API calls</li>
                    <li>• Reference in custom security workflows</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </MainLayout>
  );
}
