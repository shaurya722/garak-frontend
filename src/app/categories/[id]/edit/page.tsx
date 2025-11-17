// src/app/categories/[id]/edit/page.tsx
'use client';

import { useParams, useRouter } from 'next/navigation';
import { CategoryForm } from '@/components/category/CategoryForm';
import { useCategory } from '@/hooks/use-categories';
import MainLayout from '@/components/layout/main-layout';

export default function EditCategoryPage() {
  const router = useRouter();
  const { id } = useParams();
  const { data: category, isLoading } = useCategory(id as string);

  const handleSuccess = () => {
    router.push(`/categories`);
  };

  if (isLoading) return (
    <MainLayout>
      <div className="container mx-auto p-6">
        <div>Loading...</div>
      </div>
    </MainLayout>
  );

  if (!category) return (
    <MainLayout>
      <div className="container mx-auto p-6">
        <div>Category not found</div>
      </div>
    </MainLayout>
  );

  return (
    <MainLayout>
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Edit Category</h1>
        <CategoryForm
          mode="edit"
          categoryId={id as string}
          onSuccess={handleSuccess}
        />
      </div>
    </MainLayout>
  );
}
