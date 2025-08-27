'use client';

import { useState, useCallback, useEffect } from 'react';
import { z } from 'zod';

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean | string;
}

export interface FieldValidation {
  isValid: boolean;
  error: string | null;
  isDirty: boolean;
  isTouched: boolean;
}

export interface FormValidationState {
  [key: string]: FieldValidation;
}

export interface UseFormValidationOptions {
  schema?: z.ZodSchema<any>;
  rules?: Record<string, ValidationRule[]>;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  validateOnSubmit?: boolean;
}

export function useFormValidation<T extends Record<string, any>>(
  initialValues: T,
  options: UseFormValidationOptions = {}
) {
  const {
    schema,
    rules = {},
    validateOnChange = true,
    validateOnBlur = true,
    validateOnSubmit = true,
  } = options;

  // Initialize validation state
  const [validationState, setValidationState] = useState<FormValidationState>(() => {
    const state: FormValidationState = {};
    Object.keys(initialValues).forEach(key => {
      state[key] = {
        isValid: true,
        error: null,
        isDirty: false,
        isTouched: false,
      };
    });
    return state;
  });

  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [isFormValid, setIsFormValid] = useState(true);

  // Validate a single field
  const validateField = useCallback((fieldName: string, value: any): FieldValidation => {
    const fieldRules = rules[fieldName] || [];
    let error: string | null = null;
    let isValid = true;

    // Check each rule
    for (const rule of fieldRules) {
      if (rule.required && (!value || value.toString().trim() === '')) {
        error = 'This field is required';
        isValid = false;
        break;
      }

      if (rule.minLength && value && value.toString().length < rule.minLength) {
        error = `Must be at least ${rule.minLength} characters`;
        isValid = false;
        break;
      }

      if (rule.maxLength && value && value.toString().length > rule.maxLength) {
        error = `Must be no more than ${rule.maxLength} characters`;
        isValid = false;
        break;
      }

      if (rule.pattern && value && !rule.pattern.test(value.toString())) {
        error = 'Invalid format';
        isValid = false;
        break;
      }

      if (rule.custom) {
        const customResult = rule.custom(value);
        if (customResult !== true) {
          error = typeof customResult === 'string' ? customResult : 'Invalid value';
          isValid = false;
          break;
        }
      }
    }

    return {
      isValid,
      error,
      isDirty: true,
      isTouched: true,
    };
  }, [rules]);

  // Validate using Zod schema
  const validateWithSchema = useCallback((values: T): string[] => {
    if (!schema) return [];

    try {
      schema.parse(values);
      return [];
    } catch (error) {
      if (error instanceof z.ZodError) {
        return error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
      }
      return ['Validation failed'];
    }
  }, [schema]);

  // Update field validation
  const updateFieldValidation = useCallback((fieldName: string, value: any) => {
    const fieldValidation = validateField(fieldName, value);
    
    setValidationState(prev => ({
      ...prev,
      [fieldName]: {
        ...prev[fieldName],
        ...fieldValidation,
      },
    }));
  }, [validateField]);

  // Handle field change
  const handleFieldChange = useCallback((fieldName: string, value: any) => {
    if (validateOnChange) {
      updateFieldValidation(fieldName, value);
    } else {
      setValidationState(prev => ({
        ...prev,
        [fieldName]: {
          ...prev[fieldName],
          isDirty: true,
        },
      }));
    }
  }, [validateOnChange, updateFieldValidation]);

  // Handle field blur
  const handleFieldBlur = useCallback((fieldName: string, value: any) => {
    if (validateOnBlur) {
      updateFieldValidation(fieldName, value);
    }
    
    setValidationState(prev => ({
      ...prev,
      [fieldName]: {
        ...prev[fieldName],
        isTouched: true,
      },
    }));
  }, [validateOnBlur, updateFieldValidation]);

  // Validate entire form
  const validateForm = useCallback((values: T): boolean => {
    let isValid = true;
    const errors: string[] = [];

    // Validate individual fields
    Object.keys(values).forEach(fieldName => {
      const fieldValidation = validateField(fieldName, values[fieldName]);
      if (!fieldValidation.isValid) {
        isValid = false;
        if (fieldValidation.error) {
          errors.push(`${fieldName}: ${fieldValidation.error}`);
        }
      }
    });

    // Validate with schema if provided
    if (schema) {
      const schemaErrors = validateWithSchema(values);
      if (schemaErrors.length > 0) {
        isValid = false;
        errors.push(...schemaErrors);
      }
    }

    setFormErrors(errors);
    setIsFormValid(isValid);
    return isValid;
  }, [validateField, schema, validateWithSchema]);

  // Reset validation state
  const resetValidation = useCallback(() => {
    const state: FormValidationState = {};
    Object.keys(initialValues).forEach(key => {
      state[key] = {
        isValid: true,
        error: null,
        isDirty: false,
        isTouched: false,
      };
    });
    
    setValidationState(state);
    setFormErrors([]);
    setIsFormValid(true);
  }, [initialValues]);

  // Get field validation state
  const getFieldValidation = useCallback((fieldName: string): FieldValidation => {
    return validationState[fieldName] || {
      isValid: true,
      error: null,
      isDirty: false,
      isTouched: false,
    };
  }, [validationState]);

  // Check if form has any errors
  const hasErrors = Object.values(validationState).some(field => !field.isValid) || formErrors.length > 0;

  // Get all field errors
  const getFieldErrors = useCallback((): string[] => {
    const errors: string[] = [];
    Object.values(validationState).forEach(field => {
      if (field.error) {
        errors.push(field.error);
      }
    });
    return errors;
  }, [validationState]);

  return {
    validationState,
    formErrors,
    isFormValid,
    hasErrors,
    validateField,
    validateForm,
    updateFieldValidation,
    handleFieldChange,
    handleFieldBlur,
    resetValidation,
    getFieldValidation,
    getFieldErrors,
  };
}

/**
 * Hook for real-time password validation
 */
export function usePasswordValidation(password: string, confirmPassword: string = '') {
  const [validation, setValidation] = useState({
    strength: 0,
    meetsRequirements: false,
    errors: [] as string[],
    suggestions: [] as string[],
  });

  useEffect(() => {
    const errors: string[] = [];
    const suggestions: string[] = [];

    // Check length
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    } else if (password.length < 12) {
      suggestions.push('Consider using 12+ characters for better security');
    }

    // Check complexity
    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!hasLower) errors.push('Include at least one lowercase letter');
    if (!hasUpper) errors.push('Include at least one uppercase letter');
    if (!hasNumber) errors.push('Include at least one number');
    if (!hasSpecial) errors.push('Include at least one special character');

    // Calculate strength
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (hasLower) strength += 1;
    if (hasUpper) strength += 1;
    if (hasNumber) strength += 1;
    if (hasSpecial) strength += 1;
    if (password.length >= 12) strength += 1;

    // Check confirmation match
    if (confirmPassword && password !== confirmPassword) {
      errors.push('Passwords do not match');
    }

    setValidation({
      strength,
      meetsRequirements: errors.length === 0 && password.length > 0,
      errors,
      suggestions,
    });
  }, [password, confirmPassword]);

  return validation;
}
