// src/components/project/ProjectForm.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { useCreateProject, useUpdateProject, useProject } from '@/hooks/use-projects';
import { CreateProjectPayload } from '@/types';
import MainLayout from '@/components/layout/main-layout';

// Helper function to beautify JSON
const beautifyJSON = (jsonString: string): string => {
  try {
    const parsed = JSON.parse(jsonString);
    return JSON.stringify(parsed, null, 2);
  } catch {
    return jsonString; // Return original if invalid
  }
};

// Zod schema with conditional validation
const projectFormSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  description: z.string().min(1, 'Description is required'),
  type: z.enum(['RED', 'BLUE', 'AGENTIC']),
  // Red team fields - conditionally required
  redModelType: z.enum(['OPENAI', 'ANTHROPIC', 'GOOGLE', 'REST', 'HUGGING_FACE', 'HUGGING_FACE_INFERENCE_API', 'HUGGING_FACE_INFERENCE_ENDPOINT', 'REPLICATE', 'COHERE', 'GROQ', 'NIM', 'GGML']).optional(),
  redModelName: z.string().optional(),
  redModelUrl: z.string().optional(),
  redModelToken: z.string().optional(),
  redAuthorizationType: z.enum(['BEARER', 'API_KEY', 'BASIC', 'CUSTOM', 'NONE']).optional(),
  redAuthorizationValue: z.string().optional(),
  redRequestTemplate: z.string().optional(),
  // Agentic field
  agenticZipUrl: z.string().optional(),
}).superRefine((data, ctx) => {
  // RED team validation
  if (data.type === 'RED') {
    if (!data.redModelType) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Model type is required for RED team projects',
        path: ['redModelType'],
      });
    }

    // If REST model type
    if (data.redModelType === 'REST') {
      if (!data.redModelUrl) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Model URL is required for REST models',
          path: ['redModelUrl'],
        });
      }
      if (!data.redAuthorizationType) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Authorization type is required for REST models',
          path: ['redAuthorizationType'],
        });
      }
      if (data.redAuthorizationType === 'NONE') {
        // For NONE authorization type, value should be null - no validation needed
      } else if (!data.redAuthorizationValue) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Authorization value is required for REST models',
          path: ['redAuthorizationValue'],
        });
      }
      if (!data.redRequestTemplate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Request template is required for REST models',
          path: ['redRequestTemplate'],
        });
      } else {
        try {
          JSON.parse(data.redRequestTemplate);
        } catch {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Request template must be valid JSON',
            path: ['redRequestTemplate'],
          });
        }
      }
    }
    // If other model types (not REST)
    else if (data.redModelType && !['REST'].includes(data.redModelType)) {
      if (!data.redModelName) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Model name is required',
          path: ['redModelName'],
        });
      }
      if (!data.redModelToken) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Model token is required',
          path: ['redModelToken'],
        });
      }
    }
  }

  // AGENTIC team validation
  if (data.type === 'AGENTIC') {
    // No additional validation for AGENTIC type
  }
});

type ProjectFormValues = z.infer<typeof projectFormSchema>;

interface ProjectFormProps {
  projectId?: string;
  mode: 'create' | 'edit';
}

export function ProjectForm({ projectId, mode }: ProjectFormProps) {
  const router = useRouter();
  const { data: existingProject } = useProject(projectId || '');
  const createMutation = useCreateProject();
  const updateMutation = useUpdateProject();

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      name: '',
      description: '',
      type: 'RED',
      redModelType: 'OPENAI',
      redModelName: '',
      redModelUrl: '',
      redModelToken: '',
      redAuthorizationType: 'BEARER',
      redAuthorizationValue: '',
      redRequestTemplate: JSON.stringify({
        model: 'gpt-4',
        messages: [{ role: 'user', content: 'Hello, world!' }],
        max_tokens: 100
      }, null, 2),
      agenticZipUrl: undefined,
    },
  });

  const watchedType = form.watch('type');
  const watchedRedModelType = form.watch('redModelType');
  const watchedAuthorizationType = form.watch('redAuthorizationType');

  // Load existing project data for edit mode
  useEffect(() => {
    if (existingProject && mode === 'edit') {
      form.reset({
        name: existingProject.name,
        description: existingProject.description,
        type: existingProject.type,
        redModelType: (existingProject.redModelType === 'CUSTOM' ? 'REST' : existingProject.redModelType) || 'REST',
        redModelName: existingProject.redModelName || '',
        redModelUrl: existingProject.redModelUrl || '',
        redModelToken: existingProject.redModelToken || '',
        redAuthorizationType: existingProject.redAuthorizationType || 'BEARER',
        redAuthorizationValue: existingProject.redAuthorizationValue || '',
        redRequestTemplate: existingProject.redRequestTemplate
          ? JSON.stringify(existingProject.redRequestTemplate, null, 2)
          : '',
        agenticZipUrl: existingProject.agenticZipUrl || undefined,
      });
    }
  }, [existingProject, mode, form]);

  const onSubmit: SubmitHandler<ProjectFormValues> = async (data) => {
    try {
      let payload: CreateProjectPayload = {
        name: data.name,
        description: data.description,
        type: data.type,
      };

      // Handle different project types
      if (data.type === 'RED') {
        payload = {
          ...payload,
          redModelType: data.redModelType,
          ...(data.redModelType === 'REST' ? {
            redModelUrl: data.redModelUrl,
            redAuthorizationType: data.redAuthorizationType,
            redAuthorizationValue: data.redAuthorizationType === 'NONE' ? null : data.redAuthorizationValue,
            // redAuthorizationValue: data.redAuthorizationValue,
            redRequestTemplate: JSON.parse(data.redRequestTemplate || '{}'),
          } : {
            redModelName: data.redModelName,
            redModelToken: data.redModelToken,
          }),
        } as CreateProjectPayload;
      } else if (data.type === 'AGENTIC') {
        payload = {
          ...payload,
          agenticZipUrl: data.agenticZipUrl,
        } as CreateProjectPayload;
      }
      // BLUE type has no additional fields

      if (mode === 'create') {
        const result = await createMutation.mutateAsync(payload);
        router.push(`/projects/${result.id}`);
      } else if (projectId) {
        await updateMutation.mutateAsync({ id: projectId, ...payload });
        router.push(`/projects/${projectId}`);
      }
    } catch (error) {
      console.error('Failed to save project:', error);
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <Link href="/projects">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Projects
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">
            {mode === 'create' ? 'Create New Project' : 'Edit Project'}
          </h1>
          <p className="text-muted-foreground">
            {mode === 'create'
              ? 'Create a new red teaming or blue teaming project'
              : 'Update project details'
            }
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter project name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter project description"
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Type *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="RED">Red Team</SelectItem>
                          <SelectItem value="BLUE">Blue Team</SelectItem>
                          <SelectItem value="AGENTIC">Agentic</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* RED Team Configuration */}
            {watchedType === 'RED' && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Model Configuration</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="redModelType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Model Type</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="OPENAI">OpenAI</SelectItem>
                              <SelectItem value="ANTHROPIC">Anthropic</SelectItem>
                              <SelectItem value="GOOGLE">Google</SelectItem>
                              <SelectItem value="REST">REST</SelectItem>
                              <SelectItem value="HUGGING_FACE">Hugging Face</SelectItem>
                              <SelectItem value="HUGGING_FACE_INFERENCE_API">Hugging Face Inference API</SelectItem>
                              <SelectItem value="HUGGING_FACE_INFERENCE_ENDPOINT">Hugging Face Inference Endpoint</SelectItem>
                              <SelectItem value="REPLICATE">Replicate</SelectItem>
                              <SelectItem value="COHERE">Cohere</SelectItem>
                              <SelectItem value="GROQ">GROQ</SelectItem>
                              <SelectItem value="NIM">NIM</SelectItem>
                              <SelectItem value="GGML">GGML</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Fields for non-custom models */}
                    {watchedRedModelType && watchedRedModelType !== 'REST' && (
                      <>
                        <FormField
                          control={form.control}
                          name="redModelName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Model Name *</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., gpt-4" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="redModelToken"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Model Token *</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="API token" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </>
                    )}

                    {/* Fields for custom models */}
                    {watchedRedModelType === 'REST' && (
                      <>
                        <FormField
                          control={form.control}
                          name="redModelUrl"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Model URL *</FormLabel>
                              <FormControl>
                                <Input placeholder="https://api.example.com/v1/chat/completions" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="redAuthorizationType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Authorization Type *</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="BEARER">Bearer Token</SelectItem>
                                  <SelectItem value="API_KEY">API Key</SelectItem>
                                  <SelectItem value="BASIC">Basic Auth</SelectItem>
                                  <SelectItem value="CUSTOM">Custom</SelectItem>
                                  <SelectItem value="NONE">None</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        {watchedRedModelType === 'REST' && watchedAuthorizationType !== 'NONE' && (
                          <FormField
                            control={form.control}
                            name="redAuthorizationValue"
                            render={({ field }) => (
                              <FormItem>
                              <FormLabel>Authorization Value *</FormLabel>
                              <FormControl>
                                <Input placeholder="Authorization value" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        )}
                        <FormField
                          control={form.control}
                          name="redRequestTemplate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Request JSON Template *</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Enter JSON request template"
                                  rows={8}
                                  className="font-mono text-sm"
                                  {...field}
                                  onBlur={(e) => {
                                    const beautified = beautifyJSON(e.target.value);
                                    field.onChange(beautified);
                                  }}
                                />
                              </FormControl>
                              <p className="text-xs text-muted-foreground mt-1">
                                Must be valid JSON. Use $INPUT as placeholder for test prompts.
                              </p>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </>
                    )}
                  </CardContent>
                </Card>
              </>
            )}

            {/* AGENTIC Configuration */}
            {watchedType === 'AGENTIC' && (
              <Card>
                <CardHeader>
                  <CardTitle>Agentic Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="agenticZipUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Agentic ZIP URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com/agentic-model.zip" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <div className="flex justify-end space-x-4">
              <Link href="/projects">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                <Save className="mr-2 h-4 w-4" />
                {createMutation.isPending || updateMutation.isPending ? 'Saving...' : mode === 'create' ? 'Create Project' : 'Update Project'}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </MainLayout>
  );
}
