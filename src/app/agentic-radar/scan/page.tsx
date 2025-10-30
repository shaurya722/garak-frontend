"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, Download, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/api/axios";
import { apiConfig } from "@/config/api";
import MainLayout from "@/components/layout/main-layout";

type FrameworkName = string;

interface ScanStatus {
  status: "scanning" | "converting_to_pdf" | "uploading" | "completed" | "error";
  progress?: number;
  message?: string;
}

interface ScanResult {
  scan_id?: string;
  report_url?: string;
  pdf_url?: string;
  message?: string;
  validation?: string;
  framework?: string;
}

export default function AgenticRadarScanPage() {
  const [frameworks, setFrameworks] = useState<FrameworkName[]>([]);
  const [selectedFramework, setSelectedFramework] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanId, setScanId] = useState<string | null>(null);
  const [scanStatus, setScanStatus] = useState<ScanStatus | null>(null);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);

  // Fetch supported frameworks on component mount
  useEffect(() => {
    fetchFrameworks();
  }, []);

  // Poll for scan status if scanning
  useEffect(() => {
    if (scanning && scanId) {
      const interval = setInterval(() => {
        checkScanStatus();
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [scanning, scanId]);

  const fetchFrameworks = async () => {
    try {
      const { data } = await api.get(apiConfig.endpoints.agenticRadarFrameworks);
      setFrameworks(data.supported_frameworks);
      const list = Array.isArray(data?.supported_frameworks)
        ? data.supported_frameworks
        : (data?.frameworks || []);
      const names = list
        .map((f: string | { name?: string; value?: string }) => (typeof f === "string" ? f : (f?.name ?? f?.value)))
        .filter(Boolean);
      setFrameworks(names as string[]);
      console.log('dfdf',data);
    } catch (error) {
      console.error("Failed to fetch frameworks:", error);
      toast.error("Failed to load supported frameworks");
    }
  };

  const checkScanStatus = async () => {
    if (!scanId) return;

    try {
      const { data } = await api.get(apiConfig.endpoints.agenticRadarStatus(scanId));
      setScanStatus(data);

      if (data.status === "completed") {
        setScanning(false);
        setScanResult(data);
        toast.success("Scan completed successfully!");
      } else if (data.status === "error") {
        setScanning(false);
        toast.error(`Scan failed: ${data.message}`);
      }
    } catch (error) {
      console.error("Failed to check scan status:", error);
    }
  };

  const handleFileSelect = (file: File) => {
    if (!file.name.endsWith(".zip")) {
      toast.error("Please select a valid ZIP file");
      return;
    }
    setSelectedFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const startScan = async () => {
    if (!selectedFramework || !selectedFile) {
      toast.error("Please select a framework and upload a ZIP file");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("framework", selectedFramework);
      formData.append("zip_file", selectedFile);

      const { data } = await api.post(apiConfig.endpoints.agenticRadarScan, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setScanId(data.scan_id);
      setScanning(true);
      setScanResult(null);
      toast.success("Scan started successfully!");
    } catch (error) {
      console.error("Failed to start scan:", error);
      toast.error("Failed to start scan. Please check your file and try again.");
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = () => {
    const url = scanResult?.report_url ?? scanResult?.pdf_url;
    if (url) {
      window.open(url, "_blank");
    } else {
      toast.error("Report URL not available yet");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Loader2 className="h-4 w-4 animate-spin text-blue-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "error":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br">
        <header className="border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <FileText className="h-8 w-8 text-blue-600" />
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Agentic Radar Scan
                </h1>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="space-y-6">
            {/* Framework Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Select Framework</CardTitle>
                <CardDescription>
                  Choose the agentic framework you want to scan
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="framework">Framework</Label>
                    <Select value={selectedFramework} onValueChange={setSelectedFramework}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a framework" />
                      </SelectTrigger>
                      <SelectContent>
                        {frameworks.map((name) => (
                          <SelectItem key={name} value={name}>
                            {name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* File Upload */}
            <Card>
              <CardHeader>
                <CardTitle>Upload Project Files</CardTitle>
                <CardDescription>
                  Upload a ZIP file containing your agentic workflow code
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    isDragOver
                      ? "border-blue-400 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-300 dark:border-gray-600"
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-medium mb-2">
                    Drag and drop your ZIP file here
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Or click to browse for files
                  </p>
                  <Input
                    type="file"
                    accept=".zip"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileSelect(file);
                    }}
                    className="hidden"
                    id="file-upload"
                  />
                  <Label htmlFor="file-upload">
                    <Button variant="outline" asChild>
                      <span>Choose File</span>
                    </Button>
                  </Label>
                  {selectedFile && (
                    <p className="mt-4 text-sm text-green-600 dark:text-green-400">
                      Selected: {selectedFile.name}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Scan Status */}
            {scanning && scanStatus && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    {getStatusIcon(scanStatus.status)}
                    <span>Scan in Progress</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge className={getStatusColor(scanStatus.status)}>
                      {scanStatus.status.replace("_", " ").toUpperCase()}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      Scan ID: {scanId}
                    </span>
                  </div>
                  {scanStatus.progress !== undefined && (
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Progress</span>
                        <span>{scanStatus.progress}%</span>
                      </div>
                      <Progress value={scanStatus.progress} className="w-full" />
                    </div>
                  )}
                  {scanStatus.message && (
                    <p className="text-sm text-muted-foreground">{scanStatus.message}</p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Scan Results */}
            {scanResult && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span>Scan Completed</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Framework</Label>
                      <p className="font-medium">{scanResult.framework}</p>
                    </div>
                    <div>
                      <Label>Scan ID</Label>
                      <p className="font-medium">{scanResult.scan_id ?? scanId}</p>
                    </div>
                  </div>
                  <div>
                    <Label>Message</Label>
                    <p className="text-sm text-muted-foreground">{scanResult.message ?? scanResult.validation ?? "Scan completed"}</p>
                  </div>
                  <Button onClick={downloadReport} className="w-full" disabled={!(scanResult.report_url ?? scanResult.pdf_url)}>
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF Report
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <div className="flex space-x-4">
              <Button
                onClick={startScan}
                disabled={loading || scanning || !selectedFramework || !selectedFile}
                className="flex-1"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Starting Scan...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4 mr-2" />
                    Start Scan
                  </>
                )}
              </Button>
            </div>
          </div>
        </main>
      </div>
    </MainLayout>
  );
}
