'use client';
import React from 'react';
import { PolicyForm } from "@/components/policy/PolicyForm";
import MainLayout from '@/components/layout/main-layout';

export default function NewPolicyPage() {
  return (
    <MainLayout>
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Create New Policy</h1>
      <PolicyForm />
    </div>
    </MainLayout>
  );
}