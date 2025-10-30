// src/components/detectors/detector-view.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, ArrowLeft, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import api from "@/api/axios";
import { apiConfig } from "@/config/api";

interface Detector {
  id: string;
  detectorName: string;
  description: string;
  detectorType: string;
  confidence: number;
  regex: string[];
  createdAt: string;
  updatedAt: string;
  creationType?: string;
}

export function DetectorView({ detectorId }: { detectorId: string }) {
  const router = useRouter();
  const [detector, setDetector] = useState<Detector | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetector = async () => {
      try {
        // For testing with the provided data, you can uncomment this:
        // const mockData = {
        //   id: "adf9872e-a2c2-4b1f-87f0-dcd1992cfb46",
        //   detectorName: "bbbbb",
        //   description: "dfgdfgdfgdfgdfgdfgdfg",
        //   detectorType: "HEURISTIC",
        //   confidence: 0.7,
        //   regex: [
        //     '(?i)(?:api[_-]?key|secret)[^:\\n]*[:=]\\s*[A-Za-z0-9\\-\\._]{16,}',
        //     'ghp_[A-Za-z0-9]{36}'
        //   ],
        //   createdAt: "2025-10-30T06:36:21.987Z",
        //   updatedAt: "2025-10-30T07:04:49.470Z",
        //   creationType: "External"
        // };
        // setDetector(mockData);
        
        const response = await api.get(apiConfig.endpoints.getDetector(detectorId));
        const data = response.data.data?.detector || response.data;
        setDetector(data);
        console.log('Detector data:', data);
      } catch (error) {
        console.error("Failed to fetch detector:", error);
        toast.error("Failed to load detector details");
      } finally {
        setLoading(false);
      }
    };

    if (detectorId) {
      fetchDetector();
    }
  }, [detectorId]);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this detector?")) return;

    try {
      await api.delete(apiConfig.endpoints.deleteDetector(detectorId));
      toast.success("Detector deleted successfully");
      router.push("/detectors");
    } catch (error) {
      console.error("Failed to delete detector:", error);
      toast.error("Failed to delete detector");
    }
  };

  const getDetectorTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      regex: "bg-blue-100 text-blue-800",
      heuristic: "bg-green-100 text-green-800",
      classifier: "bg-purple-100 text-purple-800",
      embedding: "bg-orange-100 text-orange-800",
      pii: "bg-yellow-100 text-yellow-800",
    };
    return colors[type.toLowerCase()] || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading detector details...</p>
        </div>
      </div>
    );
  }

  if (!detector) {
    return (
      <div className="text-center py-12">
        <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium">Detector not found</h3>
        <p className="text-muted-foreground mt-2">
          The requested detector could not be found.
        </p>
        <Button className="mt-4" onClick={() => router.push("/detectors")}>
          Back to Detectors
        </Button>
      </div>
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
            <Link href={`/detectors/${detectorId}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Link>
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
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
            <div className="text-2xl font-bold">{detector.confidence}</div>
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