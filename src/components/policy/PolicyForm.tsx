"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useCategories } from "@/hooks/use-categories";
import { useDetectors } from "@/hooks/use-detectors";
import { useCreatePolicy, useUpdatePolicy } from "@/hooks/use-policies";
import { PolicyFormProps } from "@/types/policies.type";

interface Category {
  id: string;
  name: string;
  description: string;
}

const policyFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  defaultDetector: z.boolean().optional(),
  categoryIds: z.array(z.string()).nullable(),
  detectorIds: z.array(z.string()).nullable(),
});

type PolicyFormValues = z.infer<typeof policyFormSchema>;

export function PolicyForm({
  mode = "create",
  policyId,
  initialData,
  onSuccess,
}: PolicyFormProps) {
  const router = useRouter();
  const isEditMode = mode === "edit";

  const { data: categories } = useCategories();
  const { data: detectors } = useDetectors();

  const { mutate: createMutation, isPending: isCreating } = useCreatePolicy();
  const { mutate: updateMutation, isPending: isUpdating } = useUpdatePolicy();

  const isSubmitting = isCreating || isUpdating;

  const form = useForm<PolicyFormValues>({
    resolver: zodResolver(policyFormSchema),
    defaultValues: {
      name: "",
      description: "",
      defaultDetector: false,
      categoryIds: null,
      detectorIds: null,
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

  const selectedCategoryIds = watch("categoryIds") || [];
  const selectedDetectorIds = watch("detectorIds") || [];

  const onSubmit = (data: PolicyFormValues) => {
    const submitData = {
      ...data,
      defaultDetector: data.defaultDetector ?? false,
    };

    if (isEditMode && policyId) {
      updateMutation(
        { id: policyId, ...submitData },
        { onSuccess: () => {
          router.push(`/policies`);
          onSuccess?.();
        } }
      );
    } else {
      createMutation(submitData, { onSuccess: () => {
        router.push(`/policies`);
        onSuccess?.();
      } });
    }
  };

  const handleCategoryToggle = (categoryId: string) => {
    const current = selectedCategoryIds || [];
    const newIds = current.includes(categoryId)
      ? current.filter((id) => id !== categoryId)
      : [...current, categoryId];
    setValue("categoryIds", newIds.length > 0 ? newIds : null);
  };

  const handleDetectorToggle = (detectorId: string) => {
    const current = selectedDetectorIds || [];
    const newIds = current.includes(detectorId)
      ? current.filter((id) => id !== detectorId)
      : [...current, detectorId];
    setValue("detectorIds", newIds.length > 0 ? newIds : null);
  };

  return (
    <form
      onSubmit={handleSubmit((data) =>
        onSubmit(data as unknown as PolicyFormValues)
      )}
      className="space-y-8 bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-neutral-800 transition-colors"
    >
      <div className="space-y-2">
        <h2 className="text-lg font-semibold tracking-tight text-gray-900 dark:text-gray-100">
          {isEditMode ? "Edit Policy" : "Create New Policy"}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Define your policy details and assign related detectors and
          categories.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Policy Name
          </label>
          <Input
            id="name"
            placeholder="Enter policy name"
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
            placeholder="Describe this policy..."
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

      {/* Categories Section */}
      <div className="space-y-4 border-t border-gray-100 dark:border-neutral-800 pt-6">
        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-2">
          Categories
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {categories?.docs?.map((category: Category) => (
            <div
              key={category.id}
              className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-800 transition border-gray-200 dark:border-neutral-700"
            >
              <Checkbox
                id={`category-${category.id}`}
                checked={selectedCategoryIds.includes(category.id)}
                onCheckedChange={() => handleCategoryToggle(category.id)}
              />
              <div>
                <label
                  htmlFor={`category-${category.id}`}
                  className="text-sm font-medium text-gray-900 dark:text-gray-100 leading-none"
                >
                  {category.name}
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {category.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detectors Section */}
      <div className="space-y-4 border-t border-gray-100 dark:border-neutral-800 pt-6">
        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-2">
          Detectors
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {detectors?.docs?.map((detector) => (
            <div
              key={detector.id}
              className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-800 transition border-gray-200 dark:border-neutral-700"
            >
              <Checkbox
                id={`detector-${detector.id}`}
                checked={selectedDetectorIds.includes(detector.id)}
                onCheckedChange={() => handleDetectorToggle(detector.id)}
              />
              <div className="flex flex-col">
                <label
                  htmlFor={`detector-${detector.id}`}
                  className="text-sm font-medium text-gray-900 dark:text-gray-100"
                >
                  {detector.detectorName || "Unnamed Detector"}
                </label>
                {detector.description && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {detector.description}
                  </p>
                )}
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                  Type: {detector.detectorType} • Confidence:{" "}
                  {detector.confidence ? `${(detector.confidence * 100).toFixed(0)}%` : "N/A"}
                </p>
              </div>
            </div>
          ))}
        </div>
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
          // className="min-w-[130px] bg-[var(--brand-primary)] hover:bg-[var(--brand-bg-primary] text-white dark:text-gray-100"
        >
          {isSubmitting
            ? "Saving..."
            : isEditMode
            ? "Update Policy"
            : "Create Policy"}
        </Button>
      </div>
    </form>
  );
}
