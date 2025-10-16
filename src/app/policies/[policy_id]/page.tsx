"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, Star, Play, FileText } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import api from "@/lib/axios";
import { getPolicyUrl, apiConfig } from "@/config/api";
import MainLayout from "@/components/layout/main-layout";

interface Policy {
  policy_id: string;
  policy_name: string;
  description?: string;
  probe_ids: string[];
  is_default: boolean;
  created_at: string;
  updated_at: string;
  probe_count: number;
}

interface ProbeInfo {
  id: string;
  name: string;
  description: string;
}

interface ProbeCategory {
  category: string;
  description: string;
  probes: ProbeInfo[];
}

export default function PolicyDetailPage() {
  const params = useParams();
  const policyId = params.policy_id as string;
  
  const [loading, setLoading] = useState(true);
  const [policy, setPolicy] = useState<Policy | null>(null);
  const [probeCategories, setProbeCategories] = useState<ProbeCategory[]>([]);

  const fetchPolicy = useCallback(async () => {
    try {
      const { data } = await api.get(getPolicyUrl(policyId));
      setPolicy(data);
    } catch (error) {
      console.error("Failed to fetch policy:", error);
      toast.error("Failed to fetch policy details");
    } finally {
      setLoading(false);
    }
  }, [policyId]);

  const fetchProbes = useCallback(async () => {
    try {
      const { data } = await api.get(apiConfig.endpoints.policiesProbes);
      setProbeCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch probes:", error);
    }
  }, []);

  useEffect(() => {
    if (policyId) {
      fetchPolicy();
      fetchProbes();
    }
  }, [policyId, fetchPolicy, fetchProbes]);

  const getProbeDetails = (probeId: string) => {
    for (const category of probeCategories) {
      const probe = category.probes.find(p => p.id === probeId);
      if (probe) {
        return { ...probe, category: category.category };
      }
    }
    return { id: probeId, name: probeId, description: "Unknown probe", category: "Unknown" };
  };

  const groupProbesByCategory = () => {
    if (!policy) return {};
    
    const grouped: Record<string, (ProbeInfo & { category: string })[]> = {};
    
    policy.probe_ids.forEach(probeId => {
      const probeDetails = getProbeDetails(probeId);
      if (!grouped[probeDetails.category]) {
        grouped[probeDetails.category] = [];
      }
      grouped[probeDetails.category].push(probeDetails as ProbeInfo & { category: string });
    });
    
    return grouped;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen ">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-slate-600 dark:text-slate-400">Loading policy details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!policy) {
    return (
      <div className="min-h-screen ">
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto mb-4 text-slate-400" />
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                Policy not found
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                The requested policy could not be found.
              </p>
              <Link href="/policies">
                <Button>Back to Policies</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const groupedProbes = groupProbesByCategory();

  return (
    <MainLayout>  
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/policies">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Policies
                </Button>
              </Link>
              <div className="flex items-center space-x-2">
                <FileText className="h-8 w-8 text-blue-600" />
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                    <span>{policy.policy_name}</span>
                    {policy.is_default && (
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                        <Star className="h-3 w-3 mr-1" />
                        Default
                      </Badge>
                    )}
                  </h1>
                </div>
              </div>
            </div>
            <div className="flex space-x-2">
              <Link href={`/tests/new?policy=${policy.policy_id}`}>
                <Button>
                  <Play className="h-4 w-4 mr-2" />
                  Run Test
                </Button>
              </Link>
              <Link href={`/policies/${policy.policy_id}/edit`}>
                <Button variant="outline">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          {/* Policy Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Policy Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-medium text-slate-600 dark:text-slate-400">Description</h4>
                    <p className="text-slate-900 dark:text-white">
                      {policy.description || "No description provided"}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Probes</h4>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                      {policy.probe_count}
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-medium text-slate-600 dark:text-slate-400">Created</h4>
                    <p className="text-slate-900 dark:text-white">
                      {formatDate(policy.created_at)}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-slate-600 dark:text-slate-400">Last Updated</h4>
                    <p className="text-slate-900 dark:text-white">
                      {formatDate(policy.updated_at)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Included Probes */}
          <Card>
            <CardHeader>
              <CardTitle>Included Security Probes</CardTitle>
              <CardDescription>
                Security tests that will be executed when using this policy
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {Object.entries(groupedProbes).map(([category, probes]) => (
                  <div key={category}>
                    <h4 className="font-medium text-slate-900 dark:text-white mb-3 flex items-center">
                      {category}
                      <Badge variant="outline" className="ml-2">
                        {probes.length}
                      </Badge>
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {probes.map((probe) => (
                        <div key={probe.id} className="p-3 border rounded-lg bg-slate-50 dark:bg-slate-800">
                          <h5 className="font-medium text-sm text-slate-900 dark:text-white">
                            {probe.name}
                          </h5>
                          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                            {probe.description}
                          </p>
                          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 font-mono">
                            {probe.id}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex space-x-4">
            <Link href={`/tests/new?policy=${policy.policy_id}`} className="flex-1">
              <Button className="w-full">
                <Play className="h-4 w-4 mr-2" />
                Run Security Test with this Policy
              </Button>
            </Link>
            <Link href={`/policies/${policy.policy_id}/edit`}>
              <Button variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Edit Policy
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
    </MainLayout>  
  );
}
