"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Settings, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  Play
} from "lucide-react";
import Link from "next/link";
import MainLayout from "@/components/layout/main-layout";
import api from "@/lib/axios";
import { apiConfig, getRestConfigUrl } from "@/config/api";

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

export default function ProjectsPage() {
  const [configs, setConfigs] = useState<RestConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data } = await api.get(apiConfig.endpoints.restConfigs);
      setConfigs(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch projects:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteProject = async (configId: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return;
    
    try {
      await api.delete(getRestConfigUrl(configId));
      setConfigs(prevConfigs => prevConfigs.filter(config => config.config_id !== configId));
    } catch (error) {
      console.error("Failed to delete project:", error);
    }
  };

  const filteredProjects = configs.filter(config =>
    config.config_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    config.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    config.rest_generator.uri.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <MainLayout>
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Settings className="h-12 w-12 text-red-600 mx-auto mb-4 animate-pulse" />
              <p className="text-muted-foreground">Loading projects...</p>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">REST API Projects</h1>
            <p className="text-muted-foreground">
              Manage your REST API endpoint Projects for security testing
            </p>
          </div>
          <Link href="/projects/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
          </Link>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Projects Table */}
        <Card>
          <CardHeader>
            <CardTitle>REST API Projects</CardTitle>
            <CardDescription>
              {filteredProjects.length} of {configs.length} projects
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredProjects.length === 0 ? (
              <div className="text-center py-12">
                <Settings className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium mb-2">
                  {searchTerm ? "No projects found" : "No projects created"}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm 
                    ? "Try adjusting your search terms"
                    : "Get started by creating your first REST project"
                  }
                </p>
                {!searchTerm && (
                  <Link href="/projects/new">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Project
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Project Name</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Endpoint</TableHead>
                    <TableHead>Authentication</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProjects.map((config) => (
                    <TableRow key={config.config_id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{config.config_name}</div>
                          <div className="text-sm text-muted-foreground">
                            {config.description || "No description"}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {config.rest_generator.method.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div className="truncate" title={config.rest_generator.uri}>
                          {config.rest_generator.uri}
                        </div>
                      </TableCell>
                      <TableCell>
                        {Object.keys(config.rest_generator.headers).length > 0 
                          ? `${Object.keys(config.rest_generator.headers).length} headers`
                          : "None"
                        }
                      </TableCell>
                      <TableCell>{new Date(config.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Link href={`/projects/${config.config_id}`}>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link href={`/projects/${config.config_id}/edit`}>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link href={`/tests/new?config=${config.config_id}`}>
                            <Button variant="ghost" size="sm">
                              <Play className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => deleteProject(config.config_id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
