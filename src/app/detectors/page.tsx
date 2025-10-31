"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Eye, Edit, Trash2, TestTube, Zap, ChevronDown, ChevronRight } from "lucide-react";
import Link from "next/link";
import MainLayout from "@/components/layout/main-layout";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { DeleteConfirmDialog } from "@/components/dialogs/delete-confirmation-dialog";
import { PageLoader, ErrorMessage, EmptyState, Pagination } from "@/components/shared";
import { useDetectors, useDeleteDetector } from "@/hooks";
import { DETECTOR_TYPE_COLORS, ROUTES, PAGINATION_DEFAULTS } from "@/constants";
import { formatDate, formatPercentage } from "@/lib/utils";
import { Detector } from "@/types";

function DetectorsPageContent() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"custom" | "builtin">("custom");
  const [page, setPage] = useState<number>(PAGINATION_DEFAULTS.PAGE);
  const [limit, setLimit] = useState<number>(PAGINATION_DEFAULTS.LIMIT);
  const [expandedDetector, setExpandedDetector] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [detectorToDelete, setDetectorToDelete] = useState<string | null>(null);

  // Fetch detectors using TanStack Query
  const creationType = activeTab === "custom" ? "External" : "BuiltIn";
  const { data, isLoading, error, refetch } = useDetectors({ page, limit, creationType });
  
  // Delete mutation
  const deleteMutation = useDeleteDetector();

  const toggleExpand = (detectorId: string) => {
    setExpandedDetector(expandedDetector === detectorId ? null : detectorId);
  };

  const openDeleteDialog = (detectorId: string) => {
    setDetectorToDelete(detectorId);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!detectorToDelete) return;

    deleteMutation.mutate(detectorToDelete, {
      onSuccess: () => {
        setIsDeleteDialogOpen(false);
        setDetectorToDelete(null);
        refetch();
      },
    });
  };

  const getDetectorTypeColor = (type: string) => {
    return DETECTOR_TYPE_COLORS[type] || DETECTOR_TYPE_COLORS.default;
  };

  // Filter detectors based on search
  const filteredDetectors = data?.docs.filter(
    (detector) =>
      detector.detectorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      detector.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      detector.detectorType.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Loading state
  if (isLoading) {
    return (
      <MainLayout>
        <PageLoader message="Loading detectors..." />
      </MainLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <MainLayout>
        <div className="py-6 px-6">
          <ErrorMessage 
            message="Failed to load detectors" 
            onRetry={() => refetch()}
          />
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
            <h1 className="text-3xl font-bold tracking-tight">Security Detectors</h1>
            <p className="text-muted-foreground">
              Manage custom detectors and view built-in detection capabilities
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Link href={ROUTES.DETECTORS_TEST}>
              <Button variant="outline">
                <TestTube className="h-4 w-4 mr-2" />
                Test Detectors
              </Button>
            </Link>
            <Link href={ROUTES.DETECTORS_NEW}>
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
              onClick={() => {
                setActiveTab("custom");
                setPage(1);
              }}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === "custom"
                  ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              Custom Detectors
            </button>
            <button
              onClick={() => {
                setActiveTab("builtin");
                setPage(1);
              }}
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

        {/* Detectors Table */}
        <Card>
          <CardHeader>
            <CardTitle>{activeTab === "custom" ? "Custom" : "Built-in"} Detectors</CardTitle>
            <CardDescription>
              {activeTab === "custom"
                ? "User-created detectors for specialized security analysis"
                : "System-provided detectors for common security patterns"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredDetectors.length === 0 ? (
              <EmptyState
                icon={Zap}
                title={searchTerm ? "No detectors found" : `No ${activeTab} detectors`}
                description={
                  searchTerm
                    ? "Try adjusting your search terms"
                    : activeTab === "custom"
                    ? "Create your first custom detector to get started"
                    : undefined
                }
                action={
                  !searchTerm && activeTab === "custom"
                    ? {
                        label: "Create Detector",
                        onClick: () => router.push(ROUTES.DETECTORS_NEW),
                      }
                    : undefined
                }
              />
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Confidence</TableHead>
                      <TableHead>Patterns</TableHead>
                      <TableHead>Created</TableHead>
                      {activeTab === "custom" && (
                        <TableHead className="text-right">Actions</TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDetectors.map((detector) => (
                      <DetectorRow
                        key={detector.id}
                        detector={detector}
                        isExpanded={expandedDetector === detector.id}
                        onToggleExpand={toggleExpand}
                        onDelete={openDeleteDialog}
                        getTypeColor={getDetectorTypeColor}
                        showActions={activeTab === "custom"}
                      />
                    ))}
                  </TableBody>
                </Table>

                {/* Pagination */}
                {data && data.totalPages > 0 && (
                  <Pagination
                    page={data.currentPage}
                    totalPages={data.totalPages}
                    onPageChange={setPage}
                    pageSize={limit}
                    onPageSizeChange={setLimit}
                  />
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        title="Delete Detector"
        description="Are you sure you want to delete this detector? This action cannot be undone."
        confirmText={deleteMutation.isPending ? "Deleting..." : "Delete"}
      />
    </MainLayout>
  );
}

// Extracted Detector Row Component
interface DetectorRowProps {
  detector: Detector;
  isExpanded: boolean;
  onToggleExpand: (id: string) => void;
  onDelete: (id: string) => void;
  getTypeColor: (type: string) => string;
  showActions: boolean;
}

function DetectorRow({
  detector,
  isExpanded,
  onToggleExpand,
  onDelete,
  getTypeColor,
  showActions,
}: DetectorRowProps) {
  return (
    <>
      <TableRow
        className="cursor-pointer hover:bg-muted/50"
        onClick={() => onToggleExpand(detector.id)}
      >
        <TableCell>
          <div className="flex items-center space-x-2">
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
            <div>
              <div className="font-medium">{detector.detectorName}</div>
              <div className="text-sm text-muted-foreground">
                {detector.description}
              </div>
            </div>
          </div>
        </TableCell>
        <TableCell>
          <Badge className={getTypeColor(detector.detectorType)}>
            {detector.detectorType}
          </Badge>
        </TableCell>
        <TableCell>{formatPercentage(detector.confidence)}</TableCell>
        <TableCell>{detector.regex.length} patterns</TableCell>
        <TableCell>{formatDate(detector.createdAt)}</TableCell>
        {showActions && (
          <TableCell className="text-right">
            <div className="flex items-center justify-end space-x-2">
              <Link href={ROUTES.DETECTOR_VIEW(detector.id)}>
                <Button variant="ghost" size="sm">
                  <Eye className="h-4 w-4" />
                </Button>
              </Link>
              <Link href={ROUTES.DETECTOR_EDIT(detector.id)}>
                <Button variant="ghost" size="sm">
                  <Edit className="h-4 w-4" />
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(detector.id);
                }}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </TableCell>
        )}
      </TableRow>

      {isExpanded && (
        <TableRow className="bg-muted/10">
          <TableCell colSpan={showActions ? 6 : 5} className="p-0">
            <div className="p-4 space-y-2">
              <h4 className="text-sm font-medium mb-2">Detection Patterns:</h4>
              <div className="space-y-2">
                {detector.regex.map((pattern, idx) => (
                  <div key={idx} className="bg-muted/30 p-2 rounded-md">
                    <code className="text-xs font-mono break-all">{pattern}</code>
                  </div>
                ))}
              </div>
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

export default function DetectorsPage() {
  return (
    <ProtectedRoute>
      <DetectorsPageContent />
    </ProtectedRoute>
  );
}
