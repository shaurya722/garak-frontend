"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDetector, useDeleteDetector } from "@/hooks";
import { LoadingSpinner, EmptyState } from "@/components/shared";
import { DETECTOR_TYPE_COLORS, ROUTES } from "@/constants";
import { formatPercentage } from "@/lib/utils";

export function DetectorView({ detectorId }: { detectorId: string }) {
  const router = useRouter();
  const { data: detector, isLoading, error } = useDetector(detectorId);
  const deleteMutation = useDeleteDetector();

  const handleDelete = () => {
    if (!confirm("Are you sure you want to delete this detector?")) return;

    deleteMutation.mutate(detectorId, {
      onSuccess: () => {
        router.push(ROUTES.DETECTORS);
      },
    });
  };

  const getDetectorTypeColor = (type: string) => {
    return DETECTOR_TYPE_COLORS[type] || DETECTOR_TYPE_COLORS.default;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-muted-foreground">Loading detector details...</p>
        </div>
      </div>
    );
  }

  if (error || !detector) {
    return (
      <EmptyState
        icon={Shield}
        title="Detector not found"
        description="The requested detector could not be found."
        action={{
          label: "Back to Detectors",
          onClick: () => router.push(ROUTES.DETECTORS),
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{detector.detectorName}</h2>
          <p className="text-muted-foreground mt-1">
            {detector.description}
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" asChild>
            <Link href={ROUTES.DETECTOR_EDIT(detectorId)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Link>
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {deleteMutation.isPending ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Detector ID
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-mono">{detector.id}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge className={getDetectorTypeColor(detector.detectorType)}>
              {detector.detectorType}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Confidence
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage(detector.confidence)}</div>
          </CardContent>
        </Card>
      </div>

      {detector.regex && detector.regex.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Detection Patterns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {detector.regex.map((pattern, i) => (
                <div
                  key={i}
                  className="p-3 bg-muted/50 rounded-md font-mono text-sm overflow-x-auto"
                >
                  {pattern}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Metadata</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {detector.creationType && (
              <div>
                <p className="text-sm text-muted-foreground">Creation Type</p>
                <p className="text-sm capitalize">{detector.creationType.toLowerCase()}</p>
              </div>
            )}
           
          </CardContent>
        </Card>
      </div> */}
    </div>
  );
}