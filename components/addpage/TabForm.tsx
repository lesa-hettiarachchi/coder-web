import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { TabFormData } from '@/hooks/useTabForm';
import { ValidationErrors } from '@/hooks/useValidation';

interface TabFormProps {
  formData: TabFormData;
  errors?: ValidationErrors;
  isSubmitting?: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (field: keyof TabFormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onCancel: () => void;
  submitButtonText?: string;
  cardTitle?: string;
}

export const TabForm: React.FC<TabFormProps> = ({
  formData,
  errors = {},
  isSubmitting = false,
  onSubmit,
  onChange,
  onCancel,
  submitButtonText = 'Add Tab',
  cardTitle = 'Tab Details'
}) => {
  return (
    <Card className="w-full max-w-7xl mx-auto">
  <CardHeader>
    <CardTitle className="text-lg font-semibold">{cardTitle}</CardTitle>
  </CardHeader>

  <CardContent>
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Label htmlFor="title" className="font-medium text-sm text-[hsl(var(--foreground))]">
          Tab Title
        </Label>
        <Input
          id="title"
          value={formData.title}
          onChange={onChange('title')}
          placeholder="Enter tab title..."
          required
        />
        {errors.title && (
          <span className="text-red-600 text-sm mt-1">
            {errors.title}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="instructions" className="font-medium text-sm text-[hsl(var(--foreground))]">
          Instructions
        </Label>
        <Textarea
          id="instructions"
          value={formData.instructions}
          onChange={onChange('instructions')}
          rows={6}
          placeholder="Enter instructions..."
          required
        />
        {errors.instructions && (
          <span className="text-red-600 text-sm mt-1">
            {errors.instructions}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="body" className="font-medium text-sm text-[hsl(var(--foreground))]">
          Body
        </Label>
        <Textarea
          id="body"
          value={formData.body}
          onChange={onChange('body')}
          rows={10}
          placeholder="Enter your body content..."
          required
          className="font-mono text-sm leading-6"
        />
        {errors.body && (
          <span className="text-red-600 text-sm mt-1">
            {errors.body}
          </span>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="min-w-[100px] w-full sm:w-auto"
        >
          {isSubmitting ? 'Adding...' : submitButtonText}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
          className="w-full sm:w-auto min-w-[100px]"
        >
          Cancel
        </Button>
      </div>
    </form>
  </CardContent>
</Card>
  );
};