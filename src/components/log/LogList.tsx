'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLogs } from '@/hooks/use-logs';
import { Log } from '@/types';
import { Search, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import MainLayout from '@/components/layout/main-layout';
import { PageLoader } from "@/components/shared";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination } from "@/components/shared/pagination";
import { LogDetailDialog } from './LogDetailDialog';

export function LogList() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [selectedLog, setSelectedLog] = useState<Log | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  const { data, isLoading, isError } = useLogs({ page, limit });

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newSize: number) => {
    setLimit(newSize);
    setPage(1); // Reset to first page when changing page size
  };

  const handleViewLog = (log: Log) => {
    setSelectedLog(log);
    setDetailDialogOpen(true);
  };

  // Filter logs based on search
  const filteredLogs = data?.docs?.filter((log) =>
    log.userPrompt.toLowerCase().includes(search.toLowerCase()) ||
    log.policyName.toLowerCase().includes(search.toLowerCase()) ||
    log.status.toLowerCase().includes(search.toLowerCase())
  ) || [];

  if (isLoading) return (
    <MainLayout>
      <PageLoader message="Loading logs..." />
    </MainLayout>
  );
  if (isError) return (
    <MainLayout>
      <div>Error loading logs</div>
    </MainLayout>
  );

  return (
    <MainLayout>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Logs</h1>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search logs..."
              className="pl-8 w-full"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User Prompt</TableHead>
              <TableHead>Policy</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Scanners</TableHead>
              <TableHead>Risk Score</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLogs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>
                  <div className="max-w-xs truncate" title={log.userPrompt}>
                    {log.userPrompt}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {log.policyName}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={log.status === 'pass' ? 'default' : 'destructive'}>
                    {log.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {log.scannersUsed.map((scanner) => (
                      <Badge key={scanner} variant="secondary" className="text-xs">
                        {scanner}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(log.riskScores).map(([scanner, score]) => (
                      <Badge
                        key={scanner}
                        variant={score > 0.5 ? 'destructive' : score > 0.2 ? 'secondary' : 'default'}
                        className="text-xs"
                      >
                        {scanner}: {score}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  {formatDate(log.createdAt)}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleViewLog(log)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Pagination */}
        {data && data.totalPages > 0 && (
          <Pagination
            page={data.currentPage}
            totalPages={data.totalPages}
            onPageChange={handlePageChange}
            pageSize={limit}
            onPageSizeChange={handlePageSizeChange}
          />
        )}

        <LogDetailDialog
          log={selectedLog}
          open={detailDialogOpen}
          onOpenChange={setDetailDialogOpen}
        />
      </div>
    </MainLayout>
  );
}
