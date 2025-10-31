// src/app/policies/[id]/edit/page.tsx
'use client';

import { useParams, useRouter } from 'next/navigation';
import { PolicyForm } from '@/components/policy/PolicyForm';
import { usePolicy } from '@/hooks/use-policies';
import MainLayout from '@/components/layout/main-layout';

export default function EditPolicyPage() {
  const router = useRouter();
  const { id } = useParams();
  const { data: policy, isLoading } = usePolicy(id as string);
  const handleSuccess = () => {
    router.push(`/policies`);
  };

  if (isLoading) return <div>Loading...</div>;
  if (!policy) return <div>Policy not found</div>;

  return (
    <MainLayout>
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Edit Policy</h1>
      <PolicyForm
        mode="edit"
        policyId={id as string}
        initialData={{
          name: policy.name,
          description: policy.description,
          defaultDetector: policy.defaultDetector,
          categoryIds: policy.categories?.map(cat => cat.id) || null,
          detectorIds: policy.detectors?.map(det => det.id) || null,
        }}
        onSuccess={handleSuccess}
      />
    </div>
    </MainLayout>
  );
}