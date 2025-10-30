"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  ArrowLeft,
  Edit,
  Trash2,
  Play,
  Copy,
  Eye,
  EyeOff,
  Globe,
  Key,
  Code,
  Settings
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import api from "@/api/axios";
import { getRestConfigUrl } from "@/config/api";
import MainLayout from "@/components/layout/main-layout";

interface RestConfig {
  config_id: string;
  config_name: string;
  description?: string;
  rest_generator: {
    name: string;
    uri: string;
    method: string;
    headers: Record<string, string>;
    req_template_json_object: Record<string, string>;
    response_json: boolean;
    response_json_field: string;
  };
  created_at: string;
  updated_at: string;
}

export default function ConfigurationDetailsPage() {
  const params = useParams();
  const config_id = params.config_id as string;
  
  const [config, setConfig] = useState<RestConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showHeaders, setShowHeaders] = useState(false);
  const [showTemplate, setShowTemplate] = useState(false);

  useEffect(() => {
    if (config_id) {
      fetchConfiguration();
    }
  }, [config_id]);

  const fetchConfiguration = async () => {
    try {
      const { data } = await api.get(getRestConfigUrl(config_id));
      setConfig(data);
    } catch (err) {
      console.error("Failed to fetch configuration:", err);
      setError("Failed to fetch configuration details");
    } finally {
      setLoading(false);
    }
  };

  const deleteConfiguration = async () => {
    if (!confirm(`Are you sure you want to delete "${config?.config_name}"? This action cannot be undone.`)) {
      return;
    }
    
    try {
      await api.delete(getRestConfigUrl(config_id));
      toast.success("Configuration deleted successfully");
      setTimeout(() => {
        window.location.href = "/projects";
      }, 800);
    } catch (error) {
      console.error("Failed to delete configuration:", error);
      toast.error("Failed to delete configuration");
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const maskSensitiveValue = (value: string) => {
    if (value.includes("$KEY") || value.toLowerCase().includes("bearer") || value.toLowerCase().includes("token")) {
      return value.replace(/[a-zA-Z0-9]/g, "*");
    }
    return value;
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

  if (error || !config) {
    return (
      <div className="min-h-screen ">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <Card className="w-full max-w-md">
              <CardContent className="text-center py-12">
                <Settings className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold mb-2">Configuration Not Found</h3>
                <p className="text-gray-600 mb-4">
                  {error || "The requested configuration could not be found."}
                </p>
                <Link href="/projects">
                  <Button>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Projects
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
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
              <Link href="/projects">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Projects
                </Button>
              </Link>
              <div className="flex items-center space-x-2">
                <Shield className="h-8 w-8 text-red-600" />
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Configuration Details
                </h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Link href={`/tests/new?config=${config_id}`}>
                <Button>
                  <Play className="h-4 w-4 mr-2" />
                  Run Test
                </Button>
              </Link>
              <Link href={`/projects/${config_id}/edit`}>
                <Button variant="outline">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </Link>
              <Button variant="outline" onClick={deleteConfiguration} className="text-red-600 hover:text-red-700">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Basic Information */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">{config.config_name}</CardTitle>
                <CardDescription className="mt-2">
                  {config.description || "No description provided"}
                </CardDescription>
              </div>
              <Badge variant="secondary" className="ml-4">
                {config.rest_generator.method.toUpperCase()}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Configuration ID</h4>
                <div className="flex items-center space-x-2">
                  <p className="text-sm font-mono bg-gray-100 dark:bg-gray-800 p-2 rounded flex-1">
                    {config.config_id}
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => copyToClipboard(config.config_id, "Configuration ID")}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Generator Name</h4>
                <p className="text-sm bg-gray-100 dark:bg-gray-800 p-2 rounded">
                  {config.rest_generator.name}
                </p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Created</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {new Date(config.created_at).toLocaleString()}
                </p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Last Updated</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {new Date(config.updated_at).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* API Endpoint */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Globe className="h-5 w-5" />
              <span>API Endpoint</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">URL</h4>
                <div className="flex items-center space-x-2">
                  <p className="text-sm bg-gray-100 dark:bg-gray-800 p-2 rounded flex-1 font-mono">
                    {config.rest_generator.uri}
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => copyToClipboard(config.rest_generator.uri, "Endpoint URL")}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">HTTP Method</h4>
                <Badge variant="outline" className="text-sm">
                  {config.rest_generator.method.toUpperCase()}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Authentication Headers */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Key className="h-5 w-5" />
                <span>Authentication Headers</span>
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowHeaders(!showHeaders)}
              >
                {showHeaders ? <EyeOff className="h-3 w-3 mr-1" /> : <Eye className="h-3 w-3 mr-1" />}
                {showHeaders ? "Hide" : "Show"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {Object.keys(config.rest_generator.headers).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(config.rest_generator.headers).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{key}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 font-mono">
                        {showHeaders ? value : maskSensitiveValue(value)}
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => copyToClipboard(`${key}: ${value}`, "Header")}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 dark:text-gray-400">No authentication headers configured</p>
            )}
          </CardContent>
        </Card>

        {/* Request Template */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Code className="h-5 w-5" />
                <span>Request Template</span>
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowTemplate(!showTemplate)}
              >
                {showTemplate ? <EyeOff className="h-3 w-3 mr-1" /> : <Eye className="h-3 w-3 mr-1" />}
                {showTemplate ? "Hide" : "Show"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {showTemplate && (
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">JSON Template</h4>
                  <div className="relative">
                    <pre className="text-sm bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto font-mono">
                      {JSON.stringify(config.rest_generator.req_template_json_object, null, 2)}
                    </pre>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => copyToClipboard(
                        JSON.stringify(config.rest_generator.req_template_json_object, null, 2), 
                        "Request template"
                      )}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Note:</strong> The <code>$INPUT</code> placeholder will be replaced with actual test prompts during security testing.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Response Configuration */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Response Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Response Format</h4>
                <Badge variant={config.rest_generator.response_json ? "default" : "secondary"}>
                  {config.rest_generator.response_json ? "JSON" : "Text"}
                </Badge>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Response Field Path</h4>
                <p className="text-sm bg-gray-100 dark:bg-gray-800 p-2 rounded font-mono">
                  {config.rest_generator.response_json_field}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Link href={`/tests/new?config=${config_id}`}>
                <Button>
                  <Play className="h-4 w-4 mr-2" />
                  Run Security Test
                </Button>
              </Link>
              
              <Link href={`/projects/${config_id}/edit`}>
                <Button variant="outline">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Configuration
                </Button>
              </Link>
              
              <Button 
                variant="outline"
                onClick={() => copyToClipboard(JSON.stringify(config, null, 2), "Full configuration")}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy JSON
              </Button>
              
              <Button variant="outline" onClick={deleteConfiguration} className="text-red-600 hover:text-red-700">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Configuration
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
    </MainLayout>
  );
}
