'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCategories, useDeleteCategory } from '@/hooks/use-categories';
import { Plus, Search, Trash2, Edit, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import { DeleteConfirmDialog } from '@/components/dialogs/delete-confirmation-dialog';
import { Pagination } from "@/components/shared/pagination";
import MainLayout from '@/components/layout/main-layout';
import { PageLoader } from "@/components/shared";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function CategoryList() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { data, isLoading, isError } = useCategories({ page, limit });
  const deleteMutation = useDeleteCategory();

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newSize: number) => {
    setLimit(newSize);
    setPage(1); // Reset to first page when changing page size
  };

  const handleDeleteClick = (id: string) => {
    setSelectedCategory(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedCategory) return;

    try {
      await deleteMutation.mutateAsync(selectedCategory);
      toast.success('Category deleted successfully');
      setDeleteDialogOpen(false);
    } catch {
      toast.error('Failed to delete category');
    }
  };

  if (isLoading) return (
    <MainLayout>
      <PageLoader message="Loading categories..." />
    </MainLayout>
  );
  if (isError) return (
    <MainLayout>
      <div>Error loading categories</div>
    </MainLayout>
  );

  return (
    <MainLayout>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Categories</h1>
          <Button onClick={() => router.push('/categories/new')}>
            <Plus className="mr-2 h-4 w-4" /> New Category
          </Button>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search categories..."
              className="pl-8 w-full"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Probes</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.docs?.map((category) => (
              <TableRow key={category.id}>
                <TableCell className="font-medium">{category.name}</TableCell>
                <TableCell title={category.description}>{category.description.length > 40 ? `${category.description.substring(0, 40)}...` : category.description}</TableCell>
                <TableCell>{category.probes?.length || 0} probes</TableCell>
                <TableCell>{formatDate(category.createdAt)}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => router.push(`/categories/${category.id}`)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => router.push(`/categories/${category.id}/edit`)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteClick(category.id)}
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
          title="Delete Category"
          description="Are you sure you want to delete this category? This action cannot be undone."
        />
      </div>
    </MainLayout>
  );
}
