'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useProbes } from "@/hooks/use-probes";
import { useCreateCategory, useUpdateCategory, useCategory } from "@/hooks/use-categories";
import { Search, Check, X } from 'lucide-react';

const categoryFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  probes: z.array(z.string()).min(1, "At least one probe must be selected"),
});

type CategoryFormValues = z.infer<typeof categoryFormSchema>;

interface CategoryFormProps {
  mode?: "create" | "edit";
  categoryId?: string;
  initialData?: Partial<CategoryFormValues>;
  onSuccess?: () => void;
}

export function CategoryForm({
  mode = "create",
  categoryId,
  initialData,
  onSuccess,
}: CategoryFormProps) {
  const router = useRouter();
  const { data: probes } = useProbes({ limit: 100 }); // Get all probes
  const { data: category } = useCategory(categoryId || '');

  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();

  const isEditMode = mode === "edit";
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const [probeSearch, setProbeSearch] = useState('');

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: "",
      description: "",
      probes: [],
      ...initialData,
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = form;

  const selectedProbeIds = watch("probes") || [];

  // Set initial values when category data loads
  useEffect(() => {
    if (isEditMode && category) {
      setValue("name", category.name);
      setValue("description", category.description);

      // Handle both string arrays and Probe object arrays
      const probeIds = Array.isArray(category.probes)
        ? category.probes.map(p => typeof p === 'string' ? p : p.probeId)
        : [];
      setValue("probes", probeIds);
    }
  }, [category, isEditMode, setValue]);

  const onSubmit = (data: CategoryFormValues) => {
    if (isEditMode && categoryId) {
      updateMutation.mutate({ id: categoryId, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleProbeToggle = (probeId: string) => {
    const current = selectedProbeIds || [];
    const newIds = current.includes(probeId)
      ? current.filter((id) => id !== probeId)
      : [...current, probeId];
    setValue("probes", newIds);
  };

  const filteredProbes = probes?.docs?.filter(probe =>
    probe.name.toLowerCase().includes(probeSearch.toLowerCase()) ||
    probe.description?.toLowerCase().includes(probeSearch.toLowerCase()) ||
    probe.probeId.toLowerCase().includes(probeSearch.toLowerCase())
  ) || [];
  

  const selectedCount = selectedProbeIds.length;
  const totalCount = probes?.docs?.length || 0;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-8 bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-neutral-800 transition-colors"
    >
      <div className="space-y-2">
        <h2 className="text-lg font-semibold tracking-tight text-gray-900 dark:text-gray-100">
          {isEditMode ? "Edit Category" : "Create New Category"}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Define your category details and select probes.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Category Name
          </label>
          <Input
            id="name"
            placeholder="Enter category name"
            {...register("name")}
            className="mt-1 bg-gray-50 dark:bg-neutral-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-neutral-700 focus-visible:ring-[var(--brand-primary)]"
          />
          {errors.name && (
            <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Description
          </label>
          <Textarea
            id="description"
            placeholder="Describe this category..."
            {...register("description")}
            rows={4}
            className="mt-1 bg-gray-50 dark:bg-neutral-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-neutral-700 focus-visible:ring-[var(--brand-primary)]"
          />
          {errors.description && (
            <p className="text-xs text-red-500 mt-1">
              {errors.description.message}
            </p>
          )}
        </div>
      </div>

      {/* Probes Section */}
      <div className="space-y-4 border-t border-gray-100 dark:border-neutral-800 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
              Probes
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Select the probes to include in this category ({selectedCount} of {totalCount} selected)
            </p>
          </div>
          <Badge variant="outline" className="text-xs">
            {selectedCount} selected
          </Badge>
        </div>

        {errors.probes && (
          <p className="text-xs text-red-500">{errors.probes.message}</p>
        )}

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search probes..."
            value={probeSearch}
            onChange={(e) => setProbeSearch(e.target.value)}
            className="pl-10 bg-gray-50 dark:bg-neutral-800 border-gray-200 dark:border-neutral-700"
          />
        </div>

        {/* Probes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto border rounded-lg p-4 bg-gray-50/50 dark:bg-neutral-800/50">
          {filteredProbes.length > 0 ? (
            filteredProbes.map((probe) => (
              <div
                key={probe.id}
                className={`flex items-start gap-3 p-3 border rounded-lg transition-all cursor-pointer hover:shadow-md ${
                  selectedProbeIds.includes(probe.probeId)
                    ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
                    : 'border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-700'
                }`}
                onClick={() => handleProbeToggle(probe.probeId)}
              >
                <div className="flex items-center justify-center w-5 h-5 mt-0.5">
                  {selectedProbeIds.includes(probe.probeId) ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <div className="w-4 h-4 border-2 border-gray-300 dark:border-neutral-600 rounded" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {probe.name}
                    </h4>
                    {selectedProbeIds.includes(probe.probeId) && (
                      <Badge variant="default" className="text-xs px-1.5 py-0.5">
                        Selected
                      </Badge>
                    )}
                  </div>
                  {probe.description && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                      {probe.description}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 font-mono">
                    ID: {probe.probeId}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">
                {probeSearch ? 'No probes found matching your search.' : 'No probes available.'}
              </p>
            </div>
          )}
        </div>

        {selectedCount > 0 && (
          <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
            <Check className="h-4 w-4" />
            {selectedCount} probe{selectedCount !== 1 ? 's' : ''} selected
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-neutral-800">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
          className="dark:border-neutral-700 dark:text-gray-200 dark:hover:bg-neutral-800"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          variant="default"
        >
          {isSubmitting
            ? "Saving..."
            : isEditMode
            ? "Update Category"
            : "Create Category"}
        </Button>
      </div>
    </form>
  );
}
