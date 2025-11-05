// src/components/project/ProjectList.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useProjects, useDeleteProject } from '@/hooks/use-projects';
import { Plus, Search, Trash2, Edit, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import { DeleteConfirmDialog } from '@/components/dialogs/delete-confirmation-dialog';
import { Pagination } from "@/components/shared/pagination";
import MainLayout from '@/components/layout/main-layout';
import { PageLoader } from "@/components/shared";

export function ProjectList() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  const { data, isLoading, isError } = useProjects({ page, limit });
  const deleteMutation = useDeleteProject();

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newSize: number) => {
    setLimit(newSize);
    setPage(1); // Reset to first page when changing page size
  };

  const handleDeleteClick = (id: string) => {
    setSelectedProject(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedProject) return;

    try {
      await deleteMutation.mutateAsync(selectedProject);
      toast.success('Project deleted successfully');
      setDeleteDialogOpen(false);
    } catch {
      toast.error('Failed to delete project');
    }
  };

  if (isLoading) return (
    <MainLayout>
      <PageLoader message="Loading projects..." />
    </MainLayout>
  );
  if (isError) return (
    <MainLayout>
      <div>Error loading projects</div>
    </MainLayout>
  );

  return (
    <MainLayout>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Projects</h1>
          <Button onClick={() => router.push('/projects/new')}>
            <Plus className="mr-2 h-4 w-4" /> New Project
          </Button>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search projects..."
              className="pl-8 w-full"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-4">
          {data?.docs?.map((project) => (
            <div
              key={project.id}
              className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{project.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {project.description}
                  </p>
                  <div className="mt-2 space-x-2">
                    <Badge
                      variant={
                        project.type === 'RED'
                          ? 'destructive'
                          : project.type === 'BLUE'
                          ? 'blue'
                          : 'default'
                      }
                    >
                      {project.type} Team
                    </Badge>
                    {project.redModelType && (
                      <Badge variant="outline">
                        {project.redModelType}
                      </Badge>
                    )}
                    {project.createdAt && (
                      <span className="text-xs text-muted-foreground">
                        Created {formatDate(project.createdAt)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.push(`/projects/${project.id}`)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.push(`/projects/${project.id}/edit`)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteClick(project.id!)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

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
          title="Delete Project"
          description="Are you sure you want to delete this project? This action cannot be undone."
        />
      </div>
    </MainLayout>
  );
}
