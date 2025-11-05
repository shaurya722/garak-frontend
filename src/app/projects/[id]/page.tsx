// src/app/projects/[id]/page.tsx
'use client';

import { useProject } from '@/hooks/use-projects';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit } from 'lucide-react';
import Link from 'next/link';
import MainLayout from '@/components/layout/main-layout';
import { PageLoader } from "@/components/shared";

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params.id as string;
  const { data: project, isLoading, isError } = useProject(projectId);

  if (isLoading) return (
    <MainLayout>
      <PageLoader message="Loading project..." />
    </MainLayout>
  );

  if (isError || !project) return (
    <MainLayout>
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive">Project not found</h1>
          <Link href="/projects">
            <Button className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Projects
            </Button>
          </Link>
        </div>
      </div>
    </MainLayout>
  );

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
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold">{project.name}</h1>
              <p className="text-muted-foreground mt-2">{project.description}</p>
              <Badge variant={project.type === 'RED' ? 'destructive' : 'default'} className="mt-2">
                {project.type} Team
              </Badge>
            </div>
            <Link href={`/projects/${project.id}/edit`}>
              <Button>
                <Edit className="mr-2 h-4 w-4" />
                Edit Project
              </Button>
            </Link>
          </div>
        </div>

        {project.type === 'RED' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Model Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Model Type</label>
                    <p className="text-sm text-muted-foreground">{project.redModelType}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Model Name</label>
                    <p className="text-sm text-muted-foreground">{project.redModelName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Model URL</label>
                    <p className="text-sm text-muted-foreground">{project.redModelUrl}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Authorization Type</label>
                    <p className="text-sm text-muted-foreground">{project.redAuthorizationType}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {project.redRequestTemplate && (
              <Card>
                <CardHeader>
                  <CardTitle>Request Template</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="text-sm bg-muted p-4 rounded-md overflow-x-auto">
                    {JSON.stringify(project.redRequestTemplate, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            )}

            {project.agenticZipUrl && (
              <Card>
                <CardHeader>
                  <CardTitle>Agentic Configuration</CardTitle>
                </CardHeader>
                <CardContent>
                  <div>
                    <label className="text-sm font-medium">Agentic ZIP URL</label>
                    <p className="text-sm text-muted-foreground">{project.agenticZipUrl}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        <div className="mt-6 text-xs text-muted-foreground">
          Created: {project.createdAt ? new Date(project.createdAt).toLocaleString() : 'N/A'}
          {project.updatedAt && (
            <> • Updated: {new Date(project.updatedAt).toLocaleString()}</>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
