'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Trash2, Copy, Download } from 'lucide-react';
import Link from 'next/link';
import { useJob, useDeleteJob, useJobReport } from '@/hooks/use-jobs';
import { useJobLogs } from '@/hooks/use-logs';
import { formatDate, formatDateTime } from '@/lib/utils';
import { toast } from 'sonner';
import { DeleteConfirmDialog } from '@/components/dialogs/delete-confirmation-dialog';
import MainLayout from '@/components/layout/main-layout';
import { PageLoader } from "@/components/shared";
import { useState } from 'react';
import { DailyLogsChart, DailyFailedPercentageChart, JobReportMetrics } from '@/components/charts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PDFService } from '@/services/pdf.service';

type JobDetailProps = {
  jobId: string;
};

export function JobDetail({ jobId }: JobDetailProps) {
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const currentDate = new Date();
  const [reportMonth, setReportMonth] = useState(currentDate.getMonth() + 1); // 1-based month
  const [reportYear, setReportYear] = useState(currentDate.getFullYear());

  // const [logType, setLogType] = useState<'RED' | 'BLUE'>('RED');

  const { data: job, isLoading, isError } = useJob(jobId);
  const deleteMutation = useDeleteJob();
  const { data: reportData, isLoading: reportLoading, error: reportError } = useJobReport(jobId, {
    month: reportMonth,
    year: reportYear,
  });
  // const { data: logsData, isLoading: logsLoading } = useJobLogs(jobId, {
  //   page: 1,
  //   limit: 10,
  //   type: logType,
  // });

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteMutation.mutateAsync(jobId);
      toast.success('Job deleted successfully');
      router.push('/jobs');
    } catch {
      toast.error('Failed to delete job');
    }
  };

  const generatePDF = async () => {
    if (!reportData?.data || !Array.isArray(reportData.data) || reportData.data.length === 0) {
      toast.error('No report data available to generate PDF');
      return;
    }

    try {
      await PDFService.generateJobReportPDF({
        jobId,
        job,
        reportData: reportData as unknown as { data: any[] },
      });
      toast.success('PDF generated successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate PDF');
    }
  };

  if (isLoading) return (
    <MainLayout>
      <PageLoader message="Loading job details..." />
    </MainLayout>
  );

  if (isError || !job) return (
    <MainLayout>
      <div>Error loading job details</div>
    </MainLayout>
  );

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
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Job Details</h1>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => router.push(`/api-usage`)}
              >
                <Edit className="mr-2 h-4 w-4" />
                API Documentation
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push(`/jobs/${jobId}/edit`)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteClick}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>
        </div>

        <div className="grid gap-6">
          {/* <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* <div>
                <label className="text-sm font-medium  text-gray-500">Job ID</label>
                <p className="text-sm font-mono bg-gray-50 p-2 rounded">{job.id}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Project ID</label>
                <p className="text-sm font-mono bg-gray-50 p-2 rounded">{job.projectId}</p>
              </div> */}
              {/* <div>
                <label className="text-sm font-medium text-gray-500">Project Type</label>
                <p>{job.projectType}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <Badge variant={job.status === 'PENDING' ? 'secondary' : 'default'}>
                  {job.status}
                </Badge>
              </div>
              {/* <div>
                <label className="text-sm font-medium text-gray-500">Created At</label>
                <p>{job.createdAt && formatDate(job.createdAt)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Updated At</label>
                <p>{job.updatedAt && formatDate(job.updatedAt)}</p>
              </div> */}
            {/* </CardContent> */}
          {/* </Card> */}  


          {job.project && (
            <Card>
              <CardHeader>
                <CardTitle>Project Details</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 space-x-3 space-y-3">
                <div className='flex gap-3'>
                  <label className="text-sm font-medium text-gray-500">Project Name</label>
                  <p className="font-medium">{job.project.name}    <Badge variant={job.project.type === 'RED' ? 'destructive' : job.project.type === 'BLUE' ? 'blue' : 'default'}>
                    {job.project.type} Team
                  </Badge></p>
                </div>
                      <div className='flex items-center gap-3'>
                <label className="text-sm font-medium text-gray-500">Blue API Key</label>
                <div className="mt-1">
                  {job.blueAPIKey ? (
                    <Badge variant="outline" className='bg-blue-800'>
                      <div className="flex items-center space-x-1">
                        <span>
                          {job.blueAPIKey!.length > 50
                            ? `${job.blueAPIKey!.substring(0, 50)}...`
                            : job.blueAPIKey}
                        </span>
                        <button
                          type="button"
                          className="button-reset bg-transparent p-0 text-muted-foreground"
                          onClick={() => {
                            navigator.clipboard.writeText(job.blueAPIKey!);
                            toast.success('Copied!');
                          }}
                        >
                          <Copy className="h-3 w-3" />
                        </button>
                      </div>
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground">None</span>
                  )}
                </div>
                
              </div>
                <div className='flex gap-3'>
                  <label className="text-sm font-medium text-gray-500">Project Description</label>
                  <p>{job.project.description}</p>
                </div>
                {/* <div className='flex gap-3'>
                  <label className="text-sm font-medium text-gray-500">Project Type</label>
                  <Badge variant={job.project.type === 'RED' ? 'destructive' : job.project.type === 'BLUE' ? 'blue' : 'default'}>
                    {job.project.type} Team
                  </Badge>
                </div> */}
                 <div className='space-x-3'>
                  <label className="text-sm font-medium text-gray-500">Project Type</label>
                   <Badge variant={job.status === 'PENDING' ? 'secondary' : 'default'}>
                  {job.status}
                </Badge>
                </div>
                {job.project.redModelType && (
                  <div className='flex gap-3'>
                    <label className="text-sm font-medium text-gray-500">Model Type</label>
                    <p>{job.project.redModelType}</p>
                  </div>
                )}

                     <div className='flex items-center gap-3'>
                <label className="text-sm font-medium text-gray-500">Evaluation Threshold</label>
                <div className="mt-1">
                  {job.evaluationThreshold !== null ? (
                    <Badge variant="secondary">
                      {job.evaluationThreshold}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground">None</span>
                  )}
                </div>
              </div>
            

              </CardContent>
            </Card>
          )}

     
          {/* Reports Section */}
          <Card>
            <CardHeader>
              <CardTitle>Job Reports</CardTitle>
              <div className="flex gap-4 mt-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Month</label>
                  <Select value={reportMonth.toString()} onValueChange={(value) => setReportMonth(parseInt(value))}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                        <SelectItem key={month} value={month.toString()}>
                          {new Date(2000, month - 1, 1).toLocaleString('default', { month: 'long' })}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Year</label>
                  <Select value={reportYear.toString()} onValueChange={(value) => setReportYear(parseInt(value))}>
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[2024, 2025, 2026].map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {job.project?.type === 'RED' && reportData?.data && (
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Actions</label>
                    <Button
                      onClick={generatePDF}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Generate PDF
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            {job.projectType === 'BLUE' && (<CardContent>
              {reportLoading ? (
                <div className="flex justify-center items-center h-32">
                  <div>Loading reports...</div>
                </div>
              ) : reportError ? (
                <div className="flex justify-center items-center h-32">
                  <div className="text-red-500">
                    Error loading reports: {reportError.message || 'Something went wrong'}
                  </div>
                </div>
              ) : reportData && reportData.data ? (
                <div className="space-y-6">
                  <JobReportMetrics data={reportData.data} />
                  <div className="grid gap-6 md:grid-cols-2">
                    <DailyLogsChart data={reportData.data.dailyLogsGraph || []} />
                    <DailyFailedPercentageChart data={reportData.data.dailyFailedPercentageGraph || []} />
                  </div>
                </div>
              ) : (
                <div className="flex justify-center items-center h-32">
                  <div>No report data available</div>
                </div>
              )}
            </CardContent>
            )}
          </Card>
        </div>

        {/* Logs Section */}
        {/* <Card> */}
          {/* <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Job Logs</CardTitle>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Filter by Type:</label>
                <Select value={logType} onValueChange={(value: 'RED' | 'BLUE') => setLogType(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="RED">
                      <Badge variant="destructive" className="mr-2">RED</Badge>
                      Red Team
                    </SelectItem>
                    <SelectItem value="BLUE">
                      <Badge variant="default" className="mr-2 bg-blue-500">BLUE</Badge>
                      Blue Team
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader> */}
          {/* <CardContent>
            {logsLoading ? (
              <div className="flex justify-center items-center h-32">
                <div>Loading logs...</div>
              </div>
            ) : logsData && logsData.docs ? (
              <div className="space-y-4">
                {logsData.docs.map((log: any) => (
                  <div key={log.id} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant={log.status === 'pass' ? 'default' : 'destructive'}>
                          {log.status === 'pass' ? 'PASS' : 'BLOCKED'}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {formatDateTime(log.createdAt)}
                        </span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {logType} Team
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <span className="font-medium">User Prompt:</span>
                        <p className="text-sm text-gray-700 mt-1">{log.userPrompt || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="font-medium">Sanitized Content:</span>
                        <p className="text-sm text-gray-700 mt-1">{log.sanitizedContent || 'N/A'}</p>
                      </div>
                      <div className="flex gap-4 text-sm">
                        <span>Scanners Used: {log.scannersUsed?.join(', ') || 'N/A'}</span>
                        {log.isFail && (
                          <span className="text-red-600">
                            Failed Scanners: {log.failedScanners?.join(', ') || 'N/A'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {logsData.docs.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No {logType} team logs found for this job.
                  </div>
                )}
              </div>
            ) : (
              <div className="flex justify-center items-center h-32">
                <div>No logs data available</div>
              </div>
            )}
          </CardContent> */}
        {/* </Card> */}

        <DeleteConfirmDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={handleDeleteConfirm}
          title="Delete Job"
          description="Are you sure you want to delete this job? This action cannot be undone."
        />
      </div>
    </MainLayout>
  );
}
