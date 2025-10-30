"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import MainLayout from "@/components/layout/main-layout";
import { DetectorForm } from "@/components/detectors/detector-form";
import { toast } from "sonner";

const defaultValues = {
  detectorName: "",
  description: "",
  detectorType: "",
  confidence: "0.7",
  regex: []
};

export default function NewDetectorPage() {
  const router = useRouter();

  const handleSuccess = () => {
    toast.success("Detector created successfully");
    router.push("/detectors");
    router.refresh();
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Create New Detector</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Detector Details</CardTitle>
            <CardDescription>
              Configure your custom security detector
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DetectorForm 
              mode="create"
              initialData={defaultValues}
              onSuccess={handleSuccess} 
            />
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
