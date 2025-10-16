"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Shield, Plus, Search, Eye, Edit, Trash2, TestTube, Zap } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { apiConfig, getDetectorUrl } from "@/config/api";
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

interface BuiltinDetector {
  detector_id: string;
  name: string;
  description: string;
  detector_type: string;
  confidence_threshold: number;
  enabled: boolean;
}

export default function DetectorsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [customDetectors, setCustomDetectors] = useState<Detector[]>([]);
  const [builtinDetectors, setBuiltinDetectors] = useState<BuiltinDetector[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"custom" | "builtin">("custom");

  useEffect(() => {
    fetchDetectors();
  }, []);

  const fetchDetectors = async () => {
    setLoading(true);
    try {
      const [{ data: customData }, { data: builtinData }] = await Promise.all([
        api.get(apiConfig.endpoints.detectors),
        api.get(apiConfig.endpoints.detectorsBuiltin)
      ]);
      setCustomDetectors(Array.isArray(customData) ? customData : []);
      setBuiltinDetectors(Array.isArray(builtinData) ? builtinData : []);
    } catch (error) {
      console.error("Failed to fetch detectors:", error);
      toast.error("Failed to load detectors");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDetector = async (detectorId: string) => {
    if (!confirm("Are you sure you want to delete this detector?")) return;

    try {
      await api.delete(getDetectorUrl(detectorId));
      toast.success("Detector deleted successfully");
      fetchDetectors();
    } catch (error) {
      console.error("Failed to delete detector:", error);
      toast.error("Failed to delete detector");
    }
  };

  const filteredCustomDetectors = customDetectors.filter(detector =>
    detector.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    detector.detector_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    detector.detector_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredBuiltinDetectors = builtinDetectors.filter(detector =>
    detector.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    detector.detector_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    detector.detector_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      <MainLayout>
      <div className="min-h-screen ">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Shield className="h-12 w-12 text-red-600 mx-auto mb-4 animate-pulse" />
              <p className="text-gray-600 dark:text-gray-400">Loading detectors...</p>
            </div>
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Security Detectors</h1>
            <p className="text-muted-foreground">
              Manage custom detectors and view built-in detection capabilities
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Link href="/detectors/test">
              <Button variant="outline">
                <TestTube className="h-4 w-4 mr-2" />
                Test Detectors
              </Button>
            </Link>
            <Link href="/detectors/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Detector
              </Button>
            </Link>
          </div>
        </div>
        {/* Search and Tabs */}
        <div className="mb-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search detectors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg w-fit">
            <button
              onClick={() => setActiveTab("custom")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === "custom"
                  ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              Custom Detectors ({filteredCustomDetectors.length})
            </button>
            <button
              onClick={() => setActiveTab("builtin")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === "builtin"
                  ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              Built-in Detectors ({filteredBuiltinDetectors.length})
            </button>
          </div>
        </div>

        {/* Custom Detectors Tab */}
        {activeTab === "custom" && (
          <Card>
            <CardHeader>
              <CardTitle>Custom Detectors</CardTitle>
              <CardDescription>User-created detectors for specialized security analysis</CardDescription>
            </CardHeader>
            <CardContent>
              {filteredCustomDetectors.length === 0 ? (
                <div className="text-center py-12">
                  <Zap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    {searchTerm ? "No detectors found" : "No custom detectors"}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm 
                      ? "Try adjusting your search terms"
                      : "Create your first custom detector to get started"
                    }
                  </p>
                  {!searchTerm && (
                    <Link href="/detectors/new">
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Detector
                      </Button>
                    </Link>
                  )}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Confidence</TableHead>
                      <TableHead>Patterns</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCustomDetectors.map((detector) => (
                      <TableRow key={detector.detector_id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{detector.detector_id}</div>
                            <div className="text-sm text-muted-foreground">{detector.description}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getDetectorTypeColor(detector.detector_type)}>
                            {detector.detector_type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={detector.enabled ? "default" : "secondary"}>
                            {detector.enabled ? "Enabled" : "Disabled"}
                          </Badge>
                        </TableCell>
                        <TableCell>{detector.confidence_threshold}</TableCell>
                        <TableCell>{detector.patterns?.length || 0}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Link href={`/detectors/${detector.detector_id}`}>
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Link href={`/detectors/${detector.detector_id}/edit`}>
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteDetector(detector.detector_id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        )}

        {/* Built-in Detectors Tab */}
        {activeTab === "builtin" && (
          <Card>
            <CardHeader>
              <CardTitle>Built-in Detectors</CardTitle>
              <CardDescription>System-provided detectors for common security patterns</CardDescription>
            </CardHeader>
            <CardContent>
              {filteredBuiltinDetectors.length === 0 ? (
                <div className="text-center py-12">
                  <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    No built-in detectors found
                  </h3>
                  <p className="text-muted-foreground">
                    {searchTerm ? "Try adjusting your search terms" : "No built-in detectors available"}
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Confidence</TableHead>
                      <TableHead>Source</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBuiltinDetectors.map((detector) => (
                      <TableRow key={detector.detector_id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{detector.name}</div>
                            <div className="text-sm text-muted-foreground">{detector.description}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getDetectorTypeColor(detector.detector_type)}>
                            {detector.detector_type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={detector.enabled ? "default" : "secondary"}>
                            {detector.enabled ? "Enabled" : "Disabled"}
                          </Badge>
                        </TableCell>
                        <TableCell>{detector.confidence_threshold}</TableCell>
                        <TableCell>
                          <Badge variant="outline">Built-in</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
