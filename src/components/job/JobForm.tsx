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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { useCreateJob, useUpdateJob, useJob } from '@/hooks/use-jobs';
import { JobFormData, CreateJobPayload } from '@/types';
import MainLayout from '@/components/layout/main-layout';
import { useProjectsDropdown } from '@/hooks/use-projects';

type JobFormProps = {
  mode: 'create' | 'edit';
  jobId?: string;
};

// Zod schema for job form
const jobFormSchema = z.object({
  projectId: z.string().min(1, 'Project ID is required'),
  redAuthorizationValue: z.string(),
  evaluationThreshold: z.string(),
  agenticReport: z.string(),
});

export function JobForm({ mode, jobId }: JobFormProps) {
  const router = useRouter();
  const { data: projects } = useProjectsDropdown(); // Get projects for dropdown

  // For edit mode, fetch existing job data
  const { data: existingJob } = useJob(jobId || '');

  const createMutation = useCreateJob();
  const updateMutation = useUpdateJob();

  const form = useForm<JobFormData>({
    resolver: zodResolver(jobFormSchema),
    defaultValues: {
      projectId: '',
      redAuthorizationValue: '',
      evaluationThreshold: '',
      agenticReport: '',
    },
  });

  // Populate form with existing data in edit mode
  useEffect(() => {
    if (mode === 'edit' && existingJob) {
      form.reset({
        projectId: existingJob.projectId,
        redAuthorizationValue: existingJob.redAuthorizationValue || '',
        evaluationThreshold: existingJob.evaluationThreshold?.toString() || '',
        agenticReport: existingJob.agenticReport || '',
      });
    }
  }, [mode, existingJob, form]);

  const onSubmit: SubmitHandler<JobFormData> = async (data) => {
    const payload: CreateJobPayload = {
      projectId: data.projectId,
      redAuthorizationValue: data.redAuthorizationValue || null,
      evaluationThreshold: data.evaluationThreshold ? parseFloat(data.evaluationThreshold) : null,
    };

    try {
      if (mode === 'create') {
        const r = await createMutation.mutateAsync(payload);
        router.push(`/jobs/${r.id}`);
      } else if (mode === 'edit' && jobId) {
        await updateMutation.mutateAsync({
          id: jobId,
          ...payload,
          agenticReport: data.agenticReport || null,
        });
        router.push(`/jobs/${jobId}`);
      }
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <MainLayout>
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <Link href="/jobs">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Jobs
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">
            {mode === 'create' ? 'Create New Job' : 'Edit Job'}
          </h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Job Details</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="projectId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project</FormLabel>
                      <FormControl>
                        <select
                          {...field}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-primary-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select a project...</option>
                          {projects?.projects.map((project) => (
                            <option key={project.id} value={project.id}>
                              {project.name} ({project.type})
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="redAuthorizationValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Red Authorization Value (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter authorization value"
                          type="password"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="evaluationThreshold"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Evaluation Threshold (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter threshold (e.g., 0.7)"
                          type="number"
                          step="0.01"
                          min="0"
                          max="1"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {mode === 'edit' && (
                  <FormField
                    control={form.control}
                    name="agenticReport"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Agentic Report (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Enter agentic report"
                            rows={4}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <div className="flex justify-end space-x-4">
                  <Link href={`/jobs/${jobId}`}>
                    <Button type="button" variant="outline">
                      Cancel
                    </Button>
                  </Link>
                  <Button type="submit" disabled={isLoading}>
                    <Save className="mr-2 h-4 w-4" />
                    {isLoading ? 'Saving...' : 'Save Job'}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
