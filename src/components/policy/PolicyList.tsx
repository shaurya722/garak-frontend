// src/components/policy/PolicyList.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { usePolicies, useDeletePolicy } from '@/hooks/use-policies';
import { Plus, Search, Trash2, Edit, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import { DeleteConfirmDialog } from '@/components/dialogs/delete-confirmation-dialog';
import { Pagination } from "@/components/shared/pagination";
import MainLayout from '@/components/layout/main-layout';

export function PolicyList() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState<string | null>(null);

  const { data, isLoading, isError } = usePolicies({ page, limit });
  const deleteMutation = useDeletePolicy();

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newSize: number) => {
    setLimit(newSize);
    setPage(1); // Reset to first page when changing page size
  };

  const handleDeleteClick = (id: string) => {
    setSelectedPolicy(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedPolicy) return;

    try {
      await deleteMutation.mutateAsync(selectedPolicy);
      toast.success('Policy deleted successfully');
      setDeleteDialogOpen(false);
    } catch (error) {
      toast.error('Failed to delete policy');
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading policies</div>;

  return (
    <MainLayout>
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Policies</h1>
        <Button onClick={() => router.push('/policies/new')}>
          <Plus className="mr-2 h-4 w-4" /> New Policy
        </Button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search policies..."
            className="pl-8 w-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-4">
        {data?.docs?.map((policy) => (
          <div
            key={policy.id}
            className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">{policy.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {policy.description}
                </p>
                <div className="mt-2 space-x-2">
                  <Badge variant={policy.defaultDetector ? 'default' : 'outline'}>
                    {policy.defaultDetector ? 'Default' : 'Custom'}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    Updated {formatDate(policy.updatedAt)}
                  </span>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => router.push(`/policies/${policy.id}`)}

                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => router.push(`/policies/${policy.id}/edit`)}
                  disabled={policy.defaultDetector}

                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteClick(policy.id)}
                  disabled={policy.defaultDetector}
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
        title="Delete Policy"
        description="Are you sure you want to delete this policy? This action cannot be undone."
      />
    </div>
    </MainLayout>
  );
}