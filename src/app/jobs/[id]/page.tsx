import { JobDetail } from '@/components/job/JobDetail'

type JobPageProps = {
  params: {
    id: string;
  };
};

export default function JobPage({ params }: JobPageProps) {
  return <JobDetail jobId={params.id} />
}
