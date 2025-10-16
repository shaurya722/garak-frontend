"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, ArrowLeft, Save, TestTube } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import api from "@/lib/axios";
import { getRestConfigUrl, apiConfig } from "@/config/api";

interface RestGeneratorConfig {
  name: string;
  uri: string;
  method: string;
  headers: Record<string, string>;
  req_template_json_object: Record<string, any>;
  response_json: boolean;
  response_json_field: string;
}

interface ConfigForm {
  config_name: string;
  description: string;
  rest_generator: RestGeneratorConfig;
}

export default function EditConfigurationPage() {
  const router = useRouter();
  const params = useParams();
  const config_id = params.config_id as string;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [authType, setAuthType] = useState<string>("none");
  const [formData, setFormData] = useState<ConfigForm>({
    config_name: "",
    description: "",
    rest_generator: {
      name: "garak-api",
      uri: "",
      method: "post",
      headers: {},
      req_template_json_object: { message: "$INPUT" },
      response_json: true,
      response_json_field: "response"
    }
  });

  // Load the existing configuration
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const { data } = await api.get(getRestConfigUrl(config_id));
        setFormData(data);
        
        // Determine auth type based on headers
        const headers = data.rest_generator.headers;
        if (headers.Authorization && headers.Authorization.includes('Bearer')) {
          setAuthType("bearer");
        } else if (headers['X-Authorization']) {
          setAuthType("api_key");
        } else if (Object.keys(headers).length > 0) {
          setAuthType("custom");
        }
      } catch (error) {
        console.error("Failed to fetch configuration:", error);
        toast.error("Failed to load configuration");
      } finally {
        setLoading(false);
      }
    };

    if (config_id) {
      fetchConfig();
    }
  }, [config_id]);

  const handleInputChange = (field: string, value: string) => {
    if (field.startsWith("rest_generator.")) {
      const subField = field.replace("rest_generator.", "");
      setFormData(prev => ({
        ...prev,
        rest_generator: {
          ...prev.rest_generator,
          [subField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleAuthTypeChange = (type: string) => {
    setAuthType(type);
    let headers: Record<string, string> = { "Content-Type": "application/json" };
    
    switch (type) {
      case "bearer":
        headers.Authorization = "Bearer $KEY";
        break;
      case "api_key":
        headers["X-Authorization"] = "$KEY";
        break;
      case "custom":
        headers["X-API-Key"] = "$KEY";
        break;
    }

    setFormData(prev => ({
      ...prev,
      rest_generator: {
        ...prev.rest_generator,
        headers
      }
    }));
  };

  const handleRequestTemplateChange = (value: string) => {
    try {
      const parsed = JSON.parse(value);
      setFormData(prev => ({
        ...prev,
        rest_generator: {
          ...prev.rest_generator,
          req_template_json_object: parsed
        }
      }));
    } catch (error) {
      console.error("Invalid JSON:", error);
    }
  };

  const validateForm = (): boolean => {
    if (!formData.config_name.trim()) {
      toast.error("Configuration name is required");
      return false;
    }
    if (!formData.rest_generator.uri.trim()) {
      toast.error("API endpoint URI is required");
      return false;
    }
    if (!formData.rest_generator.response_json_field.trim()) {
      toast.error("Response field is required");
      return false;
    }
    try {
      JSON.stringify(formData.rest_generator.req_template_json_object);
    } catch {
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSaving(true);
    try {
      // Make sure we're using the full API URL
      const url = `${apiConfig.endpoints.restConfigs}/${config_id}`;
      console.log('Making PATCH request to:', url);
      console.log('Request payload:', formData);
      
      const response = await api.patch(url, formData);
      console.log('Response:', response);
      
      toast.success("Configuration updated successfully!");
      router.push(`/configurations/${config_id}`);
    } catch (error) {
      console.error("Failed to update configuration:", error);
      toast.error("Failed to update configuration");
    } finally {
      setSaving(false);
    }
  };

  const testConfiguration = async () => {
    if (!validateForm()) return;
    toast.info("Testing configuration...");
  };

  if (loading) {
    return (
      <div className="min-h-screen ">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-lg font-medium">Loading configuration...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen ">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href={`/configurations/${config_id}`}>
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Configuration
                </Button>
              </Link>
              <div className="flex items-center space-x-2">
                <Shield className="h-8 w-8 text-red-600" />
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Edit Configuration
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
                Update basic details about your REST API configuration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="config_name">Configuration Name *</Label>
                <Input
                  id="config_name"
                  value={formData.config_name}
                  onChange={(e) => handleInputChange("config_name", e.target.value)}
                  placeholder="e.g., GenAI Conversation API"
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Optional description of this configuration"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* API Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>API Configuration</CardTitle>
              <CardDescription>
                Configure your REST API endpoint details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="uri">API Endpoint URI *</Label>
                <Input
                  id="uri"
                  value={formData.rest_generator.uri}
                  onChange={(e) => handleInputChange("rest_generator.uri", e.target.value)}
                  placeholder="https://api.example.com/endpoint"
                  required
                />
              </div>
              <div>
                <Label htmlFor="method">HTTP Method</Label>
                <Select
                  value={formData.rest_generator.method}
                  onValueChange={(value) => handleInputChange("rest_generator.method", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="get">GET</SelectItem>
                    <SelectItem value="post">POST</SelectItem>
                    <SelectItem value="put">PUT</SelectItem>
                    <SelectItem value="patch">PATCH</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Authentication */}
          <Card>
            <CardHeader>
              <CardTitle>Authentication</CardTitle>
              <CardDescription>
                Configure how to authenticate with your API
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="auth_type">Authentication Type</Label>
                <Select value={authType} onValueChange={handleAuthTypeChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Authentication</SelectItem>
                    <SelectItem value="bearer">Bearer Token</SelectItem>
                    <SelectItem value="api_key">API Key (X-Authorization)</SelectItem>
                    <SelectItem value="custom">Custom Header</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {authType !== "none" && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Note:</strong> The actual API key will be provided when running security tests. 
                    The placeholder <code>$KEY</code> will be replaced with your actual key.
                  </p>
                  <div className="mt-2 text-xs text-blue-600 dark:text-blue-300">
                    Current headers: {JSON.stringify(formData.rest_generator.headers, null, 2)}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Request Template */}
          <Card>
            <CardHeader>
              <CardTitle>Request Template</CardTitle>
              <CardDescription>
                Define the JSON structure for API requests. Use $INPUT as placeholder for test inputs.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="request_template">Request JSON Template *</Label>
                <Textarea
                  id="request_template"
                  value={JSON.stringify(formData.rest_generator.req_template_json_object, null, 2)}
                  onChange={(e) => handleRequestTemplateChange(e.target.value)}
                  placeholder='{
  "message": "$INPUT"
}'
                  rows={6}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-gray-600 mt-1">
                  Use <code>$INPUT</code> as a placeholder where test prompts will be inserted
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Response Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Response Configuration</CardTitle>
              <CardDescription>
                Configure how to extract the response from your API
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="response_json">Response Format</Label>
                <Select
                  value={formData.rest_generator.response_json ? "json" : "text"}
                  onValueChange={(value) => 
                    handleInputChange("rest_generator.response_json", value === "json" ? "true" : "false")
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="json">JSON</SelectItem>
                    <SelectItem value="text">Plain Text</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {formData.rest_generator.response_json && (
                <div>
                  <Label htmlFor="response_field">Response Field Path *</Label>
                  <Input
                    id="response_field"
                    value={formData.rest_generator.response_json_field}
                    onChange={(e) => handleInputChange("rest_generator.response_json_field", e.target.value)}
                    placeholder="response"
                    required
                  />
                  <p className="text-xs text-gray-600 mt-1">
                    JSON field path to extract the response text (e.g., <code>response</code>, <code>data.message</code>, <code>choices.0.text</code>)
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex space-x-4">
            <Button type="submit" disabled={saving} className="flex-1">
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
            <Button type="button" variant="outline" onClick={testConfiguration}>
              <TestTube className="h-4 w-4 mr-2" />
              Test Configuration
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
