'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useJobs, useDeleteJob } from '@/hooks/use-jobs';
import { Plus, Search, Trash2, Edit, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import { DeleteConfirmDialog } from '@/components/dialogs/delete-confirmation-dialog';
import { Pagination } from "@/components/shared/pagination";
import MainLayout from '@/components/layout/main-layout';
import { PageLoader } from "@/components/shared";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function JobList() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<string | null>(null);

  const { data, isLoading, isError } = useJobs({ page, limit });
  const deleteMutation = useDeleteJob();  

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newSize: number) => {
    setLimit(newSize);
    setPage(1); // Reset to first page when changing page size
  };

  const handleDeleteClick = (id: string) => {
    setSelectedJob(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedJob) return;

    try {
      await deleteMutation.mutateAsync(selectedJob);
      toast.success('Job deleted successfully');
      setDeleteDialogOpen(false);
    } catch {
      toast.error('Failed to delete job');
    }
  };

  if (isLoading) return (
    <MainLayout>
      <PageLoader message="Loading jobs..." />
    </MainLayout>
  );
  if (isError) return (
    <MainLayout>
      <div>Error loading jobs</div>
    </MainLayout>
  );

  return (
    <MainLayout>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Jobs</h1>
          <Button onClick={() => router.push('/jobs/new')}>
            <Plus className="mr-2 h-4 w-4" /> New Job
          </Button>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search jobs..."
              className="pl-8 w-full"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Project Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Authorization Value</TableHead>
              <TableHead>Evaluation Threshold</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.docs?.map((job) => (
              <TableRow key={job.id}>
                <TableCell>
                  <Badge variant={job.projectType === 'RED' ? 'destructive' : job.projectType === 'BLUE' ? 'blue' : 'default'}>
                    {job.projectType}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={job.status === 'PENDING' ? 'secondary' : 'default'}>
                    {job.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {job.redAuthorizationValue ? (
                    <Badge variant="outline">
                      {job.redAuthorizationValue.length > 20
                        ? `${job.redAuthorizationValue.substring(0, 20)}...`
                        : job.redAuthorizationValue}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground">None</span>
                  )}
                </TableCell>
                <TableCell>
                  {job.evaluationThreshold !== null ? (
                    <Badge variant="secondary">
                      {job.evaluationThreshold}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground">None</span>
                  )}
                </TableCell>
                <TableCell>
                  {job.createdAt && formatDate(job.createdAt)}
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => router.push(`/jobs/${job.id}`)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => router.push(`/jobs/${job.id}/edit`)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteClick(job.id!)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Pagination */}
        {data && data.totalPages > 0 && (
          <Pagination
            page={data.currentPage}
            totalPages={data.totalPages}
            onPageChange={handlePageChange}
            pageSize={limit}
            onPageSizeChange={handlePageSizeChange}
          />
        )}

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
