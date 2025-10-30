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
import { toast } from "sonner";
import api from "@/api/axios";
import { apiConfig } from "@/config/api";

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
  const [detectorTypes, setDetectorTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [regexInput, setRegexInput] = useState("");

  const isEditMode = mode === "edit";

  const form = useForm<DetectorFormValues>({
    resolver: zodResolver(detectorFormSchema),
    defaultValues: {
      detectorName: "",
      description: "",
      detectorType: "",
      confidence: "0.7",
      regex: [],
    },
  });

  const { control, reset } = form;

  // Fetch detector types
  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const res = await api.get(apiConfig.endpoints.detectorsTypes);
        setDetectorTypes(res.data.data?.detectorTypes || []);
      } catch {
        toast.error("Failed to load detector types");
      }
    };
    fetchTypes();
  }, []);

  // Fetch existing detector data in edit mode
  useEffect(() => {
    const fetchDetector = async () => {
      if (!isEditMode || !detectorId) return;
      try {
        const res = await api.get(apiConfig.endpoints.getDetector(detectorId));
        const detector = res.data.data.detector || res.data;
console.log('sdfhshfg',detector)
        reset({
          detectorName: detector.detectorName || detector.name || "",
          description: detector.description || "",
          detectorType: detector.detectorType || detector.detector_type || "",
          confidence: (detector.confidence || detector.confidence_threshold)?.toString() || "0.7",
          regex: detector.regex || detector.patterns || [],
        });
      } catch (err) {
        toast.error("Failed to load detector details");
      }
    };
    fetchDetector();
  }, [isEditMode, detectorId, reset]);

  const onSubmit: SubmitHandler<DetectorFormValues> = async (data) => {
    setLoading(true);
    try {
      const payload = {
        detectorName: data.detectorName,
        description: data.description,
        detectorType: data.detectorType.toUpperCase(),
        confidence: parseFloat(data.confidence),
        regex: data.regex,
      };

      if (isEditMode) {
        await api.put(apiConfig.endpoints.updateDetector(detectorId!), payload);
        toast.success("Detector updated successfully");
      } else {
        await api.post(apiConfig.endpoints.detectorsCreate, payload);
        toast.success("Detector created successfully");
      }

      onSuccess?.();
      router.push("/detectors");
      router.refresh();
    } catch {
      toast.error(isEditMode ? "Failed to update detector" : "Failed to create detector");
    } finally {
      setLoading(false);
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
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {isEditMode ? "Update Detector" : "Create Detector"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
