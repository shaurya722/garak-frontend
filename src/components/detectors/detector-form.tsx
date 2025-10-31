"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormItem,
  FormLabel,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDetectorTypes, useDetector, useCreateDetector, useUpdateDetector } from "@/hooks";
import { ROUTES, DEFAULT_CONFIDENCE_VALUE } from "@/constants";
import { LoadingSpinner } from "@/components/shared";

const detectorFormSchema = z.object({
  detectorName: z.string().min(2, "Detector name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  detectorType: z.string().min(1, "Please select a detector type"),
  confidence: z.string().refine(
    (val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num >= 0 && num <= 1;
    },
    { message: "Confidence must be between 0 and 1" }
  ),
  regex: z.array(z.string()).min(1, "At least one regex pattern is required"),
});

type DetectorFormValues = z.infer<typeof detectorFormSchema>;

interface DetectorFormProps {
  mode?: "create" | "edit";
  detectorId?: string;
  initialData?: Partial<DetectorFormValues>;
  onSuccess?: () => void;
}

export function DetectorForm({ mode = "create", detectorId, onSuccess }: DetectorFormProps) {
  const router = useRouter();
  const [regexInput, setRegexInput] = useState("");

  const isEditMode = mode === "edit";

  // Fetch detector types using hook
  const { data: detectorTypes = [] } = useDetectorTypes();

  // Fetch detector data in edit mode using hook
  const { data: existingDetector, isLoading: loadingDetector } = useDetector(detectorId || "");

  // Mutations
  const createMutation = useCreateDetector();
  const updateMutation = useUpdateDetector();

  const form = useForm<DetectorFormValues>({
    resolver: zodResolver(detectorFormSchema),
    defaultValues: {
      detectorName: "",
      description: "",
      detectorType: "",
      confidence: DEFAULT_CONFIDENCE_VALUE.toString(),
      regex: [],
    },
  });

  const { control, reset } = form;

  // Load existing detector data when in edit mode
  useEffect(() => {
    if (isEditMode && existingDetector) {
      reset({
        detectorName: existingDetector.detectorName || "",
        description: existingDetector.description || "",
        detectorType: existingDetector.detectorType || "",
        confidence: existingDetector.confidence?.toString() || DEFAULT_CONFIDENCE_VALUE.toString(),
        regex: existingDetector.regex || [],
      });
    }
  }, [isEditMode, existingDetector, reset]);

  const onSubmit: SubmitHandler<DetectorFormValues> = async (data) => {
    const payload = {
      detectorName: data.detectorName,
      description: data.description,
      detectorType: data.detectorType.toUpperCase(),
      confidence: parseFloat(data.confidence),
      regex: data.regex,
    };

    if (isEditMode && detectorId) {
      updateMutation.mutate(
        { id: detectorId, payload },
        {
          onSuccess: () => {
            onSuccess?.();
            router.push(ROUTES.DETECTORS);
          },
        }
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => {
          onSuccess?.();
          router.push(ROUTES.DETECTORS);
        },
      });
    }
  };

  const addRegex = () => {
    if (regexInput.trim()) {
      const current = form.getValues("regex");
      form.setValue("regex", [...current, regexInput.trim()]);
      setRegexInput("");
    }
  };

  const removeRegex = (index: number) => {
    const current = form.getValues("regex");
    form.setValue("regex", current.filter((_, i) => i !== index));
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Detector Name */}
        <Controller
          name="detectorName"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <FormItem>
              <FormLabel>Detector Name</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter detector name" />
              </FormControl>
              {error && <p className="text-sm text-destructive">{error.message}</p>}
            </FormItem>
          )}
        />

        {/* Description */}
        <Controller
          name="description"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="Enter detector description" />
              </FormControl>
              {error && <p className="text-sm text-destructive">{error.message}</p>}
            </FormItem>
          )}
        />

        {/* Detector Type */}
        <Controller
          name="detectorType"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <FormItem>
              <FormLabel>Detector Type</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a detector type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {detectorTypes.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {error && <p className="text-sm text-destructive">{error.message}</p>}
            </FormItem>
          )}
        />

        {/* Confidence */}
        <Controller
          name="confidence"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <FormItem>
              <FormLabel>Confidence Threshold</FormLabel>
              <FormControl>
                <Input type="number" step="0.1" min="0" max="1" {...field} />
              </FormControl>
              {error && <p className="text-sm text-destructive">{error.message}</p>}
            </FormItem>
          )}
        />

        {/* Regex Patterns */}
        <div>
          <FormLabel>Regular Expressions *</FormLabel>
          <div className="flex space-x-2 mb-2">
            <Input
              placeholder="Enter regex pattern"
              value={regexInput}
              onChange={(e) => setRegexInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addRegex();
                }
              }}
            />
            <Button type="button" variant="outline" onClick={addRegex}>
              Add
            </Button>
          </div>

          {form.watch("regex").map((pattern, index) => (
            <div key={index} className="flex justify-between bg-gray-100 dark:bg-gray-800 p-2 rounded">
              <code>{pattern}</code>
              <Button type="button" variant="ghost" size="sm" onClick={() => removeRegex(index)}>
                Remove
              </Button>
            </div>
          ))}
        </div>

        <div className="flex justify-end space-x-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => router.back()} 
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            {createMutation.isPending || updateMutation.isPending 
              ? "Saving..." 
              : isEditMode ? "Update Detector" : "Create Detector"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
