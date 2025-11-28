'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useLogs } from '@/hooks/use-logs'
import { useProjectsDropdown } from '@/hooks/use-projects'
import { usePolicyDropdown } from '@/hooks/use-policies'
import { Log } from '@/types'
import { Search, Eye } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import MainLayout from '@/components/layout/main-layout'
import { PageLoader } from '@/components/shared'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Pagination } from '@/components/shared/pagination'
import { LogDetailDialog } from './LogDetailDialog'
import { formatDate, formatDateTime } from '@/lib/utils'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export function LogList() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [type, setType] = useState<'RED' | 'BLUE'>('BLUE')
  const [selectedLog, setSelectedLog] = useState<Log | null>(null)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)

  const { data, isLoading, isError } = useLogs({ page, limit, type })

  // Fetch dropdown data for name lookups
  const { data: projectsData } = useProjectsDropdown()
  const { data: policiesData } = usePolicyDropdown()

  // Create lookup maps
  const projectMap = new Map(
    projectsData?.projects?.map((p: { id?: string; name: string }) => [
      p.id,
      p.name,
    ]) || []
  )
  const policyMap = new Map(
    policiesData?.map((p: { id?: string; name: string }) => [p.id, p.name]) ||
      []
  )

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  const handlePageSizeChange = (newSize: number) => {
    setLimit(newSize)
    setPage(1) // Reset to first page when changing page size
  }

  const handleViewLog = (log: Log) => {
    setSelectedLog(log)
    setDetailDialogOpen(true)
  }

  // Process Blue team analytics data
  const blueTeamAnalytics = () => {
    if (type !== 'BLUE' || !data?.docs) return null

    const logs = data.docs
    const statusCounts = { pass: 0, fail: 0 }
    const scannerCounts: { [key: string]: number } = {}
    const policyCounts: { [key: string]: number } = {}
    const riskScoreData: { [key: string]: number[] } = {}

    logs.forEach((log) => {
      // Status counts
      if (log.status === 'pass') statusCounts.pass++
      else statusCounts.fail++

      // Scanner usage
      ;(log.scannersUsed || []).forEach((scanner) => {
        scannerCounts[scanner] = (scannerCounts[scanner] || 0) + 1
      })

      // Policy distribution
      const policy = log.policyName || 'Unknown'
      policyCounts[policy] = (policyCounts[policy] || 0) + 1

      // Risk scores by scanner
      Object.entries(log.riskScores || {}).forEach(([scanner, score]) => {
        if (!riskScoreData[scanner]) riskScoreData[scanner] = []
        riskScoreData[scanner].push(score as number)
      })
    })

    // Prepare chart data
    const statusData = [
      { name: 'Passed', value: statusCounts.pass, color: '#10b981' },
      { name: 'Failed', value: statusCounts.fail, color: '#ef4444' },
    ]

    const scannerData = Object.entries(scannerCounts).map(
      ([scanner, count]) => ({
        name: scanner,
        count,
      })
    )

    const policyData = Object.entries(policyCounts).map(([policy, count]) => ({
      name: policy,
      count,
    }))

    const riskData = Object.entries(riskScoreData).map(([scanner, scores]) => ({
      scanner,
      avgScore: scores.reduce((a, b) => a + b, 0) / scores.length,
      maxScore: Math.max(...scores),
    }))

    return { statusData, scannerData, policyData, riskData }
  }

  const analytics = blueTeamAnalytics()
  const filteredLogs = (data?.docs || []).filter((log) =>
    type === 'RED'
      ? (log.jobId?.toLowerCase() || '').includes(search.toLowerCase()) ||
        (log.projectId?.toLowerCase() || '').includes(search.toLowerCase()) ||
        (log.policyId?.toLowerCase() || '').includes(search.toLowerCase()) ||
        (log.jobStatus?.toLowerCase() || '').includes(search.toLowerCase())
      : (log.userPrompt?.toLowerCase() || '').includes(search.toLowerCase()) ||
        (log.policyName?.toLowerCase() || '').includes(search.toLowerCase()) ||
        (log.status?.toLowerCase() || '').includes(search.toLowerCase())
  )

  if (isLoading)
    return (
      <MainLayout>
        <PageLoader message='Loading logs...' />
      </MainLayout>
    )
  if (isError)
    return (
      <MainLayout>
        <div>Error loading logs</div>
      </MainLayout>
    )

  return (
    <MainLayout>
      <div className='container mx-auto p-6'>
        <div className='flex justify-between items-center mb-6'>
          <h1 className='text-2xl font-bold'>Logs</h1>
        </div>

        <div className='mb-6'>
          <div className='flex gap-4 flex-wrap'>
            <div className='relative flex-1 min-w-64'>
              <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
              <Input
                type='search'
                placeholder='Search logs...'
                className='pl-8 w-full'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className='flex items-center gap-2'>
              <label className='text-sm font-medium'>Team:</label>
              <Select
                value={type}
                onValueChange={(value: 'RED' | 'BLUE') => setType(value)}
              >
                <SelectTrigger className='w-32'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='RED'>
                    {/* <Badge variant="destructive" className="mr-2">RED Team</Badge> */}
                    Red Team
                  </SelectItem>
                  <SelectItem value='BLUE'>
                    {/* <Badge variant="default" className="mr-2 bg-blue-500">BLUE Team</Badge> */}
                    Blue Team
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Project:</label>
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Projects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects</SelectItem>
                  {projectsData?.projects?.map((project) => (
                    <SelectItem key={project.id} value={project.id || ''}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div> */}

            {/* <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Policy:</label>
              <Select value={selectedPolicy} onValueChange={setSelectedPolicy}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Policies" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Policies</SelectItem>
                  {policiesData?.map((policy: any) => (
                    <SelectItem key={policy.id} value={policy.id || ''}>
                      {policy.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div> */}
          </div>
        </div>

        {/* Blue Team Analytics Charts */}
        {type === 'BLUE' && analytics && (
          <div className='mb-6 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6'>
            {/* Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Status Distribution</CardTitle>
                <CardDescription>Pass vs Fail analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width='100%' height={250}>
                  <PieChart>
                    <Pie
                      data={analytics.statusData}
                      cx='50%'
                      cy='50%'
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey='value'
                    >
                      {analytics.statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1f2937',
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#f9fafb',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className='flex justify-center space-x-4 mt-2'>
                  {analytics.statusData.map((item) => (
                    <div key={item.name} className='flex items-center'>
                      <div
                        className='w-3 h-3 rounded-full mr-2'
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <span className='text-sm text-muted-foreground'>
                        {item.name}: {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Scanner Usage */}
            <Card>
              <CardHeader>
                <CardTitle>Scanner Usage</CardTitle>
                <CardDescription>Most used security scanners</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width='100%' height={250}>
                  <BarChart data={analytics.scannerData}>
                    <CartesianGrid strokeDasharray='3 3' stroke='#374151' />
                    <XAxis
                      dataKey='name'
                      angle={-45}
                      textAnchor='end'
                      height={60}
                      interval={0}
                      tick={{ fill: '#9ca3af', fontSize: 10 }}
                    />
                    <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1f2937',
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#f9fafb',
                      }}
                    />
                    <Bar
                      dataKey='count'
                      fill='#3b82f6'
                      radius={[4, 4, 0, 0]}
                      name='Usage Count'
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Risk Scores by Scanner */}
            <Card>
              <CardHeader>
                <CardTitle>Risk Scores</CardTitle>
                <CardDescription>
                  Average risk scores by scanner
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width='100%' height={250}>
                  <LineChart data={analytics.riskData}>
                    <CartesianGrid strokeDasharray='3 3' stroke='#374151' />
                    <XAxis
                      dataKey='scanner'
                      angle={-45}
                      textAnchor='end'
                      height={60}
                      interval={0}
                      tick={{ fill: '#9ca3af', fontSize: 10 }}
                    />
                    <YAxis
                      domain={[0, 1]}
                      tick={{ fill: '#9ca3af', fontSize: 12 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1f2937',
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#f9fafb',
                      }}
                    />
                    <Line
                      type='monotone'
                      dataKey='avgScore'
                      stroke='#f59e0b'
                      strokeWidth={3}
                      name='Avg Risk Score'
                      dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
                    />
                    <Line
                      type='monotone'
                      dataKey='maxScore'
                      stroke='#ef4444'
                      strokeWidth={2}
                      name='Max Risk Score'
                      dot={{ fill: '#ef4444', strokeWidth: 2, r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}

        <Table>
          <TableHeader>
            <TableRow>
              {type === 'RED' ? (
                <>
                  <TableHead>Job ID</TableHead>
                  <TableHead>Project ID</TableHead>
                  <TableHead>Policy ID</TableHead>
                  <TableHead>Job Status</TableHead>
                  {/* <TableHead>Timestamp</TableHead> */}
                  <TableHead>Actions</TableHead>
                </>
              ) : (
                <>
                  <TableHead>User Prompt</TableHead>
                  <TableHead>Policy</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Scanners</TableHead>
                  <TableHead>Risk Score</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLogs.map((log) => (
              <TableRow key={log.id}>
                {type === 'RED' ? (
                  <>
                    {/* <TableCell>
                      <div className="font-mono text-xs truncate max-w-xs" title={log.jobId}>
                        {log.jobId}
                      </div>
                    </TableCell> */}
                    <TableCell>
                      <div
                        className='truncate max-w-xs'
                        title={String(
                          projectMap.get(log.projectId || '') ||
                            log.projectId ||
                            'N/A'
                        )}
                      >
                        {projectMap.get(log.projectId || '') ||
                          log.projectId ||
                          'N/A'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div
                        className='truncate max-w-xs'
                        title={String(
                          policyMap.get(log.policyId || '') ||
                            log.policyId ||
                            'N/A'
                        )}
                      >
                        {String(
                          policyMap.get(log.policyId || '') ||
                            log.policyId ||
                            'N/A'
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          log.jobStatus === 'SUCCESS'
                            ? 'default'
                            : log.jobStatus === 'STARTED'
                            ? 'secondary'
                            : 'destructive'
                        }
                      >
                        {log.jobStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDateTime(log.timestamp || '')}</TableCell>
                    <TableCell>
                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={() => handleViewLog(log)}
                      >
                        <Eye className='h-4 w-4' />
                      </Button>
                    </TableCell>
                  </>
                ) : (
                  <>
                    <TableCell>
                      <div className='max-w-xs truncate' title={log.userPrompt}>
                        {log.userPrompt || 'N/A'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant='outline'>{log.policyName || 'N/A'}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          log.status === 'pass' ? 'default' : 'destructive'
                        }
                      >
                        {log.status || 'UNKNOWN'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className='flex flex-wrap gap-1'>
                        {(log.scannersUsed || []).map((scanner) => (
                          <Badge
                            key={scanner}
                            variant='secondary'
                            className='text-xs'
                          >
                            {scanner}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className='flex flex-wrap gap-1'>
                        {Object.entries(log.riskScores || {}).map(
                          ([scanner, score]) => (
                            <Badge
                              key={scanner}
                              variant={
                                score > 0.5
                                  ? 'destructive'
                                  : score > 0.2
                                  ? 'secondary'
                                  : 'default'
                              }
                              className='text-xs'
                            >
                              {scanner}: {score}
                            </Badge>
                          )
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(log.createdAt || '')}</TableCell>
                    <TableCell>
                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={() => handleViewLog(log)}
                      >
                        <Eye className='h-4 w-4' />
                      </Button>
                    </TableCell>
                  </>
                )}
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
  )
}
