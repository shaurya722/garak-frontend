'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Settings, Shield, Activity, Eye, Play, Loader2 } from 'lucide-react'
import Link from 'next/link'
import MainLayout from '@/components/layout/main-layout'
import { useProjects } from '@/hooks/use-projects'
import { usePolicies } from '@/hooks/use-policies'
import { useJobs } from '@/hooks/use-jobs'
import { useLogs } from '@/hooks/use-logs'
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
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts'

interface DashboardStats {
  projects: number
  policies: number
  jobs: number
  logs: number
}

function DashboardContent() {
  const { data: projectsData, isLoading: projectsLoading } = useProjects()
  const { data: policiesData, isLoading: policiesLoading } = usePolicies()
  const { data: jobsData, isLoading: jobsLoading } = useJobs()
  const { data: logsData, isLoading: logsLoading } = useLogs()

  const isLoading =
    projectsLoading || policiesLoading || jobsLoading || logsLoading

  const stats: DashboardStats = {
    projects: projectsData?.docs?.length || 0,
    policies: policiesData?.docs?.length || 0,
    jobs: jobsData?.docs?.length || 0,
    logs: logsData?.docs?.length || 0,
  }

  const recentProjects = projectsData?.docs?.slice(0, 5) || []
  const recentPolicies = policiesData?.docs?.slice(0, 5) || []
  const recentJobs = jobsData?.docs?.slice(0, 5) || []

  // Sample attack data - in a real app this would come from API
  const attackData = [
    { name: 'Prompt Injection', redTeam: 85, blueTeam: 92, total: 177 },
    { name: 'Jailbreak Attempts', redTeam: 67, blueTeam: 89, total: 156 },
    { name: 'Data Poisoning', redTeam: 43, blueTeam: 76, total: 119 },
    { name: 'Model Inversion', redTeam: 34, blueTeam: 68, total: 102 },
    { name: 'Adversarial Inputs', redTeam: 56, blueTeam: 83, total: 139 },
  ]

  const attackTypeData = [
    { name: 'Successful', value: 285, color: '#ef4444' },
    { name: 'Blocked', value: 408, color: '#10b981' },
  ]

  // Time series data for attack trends
  const attackTrendsData = [
    { month: 'Jan', attacks: 120, defenses: 95, successRate: 78 },
    { month: 'Feb', attacks: 135, defenses: 110, successRate: 82 },
    { month: 'Mar', attacks: 98, defenses: 125, successRate: 85 },
    { month: 'Apr', attacks: 145, defenses: 135, successRate: 88 },
    { month: 'May', attacks: 167, defenses: 142, successRate: 91 },
    { month: 'Jun', attacks: 189, defenses: 158, successRate: 87 },
  ]

  // Radar chart data for attack distribution
  const attackDistributionData = [
    { subject: 'Injection', A: 85, B: 92, fullMark: 100 },
    { subject: 'Jailbreak', A: 67, B: 89, fullMark: 100 },
    { subject: 'Poisoning', A: 43, B: 76, fullMark: 100 },
    { subject: 'Inversion', A: 34, B: 68, fullMark: 100 },
    { subject: 'Adversarial', A: 56, B: 83, fullMark: 100 },
    { subject: 'Evasion', A: 72, B: 91, fullMark: 100 },
  ]

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString()
    } catch {
      return dateString
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active':
        return <Badge className='bg-green-100 text-green-800'>Active</Badge>
      case 'SUCCESS':
        return <Badge className='bg-green-100 text-green-800'>Completed</Badge>
      case 'PENDING':
      case 'STARTED':
        return <Badge className='bg-blue-100 text-blue-800'>Running</Badge>
      case 'FAILURE':
      case 'REVOKED':
        return <Badge className='bg-red-100 text-red-800'>Failed</Badge>
      default:
        return <Badge variant='secondary'>{status}</Badge>
    }
  }

  if (isLoading) {
    return (
      <MainLayout>
        <div className='p-6 flex items-center justify-center min-h-[400px]'>
          <div className='flex items-center space-x-2'>
            <Loader2 className='h-6 w-6 animate-spin' />
            <span>Loading dashboard...</span>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className='py-3 px-6 space-y-6'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold tracking-tight'>Dashboard</h1>
            <p className='text-muted-foreground'>
              Monitor your AI security testing activities and system health
            </p>
          </div>
          <div className='flex items-center space-x-2'>
            <Link href='/playground'>
              <Button>
                <Play className='h-4 w-4 mr-2' />
                Open Playground
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Projects</CardTitle>
              <Settings className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <div className='flex justify-between items-end pr-4'>
              <CardContent>
                <div className='text-2xl font-bold'>{stats.projects}</div>
                <p className='text-xs text-muted-foreground'>Total projects</p>
              </CardContent>
              <Link href='/projects/new'>
                <Button variant='outline' size='sm'>
                  Create
                </Button>
              </Link>
            </div>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Policies</CardTitle>
              <Shield className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <div className='flex justify-between items-end pr-4'>
              <CardContent>
                <div className='text-2xl font-bold'>{stats.policies}</div>
                <p className='text-xs text-muted-foreground'>
                  Security policies
                </p>
              </CardContent>
              <Link href='/policies/new'>
                <Button variant='outline' size='sm'>
                  Create
                </Button>
              </Link>
            </div>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Jobs</CardTitle>
              <Activity className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <div className='flex justify-between items-end pr-4'>
              <CardContent>
                <div className='text-2xl font-bold'>{stats.jobs}</div>
                <p className='text-xs text-muted-foreground'>Active jobs</p>
              </CardContent>
              <Link href='/jobs'>
                <Button variant='outline' size='sm'>
                  View
                </Button>
              </Link>
            </div>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Logs</CardTitle>
              <Activity className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <div className='flex justify-between items-end pr-4'>
              <CardContent>
                <div className='text-2xl font-bold'>{stats.logs}</div>
                <p className='text-xs text-muted-foreground'>Total logs</p>
              </CardContent>
              <Link href='/logs'>
                <Button variant='outline' size='sm'>
                  View
                </Button>
              </Link>
            </div>
          </Card>
        </div>

        {/* Attack Analytics Charts */}
        <div className='grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-6'>
          <Card>
            <CardHeader>
              <CardTitle>Attack Types Analysis</CardTitle>
              <CardDescription>
                Red Team attacks vs Blue Team defenses by category
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width='100%' height={300}>
                <BarChart data={attackData}>
                  <CartesianGrid strokeDasharray='3 3' stroke='#374151' />
                  <XAxis
                    dataKey='name'
                    angle={-45}
                    textAnchor='end'
                    height={80}
                    interval={0}
                    tick={{ fill: '#9ca3af', fontSize: 12 }}
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
                    dataKey='redTeam'
                    fill='#ef4444'
                    name='Red Team Attacks'
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey='blueTeam'
                    fill='#3b82f6'
                    name='Blue Team Defenses'
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Attack Success Rate</CardTitle>
              <CardDescription>
                Overall success vs blocked attacks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width='100%' height={300}>
                <PieChart>
                  <Pie
                    data={attackTypeData}
                    cx='50%'
                    cy='50%'
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey='value'
                  >
                    {attackTypeData.map((entry, index) => (
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
              <div className='flex justify-center space-x-6 mt-4'>
                <div className='flex items-center'>
                  <div className='w-3 h-3 bg-red-500 rounded-full mr-2'></div>
                  <span className='text-sm text-muted-foreground'>
                    Successful: {attackTypeData[0].value}
                  </span>
                </div>
                <div className='flex items-center'>
                  <div className='w-3 h-3 bg-green-500 rounded-full mr-2'></div>
                  <span className='text-sm text-muted-foreground'>
                    Blocked: {attackTypeData[1].value}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Attack Trends Over Time</CardTitle>
              <CardDescription>
                Monthly attack patterns and defense effectiveness
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width='100%' height={300}>
                <LineChart data={attackTrendsData}>
                  <CartesianGrid strokeDasharray='3 3' stroke='#374151' />
                  <XAxis
                    dataKey='month'
                    tick={{ fill: '#9ca3af', fontSize: 12 }}
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
                  <Line
                    type='monotone'
                    dataKey='attacks'
                    stroke='#f59e0b'
                    strokeWidth={3}
                    name='Total Attacks'
                    dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
                  />
                  <Line
                    type='monotone'
                    dataKey='defenses'
                    stroke='#10b981'
                    strokeWidth={3}
                    name='Defenses'
                    dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Additional Analytics */}
        <div className='grid grid-cols-1 gap-6 mb-6'>
          {/* <Card>
            <CardHeader>
              <CardTitle>Attack Distribution Radar</CardTitle>
              <CardDescription>
                Multi-dimensional view of attack vectors
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width='100%' height={300}>
                <RadarChart data={attackDistributionData}>
                  <PolarGrid stroke='#374151' />
                  <PolarAngleAxis
                    dataKey='subject'
                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                  />
                  <PolarRadiusAxis
                    angle={90}
                    domain={[0, 100]}
                    tick={{ fill: '#9ca3af', fontSize: 10 }}
                  />
                  <Radar
                    name='Red Team'
                    dataKey='A'
                    stroke='#ef4444'
                    fill='#ef4444'
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                  <Radar
                    name='Blue Team'
                    dataKey='B'
                    stroke='#3b82f6'
                    fill='#3b82f6'
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#f9fafb',
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card> */}

          <Card>
            <CardHeader>
              <CardTitle>Defense Effectiveness Area</CardTitle>
              <CardDescription>
                Cumulative defense success rates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width='100%' height={300}>
                <AreaChart data={attackTrendsData}>
                  <CartesianGrid strokeDasharray='3 3' stroke='#374151' />
                  <XAxis
                    dataKey='month'
                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                  />
                  <YAxis
                    domain={[70, 95]}
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
                  <Area
                    type='monotone'
                    dataKey='successRate'
                    stroke='#8b5cf6'
                    fill='url(#colorSuccess)'
                    strokeWidth={3}
                    name='Success Rate %'
                  />
                  <defs>
                    <linearGradient
                      id='colorSuccess'
                      x1='0'
                      y1='0'
                      x2='0'
                      y2='1'
                    >
                      <stop offset='5%' stopColor='#8b5cf6' stopOpacity={0.8} />
                      <stop
                        offset='95%'
                        stopColor='#8b5cf6'
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                  </defs>
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Recent Items Tables */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          {/* Recent Projects */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Projects</CardTitle>
              <CardDescription>Recently created projects</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Project Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentProjects.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className='text-center text-muted-foreground py-8'
                      >
                        No projects found.{' '}
                        <Link
                          href='/projects/new'
                          className='text-blue-600 hover:underline'
                        >
                          Create your first project
                        </Link>
                      </TableCell>
                    </TableRow>
                  ) : (
                    recentProjects.map((project) => (
                      <TableRow key={project.id}>
                        <TableCell className='font-medium'>
                          {project.name}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              project.type === 'RED'
                                ? 'destructive'
                                : project.type === 'BLUE'
                                ? 'default'
                                : 'secondary'
                            }
                          >
                            {project.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {project.createdAt
                            ? formatDate(project.createdAt)
                            : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Link href={`/projects/${project.id}`}>
                            <Button variant='ghost' size='sm'>
                              <Eye className='h-4 w-4' />
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Recent Policies */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Policies</CardTitle>
              <CardDescription>
                Recently created security policies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Policy Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentPolicies.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className='text-center text-muted-foreground py-8'
                      >
                        No policies found.{' '}
                        <Link
                          href='/policies/new'
                          className='text-blue-600 hover:underline'
                        >
                          Create your first policy
                        </Link>
                      </TableCell>
                    </TableRow>
                  ) : (
                    recentPolicies.map((policy) => (
                      <TableRow key={policy.id}>
                        <TableCell className='font-medium'>
                          {policy.name}
                        </TableCell>
                        <TableCell>
                          <Badge variant='secondary'>{policy.type}</Badge>
                        </TableCell>
                        <TableCell>
                          {policy.createdAt
                            ? formatDate(policy.createdAt)
                            : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Link href={`/policies/${policy.id}`}>
                            <Button variant='ghost' size='sm'>
                              <Eye className='h-4 w-4' />
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Recent Jobs */}
          <Card className='lg:col-span-2'>
            <CardHeader>
              <CardTitle>Recent Jobs</CardTitle>
              <CardDescription>Recently created jobs</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Job ID</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentJobs.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className='text-center text-muted-foreground py-8'
                      >
                        No jobs found.{' '}
                        <Link
                          href='/jobs'
                          className='text-blue-600 hover:underline'
                        >
                          Create your first job
                        </Link>
                      </TableCell>
                    </TableRow>
                  ) : (
                    recentJobs.map((job) => (
                      <TableRow key={job.id}>
                        <TableCell className='font-medium'>{job.id}</TableCell>
                        <TableCell>{job.project?.name || 'N/A'}</TableCell>
                        <TableCell>
                          {getStatusBadge(job.status || 'PENDING')}
                        </TableCell>
                        <TableCell>
                          {job.createdAt ? formatDate(job.createdAt) : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Link href={`/jobs/${job.id}`}>
                            <Button variant='ghost' size='sm'>
                              <Eye className='h-4 w-4' />
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
}

export default function Dashboard() {
  return <DashboardContent />
}
