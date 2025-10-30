"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Save, ArrowLeft, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { apiConfig } from "@/config/api";
import MainLayout from "@/components/layout/main-layout";
import api from "@/api/axios";

interface PolicyForm {
  policy_name: string;
  description: string;
  categories: string[];
  detector_ids: string[];
  use_builtin_detectors: boolean;
  is_default: boolean;
}

interface Detector {
  detector_id: string;
  name: string;
  description: string;
  detector_type: string;
  confidence_threshold: number;
  enabled: boolean;
}

function NewPolicyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [availableDetectors, setAvailableDetectors] = useState<Detector[]>([]);
  const [builtinDetectors, setBuiltinDetectors] = useState<Detector[]>([]);
  const [formData, setFormData] = useState<PolicyForm>({
    policy_name: "",
    description: "",
    categories: [],
    detector_ids: [],
    use_builtin_detectors: true,
    is_default: false
  });

  useEffect(() => {
    fetchProbes();
    fetchDetectors();
  }, []);

  const getCategoryDescription = (category: string): string => {
    const descriptions: Record<string, string> = {
      "Full Scan": "Comprehensive testing with all available probes (resource intensive)",
      "Content Safety & Toxicity": "Tests for harmful, toxic, and inappropriate content generation",
      "Jailbreaking & DAN Attacks": "Tests for jailbreak attempts and 'Do Anything Now' attacks",
      "Prompt Injection": "Tests for prompt injection vulnerabilities",
      "Encoding & Obfuscation": "Tests using encoded and obfuscated attack vectors",
      "Data Leakage & Privacy": "Tests for data leakage and privacy violation risks",
      "Malware & Exploitation": "Tests for malware generation and system exploitation",
      "Package & Code Security": "Tests for package hallucination and code security issues",
      "Misinformation & Deception": "Tests for misinformation and deceptive content generation",
      "Specialized Attacks": "Advanced and specialized attack vectors"
    };
    return descriptions[category] || "Security testing category";
  };

  const fetchProbes = async () => {
    try {
      const { data } = await api.get(apiConfig.endpoints.policiesCategories);
      setAvailableCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      toast.error("Failed to fetch categories");
    }
  };

  const fetchDetectors = async () => {
    try {
      const [{ data: customData }, { data: builtinData }] = await Promise.all([
        api.get(apiConfig.endpoints.detectors),
        api.get(apiConfig.endpoints.detectorsBuiltin)
      ]);
      setAvailableDetectors(Array.isArray(customData) ? customData : []);
      setBuiltinDetectors(Array.isArray(builtinData) ? builtinData : []);
    } catch (error) {
      console.error("Failed to fetch detectors:", error);
      toast.error("Failed to fetch detectors");
    }
  };

  const handleInputChange = (field: keyof PolicyForm, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCategoryToggle = (category: string, checked: boolean) => {
    setFormData(prev => {
      const newCategories = checked 
        ? [...prev.categories, category]
        : prev.categories.filter(c => c !== category);
      
      return {
        ...prev,
        categories: newCategories
      };
    });
  };

  const handleDetectorToggle = (detectorId: string, checked: boolean) => {
    setFormData(prev => {
      const newDetectorIds = checked 
        ? [...prev.detector_ids, detectorId]
        : prev.detector_ids.filter(id => id !== detectorId);
      
      return {
        ...prev,
        detector_ids: newDetectorIds
      };
    });
  };

  const validateForm = (): boolean => {
    if (!formData.policy_name.trim()) {
      toast.error("Please enter a policy name");
      return false;
    }
    
    if (formData.categories.length === 0) {
      toast.error("Please select at least one category");
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
        policy_name: formData.policy_name,
        description: formData.description || undefined,
        categories: formData.categories,
        detector_ids: formData.detector_ids,
        use_builtin_detectors: formData.use_builtin_detectors,
        is_default: formData.is_default
      };

      // Use enhanced policies endpoint if detectors are configured
      const useEnhancedEndpoint = formData.detector_ids.length > 0 || !formData.use_builtin_detectors;
      const endpoint = useEnhancedEndpoint 
        ? apiConfig.endpoints.enhancedPolicies 
        : apiConfig.endpoints.policies;
      await api.post(endpoint, payload);
      toast.success("Policy created successfully!");
      router.push("/policies");
    } catch (error) {
      console.error("Failed to create policy:", error);
      toast.error("Failed to create policy");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Create New Policy</h1>
            <p className="text-muted-foreground">
              Create a reusable security testing template with probe categories and detector Projects
            </p>
          </div>
          <Link href="/policies">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Policies
            </Button>
          </Link>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Policy Details */}
          <Card>
            <CardHeader>
              <CardTitle>Policy Details</CardTitle>
              <CardDescription>
                Basic information about your security testing policy
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="policy_name">Policy Name *</Label>
                <Input
                  id="policy_name"
                  value={formData.policy_name}
                  onChange={(e) => handleInputChange("policy_name", e.target.value)}
                  placeholder="e.g., Content Safety Suite"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Describe what this policy tests for..."
                  rows={3}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_default"
                  checked={formData.is_default}
                  onCheckedChange={(checked) => handleInputChange("is_default", checked)}
                />
                <Label htmlFor="is_default" className="text-sm">
                  Set as default policy
                </Label>
                <p className="text-xs text-gray-600">
                  (This will be used when no specific policy is selected)
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Category Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Security Categories</CardTitle>
              <CardDescription>
                Select which categories of security tests to include in this policy
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {availableCategories.map((category: string) => (
                  <div key={category} className={`${category === "Full Scan" ? "border-2 border-orange-200 dark:border-orange-800 rounded-lg p-4 bg-orange-50 dark:bg-orange-900/20" : "p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"}`}>
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id={category}
                        checked={formData.categories.includes(category)}
                        onCheckedChange={(checked) => handleCategoryToggle(category, checked as boolean)}
                      />
                      <div className="flex-1">
                        <Label htmlFor={category} className={`text-sm font-medium cursor-pointer ${category === "Full Scan" ? "text-orange-800 dark:text-orange-200" : ""}`}>
                          {category}
                        </Label>
                        <p className={`text-xs mt-1 ${category === "Full Scan" ? "text-orange-600 dark:text-orange-300" : "text-gray-600 dark:text-gray-400"}`}>
                          {getCategoryDescription(category)}
                        </p>
                        {category === "Full Scan" && (
                          <div className="mt-2 p-2 bg-orange-100 dark:bg-orange-800/30 rounded border border-orange-300 dark:border-orange-700">
                            <div className="flex items-start space-x-2">
                              <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                              <div className="text-xs text-orange-800 dark:text-orange-200">
                                <p className="font-medium">Resource Intensive</p>
                                <p>Full scan includes all available probes and may take significant time and resources to complete.</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Policy Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Enhanced Policy Configuration</CardTitle>
              <CardDescription>
                Configure detectors for enhanced security analysis. This will create an Enhanced Policy with additional detection capabilities.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Built-in Detectors Toggle */}
              <div className="flex items-center space-x-2 p-3 border rounded-lg">
                <Checkbox
                  id="use_builtin_detectors"
                  checked={formData.use_builtin_detectors}
                  onCheckedChange={(checked) => handleInputChange("use_builtin_detectors", checked)}
                />
                <div className="flex-1">
                  <Label htmlFor="use_builtin_detectors" className="text-sm font-medium cursor-pointer">
                    Enable Built-in Detectors
                  </Label>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Use system&apos;s built-in detectors for API keys, PII, jailbreaks, and other security patterns
                  </p>
                </div>
              </div>

              {/* Custom Detectors Selection */}
              {availableDetectors.length > 0 && (
                <div>
                  <Label className="text-sm font-medium">Custom Detectors</Label>
                  <div className="mt-2 space-y-2 max-h-48 overflow-y-auto border rounded-lg p-3">
                    {availableDetectors.map((detector) => (
                      <div key={detector.detector_id} className="flex items-start space-x-3 p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800">
                        <Checkbox
                          id={detector.detector_id}
                          checked={formData.detector_ids.includes(detector.detector_id)}
                          onCheckedChange={(checked) => handleDetectorToggle(detector.detector_id, checked as boolean)}
                        />
                        <div className="flex-1 min-w-0">
                          <Label htmlFor={detector.detector_id} className="text-sm font-medium cursor-pointer">
                            {detector.name}
                          </Label>
                          <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                            {detector.description}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-xs bg-blue-100 text-blue-800 px-1 rounded">
                              {detector.detector_type}
                            </span>
                            <span className="text-xs text-gray-500">
                              Confidence: {detector.confidence_threshold}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {availableDetectors.length === 0 && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      No custom detectors available. <Link href="/detectors/new" className="text-blue-600 hover:underline">Create one</Link> to get started.
                    </p>
                  )}
                </div>
              )}

              {/* Detector Summary */}
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Detector Configuration:</h4>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  <li>• Built-in detectors: {formData.use_builtin_detectors ? "Enabled" : "Disabled"}</li>
                  <li>• Custom detectors: {formData.detector_ids.length} selected</li>
                  {builtinDetectors.length > 0 && (
                    <li>• Available built-in detectors: {builtinDetectors.length}</li>
                  )}
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Policy Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Policy Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p><strong>Policy Name:</strong> {formData.policy_name || "Not specified"}</p>
                <p><strong>Description:</strong> {formData.description || "No description"}</p>
                <p><strong>Selected Categories:</strong> {formData.categories.length}</p>
                {formData.categories.length > 0 && (
                  <div>
                    <p><strong>Categories:</strong></p>
                    <ul className="list-disc list-inside ml-4 text-xs text-gray-600 dark:text-gray-400">
                      {formData.categories.map(category => (
                        <li key={category}>{category}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <p><strong>Built-in Detectors:</strong> {formData.use_builtin_detectors ? "Enabled" : "Disabled"}</p>
                <p><strong>Custom Detectors:</strong> {formData.detector_ids.length} selected</p>
                <p><strong>Policy Type:</strong> {(formData.detector_ids.length > 0 || !formData.use_builtin_detectors) ? "Enhanced Policy" : "Standard Policy"}</p>
                <p><strong>Default Policy:</strong> {formData.is_default ? "Yes" : "No"}</p>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex space-x-4">
            <Button type="submit" disabled={loading} className="flex-1">
              <Save className="h-4 w-4 mr-2" />
              {loading ? "Creating Policy..." : "Create Policy"}
            </Button>
            <Link href="/policies">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}

export default NewPolicyPage;
