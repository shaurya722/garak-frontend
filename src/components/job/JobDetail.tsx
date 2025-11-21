'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Trash2, Copy } from 'lucide-react';
import Link from 'next/link';
import { useJob, useDeleteJob } from '@/hooks/use-jobs';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import { DeleteConfirmDialog } from '@/components/dialogs/delete-confirmation-dialog';
import MainLayout from '@/components/layout/main-layout';
import { PageLoader } from "@/components/shared";
import { useState } from 'react';

type JobDetailProps = {
  jobId: string;
};

export function JobDetail({ jobId }: JobDetailProps) {
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { data: job, isLoading, isError } = useJob(jobId);
  const deleteMutation = useDeleteJob();

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteMutation.mutateAsync(jobId);
      toast.success('Job deleted successfully');
      router.push('/jobs');
    } catch {
      toast.error('Failed to delete job');
    }
  };

  if (isLoading) return (
    <MainLayout>
      <PageLoader message="Loading job details..." />
    </MainLayout>
  );

  if (isError || !job) return (
    <MainLayout>
      <div>Error loading job details</div>
    </MainLayout>
  );

  return (
    <MainLayout>
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <Link href="/jobs">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Jobs
            </Button>
          </Link>
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Job Details</h1>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => router.push(`/jobs/${jobId}/edit`)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteClick}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* <div>
                <label className="text-sm font-medium  text-gray-500">Job ID</label>
                <p className="text-sm font-mono bg-gray-50 p-2 rounded">{job.id}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Project ID</label>
                <p className="text-sm font-mono bg-gray-50 p-2 rounded">{job.projectId}</p>
              </div> */}
              <div>
                <label className="text-sm font-medium text-gray-500">Project Type</label>
                <p>{job.projectType}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <Badge variant={job.status === 'PENDING' ? 'secondary' : 'default'}>
                  {job.status}
                </Badge>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Created At</label>
                <p>{job.createdAt && formatDate(job.createdAt)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Updated At</label>
                <p>{job.updatedAt && formatDate(job.updatedAt)}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Red Authorization Value</label>
                <div className="mt-1">
                  {job.redAuthorizationValue ? (
                    <Badge variant="outline">
                      <div className="flex items-center space-x-1">
                        <span>
                          {job.redAuthorizationValue!.length > 50
                            ? `${job.redAuthorizationValue!.substring(0, 50)}...`
                            : job.redAuthorizationValue}
                        </span>
                        <button
                          type="button"
                          className="button-reset bg-transparent p-0 text-muted-foreground"
                          onClick={() => {
                            navigator.clipboard.writeText(job.redAuthorizationValue!);
                            toast.success('Copied!');
                          }}
                        >
                          <Copy className="h-3 w-3" />
                        </button>
                      </div>
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground">None</span>
                  )}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Evaluation Threshold</label>
                <div className="mt-1">
                  {job.evaluationThreshold !== null ? (
                    <Badge variant="secondary">
                      {job.evaluationThreshold}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground">None</span>
                  )}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Blue API Key</label>
                <div className="mt-1">
                  {job.blueAPIKey ? (
                    <Badge variant="outline">
                      <div className="flex items-center space-x-1">
                        <span>
                          {job.blueAPIKey!.length > 50
                            ? `${job.blueAPIKey!.substring(0, 50)}...`
                            : job.blueAPIKey}
                        </span>
                        <button
                          type="button"
                          className="button-reset bg-transparent p-0 text-muted-foreground"
                          onClick={() => {
                            navigator.clipboard.writeText(job.blueAPIKey!);
                            toast.success('Copied!');
                          }}
                        >
                          <Copy className="h-3 w-3" />
                        </button>
                      </div>
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground">None</span>
                  )}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Agentic Report</label>
                <div className="mt-1">
                  {job.agenticReport ? (
                    <div className="bg-gray-50 p-3 rounded text-sm">
                      {job.agenticReport}
                    </div>
                  ) : (
                    <span className="text-muted-foreground">None</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {job.project && (
            <Card>
              <CardHeader>
                <CardTitle>Associated Project</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Project Name</label>
                  <p className="font-medium">{job.project.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Project Description</label>
                  <p>{job.project.description}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Project Type</label>
                  <Badge variant={job.project.type === 'RED' ? 'destructive' : job.project.type === 'BLUE' ? 'blue' : 'default'}>
                    {job.project.type} Team
                  </Badge>
                </div>
                {job.project.redModelType && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Model Type</label>
                    <p>{job.project.redModelType}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <DeleteConfirmDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={handleDeleteConfirm}
          title="Delete Job"
          description="Are you sure you want to delete this job? This action cannot be undone."
        />
      </div>
    </MainLayout>
  );
}
