"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Plus, Edit, Trash2, Star, Eye, Search, FileText } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { apiConfig, getPolicyUrl } from "@/config/api";
import api from "@/lib/axios";
import MainLayout from "@/components/layout/main-layout";

interface Policy {
  policy_id: string;
  policy_name: string;
  description: string;
  categories: string[];
  probe_count: number;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export default function PoliciesPage() {
  const [loading, setLoading] = useState(true);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    try {
      const { data } = await api.get(apiConfig.endpoints.policies);
      if (Array.isArray(data)) {
        setPolicies(data);
      } else if (data && Array.isArray(data.policies)) {
        setPolicies(data.policies);
      } else {
        console.warn("Unexpected policies response format:", data);
        setPolicies([]);
      }
    } catch (error) {
      console.error("Failed to fetch policies:", error);
      toast.error("Failed to fetch policies");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (policyId: string) => {
    if (!confirm("Are you sure you want to delete this policy?")) return;
    
    setDeleting(policyId);
    try {
      await api.delete(getPolicyUrl(policyId));
      toast.success("Policy deleted successfully");
      fetchPolicies();
    } catch (error) {
      console.error("Failed to delete policy:", error);
      toast.error("Failed to delete policy");
    } finally {
      setDeleting(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredPolicies = policies.filter(policy =>
    policy.policy_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    policy.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    policy.categories.some(cat => cat.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <MainLayout>
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <FileText className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-pulse" />
              <p className="text-muted-foreground">Loading policies...</p>
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
            <h1 className="text-3xl font-bold tracking-tight">Security Policies</h1>
            <p className="text-muted-foreground">
              Manage reusable security testing templates and probe Projects
            </p>
          </div>
          <Link href="/policies/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Policy
            </Button>
          </Link>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search policies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Policies Table */}
        <Card>
          <CardHeader>
            <CardTitle>Security Policies</CardTitle>
            <CardDescription>
              {filteredPolicies.length} of {policies.length} policies
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredPolicies.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium mb-2">
                  {searchTerm ? "No policies found" : "No policies created"}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm 
                    ? "Try adjusting your search terms"
                    : "Create your first security testing policy to get started"
                  }
                </p>
                {!searchTerm && (
                  <Link href="/policies/new">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Policy
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Policy Name</TableHead>
                    <TableHead>Categories</TableHead>
                    <TableHead>Probes</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPolicies.map((policy) => (
                    <TableRow key={policy.policy_id}>
                      <TableCell>
                        <div>
                          <div className="font-medium flex items-center space-x-2">
                            <span>{policy.policy_name}</span>
                            {policy.is_default && (
                              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                                <Star className="h-3 w-3 mr-1" />
                                Default
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {policy.description || "No description provided"}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {policy.categories?.slice(0, 2).map(category => (
                            <Badge key={category} variant="secondary" className="text-xs">
                              {category}
                            </Badge>
                          ))}
                          {policy.categories && policy.categories.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{policy.categories.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{policy.probe_count || 0}</TableCell>
                      <TableCell>
                        <Badge variant="default">Active</Badge>
                      </TableCell>
                      <TableCell>{formatDate(policy.created_at)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Link href={`/policies/${policy.policy_id}`}>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link href={`/policies/${policy.policy_id}/edit`}>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(policy.policy_id)}
                            disabled={deleting === policy.policy_id}
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
