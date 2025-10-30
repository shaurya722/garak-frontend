"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  TestTube,
  Zap,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { apiConfig } from "@/config/api";
import api from "@/api/axios";
import MainLayout from "@/components/layout/main-layout";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { DeleteConfirmationDialog } from "@/components/dialogs/delete-confirmation-dialog";

interface Detector {
  id: string;
  detectorName: string;
  description: string;
  creationType: "External" | "BuiltIn";
  detectorType: string;
  confidence: number;
  regex: string[];
  enabled?: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  totalDocs: number;
  totalPages: number;
}

interface DetectorResponse {
  docs: Detector[];
  pagination: Pagination;
}

function DetectorsPageContent() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [customDetectors, setCustomDetectors] = useState<Detector[]>([]);
  const [builtinDetectors, setBuiltinDetectors] = useState<Detector[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"custom" | "builtin">("custom");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [detectorToDelete, setDetectorToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    totalDocs: 0,
    totalPages: 1,
  });
  const [expandedDetector, setExpandedDetector] = useState<string | null>(null);

  const toggleExpand = (detectorId: string) => {
    setExpandedDetector(expandedDetector === detectorId ? null : detectorId);
  };

  const fetchDetectors = useCallback(
    async (type: "custom" | "builtin") => {
      setLoading(true);
      try {
        const creationType = type === "custom" ? "External" : "BuiltIn";
        const response = await api.post(
          `${apiConfig.endpoints.detectorsList}?page=${page}&limit=${limit}`,
          { creationType }
        );

        const data: DetectorResponse = response.data?.data || response.data;
        const detectors = data?.docs || [];

        if (type === "custom") {
          setCustomDetectors(detectors);
        } else {
          setBuiltinDetectors(detectors);
        }

        if (data?.pagination) {
          setPagination({
            page: data.pagination.page,
            limit: data.pagination.limit,
            totalDocs: data.pagination.totalDocs,
            totalPages: data.pagination.totalPages,
          });
        }
      } catch (error) {
        console.error("Failed to fetch detectors:", error);
        toast.error("Failed to load detectors");
        if (type === "custom") {
          setCustomDetectors([]);
        } else {
          setBuiltinDetectors([]);
        }
      } finally {
        setLoading(false);
      }
    },
    [page, limit] // Make sure these are in the dependency array
  );

  useEffect(() => {
    fetchDetectors(activeTab);
  }, [activeTab, fetchDetectors, page]);

  const handleDeleteDetector = async (detectorId: string) => {
    setDetectorToDelete(detectorId);
    setIsDeleteDialogOpen(true);
  };

  const openDeleteDialog = (detectorId: string) => {
    setDetectorToDelete(detectorId);
    setIsDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setDetectorToDelete(null);
    setIsDeleting(false);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await api.delete(apiConfig.endpoints.deleteDetector(detectorToDelete!));
      toast.success("Detector deleted successfully");
      fetchDetectors(activeTab);
    } catch (error) {
      console.error("Failed to delete detector:", error);
      toast.error("Failed to delete detector");
    }
  };

  const filteredCustomDetectors = customDetectors.filter(
    (detector) =>
      detector.detectorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      detector.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      detector.detectorType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredBuiltinDetectors = builtinDetectors.filter(
    (detector) =>
      detector.detectorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      detector.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      detector.detectorType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getDetectorTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      REGEX: "bg-blue-100 text-blue-800",
      PII: "bg-green-100 text-green-800",
      HEURISTIC: "bg-purple-100 text-purple-800",
      EMBEDDING: "bg-orange-100 text-orange-800",
      PACKAGE_REGISTRY: "bg-red-100 text-red-800",
    };
    return colors[type] || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen flex justify-center items-center">
          <Shield className="h-12 w-12 text-red-600 animate-pulse" />
          <p className="ml-4 text-gray-600 dark:text-gray-400">
            Loading detectors...
          </p>
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
            <h1 className="text-3xl font-bold tracking-tight">
              Security Detectors
            </h1>
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

        {/* Search & Tabs */}
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
              Custom Detectors
            </button>
            <button
              onClick={() => setActiveTab("builtin")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === "builtin"
                  ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              Built-in Detectors
            </button>
          </div>
        </div>

        {/* === Custom Detectors (Expandable) === */}
        {activeTab === "custom" && (
          <Card>
            <CardHeader>
              <CardTitle>Custom Detectors</CardTitle>
              <CardDescription>
                User-created detectors for specialized security analysis
              </CardDescription>
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
                      : "Create your first custom detector to get started"}
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
                      <TableHead>Confidence</TableHead>
                      <TableHead>Patterns</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCustomDetectors.map((detector) => (
                      <>
                        <TableRow
                          key={detector.id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => toggleExpand(detector.id)}
                        >
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              {expandedDetector === detector.id ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                              <div>
                                <div className="font-medium">
                                  {detector.detectorName}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {detector.description}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={getDetectorTypeColor(
                                detector.detectorType
                              )}
                            >
                              {detector.detectorType}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {Math.round(detector.confidence * 100)}%
                          </TableCell>
                          <TableCell>
                            {detector.regex.length} patterns
                          </TableCell>
                          <TableCell>
                            {new Date(detector.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <Link href={`/detectors/${detector.id}`}>
                                <Button variant="ghost" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Link href={`/detectors/${detector.id}/edit`}>
                                <Button variant="ghost" size="sm">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openDeleteDialog(detector.id);
                                }}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                disabled={isDeleting}
                              >
                                {isDeleting &&
                                detectorToDelete === detector.id ? (
                                  <div className="h-4 w-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>

                        {expandedDetector === detector.id && (
                          <TableRow className="bg-muted/10">
                            <TableCell colSpan={6} className="p-0">
                              <div className="p-4 space-y-2">
                                <h4 className="text-sm font-medium mb-2">
                                  Detection Patterns:
                                </h4>
                                <div className="space-y-2">
                                  {detector.regex.map((pattern, idx) => (
                                    <div
                                      key={idx}
                                      className="bg-muted/30 p-2 rounded-md"
                                    >
                                      <code className="text-xs font-mono break-all">
                                        {pattern}
                                      </code>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </>
                    ))}
                  </TableBody>
                  {/* Pagination Controls */}
                 
                </Table>
              )}
               {pagination.totalPages > 0 && (
                    <div className="flex items-center justify-between px-2 py-4">
                      <div className="flex-1 text-sm text-muted-foreground">
                        Showing page {pagination.page} of{" "}
                        {pagination.totalPages}
                      </div>
                      <div className="flex items-center space-x-6 lg:space-x-8">
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-medium">Rows per page</p>
                          <select
                            value={limit}
                            onChange={(e) => {
                              setLimit(Number(e.target.value));
                              setPage(1); // Reset to first page when changing page size
                            }}
                            className="h-8 w-[70px] rounded-md border border-input bg-background px-3 py-1 text-sm"
                          >
                            {[5, 10, 20, 30, 40, 50].map((size) => (
                              <option key={size} value={size}>
                                {size}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            className="h-8 w-8 p-0"
                            onClick={() =>
                              setPage((prev) => Math.max(prev - 1, 1))
                            }
                            disabled={pagination.page === 1}
                          >
                            <span className="sr-only">Go to previous page</span>
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                            Page {pagination.page} of {pagination.totalPages}
                          </div>
                          <Button
                            variant="outline"
                            className="h-8 w-8 p-0"
                            onClick={() =>
                              setPage((prev) =>
                                Math.min(prev + 1, pagination.totalPages)
                              )
                            }
                            disabled={
                              pagination.page === pagination.totalPages ||
                              pagination.totalPages === 0
                            }
                          >
                            <span className="sr-only">Go to next page</span>
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
            </CardContent>
          </Card>
        )}

        {/* === Built-in Detectors (Expandable) === */}
        {activeTab === "builtin" && (
          <Card>
            <CardHeader>
              <CardTitle>Built-in Detectors</CardTitle>
              <CardDescription>
                System-provided detectors for common security patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Confidence</TableHead>
                    <TableHead>Patterns</TableHead>
                    <TableHead>Source</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBuiltinDetectors.map((detector) => (
                    <>
                      <TableRow
                        key={detector.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => toggleExpand(detector.id)}
                      >
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {expandedDetector === detector.id ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                            <div>
                              <div className="font-medium">
                                {detector.detectorName}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {detector.description}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={getDetectorTypeColor(
                              detector.detectorType
                            )}
                          >
                            {detector.detectorType}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {Math.round(detector.confidence * 100)}%
                        </TableCell>
                        <TableCell>{detector.regex.length} patterns</TableCell>
                        <TableCell>
                          <Badge variant="outline">Built-in</Badge>
                        </TableCell>
                      </TableRow>

                      {expandedDetector === detector.id && (
                        <TableRow className="bg-muted/10">
                          <TableCell colSpan={5} className="p-0">
                            <div className="p-4 space-y-2">
                              <h4 className="text-sm font-medium mb-2">
                                Detection Patterns:
                              </h4>
                              <div className="space-y-2">
                                {detector.regex.map((pattern, idx) => (
                                  <div
                                    key={idx}
                                    className="bg-muted/30 p-2 rounded-md"
                                  >
                                    <code className="text-xs font-mono break-all">
                                      {pattern}
                                    </code>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={closeDeleteDialog}
        onConfirm={handleConfirmDelete} // Changed from handleDeleteConfirm to handleConfirmDelete
        title="Delete Detector"
        description="Are you sure you want to delete this detector? This action cannot be undone."
        confirmText={isDeleting ? "Deleting..." : "Delete"}
        isLoading={isDeleting}
      />
    </MainLayout>
  );
}

export default function DetectorsPage() {
  return (
    <ProtectedRoute>
      <DetectorsPageContent />
    </ProtectedRoute>
  );
}
