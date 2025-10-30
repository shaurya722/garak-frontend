"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { Shield, ArrowLeft, Save, TestTube } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import api from "@/api/axios";
import { apiConfig } from "@/config/api";
import MainLayout from "@/components/layout/main-layout";

interface RestGeneratorConfig {
  name: string;
  uri: string;
  method: string;
  headers: Record<string, string>;
  req_template_json_object: Record<string, string>;
  response_json: boolean;
  response_json_field: string;
}

interface ConfigForm {
  config_name: string;
  description: string;
  rest_generator: RestGeneratorConfig;
}

export default function NewConfigurationPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
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
      response_json_field: "response",
    },
  });

  const handleInputChange = (field: string, value: string) => {
    if (field.startsWith("rest_generator.")) {
      const subField = field.replace("rest_generator.", "");
      setFormData((prev) => ({
        ...prev,
        rest_generator: {
          ...prev.rest_generator,
          [subField]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleAuthTypeChange = (type: string) => {
    setAuthType(type);
    let headers: Record<string, string> = {};

    switch (type) {
      case "bearer":
        headers = {
          Authorization: "Bearer $KEY",
          "Content-Type": "application/json",
        };
        break;
      case "api_key":
        headers = {
          "X-Authorization": "$KEY",
          "Content-Type": "application/json",
        };
        break;
      case "custom":
        headers = { "X-API-Key": "$KEY", "Content-Type": "application/json" };
        break;
      default:
        headers = { "Content-Type": "application/json" };
    }

    setFormData((prev) => ({
      ...prev,
      rest_generator: {
        ...prev.rest_generator,
        headers,
      },
    }));
  };

  const handleRequestTemplateChange = (value: string) => {
    try {
      const parsed = JSON.parse(value);
      setFormData((prev) => ({
        ...prev,
        rest_generator: {
          ...prev.rest_generator,
          req_template_json_object: parsed,
        },
      }));
    } catch (error) {
      // Invalid JSON, but don't update the state
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
      toast.error("Request template must be valid JSON");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const { data } = await api.post(
        apiConfig.endpoints.restConfigs + "/",
        formData
      );
      toast.success("Configuration created successfully!");
      router.push(`/projects/${data.config_id}`);
    } catch (error) {
      console.error("Failed to create configuration:", error);
      toast.error("Failed to create configuration");
    } finally {
      setLoading(false);
    }
  };

  const testConfiguration = async () => {
    if (!validateForm()) return;

    toast.info("Testing configuration...");
    // Here you would implement a test call to the endpoint
    // For now, just show a success message
    setTimeout(() => {
      toast.success("Configuration test successful!");
    }, 1000);
  };
  const [selectedType, setSelectedType] = useState("Agentic Scan");

  const handleSelect = (type: string) => {
    setSelectedType(type);
  };

  return (
    <MainLayout>
      {/* <div className="py-3 px-6 space-y-6 bg-white"> */}
      {/* Header */}
      <div className="flex items-center justify-between fixed z-10 p-4 bg-background w-full">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Project</h1>
          <p className="text-muted-foreground">
            Create a new REST API endpoint Project for security testing
          </p>
        </div>
      </div>
      {/* </div> */}
      <div className="bg-gradient-to-br py-15">
        {/* Main Content */}
        <main className="px-4 pt-15">
          <Card className="">
            <CardHeader>
              <CardTitle>Create Project</CardTitle>
              <CardDescription>
                Lorem ipsum Aliquam a dui vel justo fringilla euismod id id
                enim. Nunc non semper tellus. Pellentesque vitae tellus non dui
                fermentum hendrerit. In vel imperdiet mi. Aliquam erat volutpat.
                Cras dapibus orci eu eros tempus efficitur.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="config_name">Name of the project</Label>
                  <Input
                    id="config_name"
                    value={formData.config_name}
                    onChange={(e) =>
                      handleInputChange("config_name", e.target.value)
                    }
                    placeholder="Project Name"
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="config_name">Type of Project</Label>
                  <div className="flex gap-2">
                    {["Red Team", "Blue Team", "Agentic Scan"].map((type) => (
                      <Button
                        key={type}
                        onClick={() => handleSelect(type)}
                        variant={selectedType === type ? "default" : "outline"}
                        className="w-1/3"
                      >
                        {type}
                      </Button>
                    ))}
                  </div>
                </div>{" "}
                {/* <div className="flex flex-col gap-2">
                  <Label htmlFor="config_name">Type of Project</Label>
                  <div className="flex gap-2">
                    <Button variant="outline" className="w-1/3">
                      Red Team
                    </Button>
                    <Button variant="outline" className="w-1/3">
                      Blue Team
                    </Button>
                    <Button variant="default" className="w-1/3">
                      Agentic Scan
                    </Button>
                  </div>
                </div> */}
              </form>
            </CardContent>
          </Card>
        </main>
        {selectedType === "Red Team" && (
          <main className="px-4 py-5">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>
                    Provide basic details about your REST API configuration
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="config_name">Configuration Name *</Label>
                    <Input
                      id="config_name"
                      value={formData.config_name}
                      onChange={(e) =>
                        handleInputChange("config_name", e.target.value)
                      }
                      placeholder="e.g., GenAI Conversation API"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) =>
                        handleInputChange("description", e.target.value)
                      }
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
                      onChange={(e) =>
                        handleInputChange("rest_generator.uri", e.target.value)
                      }
                      placeholder="http://localhost:80/genai/conversation"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="method">HTTP Method</Label>
                    <Select
                      value={formData.rest_generator.method}
                      onValueChange={(value) =>
                        handleInputChange("rest_generator.method", value)
                      }
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
                    <Select
                      value={authType}
                      onValueChange={handleAuthTypeChange}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No Authentication</SelectItem>
                        <SelectItem value="bearer">Bearer Token</SelectItem>
                        <SelectItem value="api_key">
                          API Key (X-Authorization)
                        </SelectItem>
                        <SelectItem value="custom">Custom Header</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {authType !== "none" && (
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        <strong>Note:</strong> The actual API key will be
                        provided when running security tests. The placeholder{" "}
                        <code>$KEY</code> will be replaced with your actual key.
                      </p>
                      <div className="mt-2 text-xs text-blue-600 dark:text-blue-300">
                        Current headers:{" "}
                        {JSON.stringify(
                          formData.rest_generator.headers,
                          null,
                          2
                        )}
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
                    Define the JSON structure for API requests. Use $INPUT as
                    placeholder for test inputs.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="request_template">
                      Request JSON Template *
                    </Label>
                    <Textarea
                      id="request_template"
                      value={JSON.stringify(
                        formData.rest_generator.req_template_json_object,
                        null,
                        2
                      )}
                      onChange={(e) =>
                        handleRequestTemplateChange(e.target.value)
                      }
                      placeholder='{\n  "message": "$INPUT"\n}'
                      rows={6}
                      className="font-mono text-sm"
                    />
                    <p className="text-xs text-gray-600 mt-1">
                      Use <code>$INPUT</code> as a placeholder where test
                      prompts will be inserted
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
                    <Label htmlFor="response_field">
                      Response Field Path *
                    </Label>
                    <Input
                      id="response_field"
                      value={formData.rest_generator.response_json_field}
                      onChange={(e) =>
                        handleInputChange(
                          "rest_generator.response_json_field",
                          e.target.value
                        )
                      }
                      placeholder="response"
                      required
                    />
                    <p className="text-xs text-gray-600 mt-1">
                      JSON field path to extract the response text (e.g.,{" "}
                      <code>response</code>, <code>data.message</code>,{" "}
                      <code>choices.0.text</code>)
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex space-x-4">
                <Button type="submit" disabled={loading} className="flex-1">
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? "Creating..." : "Create Configuration"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={testConfiguration}
                >
                  <TestTube className="h-4 w-4 mr-2" />
                  Test Configuration
                </Button>
              </div>
            </form>
          </main>
        )}
        {selectedType === "Agentic Scan" && (
          <main className="px-4 py-5">
            <Card>
              <CardHeader>
                <CardTitle>Agentic Scan</CardTitle>
                <CardDescription>
                  Automatically analyze and audit your REST API configuration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => router.push("/agentic-radar/scan")}>
                  Start Scan
                </Button>
              </CardContent>
            </Card>
          </main>
        )}
      </div>
    </MainLayout>
  );
}
