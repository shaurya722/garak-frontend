"use client";

import { useState, useEffect } from 'react';
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDetectors } from "@/hooks/use-detectors";
import { useCreatePolicy, useUpdatePolicy } from "@/hooks/use-policies";
import { useCategories, useDeleteCategory } from "@/hooks/use-categories";
import { ChevronDown, ChevronRight, Eye, Edit, Trash2, X } from 'lucide-react';
import { PolicyFormProps } from "@/types/policies.type";
import { DeleteConfirmDialog } from '@/components/dialogs/delete-confirmation-dialog';
import { toast } from 'sonner';
import { CategoryProbe } from '@/services/category/category.service';

const policyFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  type: z.enum(["RED", "BLUE"]),
  defaultDetector: z.boolean().optional(),
  categoryIds: z.array(z.string()).nullable(),
  detectorIds: z.array(z.string()).nullable(),
  // BLUE policy specific fields
  anonymize: z.boolean().optional(),
  anonymizeType: z.array(z.string()).optional(),
  anonymizeHiddenNames: z.string().optional(),
  anonymizeAllowedNames: z.string().optional(),
  anonymizePreamble: z.string().optional(),
  anonymizeUseFaker: z.boolean().optional(),
  anonymizeThreshold: z.number().min(0).max(1).optional(),
  banCode: z.boolean().optional(),
  banCodeThreshold: z.number().min(0).max(1).optional(),
  banCompetitors: z.boolean().optional(),
  banCompetitorsThreshold: z.number().min(0).max(1).optional(),
  banCompetitorsCompetitors: z.string().optional(),
  banSubstrings: z.boolean().optional(),
  banSubstringsSubstrings: z.string().optional(),
  banSubstringsMatchType: z.string().optional(),
  banSubstringsCaseSensitive: z.boolean().optional(),
  banSubstringsRedact: z.boolean().optional(),
  banSubstringsContainsAll: z.boolean().optional(),
  banTopics: z.boolean().optional(),
  banTopicsThreshold: z.number().min(0).max(1).optional(),
  banTopicsTopics: z.string().optional(),
  code: z.boolean().optional(),
  codeLanguages: z.string().optional(),
  codeIsBlocked: z.boolean().optional(),
  gibberish: z.boolean().optional(),
  gibberishThreshold: z.number().min(0).max(1).optional(),
  gibberishMatchType: z.string().optional(),
  language: z.boolean().optional(),
  languageValidLanguages: z.string().optional(),
  languageMatchType: z.string().optional(),
  promptInjection: z.boolean().optional(),
  promptInjectionThreshold: z.number().min(0).max(1).optional(),
  promptInjectionMatchType: z.string().optional(),
  regex: z.boolean().optional(),
  regexPatterns: z.string().optional(),
  regexIsBlocked: z.boolean().optional(),
  regexRedact: z.boolean().optional(),
  secrets: z.boolean().optional(),
  secretsRedactMode: z.string().optional(),
  sentiment: z.boolean().optional(),
  sentimentThreshold: z.number().min(0).max(1).optional(),
  sentimentMatchType: z.string().optional(),
  tokenLimit: z.boolean().optional(),
  tokenLimitLimit: z.number().optional(),
  tokenLimitEncodingName: z.string().optional(),
  toxicity: z.boolean().optional(),
  toxicityThreshold: z.number().min(0).max(1).optional(),
  toxicityMatchType: z.string().optional(),
});

type PolicyFormValues = z.infer<typeof policyFormSchema>;

// TagInput component for array fields
interface TagInputProps {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  className?: string;
}

function TagInput({ value = [], onChange, placeholder = "Add tag...", className = "" }: TagInputProps) {
  const [inputValue, setInputValue] = useState("");

  const handleAddTag = () => {
    if (inputValue.trim() && !value.includes(inputValue.trim())) {
      onChange([...value, inputValue.trim()]);
      setInputValue("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onChange(value.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex flex-wrap gap-2">
        {value.map((tag, index) => (
          <Badge key={index} variant="secondary" className="flex items-center gap-1">
            {tag}
            <button
              type="button"
              onClick={() => handleRemoveTag(tag)}
              className="ml-1 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-full p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>
      <Input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder={placeholder}
        className="bg-gray-50 dark:bg-neutral-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-neutral-700"
      />
    </div>
  );
}

export function PolicyForm({
  mode = "create",
  policyId,
  initialData,
  onSuccess,
}: PolicyFormProps) {
  const router = useRouter();
  const { data: detectors } = useDetectors();
  const { data: categories } = useCategories({ limit: 100 }); // Get all categories for selection
  const deleteCategoryMutation = useDeleteCategory();

  const { mutate: createMutation, isPending: isCreating } = useCreatePolicy();
  const { mutate: updateMutation, isPending: isUpdating } = useUpdatePolicy();

  const isEditMode = mode === "edit";
  const isSubmitting = isCreating || isUpdating;

  // Collapsible probes state
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCategoryForDelete, setSelectedCategoryForDelete] = useState<string | null>(null);

  const form = useForm<PolicyFormValues>({
    resolver: zodResolver(policyFormSchema),
    defaultValues: {
      name: "",
      description: "",
      type: "RED",
      defaultDetector: false,
      categoryIds: null,
      detectorIds: null,
      ...initialData,
      // Convert arrays to comma-separated strings for BLUE fields
      ...(initialData?.type === "BLUE" && {
        anonymizeHiddenNames: Array.isArray(initialData.anonymizeHiddenNames) ? initialData.anonymizeHiddenNames.join(',') : initialData.anonymizeHiddenNames,
        anonymizeAllowedNames: Array.isArray(initialData.anonymizeAllowedNames) ? initialData.anonymizeAllowedNames.join(',') : initialData.anonymizeAllowedNames,
        banCompetitorsCompetitors: Array.isArray(initialData.banCompetitorsCompetitors) ? initialData.banCompetitorsCompetitors.join(',') : initialData.banCompetitorsCompetitors,
        banSubstringsSubstrings: Array.isArray(initialData.banSubstringsSubstrings) ? initialData.banSubstringsSubstrings.join(',') : initialData.banSubstringsSubstrings,
        banTopicsTopics: Array.isArray(initialData.banTopicsTopics) ? initialData.banTopicsTopics.join(',') : initialData.banTopicsTopics,
        codeLanguages: Array.isArray(initialData.codeLanguages) ? initialData.codeLanguages.join(',') : initialData.codeLanguages,
        languageValidLanguages: Array.isArray(initialData.languageValidLanguages) ? initialData.languageValidLanguages.join(',') : initialData.languageValidLanguages,
        regexPatterns: Array.isArray(initialData.regexPatterns) ? initialData.regexPatterns.join(',') : initialData.regexPatterns,
      }),
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    control,
  } = form;

  const selectedType = watch("type");

  const onSubmit = (data: PolicyFormValues) => {
    // Convert comma-separated strings to arrays for BLUE policy fields
    const processedData = {
      ...data,
      defaultDetector: data.defaultDetector ?? false,
      // For BLUE policies, set categoryIds and detectorIds to null
      ...(data.type === "BLUE" && {
        categoryIds: null,
        detectorIds: null,
        defaultDetector: false,
      }),
      // Convert string fields to arrays for BLUE policies
      ...(data.type === "BLUE" && {
        anonymizeHiddenNames: data.anonymizeHiddenNames ? data.anonymizeHiddenNames.split(',').map(s => s.trim()).filter(Boolean) : [],
        anonymizeAllowedNames: data.anonymizeAllowedNames ? data.anonymizeAllowedNames.split(',').map(s => s.trim()).filter(Boolean) : [],
        banCompetitorsCompetitors: data.banCompetitorsCompetitors ? data.banCompetitorsCompetitors.split(',').map(s => s.trim()).filter(Boolean) : [],
        banSubstringsSubstrings: data.banSubstringsSubstrings ? data.banSubstringsSubstrings.split(',').map(s => s.trim()).filter(Boolean) : [],
        banTopicsTopics: data.banTopicsTopics ? data.banTopicsTopics.split(',').map(s => s.trim()).filter(Boolean) : [],
        codeLanguages: data.codeLanguages ? data.codeLanguages.split(',').map(s => s.trim()).filter(Boolean) : [],
        languageValidLanguages: data.languageValidLanguages ? data.languageValidLanguages.split(',').map(s => s.trim()).filter(Boolean) : [],
        regexPatterns: data.regexPatterns ? data.regexPatterns.split(',').map(s => s.trim()).filter(Boolean) : [],
      }),
    };

    if (isEditMode && policyId) {
      updateMutation(
        { id: policyId, ...processedData },
        { onSuccess: () => {
          router.push(`/policies`);
          onSuccess?.();
        } }
      );
    } else {
      createMutation(processedData, { onSuccess: () => {
        router.push(`/policies`);
        onSuccess?.();
      } });
    }
  };

  const selectedCategoryIds = watch("categoryIds") || [];
  const selectedDetectorIds = watch("detectorIds") || [];

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

  // Category management functions - redirect to category pages
  const handleCreateCategory = () => {
    router.push('/categories/new');
  };

  const handleEditCategory = (categoryId: string) => {
    router.push(`/categories/${categoryId}/edit`);
  };

  const handleViewCategory = (categoryId: string) => {
    router.push(`/categories/${categoryId}`);
  };

  const handleDeleteCategory = (categoryId: string) => {
    setSelectedCategoryForDelete(categoryId);
    setDeleteDialogOpen(true);
  };

  // Handle category delete confirmation
  const handleDeleteCategoryConfirm = async () => {
    if (!selectedCategoryForDelete) return;

    try {
      await deleteCategoryMutation.mutateAsync(selectedCategoryForDelete);
      toast.success('Category deleted successfully');
      setDeleteDialogOpen(false);
      setSelectedCategoryForDelete(null);
    } catch {
      toast.error('Failed to delete category');
    }
  };

  // Set initial values when category data loads
  useEffect(() => {
    if (!isEditMode && !selectedCategoryIds?.length) {
      // Check for pre-selected categories from PolicyList
      const preSelectedCategories = localStorage.getItem('selectedCategoriesForPolicy');
      if (preSelectedCategories) {
        try {
          const categoryIds = JSON.parse(preSelectedCategories);
          if (Array.isArray(categoryIds) && categoryIds.length > 0) {
            setValue("categoryIds", categoryIds);
          }
          // Clear the localStorage after using it
          localStorage.removeItem('selectedCategoriesForPolicy');
        } catch (error) {
          console.error('Error parsing pre-selected categories:', error);
        }
      }
    }
  }, [isEditMode, selectedCategoryIds?.length, setValue]);

  // Toggle category probes expansion
  const toggleCategoryExpansion = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  return (
    <>
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

        <div>
          <label
            htmlFor="type"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Policy Type
          </label>
          <Controller
            name="type"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger className="mt-1 bg-gray-50 dark:bg-neutral-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-neutral-700 focus-visible:ring-[var(--brand-primary)]">
                  <SelectValue placeholder="Select policy type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="RED">RED Policy</SelectItem>
                  <SelectItem value="BLUE">BLUE Policy</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {errors.type && (
            <p className="text-xs text-red-500 mt-1">{errors.type.message}</p>
          )}
        </div>
      </div>

      {/* Categories Section - Only show for RED policies */}
      {selectedType === "RED" && (
        <div className="space-y-6 border-t border-gray-100 dark:border-neutral-800 pt-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold tracking-tight text-gray-900 dark:text-gray-100">
                Categories
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Select categories to include in this policy
              </p>
            </div>
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={handleCreateCategory}
              className="shrink-0"
            >
              <span className="text-lg mr-2">+</span>
              Create Category
            </Button>
          </div>

          {selectedCategoryIds && selectedCategoryIds.length > 0 && (
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {selectedCategoryIds.length} categor{selectedCategoryIds.length !== 1 ? 'ies' : 'y'} selected
            </div>
          )}

          <div className="space-y-3">
            {categories?.docs?.map((category) => {
              const isSelected = selectedCategoryIds.includes(category.id);
              const isExpanded = expandedCategories.has(category.id);

              return (
                <div
                  key={category.id}
                  className={`border rounded-lg transition-colors cursor-pointer ${
                    isSelected
                      ? 'border-green-500 bg-green-50/30 dark:bg-green-900/10'
                      : 'border-gray-200 dark:border-neutral-700 hover:border-gray-300 dark:hover:border-neutral-600'
                  }`}
                  onClick={() => handleCategoryToggle(category.id)}
                >
                  {/* Category Header */}
                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-5 h-5 mt-0.5 border-2 rounded flex items-center justify-center cursor-pointer transition-colors ${
                          isSelected
                            ? 'border-green-500 bg-green-500'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCategoryToggle(category.id);
                        }}
                      >
                        {isSelected && (
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <label
                              htmlFor={`category-${category.id}`}
                              className="text-sm font-medium text-gray-900 dark:text-gray-100 leading-tight cursor-pointer"
                            >
                              {category.name}
                            </label>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {category.description}
                            </p>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                              {Array.isArray(category.probes) ? category.probes.length : 0} probes
                            </div>
                          </div>

                          <div className="flex gap-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewCategory(category.id);
                              }}
                              className="h-8 w-8 p-0"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditCategory(category.id);
                              }}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteCategory(category.id);
                              }}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Probes Section */}
                  <div className="border-t border-gray-100 dark:border-neutral-800">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleCategoryExpansion(category.id);
                      }}
                      className="w-full flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-neutral-800/50 transition-colors text-left"
                    >
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Available Probes
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {Array.isArray(category.probes) ? category.probes.length : 0}
                        </span>
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4 text-gray-400" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="px-4 py-4">
                        <div className="grid grid-cols-4 lg:grid-cols-4 md:grid-cols-2 sm:grid-cols-1 gap-2">
                          {Array.isArray(category.probes) && category.probes.length > 0 ? (
                            category.probes.map((probe: CategoryProbe) => (
                                <div
                                  key={probe.probeId}
                                  className="flex items-center gap-2 p-2 text-xs bg-gray-50 dark:bg-neutral-800 rounded border border-gray-200 dark:border-neutral-700"
                                >
                                  <div className="w-1.5 h-1.5 rounded-full bg-gray-400 flex-shrink-0"></div>
                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium text-gray-900 dark:text-gray-100 truncate">
                                      {probe.probe.name}
                                    </div>
                                  </div>
                                </div>

                            ))
                          ) : (
                            <div className="col-span-full text-center py-4 text-gray-500 dark:text-gray-400 text-sm">
                              No probes available
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {(!categories?.docs || categories.docs.length === 0) && (
            <div className="text-center py-8 border-2 border-dashed border-gray-200 dark:border-neutral-700 rounded-lg">
              <div className="text-gray-400 dark:text-gray-500 mb-2">
                <span className="text-3xl">+</span>
              </div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                No categories available
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                Create your first category to get started
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCreateCategory}
              >
                <span className="text-lg mr-2">+</span>
                Create Category
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Detectors Section - Only show for RED policies */}
      {selectedType === "RED" && (
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
      )}

      {/* BLUE Policy Configuration */}
      {selectedType === "BLUE" && (
        <div className="space-y-6 border-t border-gray-100 dark:border-neutral-800 pt-8">
          <div>
            <h3 className="text-lg font-semibold tracking-tight text-gray-900 dark:text-gray-100 mb-2">
              BLUE Policy Configuration
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Configure advanced filtering and anonymization settings for BLUE policies
            </p>
          </div>

          {/* Anonymization Section */}
          <div className="space-y-4">
            <h4 className="text-md font-medium text-gray-900 dark:text-gray-100">Anonymization</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox {...register("anonymize")} />
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Enable Anonymization</label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Anonymize Types</label>
                <Controller
                  name="anonymizeType"
                  control={control}
                  render={({ field }) => (
                    <TagInput
                      value={field.value || []}
                      onChange={field.onChange}
                      placeholder="Add anonymize type (e.g., name, email)"
                      className="mt-1"
                    />
                  )}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Hidden Names</label>
                <Controller
                  name="anonymizeHiddenNames"
                  control={control}
                  render={({ field }) => (
                    <TagInput
                      value={typeof field.value === 'string' ? field.value.split(',').map(s => s.trim()).filter(Boolean) : (field.value || [])}
                      onChange={(value) => field.onChange(value.join(','))}
                      placeholder="Add hidden name"
                      className="mt-1"
                    />
                  )}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Allowed Names</label>
                <Controller
                  name="anonymizeAllowedNames"
                  control={control}
                  render={({ field }) => (
                    <TagInput
                      value={typeof field.value === 'string' ? field.value.split(',').map(s => s.trim()).filter(Boolean) : (field.value || [])}
                      onChange={(value) => field.onChange(value.join(','))}
                      placeholder="Add allowed name"
                      className="mt-1"
                    />
                  )}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Preamble</label>
                <Input
                  placeholder="Anonymized content notice"
                  {...register("anonymizePreamble")}
                  className="mt-1 bg-gray-50 dark:bg-neutral-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-neutral-700"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox {...register("anonymizeUseFaker")} />
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Use Faker</label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Threshold</label>
                <Input
                  type="range"
                  step="0.01"
                  min="0"
                  max="1"
                  {...register("anonymizeThreshold")}
                  className="mt-1 bg-gray-50 dark:bg-neutral-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-neutral-700"
                />
              </div>
            </div>
          </div>

          {/* Ban Code Section */}
          <div className="space-y-4">
            <h4 className="text-md font-medium text-gray-900 dark:text-gray-100">Ban Code</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox {...register("banCode")} />
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Enable Ban Code</label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Threshold</label>
                <Input
                  type="range"
                  step="0.01"
                  min="0"
                  max="1"
                  {...register("banCodeThreshold")}
                  className="mt-1 bg-gray-50 dark:bg-neutral-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-neutral-700"
                />
              </div>
            </div>
          </div>

          {/* Ban Competitors Section */}
          <div className="space-y-4">
            <h4 className="text-md font-medium text-gray-900 dark:text-gray-100">Ban Competitors</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox {...register("banCompetitors")} />
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Enable Ban Competitors</label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Threshold</label>
                <Input
                  type="range"
                  step="0.01"
                  min="0"
                  max="1"
                  {...register("banCompetitorsThreshold")}
                  className="mt-1 bg-gray-50 dark:bg-neutral-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-neutral-700"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Competitors</label>
                <Controller
                  name="banCompetitorsCompetitors"
                  control={control}
                  render={({ field }) => (
                    <TagInput
                      value={typeof field.value === 'string' ? field.value.split(',').map(s => s.trim()).filter(Boolean) : (field.value || [])}
                      onChange={(value) => field.onChange(value.join(','))}
                      placeholder="Add competitor name"
                      className="mt-1"
                    />
                  )}
                />
              </div>
            </div>
          </div>

          {/* Ban Substrings Section */}
          <div className="space-y-4">
            <h4 className="text-md font-medium text-gray-900 dark:text-gray-100">Ban Substrings</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox {...register("banSubstrings")} />
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Enable Ban Substrings</label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Match Type</label>
                <Input
                  placeholder="e.g., exact"
                  {...register("banSubstringsMatchType")}
                  className="mt-1 bg-gray-50 dark:bg-neutral-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-neutral-700"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox {...register("banSubstringsCaseSensitive")} />
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Case Sensitive</label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox {...register("banSubstringsRedact")} />
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Redact</label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox {...register("banSubstringsContainsAll")} />
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Contains All</label>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Substrings</label>
                <Controller
                  name="banSubstringsSubstrings"
                  control={control}
                  render={({ field }) => (
                    <TagInput
                      value={typeof field.value === 'string' ? field.value.split(',').map(s => s.trim()).filter(Boolean) : (field.value || [])}
                      onChange={(value) => field.onChange(value.join(','))}
                      placeholder="Add substring to ban"
                      className="mt-1"
                    />
                  )}
                />
              </div>
            </div>
          </div>

          {/* Ban Topics Section */}
          <div className="space-y-4">
            <h4 className="text-md font-medium text-gray-900 dark:text-gray-100">Ban Topics</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox {...register("banTopics")} />
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Enable Ban Topics</label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Threshold</label>
                <Input
                  type="range"
                  step="0.01"
                  min="0"
                  max="1"
                  {...register("banTopicsThreshold")}
                  className="mt-1 bg-gray-50 dark:bg-neutral-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-neutral-700"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Topics</label>
                <Controller
                  name="banTopicsTopics"
                  control={control}
                  render={({ field }) => (
                    <TagInput
                      value={typeof field.value === 'string' ? field.value.split(',').map(s => s.trim()).filter(Boolean) : (field.value || [])}
                      onChange={(value) => field.onChange(value.join(','))}
                      placeholder="Add topic to ban"
                      className="mt-1"
                    />
                  )}
                />
              </div>
            </div>
          </div>

          {/* Code Section */}
          <div className="space-y-4">
            <h4 className="text-md font-medium text-gray-900 dark:text-gray-100">Code Detection</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox {...register("code")} />
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Enable Code Detection</label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Languages</label>
                <Controller
                  name="codeLanguages"
                  control={control}
                  render={({ field }) => (
                    <TagInput
                      value={typeof field.value === 'string' ? field.value.split(',').map(s => s.trim()).filter(Boolean) : (field.value || [])}
                      onChange={(value) => field.onChange(value.join(','))}
                      placeholder="Add programming language"
                      className="mt-1"
                    />
                  )}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox {...register("codeIsBlocked")} />
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Is Blocked</label>
              </div>
            </div>
          </div>

          {/* Other Sections - continuing with remaining fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Gibberish */}
            <div className="space-y-2">
              <h5 className="text-sm font-medium text-gray-900 dark:text-gray-100">Gibberish</h5>
              <div className="flex items-center space-x-2">
                <Checkbox {...register("gibberish")} />
                <label className="text-xs text-gray-700 dark:text-gray-300">Enable</label>
              </div>
              <Input
                placeholder="Threshold"
                type="range"
                step="0.01"
                min="0"
                max="1"
                {...register("gibberishThreshold")}
                className="bg-gray-50 dark:bg-neutral-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-neutral-700"
              />
              <Input
                placeholder="Match Type"
                {...register("gibberishMatchType")}
                className="bg-gray-50 dark:bg-neutral-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-neutral-700"
              />
            </div>

            {/* Language */}
            <div className="space-y-2">
              <h5 className="text-sm font-medium text-gray-900 dark:text-gray-100">Language</h5>
              <div className="flex items-center space-x-2">
                <Checkbox {...register("language")} />
                <label className="text-xs text-gray-700 dark:text-gray-300">Enable</label>
              </div>
              <div>
                <label className="block text-xs text-gray-700 dark:text-gray-300 mb-1">Valid Languages</label>
                <Controller
                  name="languageValidLanguages"
                  control={control}
                  render={({ field }) => (
                    <TagInput
                      value={typeof field.value === 'string' ? field.value.split(',').map(s => s.trim()).filter(Boolean) : (field.value || [])}
                      onChange={(value) => field.onChange(value.join(','))}
                      placeholder="Add language code"
                      className=""
                    />
                  )}
                />
              </div>
              <Input
                placeholder="Match Type"
                {...register("languageMatchType")}
                className="bg-gray-50 dark:bg-neutral-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-neutral-700"
              />
            </div>

            {/* Prompt Injection */}
            <div className="space-y-2">
              <h5 className="text-sm font-medium text-gray-900 dark:text-gray-100">Prompt Injection</h5>
              <div className="flex items-center space-x-2">
                <Checkbox {...register("promptInjection")} />
                <label className="text-xs text-gray-700 dark:text-gray-300">Enable</label>
              </div>
              <Input
                placeholder="Threshold"
                type="range"
                step="0.01"
                min="0"
                max="1"
                {...register("promptInjectionThreshold")}
                className="bg-gray-50 dark:bg-neutral-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-neutral-700"
              />
              <Input
                placeholder="Match Type"
                {...register("promptInjectionMatchType")}
                className="bg-gray-50 dark:bg-neutral-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-neutral-700"
              />
            </div>

            {/* Regex */}
            <div className="space-y-2">
              <h5 className="text-sm font-medium text-gray-900 dark:text-gray-100">Regex</h5>
              <div className="flex items-center space-x-2">
                <Checkbox {...register("regex")} />
                <label className="text-xs text-gray-700 dark:text-gray-300">Enable</label>
              </div>
              <div>
                <label className="block text-xs text-gray-700 dark:text-gray-300 mb-1">Patterns</label>
                <Controller
                  name="regexPatterns"
                  control={control}
                  render={({ field }) => (
                    <TagInput
                      value={typeof field.value === 'string' ? field.value.split(',').map(s => s.trim()).filter(Boolean) : (field.value || [])}
                      onChange={(value) => field.onChange(value.join(','))}
                      placeholder="Add regex pattern"
                      className=""
                    />
                  )}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox {...register("regexIsBlocked")} />
                <label className="text-xs text-gray-700 dark:text-gray-300">Is Blocked</label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox {...register("regexRedact")} />
                <label className="text-xs text-gray-700 dark:text-gray-300">Redact</label>
              </div>
            </div>

            {/* Secrets */}
            <div className="space-y-2">
              <h5 className="text-sm font-medium text-gray-900 dark:text-gray-100">Secrets</h5>
              <div className="flex items-center space-x-2">
                <Checkbox {...register("secrets")} />
                <label className="text-xs text-gray-700 dark:text-gray-300">Enable</label>
              </div>
              <Input
                placeholder="Redact Mode"
                {...register("secretsRedactMode")}
                className="bg-gray-50 dark:bg-neutral-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-neutral-700"
              />
            </div>

            {/* Sentiment */}
            <div className="space-y-2">
              <h5 className="text-sm font-medium text-gray-900 dark:text-gray-100">Sentiment</h5>
              <div className="flex items-center space-x-2">
                <Checkbox {...register("sentiment")} />
                <label className="text-xs text-gray-700 dark:text-gray-300">Enable</label>
              </div>
              <Input
                placeholder="Threshold"
                type="range"
                step="0.01"
                min="0"
                max="1"
                {...register("sentimentThreshold")}
                className="bg-gray-50 dark:bg-neutral-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-neutral-700"
              />
              <Input
                placeholder="Match Type"
                {...register("sentimentMatchType")}
                className="bg-gray-50 dark:bg-neutral-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-neutral-700"
              />
            </div>

            {/* Token Limit */}
            <div className="space-y-2">
              <h5 className="text-sm font-medium text-gray-900 dark:text-gray-100">Token Limit</h5>
              <div className="flex items-center space-x-2">
                <Checkbox {...register("tokenLimit")} />
                <label className="text-xs text-gray-700 dark:text-gray-300">Enable</label>
              </div>
              <Input
                placeholder="Limit"
                type="number"
                {...register("tokenLimitLimit")}
                className="bg-gray-50 dark:bg-neutral-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-neutral-700"
              />
              <Input
                placeholder="Encoding Name"
                {...register("tokenLimitEncodingName")}
                className="bg-gray-50 dark:bg-neutral-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-neutral-700"
              />
            </div>

            {/* Toxicity */}
            <div className="space-y-2">
              <h5 className="text-sm font-medium text-gray-900 dark:text-gray-100">Toxicity</h5>
              <div className="flex items-center space-x-2">
                <Checkbox {...register("toxicity")} />
                <label className="text-xs text-gray-700 dark:text-gray-300">Enable</label>
              </div>
              <Input
                placeholder="Threshold"
                type="range"
                step="0.01"
                min="0"
                max="1"
                {...register("toxicityThreshold")}
                className="bg-gray-50 dark:bg-neutral-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-neutral-700"
              />
              <Input
                placeholder="Match Type"
                {...register("toxicityMatchType")}
                className="bg-gray-50 dark:bg-neutral-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-neutral-700"
              />
            </div>
          </div>
        </div>
      )}

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

    <DeleteConfirmDialog
      open={deleteDialogOpen}
      onOpenChange={setDeleteDialogOpen}
      onConfirm={handleDeleteCategoryConfirm}
      title="Delete Category"
      description="Are you sure you want to delete this category? This action cannot be undone."
    />
    </>
  );
}
