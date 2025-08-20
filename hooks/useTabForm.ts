import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export interface TabFormData {
  title: string;
  instructions: string;
  code: string;
}

export interface TabFormOptions {
  initialData?: Partial<TabFormData>;
  onSubmit?: (data: TabFormData) => void;
  redirectOnSubmit?: boolean;
}

export const useTabForm = (options: TabFormOptions = {}) => {
  const router = useRouter();
  const [formData, setFormData] = useState<TabFormData>({
    title: options.initialData?.title || '',
    instructions: options.initialData?.instructions || '',
    code: options.initialData?.code || '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = useCallback((field: keyof TabFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (options.onSubmit) {
        await options.onSubmit(formData);
      }

      if (options.redirectOnSubmit !== false) {
        const params = new URLSearchParams({
          action: 'add',
          title: formData.title,
          instructions: formData.instructions,
          code: formData.code
        });
        router.push(`/?${params.toString()}`);
      }
    } catch (error) {
      console.error('Form submission failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, options, router]);

  const resetForm = useCallback(() => {
    setFormData({
      title: options.initialData?.title || '',
      instructions: options.initialData?.instructions || '',
      code: options.initialData?.code || '',
    });
  }, [options.initialData]);

  return {
    formData,
    isSubmitting,
    handleChange,
    handleSubmit,
    resetForm,
    setFormData
  };
};