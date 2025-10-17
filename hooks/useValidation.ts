import { useState, useCallback } from 'react';
import { TabFormData } from './useTabForm';

export interface ValidationErrors {
  title?: string;
  instructions?: string;
  body?: string;
}

export interface ValidationRules {
  title?: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
  };
  instructions?: {
    required?: boolean;
    minLength?: number;
  };
  body?: {
    required?: boolean;
    minLength?: number;
  };
}

export const useFormValidation = (rules: ValidationRules = {}) => {
  const [errors, setErrors] = useState<ValidationErrors>({});

  const validateField = useCallback((field: keyof TabFormData, value: string): string | undefined => {
    const fieldRules = rules[field];
    if (!fieldRules) return undefined;

    if (fieldRules.required && !value.trim()) {
      return `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
    }

    if (fieldRules.minLength !== undefined && value.length < fieldRules.minLength) {
      return `${field.charAt(0).toUpperCase() + field.slice(1)} must be at least ${fieldRules.minLength} characters`;
    }

    if ('maxLength' in fieldRules && fieldRules.maxLength !== undefined && value.length > fieldRules.maxLength) {
      return `${field.charAt(0).toUpperCase() + field.slice(1)} must be no more than ${fieldRules.maxLength} characters`;
    }

    return undefined;
  }, [rules]);

  const validateForm = useCallback((data: TabFormData): ValidationErrors => {
    const newErrors: ValidationErrors = {};

    Object.keys(data).forEach(key => {
      const field = key as keyof TabFormData;
      const error = validateField(field, data[field]);
      if (error) {
        newErrors[field] = error;
      }
    });

    setErrors(newErrors);
    return newErrors;
  }, [validateField]);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const hasErrors = Object.keys(errors).length > 0;
  const isValid = !hasErrors;

  return {
    errors,
    hasErrors,
    isValid,
    validateForm,
    validateField,
    clearErrors,
    setErrors
  };
};