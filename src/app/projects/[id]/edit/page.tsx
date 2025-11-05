import { ProjectForm } from '@/components/project/ProjectForm'

interface EditProjectPageProps {
  params: {
    id: string
  }
}

export default function EditProjectPage({ params }: EditProjectPageProps) {
  return <ProjectForm mode="edit" projectId={params.id} />
}
