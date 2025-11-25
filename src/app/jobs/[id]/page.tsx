import { JobDetail } from '@/components/job/JobDetail'

type JobPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function JobPage({ params }: JobPageProps) {
  const { id } = await params;
  return <JobDetail jobId={id} />
}
