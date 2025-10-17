'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/addpage/PageHeader';
import { TabForm } from '@/components/addpage/TabForm';
import { useTabForm } from '@/hooks/useTabForm';
import { useFormValidation } from '@/hooks/useValidation';
import { navigateToHome } from '@/utils/navigation';

export default function AddTab() {
  const router = useRouter();
  
  const { formData, isSubmitting, handleChange, handleSubmit } = useTabForm({
    redirectOnSubmit: true
  });

  const { errors, validateForm } = useFormValidation({
    title: { required: true, minLength: 1, maxLength: 50 },
    instructions: { required: true, minLength: 10 },
    body: { required: true, minLength: 1 }
  });

  const handleFormSubmit = (e: React.FormEvent) => {
    const validationErrors = validateForm(formData);
    if (Object.keys(validationErrors).length === 0) {
      handleSubmit(e);
    } else {
      e.preventDefault();
    }
  };

  const handleCancel = () => {
    navigateToHome(router);
  };

  const handleBack = () => {
    navigateToHome(router);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <PageHeader
          title="Add New Tab"
          subtitle="Create a new code snippet with instructions"
          onBack={handleBack}
        />

        <TabForm
          formData={formData}
          errors={errors}
          isSubmitting={isSubmitting}
          onSubmit={handleFormSubmit}
          onChange={handleChange}
          onCancel={handleCancel}
          submitButtonText="Add Tab"
          cardTitle="Tab Details"
        />
      </div>
    </div>
  );
};
