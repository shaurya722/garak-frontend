import { JobForm } from '@/components/job/JobForm'

type EditJobPageProps = {
  params: {
    id: string;
  };
};

export default function EditJobPage({ params }: EditJobPageProps) {
  return <JobForm mode="edit" jobId={params.id} />
}
