"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Save, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { apiConfig, getPolicyUrl } from "@/config/api";
import api from "@/lib/axios";


interface PolicyForm {
  policy_name: string;
  description: string;
  categories: string[];
  is_default: boolean;
}

export default function EditPolicyPage() {
  const params = useParams();
  const router = useRouter();
  const policyId = params.policy_id as string;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [formData, setFormData] = useState<PolicyForm>({
    policy_name: "",
    description: "",
    categories: [],
    is_default: false
  });

  const fetchPolicy = useCallback(async () => {
    try {
      const { data } = await api.get(getPolicyUrl(policyId));
      setFormData({
        policy_name: data.policy_name,
        description: data.description || "",
        categories: data.categories || [],
        is_default: data.is_default
      });
    } catch (error) {
      console.error("Failed to fetch policy:", error);
      toast.error("Failed to fetch policy details");
    } finally {
      setLoading(false);
    }
  }, [policyId]);

  const fetchCategories = useCallback(async () => {
    try {
      const { data } = await api.get(apiConfig.endpoints.policiesCategories);
      setAvailableCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      toast.error("Failed to fetch categories");
    }
  }, []);

  useEffect(() => {
    if (policyId) {
      fetchPolicy();
      fetchCategories();
    }
  }, [policyId, fetchPolicy, fetchCategories]);

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

  

  const handleInputChange = <K extends keyof PolicyForm>(field: K, value: PolicyForm[K]) => {
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

    setSaving(true);
    try {
      const payload = {
        policy_name: formData.policy_name,
        description: formData.description || undefined,
        categories: formData.categories,
        is_default: formData.is_default
      };

      await api.put(getPolicyUrl(policyId), payload);
      toast.success("Policy updated successfully!");
      router.push("/policies");
    } catch (error) {
      console.error("Failed to update policy:", error);
      toast.error("Failed to update policy");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-slate-600 dark:text-slate-400">Loading policy...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen ">
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Link href="/policies">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Policies
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Edit Security Policy
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Update your security policy categories and settings
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Policy Information</CardTitle>
              <CardDescription>
                Basic details about your security policy
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="policy_name">Policy Name *</Label>
                <Input
                  id="policy_name"
                  value={formData.policy_name}
                  onChange={(e) => handleInputChange("policy_name", e.target.value)}
                  placeholder="Enter policy name"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Describe what this policy tests for"
                  rows={3}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_default"
                  checked={formData.is_default}
                  onCheckedChange={(checked) => handleInputChange("is_default", Boolean(checked))}
                />
                <Label htmlFor="is_default" className="text-sm font-medium cursor-pointer">
                  Set as default policy
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Security Categories */}
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

          {/* Policy Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Policy Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p><strong>Policy Name:</strong> {formData.policy_name || "Not specified"}</p>
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
                <p><strong>Default Policy:</strong> {formData.is_default ? "Yes" : "No"}</p>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex space-x-4">
            <Button type="submit" disabled={saving} className="flex-1">
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Updating Policy..." : "Update Policy"}
            </Button>
            <Link href="/policies">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </main>
    </div>
  );
}