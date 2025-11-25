import { JobForm } from '@/components/job/JobForm'

type EditJobPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditJobPage({ params }: EditJobPageProps) {
  const { id } = await params;
  return <JobForm mode="edit" jobId={id} />
}
