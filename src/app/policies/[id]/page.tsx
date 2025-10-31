'use client';

import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Separator } from '@/components/ui/separator';
import { DeleteConfirmDialog } from '@/components/dialogs/delete-confirmation-dialog';
import { ArrowLeft, Edit, Trash2, Shield, Layers } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { usePolicy, useDeletePolicy } from '@/hooks/use-policies';
import Link from 'next/link';
import { useState } from 'react';
import MainLayout from '@/components/layout/main-layout';
import { toast } from 'sonner';

export default function PolicyPage() {
  const router = useRouter();
  const { id } = useParams();
  const { data: policy, isLoading } = usePolicy(id as string);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const deleteMutation = useDeletePolicy();

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(id as string);
      toast.success('Policy deleted successfully');
      router.push('/policies');
    } catch (error) {
      console.error('Failed to delete policy', error);
      toast.error('Failed to delete policy');
    }
  };

  if (isLoading)
    return (
      <MainLayout>
        <div className="flex flex-col justify-center items-center min-h-screen text-muted-foreground">
          <Shield className="w-10 h-10 text-primary animate-pulse mb-3" />
          <p>Loading policy details...</p>
        </div>
      </MainLayout>
    );

  if (!policy)
    return (
      <MainLayout>
        <div className="flex flex-col justify-center items-center min-h-screen text-muted-foreground">
          <Layers className="w-10 h-10 text-destructive mb-3" />
          <p>Policy not found</p>
        </div>
      </MainLayout>
    );

  return (
    <MainLayout>
      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/policies">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{policy.name}</h1>
            <p className="text-muted-foreground">
              Last updated {formatDate(policy.updatedAt)}
            </p>
          </div>
        </div>

        {/* Main Card */}
        <Card className="border shadow-sm">
          <CardHeader className="flex justify-between items-center">
            <div>
              <Badge variant={policy.defaultDetector ? 'default' : 'outline'}>
                {policy.defaultDetector ? 'Default Policy' : 'Custom Policy'}
              </Badge>
              <CardTitle className="mt-3">{policy.name}</CardTitle>
              <p className="text-muted-foreground mt-1">{policy.description}</p>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/policies/${policy.id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" /> Edit
                </Link>
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setDeleteDialogOpen(true)}
                disabled={policy.defaultDetector}
              >
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </Button>
            </div>
          </CardHeader>

          {/* <Separator /> */}

          <CardContent className="mt-6 grid gap-8 md:grid-cols-2">
            {/* === Categories Section === */}
            <div>
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Layers className="w-4 h-4 text-primary" /> Categories
              </h3>
              <div className="space-y-3">
                {policy.categories?.length ? (
                  policy.categories.map((cat) => (
                    <div
                      key={cat.id}
                      className="p-3 rounded-lg border hover:shadow-sm transition-all bg-muted/40"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{cat.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {cat.category}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {cat.description}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm">
                    No categories assigned
                  </p>
                )}
              </div>
            </div>

            {/* === Detectors Section === */}
            <div>
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" /> Detectors
              </h3>
              <div className="space-y-3">
                {policy.detectors?.length ? (
                  policy.detectors.map((det) => (
                    <div
                      key={det.id}
                      className="p-3 rounded-lg border hover:shadow-sm transition-all bg-muted/40"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">
                          {det.detectorName}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {det.detectorType}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {det.description}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2 text-xs">
                        <Badge variant="secondary">
                          {det.creationType}
                        </Badge>
                        <Badge variant="outline">
                          Confidence: {(det.confidence * 100).toFixed(0)}%
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm">
                    No detectors assigned
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Delete Confirmation Dialog */}
        <DeleteConfirmDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={handleDelete}
          title="Delete Policy"
          description="Are you sure you want to delete this policy? This action cannot be undone."
        />
      </div>
    </MainLayout>
  );
}
