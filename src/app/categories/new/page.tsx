'use client';

import React from 'react';
import { CategoryForm } from "@/components/category/CategoryForm";
import MainLayout from '@/components/layout/main-layout';

export default function NewCategoryPage() {
  return (
    <MainLayout>
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Create New Category</h1>
      <CategoryForm />
    </div>
    </MainLayout>
  );
}
