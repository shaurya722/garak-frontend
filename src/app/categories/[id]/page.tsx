'use client';

import { useParams, useRouter } from 'next/navigation';
import { useCategory } from '@/hooks/use-categories';
import { Button } from '@/components/ui/button';
import MainLayout from '@/components/layout/main-layout';
import { Edit, Trash2, ArrowLeft } from 'lucide-react';

export default function ViewCategoryPage() {
  const router = useRouter();
  const { id } = useParams();
  const { data: category, isLoading, error } = useCategory(id as string);

  // Debug: Log the category data to see what we're getting
  console.log('Category data:', category);

  if (isLoading) return (
    <MainLayout>
      <div className="container mx-auto p-6">
        <div>Loading category...</div>
      </div>
    </MainLayout>
  );

  if (error) return (
    <MainLayout>
      <div className="container mx-auto p-6">
        <div className="text-red-500">Error loading category: {error.message}</div>
      </div>
    </MainLayout>
  );

  if (!category) return (
    <MainLayout>
      <div className="container mx-auto p-6">
        <div>Category not found</div>
      </div>
    </MainLayout>
  );

  // Debug: Log the category data to see what we're getting
  console.log('Category data:', category);
  console.log('Category probes:', category.probes);

  return (
    <MainLayout>
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/categories')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Categories
            </Button>
            <h1 className="text-2xl font-bold">Category Details</h1>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => router.push(`/categories/${id}/edit`)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button
              variant="destructive"
              onClick={() => router.push(`/categories/${id}/delete`)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>

        <div className="max-w-4xl">
          <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-sm border border-gray-200 dark:border-neutral-800 p-6">
            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                <p className="mt-1 text-lg font-semibold">{category.name}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                <p className="mt-1 text-gray-600 dark:text-gray-400">{category.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Created</label>
                  <p className="mt-1 text-gray-600 dark:text-gray-400">
                    {category.createdAt ? new Date(category.createdAt).toLocaleString() : 'N/A'}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Last Updated</label>
                  <p className="mt-1 text-gray-600 dark:text-gray-400">
                    {category.updatedAt ? new Date(category.updatedAt).toLocaleString() : 'N/A'}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Probes ({Array.isArray(category.probes) ? category.probes.length : 0})
                </label>
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {category.probes && Array.isArray(category.probes) && category.probes.length > 0 ? (
                    category.probes.map((probe: any, index: number) => {
                      // Handle probe object structure from API
                      const probeId = probe.probeId || probe.id;
                      const probeName = probe.name || probeId;
                      const probeDesc = probe.description;
                      const probeKey = probe.id || `probe-${index}`;

                      return (
                        <div
                          key={probeKey}
                          className="p-4 bg-gray-50 dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="font-semibold text-gray-900 dark:text-gray-100">
                                {probeName}
                              </div>
                              {probeDesc && (
                                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                  {probeDesc}
                                </div>
                              )}
                              <div className="text-xs text-gray-500 dark:text-gray-500 mt-2 font-mono">
                                ID: {probeId}
                              </div>
                              {probe.createdAt && (
                                <div className="text-xs text-gray-400 dark:text-gray-600 mt-1">
                                  Created: {new Date(probe.createdAt).toLocaleDateString()}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 col-span-full">
                      No probes assigned to this category
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
