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
import { ChevronDown, ChevronRight, Eye, Edit, Trash2, X, EyeOff, Code, Users, Ban, AlertTriangle, Terminal, Zap, Globe, Target, Search, Lock, Heart, Hash, AlertCircle } from 'lucide-react';
import { PolicyFormProps, PolicyCreateData, PolicyUpdateData } from "@/types/policies.type";
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
  // BLUE policy specific fields - all scanners
  enabledScanners: z.array(z.string()).optional(),
  // Anonymize scanner
  anonymize: z.coerce.boolean().optional(),
  anonymizeType: z.array(z.string()).optional(),
  anonymizeHiddenNames: z.array(z.string()).optional(),
  anonymizeAllowedNames: z.array(z.string()).optional(),
  anonymizePreamble: z.string().nullable().optional().transform(val => val === null ? undefined : val),
  anonymizeUseFaker: z.coerce.boolean().optional(),
  anonymizeThreshold: z.coerce.number().min(0).max(1).optional(),
  // BanCode scanner
  banCode: z.coerce.boolean().optional(),
  banCodeThreshold: z.coerce.number().min(0).max(1).optional(),
  // BanCompetitors scanner
  banCompetitors: z.coerce.boolean().optional(),
  banCompetitorsThreshold: z.coerce.number().min(0).max(1).optional(),
  banCompetitorsCompetitors: z.array(z.string()).optional(),
  // BanSubstrings scanner
  banSubstrings: z.coerce.boolean().optional(),
  banSubstringsSubstrings: z.array(z.string()).optional(),
  banSubstringsMatchType: z.string().nullable().optional().transform(val => val === null ? undefined : val),
  banSubstringsCaseSensitive: z.coerce.boolean().optional(),
  banSubstringsRedact: z.coerce.boolean().optional(),
  banSubstringsContainsAll: z.coerce.boolean().optional(),
  // BanTopics scanner
  banTopics: z.coerce.boolean().optional(),
  banTopicsThreshold: z.coerce.number().min(0).max(1).optional(),
  banTopicsTopics: z.array(z.string()).optional(),
  // Code scanner
  code: z.coerce.boolean().optional(),
  codeLanguages: z.array(z.string()).optional(),
  codeIsBlocked: z.coerce.boolean().optional(),
  // Gibberish scanner
  gibberish: z.coerce.boolean().optional(),
  gibberishThreshold: z.coerce.number().min(0).max(1).optional(),
  gibberishMatchType: z.string().nullable().optional().transform(val => val === null ? undefined : val),
  // Language scanner
  language: z.coerce.boolean().optional(),
  languageValidLanguages: z.array(z.string()).optional(),
  languageMatchType: z.string().nullable().optional().transform(val => val === null ? undefined : val),
  // PromptInjection scanner
  promptInjection: z.coerce.boolean().optional(),
  promptInjectionThreshold: z.coerce.number().min(0).max(1).optional(),
  promptInjectionMatchType: z.string().nullable().optional().transform(val => val === null ? undefined : val),
  // Regex scanner
  regex: z.coerce.boolean().optional(),
  regexPatterns: z.array(z.string()).optional(),
  regexIsBlocked: z.coerce.boolean().optional(),
  regexRedact: z.coerce.boolean().optional(),
  // Secrets scanner
  secrets: z.coerce.boolean().optional(),
  secretsRedactMode: z.string().nullable().optional().transform(val => val === null ? undefined : val),
  // Sentiment scanner
  sentiment: z.coerce.boolean().optional(),
  sentimentThreshold: z.coerce.number().min(-1).max(1).optional(),
  sentimentMatchType: z.string().nullable().optional().transform(val => val === null ? undefined : val),
  // TokenLimit scanner
  tokenLimit: z.coerce.boolean().optional(),
  tokenLimitLimit: z.coerce.number().optional(),
  tokenLimitEncodingName: z.string().nullable().optional().transform(val => val === null ? undefined : val),
  // Toxicity scanner
  toxicity: z.coerce.boolean().optional(),
  toxicityThreshold: z.coerce.number().min(0).max(1).optional(),
  toxicityMatchType: z.string().nullable().optional().transform(val => val === null ? undefined : val),
}).superRefine((data, ctx) => {
  // Custom validation for BLUE policies
  if (data.type === "BLUE") {
    // Check if at least one scanner is enabled
    const enabledScannerFields = [
      data.anonymize, data.banCode, data.banCompetitors, data.banSubstrings,
      data.banTopics, data.code, data.gibberish, data.language,
      data.promptInjection, data.regex, data.secrets, data.sentiment,
      data.tokenLimit, data.toxicity
    ];

    const hasEnabledScanners = enabledScannerFields.some(field => field === true);

    if (!hasEnabledScanners) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "BLUE policies must have at least one scanner enabled",
        path: ["type"]
      });
    }
  }

  // Validation for RED policies
  if (data.type === "RED") {
    if (!data.categoryIds || data.categoryIds.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "RED policies must have at least one category selected",
        path: ["categoryIds"]
      });
    }
  }
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

  // Scanner selection state for BLUE policies
  const [enabledScanners, setEnabledScanners] = useState<string[]>(() => {
    if (isEditMode && initialData?.type === "BLUE") {
      // Initialize enabled scanners based on which ones are true in initialData
      const enabled: string[] = [];
      if (initialData.anonymize) enabled.push("Anonymize");
      if (initialData.banCode) enabled.push("BanCode");
      if (initialData.banCompetitors) enabled.push("BanCompetitors");
      if (initialData.banSubstrings) enabled.push("BanSubstrings");
      if (initialData.banTopics) enabled.push("BanTopics");
      if (initialData.code) enabled.push("Code");
      if (initialData.gibberish) enabled.push("Gibberish");
      if (initialData.language) enabled.push("Language");
      if (initialData.promptInjection) enabled.push("PromptInjection");
      if (initialData.regex) enabled.push("Regex");
      if (initialData.secrets) enabled.push("Secrets");
      if (initialData.sentiment) enabled.push("Sentiment");
      if (initialData.tokenLimit) enabled.push("TokenLimit");
      if (initialData.toxicity) enabled.push("Toxicity");
      return enabled;
    }
    // Default: all enabled for create mode
    return [
      "Anonymize",
      "BanCode",
      "BanCompetitors",
      "BanSubstrings",
      "BanTopics",
      "Code",
      "Gibberish",
      "Language",
      "PromptInjection",
      "Regex",
      "Secrets",
      "Sentiment",
      "TokenLimit",
      "Toxicity",
    ];
  });

  // Available scanners
  const availableScanners = [
    "Anonymize",
    "BanCode",
    "BanCompetitors",
    "BanSubstrings",
    "BanTopics",
    "Code",
    "Gibberish",
    "Language",
    "PromptInjection",
    "Regex",
    "Secrets",
    "Sentiment",
    "TokenLimit",
    "Toxicity",
  ];

  // Available programming languages for Code scanner
  const programmingLanguages = [
    "ARM Assembly",
    "AppleScript",
    "C",
    "C#",
    "C++",
    "COBOL",
    "Erlang",
    "Fortran",
    "Go",
    "Java",
    "JavaScript",
    "Kotlin",
    "Lua",
    "Mathematica/Wolfram Language",
    "PHP",
    "Pascal",
    "Perl",
    "PowerShell",
    "R",
    "Ruby",
    "Scala",
    "Swift",
    "Visual Basic.NET",
    "jq",
  ];

  // Available language codes for Language scanner
  const languageCodes = [
    "ar",
    "bg",
    "de",
    "el",
    "en",
    "es",
    "fr",
    "hi",
    "it",
    "ja",
    "nl",
    "pl",
    "pt",
    "ru",
    "sw",
    "th",
    "tr",
    "ur",
    "vi",
    "zh",
  ];

  const form = useForm<PolicyFormValues>({
    resolver: zodResolver(policyFormSchema as any), // eslint-disable-line @typescript-eslint/no-explicit-any
    defaultValues: {
      name: "",
      description: "",
      type: "RED",
      defaultDetector: false,
      categoryIds: null,
      detectorIds: null,
      // BLUE policy specific fields - all scanners
      anonymizeType: ["CREDIT_CARD", "CRYPTO","EMAIL_ADDRESS","IBAN_CODE","IP_ADDRESS","PERSON","PHONE_NUMBER","US_SSN","US_BANK_NUMBER","CREDIT_CARD_RE","UUID","EMAIL_ADDRESS_RE","US_SSN_RE"],
      anonymizeHiddenNames: [],
      anonymizeAllowedNames: [],
      banCompetitorsCompetitors: ["openai", "anthropic"],
      banSubstringsSubstrings: [],
      banTopicsTopics: ["Religion", "politics"],
      codeLanguages: [],
      languageValidLanguages: [],
      regexPatterns: [],
      ...Object.fromEntries(
        Object.entries(initialData || {}).map(([key, value]) => [
          key,
          value === null ? undefined : value
        ])
      ),
      // Convert arrays to comma-separated strings for BLUE fields
      ...(initialData?.type === "BLUE" && {
        anonymizeHiddenNames: initialData.anonymizeHiddenNames,
        anonymizeAllowedNames: initialData.anonymizeAllowedNames,
        banCompetitorsCompetitors: initialData.banCompetitorsCompetitors,
        banSubstringsSubstrings: initialData.banSubstringsSubstrings,
        banTopicsTopics: initialData.banTopicsTopics,
        codeLanguages: initialData.codeLanguages,
        languageValidLanguages: initialData.languageValidLanguages,
        regexPatterns: initialData.regexPatterns,
      }),
    } as Partial<PolicyFormValues>,
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
    // Transform null values to undefined before processing
    const cleanedData = Object.fromEntries(
      Object.entries(data).map(([key, value]) => [
        key,
        value === null ? undefined : value
      ])
    ) as PolicyFormValues;

    const { enabledScanners: enabledScannersField, ...dataWithoutEnabledScanners } = cleanedData;
    console.log('Form submitted with data:', data);
    console.log('Enabled scanners state:', enabledScanners);
    const baseData = {
      ...(Object.fromEntries(
        Object.entries(dataWithoutEnabledScanners).filter(([key, value]) => {
          // Filter out empty arrays for required array fields
          if (key === 'anonymizeType' && Array.isArray(value) && value.length === 0) {
            return false;
          }
          return true;
        })
      ) as Partial<PolicyFormValues>),
      defaultDetector: cleanedData.defaultDetector ?? false,
    };

    // Add BLUE-specific fields
    const blueData = cleanedData.type === "BLUE" ? {
      // Only include basic fields for BLUE policies
      name: baseData.name,
      description: baseData.description,
      type: baseData.type,
      defaultDetector: false,
      categoryIds: null,
      detectorIds: null,
      // Include boolean flags
      ...(baseData.anonymize !== undefined && { anonymize: baseData.anonymize }),
      ...(baseData.banCode !== undefined && { banCode: baseData.banCode }),
      ...(baseData.banCompetitors !== undefined && { banCompetitors: baseData.banCompetitors }),
      ...(baseData.banSubstrings !== undefined && { banSubstrings: baseData.banSubstrings }),
      ...(baseData.banTopics !== undefined && { banTopics: baseData.banTopics }),
      ...(baseData.code !== undefined && { code: baseData.code }),
      ...(baseData.gibberish !== undefined && { gibberish: baseData.gibberish }),
      ...(baseData.language !== undefined && { language: baseData.language }),
      ...(baseData.promptInjection !== undefined && { promptInjection: baseData.promptInjection }),
      ...(baseData.regex !== undefined && { regex: baseData.regex }),
      ...(baseData.secrets !== undefined && { secrets: baseData.secrets }),
      ...(baseData.sentiment !== undefined && { sentiment: baseData.sentiment }),
      ...(baseData.tokenLimit !== undefined && { tokenLimit: baseData.tokenLimit }),
      ...(baseData.toxicity !== undefined && { toxicity: baseData.toxicity }),
      // Convert string fields to arrays for BLUE policies, only include if not empty
      ...(Array.isArray(cleanedData.anonymizeHiddenNames) && cleanedData.anonymizeHiddenNames.length > 0 && {
        anonymizeHiddenNames: cleanedData.anonymizeHiddenNames
      }),
      ...(Array.isArray(cleanedData.anonymizeAllowedNames) && cleanedData.anonymizeAllowedNames.length > 0 && {
        anonymizeAllowedNames: cleanedData.anonymizeAllowedNames
      }),
      ...(cleanedData.anonymizePreamble && cleanedData.anonymizePreamble.trim() && {
        anonymizePreamble: cleanedData.anonymizePreamble.trim()
      }),
      // Only include anonymizeType if it has at least one item
      ...(Array.isArray(cleanedData.anonymizeType) && cleanedData.anonymizeType.length > 0 && {
        anonymizeType: cleanedData.anonymizeType
      }),
      ...(Array.isArray(cleanedData.banCompetitorsCompetitors) && cleanedData.banCompetitorsCompetitors.length > 0 && {
        banCompetitorsCompetitors: cleanedData.banCompetitorsCompetitors
      }),
      ...(Array.isArray(cleanedData.banSubstringsSubstrings) && cleanedData.banSubstringsSubstrings.length > 0 && {
        banSubstringsSubstrings: cleanedData.banSubstringsSubstrings
      }),
      ...(Array.isArray(cleanedData.banTopicsTopics) && cleanedData.banTopicsTopics.length > 0 && {
        banTopicsTopics: cleanedData.banTopicsTopics
      }),
      ...(Array.isArray(cleanedData.codeLanguages) && cleanedData.codeLanguages.length > 0 && {
        codeLanguages: cleanedData.codeLanguages
      }),
      ...(Array.isArray(cleanedData.languageValidLanguages) && cleanedData.languageValidLanguages.length > 0 && {
        languageValidLanguages: cleanedData.languageValidLanguages
      }),
      ...(Array.isArray(cleanedData.regexPatterns) && cleanedData.regexPatterns.length > 0 && {
        regexPatterns: cleanedData.regexPatterns
      }),
      // Set defaults for required fields
      sentimentMatchType: (cleanedData.sentimentMatchType && cleanedData.sentimentMatchType.trim()) || 'sentiment',
      tokenLimitLimit: cleanedData.tokenLimitLimit || 4096,
      // Include other fields that are not strings
      ...(baseData.anonymizeType && { anonymizeType: baseData.anonymizeType }),
      ...(baseData.anonymizeUseFaker !== undefined && { anonymizeUseFaker: baseData.anonymizeUseFaker }),
      ...(baseData.anonymizeThreshold !== undefined && { anonymizeThreshold: baseData.anonymizeThreshold }),
      ...(baseData.banCodeThreshold !== undefined && { banCodeThreshold: baseData.banCodeThreshold }),
      ...(baseData.banCompetitorsThreshold !== undefined && { banCompetitorsThreshold: baseData.banCompetitorsThreshold }),
      ...(baseData.banSubstringsMatchType !== undefined && baseData.banSubstringsMatchType !== null && baseData.banSubstringsMatchType.trim() && { banSubstringsMatchType: baseData.banSubstringsMatchType }),
      ...(baseData.banSubstringsCaseSensitive !== undefined && { banSubstringsCaseSensitive: baseData.banSubstringsCaseSensitive }),
      ...(baseData.banSubstringsRedact !== undefined && { banSubstringsRedact: baseData.banSubstringsRedact }),
      ...(baseData.banSubstringsContainsAll !== undefined && { banSubstringsContainsAll: baseData.banSubstringsContainsAll }),
      ...(baseData.banTopicsThreshold !== undefined && { banTopicsThreshold: baseData.banTopicsThreshold }),
      ...(baseData.codeIsBlocked !== undefined && { codeIsBlocked: baseData.codeIsBlocked }),
      ...(baseData.gibberishThreshold !== undefined && { gibberishThreshold: baseData.gibberishThreshold }),
      ...(baseData.gibberishMatchType !== undefined && baseData.gibberishMatchType !== null && baseData.gibberishMatchType.trim() && { gibberishMatchType: baseData.gibberishMatchType }),
      ...(baseData.languageMatchType !== undefined && baseData.languageMatchType !== null && baseData.languageMatchType.trim() && { languageMatchType: baseData.languageMatchType }),
      ...(baseData.promptInjectionThreshold !== undefined && { promptInjectionThreshold: baseData.promptInjectionThreshold }),
      ...(baseData.promptInjectionMatchType !== undefined && baseData.promptInjectionMatchType !== null && baseData.promptInjectionMatchType.trim() && { promptInjectionMatchType: baseData.promptInjectionMatchType }),
      ...(baseData.regexIsBlocked !== undefined && { regexIsBlocked: baseData.regexIsBlocked }),
      ...(baseData.regexRedact !== undefined && { regexRedact: baseData.regexRedact }),
      ...(baseData.secretsRedactMode !== undefined && baseData.secretsRedactMode !== null && baseData.secretsRedactMode.trim() && { secretsRedactMode: baseData.secretsRedactMode }),
      ...(baseData.sentimentThreshold !== undefined && { sentimentThreshold: baseData.sentimentThreshold }),
      ...(baseData.sentimentMatchType !== undefined && baseData.sentimentMatchType !== null && baseData.sentimentMatchType.trim() && { sentimentMatchType: baseData.sentimentMatchType }),
      ...(baseData.tokenLimitEncodingName !== undefined && baseData.tokenLimitEncodingName !== null && baseData.tokenLimitEncodingName.trim() && { tokenLimitEncodingName: baseData.tokenLimitEncodingName }),
      ...(baseData.toxicityThreshold !== undefined && { toxicityThreshold: baseData.toxicityThreshold }),
      ...(baseData.toxicityMatchType !== undefined && baseData.toxicityMatchType !== null && baseData.toxicityMatchType.trim() && { toxicityMatchType: baseData.toxicityMatchType }),
    } : baseData;

    const processedData = blueData;

    // Remove type from update payload
    const { type, ...updateData } = processedData;

    if (isEditMode && policyId) {
      updateMutation(
        { id: policyId, ...updateData } as { id: string } & PolicyUpdateData,
        { onSuccess: () => {
          router.push(`/policies`);
          onSuccess?.();
        } }
      );
    } else {
      createMutation(processedData as PolicyCreateData, { onSuccess: () => {
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
        , (errors) => {
          console.log('Validation errors:', errors);
        })}
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
              Configure LLM Guard scanners for BLUE policies
            </p>
          </div>

          {/* Scanner Selection */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Scanners
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {availableScanners.map((scanner) => {
                  // Map scanner names to form field names
                  const fieldName = {
                    "Anonymize": "anonymize",
                    "BanCode": "banCode",
                    "BanCompetitors": "banCompetitors",
                    "BanSubstrings": "banSubstrings",
                    "BanTopics": "banTopics",
                    "Code": "code",
                    "Gibberish": "gibberish",
                    "Language": "language",
                    "PromptInjection": "promptInjection",
                    "Regex": "regex",
                    "Secrets": "secrets",
                    "Sentiment": "sentiment",
                    "TokenLimit": "tokenLimit",
                    "Toxicity": "toxicity",
                  }[scanner];

                  return (
                    <div key={scanner} className="flex items-center space-x-2">
                      <Checkbox
                        id={`scanner-${scanner}`}
                        checked={enabledScanners.includes(scanner)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setEnabledScanners([...enabledScanners, scanner]);
                            setValue(fieldName as keyof typeof policyFormSchema.shape, true);
                          } else {
                            setEnabledScanners(enabledScanners.filter(s => s !== scanner));
                            setValue(fieldName as keyof typeof policyFormSchema.shape, false);
                          }
                        }}
                      />
                      <label
                        htmlFor={`scanner-${scanner}`}
                        className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer"
                      >
                        {scanner}
                      </label>
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                {enabledScanners.length} scanner{enabledScanners.length !== 1 ? 's' : ''} selected
              </p>
            </div>
          </div>

          {/* Scanner Configurations */}
          <div className="space-y-4">
            {enabledScanners.includes("Anonymize") && (
              <details className="border border-gray-200 dark:border-neutral-700 rounded-lg">
                <summary className="cursor-pointer p-4 bg-gray-50 dark:bg-neutral-800 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors flex items-center gap-3">
                  <EyeOff className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <h4 className="text-md font-medium text-gray-900 dark:text-gray-100">Anonymize</h4>
                  <ChevronDown className="w-4 h-4 ml-auto text-gray-500 dark:text-gray-400 details-open:rotate-180 transition-transform" />
                </summary>
                <div className="p-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox {...register("anonymize")} />
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Enable Anonymize</label>
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
                            value={field.value || []}
                            onChange={field.onChange}
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
                            value={field.value || []}
                            onChange={field.onChange}
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
                      <div className="flex items-center justify-between">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Threshold</label>
                        <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-neutral-700 px-2 py-1 rounded">
                          {watch("anonymizeThreshold") || "0.5"}
                        </span>
                      </div>
                      <div className="relative mt-1">
                        <Input
                          type="range"
                          step="0.01"
                          min="0"
                          max="1"
                          defaultValue="0.5"
                          {...register("anonymizeThreshold")}
                          className="mt-1 bg-gray-50 dark:bg-neutral-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-neutral-700"
                          title={`Current value: ${watch("anonymizeThreshold") || "0.5"}`}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </details>
            )}

            {/* Ban Code Scanner */}
            {enabledScanners.includes("BanCode") && (
              <details className="border border-gray-200 dark:border-neutral-700 rounded-lg">
                <summary className="cursor-pointer p-4 bg-gray-50 dark:bg-neutral-800 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors flex items-center gap-3">
                  <Code className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <h4 className="text-md font-medium text-gray-900 dark:text-gray-100">Ban Code</h4>
                  <ChevronDown className="w-4 h-4 ml-auto text-gray-500 dark:text-gray-400 details-open:rotate-180 transition-transform" />
                </summary>
                <div className="p-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox {...register("banCode")} />
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Enable Ban Code</label>
                    </div>
                    <div>
                      <div className="flex items-center justify-between">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Threshold</label>
                        <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-neutral-700 px-2 py-1 rounded">
                          {watch("banCodeThreshold") || "0.5"}
                        </span>
                      </div>
                      <div className="relative mt-1">
                        <Input
                          type="range"
                          step="0.01"
                          min="0"
                          max="1"
                          {...register("banCodeThreshold")}
                          className="mt-1 bg-gray-50 dark:bg-neutral-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-neutral-700"
                          title={`Current value: ${watch("banCodeThreshold") || "0.5"}`}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </details>
            )}

            {/* Ban Competitors Scanner */}
            {enabledScanners.includes("BanCompetitors") && (
              <details className="border border-gray-200 dark:border-neutral-700 rounded-lg">
                <summary className="cursor-pointer p-4 bg-gray-50 rounded-lg dark:bg-neutral-800 hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors flex items-center gap-3">
                  <Users className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  <h4 className="text-md font-medium text-gray-900 dark:text-gray-100">Ban Competitors</h4>
                  <ChevronDown className="w-4 h-4 ml-auto text-gray-500 dark:text-gray-400 details-open:rotate-180 transition-transform" />
                </summary>
                <div className="p-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox {...register("banCompetitors")} />
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Enable Ban Competitors</label>
                    </div>
                    <div>
                      <div className="flex items-center justify-between">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Threshold</label>
                        <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-neutral-700 px-2 py-1 rounded">
                          {watch("banCompetitorsThreshold") || "0.5"}
                        </span>
                      </div>
                      <div className="relative mt-1">
                        <Input
                          type="range"
                          step="0.01"
                          min="0"
                          max="1"
                          {...register("banCompetitorsThreshold")}
                          className="mt-1 bg-gray-50 dark:bg-neutral-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-neutral-700"
                          title={`Current value: ${watch("banCompetitorsThreshold") || "0.5"}`}
                        />
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Competitors</label>
                      <Controller
                        name="banCompetitorsCompetitors"
                        control={control}
                        render={({ field }) => (
                          <TagInput
                            value={field.value || []}
                            onChange={field.onChange}
                            placeholder="Add competitor name"
                            className="mt-1"
                          />
                        )}
                      />
                    </div>
                  </div>
                </div>
              </details>
            )}

            {/* Ban Substrings Scanner */}
            {enabledScanners.includes("BanSubstrings") && (
              <details className="border border-gray-200 dark:border-neutral-700 rounded-lg">
                <summary className="cursor-pointer p-4 bg-gray-50 rounded-lg dark:bg-neutral-800 hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors flex items-center gap-3">
                  <Ban className="w-5 h-5 text-red-600 dark:text-red-400" />
                  <h4 className="text-md font-medium text-gray-900 dark:text-gray-100">Ban Substrings</h4>
                  <ChevronDown className="w-4 h-4 ml-auto text-gray-500 dark:text-gray-400 details-open:rotate-180 transition-transform" />
                </summary>
                <div className="p-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox {...register("banSubstrings")} />
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Enable Ban Substrings</label>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Match Type</label>
                      <Controller
                        name="banSubstringsMatchType"
                        control={control}
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} value={field.value === null ? undefined : field.value}>
                            <SelectTrigger className="mt-1 bg-gray-50 dark:bg-neutral-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-neutral-700">
                              <SelectValue placeholder="Select match type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="str">str</SelectItem>
                              <SelectItem value="word">word</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
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
                            value={field.value || []}
                            onChange={field.onChange}
                            placeholder="Add substring to ban"
                            className="mt-1"
                          />
                        )}
                      />
                    </div>
                  </div>
                </div>
              </details>
            )}

            {/* Ban Topics Scanner */}
            {enabledScanners.includes("BanTopics") && (
              <details className="border border-gray-200 dark:border-neutral-700 rounded-lg">
                <summary className="cursor-pointer p-4 rounded-lg bg-gray-50 dark:bg-neutral-800 hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                  <h4 className="text-md font-medium text-gray-900 dark:text-gray-100">Ban Topics</h4>
                  <ChevronDown className="w-4 h-4 ml-auto text-gray-500 dark:text-gray-400 details-open:rotate-180 transition-transform" />
                </summary>
                <div className="p-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox {...register("banTopics")} />
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Enable Ban Topics</label>
                    </div>
                    <div>
                      <div className="flex items-center justify-between">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Threshold</label>
                        <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-neutral-700 px-2 py-1 rounded">
                          {watch("banTopicsThreshold") || "0.5"}
                        </span>
                      </div>
                      <div className="relative mt-1">
                        <Input
                          type="range"
                          step="0.01"
                          min="0"
                          max="1"
                          {...register("banTopicsThreshold")}
                          className="mt-1 bg-gray-50 dark:bg-neutral-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-neutral-700"
                          title={`Current value: ${watch("banTopicsThreshold") || "0.5"}`}
                        />
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Topics</label>
                      <Controller
                        name="banTopicsTopics"
                        control={control}
                        render={({ field }) => (
                          <TagInput
                            value={field.value || []}
                            onChange={field.onChange}
                            placeholder="Add topic to ban"
                            className="mt-1"
                          />
                        )}
                      />
                    </div>
                  </div>
                </div>
              </details>
            )}

            {/* Code Scanner */}
            {enabledScanners.includes("Code") && (
              <details className="border border-gray-200 dark:border-neutral-700 rounded-lg">
                <summary className="cursor-pointer p-4  bg-gray-50 dark:bg-neutral-800 hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors rounded-lg flex items-center gap-3">
                  <Terminal className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <h4 className="text-md font-medium text-gray-900 dark:text-gray-100">Code Detection</h4>
                  <ChevronDown className="w-4 h-4 ml-auto text-gray-500 dark:text-gray-400 details-open:rotate-180 transition-transform" />
                </summary>
                <div className="p-4 space-y-4">
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
                        render={({ field }) => {
                          const selectedLanguages = field.value || [];
                          
                          return (
                            <div className="mt-1">
                              <Select 
                                onValueChange={(value) => {
                                  if (!selectedLanguages.includes(value)) {
                                    field.onChange([...selectedLanguages, value]);
                                  }
                                }}
                              >
                                <SelectTrigger className="bg-gray-50 dark:bg-neutral-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-neutral-700">
                                  <SelectValue placeholder="Select programming languages" />
                                </SelectTrigger>
                                <SelectContent>
                                  {programmingLanguages.map((lang) => (
                                    <SelectItem 
                                      key={lang} 
                                      value={lang}
                                      disabled={selectedLanguages.includes(lang)}
                                    >
                                      {lang}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              
                              {/* Selected languages as tags */}
                              {selectedLanguages.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                  {selectedLanguages.map((lang) => (
                                    <div
                                      key={lang}
                                      className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-md"
                                    >
                                      {lang}
                                      <button
                                        type="button"
                                        onClick={() => {
                                          field.onChange(selectedLanguages.filter(l => l !== lang));
                                        }}
                                        className="ml-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-100"
                                      >
                                        <X size={12} />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        }}
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox {...register("codeIsBlocked")} />
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Is Blocked</label>
                    </div>
                  </div>
                </div>
              </details>
            )}

            {/* Gibberish Scanner */}
            {enabledScanners.includes("Gibberish") && (
              <details className="border border-gray-200 dark:border-neutral-700 rounded-lg">
                <summary className="cursor-pointer rounded-lg p-4 bg-gray-50 dark:bg-neutral-800 hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors flex items-center gap-3">
                  <Zap className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                  <h4 className="text-md font-medium text-gray-900 dark:text-gray-100">Gibberish</h4>
                  <ChevronDown className="w-4 h-4 ml-auto text-gray-500 dark:text-gray-400 details-open:rotate-180 transition-transform" />
                </summary>
                <div className="p-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox {...register("gibberish")} />
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Enable Gibberish</label>
                    </div>
                    <div>
                      <div className="flex items-center justify-between">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Threshold</label>
                        <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-neutral-700 px-2 py-1 rounded">
                          {watch("gibberishThreshold") || "0.5"}
                        </span>
                      </div>
                      <div className="relative mt-1">
                        <Input
                          type="range"
                          step="0.01"
                          min="0"
                          max="1"
                          {...register("gibberishThreshold")}
                          className="mt-1 bg-gray-50 dark:bg-neutral-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-neutral-700"
                          title={`Current value: ${watch("gibberishThreshold") || "0.5"}`}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Match Type</label>
                      <Controller
                        name="gibberishMatchType"
                        control={control}
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} value={field.value === null ? undefined : field.value}>
                            <SelectTrigger className="mt-1 bg-gray-50 dark:bg-neutral-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-neutral-700">
                              <SelectValue placeholder="Select match type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="full">full</SelectItem>
                              <SelectItem value="sentence">sentence</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                  </div>
                </div>
              </details>
            )}

            {/* Language Scanner */}
            {enabledScanners.includes("Language") && (
              <details className="border border-gray-200 dark:border-neutral-700 rounded-lg">
                <summary className="cursor-pointer rounded-lg p-4 bg-gray-50 dark:bg-neutral-800 hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors flex items-center gap-3">
                  <Globe className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                  <h4 className="text-md font-medium text-gray-900 dark:text-gray-100">Language</h4>
                  <ChevronDown className="w-4 h-4 ml-auto text-gray-500 dark:text-gray-400 details-open:rotate-180 transition-transform" />
                </summary>
                <div className="p-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox {...register("language")} />
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Enable Language</label>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Valid Languages</label>
                      <Controller
                        name="languageValidLanguages"
                        control={control}
                        render={({ field }) => {
                          const selectedLanguages = field.value || [];
                          
                          return (
                            <div className="mt-1">
                              <Select 
                                onValueChange={(value) => {
                                  if (!selectedLanguages.includes(value)) {
                                    field.onChange([...selectedLanguages, value]);
                                  }
                                }}
                              >
                                <SelectTrigger className="bg-gray-50 dark:bg-neutral-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-neutral-700">
                                  <SelectValue placeholder="Select language codes" />
                                </SelectTrigger>
                                <SelectContent>
                                  {languageCodes.map((lang) => (
                                    <SelectItem 
                                      key={lang} 
                                      value={lang}
                                      disabled={selectedLanguages.includes(lang)}
                                    >
                                      {lang}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              
                              {/* Selected languages as tags */}
                              {selectedLanguages.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                  {selectedLanguages.map((lang) => (
                                    <div
                                      key={lang}
                                      className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-md"
                                    >
                                      {lang}
                                      <button
                                        type="button"
                                        onClick={() => {
                                          field.onChange(selectedLanguages.filter(l => l !== lang));
                                        }}
                                        className="ml-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-100"
                                      >
                                        <X size={12} />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Match Type</label>
                      <Controller
                        name="languageMatchType"
                        control={control}
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} value={field.value === null ? undefined : field.value}>
                            <SelectTrigger className="mt-1 bg-gray-50 dark:bg-neutral-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-neutral-700">
                              <SelectValue placeholder="Select match type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="full">full</SelectItem>
                              <SelectItem value="sentence">sentence</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                  </div>
                </div>
              </details>
            )}

            {/* Prompt Injection Scanner */}
            {enabledScanners.includes("PromptInjection") && (
              <details className="border border-gray-200 dark:border-neutral-700 rounded-lg">
                <summary className="cursor-pointer rounded-lg p-4 bg-gray-50 dark:bg-neutral-800 hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors flex items-center gap-3">
                  <Target className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <h4 className="text-md font-medium text-gray-900 dark:text-gray-100">Prompt Injection</h4>
                  <ChevronDown className="w-4 h-4 ml-auto text-gray-500 dark:text-gray-400 details-open:rotate-180 transition-transform" />
                </summary>
                <div className="p-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox {...register("promptInjection")} />
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Enable Prompt Injection</label>
                    </div>
                    <div>
                      <div className="flex items-center justify-between">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Threshold</label>
                        <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-neutral-700 px-2 py-1 rounded">
                          {watch("promptInjectionThreshold") || "0.5"}
                        </span>
                      </div>
                      <div className="relative mt-1">
                        <Input
                          type="range"
                          step="0.01"
                          min="0"
                          max="1"
                          {...register("promptInjectionThreshold")}
                          className="mt-1 bg-gray-50 dark:bg-neutral-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-neutral-700"
                          title={`Current value: ${watch("promptInjectionThreshold") || "0.5"}`}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Match Type</label>
                      <Controller
                        name="promptInjectionMatchType"
                        control={control}
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} value={field.value === null ? undefined : field.value}>
                            <SelectTrigger className="mt-1 bg-gray-50 dark:bg-neutral-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-neutral-700">
                              <SelectValue placeholder="Select match type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="full">full</SelectItem>
                              <SelectItem value="sentence">sentence</SelectItem>
                              <SelectItem value="truncate_token_head_tail">truncate_token_head_tail</SelectItem>
                              <SelectItem value="truncate_head_tail">truncate_head_tail</SelectItem>
                              <SelectItem value="chunks">chunks</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                  </div>
                </div>
              </details>
            )}

            {/* Regex Scanner */}
            {enabledScanners.includes("Regex") && (
              <details className="border border-gray-200 dark:border-neutral-700 rounded-lg">
                <summary className="cursor-pointer rounded-lg p-4 bg-gray-50 dark:bg-neutral-800 hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors flex items-center gap-3">
                  <Search className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                  <h4 className="text-md font-medium text-gray-900 dark:text-gray-100">Regex</h4>
                  <ChevronDown className="w-4 h-4 ml-auto text-gray-500 dark:text-gray-400 details-open:rotate-180 transition-transform" />
                </summary>
                <div className="p-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox {...register("regex")} />
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Enable Regex</label>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Patterns</label>
                      <Controller
                        name="regexPatterns"
                        control={control}
                        render={({ field }) => (
                          <TagInput
                            value={field.value || []}
                            onChange={field.onChange}
                            placeholder="Add regex pattern"
                            className="mt-1"
                          />
                        )}
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox {...register("regexIsBlocked")} />
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Is Blocked</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox {...register("regexRedact")} />
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Redact</label>
                    </div>
                  </div>
                </div>
              </details>
            )}

            {/* Secrets Scanner */}
            {enabledScanners.includes("Secrets") && (
              <details className="border border-gray-200 dark:border-neutral-700 rounded-lg">
                <summary className="cursor-pointer rounded-lg p-4 bg-gray-50 dark:bg-neutral-800 hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors flex items-center gap-3">
                  <Lock className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <h4 className="text-md font-medium text-gray-900 dark:text-gray-100">Secrets</h4>
                  <ChevronDown className="w-4 h-4 ml-auto text-gray-500 dark:text-gray-400 details-open:rotate-180 transition-transform" />
                </summary>
                <div className="p-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox {...register("secrets")} />
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Enable Secrets</label>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Redact Mode</label>
                      <Controller
                        name="secretsRedactMode"
                        control={control}
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} value={field.value === null ? undefined : field.value}>
                            <SelectTrigger className="mt-1 bg-gray-50 dark:bg-neutral-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-neutral-700">
                              <SelectValue placeholder="Select redact mode" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All</SelectItem>
                              <SelectItem value="partial">Partial</SelectItem>
                              <SelectItem value="hash">Hash</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                  </div>
                </div>
              </details>
            )}

            {/* Sentiment Scanner */}
            {enabledScanners.includes("Sentiment") && (
              <details className="border border-gray-200 dark:border-neutral-700 rounded-lg">
                <summary className="cursor-pointer rounded-lg p-4 bg-gray-50 dark:bg-neutral-800 hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors flex items-center gap-3">
                  <Heart className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                  <h4 className="text-md font-medium text-gray-900 dark:text-gray-100">Sentiment</h4>
                  <ChevronDown className="w-4 h-4 ml-auto text-gray-500 dark:text-gray-400 details-open:rotate-180 transition-transform" />
                </summary>
                <div className="p-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox {...register("sentiment")} />
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Enable Sentiment</label>
                    </div>
                    <div>
                      <div className="flex items-center justify-between">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Threshold</label>
                        <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-neutral-700 px-2 py-1 rounded">
                          {watch("sentimentThreshold") || "0.0"}
                        </span>
                      </div>
                      <div className="relative mt-1">
                        <Input
                          type="range"
                          step="0.01"
                          min="-1"
                          max="1"
                          {...register("sentimentThreshold")}
                          className="mt-1 bg-gray-50 dark:bg-neutral-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-neutral-700"
                          title={`Current value: ${watch("sentimentThreshold") || "0.0"}`}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Match Type</label>
                      <Input
                        placeholder="e.g., sentiment"
                        {...register("sentimentMatchType")}
                        className="mt-1 bg-gray-50 dark:bg-neutral-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-neutral-700"
                      />
                    </div>
                  </div>
                </div>
              </details>
            )}

            {/* TokenLimit Scanner */}
            {enabledScanners.includes("TokenLimit") && (
              <details className="border border-gray-200 dark:border-neutral-700 rounded-lg">
                <summary className="cursor-pointer rounded-lg p-4 bg-gray-50 dark:bg-neutral-800 hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors flex items-center gap-3">
                  <Hash className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  <h4 className="text-md font-medium text-gray-900 dark:text-gray-100">Token Limit</h4>
                  <ChevronDown className="w-4 h-4 ml-auto text-gray-500 dark:text-gray-400 details-open:rotate-180 transition-transform" />
                </summary>
                <div className="p-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox {...register("tokenLimit")} />
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Enable Token Limit</label>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Limit</label>
                      <Input
                        type="number"
                        placeholder="4096"
                        {...register("tokenLimitLimit")}
                        className="mt-1 bg-gray-50 dark:bg-neutral-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-neutral-700"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Encoding Name</label>
                      <Controller
                        name="tokenLimitEncodingName"
                        control={control}
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} value={field.value === null ? undefined : field.value}>
                            <SelectTrigger className="mt-1 bg-gray-50 dark:bg-neutral-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-neutral-700">
                              <SelectValue placeholder="Select encoding" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="cl100k_base">cl100k_base</SelectItem>
                              <SelectItem value="p50k_base">p50k_base</SelectItem>
                              <SelectItem value="r50k_base">r50k_base</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                  </div>
                </div>
              </details>
            )}

            {/* Toxicity Scanner */}
            {enabledScanners.includes("Toxicity") && (
              <details className="border border-gray-200 dark:border-neutral-700 rounded-lg">
                <summary className="cursor-pointer rounded-lg p-4 bg-gray-50 dark:bg-neutral-800 hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                  <h4 className="text-md font-medium text-gray-900 dark:text-gray-100">Toxicity</h4>
                  <ChevronDown className="w-4 h-4 ml-auto text-gray-500 dark:text-gray-400 details-open:rotate-180 transition-transform" />
                </summary>
                <div className="p-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox {...register("toxicity")} />
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Enable Toxicity</label>
                    </div>
                    <div>
                      <div className="flex items-center justify-between">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Threshold</label>
                        <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-neutral-700 px-2 py-1 rounded">
                          {watch("toxicityThreshold") || "0.5"}
                        </span>
                      </div>
                      <div className="relative mt-1">
                        <Input
                          type="range"
                          step="0.01"
                          min="0"
                          max="1"
                          defaultValue="0.5"
                          {...register("toxicityThreshold")}
                          className="mt-1 bg-gray-50 dark:bg-neutral-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-neutral-700"
                          title={`Current value: ${watch("toxicityThreshold") || "0.5"}`}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </details>
            )}
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
