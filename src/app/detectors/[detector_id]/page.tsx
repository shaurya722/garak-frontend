// src/app/detectors/[detector_id]/view/page.tsx
"use client";

import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import MainLayout from "@/components/layout/main-layout";
import { DetectorView } from "@/components/detectors/detector-view";

export default function ViewDetectorPage() {
  const params = useParams();
  const router = useRouter();
  const detectorId = params.detector_id as string;

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Detectors
          </Button>
        </div>

        <DetectorView detectorId={detectorId} />
      </div>
    </MainLayout>
  );
}