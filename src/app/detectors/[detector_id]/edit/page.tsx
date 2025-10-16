"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Shield, ArrowLeft, Plus, Trash2, Save } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { apiConfig, getDetectorUrl } from "@/config/api";
import api from "@/lib/axios";
import MainLayout from "@/components/layout/main-layout";

interface DetectorForm {
  detector_id: string;
  detector_type: string;
  name: string;
  description: string;
  confidence_threshold: number;
  patterns: string[];
  enabled: boolean;
}

export default function EditDetectorPage() {
  const params = useParams();
  const router = useRouter();
  const detectorId = params.detector_id as string;

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [detectorTypes, setDetectorTypes] = useState<string[]>([]);
  const [formData, setFormData] = useState<DetectorForm>({
    detector_id: "",
    detector_type: "regex",
    name: "",
    description: "",
    confidence_threshold: 0.8,
    patterns: [""],
    enabled: true,
  });

  useEffect(() => {
    if (detectorId) {
      fetchDetector();
      fetchDetectorTypes();
    }
  }, [detectorId]);

  const fetchDetector = async () => {
    try {
      const { data } = await api.get(getDetectorUrl(detectorId));
      setFormData({
        detector_id: data.detector_id,
        detector_type: data.detector_type,
        name: data.name,
        description: data.description,
        confidence_threshold: data.confidence_threshold,
        patterns: data.patterns || [""],
        enabled: data.enabled,
      });
    } catch (error) {
      console.error("Failed to fetch detector:", error);
      toast.error("Failed to load detector");
    } finally {
      setInitialLoading(false);
    }
  };

  const fetchDetectorTypes = async () => {
    try {
      const { data } = await api.get(apiConfig.endpoints.detectorsTypes);
      setDetectorTypes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch detector types:", error);
    }
  };

  const handleInputChange = (field: keyof DetectorForm, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePatternChange = (index: number, value: string) => {
    const newPatterns = [...formData.patterns];
    newPatterns[index] = value;
    setFormData((prev) => ({
      ...prev,
      patterns: newPatterns,
    }));
  };

  const addPattern = () => {
    setFormData((prev) => ({
      ...prev,
      patterns: [...prev.patterns, ""],
    }));
  };

  const removePattern = (index: number) => {
    if (formData.patterns.length > 1) {
      const newPatterns = formData.patterns.filter((_, i) => i !== index);
      setFormData((prev) => ({
        ...prev,
        patterns: newPatterns,
      }));
    }
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      toast.error("Detector name is required");
      return false;
    }

    if (!formData.description.trim()) {
      toast.error("Description is required");
      return false;
    }

    if (
      formData.confidence_threshold < 0 ||
      formData.confidence_threshold > 1
    ) {
      toast.error("Confidence threshold must be between 0 and 1");
      return false;
    }

    if (
      formData.detector_type === "regex" &&
      formData.patterns.some((p) => !p.trim())
    ) {
      toast.error("All patterns must be filled or removed");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      const payload = {
        ...formData,
        patterns: formData.patterns.filter((p) => p.trim()), // Remove empty patterns
      };
      await api.put(getDetectorUrl(detectorId), payload);
      toast.success("Detector updated successfully!");
      router.push(`/detectors/${detectorId}`);
    } catch (error) {
      console.error("Failed to update detector:", error);
      toast.error("Failed to update detector");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <MainLayout>
        <div className="min-h-screen ">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <Shield className="h-12 w-12 text-red-600 mx-auto mb-4 animate-pulse" />
                <p className="text dark:text-gray-400">Loading detector...</p>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen ">
        {/* Header */}
        <header className="border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link href={`/detectors/${detectorId}`}>
                  <Button variant="ghost" size="sm">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Detector
                  </Button>
                </Link>
                <div className="flex items-center space-x-2">
                  <Shield className="h-8 w-8 text-red-600" />
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Edit Detector
                  </h1>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8 max-w-4xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Configure the basic properties of your detector
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="detector_id">Detector ID</Label>
                    <Input
                      id="detector_id"
                      value={formData.detector_id}
                      disabled
                      className="bg-gray-50 dark:bg-gray-800"
                    />
                    <p className="text-xs text-gray-600 mt-1">
                      Detector ID cannot be changed
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="detector_type">Detector Type</Label>
                    <Select
                      value={formData.detector_type}
                      onValueChange={(value) =>
                        handleInputChange("detector_type", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {detectorTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="name">Detector Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="My Custom Detector"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    placeholder="Describe what this detector identifies..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="confidence_threshold">
                      Confidence Threshold
                    </Label>
                    <Input
                      id="confidence_threshold"
                      type="number"
                      min="0"
                      max="1"
                      step="0.1"
                      value={formData.confidence_threshold}
                      onChange={(e) =>
                        handleInputChange(
                          "confidence_threshold",
                          parseFloat(e.target.value)
                        )
                      }
                    />
                    <p className="text-xs text-gray-600 mt-1">
                      Minimum confidence score (0.0 - 1.0)
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 pt-6">
                    <Checkbox
                      id="enabled"
                      checked={formData.enabled}
                      onCheckedChange={(checked) =>
                        handleInputChange("enabled", checked)
                      }
                    />
                    <Label htmlFor="enabled">Enable detector</Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Patterns Configuration */}
            {formData.detector_type === "regex" && (
              <Card>
                <CardHeader>
                  <CardTitle>Detection Patterns</CardTitle>
                  <CardDescription>
                    Define regex patterns that this detector will use to
                    identify content
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {formData.patterns.map((pattern, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="flex-1">
                        <Label htmlFor={`pattern-${index}`}>
                          Pattern {index + 1}
                        </Label>
                        <Input
                          id={`pattern-${index}`}
                          value={pattern}
                          onChange={(e) =>
                            handlePatternChange(index, e.target.value)
                          }
                          placeholder="(?i)api[_-]?key[^:\n]*[:=]\s*[A-Za-z0-9\-\._]{20,}"
                        />
                      </div>
                      {formData.patterns.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removePattern(index)}
                          className="text-red-600 hover:text-red-700 mt-6"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    onClick={addPattern}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Pattern
                  </Button>

                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                      Pattern Examples:
                    </h4>
                    <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                      <li>
                        <code>
                          (?i)api[_-]?key[^:\n]*[:=]\s*[A-Za-z0-9\-\._]&#123;20,&#125;
                        </code>{" "}
                        - API keys
                      </li>
                      <li>
                        <code>sk-[A-Za-z0-9]&#123;48&#125;</code> - OpenAI API
                        keys
                      </li>
                      <li>
                        <code>
                          \b\d&#123;3&#125;-\d&#123;2&#125;-\d&#123;4&#125;\b
                        </code>{" "}
                        - SSN format
                      </li>
                      <li>
                        <code>(?i)password[^:\n]*[:=]\s*\S+</code> - Password
                        patterns
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Detector Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <p>
                    <strong>ID:</strong> {formData.detector_id}
                  </p>
                  <p>
                    <strong>Name:</strong> {formData.name || "Not specified"}
                  </p>
                  <p>
                    <strong>Type:</strong> {formData.detector_type}
                  </p>
                  <p>
                    <strong>Confidence Threshold:</strong>{" "}
                    {formData.confidence_threshold}
                  </p>
                  <p>
                    <strong>Status:</strong>{" "}
                    {formData.enabled ? "Enabled" : "Disabled"}
                  </p>
                  {formData.detector_type === "regex" && (
                    <p>
                      <strong>Patterns:</strong>{" "}
                      {formData.patterns.filter((p) => p.trim()).length} defined
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex space-x-4">
              <Button type="submit" disabled={loading} className="flex-1">
                <Save className="h-4 w-4 mr-2" />
                {loading ? "Updating..." : "Update Detector"}
              </Button>
              <Link href={`/detectors/${detectorId}`}>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </main>
      </div>
    </MainLayout>
  );
}
