"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Shield,
  Settings,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Play,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import api from "@/api/axios";
import { apiConfig, getRestConfigUrl } from "@/config/api";
import MainLayout from "@/components/layout/main-layout";
import { ProtectedRoute } from "@/components/auth/protected-route";

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

function ConfigurationsPageContent() {
  const [configs, setConfigs] = useState<RestConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6); // 6 items per page for 2x3 grid

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data } = await api.get(apiConfig.endpoints.restConfigs);
      setConfigs(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch Projects:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteConfiguration = async (configId: string) => {
    if (!confirm("Are you sure you want to delete this configuration?")) return;

    try {
      await api.delete(getRestConfigUrl(configId));
      setConfigs((prevConfigs) =>
        prevConfigs.filter((config) => config.config_id !== configId)
      );
    } catch (error) {
      console.error("Failed to delete configuration:", error);
    }
  };

  const filteredConfigs = configs.filter(
    (config) =>
      config.config_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      config.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      config.rest_generator.uri.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredConfigs.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredConfigs.length / itemsPerPage);

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Reset to first page when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, setCurrentPage]);

  return (
    <MainLayout>
      <div className="min-h-screen ">
        {/* Header */}
        <header className="">
          <div className="container mx-auto px-4 py-4 fixed">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {/* <Link href="/">
                  <Button variant="ghost" size="sm">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                </Link> */}
                <div className="flex items-center space-x-2">
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Projects
                  </h1>
                </div>
              </div>
              <Link href="/projects/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Configuration
                </Button>
              </Link>
            </div>
          </div>
          </header>
        {/* Main Content */}
        <main className="container mx-auto px-4 py-20">

          
          {/* Search and Filters */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search Projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
       {/* Summary Stats */}
       <Card className="my-8">
            <CardHeader>
              <CardTitle>Configuration Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {configs.length}
                  </div>
                  <div className="text-sm text-gray-600">Total Projects</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {
                      configs.filter(
                        (c) => Object.keys(c.rest_generator.headers).length > 0
                      ).length
                    }
                  </div>
                  <div className="text-sm text-gray-600">
                    With Authentication
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {
                      configs.filter(
                        (c) => c.rest_generator.method.toLowerCase() === "post"
                      ).length
                    }
                  </div>
                  <div className="text-sm text-gray-600">POST Endpoints</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {
                      configs.filter(
                        (c) => c.rest_generator.method.toLowerCase() === "get"
                      ).length
                    }
                  </div>
                  <div className="text-sm text-gray-600">GET Endpoints</div>
                </div>
              </div>
            </CardContent>
          </Card>
          {/* Projects Count and Pagination Info */}
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-muted-foreground">
              Showing {Math.min(indexOfFirstItem + 1, filteredConfigs.length)}-{Math.min(indexOfLastItem, filteredConfigs.length)} of {filteredConfigs.length} configurations
            </div>
            {totalPages > 1 && (
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => paginate(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <div className="flex space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={pageNum === currentPage ? "default" : "outline"}
                        size="sm"
                        onClick={() => paginate(pageNum)}
                        className={pageNum === currentPage ? "font-bold" : ""}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </div>

          {/* Projects Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredConfigs.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Settings className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold mb-2">
                  No Projects found
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm
                    ? "No Projects match your search."
                    : "Get started by creating your first REST configuration."}
                </p>
                <Link href="/projects/new">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Configuration
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentItems.map((config) => (
                <Card
                  key={config.config_id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">
                          {config.config_name}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {config.description || "No description"}
                        </CardDescription>
                      </div>
                      <Badge variant="secondary" className="ml-2">
                        {config.rest_generator.method.toUpperCase()}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Endpoint
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                          {config.rest_generator.uri}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Authentication
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {Object.keys(config.rest_generator.headers).length > 0
                            ? `${
                                Object.keys(config.rest_generator.headers)
                                  .length
                              } headers`
                            : "No authentication"}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-gray-500">
                          Created:{" "}
                          {new Date(config.created_at).toLocaleDateString()}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex space-x-2 pt-2">
                        <Link href={`/rest-configs/${config.config_id}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                        </Link>
                        <Link href={`/rest-configs/${config.config_id}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                        </Link>
                        <Link href={`/tests/new?config=${config.config_id}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                          >
                            <Play className="h-3 w-3 mr-1" />
                            Test
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteConfiguration(config.config_id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </MainLayout>
  );
}

export default function ConfigurationsPage() {
  return (
    <ProtectedRoute>
      <ConfigurationsPageContent />
    </ProtectedRoute>
  );
}
